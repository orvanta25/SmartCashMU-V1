// controllers/acc.controller.ts
import { Request, Response } from "express";
import {
  getAccByProductId,
  createAcc,
  findAllAcc,
  findAccById,
  updateAccById,
} from "../service/acc"; // Adjust path as needed

// DTOs (import your actual types)
import type {
  CreateAccDto,
  UpdateAccDto,
  SearchAccDto,
} from "../model/acc";

export function AccController(app: any, prisma: any) {
  const base = ""; // Change if your API has a different prefix

  // 1. Get ACCs by product barcode
  // GET /api/acc/entreprise/:entrepriseId/product/:codeBarre
  app.get(
    `${base}/acc/entreprise/:entrepriseId/product/:codeBarre`,
    async (req: Request, res: Response) => {
      try {
        const { entrepriseId, codeBarre } = req.params;
        const searchParams: SearchAccDto = req.query as any; // query string for filtering

        const result = await getAccByProductId(
          {entrepriseId,
          codeBarre,
          searchParams},
          prisma
        );

        res.json(result);
      } catch (err: any) {
        console.error("GET /acc/entreprise/:id/product/:codeBarre error:", err);
        res
          .status(500)
          .json({ success: false, error: err.message || "Server error" });
      }
    }
  );

  // 2. Create new ACC
  // POST /api/acc/entreprise/:entrepriseId
  app.post(
    `${base}/acc/entreprise/:entrepriseId`,
    async (req: Request, res: Response) => {
      try {
        const { entrepriseId } = req.params;
        const dto: CreateAccDto = req.body;

        const newAcc = await createAcc({entrepriseId, dto}, prisma);

        res.status(201).json(newAcc);
      } catch (err: any) {
        console.error("POST /acc/entreprise/:id error:", err);
        res
          .status(400)
          .json({ success: false, error: err.message || "Failed to create ACC" });
      }
    }
  );

  // 3. Get all ACCs for entreprise (with optional search/filter)
  // GET /api/acc/entreprise/:entrepriseId
  app.get(
    `${base}/acc/entreprise/:entrepriseId`,
    async (req: Request, res: Response) => {
      try {
        const { entrepriseId } = req.params;
        const searchParams: SearchAccDto = req.query as any;

        const accList = await findAllAcc({entrepriseId, searchParams}, prisma);

        res.json(accList);
      } catch (err: any) {
        console.error("GET /acc/entreprise/:id error:", err);
        res
          .status(500)
          .json({ success: false, error: err.message || "Server error" });
      }
    }
  );

  // 4. Get single ACC by ID
  // GET /api/acc/entreprise/:entrepriseId/:id
  app.get(
    `${base}/acc/entreprise/:entrepriseId/:id`,
    async (req: Request, res: Response) => {
      try {
        const { entrepriseId, id } = req.params;

        const acc = await findAccById({entrepriseId, id}, prisma);

        if (!acc) {
          return res.status(404).json({ success: false, error: "ACC not found" });
        }

        return res.json(acc);
      } catch (err: any) {
        console.error("GET /acc/entreprise/:id/:accId error:", err);
        return res
          .status(500)
          .json({ success: false, error: err.message || "Server error" });
      }
    }
  );

  // 5. Update ACC by ID
  // PATCH /api/acc/entreprise/:entrepriseId/:id
  app.patch(
    `${base}/acc/entreprise/:entrepriseId/:id`,
    async (req: Request, res: Response) => {
      try {
        const { entrepriseId, id } = req.params;
        const dto: UpdateAccDto = req.body;

        const updatedAcc = await updateAccById({entrepriseId, id, dto}, prisma);

        res.json(updatedAcc);
      } catch (err: any) {
        console.error("PATCH /acc/entreprise/:id/:accId error:", err);
        res
          .status(400)
          .json({ success: false, error: err.message || "Failed to update ACC" });
      }
    }
  );

  // Optional: DELETE route (if needed later)
  // app.delete(`${base}/acc/entreprise/:entrepriseId/:id`, async (req: Request, res: Response) => { ... });
}
