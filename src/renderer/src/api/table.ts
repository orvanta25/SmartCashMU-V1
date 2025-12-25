
import { Commande } from '../types/commande';

export interface FloorPlan {
  id: string;
  name: string;
  elements: any[];
  entrepriseId: string;
  createdAt: string;
  updatedAt: string;
  tables: {
    id: string;
    number: string;
    serverId?: string;
    server?: {
      id: string;
      nom: string;
      prenom: string;
    };
  }[];
}

interface Table {
  id: string;
  number: string;
  entrepriseId: string;
  floorPlanId: string;
  serverId?: string;
  server?: {
    id: string;
    nom: string;
    prenom: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFloorPlanDto {
  name: string;
  elements: any[];
}

interface UpdateFloorPlanDto {
  name?: string;
  elements?: any[];
}

export interface CreateTableDto {
  number: string;
  floorPlanId: string;
  serverId?: string;
}

interface UpdateTableDto {
  number?: string;
  serverId?: string;
}

interface AssignServerDto {
  serverId: string;
}

// floorTableApi.ts (Renderer)

// -------- Floor Plan --------
export function createFloorPlan(dto: CreateFloorPlanDto): Promise<FloorPlan> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/floor-plan/create", dto);

    window.electron.ipcRenderer.once("/floor-plan/create", (_event, data: { response?: FloorPlan; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function getFloorPlan(id: string): Promise<FloorPlan> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/floor-plan/get", { id });

    window.electron.ipcRenderer.once("/floor-plan/get", (_event, data: { response?: FloorPlan; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function getAllFloorPlans(): Promise<FloorPlan[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/floor-plan/get-all");

    window.electron.ipcRenderer.once("/floor-plan/get-all", (_event, data: { response?: FloorPlan[]; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function updateFloorPlan(id: string, dto: UpdateFloorPlanDto): Promise<FloorPlan> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/floor-plan/update", { id, dto });

    window.electron.ipcRenderer.once("/floor-plan/update", (_event, data: { response?: FloorPlan; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function deleteFloorPlan(id: string): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/floor-plan/delete", { id });

    window.electron.ipcRenderer.once("/floor-plan/delete", (_event, data: { response?: { message: string }; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

// -------- Table --------
export function createTable(dto: CreateTableDto): Promise<Table> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/create", dto);

    window.electron.ipcRenderer.once("/table/create", (_event, data: { response?: Table; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function getTable(id: string): Promise<Table> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/get", { id });

    window.electron.ipcRenderer.once("/table/get", (_event, data: { response?: Table; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function getAllTables(): Promise<Table[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/get-all");

    window.electron.ipcRenderer.once("/table/get-all", (_event, data: { response?: Table[]; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function getTableCommande(id: string): Promise<Commande | null> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/get-commande", { id });

    window.electron.ipcRenderer.once("/table/get-commande", (_event, data: { response?: Commande | null; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response ?? null);
    });
  });
}

export function updateTable(id: string, dto: UpdateTableDto): Promise<Table> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/update", { id, dto });

    window.electron.ipcRenderer.once("/table/update", (_event, data: { response?: Table; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function assignServer(id: string, dto: AssignServerDto): Promise<Table> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/assign-server", { id, dto });

    window.electron.ipcRenderer.once("/table/assign-server", (_event, data: { response?: Table; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}

export function deleteTable(id: string): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/table/delete", { id });

    window.electron.ipcRenderer.once("/table/delete", (_event, data: { response?: { message: string }; error?: string }) => {
      if (data.error) reject(data);
      else resolve(data.response!);
    });
  });
}
