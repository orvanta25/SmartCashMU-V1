// server/src/api/sync.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../service/logger.service';

const router = express.Router();
const prisma = new PrismaClient();
const logger = createLogger();

// Middleware pour vérifier l'ID de caisse
const validateCaisseId = (req: any, res: any, next: any) => {
  const caisseId = req.headers['x-caisse-id'] || req.body.caisseId;
  
  if (!caisseId) {
    logger.warn('Requête sans Caisse ID');
    return res.status(400).json({ 
      success: false, 
      error: 'Caisse ID requis. En-tête X-Caisse-ID ou champ caisseId dans le body' 
    });
  }
  
  // Valider le format de l'ID de caisse
  if (!caisseId.startsWith('caisse_')) {
    logger.warn(`Format Caisse ID invalide: ${caisseId}`);
    return res.status(400).json({ 
      success: false, 
      error: 'Format Caisse ID invalide. Doit commencer par "caisse_"' 
    });
  }
  
  req.caisseId = caisseId;
  next();
};

// Endpoint pour recevoir les push des caisses
router.post('/push', validateCaisseId, async (req, res) => {
  try {
    const { caisseId } = req;
    const { operation, table, data, localId, version = 1 } = req.body;
    
    logger.info(`📤 Push reçu de ${caisseId}: ${operation} sur ${table} (${localId})`);
    
    // Validation
    if (!operation || !table || !data || !localId) {
      logger.warn('Données push incomplètes', { caisseId, operation, table });
      return res.status(400).json({ 
        success: false, 
        error: 'Données invalides. Champs requis: operation, table, data, localId' 
      });
    }
    
    let result;
    
    switch (operation) {
      case 'CREATE':
        result = await createRecord(table, data, caisseId, localId, version);
        break;
        
      case 'UPDATE':
        result = await updateRecord(table, data, caisseId, localId, version);
        break;
        
      case 'DELETE':
        result = await deleteRecord(table, data, caisseId, localId);
        break;
        
      default:
        logger.warn(`Opération non supportée: ${operation}`, { caisseId, table });
        return res.status(400).json({ 
          success: false, 
          error: 'Opération non supportée. Valeurs autorisées: CREATE, UPDATE, DELETE' 
        });
    }
    
    // Logger la synchronisation
    await prisma.syncLog.create({
      data: {
        caisseId,
        operation: 'PUSH',
        tableName: table,
        recordId: localId,
        status: 'SUCCESS',
        timestamp: new Date()
      }
    });
    
    logger.info(`✅ Push traité avec succès pour ${caisseId}: ${table} ${localId}`);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('❌ Erreur lors du push:', error, { caisseId: req.caisseId });
    
    await prisma.syncLog.create({
      data: {
        caisseId: req.caisseId,
        operation: 'PUSH',
        tableName: req.body.table,
        recordId: req.body.localId,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      }
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de synchronisation',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint pour les pull des caisses
router.get('/pull', validateCaisseId, async (req, res) => {
  try {
    const { caisseId } = req;
    const { lastSync } = req.query;
    
    const lastSyncDate = lastSync ? new Date(lastSync as string) : new Date(0);
    
    logger.info(`📥 Pull demandé par ${caisseId} depuis ${lastSyncDate.toISOString()}`);
    
    // Récupérer les changements depuis lastSync
    const changes = await getChangesSince(caisseId, lastSyncDate);
    
    // Logger
    await prisma.syncLog.create({
      data: {
        caisseId,
        operation: 'PULL',
        tableName: 'all',
        recordId: 'multiple',
        status: 'SUCCESS',
        details: { changesCount: changes.length },
        timestamp: new Date()
      }
    });
    
    logger.info(`✅ Pull réussi pour ${caisseId}: ${changes.length} changements`);
    
    res.json({
      success: true,
      changes,
      timestamp: new Date().toISOString(),
      changesCount: changes.length
    });
    
  } catch (error) {
    logger.error('❌ Erreur lors du pull:', error, { caisseId: req.caisseId });
    
    await prisma.syncLog.create({
      data: {
        caisseId: req.caisseId,
        operation: 'PULL',
        tableName: 'all',
        recordId: 'multiple',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      }
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du pull',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint pour vérifier le statut d'une caisse
router.get('/status/:caisseId', async (req, res) => {
  try {
    const { caisseId } = req.params;
    
    const lastPush = await prisma.syncLog.findFirst({
      where: { caisseId, operation: 'PUSH' },
      orderBy: { timestamp: 'desc' }
    });
    
    const lastPull = await prisma.syncLog.findFirst({
      where: { caisseId, operation: 'PULL' },
      orderBy: { timestamp: 'desc' }
    });
    
    const pendingConflicts = await prisma.syncConflict.count({
      where: { caisseId, resolution: null }
    });
    
    const recordCounts = await getRecordCounts(caisseId);
    
    res.json({
      success: true,
      caisseId,
      lastPush: lastPush?.timestamp,
      lastPull: lastPull?.timestamp,
      pendingConflicts,
      recordCounts,
      online: true
    });
    
  } catch (error) {
    logger.error('Erreur lors de la récupération du statut:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fonctions utilitaires
async function createRecord(table: string, data: any, caisseId: string, localId: string, version: number): Promise<any> {
  const modelName = getModelName(table);
  
  if (!modelName) {
    throw new Error(`Table ${table} non supportée pour la synchronisation`);
  }
  
  // Vérifier si le record existe déjà
  const existing = await prisma[modelName].findFirst({
    where: {
      OR: [
        { caisseId, localId },
        { syncId: data.syncId }
      ]
    }
  });
  
  if (existing) {
    logger.warn(`Record déjà existant pour ${table} ${localId}`, { caisseId });
    // Conflit - mettre à jour au lieu de créer
    return await updateRecord(table, data, caisseId, localId, version);
  }
  
  // Préparer les données
  const recordData = prepareRecordData(data, caisseId, localId, version);
  
  // Créer le record
  const record = await prisma[modelName].create({
    data: recordData
  });
  
  logger.debug(`Nouveau record créé: ${table} ${record.id}`, { caisseId });
  
  return {
    syncId: record.id,
    id: record.id,
    version: record.version,
    status: 'CREATED',
    timestamp: new Date()
  };
}

async function updateRecord(table: string, data: any, caisseId: string, localId: string, version: number): Promise<any> {
  const modelName = getModelName(table);
  
  if (!modelName) {
    throw new Error(`Table ${table} non supportée pour la synchronisation`);
  }
  
  // Trouver le record
  const existing = await prisma[modelName].findFirst({
    where: {
      OR: [
        { caisseId, localId },
        { syncId: data.syncId },
        { id: data.id }
      ]
    }
  });
  
  if (!existing) {
    logger.warn(`Record non trouvé pour ${table} ${localId}, création...`, { caisseId });
    // Créer si n'existe pas
    return await createRecord(table, data, caisseId, localId, version);
  }
  
  // Vérifier les conflits de version
  if (existing.version > version) {
    logger.warn(`Conflit de version détecté pour ${table} ${localId}`, { 
      caisseId, 
      serverVersion: existing.version, 
      clientVersion: version 
    });
    
    // Enregistrer le conflit
    await prisma.syncConflict.create({
      data: {
        caisseId,
        tableName: table,
        recordId: localId,
        localData: data,
        serverData: existing,
        createdAt: new Date()
      }
    });
    
    return {
      conflict: true,
      message: 'Conflit de version détecté',
      serverData: existing,
      clientData: data,
      serverVersion: existing.version,
      clientVersion: version,
      conflictId: (await prisma.syncConflict.findFirst({
        where: { caisseId, tableName: table, recordId: localId },
        orderBy: { createdAt: 'desc' }
      }))?.id
    };
  }
  
  // Préparer les données de mise à jour
  const updateData = prepareUpdateData(data, existing.version);
  
  // Mettre à jour
  const updated = await prisma[modelName].update({
    where: { id: existing.id },
    data: updateData
  });
  
  logger.debug(`Record mis à jour: ${table} ${updated.id}`, { caisseId });
  
  return {
    syncId: updated.id,
    id: updated.id,
    version: updated.version,
    status: 'UPDATED',
    timestamp: new Date()
  };
}

async function deleteRecord(table: string, data: any, caisseId: string, localId: string): Promise<any> {
  const modelName = getModelName(table);
  
  if (!modelName) {
    throw new Error(`Table ${table} non supportée pour la synchronisation`);
  }
  
  // Trouver le record
  const existing = await prisma[modelName].findFirst({
    where: {
      OR: [
        { caisseId, localId },
        { syncId: data.syncId }
      ]
    }
  });
  
  if (!existing) {
    logger.warn(`Record à supprimer non trouvé: ${table} ${localId}`, { caisseId });
    return { 
      status: 'NOT_FOUND',
      message: 'Record non trouvé' 
    };
  }
  
  // Soft delete
  await prisma[modelName].update({
    where: { id: existing.id },
    data: {
      isDeleted: true,
      lastUpdated: new Date(),
      updatedAt: new Date()
    }
  });
  
  logger.debug(`Record marqué comme supprimé: ${table} ${existing.id}`, { caisseId });
  
  return {
    status: 'DELETED',
    syncId: existing.id,
    timestamp: new Date()
  };
}

async function getChangesSince(caisseId: string, since: Date): Promise<any[]> {
  // Récupérer les changements de toutes les tables
  const tables = [
    'User', 'Produit', 'Magasin', 'MagasinProduit',
    'Commande', 'Vente', 'Paiement', 'Client',
    'Fournisseur', 'Categorie', 'Entreprise',
    'Inventaire', 'MouvementStock', 'Retour', 'RetourLigne'
  ];
  
  const allChanges: any[] = [];
  const BATCH_SIZE = 500;
  
  for (const table of tables) {
    const modelName = getModelName(table);
    if (!modelName) continue;
    
    try {
      const changes = await prisma[modelName].findMany({
        where: {
          lastUpdated: { gt: since },
          caisseId: { not: caisseId },
          isDeleted: false
        },
        orderBy: { lastUpdated: 'asc' },
        take: BATCH_SIZE
      });
      
      allChanges.push(...changes.map(change => ({
        table,
        operation: change.isDeleted ? 'DELETE' : (change.lastUpdated > since ? 'UPDATE' : 'CREATE'),
        data: sanitizeRecordData(change),
        syncId: change.id,
        version: change.version,
        timestamp: change.lastUpdated || change.updatedAt
      })));
      
      if (changes.length >= BATCH_SIZE) {
        logger.warn(`Beaucoup de changements pour ${table}, limité à ${BATCH_SIZE}`, { caisseId });
      }
      
    } catch (error) {
      logger.error(`Erreur lors de la récupération des changements pour ${table}:`, error);
    }
  }
  
  // Trier par timestamp
  return allChanges.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

async function getRecordCounts(caisseId: string): Promise<Record<string, number>> {
  const tables = ['User', 'Produit', 'Commande', 'Vente', 'Client'];
  const counts: Record<string, number> = {};
  
  for (const table of tables) {
    const modelName = getModelName(table);
    if (!modelName) continue;
    
    try {
      const count = await prisma[modelName].count({
        where: { caisseId, isDeleted: false }
      });
      counts[table] = count;
    } catch (error) {
      counts[table] = 0;
    }
  }
  
  return counts;
}

function prepareRecordData(data: any, caisseId: string, localId: string, version: number): any {
  const recordData = {
    ...data,
    caisseId,
    localId,
    version: version || 1,
    lastUpdated: new Date(),
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: new Date(),
    syncStatus: 'SYNCED'
  };
  
  // Nettoyer les champs
  delete recordData.id;
  delete recordData.syncId;
  
  // Convertir les dates
  Object.keys(recordData).forEach(key => {
    if (recordData[key] && typeof recordData[key] === 'string') {
      // Essayer de parser les dates
      const date = tryParseDate(recordData[key]);
      if (date) {
        recordData[key] = date;
      }
    }
  });
  
  return recordData;
}

function prepareUpdateData(data: any, currentVersion: number): any {
  const updateData = {
    ...data,
    version: (currentVersion || 0) + 1,
    lastUpdated: new Date(),
    updatedAt: new Date(),
    syncStatus: 'SYNCED'
  };
  
  // Ne pas changer certains champs
  delete updateData.id;
  delete updateData.syncId;
  delete updateData.caisseId;
  delete updateData.localId;
  delete updateData.createdAt;
  
  // Convertir les dates
  Object.keys(updateData).forEach(key => {
    if (updateData[key] && typeof updateData[key] === 'string') {
      const date = tryParseDate(updateData[key]);
      if (date) {
        updateData[key] = date;
      }
    }
  });
  
  return updateData;
}

function sanitizeRecordData(record: any): any {
  const sanitized = { ...record };
  
  // Supprimer les champs sensibles ou techniques
  delete sanitized.$type;
  delete sanitized.$parent;
  
  // Formater les dates
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] instanceof Date) {
      sanitized[key] = sanitized[key].toISOString();
    }
  });
  
  return sanitized;
}

function tryParseDate(value: string): Date | null {
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function getModelName(table: string): string | null {
  // Mapper les noms de tables aux noms de modèles Prisma
  const modelMap: Record<string, string> = {
    'User': 'user',
    'Produit': 'produit',
    'Magasin': 'magasin',
    'MagasinProduit': 'magasinProduit',
    'Commande': 'commande',
    'Vente': 'vente',
    'Paiement': 'paiement',
    'Client': 'client',
    'Fournisseur': 'fournisseur',
    'Categorie': 'categorie',
    'Entreprise': 'entreprise',
    'Inventaire': 'inventaire',
    'MouvementStock': 'mouvementStock',
    'Retour': 'retour',
    'RetourLigne': 'retourLigne',
    'Lot': 'lot',
    'Acc': 'acc',
    'Charge': 'charge',
    'TypeCharge': 'typeCharge',
    'Facture': 'facture',
    'VentesFacture': 'ventesFacture',
    'AchatFournisseur': 'achatFournisseur',
    'Entree': 'entree',
    'MyFacture': 'myFacture',
    'MyFactureAdresse': 'myFactureAdresse',
    'MyFactureEmail': 'myFactureEmail',
    'MyFactureTelephone': 'myFactureTelephone',
    'MyFactureMobile': 'myFactureMobile',
    'BalanceConfig': 'balanceConfig',
    'Printer': 'printer',
    'Table': 'table',
    'FloorPlan': 'floorPlan',
    'TicketResto': 'ticketResto',
    'UsedTicketResto': 'usedTicketResto',
    'ClotureJour': 'clotureJour',
    'VenteCaissierCloture': 'venteCaissierCloture',
    'DetailPaiementCloture': 'detailPaiementCloture',
    'VariantFamily': 'variantFamily',
    'VariantValue': 'variantValue',
    'ProductVariant': 'productVariant',
    'ProductVariantStock': 'productVariantStock',
    'RemiseQRConfig': 'remiseQRConfig',
    'TicketRemiseQR': 'ticketRemiseQR'
  };
  
  return modelMap[table] || null;
}

export default router;