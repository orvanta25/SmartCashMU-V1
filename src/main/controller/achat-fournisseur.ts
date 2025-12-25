import { Request, Response } from "express";
import { SearchAchatFournisseurDto } from "../model/achat-fournisseur";
import { getAchatFournisseurs } from "../service/achat-fournisseur";

export function AchatFournisseurController(app,prisma) {
    app.get("/achat-fournisseur/entreprise/:entrepriseId",async (req:Request,res:Response) => {
        try {
              const { entrepriseId } = req.params;
              const { dateDebut, dateFin } = req.query as SearchAchatFournisseurDto;
            console.log("req.query",req.query)
            console.log("req.body",req.body)
              
        
              const achats = await getAchatFournisseurs({ entrepriseId, params:{dateDebut,dateFin}}, prisma);
              res.json(achats);
            } catch (error: any) {
              console.error("GET /achat-fournisseur/entreprise/:entrepriseId error:", error);
              res.status(500).json({ success: false, error: error || "Failed to fetch achatsFournisseur" });
            }
    })
}