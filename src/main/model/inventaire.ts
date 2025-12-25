export interface InventoryItem {
  id: string;
  responsable: string;
  codeBarre: string;
  designation: string;
  quantite: number;
  createdAt: string;
  createdTime?: string;
  entrepriseId: string;
  updatedAt?: string;
  updatedTime?: string;
}

export interface SearchFilters {
  searchQuery?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface InventoryForm {
  responsable: string;
  codeBarre: string;
  designation: string;
  quantity: number;
}
export interface UpdateInventory {
    responsable:string;
    quantite:number
}
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