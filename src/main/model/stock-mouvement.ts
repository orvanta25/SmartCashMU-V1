import { ProductType } from "./produit";

export interface StockMovement {
  id: string;
  date: string;
  time?: string;
  codeBarre: string;
  designation: string;
  stockInitial: number;
  stockSecurite: number;
  achats: number;
  ventes: number;
  acc: number;
  retour: number;
  stockFinalTheoric: number;
  stockFinalReal: number | null;
  ecart: number | null;
  updatedAt?: string;
  updatedTime?: string;
}

export interface MovementStockSearchFilters {
  codeBarre: string;
  designation: string;
  dateDebut: string;
  dateFin: string;
}
export enum StockMouvementType {
  ACHAT = "ACHAT",
  VENTE = "VENTE",
  ACC = "ACC",
  UPDATE = "UPDATE",
  CREATE = "CREATE",
  INVENTAIRE = "INVENTAIRE",
  RETOUR = "RETOUR"
}

export interface UpdateStockMouvementDto {
    designation:string;
    codeBarre: string;
    operation: StockMouvementType;
    stockInitial:number;
    stockSecurite:number;
    acc:number;
    achats:number;
    ventes:number;
    inventories:number;
    retour: number;
    productType:ProductType
}