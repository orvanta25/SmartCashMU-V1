export interface Retour {
  id: number;
  venteId: number;
  produitId: number;
  quantite: number;
  userId?: number;
  entrepriseId?: number;
  createdAt: Date;
  updatedAt: Date;
}
