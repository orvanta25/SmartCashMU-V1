// sync/init-sync.ts
import { PrismaClient } from '@prisma/client';
import { SyncManager } from './sync-manager.service';
import { initializeSyncMiddleware } from '../../prisma/middleware/sync.middleware';

export async function initializeSyncSystem(): Promise<SyncManager> {
  // Initialiser Prisma avec le middleware
  const prisma = new PrismaClient();
  initializeSyncMiddleware(prisma);
  
  // Créer et initialiser le manager
  const syncManager = new SyncManager();
  await syncManager.initialize();
  
  // Vérifier et créer les données de configuration si nécessaire
  await ensureSyncConfig(prisma);
  
  return syncManager;
}

async function ensureSyncConfig(prisma: PrismaClient): Promise<void> {
  // Créer les tables de sync si elles n'existent pas
  // (géré par Prisma migrations normalement)
  
  // Initialiser les métadonnées de sync
  const caisseId = localStorage.getItem('caisseId') || generateCaisseId();
  localStorage.setItem('caisseId', caisseId);
  
  console.log(`Synchronisation initialisée pour la caisse: ${caisseId}`);
}

function generateCaisseId(): string {
  return `caisse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}