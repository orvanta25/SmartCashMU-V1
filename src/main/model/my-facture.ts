export interface MyFactureAdresse {
  id: string;
  adresse: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyFactureEmail {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyFactureTelephone {
  id: string;
  numTel: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyFactureMobile {
  id: string;
  numMobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyFacture {
  id: string;
  denomination: string;
  matriculeFiscale: string;
  banque: string;
  rib: string;
  logo: File |null;
  entrepriseId: string;
  adresses: MyFactureAdresse[];
  emails: MyFactureEmail[];
  telephones: MyFactureTelephone[];
  mobiles: MyFactureMobile[];
  createdAt: string;
  updatedAt: string;
}

// Request DTOs for creating/updating MyFacture
export interface CreateMyFactureDto {
  denomination: string;
  matriculeFiscale: string;
  banque: string;
  rib: string;
  logo: string |null;
  adresses: string[] | null;
  emails: string[] | null;
  telephones: string[] |null;
  mobiles: string[]  |null;
}

export interface UpdateMyFactureDto {
  denomination?: string;
  matriculeFiscale?: string;
  banque?: string;
  rib?: string;
  logo?: File;
  adresses?: string[];
  emails?: string[];
  telephones?: string[];
  mobiles?: string[];
}

// API Response interfaces
export interface CreateMyFactureResponse {
  message: string;
  myFacture: MyFacture;
}

export interface UpdateMyFactureResponse {
  message: string;
  myFacture: MyFacture;
}

export interface DeleteMyFactureResponse {
  message: string;
}

export interface DeleteMyFactureLogoResponse {
  message: string;
  myFacture: MyFacture;
}

export interface AddAddressResponse {
  message: string;
  address: MyFactureAdresse;
}

export interface RemoveAddressResponse {
  message: string;
}
