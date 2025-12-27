// sync/sync-manager.service.ts
import { SyncQueueService } from './sync-queue.service';
import { SyncPullService } from './sync-pull.service';
import { SyncConflictService } from './sync-conflict.service';
import { SyncConfigService } from './sync-config.service';

export class SyncManager {
  private queueService: SyncQueueService;
  private pullService: SyncPullService;
  private conflictService: SyncConflictService;
  private configService: SyncConfigService;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private networkListenersAdded = false;
  
  constructor() {
    this.queueService = SyncQueueService.getInstance();
    this.pullService = new SyncPullService();
    this.conflictService = SyncConflictService.getInstance();
    this.configService = SyncConfigService.getInstance();
  }
  
  async initialize(): Promise<void> {
    console.log('Initialisation du SyncManager...');
    
    try {
      // Écouter les événements de réseau (une seule fois)
      if (!this.networkListenersAdded && typeof window !== 'undefined') {
        window.addEventListener('online', () => this.onNetworkOnline());
        window.addEventListener('offline', () => this.onNetworkOffline());
        this.networkListenersAdded = true;
      }
      
      // Démarrer la synchronisation périodique
      await this.startPeriodicSync();
      
      // Traiter la queue existante
      this.processQueue();
      
      // Faire un pull initial
      await this.pullService.pullChanges();
      
      console.log('SyncManager initialisé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du SyncManager:', error);
    }
  }
  
  private onNetworkOnline(): void {
    console.log('Réseau en ligne, activation de la synchronisation...');
    this.configService.setOfflineMode(false);
    this.processQueue();
    this.pullService.pullChanges();
  }
  
  private onNetworkOffline(): void {
    console.log('Réseau hors ligne, passage en mode offline...');
    this.configService.setOfflineMode(true);
  }
  
  private async startPeriodicSync(): Promise<void> {
    const interval = this.configService.getConfig().syncInterval;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.configService.isOnline()) {
        this.processQueue();
        this.pullService.pullChanges();
      }
    }, interval);
    
    console.log(`Synchronisation périodique configurée toutes les ${interval / 1000} secondes`);
  }
  
  private async processQueue(): Promise<void> {
    if (this.isSyncing || !this.configService.isOnline()) return;
    
    this.isSyncing = true;
    
    try {
      await this.queueService.processQueue();
    } catch (error) {
      console.error('Sync manager error:', error);
    } finally {
      this.isSyncing = false;
    }
  }
  
  async syncNow(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Synchronisation manuelle démarrée...');
      
      if (!this.configService.isOnline()) {
        return { 
          success: false, 
          message: 'Impossible de synchroniser: hors ligne' 
        };
      }
      
      this.isSyncing = true;
      
      // Pousser les changements locaux
      await this.queueService.processQueue();
      
      // Tirer les changements du serveur
      await this.pullService.pullChanges();
      
      this.isSyncing = false;
      
      return { 
        success: true, 
        message: 'Synchronisation terminée avec succès' 
      };
      
    } catch (error) {
      this.isSyncing = false;
      console.error('Erreur lors de la synchronisation manuelle:', error);
      return { 
        success: false, 
        message: `Erreur: ${error.message}` 
      };
    }
  }
  
  getStatus(): any {
    const queueStatus = this.queueService.getQueueStatus();
    const conflicts = this.conflictService.getPendingConflicts();
    
    return {
      online: this.configService.isOnline(),
      isSyncing: this.isSyncing,
      queue: queueStatus,
      pendingConflicts: conflicts.length,
      caisseId: this.configService.getCaisseIdValue(),
      lastSync: new Date()
    };
  }
  
  async resolveConflict(conflictId: string, resolution: any): Promise<void> {
    await this.conflictService.resolveConflictManually({
      conflictId,
      resolution: resolution.type,
      mergedData: resolution.data,
      resolvedBy: 'user'
    });
  }
  
  getQueueOperations(): any[] {
    return this.queueService.getQueue();
  }
  
  async clearCompletedOperations(): Promise<void> {
    await this.queueService.clearCompleted();
  }
  
  async shutdown(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.networkListenersAdded && typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.onNetworkOnline());
      window.removeEventListener('offline', () => this.onNetworkOffline());
      this.networkListenersAdded = false;
    }
    
    console.log('SyncManager arrêté');
  }
}