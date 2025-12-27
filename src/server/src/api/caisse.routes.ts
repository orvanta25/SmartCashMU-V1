
import { Router } from 'express';
import { CaisseService } from '../service/caisse.service';
import { PrismaClient } from '@prisma/client';

export function createCaisseRoutes(prisma: PrismaClient) {
  const router = Router();
  const caisseService = new CaisseService(prisma);

  // GET /api/caisses - Liste toutes les caisses
  router.get('/', async (req, res) => {
    try {
      const caisses = await caisseService.getAllCaisses();
      res.json(caisses);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // GET /api/caisses/:id - Détails d'une caisse
  router.get('/:id', async (req, res) => {
    try {
      const caisse = await caisseService.getCaisseById(req.params.id);
      res.json(caisse);
    } catch (error) {
      res.status(404).json({ error: 'Caisse introuvable' });
    }
  });

  // POST /api/caisses - Créer une caisse
  router.post('/', async (req, res) => {
    try {
      const caisse = await caisseService.createCaisse(req.body);
      res.status(201).json(caisse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/caisses/:id - Modifier une caisse
  router.put('/:id', async (req, res) => {
    try {
      const caisse = await caisseService.updateCaisse(req.params.id, req.body);
      res.json(caisse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/caisses/:id - Supprimer une caisse
  router.delete('/:id', async (req, res) => {
    try {
      await caisseService.deleteCaisse(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/caisses/:id/test - Tester connexion
  router.post('/:id/test', async (req, res) => {
    try {
      const result = await caisseService.testCaisseConnection(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Erreur test connexion' });
    }
  });

  // POST /api/caisses/:id/set-central - Définir comme centrale
  router.post('/:id/set-central', async (req, res) => {
    try {
      const caisse = await caisseService.setCentralCaisse(req.params.id);
      res.json(caisse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/caisses/remove-central - Retirer statut central
  router.post('/remove-central', async (req, res) => {
    try {
      await caisseService.removeCentralStatus();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  return router;
}