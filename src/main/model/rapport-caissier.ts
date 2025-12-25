// DTO pour générer un rapport par caissier
export interface GenerateRapportCaissierDto {
  caissiers: Array<{
    nom: string;
  }>;
  dateOuverture?: string;
  dateFermeture?: string;
  periode?: string;
  includeDetails?: boolean;
}

// Interface pour la réponse du rapport
export interface RapportCaissierResponse {
  rapports: CaissierRapport[];
  periode: string;
  dateGeneration: string;
  totalGeneral: {
    nombreVentes: number;
    montantTotal: number;
    totalRemises: number;
    totalRetours: number;
    totalNet: number;
  };
}

// Interface pour un rapport de caissier individuel
export interface CaissierRapport {
  nom: string;
  nombreVentes: number;
  montantTotal: number;
  totalRemises: number;
  totalRetours: number;
  totalNet: number;
  fondCaisse: number;
  totalEncaissements: number;
  paiements: {
    especes: number;
    carte: number;
    cheque: number;
    ticketRestaurant: number;
    virement?: number;
  };
  ventes?: any[];
  retours?: any[];
  produitsVendus?: ProduitVendu[];
}

// Interface pour un produit vendu (détail)
export interface ProduitVendu {
  produitId: string;
  nomProduit: string;
  quantite: number;
  total: number;
}

// Interface pour un rapport de caissier spécifique
export interface RapportCaissierUniqueResponse {
  stats: {
    periode: string;
    caissier: string;
    nombreVentes: number;
    montantTotal: number;
    totalRemises: number;
    totalRetours: number;
    totalNet: number;
    moyennePanier: number;
    meilleurJour?: string;
    produitsVendus?: ProduitVendu[];
  };
  ventes: any[];
  retours: any[];
}

// DTO pour un rapport caissier unique
export interface GenerateRapportCaissierUniqueDto {
  caissier: string;
  startDate?: string;
  endDate?: string;
  includeDetails?: boolean;
}

// Interface pour les statistiques de paiement
export interface PaiementStats {
  especes: number;
  carte: number;
  cheque: number;
  ticketRestaurant: number;
  virement?: number;
  autre?: number;
}