import { ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

export function CaisseApi(prisma: PrismaClient) {
  
  // Récupérer toutes les caisses
  ipcMain.handle('caisse:getAll', async () => {
    try {
      const caisses = await prisma.caisse.findMany({
        where: { isActive: true },
        orderBy: [
          { isCentral: 'desc' },
          { createdAt: 'desc' }
        ]
      });
      return { success: true, data: caisses };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Récupérer une caisse par ID
  ipcMain.handle('caisse:getById', async (_, id: string) => {
    try {
      const caisse = await prisma.caisse.findUnique({
        where: { id }
      });
      
      if (!caisse) {
        return { success: false, error: 'Caisse introuvable' };
      }
      
      return { success: true, data: caisse };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Créer une caisse
  ipcMain.handle('caisse:create', async (_, data) => {
    try {
      // Si centrale, retirer le statut des autres
      if (data.isCentral) {
        await prisma.caisse.updateMany({
          where: { isCentral: true },
          data: { isCentral: false }
        });
      }

      const caisse = await prisma.caisse.create({
        data: {
          ...data,
          status: 'offline'
        }
      });
      
      return { success: true, data: caisse };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Modifier une caisse
  ipcMain.handle('caisse:update', async (_, { id, data }) => {
    try {
      // Si centrale, retirer le statut des autres
      if (data.isCentral) {
        await prisma.caisse.updateMany({
          where: { 
            isCentral: true,
            id: { not: id }
          },
          data: { isCentral: false }
        });
      }

      const caisse = await prisma.caisse.update({
        where: { id },
        data
      });
      
      return { success: true, data: caisse };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Supprimer une caisse
  ipcMain.handle('caisse:delete', async (_, id: string) => {
    try {
      const caisse = await prisma.caisse.findUnique({
        where: { id }
      });

      if (caisse?.isCentral) {
        return { success: false, error: 'Impossible de supprimer une caisse centrale' };
      }

      await prisma.caisse.update({
        where: { id },
        data: { isActive: false }
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Tester la connexion
  ipcMain.handle('caisse:test', async (_, caisseId: string) => {
    try {
      const caisse = await prisma.caisse.findUnique({
        where: { id: caisseId }
      });

      if (!caisse) {
        return { success: false, error: 'Caisse introuvable' };
      }

      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`http://${caisse.ip}:${caisse.port}/health`, {
          signal: controller.signal
        });

        clearTimeout(timeout);
        const latency = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          
          await prisma.caisse.update({
            where: { id: caisseId },
            data: {
              status: 'online',
              lastSync: new Date(),
              version: data.version
            }
          });

          return {
            success: true,
            data: {
              status: 'online',
              version: data.version,
              latency
            }
          };
        }

        await prisma.caisse.update({
          where: { id: caisseId },
          data: { status: 'offline' }
        });

        return {
          success: true,
          data: { status: 'offline' }
        };
      } catch (fetchError) {
        clearTimeout(timeout);
        
        await prisma.caisse.update({
          where: { id: caisseId },
          data: { status: 'offline' }
        });

        return {
          success: true,
          data: { status: 'offline' }
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Définir comme centrale
  ipcMain.handle('caisse:setCentral', async (_, id: string) => {
    try {
      await prisma.caisse.updateMany({
        where: { isCentral: true },
        data: { isCentral: false }
      });

      const caisse = await prisma.caisse.update({
        where: { id },
        data: { isCentral: true }
      });

      return { success: true, data: caisse };
    } catch (error: any) {
       console.error('❌ [CAISSE API] Erreur getAll:', error);
      console.error('❌ Détails:', error.message, error.stack);
      return { success: false, error: error.message };
    }
  });

  // Retirer statut central
  ipcMain.handle('caisse:removeCentral', async () => {
    try {
      await prisma.caisse.updateMany({
        where: { isCentral: true },
        data: { isCentral: false }
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
    console.log('✅ [CAISSE API] Tous les handlers enregistrés');

}
