export interface Product {
  id: string;
  designation: string;
  categorieId: string;
  categorie?: { id: string; nom: string };
  puht: number;
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
}


export interface CartItem {
  id: string;
  designation: string;
  quantity: number;
  priceUnit: number;
  totalPrice: number;
}
