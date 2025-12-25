
import { UpdateProfileDto } from '../types/auth';

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'ADMIN' | 'CAISSIER' | 'COMPTABLE' | 'GERANT' | 'MAGASINIER' | 'CHEF_RAYON' | 'SERVEUR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  entreprise?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    denomination?: string;
    matriculeFiscale?: string;
    secteurActivite: string;
    region: string;
    ville: string;
    pays: string;
    hasRestaurantModule: boolean;
    hasEpicerieModule: boolean;
    type: 'COMMERCANT'|"FOURNISSEUR";
    createdAt: string;
    updatedAt: string;
  };
}

// Get user and entreprise profile
export function getUserProfile(): Promise<UserProfile> {
  return new Promise((resolve, _) => {
    window.electron.ipcRenderer.send("/user/profile");

    window.electron.ipcRenderer.once(
      "/user/profile",
      (_event, data: UserProfile) => {
        
        
         resolve(data);
      }
    );
  });
}

// Update user and entreprise profile (admin only)
export function updateUserProfile(dto: UpdateProfileDto): Promise<{
  user: UserProfile;
  entreprise: UserProfile['entreprise'];
  logoutRequired: boolean;
}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/user/profile/update", { dto });

    window.electron.ipcRenderer.once(
      "/user/profile/update",
      (_event, data: { user: UserProfile; entreprise: UserProfile['entreprise']; logoutRequired: boolean }) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}
