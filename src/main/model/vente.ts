export interface Vente {
  id: string;
  codeBarre: string;
  designation: string;
  prixVente: number;
  tva: number;
  remise: number;
  quantite: number;
  totalHT: number;
  totalTTC: number;
  entrepriseId: string;
  commandeId: string;
  createdAt: string;
  updatedAt: string;
}