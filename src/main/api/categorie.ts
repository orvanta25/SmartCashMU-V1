
import { ipcMain } from "electron";
import { 
    createCategorie, deleteCategory, 
    getAllCategories, getCategories, 
    getCategoriesFor, updateCategory } from "../service/categorie";



export function CategorieApi(prisma){

    ipcMain.on("/categorie/create",async (event,data)=>{
        try {
            const newCategorie = await createCategorie(data,prisma)
            
            event.sender.send("/categorie/create",{
                data:newCategorie
            })

        } catch (error) {
            console.error("api/categorie create: ",error);
            
        }
    })

    ipcMain.on("/categorie/getAll",async (event,data)=>{
        try {
            const categories = await getCategories(data,prisma)
            
            event.sender.send("/categorie/getAll",categories)

        } catch (error) {
            console.error("api/categorie get: ",error);
        }
    })

    ipcMain.on("/categorie/getAllCategories",async (event,data)=>{
        try {
            const categories = await getAllCategories(data,prisma)
            
            event.sender.send("/categorie/getAllCategories",categories)

        } catch (error) {
            console.error("api/categorie getAllCategories: ",error);
        }
    })

    ipcMain.on("/categorie/update", async(event,data)=>{
        try {
            const updatedCategory = await updateCategory(data,prisma)

            event.sender.send("/categorie/update",updatedCategory)
        } catch (error) {
            console.error("api/categorie updateCategory",error);
        }
    })

    ipcMain.on("/categorie/delete", async(event,data)=>{
        try {
            const deletedCategory = await deleteCategory(data,prisma)

            event.sender.send("/categorie/delete",deletedCategory)
        } catch (error) {
            console.error("api/categorie deleteCategory",error);
        }
    })
    ipcMain.on("/categorie/getForProduct",async(event,data)=>{
        try {
            const categories = await getCategoriesFor(data,prisma)

            event.sender.send("/categorie/getForProduct",categories)
        } catch (error) {
            console.error("api/categorie getCategoriesForProduct",error);
            
        }
    })
    ipcMain.on("/categorie/getForPos",async(event,data)=>{
        try {
            const categories = await getCategoriesFor(data,prisma)

            event.sender.send("/categorie/getForPos",categories)
        } catch (error) {
            console.error("api/categorie getCategoriesForPos",error);
            
        }
    })
}