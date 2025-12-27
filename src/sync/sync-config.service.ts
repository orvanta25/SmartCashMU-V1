// sync/sync-config.service.ts
export interface SyncConfig {
  caisseId: string;
  apiUrl: string;
  syncInterval: number;
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  conflictStrategy: 'client-wins' | 'server-wins' | 'manual';
  tablesToSync: string[];
  offlineMode: boolean;
  lastSyncTimestamp?: Date;
}

export class SyncConfigService {
  private config: SyncConfig;
  private static instance: SyncConfigService;
  
  private constructor() {
    this.config = {
      caisseId: this.getCaisseId(),
      apiUrl: process.env.SYNC_API_URL || 'http://localhost:3000/api/sync',
      syncInterval: 30000,
      batchSize: 100,
      maxRetries: 3,
      retryDelay: 5000,
      conflictStrategy: 'manual',
      tablesToSync: [
        'User', 'Produit', 'Magasin', 'MagasinProduit', 
        'Commande', 'Vente', 'Paiement', 'Client',
        'Fournisseur', 'Inventaire', 'MouvementStock',
        'Categorie', 'Entreprise', 'Retour', 'RetourLigne'
      ],
      offlineMode: false
    };
  }
  
  public static getInstance(): SyncConfigService {
    if (!SyncConfigService.instance) {
      SyncConfigService.instance = new SyncConfigService();
    }
    return SyncConfigService.instance;
  }
  
  private getCaisseId(): string {
    // Dans Electron, utilisez plutôt electron-store ou un fichier de config
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedId = localStorage.getItem('caisseId');
      if (storedId) return storedId;
    }
    
    const newId = `caisse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('caisseId', newId);
    }
    
    return newId;
  }
  
  getConfig(): SyncConfig {
    return { ...this.config };
  }
  
  updateConfig(updates: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  setOfflineMode(enabled: boolean): void {
    this.config.offlineMode = enabled;
  }
  
  isOnline(): boolean {
    // Vérifie la connectivité réseau
    if (typeof navigator !== 'undefined') {
      return navigator.onLine && !this.config.offlineMode;
    }
    return !this.config.offlineMode;
  }
  
  getCaisseIdValue(): string {
    return this.config.caisseId;
  }
  
  setCaisseId(id: string): void {
    this.config.caisseId = id;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('caisseId', id);
    }
  }
}