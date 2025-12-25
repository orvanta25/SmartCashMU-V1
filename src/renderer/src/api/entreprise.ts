
import { UpdateEntrepriseDto,UpdateTypeDto } from '../types/auth';
import { UserProfile } from './user';

export interface Entreprise {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  denomination?: string;
  matriculeFiscale?: string;
  secteurActivite: string;
  region?: string;
  ville?: string;
  pays?: string;
  hasRestaurantModule: boolean;
  hasEpicerieModule: boolean;
  type: 'COMMERCANT'|'FOURNISSEUR';
  createdAt: string;
  updatedAt: string;
}



interface UpdateEpicerieModuleDto {
  hasEpicerieModule: boolean;
}

// Get logged-in entreprise details
export function getEntreprise(): Promise<Entreprise> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entreprise/get/me", {});

    window.electron.ipcRenderer.once(
      "/entreprise/get/me",
      (_, data: Entreprise & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update entreprise profile
export function updateEntreprise(
  dto: UpdateEntrepriseDto
): Promise<Entreprise> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entreprise/update", { dto });

    window.electron.ipcRenderer.once(
      "/entreprise/update",
      (_, data: Entreprise & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}


// Toggle epicerie module
export function updateEpicerieModule(
  dto: UpdateEpicerieModuleDto
): Promise<Entreprise> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entreprise/update-epicerie-module", { dto });

    window.electron.ipcRenderer.once(
      "/entreprise/update-epicerie-module",
      (_, data: Entreprise & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}
export function updateEntrepriseType(
  dto: UpdateTypeDto
): Promise<UserProfile['entreprise'] | null> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/entreprise/update-type", { dto });

    window.electron.ipcRenderer.once(
      "/entreprise/update-type",
      (_, data: UserProfile['entreprise'] | null & { error?: string }) => {
        if ((data as any).error) reject(data);
        else resolve(data);
      }
    );
  });
}