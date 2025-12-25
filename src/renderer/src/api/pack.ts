
import { UserProfile } from '../api/user';

export interface Pack {
  id: string;
  nom: string;
  prix: number;
  duree: number; 
  description: string;
  adminId: string;
  admin?: Pick<UserProfile, 'id' | 'email' | 'nom' | 'prenom'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackDto {
  nom: string;
  prix: number;
  duree: number;
  description: string;
}

export interface UpdatePackDto {
  nom?: string;
  prix?: number;
  duree?: number;
  description?: string;
}

// Create a new pack
export function createPack(dto: CreatePackDto): Promise<{ message: string; pack: Pack }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/packs/create", { dto });

    window.electron.ipcRenderer.once(
      "/admin/packs/create",
      (_event, data: { message: string; pack: Pack; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all packs
export function getAllPacks(): Promise<Pack[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/packs/all");

    window.electron.ipcRenderer.once(
      "/admin/packs/all",
      (_event, data: { packs: Pack[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.packs);
      }
    );
  });
}

// Get pack by ID
export function getPackById(id: string): Promise<{ message: string; pack: Pack }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/packs/get", { id });

    window.electron.ipcRenderer.once(
      "/admin/packs/get",
      (_event, data: { message: string; pack: Pack; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update a pack
export function updatePack(id: string, dto: UpdatePackDto): Promise<{ message: string; pack: Pack }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/packs/update", { id, dto });

    window.electron.ipcRenderer.once(
      "/admin/packs/update",
      (_event, data: { message: string; pack: Pack; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete a pack
export function deletePack(id: string): Promise<{ message: string; pack: Pack }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/admin/packs/delete", { id });

    window.electron.ipcRenderer.once(
      "/admin/packs/delete",
      (_event, data: { message: string; pack: Pack; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get packs of current user
export function getUserPacks(): Promise<{ message: string; packs: Pack[] }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/packs/user");

    window.electron.ipcRenderer.once(
      "/packs/user",
      (_event, data: { message: string; packs: Pack[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
