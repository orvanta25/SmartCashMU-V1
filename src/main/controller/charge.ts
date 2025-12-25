import { Request, Response } from "express";
import { SearchChargeDto } from "../model/charge";
import { findAllCharge } from "../service/charge";

export function ChargeController(app,prisma) {
    app.get("/charge/entreprise/:entrepriseId",async (req:Request,res:Response) => {
        try {
              const { entrepriseId } = req.params;
              const { statut,orderBy,orderDirection } = req.query as SearchChargeDto;
            console.log("charge param: ",req.query)
              const charges = await findAllCharge({ entrepriseId, searchParams:{statut,orderBy,orderDirection}}, prisma);
              res.json(charges);
            } catch (error: any) {
              console.error("GET /charge/entreprise/:entrepriseId error:", error);
              res.status(500).json({ success: false, error: error || "Failed to fetch charges" });
            }
    })
}