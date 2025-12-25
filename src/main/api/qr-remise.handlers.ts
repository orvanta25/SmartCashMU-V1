import { ipcMain } from 'electron';
import { QRRemiseService, CreateRemiseQRConfigDto } from '../service/qr-remise.service';

export interface IPCRequest {
  [key: string]: any;
}

export function registerQRRemiseHandlers() {
  // 1. Créer/Mettre à jour la configuration
  ipcMain.on('qr-remise:create-config', async (event, request: IPCRequest) => {
    try {
      const { entrepriseId, data } = request;
      console.log('qr-remise:create-config request:', { entrepriseId, data });
      
      const result = await QRRemiseService.createOrUpdateConfig(
        entrepriseId, 
        data as CreateRemiseQRConfigDto
      );
      
      console.log('qr-remise:create-config success:', result);
      event.reply('qr-remise:create-config', result);
    } catch (error: any) {
      console.error('qr-remise:create-config error:', error);
      event.reply('qr-remise:create-config', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // 2. Récupérer la configuration active
  ipcMain.on('qr-remise:get-active-config', async (event, request: IPCRequest) => {
    try {
      const { entrepriseId } = request;
      console.log('qr-remise:get-active-config request:', { entrepriseId });
      
      const config = await QRRemiseService.getActiveConfig(entrepriseId);
      console.log('qr-remise:get-active-config success:', config);
      
      event.reply('qr-remise:get-active-config', { 
        success: true, 
        config 
      });
    } catch (error: any) {
      console.error('qr-remise:get-active-config error:', error);
      event.reply('qr-remise:get-active-config', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // 3. Scanner un QR code
  ipcMain.on('qr-remise:scan', async (event, request: IPCRequest) => {
    try {
      const { code, entrepriseId, userId, commandeId } = request;
      console.log('qr-remise:scan request:', { code, entrepriseId, userId, commandeId });
      
      const result = await QRRemiseService.scanAndApplyQRCode(
        code, 
        entrepriseId, 
        userId, 
        commandeId
      );
      
      console.log('qr-remise:scan success:', result);
      event.reply('qr-remise:scan', result);
    } catch (error: any) {
      console.error('qr-remise:scan error:', error);
      event.reply('qr-remise:scan', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // 4. Générer un ticket QR après vente
  ipcMain.on('qr-remise:generate-after-vente', async (event, request: IPCRequest) => {
  try {
    const { venteId } = request;
    console.log('qr-remise:generate-after-vente request:', { venteId });
    
    const ticket = await QRRemiseService.generateTicketAfterVente(venteId);
    console.log('qr-remise:generate-after-vente raw ticket type:', typeof ticket);
    
    if (!ticket) {
      event.reply('qr-remise:generate-after-vente', { 
        success: true, 
        hasTicket: false,
        ticket: null
      });
      return;
    }
    
    // ✅ SOLUTION SIMPLE : Utiliser JSON.parse/stringify pour sérialiser
    const ticketString = JSON.stringify(ticket, (key, value) => {
      // Convertir les Dates en string ISO
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    
    const serializableTicket = JSON.parse(ticketString);
    
    console.log('qr-remise:generate-after-vente success:', { hasTicket: true });
    
    event.reply('qr-remise:generate-after-vente', { 
      success: true, 
      hasTicket: true,
      ticket: serializableTicket 
    });
  } catch (error: any) {
    console.error('qr-remise:generate-after-vente error:', error);
    event.reply('qr-remise:generate-after-vente', { 
      success: false, 
      error: error.message 
    });
  }
});
  // 5. Récupérer les données du QR
  ipcMain.on('qr-remise:get-qr-data', async (event, request: IPCRequest) => {
    try {
      const { ticketId } = request;
      console.log('qr-remise:get-qr-data request:', { ticketId });
      
      const qrData = await QRRemiseService.getQRCodeData(ticketId);
      console.log('qr-remise:get-qr-data success:', !!qrData);
      
      event.reply('qr-remise:get-qr-data', qrData);
    } catch (error: any) {
      console.error('qr-remise:get-qr-data error:', error);
      event.reply('qr-remise:get-qr-data', null);
    }
  });

  // 6. Récupérer les statistiques
  ipcMain.on('qr-remise:get-stats', async (event, request: IPCRequest) => {
    try {
      const { entrepriseId } = request;
      console.log('qr-remise:get-stats request:', { entrepriseId });
      
      const stats = await QRRemiseService.getStats(entrepriseId);
      console.log('qr-remise:get-stats success:', stats);
      
      event.reply('qr-remise:get-stats', stats);
    } catch (error: any) {
      console.error('qr-remise:get-stats error:', error);
      event.reply('qr-remise:get-stats', { 
        success: false, 
        error: error.message 
      });
    }
  });

  // 7. Vérifier si une vente a un QR
  ipcMain.on('qr-remise:check-vente-has-qr', async (event, request: IPCRequest) => {
    try {
      const { venteId } = request;
      console.log('qr-remise:check-vente-has-qr request:', { venteId });
      
      const result = await QRRemiseService.checkVenteHasQR(venteId);
      console.log('qr-remise:check-vente-has-qr success:', result);
      
      event.reply('qr-remise:check-vente-has-qr', result);
    } catch (error: any) {
      console.error('qr-remise:check-vente-has-qr error:', error);
      event.reply('qr-remise:check-vente-has-qr', { 
        success: false, 
        error: error.message 
      });
    }
  });
}