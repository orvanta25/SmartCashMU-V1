import { ipcMain } from "electron";
import { createMagasin } from "../service/magasin";

export function MagasinApi(prisma) {
    ipcMain.on("/magasin/create",async(event,data)=>{
        try {
            const createdMagasin = await createMagasin(data,prisma)

            event.sender.send("/magasin/create",createdMagasin)
        } catch (error) {
            console.error("api/magasin /magasin/create: ",error);
            
        }
    })
}