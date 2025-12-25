import { PrismaClient } from "@prisma/client";
import { CreateClotureJourDto } from "../model/cloture-jour";

export async function createClotureJour(
  data: CreateClotureJourDto,
  prisma: PrismaClient
) {
  const {
    dateFermeture,
    heureFermeture,
    caissier,
    detailPaiements,
    ventesParCaissier,
    commandesStats,
    retoursDetails,
    fondCaisseInitial,
    totalEspecesEntree,
    totalEspecesSorties
  } = data;

  if (!dateFermeture || !caissier) {
    throw new Error("Date de fermeture et caissier sont requis");
  }

  // --- 1. Calcul des remises et total net par caissier ---
  const ventesCaissiersCorrigees = ventesParCaissier?.map((c) => {
    const ventesBrutes = c.montantTotal || 0;
    const encaissements =
      (c.paiements?.especes || 0) +
      (c.paiements?.carte || 0) +
      (c.paiements?.cheque || 0) +
      (c.paiements?.ticketRestaurant || 0);
    const totalRetours = c.totalRetours || 0;

    const totalRemises = ventesBrutes - totalRetours - encaissements;
    const totalNet = ventesBrutes - totalRetours - totalRemises;

    return {
      ...c,
      totalRemises,
      totalNet,
    };
  }) || [];

  // --- 2. Calcul des totaux de clôture ---
  const chiffreAffairesTotal = ventesCaissiersCorrigees.reduce(
    (sum, c) => sum + (c.montantTotal || 0),
    0
  );
  const totalRemises = ventesCaissiersCorrigees.reduce(
    (sum, c) => sum + (c.totalRemises || 0),
    0
  );
  const totalRetours = ventesCaissiersCorrigees.reduce(
    (sum, c) => sum + (c.totalRetours || 0),
    0
  );
  const totalNet = ventesCaissiersCorrigees.reduce(
    (sum, c) => sum + (c.totalNet || 0),
    0
  );
  const totalEncaissements = detailPaiements?.reduce(
    (sum, p) => sum + (p.TotalAmount || 0),
    0
  ) || 0;

  const nombreVentes = ventesCaissiersCorrigees.reduce(
    (sum, c) => sum + (c.nombreVentes || 0),
    0
  );

  // --- 3. Enregistrement de la clôture ---
  const cloture = await prisma.clotureJour.create({
    data: {
      dateFermeture: new Date(dateFermeture),
      heureFermeture,
      caissierResponsable: caissier,
      chiffreAffaires: chiffreAffairesTotal,
      totalEncaissements,
      totalRetours,
      totalRemises,
      totalNet,
      nombreVentes,
      fondCaisseInitial: fondCaisseInitial || 0,
      totalEspecesEntree: totalEspecesEntree || 0,
      totalEspecesSorties: totalEspecesSorties || 0,
      totalEspecesFinalAttendu:
        (fondCaisseInitial || 0) +
        (totalEspecesEntree || 0) -
        (totalEspecesSorties || 0) +
        (detailPaiements?.find((p) => p.PaymentType === "Espèces")?.TotalAmount ||
          0),
      statut: "TERMINEE",
      createdAt: new Date(),
    },
  });

  // --- 4. Détails de paiement ---
  if (detailPaiements && Array.isArray(detailPaiements)) {
    for (const paiement of detailPaiements) {
      await prisma.detailPaiementCloture.create({
        data: {
          clotureId: cloture.id,
          typePaiement: paiement.PaymentType,
          montant: paiement.TotalAmount,
        },
      });
    }
  }

  // --- 5. Ventes par caissier ---
  for (const c of ventesCaissiersCorrigees) {
    await prisma.venteCaissierCloture.create({
      data: {
        clotureId: cloture.id,
        nomCaissier: c.nom,
        nombreVentes: c.nombreVentes,
        montantTotal: c.montantTotal,
        totalRetours: c.totalRetours,
        fondCaisse: c.fondCaisse || 0,
        totalRemises: c.totalRemises,
        totalNet: c.totalNet,
        totalEncaissements:
          (c.paiements?.especes || 0) +
          (c.paiements?.carte || 0) +
          (c.paiements?.cheque || 0) +
          (c.paiements?.ticketRestaurant || 0),
        paiementsEspeces: c.paiements?.especes || 0,
        paiementsCarte: c.paiements?.carte || 0,
        paiementsCheque: c.paiements?.cheque || 0,
        paiementsTicket: c.paiements?.ticketRestaurant || 0,
      },
    });
  }

  // --- 6. Marquer les ventes comme clôturées ---
  await prisma.vente.updateMany({
    where: {
      createdAt: {
        gte: new Date(dateFermeture + "T00:00:00"),
        lt: new Date(dateFermeture + "T23:59:59"),
      },
      statut: "PAYEE",
    },
    data: {
      cloturee: true,
      clotureId: cloture.id,
    },
  });

  // --- 7. Retour de la clôture complète ---
  const clotureComplete = await prisma.clotureJour.findUnique({
    where: { id: cloture.id },
    include: {
      ventesCaissiers: true,
      detailPaiements: true,
    },
  });

  return {
    message: "Clôture de jour générée avec succès",
    cloture: clotureComplete,
  };
}

export async function getClotures(
  params: { startDate?: string; endDate?: string; page?: number; limit?: number },
  prisma: PrismaClient
) {
  const { startDate, endDate, page = 1, limit = 20 } = params;

  const where: any = {};
  
  if (startDate && endDate) {
    where.dateFermeture = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  const skip = (page - 1) * limit;

  const [clotures, total] = await Promise.all([
    prisma.clotureJour.findMany({
      where,
      orderBy: { dateFermeture: 'desc' },
      skip,
      take: limit,
      include: {
        ventesCaissiers: true,
        detailPaiements: true
      }
    }),
    prisma.clotureJour.count({ where })
  ]);

  return {
    clotures,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getClotureById(
  id: number,
  prisma: PrismaClient
) {
  const cloture = await prisma.clotureJour.findUnique({
    where: { id },
    include: {
      ventesCaissiers: true,
      detailPaiements: true
    }
  });

  if (!cloture) {
    throw new Error('Clôture non trouvée');
  }

  return { cloture };
}