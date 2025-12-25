//renderer/src/api/acc.ts

import { Entreprise } from "./entreprise"

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

// DTOs
interface CreateAccDto {
  codeBarre: string;
  quantite: number;
  responsable: string;
  remarque?: string;
  designation: string;
}

interface UpdateAccDto {
  quantite?: number;
  responsable?: string;
  remarque?: string;
}

interface SearchAccDto {
  codeBarre?: string;
  designation?: string;
  responsable?: string;
  dateDebut?: string;
  dateFin?: string;
}

interface FindByIdAccResponse {
  data: any;
}

interface UpdateAccResponse {
  message: string;
  acc: any;
}
interface GetAccByProductResponse {
  accidents: any[];
  totalQuantite: number;
}
// Get accident by productId
export function getAccByProductId(
  entrepriseId: string,
  codeBarre: string,
  searchParams: SearchAccDto
): Promise<GetAccByProductResponse> {
  return new Promise((resolve, reject) => {
    console.log("📤 Sending IPC for getAccByProductId:", { entrepriseId, codeBarre, searchParams });
    
    window.electron.ipcRenderer.send("/acc/get/entrepriseId/product/codeBarre", {
      entrepriseId,
      codeBarre,
      params: searchParams,
    });

    window.electron.ipcRenderer.once(
      "/acc/get/entrepriseId/product/codeBarre",
      (_, data: GetAccByProductResponse & { error?: string } | null) => { // ← Ajoutez | null
        console.log("📥 Received IPC response for getAccByProductId:", data);
        
        // Gestion complète des cas
        if (!data) {
          console.warn("⚠️ No data received from getAccByProductId, returning default");
          resolve({ accidents: [], totalQuantite: 0 }); // ← Résolvez avec une valeur par défaut
        } else if (data.error) {
          console.error("❌ Error in getAccByProductId response:", data.error);
          reject(new Error(data.error));
        } else {
          console.log("✅ Successfully received accident data");
          resolve(data);
        }
      }
    );

    // Timeout de sécurité
    setTimeout(() => {
      console.warn("⏰ Timeout for getAccByProductId, returning default");
      resolve({ accidents: [], totalQuantite: 0 });
    }, 10000); // 10 secondes timeout
  });
}

// Create a new accident
export function createAcc(
  entrepriseId: string,
  dto: CreateAccDto
): Promise<Acc> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/acc/create/entrepriseId", {
      entrepriseId:entrepriseId,
      dto:dto,
    });

    window.electron.ipcRenderer.once(
      "/acc/create/entrepriseId",
      (_, data: Acc & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all accidents for an entreprise
export function findAllAcc(
  entrepriseId: string,
  searchParams: SearchAccDto
): Promise<Acc[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/acc/getAll/entrepriseId", {
      entrepriseId,
      searchParams: searchParams,
    });

    window.electron.ipcRenderer.once(
      "/acc/getAll/entrepriseId",
      (_, data: Acc[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get accident by ID for an entreprise
export function findAccById(
  entrepriseId: string,
  id: string
): Promise<FindByIdAccResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/acc/getById/entrepriseId/id", {
      entrepriseId,
      id,
    });

    window.electron.ipcRenderer.once(
      "/acc/getById/entrepriseId/id",
      (_, data: FindByIdAccResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update accident by ID for an entreprise
export function updateAccById(
  entrepriseId: string,
  id: string,
  dto: UpdateAccDto
): Promise<UpdateAccResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/acc/update/entrepriseId/id", {
      entrepriseId,
      id,
      dto,
    });

    window.electron.ipcRenderer.once(
      "/acc/update/entrepriseId/id",
      (_, data: UpdateAccResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

export function getTotalAccMontantByDateRange(
  entrepriseId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log("📤 Sending IPC for getTotalAccMontantByDateRange:", { entrepriseId, startDate, endDate });
    
    window.electron.ipcRenderer.send("/acc/getTotalMontantByDateRange/entrepriseId", {
      entrepriseId,
      startDate,
      endDate,
    });

    window.electron.ipcRenderer.once(
      "/acc/getTotalMontantByDateRange/entrepriseId",
      (_, data: { total: number } & { error?: string }) => {
        console.log("📥 Received IPC response for getTotalAccMontantByDateRange:", data);
        
        if (data.error) {
          console.error("❌ Error in getTotalAccMontantByDateRange response:", data.error);
          reject(new Error(data.error));
        } else {
          console.log("✅ Successfully received total ACC montant:", data.total || 0);
          resolve(data.total || 0);
        }
      }
    );

    setTimeout(() => {
      console.warn("⏰ Timeout for getTotalAccMontantByDateRange, returning 0");
      resolve(0);
    }, 30000);
  });
}