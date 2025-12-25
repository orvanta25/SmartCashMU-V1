
export interface AchatFournisseurResponse {
  message: string;
  achatFournisseur: AchatFournisseur;
}

export interface LastWeekResponse {
  dateDebut: string;
  dateFin: string;
  total: number;
}
export interface AchatFournisseur {
  id: string;
  numeroFacture: string;
  fournisseur: string;
  dateEcheance: string;
  datePaiement?: string;
  pieceJointe: string | null;
  montantTotal: number;
  montantComptant: number|null;
  montantRestant: number|null;
  remise: number|null; // Optional percentage discount
  entrepriseId: string;
  createdAt: string;
  updatedAt: string;
  entrees: Entree[];
}
export interface Entree {
  id: string;
  codeBarre: string;
  designation: string;
  quantite: number;
  puht: number;
  tva: number;
  prixUnitaireTTC: number;
  prixTotalTTC: number;
  entrepriseId: string;
  achatFournisseurId: string|null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAchatFournisseurDto {
  numeroFacture: string;
  fournisseur: string;
  dateEcheance: string;
  datePaiement?: string;
  montantComptant?: number;
  montantRestant?: number;
  remise?: number; // Optional percentage discount
  entree: CreateEntreeDto;
}

export interface UpdateAchatFournisseurDto {
  numeroFacture?: string;
  fournisseur?: string;
  dateEcheance?: string;
  datePaiement?: string;
  montantComptant?: number;
  montantRestant?: number;
  remise?: number; // Optional percentage discount
  entree?: CreateEntreeDto;
}



export interface EntreeResponse {
  message: string;
  entree: Entree;
}

export interface SearchAchatFournisseurDto {
  numeroFacture?: string;
  fournisseur?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface CreateEntreeDto {
  codeBarre: string;
  quantite: number;
  puht: number;
  tva: number;
  designation?: string;
  achatFournisseurId?: string;
}

export interface UpdateEntreeDto {
  quantite?: number;
  puht?: number;
  tva?: number;
}

export interface SearchEntreeDto {
  codeBarre?: string;
  designation?: string;
  dateDebut?: string;
  dateFin?: string;
  achatFournisseurId?: string;
}