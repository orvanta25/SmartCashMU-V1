//src/main/api/product-variant.api.ts

import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';
import { ProductVariantService } from '../service/product-variant.service';

export function setupProductVariantApi(prisma: PrismaClient) {
  const productVariantService = new ProductVariantService(prisma);

  // Génère les variantes d'un produit
  ipcMain.on('product-variant:generate', async (event, data) => {
    try {
      const result = await productVariantService.generate(data);
      event.sender.send('product-variant:generate', result);
    } catch (error: any) {
      console.error('Error in product-variant:generate:', error);
      event.sender.send('product-variant:generate', { error: error.message });
    }
  });

  // Récupère toutes les variantes d'un produit
  ipcMain.on('product-variant:findAllByProduct', async (event, productId) => {
    try {
      const result = await productVariantService.getProductVariants(productId);
      
      event.sender.send('product-variant:findAllByProduct', result);
    } catch (error: any) {
      console.error('Error in product-variant:findAllByProduct:', error);
      event.sender.send('product-variant:findAllByProduct', { error: error.message });
    }
  });

  // Crée une variante
  ipcMain.on('product-variant:create', async (event, data) => {
    try {
      const result = await productVariantService.create(data);
      event.sender.send('product-variant:create', result);
    } catch (error: any) {
      console.error('Error in product-variant:create:', error);
      event.sender.send('product-variant:create', { error: error.message });
    }
  });

  // Met à jour une variante
  ipcMain.on('product-variant:update', async (event, { id, data }) => {
    try {
      const result = await productVariantService.update(id, data);
      event.sender.send('product-variant:update', result);
    } catch (error: any) {
      console.error('Error in product-variant:update:', error);
      event.sender.send('product-variant:update', { error: error.message });
    }
  });

  // Supprime une variante
  ipcMain.on('product-variant:delete', async (event, id) => {
    try {
      await productVariantService.delete(id);
      event.sender.send('product-variant:delete', { success: true });
    } catch (error: any) {
      console.error('Error in product-variant:delete:', error);
      event.sender.send('product-variant:delete', { error: error.message });
    }
  });

  // Met à jour le stock d'une variante
  ipcMain.on('product-variant:updateStock', async (event, { variantId, magasinId, data }) => {
    try {
      const result = await productVariantService.updateStock(variantId, magasinId, data);
      event.sender.send('product-variant:updateStock', result);
    } catch (error: any) {
      console.error('Error in product-variant:updateStock:', error);
      event.sender.send('product-variant:updateStock', { error: error.message });
    }
  });

  // Récupère tous les stocks d'un magasin
  ipcMain.on('product-variant:getStocksForMagasin', async (event, magasinId) => {
    try {
      const result = await productVariantService.getStocksForMagasin(magasinId);
      event.sender.send('product-variant:getStocksForMagasin', result);
    } catch (error: any) {
      console.error('Error in product-variant:getStocksForMagasin:', error);
      event.sender.send('product-variant:getStocksForMagasin', { error: error.message });
    }
  });
}