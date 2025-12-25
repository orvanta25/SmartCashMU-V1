// src/main/variant-value.api.ts
import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { VariantValueService } from '../service/variant-value.service';

export function setupVariantValueApi(prisma: PrismaClient) {
  const variantValueService = new VariantValueService(prisma);

  console.log('📡 Enregistrement des handlers variant-value...');

  // Créer une valeur - CORRECTION: utiliser ipcMain.on pour send/once
  ipcMain.on('variant-value:create', async (event, data: any) => {
  try {
    const result = await variantValueService.create(data);
    console.log('Valeur créée:', result);
    event.reply('variant-value:create:response', { value: result });
  } catch (error: any) {
    event.reply('variant-value:create:response', { error: error.message });
  }
});


  // Récupérer toutes les valeurs
  ipcMain.on('variant-value:findAll', async (event) => {
    console.log('Handler called: variant-value:findAll');
    try {
      const result = await variantValueService.findAll();
      event.sender.send('variant-value:findAll', result);
    } catch (error: any) {
      console.error('Error in variant-value:findAll:', error);
      event.sender.send('variant-value:findAll', { error: error.message });
    }
  });

  // Récupérer les valeurs par famille
  ipcMain.on('variant-value:findAllByFamily', async (event, familyId: number) => {
    console.log('Handler called: variant-value:findAllByFamily', familyId);
    try {
      const result = await variantValueService.findAllByFamily(familyId);
      event.sender.send('variant-value:findAllByFamily', result);
    } catch (error: any) {
      console.error('Error in variant-value:findAllByFamily:', error);
      event.sender.send('variant-value:findAllByFamily', { error: error.message });
    }
  });

  // Mettre à jour une valeur
  ipcMain.on('variant-value:update', async (event, { id, data }: { id: number; data: any }) => {
    console.log('Handler called: variant-value:update', { id, data });
    try {
      const result = await variantValueService.update(id, data);
      event.sender.send('variant-value:update', result);
    } catch (error: any) {
      console.error('Error in variant-value:update:', error);
      event.sender.send('variant-value:update', { error: error.message });
    }
  });

  // Supprimer une valeur
  ipcMain.on('variant-value:delete', async (event, id: number) => {
    console.log('Handler called: variant-value:delete', id);
    try {
      await variantValueService.delete(id);
      event.sender.send('variant-value:delete', { success: true });
    } catch (error: any) {
      console.error('Error in variant-value:delete:', error);
      event.sender.send('variant-value:delete', { error: error.message });
    }
  });

  console.log('✅ Handlers variant-value enregistrés');
}