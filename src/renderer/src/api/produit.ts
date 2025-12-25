export interface UpdateProductFormData {
  designation: string
  categorieId: string
  puht: number
  codeBarre: string
  tva: number
  remise: number
  type:ProductType;
  dateDebutRemise?: string | null
  dateFinRemise?: string | null
  active: boolean
  stockInitial: number
  stockSecurite?: number
  image?: string
  bulkSales: BulkSaleItem[]
  showInPos?: boolean
}
interface BulkSaleItem {
  id: string
  quantity: number
  price: number
}

interface VenteParLot {
  id: string;
  qte: number;
  prix: number;
}
export enum ProductType {
  POS = "POS",
  MAGASIN = "MAGASIN"
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

export interface Product {
  id: string;
  designation: string;
  categorieId: string;
  categorie?: { id: string; nom: string };
  puht: number | string;
  codeBarre: string;
  tva: number;
  remise: number;
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

export interface ProductForList {
  id: string;
  designation: string;
  puht: number | string;
  tva: number;
  remise: number;
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
  type:ProductType;
  imagePath?: string | null;
  quantite: number;
  categorie?: { id: string; nom: string };
  ventesParLot: VenteParLot[];
  active:Boolean;
  featuredOnPos:Boolean
}

// Create a new product
// Create a product
export function createProduct(entrepriseId: string, formData: ProductFormData): Promise<Product> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/create", { entrepriseId, formData });

    window.electron.ipcRenderer.once(
      "/produit/create",
      (_event, data: Product) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Fetch all products
export function getProducts(entrepriseId: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/all", { entrepriseId });

    window.electron.ipcRenderer.once(
      "/produit/all",
      (_event, data:  Product[]) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Fetch a single product
export function getProductById(entrepriseId: string, productId: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/get", { entrepriseId, productId });

    window.electron.ipcRenderer.once(
      "/produit/get",
      (_event, data: Product) => {
        if (!data) reject(data);
        else resolve(data);
      }
    );
  });
}

// Activate a product
export function activateProduct(entrepriseId: string, productId: string): Promise<{success:Boolean}>{
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/activate", { entrepriseId, productId });

    window.electron.ipcRenderer.once("/produit/activate", (_event, data: { success: boolean; error?: string }) => {
      if (data.success === false) reject(data);
      else resolve(data);
    });
  });
}

// Deactivate a product
export function deactivateProduct(entrepriseId: string, productId: string): Promise<{success:Boolean}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/deactivate", { entrepriseId, productId });

    window.electron.ipcRenderer.once("/produit/deactivate", (_event, data: { success: boolean; error?: string }) => {
      if (data.success === false) reject(data);
      else resolve(data);
    });
  });
}

// Delete a product
export function deleteProduct(entrepriseId: string, productId: string): Promise<{success:Boolean}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/delete", { entrepriseId, productId });

    window.electron.ipcRenderer.once("/produit/delete", (_event, data: { success: boolean; error?: string }) => {
      if (data.success === false) reject(data);
      else resolve(data);
    });
  });
}

// Get product by barcode
export function getProductByBarcode(entrepriseId: string, codeBarre: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/by-barcode", { entrepriseId, codeBarre });

    window.electron.ipcRenderer.once(
      "/produit/by-barcode",
      (_event, data: Product) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Delete product's image
export function deleteProductPhoto(entrepriseId: string, productId: string): Promise<{success:Boolean}> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/delete-photo", { entrepriseId, productId });

    window.electron.ipcRenderer.once("/produit/delete-photo", (_event, data: { success: boolean; error?: string }) => {
      if (data.success === false ) reject(data);
      else resolve(data);
    });
  });
}

// Update a product
export function updateProduct(entrepriseId: string, productId: string, formData: UpdateProductFormData): Promise<Product> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/update", { entrepriseId, productId, formData });

    window.electron.ipcRenderer.once(
      "/produit/update",
      (_event, data: Product) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Get all for list
export function getAllForList(
  entrepriseId: string,
  page: number = 1,
  limit: number = 8,
  search: string = ""
): Promise<PaginatedResponse<ProductForList>> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/list/all", { entrepriseId, page, limit, search });

    window.electron.ipcRenderer.once(
      "/produit/list/all",
      (_event, data:  PaginatedResponse<ProductForList>) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Get active products
export function getActive(
  entrepriseId: string,
  page: number = 1,
  limit: number = 8,
  search: string = ""
): Promise<PaginatedResponse<ProductForList>> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/list/active", { entrepriseId, page, limit, search });

    window.electron.ipcRenderer.once(
      "/produit/list/active",
      (_event, data:  PaginatedResponse<ProductForList>) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Get inactive products
export function getInactive(
  entrepriseId: string,
  page: number = 1,
  limit: number = 8,
  search: string = ""
): Promise<PaginatedResponse<ProductForList>> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/list/inactive", { entrepriseId, page, limit, search });

    window.electron.ipcRenderer.once(
      "/produit/list/inactive",
      (_event, data: PaginatedResponse<ProductForList>) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Fetch products for POS
export function getAllForPos(
  entrepriseId: string,
  page: number = 1,
  limit: number = 18,
  search: string = ""
): Promise<PaginatedResponse<ProductForPos>> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/pos/all", { entrepriseId, page, limit, search });

    window.electron.ipcRenderer.once(
      "/produit/pos/all",
      (_event, data: PaginatedResponse<ProductForPos>) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}

// Fetch products by category
export function getProductsByCategory(
  entrepriseId: string,
  categorieId: string,
  page: number = 1,
  limit: number = 18,
  search: string = ""
): Promise<PaginatedResponse<ProductForPos>> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/produit/by-category", { entrepriseId, categorieId, page, limit, search });

    window.electron.ipcRenderer.once(
      "/produit/by-category",
      (_event, data:  PaginatedResponse<ProductForPos>) => {
        if (!data) reject(data);
        else resolve(data!);
      }
    );
  });
}
