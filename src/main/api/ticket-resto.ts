    import { ipcMain } from 'electron';
import { createTicketResto, createUsedTicketResto, deleteTicketResto, getTicketByUserAndDateRange, getTicketFournisseurDateRange, getTicketRestoById, getTicketRestos, updateTicketResto, validateTicketResto, saveTicketsBatch  } from '../service/ticket-resto';
import { CreateTicketRestoDto, SearchTicketRestoDto, UpdateTicketRestoDto } from '../model/ticket-resto';


export function TicketRestoApi(prisma) {


ipcMain.on('/ticket-resto/create', async (event, data: { entrepriseId: string; dto: CreateTicketRestoDto }) => {
  try {
    const result = await createTicketResto(data, prisma);
    event.sender.send('/ticket-resto/create', { ticketResto: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/create: ', error);
    event.sender.send('/ticket-resto/create', { error: error.message });
  }
});

ipcMain.on('/used-ticket-resto/create', async (event, data) => {
  try {
    const result = await createUsedTicketResto(data, prisma);
    event.sender.send('/used-ticket-resto/create', result);
  } catch (error: any) {
    console.error('api/ticketResto /used-ticket-resto/create: ', error);
  }
});

ipcMain.on('/ticket-resto/all', async (event, data: { entrepriseId: string; searchParams?: SearchTicketRestoDto }) => {
  try {
    const result = await getTicketRestos(data, prisma);
    event.sender.send('/ticket-resto/all', { ticketRestos: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/all: ', error);
    event.sender.send('/ticket-resto/all', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/get-by-id', async (event, data: { entrepriseId: string; ticketRestoId: string }) => {
  try {
    const result = await getTicketRestoById(data, prisma);
    event.sender.send('/ticket-resto/get-by-id', { ticketResto: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/get-by-id: ', error);
    event.sender.send('/ticket-resto/get-by-id', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/update', async (event, data: { entrepriseId: string; ticketRestoId: string; dto: UpdateTicketRestoDto }) => {
  try {
    const result = await updateTicketResto(data, prisma);
    event.sender.send('/ticket-resto/update', { ticketResto: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/update: ', error);
    event.sender.send('/ticket-resto/update', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/delete', async (event, data: { entrepriseId: string; ticketRestoId: string }) => {
  try {
    await deleteTicketResto(data, prisma);
    event.sender.send('/ticket-resto/delete', { success: true });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/delete: ', error);
    event.sender.send('/ticket-resto/delete', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/validate', async (event, data: { entrepriseId: string; codeBarre: string;remainingAmount:number }) => {
  try {
    const result = await validateTicketResto(data, prisma);
    event.sender.send('/ticket-resto/validate',  result );
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/validate: ', error);
    event.sender.send('/ticket-resto/validate', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/by-fournisseur-range', async (event, data: { entrepriseId: string; dateDebut?: string; dateFin?: string }) => {
  try {
    const result = await getTicketFournisseurDateRange(data, prisma);
    event.sender.send('/ticket-resto/by-fournisseur-range', { totals: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/by-fournisseur-range: ', error);
    event.sender.send('/ticket-resto/by-fournisseur-range', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/by-user-range', async (event, data: { entrepriseId: string; userId: string; dateDebut?: string; dateFin?: string }) => {
  try {
    const result = await getTicketByUserAndDateRange(data, prisma);
    event.sender.send('/ticket-resto/by-user-range', { tickets: result });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/by-user-range: ', error);
    event.sender.send('/ticket-resto/by-user-range', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/validate-without-save', async (event, data: { 
  entrepriseId: string; 
  codeBarre: string; 
  remainingAmount: number;
  existingTickets?: string[]; // Ajouter ce paramètre
}) => {
  try {
    const result = await validateTicketResto({ 
      ...data, 
      saveImmediately: false 
    }, prisma);
    event.sender.send('/ticket-resto/validate-without-save', result);
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/validate-without-save: ', error);
    event.sender.send('/ticket-resto/validate-without-save', { error: error.message });
  }
});

ipcMain.on('/ticket-resto/save-batch', async (event, data: { entrepriseId: string; tickets: string[] }) => {
  try {
    await saveTicketsBatch(data, prisma);
    event.sender.send('/ticket-resto/save-batch', { success: true });
  } catch (error: any) {
    console.error('api/ticketResto /ticket-resto/save-batch: ', error);
    event.sender.send('/ticket-resto/save-batch', { error: error.message });
  }
});
}