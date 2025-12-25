import { Vente } from './vente';
import { UserProfile } from '../api/user';

export interface VenteItem {
  codeBarre: string;
  quantite: number; 
}

export interface CreateCommandeDto {
  ventes: VenteItem[];
  tpeAmount?: number;
  especeAmount?: number;
  ticketAmount?: number;
  chequeAmount?: number; 
  remise?: number; 
  isWaiting?: boolean;
  ticketBarcodes?: string[];
  tableId?: string;
}

export interface CreateCommandeForTableDto {
  ventes: VenteItem[];
  tableId: string;
  remise?: number; // Added remise
}

export interface UpdateCommandeDto {
  ventes?: VenteItem[];
  tpeAmount?: number;
  especeAmount?: number;
  ticketAmount?: number;
  chequeAmount?: number;
  remise?: number; 
  isWaiting?: boolean;
  tableId?: string;
}

export interface SearchCommandeDto {
  userId?: string;
  dateDebut?: string;
  dateFin?: string;
  ticketNumber?: string;
}

export interface Commande {
  id: string;
  date: string;
  total: number;
  userId: string;
  entrepriseId: string;
  isWaiting: boolean;
  tpeAmount: number;
  especeAmount: number;
  ticketAmount: number;
  chequeAmount: number;
  remise?: number; 
  createdAt: string;
  updatedAt: string;
  ventes: Vente[];
  user?: Pick<UserProfile, 'nom' | 'prenom'>;
  ticketNumber?: string;
  usedTicketRestos?: { codeBarre: string }[];
  tableId?: string;
  table?: {
    id: string;
    number: string;
  };
}

