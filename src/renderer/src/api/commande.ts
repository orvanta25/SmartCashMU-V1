// orvanta-frontend\app\api\commande.ts

import { CreateCommandeDto, SearchCommandeDto, UpdateCommandeDto, Commande, CreateCommandeForTableDto } from '../types/commande';

interface CommandeResponse {
  message: string;
  commande: Commande;
}


export interface UserCommandesResponse {
  user: {
    id: string;
    nom: string;
    prenom: string;
  };
  total: number;
  count: number;
  commandes: Commande[];
}

interface LastWeekResponse {
  dateDebut: string;
  dateFin: string;
  total: number;
}

// Create a new commande
export function createCommande(
  entrepriseId: string,
  dto: CreateCommandeDto & { ticketBarcodes?: string[] }
): Promise<CommandeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/commande/create",
      (_event, data: CommandeResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Create a new commande for a table
export function createCommandeForTable(
  entrepriseId: string,
  dto: CreateCommandeForTableDto
): Promise<CommandeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/createForTable", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/commande/createForTable",
      (_event, data: CommandeResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all commandes
export function getCommandes(
  entrepriseId: string,
  searchParams?: SearchCommandeDto
): Promise<Commande[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/getAll", { entrepriseId, searchParams });

    window.electron.ipcRenderer.once(
      "/commande/getAll",
      (_event, data: Commande[] & { error?: string }) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
   
}

// Get waiting commande for a table
export function getCommandeByTableId(
  entrepriseId: string,
  tableId: string
): Promise<Commande | null> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/getByTable", { entrepriseId, tableId });

    window.electron.ipcRenderer.once(
      "/commande/getByTable",
      (_event, data: { commande: Commande | null; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.commande);
      }
    );
  });
}

// Update a commande
export function updateCommande(
  entrepriseId: string,
  id: string,
  dto: UpdateCommandeDto
): Promise<CommandeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/commande/update",
      (_event, data: CommandeResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get today's commandes grouped by user
export function getCommandesByUserToday(
  entrepriseId: string
): Promise<UserCommandesResponse[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/byUserToday", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/commande/byUserToday",
      (_event, data: UserCommandesResponse[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all commandes grouped by user
export function getCommandesByUserAll(
  entrepriseId: string
): Promise<UserCommandesResponse[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/byUserAll", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/commande/byUserAll",
      (_event, data: UserCommandesResponse[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get commandes grouped by user within a date range
export function getCommandesByUserDateRange(
  entrepriseId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<UserCommandesResponse[]> {
  return new Promise((resolve, reject) => {
    const limit = 1000;
    window.electron.ipcRenderer.send("/commande/byUserDateRange", { entrepriseId, dateDebut, dateFin });

    window.electron.ipcRenderer.once(
      "/commande/byUserDateRange",
      (_event, data: UserCommandesResponse[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all commandes for a specific user within a date range
export function getCommandesByUserAndDateRange(
  entrepriseId: string,
  userId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<Commande[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/byUserAndDateRange", { entrepriseId, userId, dateDebut, dateFin });

    window.electron.ipcRenderer.once(
      "/commande/byUserAndDateRange",
      (_event, data: Commande[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get total commandes for last week
export function getCommandesOfLastWeek(
  entrepriseId: string
): Promise<LastWeekResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/commande/lastWeek", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/commande/lastWeek",
      (_event, data: LastWeekResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
