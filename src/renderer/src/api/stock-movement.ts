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

export function getInventoryByParams(entrepriseId:string,dto:MovementStockSearchFilters):Promise<StockMovement[]>{
    return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/inventaire/get/stock", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/inventaire/get/stock",
      (_event, data:  StockMovement[]) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}