import { UserRole } from "@prisma/client";

export interface UserProfile {
  id: string;
  nom: string|null;
  prenom: string|null;
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

export interface CreateUserData {
  nom: string
  prenom: string
  telephone: string
  password: string
  role: UserRole
  magasinId?: string
  entrepriseId?: string
}

export interface CreateUserResponse {
  id: string
  nom: string | null
  prenom: string | null
  email: string | null
  telephone: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}
export interface UpdateProfileDto {
  id:string;
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  denomination?: string;
  matriculeFiscale?: string;
  secteurActivite?: string;
  region?: string;
  ville?: string;
  pays?: string;
  codePin?: string;
}