// src/main/service/vente.ts

import { Product } from "../model/produit";
import { Vente } from "../model/vente";
import { bgErrorRed } from "../util";

interface VenteInput {
  codeBarre: string;
  quantite: number;
}

// Create a single Vente
export async function createVente(
  venteInput: VenteInput,
  product: Product,
  entrepriseId: string,
  commandeId: string,
  prisma
) {
  try {
    const now = new Date();
    
    // Handle remise validity
    const isRemiseActive =
      product.dateDebutRemise &&
      product.dateFinRemise &&
      now >= new Date(product.dateDebutRemise) &&
      now <= new Date(product.dateFinRemise)

    const productRemise = isRemiseActive ? Number(product.remise) : 0;
    const puht = Number(product.puht);
    const totalHT = puht * venteInput.quantite - productRemise;
    const totalTTC = totalHT * (1 + Number(product.tva) / 100);

    const vente = await prisma.vente.create({
      data: {
        codeBarre: venteInput.codeBarre,
        designation: product.designation,
        puht,
        tva: Number(product.tva),
        remise: productRemise,
        quantite: venteInput.quantite,
        totalHT,
        totalTTC,
        entreprise: { connect: { id: entrepriseId } },
        commande: { connect: { id: commandeId } },
      }
    })
    return vente
    
  } catch (error) {
    console.error(bgErrorRed, "service/vente createVente :" + error);
  }
}

export async function updateVente(
  venteId: string,
  venteInput: VenteInput,
  product: any,
  entrepriseId: string,
  prisma
) {
  const now = new Date();
  
  // Handle remise validity (using current product data)
  const isRemiseActive =
    product.dateDebutRemise &&
    product.dateFinRemise &&
    now >= new Date(product.dateDebutRemise) &&
    now <= new Date(product.dateFinRemise);

  const productRemise = isRemiseActive ? Number(product.remise) : 0;
  const puht = Number(product.puht);
  const totalHT = puht * venteInput.quantite - productRemise;
  const totalTTC = totalHT * (1 + Number(product.tva) / 100);

  return await prisma.vente.update({
    where: { id: venteId },
    data: {
      quantite: venteInput.quantite,
      designation: product.designation, // Update in case product designation changed
      puht,
      tva: Number(product.tva),
      remise: productRemise,
      totalHT,
      totalTTC,
    },
  });
}

export async function getVentesByDateRange(
  data: {
    entrepriseId: string,
    dateDebut?: string,
    dateFin?: string
  },
  prisma
): Promise<Vente[] | null> {
  try {
    const { entrepriseId, dateDebut, dateFin } = data

    if (!entrepriseId) return null

    const where: any = { entrepriseId: entrepriseId }

    if (dateDebut && dateFin) where.updatedAt = {
      gte: new Date(dateDebut),
      lte: new Date(dateFin)
    }

    const ventes = await prisma.vente.findMany({
      where: where
    })

    return ventes && ventes.map(vente => ({
      ...vente,
      puht: Number(vente.puht),
      tva: Number(vente.tva),
      remise: Number(vente.remise),
      totalHT: Number(vente.totalHT),
      totalTTC: Number(vente.totalTTC),
      retourQuantite: Number(vente.retourQuantite) || 0, // Ajoutez cette ligne
      updatedAt: vente.updatedAt.toISOString(),
      createdAt: vente.createdAt.toISOString()
    }))
  } catch (error) {
    console.error("service/ventes getVentesByDateRange: ", error);
    return null
  }
}

export async function getVentesByCommandeId(
  data: {
    entrepriseId: string, commandeId: string
  }, prisma
): Promise<Vente[] | null> {
  try {
    const { entrepriseId, commandeId } = data

    if (!entrepriseId || !commandeId) return null

    const ventes = await prisma.vente.findMany({
      where: {
        entrepriseId,
        commandeId
      }
    })

    return ventes && ventes.map(vente => ({
      ...vente,
      puht: Number(vente.puht),
      tva: Number(vente.tva),
      remise: Number(vente.remise),
      totalHT: Number(vente.totalHT),
      totalTTC: Number(vente.totalTTC),
      retourQuantite: Number(vente.retourQuantite) || 0, // Ajoutez cette ligne
      createdAt: vente.createdAt.toISOString(),
      updatedAt: vente.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error(bgErrorRed, "service/vente getVentesByCommandeId: " + error);
    return null
  }
}