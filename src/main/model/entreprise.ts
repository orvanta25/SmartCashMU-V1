import { EntrepriseType } from "@prisma/client";

export interface Entreprise {
  id: string;
  nom: string;
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
export interface UpdateEntrepriseDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  denomination?: string;
  matriculeFiscale?: string;
  secteurActivite?: string;
  region?: string;
  ville?: string;
  pays?: string;
}

export interface UpdateTypeDto {
  type:EntrepriseType
}
export interface UpdateEpicerieModuleDto {
  hasEpicerieModule: boolean;
}