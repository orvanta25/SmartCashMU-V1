
import { Pack as PackEntreprise } from './pack';

export interface Paiement {
  id: string;
  entrepriseId: string;
  adminId: string | null;
  userId: string | null;
  amountPaid: number;
  datePaiement: string;
  types: string[];
  packEntreprises: PackEntreprise[];
  entreprise: {
    id: string;
    nom: string;
    email: string;
  };
  admin: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

export interface CreatePaiementDto {
  entrepriseId: string;
  packEntrepriseIds: string[];
  types: string[];
  amountPaid?: number;
  datePaiement?: string;
}


export interface PaiementTotal {
  totalToPay: number;
  totalPaid: number;
}

// Create a paiement
export function createPaiement(dto: CreatePaiementDto): Promise<{ message: string; paiement: Paiement }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/paiements/create", { dto });

    window.electron.ipcRenderer.once(
      "/admin/paiements/create",
      (_event, data: { message: string; paiement: Paiement; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get paiements by entreprise
export function getPaiementsByEntreprise(entrepriseId: string): Promise<{ message: string; paiements: Paiement[] }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/paiements/by-entreprise", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/admin/paiements/by-entreprise",
      (_event, data: { message: string; paiements: Paiement[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get available packs to pay
export function getAvailablePacksToPay(entrepriseId: string): Promise<PackEntreprise[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/paiements/available-packs", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/admin/paiements/available-packs",
      (_event, data: { packs: PackEntreprise[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.packs);
      }
    );
  });
}

// Get paiement totals by entreprise
export function getPaiementTotalByEntreprise(entrepriseId: string): Promise<{ message: string; totals: PaiementTotal }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/paiement-totals/by-entreprise", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/admin/paiement-totals/by-entreprise",
      (_event, data: { message: string; totals: PaiementTotal; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get global paiement totals
export function getGlobalPaiementTotals(): Promise<{ message: string; totals: PaiementTotal }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/paiement-totals/global");

    window.electron.ipcRenderer.once(
      "/admin/paiement-totals/global",
      (_event, data: { message: string; totals: PaiementTotal; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
