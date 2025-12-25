

export enum FactureType {
  FACTURE = 'FACTURE',
  BDC = 'BDC',
  DEV = 'DEV',
}

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

interface FactureResponse {
  message: string;
  facture: Facture;
}


interface NextNumResponse {
  num: string;
}

// Create a new facture
export function createFacture(
  entrepriseId: string,
  dto: CreateFactureDto
): Promise<FactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/facture/create",
      (_event, data: FactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all factures
export function getFactures(
  entrepriseId: string,
  searchParams?: SearchFactureDto
): Promise<Facture[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/getAll", { entrepriseId, searchParams });

    window.electron.ipcRenderer.once(
      "/facture/getAll",
      (_event, data: { factures: Facture[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.factures);
      }
    );
  });
}

// Get factures by type
export function getFacturesByType(
  entrepriseId: string,
  type: FactureType
): Promise<Facture[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/getByType", { entrepriseId, type });

    window.electron.ipcRenderer.once(
      "/facture/getByType",
      (_event, data: { factures: Facture[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.factures);
      }
    );
  });
}

// Get facture by ID
export function getFactureById(
  entrepriseId: string,
  id: string
): Promise<FactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/getById", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/facture/getById",
      (_event, data: FactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get ventes by facture ID
export function getVentesByFactureId(
  entrepriseId: string,
  factureId: string
): Promise<VenteFactureResponse[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/getVentes", { entrepriseId, factureId });

    window.electron.ipcRenderer.once(
      "/facture/getVentes",
      (_event, data: { ventes: VenteFactureResponse[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ventes);
      }
    );
  });
}

// Update facture
export function updateFacture(
  entrepriseId: string,
  id: string,
  dto: UpdateFactureDto
): Promise<FactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/facture/update",
      (_event, data: FactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete facture
export function deleteFacture(
  entrepriseId: string,
  id: string
): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/delete", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/facture/delete",
      (_event, data: { message: string; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get next facture number for a type
export function getNextFactureNum(type: FactureType): Promise<NextNumResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/facture/nextNum", { type });

    window.electron.ipcRenderer.once(
      "/facture/nextNum",
      (_event, data: NextNumResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
