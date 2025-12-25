import { ipcMain } from 'electron';
import { generateRapportCaissier, generateRapportCaissierUnique } from '../service/rapport-caissier';

export function RapportCaissierApi(prisma) {
  ipcMain.on('/rapport-caissier/generate', async (event, data) => {
    try {
      const result = await generateRapportCaissier(data, prisma);
      event.sender.send('/rapport-caissier/generate', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/rapport-caissier/generate', error);
      event.sender.send('/rapport-caissier/generate', { error: error.message });
    }
  });

  ipcMain.on('/rapport-caissier/generateUnique', async (event, data) => {
    try {
      const result = await generateRapportCaissierUnique(data, prisma);
      event.sender.send('/rapport-caissier/generateUnique', result);
    } catch (error: any) {
      console.error("\x1b[31m%s\x1b[0m", '/rapport-caissier/generateUnique', error);
      event.sender.send('/rapport-caissier/generateUnique', { error: error.message });
    }
  });
}