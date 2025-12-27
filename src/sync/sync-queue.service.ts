// sync/sync-queue.service.ts
import { PrismaClient } from '@prisma/client';
import { SyncConfigService } from './sync-config.service';

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  localId: string;
  timestamp: Date;
  retries: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export class SyncQueueService {
  private prisma: PrismaClient;
  private config: SyncConfigService;
  private queue: SyncOperation[] = [];
  private processing = false;
  private static instance: SyncQueueService;
  
  private constructor() {
    this.prisma = new PrismaClient();
    this.config = SyncConfigService.getInstance();
    this.loadPendingOperations();
  }
  
  public static getInstance(): SyncQueueService {
    if (!SyncQueueService.instance) {
      SyncQueueService.instance = new SyncQueueService();
    }
    return SyncQueueService.instance;
  }
  
  private async loadPendingOperations(): Promise<void> {
    try {
      const pendingOps = await this.prisma.syncQueue.findMany({
        where: { 
          status: { in: ['PENDING', 'FAILED'] },
          caisseId: this.config.getCaisseIdValue()
        },
        orderBy: { timestamp: 'asc' }
      });
      
      this.queue = pendingOps.map(op => ({
        id: op.id,
        table: op.tableName,
        operation: op.operation as 'CREATE' | 'UPDATE' | 'DELETE',
        data: op.data as any,
        localId: op.localId,
        timestamp: op.timestamp,
        retries: op.retries,
        status: op.status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
      }));
      
      console.log(`Chargé ${this.queue.length} opérations en attente`);
    } catch (error) {
      console.error('Erreur lors du chargement des opérations en attente:', error);
    }
  }
  
  async enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<void> {
    const syncOp: SyncOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...operation,
      timestamp: new Date(),
      retries: 0,
      status: 'PENDING'
    };
    
    this.queue.push(syncOp);
    
    // Sauvegarder dans la base pour la persistance offline
    await this.saveToDatabase(syncOp);
    
    // Déclencher le traitement si online
    if (this.config.isOnline()) {
      this.processQueue();
    }
  }
  
  private async saveToDatabase(operation: SyncOperation): Promise<void> {
    try {
      await this.prisma.syncQueue.create({
        data: {
          id: operation.id,
          tableName: operation.table,
          operation: operation.operation,
          data: operation.data,
          status: operation.status,
          retries: operation.retries,
          timestamp: operation.timestamp,
          caisseId: this.config.getCaisseIdValue()
        }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans la queue:', error);
    }
  }
  
  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || !this.config.isOnline()) return;
    
    this.processing = true;
    
    try {
      const batchSize = this.config.getConfig().batchSize;
      const batch = this.queue.slice(0, batchSize);
      
      // Marquer comme en traitement
      await this.markOperationsProcessing(batch);
      
      for (const operation of batch) {
        await this.processOperation(operation);
      }
      
      // Retirer les opérations traitées
      this.queue = this.queue.slice(batch.length);
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.processing = false;
      
      // Si il reste des opérations, continuer
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
  
  private async markOperationsProcessing(operations: SyncOperation[]): Promise<void> {
    const ids = operations.map(op => op.id);
    
    await this.prisma.syncQueue.updateMany({
      where: { id: { in: ids } },
      data: { status: 'PROCESSING' }
    });
    
    operations.forEach(op => op.status = 'PROCESSING');
  }
  
  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      console.log(`Processing ${operation.operation} on ${operation.table}: ${operation.localId}`);
      
      const payload = {
        caisseId: this.config.getCaisseIdValue(),
        operation: operation.operation,
        table: operation.table,
        data: operation.data,
        localId: operation.localId,
        timestamp: operation.timestamp,
        version: operation.data?.version || 1
      };
      
      const response = await fetch(`${this.config.getConfig().apiUrl}/push`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Caisse-ID': this.config.getCaisseIdValue()
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Mettre à jour le statut local
      if (result.success) {
        await this.updateLocalRecord(operation, result.data);
        operation.status = 'COMPLETED';
        await this.markOperationCompleted(operation);
      } else if (result.conflict) {
        await this.handleConflict(operation, result);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error(`Error processing operation ${operation.id}:`, error);
      
      operation.retries++;
      
      if (operation.retries >= this.config.getConfig().maxRetries) {
        operation.status = 'FAILED';
        await this.handleSyncError(operation, error);
      } else {
        // Réessayer plus tard
        operation.status = 'PENDING';
        await this.updateOperationRetries(operation);
        setTimeout(() => this.retryOperation(operation), this.config.getConfig().retryDelay);
      }
    }
  }
  
  private async updateLocalRecord(operation: SyncOperation, serverData: any): Promise<void> {
    try {
      const table = operation.table.toLowerCase();
      
      // Mettre à jour avec l'ID de synchronisation du serveur
      await this.prisma[table].update({
        where: { id: operation.localId },
        data: {
          syncId: serverData.syncId || serverData.id,
          syncStatus: 'SYNCED',
          lastSyncedAt: new Date(),
          version: serverData.version || (operation.data?.version || 0) + 1
        }
      });
    } catch (error) {
      console.error(`Error updating local record ${operation.table} ${operation.localId}:`, error);
    }
  }
  
  private async markOperationCompleted(operation: SyncOperation): Promise<void> {
    await this.prisma.syncQueue.update({
      where: { id: operation.id },
      data: { 
        status: 'COMPLETED',
        retries: operation.retries
      }
    });
  }
  
  private async updateOperationRetries(operation: SyncOperation): Promise<void> {
    await this.prisma.syncQueue.update({
      where: { id: operation.id },
      data: { 
        status: 'PENDING',
        retries: operation.retries
      }
    });
  }
  
  private async handleSyncError(operation: SyncOperation, error: Error): Promise<void> {
    try {
      // Marquer le record local comme erreur de sync
      const table = operation.table.toLowerCase();
      await this.prisma[table].update({
        where: { id: operation.localId },
        data: { syncStatus: 'ERROR' }
      });
      
      // Mettre à jour la queue
      await this.prisma.syncQueue.update({
        where: { id: operation.id },
        data: { 
          status: 'FAILED',
          error: error.message,
          retries: operation.retries
        }
      });
      
      console.error(`Sync error for ${operation.table} ${operation.localId}:`, error);
    } catch (updateError) {
      console.error('Error handling sync error:', updateError);
    }
  }
  
  private async handleConflict(operation: SyncOperation, result: any): Promise<void> {
    const conflictService = SyncConflictService.getInstance();
    await conflictService.handleConflict(
      operation.table,
      operation.localId,
      result.serverData
    );
    
    operation.status = 'COMPLETED';
    await this.markOperationCompleted(operation);
  }
  
  private async retryOperation(operation: SyncOperation): Promise<void> {
    // Réinsérer au début de la queue
    this.queue.unshift(operation);
    this.processQueue();
  }
  
  getQueueStatus(): { pending: number; failed: number; processing: number } {
    const pending = this.queue.filter(op => op.status === 'PENDING').length;
    const failed = this.queue.filter(op => op.status === 'FAILED').length;
    const processing = this.queue.filter(op => op.status === 'PROCESSING').length;
    
    return { pending, failed, processing };
  }
  
  getQueue(): SyncOperation[] {
    return [...this.queue];
  }
  
  async clearCompleted(): Promise<void> {
    await this.prisma.syncQueue.deleteMany({
      where: { 
        status: 'COMPLETED',
        caisseId: this.config.getCaisseIdValue()
      }
    });
  }
}