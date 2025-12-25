//orvanta-frontend\app\api\my-facture.ts


// Response DTOs matching the backend structure
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
  logo?: string;
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
  denomination: string |null;
  matriculeFiscale: string;
  banque: string;
  rib: string;
  logo: File | null;
  adresses?: string[];
  emails?: string[];
  telephones?: string[];
  mobiles?: string[];
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
interface CreateMyFactureResponse {
  message: string;
  myFacture: MyFacture;
}

interface UpdateMyFactureResponse {
  message: string;
  myFacture: MyFacture;
}

interface DeleteMyFactureResponse {
  message: string;
}

interface DeleteMyFactureLogoResponse {
  message: string;
  myFacture: MyFacture;
}

interface AddAddressResponse {
  message: string;
  address: MyFactureAdresse;
}

interface RemoveAddressResponse {
  message: string;
}

// Create a new MyFacture with optional logo file
// Create a new MyFacture
export function createMyFacture(
  entrepriseId: string,
  dto: CreateMyFactureDto
): Promise<CreateMyFactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/my-facture/create",
      (_event, data: CreateMyFactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get MyFacture for an entreprise
export function getMyFacture(entrepriseId: string): Promise<MyFacture> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/get", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/my-facture/get",
      (_event, data: MyFacture & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update a MyFacture
export function updateMyFacture(
  entrepriseId: string,
  id: string,
  dto: UpdateMyFactureDto
): Promise<UpdateMyFactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/my-facture/update",
      (_event, data: UpdateMyFactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete a MyFacture
export function deleteMyFacture(
  entrepriseId: string,
  id: string
): Promise<DeleteMyFactureResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/delete", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/my-facture/delete",
      (_event, data: DeleteMyFactureResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete MyFacture logo
export function deleteMyFactureLogo(
  entrepriseId: string,
  id: string
): Promise<DeleteMyFactureLogoResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/deleteLogo", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/my-facture/deleteLogo",
      (_event, data: DeleteMyFactureLogoResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Add an address to MyFacture
export function addAddress(
  entrepriseId: string,
  myFactureId: string,
  adresse: string
): Promise<AddAddressResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/addAddress", { entrepriseId, myFactureId, adresse });

    window.electron.ipcRenderer.once(
      "/my-facture/addAddress",
      (_event, data: AddAddressResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Remove an address from MyFacture
export function removeAddress(
  entrepriseId: string,
  myFactureId: string,
  addressId: string
): Promise<RemoveAddressResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/my-facture/removeAddress", { entrepriseId, myFactureId, addressId });

    window.electron.ipcRenderer.once(
      "/my-facture/removeAddress",
      (_event, data: RemoveAddressResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Helper function to prepare FormData (remains unchanged)
export const prepareMyFactureFormData = (data: CreateMyFactureDto | UpdateMyFactureDto)=> {
  return data
};
