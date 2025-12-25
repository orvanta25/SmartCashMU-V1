// src/renderer/src/api/charge.ts

export interface CreateChargeDto {
  typeChargeId: string;
  montant: number;
  dateEcheance: string;
  datePaiement: string|null;
  dateDebutRepartition: string;
  dateFinRepartition: string;
}

interface UpdateChargeDto {
  typeChargeId?: string;
  montant?: number;
  dateEcheance?: string;
  datePaiement?: string;
  dateDebutRepartition?: string;
  dateFinRepartition?: string;
}

interface SearchChargeDto {
  typeChargeId?: string;
   datePaiementDebut?: string; 
  datePaiementFin?: string;    
  statut?: 'paye' | 'non_paye';
  orderBy?: 'dateEcheance' | 'datePaiement' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

interface CreateChargeResponse {
  message: string;
  charge: any;
}

export interface Charge {
  id: string
  typeCharge: { nom: string }
  typeChargeId:string;
  montant: number
  dateEcheance: string
  datePaiement: string | null
  dateDebutRepartition: string
  dateFinRepartition: string
}

interface FindByIdChargeResponse {
  data: any;
}

interface UpdateChargeResponse {
  message: string;
  charge: any;
}

interface DeleteChargeResponse {
  message: string;
}

interface LastWeekResponse {
  dateDebut: string;
  dateFin: string;
  total: number;
}

// Create a new charge
export function createCharge(
  entrepriseId: string,
  dto: CreateChargeDto
): Promise<CreateChargeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/charge/create",
      (_event, data: CreateChargeResponse ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all charges with optional search params
export function findAllCharge(
  entrepriseId: string,
  searchParams: SearchChargeDto
): Promise<Charge[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/getAll", { entrepriseId, searchParams });

    window.electron.ipcRenderer.once(
      "/charge/getAll",
      (_event, data: Charge[] ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get charge by ID
export function findChargeById(
  entrepriseId: string,
  id: string
): Promise<FindByIdChargeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/getById", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/charge/getById",
      (_event, data: FindByIdChargeResponse ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update charge by ID
export function updateChargeById(
  entrepriseId: string,
  id: string,
  dto: UpdateChargeDto
): Promise<UpdateChargeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/charge/update",
      (_event, data: UpdateChargeResponse ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete charge by ID
export function deleteChargeById(
  entrepriseId: string,
  id: string
): Promise<DeleteChargeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/delete", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/charge/delete",
      (_event, data: DeleteChargeResponse ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get charges of last week
export function getChargesOfLastWeek(
  entrepriseId: string
): Promise<LastWeekResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/charge/lastWeek", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/charge/lastWeek",
      (_event, data: LastWeekResponse ) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}
export function getTotalChargesByDateRange(
  entrepriseId: string,
  dateDebut: string,
  dateFin: string,
  statut?: 'paye' | 'non_paye'
): Promise<number> {
  return new Promise((resolve, reject) => {
    console.log('📤 Envoi IPC /charge/getTotalByDateRange:', {
      entrepriseId,
      dateDebut,
      dateFin,
      statut
    });
    
    const searchParams: SearchChargeDto = {
      datePaiementDebut: dateDebut,
      datePaiementFin: dateFin,
      statut: statut
    };
    
    window.electron.ipcRenderer.send("/charge/getTotalByDateRange", { 
      entrepriseId, 
      searchParams 
    });

    window.electron.ipcRenderer.once(
      "/charge/getTotalByDateRange",
      (_event, data: number) => {
        console.log('📥 Réponse IPC /charge/getTotalByDateRange:', data);
        if (data === undefined || data === null) {
          console.error('❌ Réponse invalide:', data);
          reject(data);
        } else {
          resolve(data);
        }
      }
    );
  });
}