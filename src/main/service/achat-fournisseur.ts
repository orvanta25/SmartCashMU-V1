// main/service/achat-fournisseur.ts

import { PrismaClient } from "@prisma/client";
import { AchatFournisseur, AchatFournisseurResponse, CreateAchatFournisseurDto, SearchAchatFournisseurDto, UpdateAchatFournisseurDto } from "../model/achat-fournisseur";
import { LastWeekResponse } from "../model/charge";
import { updateStockMouvement } from "./stock-mouvement";
import { StockMouvementType } from "../model/stock-mouvement";
import { ProductType } from "../model/produit";


export async function createAchatFournisseur(
  data: { entrepriseId: string; dto: CreateAchatFournisseurDto; file?: File },
  prisma: PrismaClient
): Promise<AchatFournisseurResponse> {
  const { entrepriseId, dto, file } = data;

  if (!entrepriseId || !dto) throw new Error("Missing entrepriseId or dto");
  if (!dto.entrees || dto.entrees.length === 0) throw new Error("No entries provided");

  return await prisma.$transaction(async (tx) => {
    // Calcul du montant total de la facture
    const montantTotal = dto.entrees.reduce(
      (sum, e) => sum + e.puht * e.quantite * (1 + e.tva / 100),
      0
    );

    // Création de l'achat fournisseur
    const achatFournisseur = await tx.achatFournisseur.create({
      data: {
        numeroFacture: dto.numeroFacture,
        fournisseur: dto.fournisseur,
        dateEcheance: dto.dateEcheance ? new Date(dto.dateEcheance) : null,
        datePaiement: dto.datePaiement ? new Date(dto.datePaiement) : null,
        pieceJointe: file ? file.name : "",
        montantTotal,
        montantComptant: dto.montantComptant ?? null,
        montantRestant: dto.montantRestant ?? null,
        remise: dto.remise ?? null,
        entreprise: { connect: { id: entrepriseId } },
        entrees: {
          create: dto.entrees.map((entree) => ({
            codeBarre: entree.codeBarre,
            designation: entree.designation ?? "",
            quantite: entree.quantite,
            puht: entree.puht,
            tva: entree.tva,
            prixUnitaireTTC: entree.puht * (1 + entree.tva / 100),
            prixTotalTTC: entree.puht * entree.quantite * (1 + entree.tva / 100),
            entreprise: { connect: { id: entrepriseId } },
          })),
        },
      },
      include: { entrees: true },
    });

    // Mise à jour du stock pour chaque entrée
    for (const entree of achatFournisseur.entrees) {
      await updateStockMouvement(
        {
          entrepriseId,
          dto: {
            designation: entree.designation,
            codeBarre: entree.codeBarre,
            stockInitial: 0,
            stockSecurite: 0,
            acc: 0,
            achats: entree.quantite,
            ventes: 0,
            inventories: 0,
            operation: StockMouvementType.ACHAT,
            productType: ProductType.MAGASIN,
          },
        },
        tx
      );
    }

    // Préparation de la réponse formatée
    const achatFormat = {
      ...achatFournisseur,
      dateEcheance: achatFournisseur.dateEcheance.toISOString(),
      datePaiement: achatFournisseur.datePaiement?.toISOString(),
      createdAt: achatFournisseur.createdAt.toISOString(),
      updatedAt: achatFournisseur.updatedAt.toISOString(),
      montantTotal: Number(achatFournisseur.montantTotal),
      montantComptant: Number(achatFournisseur.montantComptant),
      remise: Number(achatFournisseur.remise),
      montantRestant: Number(achatFournisseur.montantRestant),
      entrees: achatFournisseur.entrees.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        puht: Number(e.puht),
        tva: Number(e.tva),
        prixUnitaireTTC: Number(e.prixUnitaireTTC),
        prixTotalTTC: Number(e.prixTotalTTC),
      })),
    };

    return { message: "Achat fournisseur créé avec succès", achatFournisseur: achatFormat };
  });
}


export async function getAchatFournisseurs(
  data: { entrepriseId: string; params?: SearchAchatFournisseurDto },
  prisma: PrismaClient
): Promise<AchatFournisseur[]> {
  try {
    const { entrepriseId, params } = data;

    const achatFournisseurs = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        numeroFacture: params?.numeroFacture ? { contains: params.numeroFacture } : undefined,
        fournisseur: params?.fournisseur ? { contains: params.fournisseur } : undefined,
        createdAt: {
          gte: params?.dateDebut ? new Date(params.dateDebut) : undefined,
          lte: params?.dateFin ? new Date(params.dateFin) : undefined,
        },
      },
      include: { entrees: true },
    });

    return achatFournisseurs?.map(achatFournisseur=>(
        {...achatFournisseur,
        dateEcheance:achatFournisseur.dateEcheance.toISOString(),
        datePaiement:achatFournisseur.datePaiement?.toISOString(),
        createdAt:achatFournisseur.createdAt.toISOString(),
        updatedAt:achatFournisseur.updatedAt.toISOString(),
        montantTotal:Number(achatFournisseur.montantTotal),
        montantComptant:Number(achatFournisseur.montantComptant),
        remise:Number(achatFournisseur.remise),
        montantRestant:Number(achatFournisseur.montantRestant),

        entrees:achatFournisseur.entrees?.map(entree=>(
            {
                ...entree,
                createdAt:entree.createdAt.toISOString(),
                updatedAt:entree.updatedAt.toISOString(),
                puht:Number(entree.puht),
                tva:Number(entree.tva),
                prixUnitaireTTC:Number(entree.prixUnitaireTTC),
                prixTotalTTC:Number(entree.prixTotalTTC)
            }
        ))    
    }

    ))
  } catch (error) {
    console.error('service/achatFournisseur getAchatFournisseurs: ', error);
    throw error;
  }
}

export async function getAchatFournisseurById(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<AchatFournisseur> {
  try {
    const { entrepriseId, id } = data;

    const achatFournisseur = await prisma.achatFournisseur.findFirst({
      where: { id, entrepriseId },
      include: { entrees: true },
    });

    if (!achatFournisseur) {
      throw new Error('Achat fournisseur not found');
    }

    return {...achatFournisseur,
        dateEcheance:achatFournisseur.dateEcheance.toISOString(),
        datePaiement:achatFournisseur.datePaiement?.toISOString(),
        createdAt:achatFournisseur.createdAt.toISOString(),
        updatedAt:achatFournisseur.updatedAt.toISOString(),
        montantTotal:Number(achatFournisseur.montantTotal),
        montantComptant:Number(achatFournisseur.montantComptant),
        remise:Number(achatFournisseur.remise),
        montantRestant:Number(achatFournisseur.montantRestant),

        entrees:achatFournisseur.entrees?.map(entree=>(
            {
                ...entree,
                createdAt:entree.createdAt.toISOString(),
                updatedAt:entree.updatedAt.toISOString(),
                puht:Number(entree.puht),
                tva:Number(entree.tva),
                prixUnitaireTTC:Number(entree.prixUnitaireTTC),
                prixTotalTTC:Number(entree.prixTotalTTC)
            }
        ))    
    }
  } catch (error) {
    console.error('service/achatFournisseur getAchatFournisseurById: ', error);
    throw error;
  }
}

export async function updateAchatFournisseur(
  data: { entrepriseId: string; id: string; dto: UpdateAchatFournisseurDto },
  prisma: PrismaClient
) {
  const { entrepriseId, id, dto } = data;

  return prisma.$transaction(async (tx) => {
    const existingAchat = await tx.achatFournisseur.findFirst({
      where: { id, entrepriseId },
      include: { entrees: true },
    });

    if (!existingAchat) {
      throw new Error('Achat fournisseur introuvable');
    }

    let montantTotal = Number(existingAchat.montantTotal);
    const existingMap = new Map(existingAchat.entrees.map(e => [e.id, e]));

    if (dto.entrees) {
      if (dto.entrees.length === 0) {
        throw new Error('Un achat fournisseur doit contenir au moins une entrée');
      }

      montantTotal = 0;

      for (const e of dto.entrees) {
        const prixUnitaireTTC = e.puht * (1 + e.tva / 100);
        const prixTotalTTC = prixUnitaireTTC * e.quantite;
        montantTotal += prixTotalTTC;

        if (e.id && existingMap.has(e.id)) {
          const old = existingMap.get(e.id)!;
          const delta = e.quantite - old.quantite;

          await tx.entree.update({
            where: { id: old.id },
            data: {
              codeBarre: e.codeBarre,
              designation: e.designation ?? '',
              quantite: e.quantite,
              puht: e.puht,
              tva: e.tva,
              prixUnitaireTTC,
              prixTotalTTC,
            },
          });

          if (delta !== 0) {
            await updateStockMouvement({ 
              entrepriseId, 
              dto: {
                codeBarre: e.codeBarre,
                designation: e.designation ?? '',
                achats: delta,
                ventes: 0,
                inventories: 0,
                operation: StockMouvementType.ACHAT,
                productType: ProductType.MAGASIN,
              }
            }, tx);
          }

          existingMap.delete(e.id);
        } else {
          // Nouvelle entrée (sans ID existant)
          await tx.entree.create({
            data: {
              achatFournisseurId: id,
              entrepriseId,
              codeBarre: e.codeBarre,
              designation: e.designation ?? '',
              quantite: e.quantite,
              puht: e.puht,
              tva: e.tva,
              prixUnitaireTTC,
              prixTotalTTC,
            },
          });

          await updateStockMouvement({ 
            entrepriseId, 
            dto: {
              codeBarre: e.codeBarre,
              designation: e.designation ?? '',
              achats: e.quantite,
              ventes: 0,
              inventories: 0,
              operation: StockMouvementType.ACHAT,
              productType: ProductType.MAGASIN,
            }
          }, tx);
        }
      }

      // Supprimer les entrées qui n'existent plus dans dto.entrees
      for (const removed of existingMap.values()) {
        await tx.entree.delete({ where: { id: removed.id } });

        await updateStockMouvement({ 
          entrepriseId, 
          dto: {
            codeBarre: removed.codeBarre,
            designation: removed.designation ?? '',
            achats: -removed.quantite,
            ventes: 0,
            inventories: 0,
            operation: StockMouvementType.ACHAT,
            productType: ProductType.MAGASIN,
          }
        }, tx);
      }
    }

    return tx.achatFournisseur.update({
      where: { id },
      data: {
        numeroFacture: dto.numeroFacture,
        fournisseur: dto.fournisseur,
        dateEcheance: dto.dateEcheance ? new Date(dto.dateEcheance) : undefined,
        datePaiement: dto.datePaiement ?? undefined,
        montantComptant: dto.montantComptant,
        montantRestant: dto.montantRestant,
        remise: dto.remise,
        montantTotal,
      },
      include: { entrees: true },
    });
  });
}

export async function deleteAchatFournisseurPieceJointe(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<AchatFournisseurResponse> {
  try {
    const { entrepriseId, id } = data;

    const achatFournisseur = await prisma.achatFournisseur.update({
      where: { id, entrepriseId },
      data: { pieceJointe: null },
      include: { entrees: true },
    });

    const achatFormat =  {...achatFournisseur,
        dateEcheance:achatFournisseur.dateEcheance.toISOString(),
        datePaiement:achatFournisseur.datePaiement?.toISOString(),
        createdAt:achatFournisseur.createdAt.toISOString(),
        updatedAt:achatFournisseur.updatedAt.toISOString(),
        montantTotal:Number(achatFournisseur.montantTotal),
        montantComptant:Number(achatFournisseur.montantComptant),
        remise:Number(achatFournisseur.remise),
        montantRestant:Number(achatFournisseur.montantRestant),

        entrees:achatFournisseur.entrees?.map(entree=>(
            {
                ...entree,
                createdAt:entree.createdAt.toISOString(),
                updatedAt:entree.updatedAt.toISOString(),
                puht:Number(entree.puht),
                tva:Number(entree.tva),
                prixUnitaireTTC:Number(entree.prixUnitaireTTC),
                prixTotalTTC:Number(entree.prixTotalTTC)
            }
        ))    
    }

    return {
      message: 'Achat fournisseur piece jointe deleted successfully',
      achatFournisseur:achatFormat
    };
  } catch (error) {
    console.error('service/achatFournisseur deleteAchatFournisseurPieceJointe: ', error);
    throw error;
  }
}

export async function getUnpaidAchatFournisseurs(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<AchatFournisseur[]> {
  try {
    const { entrepriseId } = data;

    const achatFournisseurs = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        datePaiement: null,
        montantRestant: { gt: 0 },
      },
      include: { entrees: true },
    });
    return achatFournisseurs?.map(achatFournisseur=>(
        {...achatFournisseur,
        dateEcheance:achatFournisseur.dateEcheance.toISOString(),
        datePaiement:achatFournisseur.datePaiement?.toISOString(),
        createdAt:achatFournisseur.createdAt.toISOString(),
        updatedAt:achatFournisseur.updatedAt.toISOString(),
        montantTotal:Number(achatFournisseur.montantTotal),
        montantComptant:Number(achatFournisseur.montantComptant),
        remise:Number(achatFournisseur.remise),
        montantRestant:Number(achatFournisseur.montantRestant),

        entrees:achatFournisseur.entrees?.map(entree=>(
            {
                ...entree,
                createdAt:entree.createdAt.toISOString(),
                updatedAt:entree.updatedAt.toISOString(),
                puht:Number(entree.puht),
                tva:Number(entree.tva),
                prixUnitaireTTC:Number(entree.prixUnitaireTTC),
                prixTotalTTC:Number(entree.prixTotalTTC)
            }
        ))    
    }

    ))
  } catch (error) {
    console.error('service/achatFournisseur getUnpaidAchatFournisseurs: ', error);
    throw error;
  }
}

export async function deleteAchatFournisseur(
  data: { entrepriseId: string; id: string },
  prisma: PrismaClient
): Promise<{ message: string }> {
  const { entrepriseId, id } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Récupérer achat + entrées
      const achat = await tx.achatFournisseur.findFirst({
        where: { id, entrepriseId },
        include: { entrees: true },
      });

      if (!achat) {
        throw new Error('Achat fournisseur not found');
      }

      // 2️⃣ Correction stock (annulation achat)
      for (const entree of achat.entrees) {
        await updateStockMouvement(
          {
            entrepriseId,
            dto: {
              designation: entree.designation ?? '',
              codeBarre: entree.codeBarre,
              stockInitial: 0,
              stockSecurite: 0,
              acc: 0,
              achats: -entree.quantite,
              ventes: 0,
              inventories: 0,
              operation: StockMouvementType.ACHAT,
              productType: ProductType.MAGASIN,
            },
          },
          tx
        );
      }

      // 3️⃣ Suppression
      await tx.achatFournisseur.delete({
        where: { id },
      });
    });

    return { message: 'Achat fournisseur deleted successfully' };
  } catch (error) {
    console.error('service/achatFournisseur deleteAchatFournisseur:', error);
    throw error;
  }
}


export async function getDepenseOfLastWeek(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<LastWeekResponse> {
  try {
    const { entrepriseId } = data;

    const dateFin = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(dateFin.getDate() - 7);

    const achatFournisseurs = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        createdAt: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
    });

    const total = achatFournisseurs.reduce((sum, achat) => sum + Number(achat.montantTotal), 0);

    return {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      total,
    };
  } catch (error) {
    console.error('service/achatFournisseur getDepenseOfLastWeek: ', error);
    throw error;
  }
}

export async function getTotalAchatOfLastWeek(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<LastWeekResponse> {
  try {
    const { entrepriseId } = data;

    const dateFin = new Date();
    const dateDebut = new Date();
    dateDebut.setDate(dateFin.getDate() - 7);

    const achatFournisseurs = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        createdAt: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      include: { entrees: true },
    });

    const total = achatFournisseurs.reduce((sum, achat) => {
      const achatTotal = achat.entrees.reduce((subSum, entree) => subSum + Number(entree.prixTotalTTC), 0);
      return sum + achatTotal;
    }, 0);

    return {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      total,
    };
  } catch (error) {
    console.error('service/achatFournisseur getTotalAchatOfLastWeek: ', error);
    throw error;
  }
}

export async function getTotalAchatByDateRange(
  data: { entrepriseId: string; dateDebut: string; dateFin: string },
  prisma: PrismaClient
): Promise<{ date: string; totalAchat: number; count: number }[]> {
  try {
    const { entrepriseId, dateDebut, dateFin } = data;

    // Convertir les dates en format Date pour Prisma
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    
    // S'assurer que endDate est à la fin de la journée
    endDate.setHours(23, 59, 59, 999);

    // Récupérer tous les achats dans la période
    const achatFournisseurs = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        montantTotal: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Grouper par date et calculer les totaux
    const achatsParDate = achatFournisseurs.reduce((acc, achat) => {
      // Formater la date en YYYY-MM-DD pour le regroupement
      const dateKey = achat.createdAt.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalAchat: 0,
          count: 0,
        };
      }
      
      acc[dateKey].totalAchat += Number(achat.montantTotal) || 0;
      acc[dateKey].count += 1;
      
      return acc;
    }, {} as Record<string, { date: string; totalAchat: number; count: number }>);

    // Convertir en tableau et trier par date
    const result = Object.values(achatsParDate).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    return result;
  } catch (error) {
    console.error('service/achatFournisseur getTotalAchatByDateRange: ', error);
    throw error;
  }
}

// Fonction pour récupérer le total d'achat pour une journée spécifique
export async function getTotalAchatForDate(
  data: { entrepriseId: string; date: string },
  prisma: PrismaClient
): Promise<number> {
  try {
    const { entrepriseId, date } = data;
    
    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const result = await prisma.achatFournisseur.aggregate({
      where: {
        entrepriseId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        montantTotal: true,
      },
    });

    return Number(result._sum.montantTotal) || 0;
  } catch (error) {
    console.error('service/achatFournisseur getTotalAchatForDate: ', error);
    throw error;
  }
}

// Fonction pour récupérer les totaux d'achats des 7 derniers jours
export async function getAchatLast7Days(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<{ date: string; totalAchat: number }[]> {
  try {
    const { entrepriseId } = data;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Récupérer les totaux par jour
    const achatsParJour = await prisma.achatFournisseur.groupBy({
      by: ['createdAt'],
      where: {
        entrepriseId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        montantTotal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transformer les résultats
    const result = achatsParJour.map(achat => ({
      date: achat.createdAt.toISOString().split('T')[0],
      totalAchat: Number(achat._sum.montantTotal) || 0,
    }));

    return result;
  } catch (error) {
    console.error('service/achatFournisseur getAchatLast7Days: ', error);
    throw error;
  }
}

// Fonction pour récupérer les statistiques mensuelles d'achat
export async function getMonthlyAchatStats(
  data: { entrepriseId: string; year: number },
  prisma: PrismaClient
): Promise<{ month: number; totalAchat: number; count: number }[]> {
  try {
    const { entrepriseId, year } = data;

    const startDate = new Date(year, 0, 1); // 1er janvier
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre

    // Récupérer tous les achats de l'année
    const achats = await prisma.achatFournisseur.findMany({
      where: {
        entrepriseId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        montantTotal: true,
        createdAt: true,
      },
    });

    // Initialiser un tableau pour les 12 mois
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalAchat: 0,
      count: 0,
    }));

    // Calculer les totaux par mois
    achats.forEach(achat => {
      const month = achat.createdAt.getMonth(); // 0-indexed
      monthlyStats[month].totalAchat += Number(achat.montantTotal) || 0;
      monthlyStats[month].count += 1;
    });

    return monthlyStats;
  } catch (error) {
    console.error('service/achatFournisseur getMonthlyAchatStats: ', error);
    throw error;
  }
}