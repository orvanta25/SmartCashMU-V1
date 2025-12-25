//main/api/charge-types.ts

import { ipcMain } from "electron"
import { createChargeType, deleteChargeType, getAllChargeType, updateChargeType } from "../service/charge-type";

export function ChargeTypeApi(prisma){
    ipcMain.on("/chargetype/create",async (event,data) => {
        try {
            const createdChargeType = await createChargeType(data,prisma)

            event.sender.send("/chargetype/create",createdChargeType)
        } catch (error) {
            console.error("api/chargetype /chargetype/create: ",error);
            
        }
    })

    ipcMain.on("/chargetype/update",async (event,data) => {
        try {
            const updatedChargeType = await updateChargeType(data,prisma)

            event.sender.send("/chargetype/update",updatedChargeType)
        } catch (error) {
            console.error("api/chargetype /chargetype/update: ",error);
            
        }
    })

    ipcMain.on("/chargetype/get/all",async (event,data) => {
        try {
            const chargeTypes = await getAllChargeType(data,prisma)

            event.sender.send("/chargetype/get/all",chargeTypes)
        } catch (error) {
            console.error("api/chargetype /chargetype/get/all: ",error);
            
        }
    })
    
    ipcMain.on("/chargetype/delete",async (event,data) => {
        try {
            const deletedChargeType = await deleteChargeType(data,prisma)

            event.sender.send("/chargetype/delete",deletedChargeType)
        } catch (error) {
            console.error("api/chargetype /chargetype/delete: ",error);
            
        }
    })

    
}