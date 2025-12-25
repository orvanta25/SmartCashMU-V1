import QRCode from 'qrcode';

export interface QRCodeData {
  type: string;
  code: string;
  pourcentage: number;
  dateExpiration: string;
  entrepriseId: string;
}

export async function generateQRCodeBase64(data: QRCodeData): Promise<string> {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw error;
  }
}