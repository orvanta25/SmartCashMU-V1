// renderer/src/hooks/useSync.ts
import { useState, useEffect, useCallback } from 'react';

export interface SyncStatus {
  online: boolean;
  isSyncing: boolean;
  queue: {
    pending: number;
    failed: number;
    processing: number;
  };
  pendingConflicts: number;
  caisseId: string;
  lastSync?: Date;
}

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>({
    online: navigator.onLine,
    isSyncing: false,
    queue: { pending: 0, failed: 0, processing: 0 },
    pendingConflicts: 0,
    caisseId: '',
    lastSync: undefined
  });
  
  const [syncManager, setSyncManager] = useState<any>(null);
  
  useEffect(() => {
    // Récupérer le manager depuis le contexte global (Electron)
    const manager = (window as any).syncManager;
    if (manager) {
      setSyncManager(manager);
      
      // Mettre à jour le statut initial
      const initialStatus = manager.getStatus();
      setStatus(prev => ({ ...prev, ...initialStatus }));
      
      // Mettre à jour périodiquement
      const interval = setInterval(() => {
        const newStatus = manager.getStatus();
        setStatus(prev => ({ ...prev, ...newStatus }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
    
    // Écouter les événements réseau
    const handleOnline = () => setStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, online: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const syncNow = useCallback(async () => {
    if (!syncManager) return { success: false, message: 'SyncManager non disponible' };
    
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const result = await syncManager.syncNow();
      const newStatus = syncManager.getStatus();
      setStatus(prev => ({ ...prev, ...newStatus, isSyncing: false }));
      return result;
    } catch (error) {
      setStatus(prev => ({ ...prev, isSyncing: false }));
      return { 
        success: false, 
        message: error.message 
      };
    }
  }, [syncManager]);
  
  const resolveConflict = useCallback(async (conflictId: string, resolution: any) => {
    if (!syncManager) return;
    
    await syncManager.resolveConflict(conflictId, resolution);
    const newStatus = syncManager.getStatus();
    setStatus(prev => ({ ...prev, ...newStatus }));
  }, [syncManager]);
  
  const getQueueOperations = useCallback(() => {
    if (!syncManager) return [];
    return syncManager.getQueueOperations();
  }, [syncManager]);
  
  const clearCompletedOperations = useCallback(async () => {
    if (!syncManager) return;
    await syncManager.clearCompletedOperations();
    const newStatus = syncManager.getStatus();
    setStatus(prev => ({ ...prev, ...newStatus }));
  }, [syncManager]);
  
  return {
    status,
    syncNow,
    resolveConflict,
    getQueueOperations,
    clearCompletedOperations,
    isOnline: status.online,
    hasPendingChanges: status.queue.pending > 0,
    hasConflicts: status.pendingConflicts > 0,
    isSyncing: status.isSyncing
  };
}