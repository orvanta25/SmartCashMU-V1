

export interface BalanceConfig {
  id: number;
  entrepriseId: string;
  barcodeLength: number;
  balanceCode: string;
  productCodeStart: number;
  productCodeLength: number;
  priceStart: number;
  priceLength: number;
  sellerStart?: number;
  sellerLength?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBalanceConfigDto {
  entrepriseId: string;
  barcodeLength: number;
  balanceCode: string;
  productCodeStart: number;
  productCodeLength: number;
  priceStart: number;
  priceLength: number;
  sellerStart?: number;
  sellerLength?: number;
}

export interface UpdateBalanceConfigDto {
  barcodeLength?: number;
  balanceCode?: string;
  productCodeStart?: number;
  productCodeLength?: number;
  priceStart?: number;
  priceLength?: number;
  sellerStart?: number;
  sellerLength?: number;
}

interface CreateBalanceConfigResponse {
  message: string;
  balanceConfig: BalanceConfig;
}

interface UpdateBalanceConfigResponse {
  message: string;
  balanceConfig: BalanceConfig;
}

interface DeleteBalanceConfigResponse {
  message: string;
}

// Renderer side: src/services/balance.ts

// Create a new balance configuration
export const createBalanceConfig = (entrepriseId: string, dto: CreateBalanceConfigDto): Promise<CreateBalanceConfigResponse> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once("/balance/create", (_event, data: CreateBalanceConfigResponse & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};

// Get all balance configurations for an entreprise
export const getAllBalanceConfigs = (entrepriseId: string): Promise<BalanceConfig[]> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/getAll", { entrepriseId });

    window.electron.ipcRenderer.once("/balance/getAll", (_event, data: BalanceConfig[] & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};

// Get a balance configuration by ID
export const getBalanceConfigById = (entrepriseId: string, id: number): Promise<BalanceConfig> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/getById", { entrepriseId, id });

    window.electron.ipcRenderer.once("/balance/getById", (_event, data: BalanceConfig & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};

// Get a balance configuration by ID
export const getBalanceConfigByCode = (entrepriseId: string, balanceCode: string): Promise<BalanceConfig[]> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/getByCode", { entrepriseId, balanceCode });

    window.electron.ipcRenderer.once("/balance/getByCOde", (_event, data: BalanceConfig[] & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};

// Update a balance configuration
export const updateBalanceConfig = (entrepriseId: string, id: number, dto: UpdateBalanceConfigDto): Promise<UpdateBalanceConfigResponse> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once("/balance/update", (_event, data: UpdateBalanceConfigResponse & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};

// Delete a balance configuration
export const deleteBalanceConfig = (entrepriseId: string, id: number): Promise<DeleteBalanceConfigResponse> => {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/balance/delete", { entrepriseId, id });

    window.electron.ipcRenderer.once("/balance/delete", (_event, data: DeleteBalanceConfigResponse & { error?: string }) => {
      if (data.error) reject(data);
      else resolve(data);
    });
  });
};
