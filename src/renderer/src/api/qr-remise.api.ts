import { generateQRCodeBase64, QRCodeData } from '../utils/qrcode-generator';

export interface CreateRemiseQRConfigDto {
  pourcentage: number;
  joursValidite: number;
  message?: string;
}

export interface ScanQRRemiseDto {
  code: string;
  entrepriseId: string;
  userId: string;
  commandeId?: string;
}

export interface APIResponse {
  success: boolean;
  [key: string]: any;
}

export const qrRemiseAPI = {
  // 1. Créer / Mettre à jour la configuration
  createOrUpdateConfig(
    entrepriseId: string,
    data: CreateRemiseQRConfigDto
  ): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:create-config',
        { entrepriseId, data }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:create-config',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  },

  // 2. Récupérer la configuration active
  getActiveConfig(entrepriseId: string): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:get-active-config',
        { entrepriseId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:get-active-config',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  },

  // 3. Scanner un QR code
  scanQRCode(
    code: string,
    entrepriseId: string,
    userId: string,
    commandeId?: string
  ): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:scan',
        { code, entrepriseId, userId, commandeId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:scan',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  },

  // 4. Générer un ticket après vente
  generateTicketAfterVente(venteId: string): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:generate-after-vente',
        { venteId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:generate-after-vente',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  },

  // 5. Générer QR code base64
  generateQRBase64(ticketId: string): Promise<string | null> {
    return new Promise((resolve) => {
      window.electron.ipcRenderer.send(
        'qr-remise:get-qr-data',
        { ticketId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:get-qr-data',
        async (_event, qrData: QRCodeData | null) => {
          if (!qrData) return resolve(null);
          resolve(await generateQRCodeBase64(qrData));
        }
      );
    });
  },

  // 6. Récupérer les statistiques
  getStats(entrepriseId: string): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:get-stats',
        { entrepriseId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:get-stats',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  },

  // 7. Vérifier si une vente a un QR
  checkVenteHasQR(venteId: string): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send(
        'qr-remise:check-vente-has-qr',
        { venteId }
      );

      window.electron.ipcRenderer.once(
        'qr-remise:check-vente-has-qr',
        (_event, response: APIResponse & { error?: string }) => {
          if (response?.error) reject(response);
          else resolve(response);
        }
      );
    });
  }
};

export default qrRemiseAPI;