
import { CreateEntreeDto, UpdateEntreeDto, SearchEntreeDto, Entree, EntreeResponse } from '../types/achat-entree';
interface LatestPrice {
  codeBarre: string;
  designation: string;
  prixUnitaireTTC: number;
  createdAt: string;
}

// Create a new entree
export function createEntree(
  entrepriseId: string,
  dto: CreateEntreeDto
): Promise<EntreeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/create/entrepriseId", {
      entrepriseId,
      dto,
    });

    window.electron.ipcRenderer.once(
      "/entree/create/entrepriseId",
      (_event, data: EntreeResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all entrees for an entreprise
export function getEntrees(
  entrepriseId: string,
  searchParams?: SearchEntreeDto
): Promise<Entree[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/get/entrepriseId", {
      entrepriseId,
      params: searchParams,
    });

    window.electron.ipcRenderer.once(
      "/entree/get/entrepriseId",
      (_event, data: Entree[] & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get entree by ID
export function getEntreeById(
  entrepriseId: string,
  id: string
): Promise<Entree> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/getById/entrepriseId/id", {
      entrepriseId,
      id,
    });

    window.electron.ipcRenderer.once(
      "/entree/getById/entrepriseId/id",
      (_event, data: Entree & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update entree by ID
export function updateEntree(
  entrepriseId: string,
  id: string,
  dto: UpdateEntreeDto
): Promise<EntreeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/update/entrepriseId/id", {
      entrepriseId,
      id,
      dto,
    });

    window.electron.ipcRenderer.once(
      "/entree/update/entrepriseId/id",
      (_event, data: EntreeResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get entrees by achatFournisseurId
export function getEntreesByAchatFournisseurId(
  entrepriseId: string,
  achatFournisseurId: string
): Promise<Entree[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/getByAchatFournisseur/entrepriseId/achatFournisseurId", {
      entrepriseId,
      achatFournisseurId,
    });

    window.electron.ipcRenderer.once(
      "/entree/getByAchatFournisseur/entrepriseId/achatFournisseurId",
      (_event, data: Entree[] & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get latest product prices
export function getLatestProductPrices(
  entrepriseId: string
): Promise<LatestPrice[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entree/prices/latest/entrepriseId", {
      entrepriseId,
    });

    window.electron.ipcRenderer.once(
      "/entree/prices/latest/entrepriseId",
      (_event, data: LatestPrice[] & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}
