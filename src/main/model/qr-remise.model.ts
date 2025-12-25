export interface CreateRemiseQRConfigDto {
  pourcentage: number;
  joursValidite: number;
  message?: string;
}

export interface ScanQRRemiseDto {
  code: string;
  commandeId?: string;
}

export interface RemiseQRConfig {
  id: string;
  entrepriseId: string;
  pourcentage: number;
  joursValidite: number;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRemiseQR {
  id: string;
  code: string;
  configId: string;
  venteId?: string;
  pourcentage: number;
  dateExpiration: string;
  dateUtilisation?: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QRScanResult {
  success: boolean;
  validation?: {
    pourcentage: number;
    message: string;
  };
  application?: {
    commandeId: string;
    remiseAppliquee: number;
    totalAvant: number;
    totalApres: number;
  };
  message?: string;
  error?: string;
}