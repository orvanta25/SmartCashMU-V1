import { Entreprise } from "./entreprise";

// DTOs
export interface CreateAccDto {
  codeBarre: string;
  quantite: number;
  responsable: string;
  remarque?: string;
  designation:string
}

export interface UpdateAccDto {
  quantite?: number;
  responsable?: string;
  remarque?: string;
}

export interface SearchAccDto {
  responsable: string;
  codeBare: string;
  startDate: string;
  endDate: string;
}
export interface Acc {
  id           :  string   
  codeBarre    : string
  designation  : string
  quantite     : number
  responsable  : string
  remarque    ?: string
  entrepriseId : string     
  entreprise   : Entreprise
  createdAt    : Date
  updatedAt    : Date
}
// Response Interfaces
export interface CreateAccResponse {
  message: string;
  acc: Acc;
}


export interface UpdateAccResponse {
  message: string;
  acc: Acc;
}
export interface GetAccByProductResponse {
  accidents: any[];
  totalQuantite: number;
}
