
import { UserProfile } from './user';

// Interface for Printer response, renamed to PrinterModel to avoid conflict with lucide-react's Printer
export interface PrinterModel {
  id: string;
  name: string;
  entrepriseId: string;
  userId?: string;
  user?: Pick<UserProfile, 'id' | 'nom' | 'prenom' | 'role'>;
  createdAt: string;
  updatedAt: string;
}

// Interface for CreatePrinter request payload
export interface CreatePrinterDto {
  name: string;
}

// Interface for UpdatePrinter request payload
export interface UpdatePrinterDto {
  name?: string;
}

// Interface for Print request payload
export interface PrintTicketRequest {
  pdf: string;
  printerName?: string;
}

// Interface for PrintTicket response
export interface PrintTicketResponse {
  status: string;
  message: string;
}

// Create a new printer for the logged-in user
// Create a printer
export function createPrinter(dto: CreatePrinterDto): Promise<{ message: string; printer: PrinterModel }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/create", { dto });

    window.electron.ipcRenderer.once(
      "/printer/create",
      (_event, data: { message: string; printer: PrinterModel; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all printers (ADMIN sees all, CAISSIER sees only their own)
export function getAllPrinters(): Promise<PrinterModel[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/all");

    window.electron.ipcRenderer.once(
      "/printer/all",
      (_event, data: { printers: PrinterModel[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.printers);
      }
    );
  });
}

// Get a printer by ID
export function getPrinterById(id: string): Promise<PrinterModel> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/get", { id });

    window.electron.ipcRenderer.once(
      "/printer/get",
      (_event, data: { printer: PrinterModel; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.printer);
      }
    );
  });
}

// Update a printer
export function updatePrinter(id: string, dto: UpdatePrinterDto): Promise<{ message: string; printer: PrinterModel }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/update", { id, dto });

    window.electron.ipcRenderer.once(
      "/printer/update",
      (_event, data: { message: string; printer: PrinterModel; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete a printer
export function deletePrinter(id: string): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/delete", { id });

    window.electron.ipcRenderer.once(
      "/printer/delete",
      (_event, data: { message: string; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Print a ticket
export function printTicket(request: PrintTicketRequest): Promise<PrintTicketResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/printer/print-ticket", { request });

    window.electron.ipcRenderer.once(
      "/printer/print-ticket",
      (_event, data: PrintTicketResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
