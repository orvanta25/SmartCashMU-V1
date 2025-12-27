// renderer/src/components/SyncStatus.tsx
import React from 'react';
import { useSync } from '../hooks/useSync';

export const SyncStatus: React.FC = () => {
  const { 
    status, 
    syncNow, 
    isOnline, 
    hasPendingChanges, 
    hasConflicts,
    isSyncing 
  } = useSync();
  
  return (
    <div className="sync-status">
      <div className={`sync-indicator ${isOnline ? 'online' : 'offline'}`}>
        <span className="dot"></span>
        <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
      </div>
      
      {hasPendingChanges && (
        <div className="sync-pending">
          <span>📤 {status.queue.pending} en attente</span>
        </div>
      )}
      
      {hasConflicts && (
        <div className="sync-conflict">
          <span>⚠️ {status.pendingConflicts} conflits</span>
        </div>
      )}
      
      <button 
        onClick={() => syncNow()} 
        disabled={!isOnline || isSyncing}
        className="sync-button"
      >
        {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
      </button>
      
      <div className="sync-details">
        <small>Caissier: {status.caisseId}</small>
      </div>
    </div>
  );
};