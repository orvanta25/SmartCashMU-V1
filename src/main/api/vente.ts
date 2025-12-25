// src/main/api/vente.ts
import { ipcMain } from "electron";
import { getVentesByCommandeId, getVentesByDateRange } from "../service/vente";
import { bgErrorRed } from "../util";
import type { PrismaClient } from "@prisma/client"; 

// Fonction VenteApi - EXPORT NOMÉ
export function VenteApi(prisma: any): void {
    ipcMain.on("/vente/by-date-range", async (event, data) => {
        try {
            const ventes = await getVentesByDateRange(data, prisma);
            event.sender.send("/vente/by-date-range", ventes);
        } catch (error) {
            console.error("api/vente /vente/by-date-range :", error);
        }
    });

    ipcMain.on("/vente/by-commande", async (event, data) => {
        try {
            const ventes = await getVentesByCommandeId(data, prisma);
            event.sender.send("/vente/by-commande", ventes);
        } catch (error) {
            console.error(bgErrorRed, "api/vente /vente/by-commande: " + error);
        }
    });

    ipcMain.on("/vente/getByCommande", async (event, { entrepriseId, commandeId }) => {
        try {
            const ventes = await prisma.vente.findMany({
                where: {
                    entrepriseId,
                    commandeId
                },
                include: {
                    commande: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            event.sender.send("/vente/getByCommande", {
                success: true,
                ventes
            });
        } catch (error) {
            console.error("api/vente/getByCommande:", error);
            event.sender.send("/vente/getByCommande", {
                success: false,
                error: error.message
            });
        }
    });
}

// EXPORT PAR DÉFAUT - TRÈS IMPORTANT !
export default VenteApi;