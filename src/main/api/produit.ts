import { ipcMain } from "electron";
import { activateProduct, createProduct, deactivateProduct, deleteProduct, deleteProductPhoto, getActive, getAllForList, getAllForPos, getInactive, getProductByBarcode, getProductById, getProducts, getProductsByCategory, updateProduct } from "../service/produit";

export function ProduitApi(prisma){
    
    ipcMain.on("/produit/create",async (event,data)=>{
        try {
            const createdProduit = await createProduct(data,prisma)

            event.sender.send("/produit/create",createdProduit)
        } catch (error) {
            console.error("api/produit createProduct",error)
        }
    })

    ipcMain.on("/produit/pos/all",async (event,data)=>{
        try {
            const produits = await getAllForPos(data,prisma)

            event.sender.send("/produit/pos/all",produits)

        } catch (error) {
            console.error("api/produit getAllForPos",error);
            
        }
    })

    ipcMain.on("/produit/list/all",async (event,data)=>{
        try {
            const produits = await getAllForList(data,prisma)
            
            event.sender.send("/produit/list/all",produits)

        } catch (error) {
            console.error("api/produit getAllForList",error);
            
        }
    })

    ipcMain.on("/produit/all",async (event,data)=>{
        try {
            const products = await getProducts(data,prisma)

            event.sender.send("/produit/all",products)
        } catch (error) {
            console.error("api/produit /produit/all: ",error);
            
        }
    })

    ipcMain.on("/produit/get", async (event,data)=>{
        try {
            const product = await getProductById(data,prisma)

            event.sender.send("/produit/get",product)
        } catch (error) {
            console.error("api/produit /produit/get: ",error);
            
        }
    })    

    ipcMain.on("/produit/update", async (event,data)=>{
        try {
            const updatedProduct = await updateProduct(data,prisma)

            event.sender.send("/produit/update",updatedProduct)
        } catch (error) {
            console.error("api/produit /produit/update: ",error);
            
        }
    })    

    ipcMain.on("/produit/activate", async (event,data)=>{
        try {
            const updatedProduct = await activateProduct(data,prisma)

            event.sender.send("/produit/activate",updatedProduct)
        } catch (error) {
            console.error("api/produit /produit/activate: ",error);
            
        }
    }) 

    ipcMain.on("/produit/deactivate", async (event,data)=>{
        try {
            const updatedProduct = await deactivateProduct(data,prisma)

            event.sender.send("/produit/deactivate",updatedProduct)
        } catch (error) {
            console.error("api/produit /produit/deactivate: ",error);
            
        }
    }) 

    ipcMain.on("/produit/delete", async (event,data)=>{
        try {
            const deletedProduct = await deleteProduct(data,prisma)

            event.sender.send("/produit/delete",deletedProduct)
        } catch (error) {
            console.error("api/produit /produit/delete: ",error);
            
        }
    }) 

    ipcMain.on("/produit/by-barcode", async (event,data)=>{
        try {
            const produit = await getProductByBarcode(data,prisma)

            event.sender.send("/produit/by-barcode",produit)
        } catch (error) {
            console.error("api/produit /produit/by-barcode: ",error);
            
        }
    }) 

    ipcMain.on("/produit/delete-photo", async (event,data)=>{
        try {
            const produit = await deleteProductPhoto(data,prisma)

            event.sender.send("/produit/delete-photo",produit)
        } catch (error) {
            console.error("api/produit /produit/delete-photo: ",error);
            
        }
    }) 

    ipcMain.on("/produit/by-category", async (event,data)=>{
        try {
            const produits = await getProductsByCategory(data,prisma)

            event.sender.send("/produit/by-category",produits)
        } catch (error) {
            console.error("api/produit /produit/by-category: ",error);
            
        }
    }) 

    ipcMain.on("/produit/list/active", async (event,data)=>{
        try {
            const produits = await getActive(data,prisma)

            event.sender.send("/produit/list/active",produits)
        } catch (error) {
            console.error("api/produit /produit/list/active: ",error);
            
        }
    }) 

    ipcMain.on("/produit/list/inactive", async (event,data)=>{
        try {
            const produits = await getInactive(data,prisma)

            event.sender.send("/produit/list/inactive",produits)
        } catch (error) {
            console.error("api/produit /produit/list/inactive: ",error);
            
        }
    }) 
    
}

