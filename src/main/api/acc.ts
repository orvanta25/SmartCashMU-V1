//main/api/acc.ts
import { ipcMain } from "electron";
import { createAcc, findAccById, findAllAcc, getAccByProductId, updateAccById } from "../service/acc";
import { getTotalAccMontantByDateRange } from "../service/acc";



export function AccApi(prisma) {
    ipcMain.on("/acc/create/entrepriseId",async(event,data)=>{
        try {
            const createdAcc = await createAcc(data,prisma)

            event.sender.send("/acc/create/entrepriseId",createdAcc)
        } catch (error) {
            console.error("api/acc /acc/create/entrepriseId: ",error);
            
        }
    })

    ipcMain.on("/acc/get/entrepriseId/product/codeBarre",async(event,data)=>{
        try {
            const acc = await getAccByProductId(data,prisma)

            event.sender.send("/acc/get/entrepriseId/product/codeBarre",acc)
        } catch (error) {
            console.error("api/acc /acc/get/entrepriseId/product/codeBarre: ",error);
            
        }
    })

    ipcMain.on("/acc/getAll/entrepriseId",async(event,data)=>{
        try {
            const accs = await findAllAcc(data,prisma)

            event.sender.send("/acc/getAll/entrepriseId",accs)
        } catch (error) {
            console.error("api/acc /acc/getAll/entrepriseId: ",error);
            
        }
    })

    ipcMain.on("/acc/getById/entrepriseId/id",async(event,data)=>{
        try {
            const acc = await findAccById(data,prisma)

            event.sender.send("/acc/getById/entrepriseId/id",acc)
        } catch (error) {
            console.error("api/acc /acc/getById/entrepriseId/id: ",error);
            
        }
    })

    ipcMain.on("/acc/update/entrepriseId/id",async (event,data)=>{
        try {
            const updatedAcc = await updateAccById(data,prisma)

            event.sender.send("/acc/update/entrepriseId/id",updatedAcc)
        } catch (error) {
            console.error("api/acc /acc/update/entrepriseId/id: ",error);
            
        }
    })

   ipcMain.on("/acc/getTotalMontantByDateRange/entrepriseId", async (event, data) => {
    try {
        console.log("📥 Received request for total ACC montant by date range:", data);
        const total = await getTotalAccMontantByDateRange(data, prisma);
        console.log("📤 Sending total ACC montant response:", { total });
        event.sender.send("/acc/getTotalMontantByDateRange/entrepriseId", { total });
    } catch (error) {
        console.error("❌ Error in api/acc /acc/getTotalMontantByDateRange/entrepriseId: ", error);
        event.sender.send("/acc/getTotalMontantByDateRange/entrepriseId", { 
            error: error.message, 
            total: 0 
        });
    }
});
}