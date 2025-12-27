// sync/init-sync.ts
import { PrismaClient } from '@prisma/client';
import { SyncManager } from './sync-manager.service';
import { initializeSyncMiddleware } from '../../prisma/middleware/sync.middleware';
import { SyncConfigService } from './sync-config.service';

let syncManagerInstance: SyncManager | null = null;

export async function initializeSyncSystem(): Promise<SyncManager> {
  if (syncManagerInstance) {
    return syncManagerInstance;
  }
  
  try {
    console.log('Initialisation du système de synchronisation...');
    
    // Initialiser Prisma avec le middleware
    const prisma = new PrismaClient();
    initializeSyncMiddleware(prisma);
    
    // Initialiser la configuration
    const config = SyncConfigService.getInstance();
    
    // Vérifier et créer les données de configuration si nécessaire
    await ensureSyncConfig(prisma, config);
    
    // Créer et initialiser le manager
    syncManagerInstance = new SyncManager();
    await syncManagerInstance.initialize();
    
    console.log('Système de synchronisation initialisé avec succès');
    
    return syncManagerInstance;
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du système de synchronisation:', error);
    throw error;
  }
}

async function ensureSyncConfig(prisma: PrismaClient, config: SyncConfigService): Promise<void> {
  try {
    // Vérifier si la table SyncStatus existe et créer une entrée si nécessaire
    const existingStatus = await prisma.syncStatus.findFirst({
      where: { 
        caisseId: config.getCaisseIdValue(),
        operation: 'PUSH'
      }
    });
    
    if (!existingStatus) {
      await prisma.syncStatus.create({
        data: {
          caisseId: config.getCaisseIdValue(),
          operation: 'PUSH',
          status: 'INITIALIZED',
          timestamp: new Date()
        }
      });
      
      await prisma.syncStatus.create({
        data: {
          caisseId: config.getCaisseIdValue(),
          operation: 'PULL',
          status: 'INITIALIZED',
          timestamp: new Date()
        }
      });
    }
    
    console.log(`Synchronisation initialisée pour la caisse: ${config.getCaisseIdValue()}`);
    
  } catch (error) {
    console.error('Erreur lors de la configuration de la synchronisation:', error);
  }
}

export function getSyncManager(): SyncManager | null {
  return syncManagerInstance;
}

export async function shutdownSyncSystem(): Promise<void> {
  if (syncManagerInstance) {
    // Implémenter la fermeture propre si nécessaire
    syncManagerInstance = null;
  }
}