export interface IVariantFamily {
  id: number;
  name: string;
  description?: string | null;
  code: string;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariantFamilyCreate {
  name: string;
  description?: string;
  code: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface IVariantFamilyUpdate extends Partial<IVariantFamilyCreate> {}