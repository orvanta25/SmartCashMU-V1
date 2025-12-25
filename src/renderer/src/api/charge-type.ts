export interface CreateChargeTypeDto{
    nom:string
}

export interface UpdateChargeTypeDto{
    nom:string
}

export interface TypeCharge {
  id: string
  nom: string
}

export function createChargeType(
    entrepriseId:string,
    dto:CreateChargeTypeDto
):Promise<TypeCharge>{
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send("/chargetype/create", {
          entrepriseId:entrepriseId,
          dto:dto
        });
    
        window.electron.ipcRenderer.on(
          "/chargetype/create",
          (_event, data: TypeCharge) => {
            if (!data) reject(data);
            else resolve(data);
            }
        );
    
      });
}

export function updateChargeType(
    entrepriseId:string,
    id:string,
    dto:UpdateChargeTypeDto
):Promise<TypeCharge>{
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send("/chargetype/update", {
          entrepriseId:entrepriseId,
          id:id,
          dto:dto
        });
    
        window.electron.ipcRenderer.on(
          "/chargetype/update",
          (_event, data: TypeCharge) => {
            if (!data) reject(data);
            else resolve(data);
            }
        );
    
      });
}

export function getAllChargeType(
    entrepriseId:string
):Promise<TypeCharge[]>{
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send("/chargetype/get/all", {
          entrepriseId:entrepriseId
        });
    
        window.electron.ipcRenderer.on(
          "/chargetype/get/all",
          (_event, data: TypeCharge[]) => {
            if (!data) reject(data);
            else resolve(data);
            }
        );
    
      });
}

export function deleteChargeType(
    entrepriseId:string,
    id:string
):Promise<TypeCharge>{
    return new Promise((resolve, reject) => {
        window.electron.ipcRenderer.send("/chargetype/delete", {
          entrepriseId:entrepriseId,
          id:id
        });
    
        window.electron.ipcRenderer.on(
          "/chargetype/delete",
          (_event, data: TypeCharge) => {
            if (!data) reject(data);
            else resolve(data);
            }
        );
    
      });
}