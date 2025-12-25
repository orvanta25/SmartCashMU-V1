import { ipcMain } from "electron";
import { getEntreesByAchatFournisseurId, getLatestProductPrices } from "../service/entree";

export function EntreeApi(
    prisma
) {
    ipcMain.on("/entree/getByAchatFournisseur/entrepriseId/achatFournisseurId",async (event,data) => {
        try {
            const result = await getEntreesByAchatFournisseurId(data,prisma)

            event.sender.send("/entree/getByAchatFournisseur/entrepriseId/achatFournisseurId",result)
        } catch (error) {
            console.error("api/entree /entree/getByAchatFournisseur/entrepriseId/achatFournisseurId: ",error);
            
        }
    })

    ipcMain.on("/entree/prices/latest/entrepriseId",async (event,data) => {
        try {
            const entrees = await getLatestProductPrices(data,prisma)

            event.sender.send("/entree/prices/latest/entrepriseId",entrees)
        } catch (error) {
            console.error("api/entree /entree/prices/latest/entrepriseId: ",error);
            
        }
    })
}