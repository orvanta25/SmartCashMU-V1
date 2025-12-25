
import { TicketResto, CreateTicketRestoDto, UpdateTicketRestoDto, SearchTicketRestoDto ,UsedTicketResto} from '../types/ticket-resto';

export interface CreateUsedTicketRestoDto {
  codeBarreList:string[];
  userId?: string 
}

export interface ValidateTicketResponse {
  message: string;
  result: {
    codeBarre: string;
    fournisseur: string;
    originalAmount: number;
    finalAmount: number;
    isValid: boolean;
  };
}

interface TicketFournisseurResponse {
  fournisseur: string;
  totalAmount: number;
}

// Create a new ticket resto
export function createTicketResto(
  entrepriseId: string,
  dto: CreateTicketRestoDto
): Promise<TicketResto> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/ticket-resto/create",
      (_event, data: { ticketResto?: TicketResto; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ticketResto!);
      }
    );
  });
}

export function createUsedTicketResto(
  entrepriseId: string,
  dto: CreateUsedTicketRestoDto
): Promise<UsedTicketResto[]>{
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/used-ticket-resto/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/used-ticket-resto/create",
      (_event, data:  UsedTicketResto[]) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Fetch all ticket restos
export function getTicketRestos(
  entrepriseId: string,
  searchParams?: SearchTicketRestoDto
): Promise<TicketResto[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/all", { entrepriseId, searchParams });

    window.electron.ipcRenderer.once(
      "/ticket-resto/all",
      (_event, data: { ticketRestos?: TicketResto[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ticketRestos!);
      }
    );
  });
}

// Fetch a single ticket resto
export function getTicketRestoById(
  entrepriseId: string,
  ticketRestoId: string
): Promise<TicketResto> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/get-by-id", { entrepriseId, ticketRestoId });

    window.electron.ipcRenderer.once(
      "/ticket-resto/get-by-id",
      (_event, data: { ticketResto?: TicketResto; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ticketResto!);
      }
    );
  });
}

// Update a ticket resto
export function updateTicketResto(
  entrepriseId: string,
  ticketRestoId: string,
  dto: UpdateTicketRestoDto
): Promise<TicketResto> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/update", { entrepriseId, ticketRestoId, dto });

    window.electron.ipcRenderer.once(
      "/ticket-resto/update",
      (_event, data: { ticketResto?: TicketResto; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ticketResto!);
      }
    );
  });
}

// Delete a ticket resto
export function deleteTicketResto(
  entrepriseId: string,
  ticketRestoId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/delete", { entrepriseId, ticketRestoId });

    window.electron.ipcRenderer.once(
      "/ticket-resto/delete",
      (_event, data: { success?: boolean; error?: string }) => {
        if (data.error) reject(data);
        else resolve();
      }
    );
  });
}

// Validate a ticket resto barcode
export function validateTicketResto(
  entrepriseId: string,
  codeBarre: string,
  remainingAmount:number
): Promise<{codeBarre: string;
    fournisseur: string;
    originalAmount: number;
    finalAmount: number;
    isValid: boolean;
  error?:string}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/validate", { entrepriseId, codeBarre,remainingAmount });

    window.electron.ipcRenderer.once(
      "/ticket-resto/validate",
      (_event, data:  {codeBarre: string;
          fournisseur: string;
          originalAmount: number;
          finalAmount: number;
          isValid: boolean;
          error?:string}
) => {
        console.log(data)
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Fetch used ticket restos by fournisseur within a date range
export function getTicketFournisseurDateRange(
  entrepriseId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<TicketFournisseurResponse[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/by-fournisseur-range", { entrepriseId, dateDebut, dateFin });

    window.electron.ipcRenderer.once(
      "/ticket-resto/by-fournisseur-range",
      (_event, data: { totals?: TicketFournisseurResponse[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.totals!);
      }
    );
  });
}

// Fetch used ticket restos for a specific user within a date range
export function getTicketByUserAndDateRange(
  entrepriseId: string,
  userId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<UsedTicketResto[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/by-user-range", { entrepriseId, userId, dateDebut, dateFin });

    window.electron.ipcRenderer.once(
      "/ticket-resto/by-user-range",
      (_event, data: { tickets?: UsedTicketResto[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.tickets!);
      }
    );
  });
}

// Validate ticket without saving to database
export function validateTicketRestoWithoutSave(
  entrepriseId: string,
  codeBarre: string,
  remainingAmount: number,
  existingTickets?: string[] // Ajouter ce paramètre
): Promise<{
  codeBarre: string;
  fournisseur: string;
  originalAmount: number;
  finalAmount: number;
  isValid: boolean;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/validate-without-save", { 
      entrepriseId, 
      codeBarre, 
      remainingAmount,
      existingTickets 
    });

    window.electron.ipcRenderer.once(
      "/ticket-resto/validate-without-save",
      (_event, data: {
        codeBarre: string;
        fournisseur: string;
        originalAmount: number;
        finalAmount: number;
        isValid: boolean;
        error?: string;
      }) => {
        console.log(data);
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}
// Save tickets batch to database
export function saveTicketsBatch(
  entrepriseId: string,
  tickets: string[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/ticket-resto/save-batch", { entrepriseId, tickets });

    window.electron.ipcRenderer.once(
      "/ticket-resto/save-batch",
      (_event, data: { success?: boolean; error?: string }) => {
        if (data.error) reject(data);
        else resolve();
      }
    );
  });
}