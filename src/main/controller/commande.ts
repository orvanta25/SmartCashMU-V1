import { Request, Response } from "express";
import { getCommandes } from "../service/commande";
import { SearchCommandeDto } from "../model/commande";

export function CommandeController(app,prisma){
    app.get("/commande/entreprise/:entreprise",async (req:Request,res:Response) => {
        try {
              const { entrepriseId } = req.params;
              const { dateDebut, dateFin } = req.query as SearchCommandeDto;
        
              const commandes = await getCommandes({ entrepriseId, searchParams:{dateDebut,dateFin}}, prisma);
              res.json(commandes);
            } catch (error: any) {
              console.error("GET /commande/entreprise/:entrepriseId error:", error);
              res.status(500).json({ success: false, error: error || "Failed to fetch commandes" });
            }
    })
}