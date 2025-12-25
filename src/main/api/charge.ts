//main/api/charge.ts

import { ipcMain } from "electron";
import { createCharge, deleteChargeById, findAllCharge, getChargesOfLastWeek, updateChargeById, getTotalChargesByDateRange } from "../service/charge";

export function ChargeApi(prisma) {

    ipcMain.on("/charge/create",async (event,data) => {
        try {
            const createdCharge = await createCharge(data,prisma)

            event.sender.send("/charge/create",createdCharge)
        } catch (error) {
            console.error("api/charge /charge/create: ",error);
            
        }
    })

    ipcMain.on("/charge/getAll",async (event,data) => {
        try {
            const createdCharge = await findAllCharge(data,prisma)

            event.sender.send("/charge/getAll",createdCharge)
        } catch (error) {
            console.error("api/charge /charge/getAll: ",error);
            
        }
    })

    ipcMain.on("/charge/getById",async (event,data) => {
    try {
        const charge = await findChargeById(data,prisma) 
        event.sender.send("/charge/getById",charge)
    } catch (error) {
        console.error("api/charge /charge/getById: ",error);
    }
})

    ipcMain.on("/charge/update",async (event,data) => {
        try {
            const createdCharge = await updateChargeById(data,prisma)

            event.sender.send("/charge/update",createdCharge)
        } catch (error) {
            console.error("api/charge /charge/update: ",error);
            
        }
    })

    ipcMain.on("/charge/delete",async (event,data) => {
        try {
            const createdCharge = await deleteChargeById(data,prisma)

            event.sender.send("/charge/delete",createdCharge)
        } catch (error) {
            console.error("api/charge /charge/delete: ",error);
            
        }
    })

    ipcMain.on("/charge/lastWeek",async (event,data) => {
        try {
            const createdCharge = await getChargesOfLastWeek(data,prisma)

            event.sender.send("/charge/lastWeek",createdCharge)
        } catch (error) {
            console.error("api/charge /charge/lastWeek: ",error);
            
        }
    })
ipcMain.on("/charge/getTotalByDateRange", async (event, data) => {
  try {
    const { entrepriseId, searchParams } = data;
    const total = await getTotalChargesByDateRange({ entrepriseId, searchParams }, prisma);
    event.sender.send("/charge/getTotalByDateRange", total);
  } catch (error) {
    console.error("api/charge /charge/getTotalByDateRange: ", error);
    event.sender.send("/charge/getTotalByDateRange", 0);
  }
});
}