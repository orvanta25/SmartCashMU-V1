// src/renderer/api/vente-utils.ts
/**
 * Fonction utilitaire pour obtenir les ventes d'une commande avec garantie du champ retourQuantite
 * Utilise l'IPC pour communiquer avec le main process
 */
export async function getVentesWithRetourQuantite(entrepriseId: string, commandeId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    // Utilisez window.electron.ipcRenderer comme dans vente.ts
    window.electron.ipcRenderer.send('/vente/getByCommande', { entrepriseId, commandeId });
    
    window.electron.ipcRenderer.once('/vente/getByCommande', (_event, response) => {
      if (response.success && response.ventes) {
        // S'assurer que chaque vente a un champ retourQuantite
        const ventesWithRetour = response.ventes.map(vente => ({
          ...vente,
          retourQuantite: vente.retourQuantite || 0
        }));
        resolve(ventesWithRetour);
      } else {
        // Fallback à l'ancienne API via IPC
        window.electron.ipcRenderer.send('/vente/by-commande', { entrepriseId, commandeId });
        
        window.electron.ipcRenderer.once('/vente/by-commande', (_event, ventes) => {
          if (ventes && Array.isArray(ventes)) {
            const ventesWithRetour = ventes.map(vente => ({
              ...vente,
              retourQuantite: vente.retourQuantite || 0
            }));
            resolve(ventesWithRetour);
          } else {
            reject(new Error(response.error || 'Erreur lors de la récupération des ventes'));
          }
        });
      }
    });
    
    // Timeout pour éviter les blocages
    setTimeout(() => {
      reject(new Error('Timeout lors de la récupération des ventes'));
    }, 10000);
  });
}

/**
 * Version simplifiée qui utilise directement la nouvelle API sans fallback
 */
export async function getVentesByCommandeWithRetour(entrepriseId: string, commandeId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send('/vente/getByCommande', { entrepriseId, commandeId });
    
    window.electron.ipcRenderer.once('/vente/getByCommande', (_event, response) => {
      if (response.success) {
        resolve(response.ventes || []);
      } else {
        reject(new Error(response.error || 'Erreur lors de la récupération des ventes'));
      }
    });
    
    setTimeout(() => {
      reject(new Error('Timeout lors de la récupération des ventes'));
    }, 10000);
  });
}