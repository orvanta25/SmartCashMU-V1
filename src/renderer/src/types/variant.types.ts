// Base types
export interface VariantFamily {
  id: number;
  name: string;
  description?: string | null;
  code: string;
  isRequired: boolean;
  sortOrder: number;
  values?: VariantValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantValue {
  id: number;
  value: string;
  code: string;
  variantFamilyId: number;
  variantFamily?: VariantFamily;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: number;
  productId: string;
  sku: string | null;
  name: string | null;
  priceAdjustment: number;
  costAdjustment: number;
  isActive: boolean;
  values: VariantValue[];
  stocks: ProductVariantStock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantStock {
  id: number;
  productVariantId: number;
  magasinId: string;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface VariantFamilyFormData {
  name: string;
  description?: string;
  code: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface VariantValueFormData {
  value: string;
  variantFamilyId: number;
  sortOrder: number;
}

export interface ProductVariantFormData {
  productId: string;
  sku?: string;
  name?: string;
  priceAdjustment?: number;
  costAdjustment?: number;
  isActive?: boolean;
  variantValueIds: number[];
}

export interface VariantCombination {
  variantValueIds: number[];
  values?: VariantValue[];
  sku?: string;
  priceAdjustment?: number;
  costAdjustment?: number;
}

export interface ProductVariantsGenerateData {
  productId: string;
  variantCombinations: VariantCombination[];
  basePrice: number;
  baseCost: number;
}

// UI State types
export interface SelectedVariantFamily {
  family: VariantFamily;
  selectedValues: VariantValue[];
}

export interface VariantConfiguration {
  hasVariants: boolean;
  selectedFamilies: SelectedVariantFamily[];
  variantCombinations: VariantCombination[];
}