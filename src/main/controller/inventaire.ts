import { Request, Response } from "express";
import {getAllInventory,createInventory,updateInventorById} from "../service/inventaire"
import { InventoryForm, SearchFilters, UpdateInventory } from "../model/inventaire";
export function InventoryController(app, prisma) {
  const base = "";

  // GET /api/inventaire/entreprise/:entrepriseId
  // → Get all inventory with optional filters (query params)
  app.get(`${base}/inventaire/entreprise/:entrepriseId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const { searchQuery, dateDebut, dateFin } = req.query as SearchFilters;
	console.log("req.query",req.query)
	console.log("req.body",req.body)
      

      const inventory = await getAllInventory({ entrepriseId, dto:{searchQuery,dateDebut,dateFin}}, prisma);
      res.json(inventory);
    } catch (error: any) {
      console.error("GET /inventaire/entreprise/:entrepriseId error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch inventory" });
    }
  });

  // POST /api/inventaire/entreprise/:entrepriseId
  // → Create new inventory entry
  app.post(`${base}/inventaire/entreprise/:entrepriseId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const formData: InventoryForm = req.body;

      if (!formData.codeBarre || formData.quantity === undefined) {
        return res.status(400).json({ success: false, error: "codeBarre et quantite sont requis" });
      }

      const created = await createInventory({ entrepriseId, dto:{...formData} }, prisma);
      return res.status(201).json(created);
    } catch (error: any) {
      console.error("POST /inventaire/entreprise/:entrepriseId error:", error);
      return res.status(400).json({ success: false, error: error.message || "Failed to create inventory entry" });
    }
  });

  // PATCH /api/inventaire/entreprise/:entrepriseId/:id
  // → Update responsable or quantity
  app.patch(`${base}/inventaire/entreprise/:entrepriseId/:id`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, id } = req.params;
      const updateData: UpdateInventory = req.body;

      if (!updateData.responsable && updateData.quantite === undefined) {
        return res.status(400).json({ success: false, error: "Aucun champ à mettre à jour" });
      }

      const updated = await updateInventorById({ entrepriseId, id, dto:{...updateData} }, prisma);
      return res.json(updated);
    } catch (error: any) {
      console.error("PATCH /inventaire/entreprise/:entrepriseId/:id error:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ success: false, error: "Article non trouvé" });
      }
      return res.status(500).json({ success: false, error: error.message || "Failed to update inventory" });
    }
  });
}

