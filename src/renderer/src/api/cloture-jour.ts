// Types pour la clôture de jour
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

export interface ClotureJourResponse {
  message: string;
  cloture: any;
}

export interface GetCloturesParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CloturesResponse {
  clotures: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Créer une clôture de jour
export function createClotureJour(
  dto: CreateClotureJourDto
): Promise<ClotureJourResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/cloture-jour/create", dto);

    window.electron.ipcRenderer.once(
      "/cloture-jour/create",
      (_, data: ClotureJourResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Récupérer l'historique des clôtures
export function getClotures(
  params: GetCloturesParams
): Promise<CloturesResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/cloture-jour/getAll", params);

    window.electron.ipcRenderer.once(
      "/cloture-jour/getAll",
      (_, data: CloturesResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Récupérer une clôture spécifique
export function getClotureById(id: number): Promise<{ cloture: any }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/cloture-jour/getById", id);

    window.electron.ipcRenderer.once(
      "/cloture-jour/getById",
      (_, data: { cloture: any } & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}