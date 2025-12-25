export interface TicketResto {
  id: string;
  fournisseur: string;
  codeInterne: string;
  pourcentage?: number;
  entrepriseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRestoDto {
  fournisseur: string;
  codeInterne: string;
  pourcentage?: number;
}

export interface UpdateTicketRestoDto {
  fournisseur?: string;
  codeInterne?: string;
  pourcentage?: number;
}

export interface SearchTicketRestoDto {
  fournisseur?: string;
  codeInterne?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface TicketRestoResult {
  codeBarre: string;
  fournisseur: string;
  originalAmount: number;
  finalAmount: number;
  isValid: boolean;
}

export interface TicketItem {
  id: number; 
  codeBarre: string;
  fournisseur: string;
  finalAmount: number;
}
export interface UsedTicketResto {
  id: string;
  codeBarre: string;
  createdAt: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
  };
  originalAmount: number;
  finalAmount: number;
  fournisseur: string;
}