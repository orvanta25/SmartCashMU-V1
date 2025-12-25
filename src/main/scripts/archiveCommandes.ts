// src/main/scripts/archiveCommandes.ts
import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const BATCH_SIZE = 1000;

// Fonction pour déterminer le chemin de la base de données
function getDatabasePath(): string {
  if (app.isPackaged) {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'dev.db');
  } else {
    return path.join(__dirname, '../../../prisma/dev.db');
  }
}

// Fonction pour créer l'instance Prisma
function createPrismaClient(): PrismaClient {
  const databaseFile = getDatabasePath();
  
  let PrismaClientConstructor: any;
  
  if (app.isPackaged) {
    try {
      const prismaClientPath = path.join(
        process.resourcesPath, 
        'node_modules', 
        '.prisma', 
        'client'
      );
      PrismaClientConstructor = require(prismaClientPath).PrismaClient;
    } catch (error) {
      console.error('Impossible de charger PrismaClient packagé:', error);
      throw error;
    }
  } else {
    PrismaClientConstructor = require('../../../node_modules/.prisma/client').PrismaClient;
  }
  
  return new PrismaClientConstructor({
    datasources: { db: { url: `file:${databaseFile}` } }
  });
}

// Fonction pour archiver par batch
async function archiveOldCommandes(prisma: PrismaClient) {
  console.log('🕒 Début de l\'archivage des commandes > 6 mois');

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let totalArchived = 0;

  // Vérifier si le modèle commandeArchive existe
  const models = Object.keys(prisma);
  const hasArchiveModel = 'commandeArchive' in prisma;

  if (!hasArchiveModel) {
    console.warn('⚠️ Modèle commandeArchive non trouvé. Archivage dans un fichier JSON.');
    return archiveToJson(prisma, sixMonthsAgo);
  }

  while (true) {
    const commandes = await prisma.commande.findMany({
      where: { date: { lt: sixMonthsAgo } },
      take: BATCH_SIZE,
    });

    if (commandes.length === 0) break;

    // Utilisation de createMany pour optimiser les performances
    await prisma.commandeArchive.createMany({
      data: commandes.map(({ id, ...rest }) => rest),
      skipDuplicates: true
    });

    await prisma.commande.deleteMany({
      where: { id: { in: commandes.map((c) => c.id) } },
    });

    totalArchived += commandes.length;
    console.log(`✅ Archivage batch ${commandes.length} commandes terminé`);
  }

  console.log(`🎯 Archivage terminé ! Total: ${totalArchived} commandes`);
}

// Alternative : Archivage dans un fichier JSON
async function archiveToJson(prisma: PrismaClient, cutoffDate: Date) {
  const archiveDir = path.join(app.getPath('userData'), 'archives');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const archiveFile = path.join(archiveDir, `commandes_${new Date().toISOString().split('T')[0]}.json`);
  let allArchived: any[] = [];

  while (true) {
    const commandes = await prisma.commande.findMany({
      where: { date: { lt: cutoffDate } },
      take: BATCH_SIZE,
    });

    if (commandes.length === 0) break;

    allArchived.push(...commandes);

    // Sauvegarder périodiquement
    fs.writeFileSync(archiveFile, JSON.stringify({
      dateArchivage: new Date().toISOString(),
      total: allArchived.length,
      commandes: allArchived
    }, null, 2));

    // Supprimer de la base
    await prisma.commande.deleteMany({
      where: { id: { in: commandes.map((c) => c.id) } },
    });

    console.log(`✅ Archivage batch ${commandes.length} commandes dans ${archiveFile}`);
  }

  console.log(`🎯 Archivage JSON terminé ! Total: ${allArchived.length} commandes`);
}

// Fonction VACUUM via Prisma
async function vacuumSQLite(prisma: PrismaClient) {
  try {
    console.log('🧹 VACUUM en cours...');
    await prisma.$executeRaw`VACUUM;`;
    console.log('✅ VACUUM terminé !');
  } catch (err) {
    console.error('❌ Erreur lors du VACUUM:', err);
    // Fallback: exécuter VACUUM via SQLite en utilisant l'exécutable sqlite3
    await vacuumViaExecutable();
  }
}

// Fallback: utiliser l'exécutable sqlite3 si disponible
async function vacuumViaExecutable() {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const databaseFile = getDatabasePath();
  
  try {
    console.log('🔧 Tentative de VACUUM via exécutable sqlite3...');
    await execAsync(`sqlite3 "${databaseFile}" "VACUUM;"`);
    console.log('✅ VACUUM via exécutable terminé !');
  } catch (err) {
    console.warn('⚠️ Impossible d\'exécuter VACUUM, sqlite3 non disponible');
  }
}

// Fonction principale d'archivage
export async function runArchiveOnAppStart() {
  let prisma: PrismaClient | null = null;
  
  try {
    // Attendre que l'app soit prête
    if (!app.isReady()) {
      await app.whenReady();
    }

    console.log('🚀 Démarrage du processus d\'archivage...');
    
    // Créer l'instance Prisma
    prisma = createPrismaClient();
    
    // Archiver les anciennes commandes
    await archiveOldCommandes(prisma);
    
    // Faire le VACUUM via Prisma
    await vacuumSQLite(prisma);
    
    console.log('✨ Archivage complet terminé avec succès !');
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'archivage:', err);
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(console.error);
    }
  }
}

// Pour exécuter le script
if (require.main === module) {
  console.log('⚠️ Ce script doit être exécuté dans le contexte Electron');
  console.log('Pour tester, exécutez l\'application complète');
}