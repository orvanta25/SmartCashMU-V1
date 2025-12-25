export enum EntrepriseType {
  COMMERCANT = 'COMMERCANT',
  FOURNISSEUR = 'FOURNISSEUR',
  FRANCHISE = 'FRANCHISE'
}
export interface UpdateTypeDto {
  type:EntrepriseType
}
export interface CreateEntrepriseDto {
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
  codePin: string;
}

export interface LoginDto {
  codePin: string;
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