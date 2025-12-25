import { ipcMain } from 'electron';

import { createFacture, deleteFacture,
     getFactureById, 
     getFactures,
     getFacturesByType,
      getNextFactureNum, 
     getVentesByFactureId,
    

 } from '../service/facture';
export function FactureApi(prisma) {

ipcMain.on('/facture/create', async (event, data) => {
  try {
    const result = await createFacture(data, prisma);
    event.sender.send('/facture/create', result);
  } catch (error: any) {
    console.error('api/facture /facture/create: ', error);
    event.sender.send('/facture/create', { error: error.message });
  }
});

ipcMain.on('/facture/getAll', async (event, data) => {
  try {
    const result = await getFactures(data, prisma);
    event.sender.send('/facture/getAll', { factures: result });
  } catch (error: any) {
    console.error('api/facture /facture/getAll: ', error);
    event.sender.send('/facture/getAll', { error: error.message });
  }
});

ipcMain.on('/facture/getByType', async (event, data) => {
  try {
    const result = await getFacturesByType(data, prisma);
    event.sender.send('/facture/getByType', { factures: result });
  } catch (error: any) {
    console.error('api/facture /facture/getByType: ', error);
    event.sender.send('/facture/getByType', { error: error.message });
  }
});

ipcMain.on('/facture/getById', async (event, data) => {
  try {
    const result = await getFactureById(data, prisma);
    event.sender.send('/facture/getById', result);
  } catch (error: any) {
    console.error('api/facture /facture/getById: ', error);
    event.sender.send('/facture/getById', { error: error.message });
  }
});

ipcMain.on('/facture/getVentes', async (event, data) => {
  try {
    const result = await getVentesByFactureId(data, prisma);
    event.sender.send('/facture/getVentes', { ventes: result });
  } catch (error: any) {
    console.error('api/facture /facture/getVentes: ', error);
    event.sender.send('/facture/getVentes', { error: error.message });
  }
});

// ipcMain.on('/facture/update', async (event, data: { entrepriseId: string; id: string; dto: UpdateFactureDto }) => {
//   try {
//     const result = await updateFacture(data, prisma);
//     event.sender.send('/facture/update', result);
//   } catch (error: any) {
//     console.error('api/facture /facture/update: ', error);
//     event.sender.send('/facture/update', { error: error.message });
//   }
// });

ipcMain.on('/facture/delete', async (event, data) => {
  try {
    const result = await deleteFacture(data, prisma);
    event.sender.send('/facture/delete', result);
  } catch (error: any) {
    console.error('api/facture /facture/delete: ', error);
    event.sender.send('/facture/delete', { error: error.message });
  }
});

ipcMain.on('/facture/nextNum', async (event, data) => {
  try {
    const result = await getNextFactureNum(data, prisma);
    event.sender.send('/facture/nextNum', result);
  } catch (error: any) {
    console.error('api/facture /facture/nextNum: ', error);
    event.sender.send('/facture/nextNum', { error: error.message });
  }
});
    
}