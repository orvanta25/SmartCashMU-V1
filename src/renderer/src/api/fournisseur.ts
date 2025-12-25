export interface Fournisseur {
    id:string;
    mails: string[],
    fixedTel: string,
    mobileTel: string,
    denomination: string,
    matricule: string,
    secteur: string,
    rib: string,
    addresses: string[],
}

export async function addFournisseur(
  entrepriseId: string,
  dto:Omit<Fournisseur,"id"|"createdAt"|"updatedAt">
): Promise<Fournisseur> {
  
    try {
        const addedFournisseur = await window.electron.ipcRenderer.invoke("/fournisseur/create", { entrepriseId, dto });

        return addedFournisseur
    } catch (error) {
        console.error("Failed to create fournisseur: ",error);
        
        throw "Failed to create fournisseur: "+error
    }
    
}

export async function getFournisseursByParams(
    entrepriseId:string,
    params:{
        denomination:string,
    }
) {
   try {
        const fournisseurs = await window.electron.ipcRenderer.invoke("/fournisseur/get", { entrepriseId, params });

        return fournisseurs
    } catch (error) {
        console.error("Failed to get fournisseurs: ",error);
        
        throw "Failed to get fournisseurs: "+error
    }
}

export async function updateFournisseur(
  id: string,
  dto:Partial<Fournisseur>
): Promise<Fournisseur> {
  
    try {
        const updatedFournisseur = await window.electron.ipcRenderer.invoke("/fournisseur/update", { id, dto });

        return updatedFournisseur
    } catch (error) {
        console.error("Failed to create fournisseur: ",error);
        
        throw "Failed to create fournisseur: "+error
    }
    
}

export async function deleteFournisseur(
  id: string
): Promise<Fournisseur> {
  
    try {
        const deletedFournisseur = await window.electron.ipcRenderer.invoke("/fournisseur/delete", { id });

        return deletedFournisseur
    } catch (error) {
        console.error("Failed to delete fournisseur: ",error);
        
        throw "Failed to delete fournisseur: "+error
    }
    
}

