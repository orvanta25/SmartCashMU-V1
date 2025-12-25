export interface CreateVenteDto {
  codeBarre: string;
  quantite: number;
  tva?: number;
  remise?: number;
}

export interface UpdateVenteDto {
  quantite?: number;
  tva?: number;
  remise?: number;
}

export interface SearchVenteDto {
  codeBarre?: string;
  designation?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface Vente {
  id: string;
  codeBarre: string;
  designation: string;
  puht: number;
  tva: number;
  remise: number;
  quantite: number;
  totalHT: number;
  totalTTC: number;
  entrepriseId: string;
  commandeId: string;
  createdAt: string;
  updatedAt: string;
  retourQuantite?: number; 
}