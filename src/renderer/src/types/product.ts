export interface Categorie {
  nom?: string;
}

export interface Product {
  id: string;
  codeBarre: string;
  designation: string;
  puht: number;
  tva: number;
  remise: number;
  imagePath?: string | null;
  active: boolean;
  quantite: number;
  categorie?: Categorie;
}

export interface VenteParLot {
  qte: number;
  prix: number;
}

export interface CartItem {
  id: string;
  designation: string;
  quantity: number;
  priceUnit: number;
  ventesParLot?: VenteParLot[]; // Store only the VenteParLot data
  totalPrice: number;
}