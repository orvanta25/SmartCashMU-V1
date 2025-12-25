// controllers/produit.controller.ts
import { Request, Response } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  activateProduct,
  deactivateProduct,
  deleteProduct,
  getProductByBarcode,
  deleteProductPhoto,
  getAllForList,
  getActive,
  getInactive,
  getAllForPos,
  getProductsByCategory,
} from "../service/produit"; // Adjust path

export function ProduitController(app: any, prisma: any) {
  const base = "";

  // CREATE - POST /api/produit/entreprise/:entrepriseId
  app.post(`${base}/produit/entreprise/:entrepriseId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const formData = req.body;

      const createdProduit = await createProduct({ entrepriseId, formData }, prisma);
      res.status(201).json(createdProduit);
    } catch (error: any) {
      console.error("POST /produit/create error:", error);
      res.status(400).json({ success: false, error: error.message || "Failed to create product" });
    }
  });

  // GET ALL (simple list) - GET /api/produit/entreprise/:entrepriseId/all
  app.get(`${base}/produit/entreprise/:entrepriseId/all`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const products = await getProducts({ entrepriseId }, prisma);
      res.json(products);
    } catch (error: any) {
      console.error("GET /produit/all error:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // GET BY ID - GET /api/produit/entreprise/:entrepriseId/:productId
  app.get(`${base}/produit/entreprise/:entrepriseId/:productId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const product = await getProductById({ entrepriseId, productId }, prisma);
      if (!product) return res.status(404).json({ success: false, error: "Product not found" });
      return res.json(product);
    } catch (error: any) {
      console.error("GET /produit/get error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // UPDATE - PATCH /api/produit/entreprise/:entrepriseId/:productId
  app.patch(`${base}/produit/entreprise/:entrepriseId/:productId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const formData = req.body;

      const updatedProduct = await updateProduct({ entrepriseId, productId, formData }, prisma);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("PATCH /produit/update error:", error);
      res.status(400).json({ success: false, error: error.message || "Update failed" });
    }
  });

  // ACTIVATE - PATCH /api/produit/entreprise/:entrepriseId/:productId/activate
  app.patch(`${base}/produit/entreprise/:entrepriseId/:productId/activate`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const result = await activateProduct({ entrepriseId, productId }, prisma);
      res.json(result);
    } catch (error: any) {
      console.error("PATCH /produit/activate error:", error);
      res.status(400).json({ success: false, error: "Activation failed" });
    }
  });

  // DEACTIVATE
  app.patch(`${base}/produit/entreprise/:entrepriseId/:productId/deactivate`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const result = await deactivateProduct({ entrepriseId, productId }, prisma);
      res.json(result);
    } catch (error: any) {
      console.error("PATCH /produit/deactivate error:", error);
      res.status(400).json({ success: false, error: "Deactivation failed" });
    }
  });

  // DELETE
  app.delete(`${base}/produit/entreprise/:entrepriseId/:productId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const result = await deleteProduct({ entrepriseId, productId }, prisma);
      res.json(result);
    } catch (error: any) {
      console.error("DELETE /produit/delete error:", error);
      res.status(400).json({ success: false, error: "Delete failed" });
    }
  });

  // GET BY BARCODE - GET /api/produit/entreprise/:entrepriseId/barcode/:codeBarre
  app.get(`${base}/produit/entreprise/:entrepriseId/barcode/:codeBarre`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, codeBarre } = req.params;
      const produit = await getProductByBarcode({ entrepriseId, codeBarre }, prisma);
      if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
      return res.json(produit);
    } catch (error: any) {
      console.error("GET /produit/by-barcode error:", error);
      return res.status(404).json({ message: "Produit non trouvé" });
    }
  });

  // DELETE PHOTO
  app.delete(`${base}/produit/entreprise/:entrepriseId/:productId/photo`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, productId } = req.params;
      const result = await deleteProductPhoto({ entrepriseId, productId }, prisma);
      res.json(result);
    } catch (error: any) {
      console.error("DELETE /produit/delete-photo error:", error);
      res.status(400).json({ success: false, error: "Failed to delete photo" });
    }
  });

  // LIST ALL (paginated) - GET /api/produit/entreprise/:entrepriseId/list/all
  app.get(`${base}/produit/entreprise/:entrepriseId/list/all`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const { page = "1", limit = "8", search = "" } = req.query;
      const data = await getAllForList(
        { entrepriseId, page: +page, limit: +limit, search: search as string },
        prisma
      );
      res.json(data);
    } catch (error: any) {
      console.error("GET /produit/list/all error:", error);
      res.status(500).json({ success: false });
    }
  });

  // LIST ACTIVE
  app.get(`${base}/produit/entreprise/:entrepriseId/list/active`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const { page = "1", limit = "8", search = "" } = req.query;
      const data = await getActive(
        { entrepriseId, page: +page, limit: +limit, search: search as string },
        prisma
      );
      res.json(data);
    } catch (error) {
      console.error("GET /produit/list/active error:", error);
      res.status(500).json({ success: false });
    }
  });

  // LIST INACTIVE
  app.get(`${base}/produit/entreprise/:entrepriseId/list/inactive`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const { page = "1", limit = "8", search = "" } = req.query;
      const data = await getInactive(
        { entrepriseId, page: +page, limit: +limit, search: search as string },
        prisma
      );
      res.json(data);
    } catch (error) {
      console.error("GET /produit/list/inactive error:", error);
      res.status(500).json({ success: false });
    }
  });

  // POS PRODUCTS
  app.get(`${base}/produit/entreprise/:entrepriseId/pos`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId } = req.params;
      const { page = "1", limit = "18", search = "" } = req.query;
      const data = await getAllForPos(
        { entrepriseId, page: +page, limit: +limit, search: search as string },
        prisma
      );
      res.json(data);
    } catch (error) {
      console.error("GET /produit/pos/all error:", error);
      res.status(500).json({ success: false });
    }
  });

  // BY CATEGORY (for POS)
  app.get(`${base}/produit/entreprise/:entrepriseId/category/:categorieId`, async (req: Request, res: Response) => {
    try {
      const { entrepriseId, categorieId } = req.params;
      const { page = "1", limit = "18", search = "" } = req.query;
      const data = await getProductsByCategory(
        { entrepriseId, categorieId, page: +page, limit: +limit, search: search as string },
        prisma
      );
      res.json(data);
    } catch (error) {
      console.error("GET /produit/by-category error:", error);
      res.status(500).json({ success: false });
    }
  });
}
