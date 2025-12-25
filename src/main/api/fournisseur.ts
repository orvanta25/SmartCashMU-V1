import { ipcMain } from "electron";
import { addFournisseur, deleteFournisseur, getFournisseursByParams, updateFournisseur } from "../service/fournisseur";

export function FournisseurApi(prisma) {
    ipcMain.handle("/fournisseur/create",async (_,data) => {
        try {
            const addedFournisseur = await addFournisseur(data,prisma)

            return addedFournisseur
        } catch (error) {
            console.error("api/fournisseur /fournisseur/create: ",error);
            return null
        }
    })

    ipcMain.handle("/fournisseur/get",async (_,data) => {
        try {
            const fournisseurs = await getFournisseursByParams(data,prisma)

            return fournisseurs
        } catch (error) {
            console.error("api/fournisseur /fournisseur/get: ",error);
            return null
        }
    })

    ipcMain.handle("/fournisseur/update",async (_,data) => {
        try {
            const updatedFournisseur = await updateFournisseur(data,prisma)

            return updatedFournisseur
        } catch (error) {
            console.error("api/fournisseur /fournisseur/update: ",error);
            return null
        }
    })

    ipcMain.handle("/fournisseur/delete",async (_,data) => {
        try {
            const deletedFournisseur = await deleteFournisseur(data,prisma)

            return deletedFournisseur
        } catch (error) {
            console.error("api/fournisseur /fournisseur/delete: ",error);
            return null
        }
    })
}