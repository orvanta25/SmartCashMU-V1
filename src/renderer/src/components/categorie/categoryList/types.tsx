export interface Category {
  id: string;
  nom: string;
  createdAt: string;
  showInPos: boolean;
}

export interface CategoryTableProps {
  categories: Category[];
  error: string | null;
  onUpdateCategory: (id: string, newName: string, newShowInPos: boolean) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}