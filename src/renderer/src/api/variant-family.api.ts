// src/api/variant-family.api.ts
import { VariantFamily, VariantFamilyFormData } from '../types/variant.types';

export const variantFamilyApi = {
  // Get all families
  findAll: async (): Promise<VariantFamily[]> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-family:findAll:response',
        (_, response: VariantFamily[] | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantFamily[]);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-family:findAll');
    });
  },

  // Get family by ID
  findById: async (id: number): Promise<VariantFamily | null> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-family:findById:response',
        (_, response: VariantFamily | null | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantFamily | null);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-family:findById', id);
    });
  },

  // Create family
  create: async (data: VariantFamilyFormData): Promise<VariantFamily> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-family:create:response',
        (_, response: { family?: VariantFamily; error?: string }) => {
          console.log('📨 Réponse création famille reçue:', response);
          
          if (response && response.error) {
            reject(new Error(response.error));
          } else if (response && response.family) {
            resolve(response.family);
          } else {
            reject(new Error('Réponse invalide du serveur'));
          }
        }
      );
      
      console.log('📤 Envoi création famille:', data);
      window.electron.ipcRenderer.send('variant-family:create', data);
    });
  },

  // Update family
  update: async (id: number, data: Partial<VariantFamilyFormData>): Promise<VariantFamily> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-family:update:response',
        (_, response: VariantFamily | { error?: string }) => {
          if (response && 'error' in response) {
            reject(new Error(response.error));
          } else {
            resolve(response as VariantFamily);
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-family:update', { id, data });
    });
  },

  // Delete family
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      window.electron.ipcRenderer.once(
        'variant-family:delete:response',
        (_, response: { success?: boolean; error?: string }) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        }
      );
      
      window.electron.ipcRenderer.send('variant-family:delete', id);
    });
  },
};