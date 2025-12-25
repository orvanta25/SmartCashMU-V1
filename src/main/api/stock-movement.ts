import { ipcMain } from "electron";
import { getInventoryByParams, synchroniserRetoursDansMouvementStock } from "../service/stock-mouvement";

export function MouvementStockApi(prisma) {
    ipcMain.on("/inventaire/get/stock", async (event, data) => {
        try {
            const stock = await getInventoryByParams(data, prisma);
            event.sender.send("/inventaire/get/stock", stock);
        } catch (error) {
            console.error("api/mouvementStock /inventaire/get/stock: ", error);
            event.sender.send("/inventaire/get/stock", null);
        }
    });

    ipcMain.handle("/inventaire/update/stock", async (event, data) => {
        try {
            // Votre logique existante ici
        } catch (error) {
            console.error("api/mouvementStock /inventaire/update/stock: ", error);
            return { success: false, error: error.message };
        }
    });

    // AJOUTEZ CETTE NOUVELLE API POUR SYNCHRONISER LES RETOURS
    ipcMain.handle("/synchroniser/retours", async (event, data) => {
        try {
            console.log("🔧 Appel API synchronisation retours avec data:", data);
            const result = await synchroniserRetoursDansMouvementStock(data, prisma);
            return result;
        } catch (error) {
            console.error("❌ Erreur API synchronisation retours: ", error);
            return { success: false, error: error.message };
        }
    });
}