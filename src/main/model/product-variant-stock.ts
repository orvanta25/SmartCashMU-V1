import { ProductVariantStock as PrismaProductVariantStock } from '@prisma/client';

export interface IProductVariantStock extends PrismaProductVariantStock {
  // Les relations seront chargées séparément si nécessaire
}

export interface IProductVariantStockCreate {
  productVariantId: number;
  magasinId: string;
  quantity: number;
  minStock: number;
  maxStock?: number | null;
}

export interface IProductVariantStockUpdate {
  quantity?: number;
  minStock?: number;
  maxStock?: number | null;
}

export interface IProductVariantStockWithRelations extends IProductVariantStock {
  productVariant?: {
    id: number;
    sku: string | null;
    name: string | null;
    product?: {
      id: string;
      designation: string;
      codeBarre: string;
    };
    values?: Array<{
      id: number;
      value: string;
      code: string;
      variantFamily?: {
        id: number;
        name: string;
      };
    }>;
  };
  magasin?: {
    id: string;
    nom: string;
    code: string;
  };
}

export interface IStockMovement {
  id?: number;
  productVariantId: number;
  magasinId: string;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'TRANSFERT';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference?: string; 
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
}

export interface IStockUpdateRequest {
  productVariantId: number;
  magasinId: string;
  quantity: number;
  type?: 'SET' | 'INCREMENT' | 'DECREMENT';
  reference?: string;
  notes?: string;
}

export interface IStockAlert {
  productVariantId: number;
  magasinId: string;
  currentQuantity: number;
  minStock: number;
  maxStock: number | null;
  status: 'BELOW_MIN' | 'ABOVE_MAX' | 'OK';
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}