export interface Client {
    id :string
    nom : string;
    prenom : string
    email? : string
    cin : number
    tel : string;
    address? : string
    credit : number;
    //creditCartItems : CartItems
    createdAt : Date
    updatedAt : Date
}

export async function createClient(
    entrepriseId:string,
    dto:Omit<Client,"id"|"createdAt"|"updatedAt">
):Promise<Client|null> {
    try {
        const createdClient = await window.electron.ipcRenderer.invoke("/client/create",{entrepriseId,dto})

        return createdClient
    } catch (error) {
        console.error("impossible de creer le client: ",error);
        throw "impossible de creer le client: "+error
        
    }
}
export async function getClientsByParams(
    entrepriseId:string,
    params:{
        search:string|number
    }
):Promise<Client[]|null> {
    try {
        const clients = await window.electron.ipcRenderer.invoke("/client/get",{entrepriseId,params})

        return clients
    } catch (error) {
        console.error("impossible de recuperer le client: ",error);
        throw "impossible de recuperer le client: "+error
        
    }
}

export async function updateClient(
    id:string,
    dto:Partial<Client>
):Promise<Client|null> {
    try {
        const updatedClient = await window.electron.ipcRenderer.invoke("/client/update",{id,dto})

        return updatedClient
    } catch (error) {
        console.error("impossible de modifier le client: ",error);
        throw "impossible de modifier le client: "+error
        
    }
}

export async function deleteClient(
    id:string
):Promise<Client|null> {
    try {
        const deletedClient = await window.electron.ipcRenderer.invoke("/client/delete",{id})

        return deletedClient
    } catch (error) {
        console.error("impossible de supprimer le client: ",error);
        throw "impossible de supprimer le client: "+error
        
    }
}
