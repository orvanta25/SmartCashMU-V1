// sync/sync-pull.service.ts
import { PrismaClient } from '@prisma/client';
import { SyncConfigService } from './sync-config.service';

export class SyncPullService {
  private prisma: PrismaClient;
  private config: SyncConfigService;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.config = new SyncConfigService();
  }
  
  async pullChanges(): Promise<void> {
    if (!this.config.isOnline()) return;
    
    try {
      const lastSync = await this.getLastSyncTime();
      
      // Récupérer les changements depuis le serveur
      const response = await fetch(
        `${this.config.getConfig().apiUrl}/pull?caisseId=${this.config.getConfig().caisseId}&lastSync=${lastSync.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`);
      }
      
      const changes = await response.json();
      
      // Appliquer les changements localement
      await this.applyChanges(changes);
      
      // Mettre à jour le timestamp de dernière synchronisation
      await this.updateLastSyncTime(new Date());
      
    } catch (error) {
      console.error('Error pulling changes:', error);
    }
  }
  
  private async getLastSyncTime(): Promise<Date> {
    const lastSync = await this.prisma.syncStatus.findFirst({
      where: { caisseId: this.config.getConfig().caisseId, operation: 'PULL' }
    });
    
    return lastSync?.timestamp || new Date(0); // Depuis le début si jamais synchronisé
  }
  
  private async updateLastSyncTime(timestamp: Date): Promise<void> {
    await this.prisma.syncStatus.upsert({
      where: {
        caisseId_operation: {
          caisseId: this.config.getConfig().caisseId,
          operation: 'PULL'
        }
      },
      update: { timestamp },
      create: {
        caisseId: this.config.getConfig().caisseId,
        operation: 'PULL',
        timestamp
      }
    });
  }
  
  private async applyChanges(changes: any[]): Promise<void> {
    for (const change of changes) {
      await this.applyChange(change);
    }
  }
  
  private async applyChange(change: any): Promise<void> {
    const { table, operation, data, syncId, version } = change;
    const tableName = table.toLowerCase();
    
    try {
      switch (operation) {
        case 'CREATE':
          await this.prisma[tableName].create({
            data: {
              ...data,
              syncId,
              syncStatus: 'SYNCED',
              lastSyncedAt: new Date(),
              version
            }
          });
          break;
          
        case 'UPDATE':
          await this.prisma[tableName].update({
            where: { syncId },
            data: {
              ...data,
              syncStatus: 'SYNCED',
              lastSyncedAt: new Date(),
              version
            }
          });
          break;
          
        case 'DELETE':
          await this.prisma[tableName].update({
            where: { syncId },
            data: {
              isDeleted: true,
              syncStatus: 'SYNCED',
              lastSyncedAt: new Date()
            }
          });
          break;
      }
    } catch (error) {
      console.error(`Error applying change for ${table} ${syncId}:`, error);
    }
  }
  
  async startPeriodicPull(): Promise<void> {
    // Exécuter le pull périodiquement
    setInterval(() => {
      this.pullChanges();
    }, this.config.getConfig().syncInterval);
    
    // Exécuter immédiatement au démarrage
    this.pullChanges();
  }
}