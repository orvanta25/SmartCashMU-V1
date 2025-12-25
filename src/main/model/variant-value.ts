export interface IVariantValue {
  id: number;
  value: string;
  variantFamilyId?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariantValueCreate {
  value: string;
 
  variantFamilyIdµ?: number | null;
  sortOrder?: number;
}

export interface IVariantValueUpdate extends Partial<IVariantValueCreate> {}