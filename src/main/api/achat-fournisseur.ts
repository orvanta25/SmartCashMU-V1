// main/api/achat-fournisseur.ts

import { ipcMain } from 'electron';
import { 
  createAchatFournisseur,
  deleteAchatFournisseur,
  deleteAchatFournisseurPieceJointe, 
  getAchatFournisseurById, 
  getAchatFournisseurs,
  getDepenseOfLastWeek, 
  getTotalAchatOfLastWeek, 
  getUnpaidAchatFournisseurs,
  updateAchatFournisseur,
  getTotalAchatByDateRange,
  getTotalAchatForDate,
  getAchatLast7Days,
  getMonthlyAchatStats
} from '../service/achat-fournisseur';

export function AchatFournisseurApi(prisma) {
  ipcMain.on('/achat-fournisseur/create/entrepriseId', async (event, data) => {
    try {
      const result = await createAchatFournisseur(data, prisma);
      event.sender.send('/achat-fournisseur/create/entrepriseId', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/create/entrepriseId', error);
    }
  });

  ipcMain.on('/achat-fournisseur/getAll/entrepriseId', async (event, data) => {
    try {
      const result = await getAchatFournisseurs(data, prisma);
      event.sender.send('/achat-fournisseur/getAll/entrepriseId', result);
    } catch (error) {
      console.error("\x1b[31m%s\x1b[0m",'/achat-fournisseur/getAll/entrepriseId',error);
    }
  });

  ipcMain.on('/achat-fournisseur/getById/entrepriseId/id', async (event, data) => {
    try {
      const result = await getAchatFournisseurById(data, prisma);
      event.sender.send('/achat-fournisseur/getById/entrepriseId/id', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/getById/entrepriseId/id',error);
    }
  });

  ipcMain.on('/achat-fournisseur/update/entrepriseId/id', async (event, data) => {
    try {
      const result = await updateAchatFournisseur(data, prisma);
      event.sender.send('/achat-fournisseur/update/entrepriseId/id', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/update/entrepriseId/id',error);
    }
  });

  ipcMain.on('/achat-fournisseur/deletePieceJointe/entrepriseId/id', async (event, data) => {
    try {
      const result = await deleteAchatFournisseurPieceJointe(data, prisma);
      event.sender.send('/achat-fournisseur/deletePieceJointe/entrepriseId/id', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/deletePieceJointe/entrepriseId/id',error);
    }
  });

  ipcMain.on('/achat-fournisseur/getUnpaid/entrepriseId', async (event, data) => {
    try {
      const result = await getUnpaidAchatFournisseurs(data, prisma);
      event.sender.send('/achat-fournisseur/getUnpaid/entrepriseId', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/getUnpaid/entrepriseId',error);
    }
  });

  ipcMain.on('/achat-fournisseur/delete/entrepriseId/id', async (event, data) => {
    try {
      const result = await deleteAchatFournisseur(data, prisma);
      event.sender.send('/achat-fournisseur/delete/entrepriseId/id', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/delete/entrepriseId/id',error);
    }
  });

  ipcMain.on('/achat-fournisseur/last-week/depense/entrepriseId', async (event, data) => {
    try {
      const result = await getDepenseOfLastWeek(data, prisma);
      event.sender.send('/achat-fournisseur/last-week/depense/entrepriseId', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/last-week/depense/entrepriseId',error);
    }
  });

  ipcMain.on('/achat-fournisseur/last-week-total/achat/entrepriseId', async (event, data) => {
    try {
      const result = await getTotalAchatOfLastWeek(data, prisma);
      event.sender.send('/achat-fournisseur/last-week-total/achat/entrepriseId', result);
    } catch (error: any) {
      event.sender.send('/achat-fournisseur/last-week-total/achat/entrepriseId',error);
    }
  });

  ipcMain.on('/achat-fournisseur/total-by-date-range/entrepriseId', async (event, data) => {
    try {
      const result = await getTotalAchatByDateRange(data, prisma);
      event.sender.send('/achat-fournisseur/total-by-date-range/entrepriseId', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/achat-fournisseur/total-by-date-range/entrepriseId', error);
      event.sender.send('/achat-fournisseur/total-by-date-range/entrepriseId', { error: error.message });
    }
  });

  ipcMain.on('/achat-fournisseur/total-for-date/entrepriseId', async (event, data) => {
    try {
      const result = await getTotalAchatForDate(data, prisma);
      event.sender.send('/achat-fournisseur/total-for-date/entrepriseId', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/achat-fournisseur/total-for-date/entrepriseId', error);
      event.sender.send('/achat-fournisseur/total-for-date/entrepriseId', { error: error.message });
    }
  });

  ipcMain.on('/achat-fournisseur/last-7-days/entrepriseId', async (event, data) => {
    try {
      const result = await getAchatLast7Days(data, prisma);
      event.sender.send('/achat-fournisseur/last-7-days/entrepriseId', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/achat-fournisseur/last-7-days/entrepriseId', error);
      event.sender.send('/achat-fournisseur/last-7-days/entrepriseId', { error: error.message });
    }
  });

  ipcMain.on('/achat-fournisseur/monthly-stats/entrepriseId', async (event, data) => {
    try {
      const result = await getMonthlyAchatStats(data, prisma);
      event.sender.send('/achat-fournisseur/monthly-stats/entrepriseId', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/achat-fournisseur/monthly-stats/entrepriseId', error);
      event.sender.send('/achat-fournisseur/monthly-stats/entrepriseId', { error: error.message });
    }
  });
}