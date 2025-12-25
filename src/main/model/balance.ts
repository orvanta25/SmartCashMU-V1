export interface BalanceConfig {
  id: number;
  entrepriseId: string;
  barcodeLength: number;
  balanceCode: string;
  productCodeStart: number;
  productCodeLength: number;
  priceStart: number;
  priceLength: number;
  sellerStart?: number|null;
  sellerLength: number|null;
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

export interface CreateBalanceConfigResponse {
  message: string;
  balanceConfig: BalanceConfig;
}

export interface UpdateBalanceConfigResponse {
  message: string;
  balanceConfig: BalanceConfig;
}

export interface DeleteBalanceConfigResponse {
  message: string;
}
