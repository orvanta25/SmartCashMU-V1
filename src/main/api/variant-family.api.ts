import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { VariantFamilyService } from '../service/variant-family.service';

export function setupVariantFamilyApi(prisma: PrismaClient) {
  const variantFamilyService = new VariantFamilyService(prisma);

  console.log('📡 Enregistrement des handlers variant-family...');

  // Créer une famille
  ipcMain.on('variant-family:create', async (event, data: any) => {
    try {
      console.log('Handler appelé: variant-family:create', data);
      const family = await variantFamilyService.create(data);
      console.log('Famille créée:', family);
      event.reply('variant-family:create:response', { family });
    } catch (error: any) {
      console.error('Erreur création famille:', error);
      event.reply('variant-family:create:response', { error: error.message });
    }
  });

  // Récupérer toutes les familles
  ipcMain.on('variant-family:findAll', async (event) => {
    console.log('Handler appelé: variant-family:findAll');
    try {
      const families = await variantFamilyService.findAll();
      event.reply('variant-family:findAll:response', families);
    } catch (error: any) {
      console.error('Erreur récupération familles:', error);
      event.reply('variant-family:findAll:response', { error: error.message });
    }
  });

  // Mettre à jour une famille
  ipcMain.on('variant-family:update', async (event, { id, data }: { id: number; data: any }) => {
    console.log('Handler appelé: variant-family:update', { id, data });
    try {
      const updated = await variantFamilyService.update(id, data);
      event.reply('variant-family:update:response', updated);
    } catch (error: any) {
      console.error('Erreur mise à jour famille:', error);
      event.reply('variant-family:update:response', { error: error.message });
    }
  });

  // Supprimer une famille
  ipcMain.on('variant-family:delete', async (event, id: number) => {
    console.log('Handler appelé: variant-family:delete', id);
    try {
      await variantFamilyService.delete(id);
      event.reply('variant-family:delete:response', { success: true });
    } catch (error: any) {
      console.error('Erreur suppression famille:', error);
      event.reply('variant-family:delete:response', { error: error.message });
    }
  });

  console.log('✅ Handlers variant-family enregistrés');
}