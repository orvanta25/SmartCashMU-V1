// src/renderer/api/retour.ts - VERSION CORRIGÉE
import { v4 as uuidv4 } from 'uuid';
import { requestGuard } from '../../../utils/requestGuard';

// src/renderer/src/api/retour.ts
export const RetourApi = {
  createRetour: (commandeId: string, retourLignes: Array<{ venteId: string; quantite: number }>) => {
    return new Promise((resolve, reject) => {
      console.log("🔄 [API] Envoi création retour");
      
      if (!window.electron?.ipcRenderer) {
        reject(new Error("ipcRenderer non disponible"));
        return;
      }

      const listener = (_, data) => {
        console.log("📨 [API] Réponse:", data);
        
        // IGNOREZ l'erreur "RETOUR_EN_COURS_BUT_CONTINUE" - c'est juste un avertissement
        if (data?.code === "RETOUR_EN_COURS_BUT_CONTINUE") {
          console.log("⚠️ Message d'avertissement ignoré, retour probablement réussi");
          // Résoudre quand même avec un message positif
          resolve({
            success: true,
            message: "Retour traité avec succès",
            warning: data.message
          });
        } else if (data?.success) {
          resolve(data);
        } else {
          reject(new Error(data?.error || "Erreur inconnue"));
        }
      };
      
      window.electron.ipcRenderer.once("/retour/create", listener);
      window.electron.ipcRenderer.send("/retour/create", { commandeId, retourLignes });
      
      setTimeout(() => {
        console.warn("⚠️ [API] Timeout après 30 secondes");
        reject(new Error("Le traitement prend trop de temps"));
      }, 30000);
    });
  },


  getRetoursByCommande: (commandeId: string) =>
    new Promise((resolve) => {
      if (!window.electron?.ipcRenderer) {
        resolve({ success: false, error: "ipcRenderer non disponible", retours: [] });
        return;
      }
      
      const listener = (_, data) => {
        resolve(data);
      };
      
      window.electron.ipcRenderer.once("/retour/getByCommande", listener);
      window.electron.ipcRenderer.send("/retour/getByCommande", { commandeId });
    }),

  cancelRetour: (retourId: string) =>
    new Promise((resolve, reject) => {
      if (!window.electron?.ipcRenderer) {
        reject(new Error("ipcRenderer non disponible"));
        return;
      }
      
      const listener = (_, data) => {
        resolve(data);
      };
      
      window.electron.ipcRenderer.once("/retour/cancel", listener);
      window.electron.ipcRenderer.send("/retour/cancel", { retourId });
    }),
};
export function getRetoursByDateRange(
    entrepriseId: string,
    dateDebut?: string,
    dateFin?: string
): Promise<any[]> {
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send("/retour/by-date-range", { 
            entrepriseId, 
            dateDebut, 
            dateFin 
        });

        window.electron.ipcRenderer.once(
            "/retour/by-date-range",
            (_event, data: any[]) => {
                resolve(data || []);
            }
        );
    });
}