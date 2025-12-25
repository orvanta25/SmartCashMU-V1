export interface UpdateProductFormData {
  designation: string
  categorieId: string
  puht: number
  codeBarre: string
  tva: number
  remise: number
  dateDebutRemise?: string | null
  dateFinRemise?: string | null
  active: boolean
  stockInitial: number
  stockSecurite?: number
  image?: string
  bulkSales: BulkSaleItem[]
  showInPos?: boolean
  type:ProductType
}

export interface VenteParLot {
  id: string;
  qte: number;
  prix: number;
}

export enum ProductType {
  POS = "POS",
  MAGASIN = "MAGASIN"
}


export interface Product {
  id: string;
  designation: string;
  categorieId: string;
  categorie?: { id: string; nom: string };
  puht: number | string;
  codeBarre: string;
  tva: number;
  remise: number;
  type : ProductType
  dateDebutRemise?: string | null;
  dateFinRemise?: string | null;
  active: boolean;
  stockInitial: number;
  quantite: number;
  stockSecurite?: number;
  imagePath?: string;
  showInPos: boolean;
  ventesParLot?: VenteParLot[];
}
export interface BulkSaleItem {
  id: string;
  quantity: number;
  price: number;
}

export interface ProductFormData {
  designation: string;
  categorieId: string;
  puht: number;
  codeBarre: string;
  tva: number;
  remise: number;
  type : ProductType
  dateDebutRemise?: string | null;
  dateFinRemise?: string | null;
  active: boolean;
  stockInitial: number;
  stockSecurite?: number;
  image?: string;
  bulkSales: BulkSaleItem[];
  featuredOnPos: boolean;
}

export interface ProductForList {
  id: string;
  designation: string;
  puht: number | string;
  tva: number;
  remise: number;
  type : ProductType
  dateDebutRemise?: string | null;
  dateFinRemise?: string | null;
  active: boolean;
  quantite: number;
  imagePath?: string;
  hasOperations: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductForPos {
  id: string;
  codeBarre: string;
  designation: string;
  puht: number;
  tva: number;
  remise: number;
  imagePath?: string | null;
  quantite: number;
  categorie?: { id: string; nom: string };
  ventesParLot: VenteParLot[];
  active:Boolean;
  featuredOnPos:Boolean;
}