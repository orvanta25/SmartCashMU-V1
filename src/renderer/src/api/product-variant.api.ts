//src/main/renderer/src/api/product-variant.api.ts


import { 
  ProductVariant, 
  ProductVariantFormData,
  ProductVariantsGenerateData 
} from '../types/variant.types';

export const productVariantApi = {
  /** Génère les variantes d'un produit */
  generate: async (data: ProductVariantsGenerateData): Promise<ProductVariant[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:generate', data);
      
      window.electron.ipcRenderer.once(
        'product-variant:generate',
        (_, response: ProductVariant[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as ProductVariant[]);
          }
        }
      );
    });
  },

  /** Récupère toutes les variantes d'un produit */
  findAllByProduct: async (productId: string): Promise<ProductVariant[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:findAllByProduct', productId);
      
      window.electron.ipcRenderer.once(
        'product-variant:findAllByProduct',
        (_, response: ProductVariant[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as ProductVariant[]);
          }
        }
      );
    });
  },

  /** Crée une variante */
  create: async (data: ProductVariantFormData): Promise<ProductVariant> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:create', data);
      
      window.electron.ipcRenderer.once(
        'product-variant:create',
        (_, response: ProductVariant | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as ProductVariant);
          }
        }
      );
    });
  },

  /** Met à jour une variante */
  update: async (id: number, data: Partial<ProductVariantFormData>): Promise<ProductVariant> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:update', { id, data });
      
      window.electron.ipcRenderer.once(
        'product-variant:update',
        (_, response: ProductVariant | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as ProductVariant);
          }
        }
      );
    });
  },

  /** Supprime une variante */
  deleteVariant: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:delete', id);
      
      window.electron.ipcRenderer.once(
        'product-variant:delete',
        (_, response: { success?: boolean; error?: string }) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        }
      );
    });
  },

  /** Met à jour le stock d'une variante dans un magasin */
  updateStock: async (
    variantId: number,
    magasinId: string,
    quantity: number,
    minStock?: number,
    maxStock?: number
  ): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:updateStock', { 
        variantId, 
        magasinId, 
        data: { quantity, minStock, maxStock } 
      });
      
      window.electron.ipcRenderer.once(
        'product-variant:updateStock',
        (_, response: { success: boolean } | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as { success: boolean });
          }
        }
      );
    });
  },

  /** Récupère tous les stocks d'un magasin */
  getStocksForMagasin: async (magasinId: string): Promise<{ variantId: number, quantity: number }[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:getStocksForMagasin', magasinId);
      
      window.electron.ipcRenderer.once(
        'product-variant:getStocksForMagasin',
        (_, response: { variantId: number, quantity: number }[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as { variantId: number, quantity: number }[]);
          }
        }
      );
    });
  },

/** Rexport getProductVariants */
  getProductVariants: async (productId: string): Promise<ProductVariant[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.send('product-variant:findAllByProduct', productId);

      window.electron.ipcRenderer.once(
        'product-variant:findAllByProduct',
        (_, response: ProductVariant[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as ProductVariant[]);
          }
        }
      );
    });
  },
};