export interface IProductVariant {
  id: number;
  productId: string;
  sku: string | null;
  name: string | null;
  priceAdjustment: number;
  costAdjustment: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariantWithRelations extends IProductVariant {
  values: IVariantValue[];
  stocks: IProductVariantStock[];
}

export interface IProductVariantCreate {
  productId: string;
  sku?: string;
  name?: string;
  priceAdjustment?: number;
  costAdjustment?: number;
  isActive?: boolean;
  variantValueIds: number[];
}

export interface IProductVariantUpdate extends Partial<Omit<IProductVariantCreate, 'productId'>> {}

export interface IProductVariantStock {
  id: number;
  productVariantId: number;
  magasinId: string;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariantStockUpdate {
  quantity: number;
  minStock?: number;
  maxStock?: number | null;
}

export interface IProductVariantCombination {
  variantValueIds: number[];
  sku?: string;
  priceAdjustment?: number;
  costAdjustment?: number;
}

export interface IProductVariantsGenerate {
  productId: string;
  variantCombinations: IProductVariantCombination[];
  basePrice: number;
  baseCost: number;
}