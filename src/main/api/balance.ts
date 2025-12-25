import { ipcMain } from 'electron';
import { createBalanceConfig, deleteBalanceConfig, getAllBalanceConfigs, getBalanceConfigByCode, getBalanceConfigById, updateBalanceConfig } from '../service/balance';


export function BalanceApi(prisma) {


ipcMain.on('/balance/create', async (event, data) => {
  try {
    const result = await createBalanceConfig(data, prisma);
    event.sender.send('/balance/create', result);
  } catch (error: any) {
    console.error('api/balance /balance/create: ', error);
    event.sender.send('/balance/create', { error: error });
  }
});

ipcMain.on('/balance/getAll', async (event, data) => {
  try {
    const result = await getAllBalanceConfigs(data, prisma);
    event.sender.send('/balance/getAll', result);
  } catch (error: any) {
    console.error('api/balance /balance/getAll: ', error);
    event.sender.send('/balance/getAll', { error: error });
  }
});

ipcMain.on('/balance/getById', async (event, data) => {
  try {
    const result = await getBalanceConfigById(data, prisma);
    event.sender.send('/balance/getById', result);
  } catch (error: any) {
    console.error('api/balance /balance/getById: ', error);
    event.sender.send('/balance/getById', { error: error });
  }
});

ipcMain.on('/balance/getByCode', async (event, data) => {
  try {
    const result = await getBalanceConfigByCode(data, prisma);
    event.sender.send('/balance/getByCode', result);
  } catch (error: any) {
    console.error('api/balance /balance/getByCode: ', error);
    event.sender.send('/balance/getByCode', { error: error });
  }
});

ipcMain.on('/balance/update', async (event, data) => {
  try {
    const result = await updateBalanceConfig(data, prisma);
    event.sender.send('/balance/update', result);
  } catch (error: any) {
    console.error('api/balance /balance/update: ', error);
    event.sender.send('/balance/update', { error: error });
  }
});

ipcMain.on('/balance/delete', async (event, data) => {
  try {
    const result = await deleteBalanceConfig(data, prisma);
    event.sender.send('/balance/delete', result);
  } catch (error: any) {
    console.error('api/balance /balance/delete: ', error);
    event.sender.send('/balance/delete', { error: error });
  }
});
}