import { ipcMain } from "electron";
import { createClient, deleteClient, getClientsByParams, updateClient } from "../service/client";

export function ClientApi(prisma) {
    ipcMain.handle("/client/create",async (_,data) => {
        try {
            const createdClient = await createClient(data,prisma)

            return createdClient
        } catch (error) {
            console.error("api/client /client/create: ",error);
            return null
        }  
    })

    ipcMain.handle("/client/get",async (_,data) => {
        try {
            const clients = await getClientsByParams(data,prisma)
            
            return clients
        } catch (error) {
            console.error("api/client /client/get: ",error);
            return null
        }
    })

    ipcMain.handle("/client/update",async (_,data) => {
        try {
            const updatedClient = await updateClient(data,prisma)

            return updatedClient
        } catch (error) {
            console.error("api/client /client/update: ",error);
            return null
        }  
    })

    ipcMain.handle("/client/delete",async (_,data) => {
        try {
            const deletedClient = await deleteClient(data,prisma)

            return deletedClient
        } catch (error) {
            console.error("api/client /client/delete: ",error);
            return null
        }  
    })
}