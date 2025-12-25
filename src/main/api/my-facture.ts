import { ipcMain } from 'electron';
import { createMyFacture, deleteMyFacture, getMyFacture, updateMyFacture } from '../service/my-facture';
// import { addAddress, createMyFacture, deleteMyFacture, deleteMyFactureLogo, getMyFacture, removeAddress, updateMyFacture } from '../service/my-facture';

export function MyFactureApi(prisma) {
    


ipcMain.on('/my-facture/create', async (event, data) => {
  try {
    const result = await createMyFacture(data, prisma);
    event.sender.send('/my-facture/create', result);
  } catch (error: any) {
    console.error('api/myFacture /my-facture/create: ', error);
    event.sender.send('/my-facture/create', { error: error.message });
  }
});

ipcMain.on('/my-facture/get', async (event, data: { entrepriseId: string }) => {
  try {
    const result = await getMyFacture(data, prisma);
    event.sender.send('/my-facture/get', result);
  } catch (error: any) {
    console.error('api/myFacture /my-facture/get: ', error);
    event.sender.send('/my-facture/get', { error: error.message });
  }
});

ipcMain.on('/my-facture/update', async (event, data) => {
  try {
    const result = await updateMyFacture(data, prisma);
    event.sender.send('/my-facture/update', result);
  } catch (error: any) {
    console.error('api/myFacture /my-facture/update: ', error);
    event.sender.send('/my-facture/update', { error: error.message });
  }
});

ipcMain.on('/my-facture/delete', async (event, data: { entrepriseId: string; id: string }) => {
  try {
    const result = await deleteMyFacture(data, prisma);
    event.sender.send('/my-facture/delete', result);
  } catch (error: any) {
    console.error('api/myFacture /my-facture/delete: ', error);
    event.sender.send('/my-facture/delete', { error: error.message });
  }
});

// ipcMain.on('/my-facture/deleteLogo', async (event, data: { entrepriseId: string; id: string }) => {
//   try {
//     const result = await deleteMyFactureLogo(data, prisma);
//     event.sender.send('/my-facture/deleteLogo', result);
//   } catch (error: any) {
//     console.error('api/myFacture /my-facture/deleteLogo: ', error);
//     event.sender.send('/my-facture/deleteLogo', { error: error.message });
//   }
// });

// ipcMain.on('/my-facture/addAddress', async (event, data: { entrepriseId: string; myFactureId: string; adresse: string }) => {
//   try {
//     const result = await addAddress(data, prisma);
//     event.sender.send('/my-facture/addAddress', result);
//   } catch (error: any) {
//     console.error('api/myFacture /my-facture/addAddress: ', error);
//     event.sender.send('/my-facture/addAddress', { error: error.message });
//   }
// });

// ipcMain.on('/my-facture/removeAddress', async (event, data: { entrepriseId: string; myFactureId: string; addressId: string }) => {
//   try {
//     const result = await removeAddress(data, prisma);
//     event.sender.send('/my-facture/removeAddress', result);
//   } catch (error: any) {
//     console.error('api/myFacture /my-facture/removeAddress: ', error);
//     event.sender.send('/my-facture/removeAddress', { error: error.message });
//   }
// });
}