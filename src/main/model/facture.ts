import { FactureType } from "@prisma/client";

export interface VenteFacture {
  codeBarre: string;
  quantite: number;
}

export interface VenteFactureResponse {
  codeBarre: string;
  designation: string;
  puht: number;
  tva: number;
  puttc: number;
  quantite: number;
  totalHT: number;
}

export interface Facture {
  id: string;
  type: FactureType;
  num: string;
  dateEmission: string;
  dateEcheance: string;
  denominationClient: string;
  matriculeFiscaleClient: string | null;
  adresseClient: string;
  clientTelephone: string | null;
  totalHT: number;
  totalTVA: number;
  timbreFiscal?: number;
  remise?: number;
  totalNet: number;
  denomination: string;
  matriculeFiscale: string;
  banque: string;
  rib: string;
  logo: string | null;
  entrepriseId: string;
  ventesFactures: {
    codeBarre: string;
    designation: string;
    puht: number;
    tva: number;
    remise: number;
    quantite: number;
    totalHT: number;
    totalTTC: number;
  }[];
}

export interface CreateFactureDto {
  type: FactureType;
  num: string;
  dateEmission: string;
  dateEcheance: string;
  denominationClient: string;
  matriculeFiscaleClient?: string;
  adresseClient: string;
  clientTelephone?: string;
  totalHT: number;
  totalTVA: number;
  timbreFiscal?: number;
  remise?: number;
  totalNet: number;
  denomination: string;
  matriculeFiscale: string;
  banque: string;
  rib: string;
  logo?: string;
  ventes: VenteFacture[];
}

export interface UpdateFactureDto {
  type?: FactureType;
  num?: string;
  dateEmission?: string;
  dateEcheance?: string;
  denominationClient?: string;
  matriculeFiscaleClient?: string;
  adresseClient?: string;
  clientTelephone?: string;
  totalHT?: number;
  totalTVA?: number;
  timbreFiscal?: number;
  remise?: number;
  totalNet?: number;
  denomination?: string;
  matriculeFiscale?: string;
  banque?: string;
  rib?: string;
  logo?: string;
  ventes?: VenteFacture[];
}

export interface SearchFactureDto {
  denominationClient?: string;
  dateDebut?: string;
  dateFin?: string;
  dateEcheanceDebut?: string;
  dateEcheanceFin?: string;
  type?: FactureType;
  num?: string;
}

export interface FactureResponse {
  message: string;
  facture: Facture;
}

export interface FacturesResponse {
  message: string;
  factures: Facture[];
}

export interface VentesResponse {
  message: string;
  ventes: VenteFactureResponse[];
}

export interface NextNumResponse {
  num: string;
}

export { FactureType };
