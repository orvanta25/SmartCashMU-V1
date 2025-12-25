export interface CreateChargeDto {
  typeChargeId: string;
  montant: number;
  dateEcheance: string;
  datePaiement?: string;
  dateDebutRepartition: string;
  dateFinRepartition: string;
}

export interface UpdateChargeDto {
  typeChargeId?: string;
  montant?: number;
  dateEcheance?: string;
  datePaiement?: string;
  dateDebutRepartition?: string;
  dateFinRepartition?: string;
}

export interface Charge {
  id:string
  typeChargeId: string;
  montant?: number;
  dateEcheance?: string;
  datePaiement?: string;
  dateDebutRepartition?: string;
  dateFinRepartition?: string;
}

export interface SearchChargeDto {
  typeChargeId?: string;
  statut?: 'paye' | 'non_paye';
  orderBy?: 'dateEcheance' | 'datePaiement' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CreateChargeResponse {
  message: string;
  charge: any;
}

export interface FindAllChargeResponse {
  data: any[];
}

export interface FindByIdChargeResponse {
  data: any;
}

export interface UpdateChargeResponse {
  message: string;
  charge: any;
}

export interface DeleteChargeResponse {
  message: string;
}

export interface LastWeekResponse {
  dateDebut: string;
  dateFin: string;
  total: number;
}