

export interface Category {
  id: string;
  nom: string;
  createdAt: string;
  updatedAt: string;
  showInPos: boolean;
}

export interface CategoryForPos {
  id: string;
  nom: string;
  showInPos: boolean;
}

export interface CategoriesResponse {
  data: {
    id: string;
    nom: string;
    createdAt: string; 
    showInPos: boolean;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategorieDto {
  nom: string;
  showInPos?: boolean;
}

export interface UpdateCategorieDto {
  nom?: string;
  showInPos?: boolean;
}
