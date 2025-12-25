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

interface InventoryForm {
  responsable: string;
  codeBarre: string;
  designation: string;
  quantity: number;
}
export interface UpdateInventory {
    responsable:string;
    quantite:number
}



export function getAllInventory(entrepriseId:string, dto:SearchFilters):Promise<InventoryItem[]>{
    return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/inventaire/get/all", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/inventaire/get/all",
      (_event, data:  InventoryItem[]) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}


export function updateInventorById(entrepriseId:string, id:string,dto:UpdateInventory):Promise<InventoryItem>{
    return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/inventaire/update", { entrepriseId,id, dto });

    window.electron.ipcRenderer.once(
      "/inventaire/update",
      (_event, data:  InventoryItem) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}


export function createInventory(entrepriseId:string,dto:InventoryForm):Promise<InventoryItem>{
    return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/inventaire/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/inventaire/create",
      (_event, data:  InventoryItem) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}



