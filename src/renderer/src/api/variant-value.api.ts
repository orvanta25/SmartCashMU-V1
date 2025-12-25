import { VariantValue, VariantValueFormData } from '../types/variant.types';

export const variantValueApi = {
  // Get all values for a family
  findAllByFamily: async (variantFamilyId: number): Promise<VariantValue[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-value:findAllByFamily',
        (_, response: VariantValue[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantValue[]);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-value:findAllByFamily', variantFamilyId);
    });
  },

  // Get value by ID
  findById: async (id: number): Promise<VariantValue | null> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-value:findById',
        (_, response: VariantValue | null | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantValue | null);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-value:findById', id);
    });
  },

  // Create variant value - CORRECTION ICI
  create: async (data: VariantValueFormData): Promise<VariantValue> => {
    return new Promise((resolve, reject) => {
      // IMPORTANT: Écouter AVANT d'envoyer
      window.electron.ipcRenderer.once(
        'variant-value:create:response', // ✅ Ajout de :response
        (_, response: { value?: VariantValue; error?: string }) => {
          console.log('📨 Réponse reçue du backend:', response);
          
          if (response && response.error) {
            reject(new Error(response.error));
          } else if (response && response.value) {
            resolve(response.value);
          } else {
            reject(new Error('Réponse invalide du serveur'));
          }
        }
      );
      
      console.log('📤 Envoi de la requête de création:', data);
      window.electron.ipcRenderer.send('variant-value:create', data);
    });
  },

  // Update variant value
  update: async (id: number, data: Partial<VariantValueFormData>): Promise<VariantValue> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-value:update',
        (_, response: VariantValue | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantValue);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-value:update', { id, data });
    });
  },

  // Delete variant value
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-value:delete',
        (_, response: { success?: boolean; error?: string }) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-value:delete', id);
    });
  },

  // Get all values
  findAll: async (): Promise<VariantValue[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-value:findAll',
        (_, response: VariantValue[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantValue[]);
          }
        }
      );

      window.electron.ipcRenderer.send('variant-value:findAll');
    });
  },
};