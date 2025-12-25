import { UserProfile } from './user';

// Interface for Printer response, renamed to PrinterModel to avoid conflict with lucide-react's Printer
export interface PrinterModel {
  id: string;
  name: string;
  entrepriseId: string;
  userId: string|null;
  user: Pick<UserProfile, 'id' | 'nom' | 'prenom' | 'role'> |null;
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

// Interface for PrintTicket request payload
export interface PrintTicketRequest {
  pdf: string;
  printerName?: string;
}

// Interface for PrintTicket response
export interface PrintTicketResponse {
  status: string;
  message: string;
}
