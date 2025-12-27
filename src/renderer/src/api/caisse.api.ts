export interface Caisse {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: "online" | "offline" | "syncing" | "error";
  lastSync: string | null;
  isActive: boolean;
  createdAt: string;
  macAddress?: string;
  version?: string;
  isCentral?: boolean;
  storeId?: string;
}

export interface CreateCaisseDto {
  name: string;
  ip: string;
  port: number;
  macAddress?: string;
  isCentral?: boolean;
}

export interface UpdateCaisseDto {
  name?: string;
  ip?: string;
  port?: number;
  macAddress?: string;
  isCentral?: boolean;
}

export const caisseApi = {
  async getAll(): Promise<Caisse[]> {
    const result = await window.electron.caisse.getAll();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async getById(id: string): Promise<Caisse> {
    const result = await window.electron.caisse.getById(id);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async create(data: CreateCaisseDto): Promise<Caisse> {
    const result = await window.electron.caisse.create(data);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async update(id: string, data: UpdateCaisseDto): Promise<Caisse> {
    const result = await window.electron.caisse.update(id, data);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await window.electron.caisse.delete(id);
    if (!result.success) {
      throw new Error(result.error);
    }
  },

  async test(id: string): Promise<{
    status: 'online' | 'offline';
    version?: string;
    latency?: number;
  }> {
    const result = await window.electron.caisse.test(id);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async setCentral(id: string): Promise<Caisse> {
    const result = await window.electron.caisse.setCentral(id);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  async removeCentral(): Promise<void> {
    const result = await window.electron.caisse.removeCentral();
    if (!result.success) {
      throw new Error(result.error);
    }
  }
};