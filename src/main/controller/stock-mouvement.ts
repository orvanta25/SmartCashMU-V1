import { Request, Response } from "express";
import { getInventoryByParams } from "../service/stock-mouvement";
import { MovementStockSearchFilters } from "../model/inventaire";

export function StockMouvementController(app,prisma){
    app.get("/stockmouvement/:entrepriseId",async (req:Request,res:Response) => {
        try {
            const {entrepriseId} = req.params 

            console.log(req.query)
            const {
                codeBarre,
                designation,
                dateDebut,
                dateFin
            } = req.query as unknown as MovementStockSearchFilters

            const stocks = await getInventoryByParams({entrepriseId,dto:{codeBarre,designation,dateDebut,dateFin}},prisma)

            return res.status(201).json({stocks})
            
        } catch (error) {
            console.error("controller/stockmouvement : "+error);
            return res.status(500).json({error:"controller/stockmouvement : "+error})
        }
    })
}