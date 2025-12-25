 import { ipcMain } from 'electron';

// Assume a function to get the current user's entrepriseId (e.g., from session or auth context)
import { getCurrentUser } from '../service/auth'; // Hypothetical auth module
import { getEntreprise, updateEntreprise, updateEntrepriseType, updateEpicerieModule } from '../service/entreprise';


export function EntrepriseApi(prisma,ses){

       

ipcMain.on('/entreprise/get/me', async (event) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw "try login as ADMIN"
    const { entrepriseId } = currentUser
    const result = await getEntreprise({ entrepriseId }, prisma);
    event.sender.send('/entreprise/get/me', result);
  } catch (error: any) {
    console.error('api/entreprise /entreprise/get/me: ', error);
    event.sender.send('/entreprise/get/me', { error: error });
  }
});

ipcMain.on('/entreprise/update', async (event, data) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw "try login as ADMIN"
    const { entrepriseId } = currentUser
    const result = await updateEntreprise({ dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/entreprise/update', result);
  } catch (error: any) {
    console.error('api/entreprise /entreprise/update: ', error);
    event.sender.send('/entreprise/update', { error: error });
  }
});

ipcMain.on('/entreprise/update-epicerie-module', async (event, data) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw "try login as ADMIN"
    const { entrepriseId } = currentUser
    const result = await updateEpicerieModule({ dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/entreprise/update-epicerie-module', result);
  } catch (error: any) {
    console.error('api/entreprise /entreprise/update-epicerie-module: ', error);
    event.sender.send('/entreprise/update-epicerie-module', { error: error });
  }
});

ipcMain.on('/entreprise/update-type', async (event, data) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw "try login as ADMIN"
    const { entrepriseId } = currentUser
    const result = await updateEntrepriseType({ dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/entreprise/update-type', result);
  } catch (error: any) {
    console.error('api/entreprise /entreprise/update-type: ', error);
    event.sender.send('/entreprise/update-type', { error: error });
  }
});
}