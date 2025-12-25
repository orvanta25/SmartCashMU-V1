import { ipcMain } from "electron";
import { createInventory, getAllInventory, updateInventorById } from "../service/inventaire";

export function InventaireApi(prisma) {
    ipcMain.on("/inventaire/get/all",async (event,data) => {
        try {
            const inventaire = await getAllInventory(data,prisma)

            event.sender.send("/inventaire/get/all",inventaire)
        } catch (error) {
            console.error("api/inventaire /inventaire/get/all: ",error);
            
        }
    })

    ipcMain.on("/inventaire/create",async (event,data) => {
        try {
            const createdInventory = await createInventory(data,prisma)

            event.sender.send("/inventaire/create",createdInventory)
        } catch (error) {
            console.error("api/inventaire /inventaire/create: ",error);
            
        }
    })

    ipcMain.on("/inventaire/update",async (event,data) => {
        try {
            const updatedInventory = await updateInventorById(data,prisma)

            event.sender.send("/inventaire/update",updatedInventory)
        } catch (error) {
            console.error("api/inventaire /inventaire/update: ",error);
            
        }
    })
}