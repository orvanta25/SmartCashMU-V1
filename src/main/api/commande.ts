import { ipcMain } from 'electron';
import { createCommande, createCommandeForTable, getCommandeByTableId, getCommandes, getCommandesByUserAll, getCommandesByUserAndDateRange, getCommandesByUserDateRange, getCommandesByUserToday, getCommandesOfLastWeek, updateCommande } from '../service/commande';


export function CommandeApi(prisma,ses){

ipcMain.on('/commande/create', async (event, data) => {
  try {
    const result = await createCommande(data, prisma,ses);
    event.sender.send('/commande/create', result);
  } catch (error: any) {
    console.error('api/commande /commande/create: ', error);
    event.sender.send('/commande/create', { error: error.message });
  }
});

ipcMain.on('/commande/createForTable', async (event, data) => {
  try {
    const result = await createCommandeForTable(data, prisma,ses);
    event.sender.send('/commande/createForTable', result);
  } catch (error: any) {
    console.error('api/commande /commande/createForTable: ', error);
    event.sender.send('/commande/createForTable', { error: error.message });
  }
});

ipcMain.on('/commande/getAll', async (event, data) => {
  try {
    const result = await getCommandes(data, prisma);
    event.sender.send('/commande/getAll', result);
  } catch (error: any) {
    console.error('api/commande /commande/getAll: ', error);
    event.sender.send('/commande/getAll', { error: error.message });
  }
});

ipcMain.on('/commande/getByTable', async (event, data) => {
  try {
    const result = await getCommandeByTableId(data, prisma);
    event.sender.send('/commande/getByTable', { commande: result });
  } catch (error: any) {
    console.error('api/commande /commande/getByTable: ', error);
    event.sender.send('/commande/getByTable', { error: error.message });
  }
});

ipcMain.on('/commande/update', async (event, data) => {
  try {
    const result = await updateCommande(data, prisma);
    event.sender.send('/commande/update', result);
  } catch (error: any) {
    console.error('api/commande /commande/update: ', error);
    event.sender.send('/commande/update', { error: error.message });
  }
});

ipcMain.on('/commande/byUserToday', async (event, data) => {
  try {
    const result = await getCommandesByUserToday(data, prisma);
    event.sender.send('/commande/byUserToday', result);
  } catch (error: any) {
    console.error('api/commande /commande/byUserToday: ', error);
    event.sender.send('/commande/byUserToday', { error: error.message });
  }
});

ipcMain.on('/commande/byUserAll', async (event, data) => {
  try {
    const result = await getCommandesByUserAll(data, prisma);
    event.sender.send('/commande/byUserAll', result);
  } catch (error: any) {
    console.error('api/commande /commande/byUserAll: ', error);
    event.sender.send('/commande/byUserAll', { error: error.message });
  }
});

ipcMain.on('/commande/byUserDateRange', async (event, data) => {
  try {
    const result = await getCommandesByUserDateRange(data, prisma);
    event.sender.send('/commande/byUserDateRange', result);
  } catch (error: any) {
    console.error('api/commande /commande/byUserDateRange: ', error);
    event.sender.send('/commande/byUserDateRange', { error: error.message });
  }
});

ipcMain.on('/commande/byUserAndDateRange', async (event, data) => {
  try {
    const result = await getCommandesByUserAndDateRange(data, prisma);
    event.sender.send('/commande/byUserAndDateRange', result);
  } catch (error: any) {
    console.error('api/commande /commande/byUserAndDateRange: ', error);
    event.sender.send('/commande/byUserAndDateRange', { error: error.message });
  }
});

ipcMain.on('/commande/lastWeek', async (event, data) => {
  try {
    const result = await getCommandesOfLastWeek(data, prisma);
    event.sender.send('/commande/lastWeek', result);
  } catch (error: any) {
    console.error('api/commande /commande/lastWeek: ', error);
    event.sender.send('/commande/lastWeek', { error: error.message });
  }
});
}