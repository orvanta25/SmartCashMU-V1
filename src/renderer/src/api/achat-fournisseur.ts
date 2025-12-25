// renderer/src/api/achat-fournisseur.ts

import { CreateAchatFournisseurDto, UpdateAchatFournisseurDto, SearchAchatFournisseurDto, AchatFournisseur } from '../types/achat-entree';

interface AchatFournisseurResponse {
  message: string;
  achatFournisseur: AchatFournisseur;
}

interface LastWeekResponse {
  dateDebut: string;
  dateFin: string;
  total: number;
}

// Create a new achat fournisseur (with optional file)
export function createAchatFournisseur(
  entrepriseId: string,
  dto: CreateAchatFournisseurDto,
  file?: File
): Promise<AchatFournisseurResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/create/entrepriseId", {
      entrepriseId,
      dto,
      file,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/create/entrepriseId",
      (_, data: AchatFournisseurResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all achat fournisseurs
export function getAchatFournisseurs(
  entrepriseId: string,
  searchParams?: SearchAchatFournisseurDto
): Promise<AchatFournisseur[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/getAll/entrepriseId", {
      entrepriseId,
      params: searchParams,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/getAll/entrepriseId",
      (_, data: AchatFournisseur[] & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get achat fournisseur by ID
export function getAchatFournisseurById(
  entrepriseId: string,
  id: string
): Promise<AchatFournisseur> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/getById/entrepriseId/id", {
      entrepriseId,
      id,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/getById/entrepriseId/id",
      (_, data: AchatFournisseur & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update achat fournisseur (with optional file)
export function updateAchatFournisseur(
  entrepriseId: string,
  id: string,
  dto: UpdateAchatFournisseurDto,
  file?: File
): Promise<AchatFournisseurResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/update/entrepriseId/id", {
      entrepriseId,
      id,
      dto,
      file,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/update/entrepriseId/id",
      (_, data: AchatFournisseurResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete piece jointe of achat fournisseur
export function deleteAchatFournisseurPieceJointe(
  entrepriseId: string,
  id: string
): Promise<AchatFournisseurResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/deletePieceJointe/entrepriseId/id", {
      entrepriseId,
      id,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/deletePieceJointe/entrepriseId/id",
      (_, data: AchatFournisseurResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get unpaid achat fournisseurs
export function getUnpaidAchatFournisseurs(
  entrepriseId: string
): Promise<AchatFournisseur[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/getUnpaid/entrepriseId", {
      entrepriseId,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/getUnpaid/entrepriseId",
      (_, data: AchatFournisseur[] & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete achat fournisseur
export function deleteAchatFournisseur(
  entrepriseId: string,
  id: string
): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/delete/entrepriseId/id", {
      entrepriseId,
      id,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/delete/entrepriseId/id",
      (_, data: { message: string } & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get depense of last week
export function getDepenseOfLastWeek(
  entrepriseId: string
): Promise<LastWeekResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/last-week/depense/entrepriseId", {
      entrepriseId,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/last-week/depense/entrepriseId",
      (_, data: LastWeekResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get total achat of last week
export function getTotalAchatOfLastWeek(
  entrepriseId: string
): Promise<LastWeekResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/last-week-total/achat/entrepriseId", {
      entrepriseId,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/last-week-total/achat/entrepriseId",
      (_, data: LastWeekResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get total achat by date range
export function getTotalAchatByDateRange(
  entrepriseId: string,
  dateDebut: string,
  dateFin: string
): Promise<{ date: string; totalAchat: number; count: number }[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/total-by-date-range/entrepriseId", {
      entrepriseId,
      dateDebut,
      dateFin,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/total-by-date-range/entrepriseId",
      (_, data) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get total achat for a specific date
export function getTotalAchatForDate(
  entrepriseId: string,
  date: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/total-for-date/entrepriseId", {
      entrepriseId,
      date,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/total-for-date/entrepriseId",
      (_, data) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get achat of last 7 days
export function getAchatLast7Days(
  entrepriseId: string
): Promise<{ date: string; totalAchat: number }[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/last-7-days/entrepriseId", {
      entrepriseId,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/last-7-days/entrepriseId",
      (_, data) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get monthly achat stats
export function getMonthlyAchatStats(
  entrepriseId: string,
  year: number
): Promise<{ month: number; totalAchat: number; count: number }[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/achat-fournisseur/monthly-stats/entrepriseId", {
      entrepriseId,
      year,
    });

    window.electron.ipcRenderer.once(
      "/achat-fournisseur/monthly-stats/entrepriseId",
      (_, data) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}