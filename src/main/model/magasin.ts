export interface CreateMagasinDto {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  denomination: string;
  secteurActivite: string;
  region: string;
  ville: string;
  pays: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateMagasinDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  denomination?: string;
  secteurActivite?: string;
  region?: string;
  ville?: string;
  pays?: string;
  password?: string;
  confirmPassword?: string;
}

export interface Magasin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  denomination: string;
  secteurActivite: string;
  region: string;
  ville: string;
  pays: string;
  type: string;
  parentEntrepriseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMagasinResponse {
  magasin: Magasin;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}