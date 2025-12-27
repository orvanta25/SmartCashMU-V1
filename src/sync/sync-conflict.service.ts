// sync/sync-conflict.service.ts
import { PrismaClient } from '@prisma/client';
import { SyncConfigService } from './sync-config.service';

export interface ConflictResolution {
  conflictId: string;
  resolution: 'CLIENT_WINS' | 'SERVER_WINS' | 'MERGED';
  mergedData?: any;
  resolvedBy: string;
}

export class SyncConflictService {
  private prisma: PrismaClient;
  private config: SyncConfigService;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.config = new SyncConfigService();
  }
  
  async detectConflict(localData: any, serverData: any): Promise<boolean> {
    // Détecter les conflits basés sur la version
    return localData.version !== serverData.version && 
           localData.updatedAt > serverData.updatedAt;
  }
  
  async handleConflict(table: string, localId: string, serverData: any): Promise<void> {
    // Récupérer les données locales
    const localData = await this.prisma[table.toLowerCase()].findUnique({
      where: { localId }
    });
    
    if (!localData) return;
    
    // Vérifier s'il y a un conflit
    const hasConflict = await this.detectConflict(localData, serverData);
    
    if (hasConflict) {
      // Enregistrer le conflit
      const conflict = await this.prisma.syncConflict.create({
        data: {
          caisseId: this.config.getConfig().caisseId,
          tableName: table,
          recordId: localId,
          localData: localData,
          serverData: serverData,
          resolution: null
        }
      });
      
      // Appliquer la stratégie de résolution
      await this.resolveConflict(conflict.id, localData, serverData);
    }
  }
  
  private async resolveConflict(conflictId: string, localData: any, serverData: any): Promise<void> {
    const strategy = this.config.getConfig().conflictStrategy;
    
    switch (strategy) {
      case 'client-wins':
        await this.resolveClientWins(conflictId, localData);
        break;
        
      case 'server-wins':
        await this.resolveServerWins(conflictId, serverData);
        break;
        
      case 'manual':
        await this.queueForManualResolution(conflictId);
        break;
    }
  }
  
  private async resolveClientWins(conflictId: string, localData: any): Promise<void> {
    // Le client gagne, pousser les données locales
    const queueService = new SyncQueueService();
    
    await queueService.enqueue({
      table: localData.tableName,
      operation: 'UPDATE',
      data: localData,
      localId: localData.localId
    });
    
    // Marquer le conflit comme résolu
    await this.prisma.syncConflict.update({
      where: { id: conflictId },
      data: {
        resolution: 'CLIENT_WINS',
        resolvedAt: new Date(),
        resolvedBy: 'system'
      }
    });
  }
  
  private async resolveServerWins(conflictId: string, serverData: any): Promise<void> {
    // Le serveur gagne, mettre à jour localement
    await this.prisma[serverData.tableName.toLowerCase()].update({
      where: { localId: serverData.localId },
      data: {
        ...serverData,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date()
      }
    });
    
    // Marquer le conflit comme résolu
    await this.prisma.syncConflict.update({
      where: { id: conflictId },
      data: {
        resolution: 'SERVER_WINS',
        resolvedAt: new Date(),
        resolvedBy: 'system'
      }
    });
  }
  
  private async queueForManualResolution(conflictId: string): Promise<void> {
    // Stocker pour résolution manuelle via l'interface
    console.log(`Conflict ${conflictId} requires manual resolution`);
    
    // Émettre un événement pour l'interface utilisateur
    window.dispatchEvent(new CustomEvent('sync-conflict', {
      detail: { conflictId }
    }));
  }
  
  async getPendingConflicts(): Promise<any[]> {
    return await this.prisma.syncConflict.findMany({
      where: {
        caisseId: this.config.getConfig().caisseId,
        resolution: null
      }
    });
  }
  
  async resolveConflictManually(resolution: ConflictResolution): Promise<void> {
    const conflict = await this.prisma.syncConflict.findUnique({
      where: { id: resolution.conflictId }
    });
    
    if (!conflict) return;
    
    switch (resolution.resolution) {
      case 'CLIENT_WINS':
        await this.resolveClientWins(conflict.id, conflict.localData);
        break;
        
      case 'SERVER_WINS':
        await this.resolveServerWins(conflict.id, conflict.serverData);
        break;
        
      case 'MERGED':
        await this.resolveMerged(conflict.id, resolution.mergedData);
        break;
    }
  }
  
  private async resolveMerged(conflictId: string, mergedData: any): Promise<void> {
    // Appliquer les données fusionnées
    const conflict = await this.prisma.syncConflict.findUnique({
      where: { id: conflictId }
    });
    
    await this.prisma[conflict.tableName.toLowerCase()].update({
      where: { localId: conflict.recordId },
      data: {
        ...mergedData,
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date(),
        version: Math.max(conflict.localData.version, conflict.serverData.version) + 1
      }
    });
    
    // Pousser les données fusionnées
    const queueService = new SyncQueueService();
    
    await queueService.enqueue({
      table: conflict.tableName,
      operation: 'UPDATE',
      data: mergedData,
      localId: conflict.recordId
    });
    
    // Marquer comme résolu
    await this.prisma.syncConflict.update({
      where: { id: conflictId },
      data: {
        resolution: 'MERGED',
        resolvedAt: new Date(),
        resolvedBy: mergedData.resolvedBy
      }
    });
  }
}