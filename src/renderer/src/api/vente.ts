// src/renderer/api/vente.ts
import { CreateVenteDto, SearchVenteDto, UpdateVenteDto, Vente } from '../types/vente';

interface VenteResponse {
  message: string;
  vente: Vente;
}

// Create a new vente
export function createVente(entrepriseId: string, dto: CreateVenteDto): Promise<VenteResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/vente/create",
      (_event, data: { response?: VenteResponse; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.response!);
      }
    );
  });
}

// Get all ventes
export function getVentes(entrepriseId: string, searchParams?: SearchVenteDto): Promise<Vente[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/all", { entrepriseId, searchParams });

    window.electron.ipcRenderer.once(
      "/vente/all",
      (_event, data: { ventes?: Vente[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ventes!);
      }
    );
  });
}

// Get vente by ID
export function getVenteById(entrepriseId: string, id: string): Promise<Vente> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/get-by-id", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/vente/get-by-id",
      (_event, data: { vente?: Vente; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.vente!);
      }
    );
  });
}

// Update vente
export function updateVente(entrepriseId: string, id: string, dto: UpdateVenteDto): Promise<VenteResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/vente/update",
      (_event, data: { response?: VenteResponse; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.response!);
      }
    );
  });
}

// Get ventes by commande ID (ANCIENNE VERSION - compatible)
export function getVentesByCommandeId(entrepriseId: string, commandeId: string): Promise<Vente[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/by-commande", { entrepriseId, commandeId });

    window.electron.ipcRenderer.once(
      "/vente/by-commande",
      (_event, data: Vente[]) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// NOUVELLE VERSION - avec format structuré et retourQuantite
export function getVentesByCommandeIdStructured(entrepriseId: string, commandeId: string): Promise<{ success: boolean; ventes?: Vente[]; error?: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/getByCommande", { entrepriseId, commandeId });

    window.electron.ipcRenderer.once(
      "/vente/getByCommande",
      (_event, data: { success: boolean; ventes?: Vente[]; error?: string }) => {
        resolve(data);
      }
    );
  });
}

// Get today's ventes
export function getVentesByToday(entrepriseId: string): Promise<Vente[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/by-today", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/vente/by-today",
      (_event, data: { ventes?: Vente[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ventes!);
      }
    );
  });
}

// Get ventes within a date range
export function getVentesByDateRange(
  entrepriseId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<Vente[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/vente/by-date-range", { entrepriseId, dateDebut, dateFin });

    window.electron.ipcRenderer.once(
      "/vente/by-date-range",
      (_event, data: { ventes?: Vente[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.ventes!);
      }
    );
  });
}