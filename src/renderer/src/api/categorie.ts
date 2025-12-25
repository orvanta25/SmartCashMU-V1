// orvanta-frontend\app\api\categorie.ts


interface Category {
  id: string;
  nom: string;
  createdAt: string;
  updatedAt: string;
  showInPos: boolean;
}

interface CategoryForPos {
  id: string;
  nom: string;
}

interface CategoriesResponse {
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

// Create a new category
export function createCategory(
  entrepriseId: string,
  dto: CreateCategorieDto
): Promise<Category> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/create", { entrepriseId, dto });

    window.electron.ipcRenderer.once(
      "/categorie/create",
      (_event, data: Category & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get categories with optional search and pagination
export function getCategories(
  entrepriseId: string,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<CategoriesResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/getAll", { entrepriseId, search, page, limit });

    window.electron.ipcRenderer.once(
      "/categorie/getAll",
      (_event, data: CategoriesResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get categories for POS
export function getCategoriesForPos(entrepriseId: string): Promise<CategoryForPos[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/getForPos", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/categorie/getForPos",
      (_event, data: CategoryForPos[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get categories for products
export function getCategoriesForProduct(entrepriseId: string): Promise<CategoryForPos[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/getForProduct", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/categorie/getForProduct",
      (_event, data: CategoryForPos[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all categories
export function getCategoriesAll(entrepriseId: string): Promise<CategoryForPos[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/getAllCategories", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/categorie/getAllCategories",
      (_event, data: CategoryForPos[] & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update a category
export function updateCategory(
  entrepriseId: string,
  id: string,
  dto: UpdateCategorieDto
): Promise<Category> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/update", { entrepriseId, id, dto });

    window.electron.ipcRenderer.once(
      "/categorie/update",
      (_event, data: Category & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Delete a category
export function deleteCategory(
  entrepriseId: string,
  id: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/categorie/delete", { entrepriseId, id });

    window.electron.ipcRenderer.once(
      "/categorie/delete",
      (_event, data: { error?: string }) => {
        if (data.error) reject(data);
        else resolve();
      }
    );
  });
}
