import { ipcMain } from 'electron';


// Assume a function to get the current user's ID and role (e.g., from session or auth context)
import { getCurrentUser } from '../service/auth'; // Hypothetical auth module
import type {
  CreatePrinterDto,
  UpdatePrinterDto,
  PrintTicketRequest,
} from '../model/printer';
import { createPrinter, deletePrinter, getAllPrinters, getPrinterById, printTicket, updatePrinter } from '../service/printer';


export function PrinterApi(prisma,ses) {
    
ipcMain.on('/printer/create', async (event, data: { dto: CreatePrinterDto }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current user

    if(currentUser){
        const { userId, role: userRole, entrepriseId } = currentUser
        const result = await createPrinter({ ...data, userId: userRole === 'CAISSIER' ? userId : undefined, entrepriseId }, prisma);
        event.sender.send('/printer/create', result);
    }
  } catch (error: any) {
    console.error('api/printer /printer/create: ', error);
    event.sender.send('/printer/create', { error: error.message });
  }
});

ipcMain.on('/printer/all', async (event,_: {}) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current user
    if(currentUser){
        const { userId, role: userRole, entrepriseId } = currentUser
    const result = await getAllPrinters({ entrepriseId, userId, userRole }, prisma);
    event.sender.send('/printer/all', { printers: result });
    }
    
  } catch (error: any) {
    console.error('api/printer /printer/all: ', error);
    event.sender.send('/printer/all', { error: error.message });
  }
});

ipcMain.on('/printer/get', async (event, data: { id: string }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    
    if(currentUser){
        const {entrepriseId} = currentUser
        const result = await getPrinterById({ id: data.id, entrepriseId }, prisma);
        event.sender.send('/printer/get', { printer: result });
    }
  } catch (error: any) {
    console.error('api/printer /printer/get: ', error);
    event.sender.send('/printer/get', { error: error.message });
  }
});

ipcMain.on('/printer/update', async (event, data: { id: string; dto: UpdatePrinterDto }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(currentUser){
        const {entrepriseId} = currentUser
    const result = await updatePrinter({ id: data.id, dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/printer/update', result);}
  } catch (error: any) {
    console.error('api/printer /printer/update: ', error);
    event.sender.send('/printer/update', { error: error.message });
  }
});

ipcMain.on('/printer/delete', async (event, data: { id: string }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(currentUser){
        const {entrepriseId} = currentUser
    const result = await deletePrinter({ id: data.id, entrepriseId }, prisma);
    event.sender.send('/printer/delete', result);}
  } catch (error: any) {
    console.error('api/printer /printer/delete: ', error);
    event.sender.send('/printer/delete', { error: error.message });
  }
});

ipcMain.on('/printer/print-ticket', async (event, data: { request: PrintTicketRequest }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(currentUser){
        const {entrepriseId} = currentUser
    const result = await printTicket({ request: data.request, entrepriseId }, prisma);
    event.sender.send('/printer/print-ticket', result);}
  } catch (error: any) {
    console.error('api/printer /printer/print-ticket: ', error);
    event.sender.send('/printer/print-ticket', { error: error.message });
  }
});
}