// DTO pour créer une clôture de jour
export interface CreateClotureJourDto {
  dateFermeture: string;
  heureFermeture: string;
  caissier: string;
  chiffreAffairesTotal: number;
  totalEncaissements: number;
  totalAchat: number;
  totalCharge?: number;
  totalAcc?: number;
  totalRemises: number;
  totalRetours: number;
  totalNet: number;
  nombreVentes: number;
  tvaCollecte: number;
  fondCaisseInitial: number;
  totalEspecesEncaissées: number;
  totalEspecesSorties: number;
  totalEspecesEntree: number;
  totalEspecesFinalAttendu: number;
  detailPaiements: Array<{
    PaymentType: string;
    TotalAmount: number;
  }>;
  ventesParCaissier: Array<{
    nom: string;
    nombreVentes: number;
    montantTotal: number;
    totalRetours: number;
    fondCaisse: number;
    totalRemises: number;
    totalNet: number;
    totalEncaissements: number;
    paiements: {
      especes: number;
      carte: number;
      cheque: number;
      ticketRestaurant: number;
    };
  }>;
  commandesStats: any;
  retoursDetails: any;
}

// Interface pour la réponse de création
export interface ClotureJourResponse {
  message: string;
  cloture: any;
}

// Interface pour les paramètres de recherche
export interface SearchClotureJourDto {
  startDate?: string;
  endDate?: string;
  caissier?: string;
  page?: number;
  limit?: number;
}

// Interface pour la clôture (basée sur votre modèle Prisma)
export interface ClotureJour {
  id: number;
  dateFermeture: Date;
  heureFermeture?: string;
  caissierResponsable: string;
  chiffreAffaires: number;
  totalEncaissements: number;
  totalAchat: number;
  totalCharge?: number;
  totalAcc?: number;
  totalRemises: number;
  totalRetours: number;
  totalNet: number;
  nombreVentes: number;
  tvaCollecte: number;
  fondCaisseInitial: number;
  totalEspecesEncaissées: number;
  totalEspecesSorties: number;
  totalEspecesEntree: number;
  totalEspecesFinalAttendu: number;
  statut: string;
  createdAt: Date;
  updatedAt: Date;
  ventesCaissiers?: VenteCaissierCloture[];
  detailPaiements?: DetailPaiementCloture[];
}

export interface VenteCaissierCloture {
  id: number;
  clotureId: number;
  nomCaissier: string;
  nombreVentes: number;
  montantTotal: number;
  totalRetours: number;
  fondCaisse: number;
  totalRemises: number;
  totalNet: number;
  totalEncaissements: number;
  paiementsEspeces: number;
  paiementsCarte: number;
  paiementsCheque: number;
  paiementsTicket: number;
}

export interface DetailPaiementCloture {
  id: number;
  clotureId: number;
  typePaiement: string;
  montant: number;
}