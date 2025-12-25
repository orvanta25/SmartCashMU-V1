import { ipcMain } from 'electron';
import { createClotureJour, getClotures, getClotureById } from '../service/cloture-jour';

export function ClotureJourApi(prisma) {
  ipcMain.on('/cloture-jour/create', async (event, data) => {
    try {
      const result = await createClotureJour(data, prisma);
      event.sender.send('/cloture-jour/create', result);
    } catch (error: any) {
      event.sender.send('/cloture-jour/create', { error: error.message });
    }
  });

  ipcMain.on('/cloture-jour/getAll', async (event, data) => {
    try {
      const result = await getClotures(data, prisma);
      event.sender.send('/cloture-jour/getAll', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/cloture-jour/getAll', error);
      event.sender.send('/cloture-jour/getAll', { error: error.message });
    }
  });

  ipcMain.on('/cloture-jour/getById', async (event, id) => {
    try {
      const result = await getClotureById(id, prisma);
      event.sender.send('/cloture-jour/getById', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/cloture-jour/getById', error);
      event.sender.send('/cloture-jour/getById', { error: error.message });
    }
  });
}