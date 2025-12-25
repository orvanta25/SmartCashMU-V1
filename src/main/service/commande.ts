import { PrismaClient } from '@prisma/client';
import type {
  Commande,
  CommandeResponse,
  CreateCommandeDto,
  CreateCommandeForTableDto,
  UpdateCommandeDto,
  SearchCommandeDto,
  UserCommandesResponse,
  LastWeekResponse,
} from '../model/commande';
import { getCurrentUser } from './auth';
import { createVente, updateVente } from './vente';
import { updateStockMouvement } from './stock-mouvement';
import { StockMouvementType } from '../model/stock-mouvement';
import { getProducts } from './produit';


export async function createCommande(
  data: { entrepriseId: string; dto: CreateCommandeDto & { ticketBarcodes?: string[] } },
  prisma: PrismaClient,
  ses
): Promise<CommandeResponse> {
  try {
    const { entrepriseId, dto } = data;
    const {
      ventes,
      tpeAmount = 0,
      especeAmount = 0,
      ticketAmount = 0,
      chequeAmount = 0,
      remise = 0,
      isWaiting = false,
      ticketBarcodes,
      tableId,
    } = dto;

    if (!ventes || ventes.length === 0) {
      throw new Error('At least one vente is required');
    }

    // Fetch products and their Lots to compute total available quantity
    const products = await getProducts({entrepriseId},prisma)
    if(!products) throw "pas de produits !"
    // Validate stock for each product
    for (const vente of ventes) {
      const product = products.find((p) => p.codeBarre === vente.codeBarre);
      if (!product) throw new Error(`Product with codeBarre ${vente.codeBarre} not found`);

          }

    // Calculate total for commande
    const now = new Date();
    const venteData = ventes.map((vente) => {
      const product = products.find((p) => p.codeBarre === vente.codeBarre)!;
      const isRemiseActive =
        product.dateDebutRemise &&
        product.dateFinRemise &&
        now >= new Date(product.dateDebutRemise) &&
        now <= new Date(product.dateFinRemise)

      const productRemise = isRemiseActive ? Number(product.remise) : 0;
      const puht = Number(product.puht);
      const totalHT = puht * vente.quantite - productRemise;
      const totalTTC = totalHT * (1 + Number(product.tva) / 100);

      return { totalTTC };
    });

    const total = venteData.reduce((sum, vente) => sum + vente.totalTTC, 0) - remise;

    // Create Commande without ventes initially
    const commande = await prisma.commande.create({
      data: {
        date: new Date(),
        total,
        user: { connect: { id: (await getCurrentUser(prisma, ses))?.userId } },
        entreprise: { connect: { id: entrepriseId } },
        isWaiting,
        tpeAmount,
        especeAmount,
        ticketAmount,
        chequeAmount,
        remise,
        ticketNumber: ticketBarcodes?.[0] || undefined,
        table: tableId ? { connect: { id: tableId } } : undefined,
      },
      include: {
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    

    // Create ventes and update stock mouvement
    await Promise.all(
      ventes.map(async (vente) => {
        const product = products.find((p) => p.codeBarre === vente.codeBarre)!;
        const createdVente = await createVente(
          vente,
          product,
          entrepriseId,
          commande.id,
          prisma
        );

        // Update stock mouvement after each vente creation
        await updateStockMouvement({
          entrepriseId,
          dto: {
            designation: product.designation,
            codeBarre: vente.codeBarre,
            stockInitial: 0,
            stockSecurite: 0,
            acc: vente.quantite,
            achats: 0,
            inventories:0,
            ventes: vente.quantite,
            operation: StockMouvementType.VENTE,
            productType:product.type
          },
        }, prisma);

        return createdVente;
      })
    );

    // Fetch commande with ventes for response
    const commandeWithVentes = await prisma.commande.findUnique({
      where: { id: commande.id },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return {
      message: 'Commande created successfully',
      commande: mapCommande(commandeWithVentes!),
    };
  } catch (error) {
    console.error('service/commande createCommande: ', error);
    throw error;
  }
}

export async function createCommandeForTable(
  data: { entrepriseId: string; dto: CreateCommandeForTableDto },
  prisma: PrismaClient,
  ses
): Promise<CommandeResponse> {
  try {
    const { entrepriseId, dto } = data;
    const { ventes, tableId, remise = 0 } = dto;

    if (!ventes || ventes.length === 0) {
      throw new Error('At least one vente is required');
    }

    if (!tableId) {
      throw new Error('Table ID is required');
    }

    // Fetch products to compute vente details and validate stock
    const products = await prisma.produit.findMany({
      where: { codeBarre: { in: ventes.map((v) => v.codeBarre) }, entrepriseId, active: true },
      select: { codeBarre: true, designation: true, puht: true, tva: true, remise: true, dateDebutRemise: true, dateFinRemise: true, quantite: true },
    });

    const now = new Date();
    const venteData = ventes.map((vente) => {
      const product = products.find((p) => p.codeBarre === vente.codeBarre);
      if (!product) throw new Error(`Product with codeBarre ${vente.codeBarre} not found`);
      if (product.quantite < vente.quantite) throw new Error(`Insufficient stock for product ${product.designation}`);

      const isRemiseActive = product.dateDebutRemise && product.dateFinRemise &&
        now >= product.dateDebutRemise && now <= product.dateFinRemise;
      const productRemise = isRemiseActive ? Number(product.remise) : 0;
      const puht = Number(product.puht);
      const totalHT = puht * vente.quantite - productRemise;
      const totalTTC = totalHT * (1 + Number(product.tva) / 100);

      return {
        codeBarre: vente.codeBarre,
        designation: product.designation,
        puht,
        tva: Number(product.tva),
        remise: productRemise,
        quantite: vente.quantite,
        totalHT,
        totalTTC,
        entreprise: { connect: { id: entrepriseId } },
      };
    });

    const total = venteData.reduce((sum, vente) => sum + vente.totalTTC, 0) - remise;

    const commande = await prisma.commande.create({
      data: {
        date: new Date(),
        total,
        user: { connect: { id: (await getCurrentUser(prisma,ses))?.userId } },
        entreprise: { connect: { id: entrepriseId } },
        isWaiting: true,
        remise,
        table: { connect: { id: tableId } },
        ventes: { create: venteData },
      },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    // Update product stock
    await Promise.all(
      ventes.map((vente) =>
        prisma.produit.update({
          where: { codeBarre: vente.codeBarre, entrepriseId },
          data: { quantite: { decrement: vente.quantite } },
        })
      )
    );

    return {
      message: 'Commande for table created successfully',
      commande: mapCommande(commande),
    };
  } catch (error) {
    console.error('service/commande createCommandeForTable: ', error);
    throw error;
  }
}

export async function getCommandes(
  data: { entrepriseId: string; searchParams?: SearchCommandeDto },
  prisma: PrismaClient
): Promise<Commande[]> {
  try {
    const { entrepriseId, searchParams } = data;

    const where = {
      entrepriseId,
      ...(searchParams?.userId && { userId: searchParams.userId }),
      ...(searchParams?.ticketNumber && { ticketNumber: searchParams.ticketNumber }),
      ...(searchParams?.dateDebut && searchParams?.dateFin && {
        date: {
          gte: new Date(searchParams.dateDebut),
          lte: new Date(searchParams.dateFin),
        },
      }),
    };

    const commandes = await prisma.commande.findMany({
      where,
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return commandes.map(mapCommande);
  } catch (error) {
    console.error('service/commande getCommandes: ', error);
    throw error;
  }
}

export async function getCommandeByTableId(
  data: { entrepriseId: string; tableId: string },
  prisma: PrismaClient
): Promise<Commande | null> {
  try {
    const { entrepriseId, tableId } = data;

    const commande = await prisma.commande.findFirst({
      where: { entrepriseId, tableId, isWaiting: true },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return commande ? mapCommande(commande) : null;
  } catch (error) {
    console.error('service/commande getCommandeByTableId: ', error);
    throw error;
  }
}

export async function updateCommande(
  data: { entrepriseId: string; id: string; dto: UpdateCommandeDto },
  prisma: PrismaClient
): Promise<CommandeResponse> {
  try {
    const { entrepriseId, id, dto } = data;
    const { ventes, tpeAmount, especeAmount, ticketAmount, chequeAmount, remise, isWaiting, tableId } = dto;

    let total = 0;

    // Fetch existing ventes for the commande
    const existingVentes = await prisma.vente.findMany({
      where: { commandeId: id },
      select: { id: true, codeBarre: true, quantite: true },
    });

    if (ventes && ventes.length > 0) {
      // Fetch products using getProducts (assumes it includes Lot for stock validation)
      const products = await getProducts({ entrepriseId }, prisma);
      if (!products) throw new Error('pas de produits !');

      const incomingCodeBarres = new Set(ventes.map((v) => v.codeBarre));

      // Validate stock (considering additional quantity needed beyond existing)
      for (const vente of ventes) {
        const product = products.find((p) => p.codeBarre === vente.codeBarre);
        if (!product) throw new Error(`Product with codeBarre ${vente.codeBarre} not found`);
      }

      // Handle deleted ventes (remove and reverse stock - TODO for reverse logic)
      const deletedVentes = existingVentes.filter((v) => !incomingCodeBarres.has(v.codeBarre));
      for (const deleted of deletedVentes) {
        const product = products.find((p) => p.codeBarre === deleted.codeBarre);
        if (product) {
          // TODO: Reverse stock mouvement for deleted.quantite (e.g., add back to stock via adjustment or return operation)
          // Example: await updateStockMouvement({ ..., dto: { ..., achats: deleted.quantite, operation: StockMouvementType.AJUSTEMENT } })
        }
        await prisma.vente.delete({ where: { id: deleted.id } });
      }

      // Calculate total and process ventes (update existing or create new)
      const now = new Date();
      for (const vente of ventes) {
        const product = products.find((p) => p.codeBarre === vente.codeBarre)!;
        const existingVente = existingVentes.find((v) => v.codeBarre === vente.codeBarre);

        const isRemiseActive =
          product.dateDebutRemise &&
          product.dateFinRemise &&
          now >= new Date(product.dateDebutRemise) &&
          now <= new Date(product.dateFinRemise);

        const productRemise = isRemiseActive ? Number(product.remise) : 0;
        const puht = Number(product.puht);
        const totalHT = puht * vente.quantite - productRemise;
        const totalTTC = totalHT * (1 + Number(product.tva) / 100);
        total += totalTTC;

        
        if (existingVente) {
          // Update existing vente
           await updateVente(
            existingVente.id,
            vente,
            product,
            entrepriseId,
            prisma
          );

          // Adjust stock mouvement for quantity change
          const delta = vente.quantite - existingVente.quantite;
          if (delta > 0) {
            await updateStockMouvement({
              entrepriseId,
              dto: {
                designation: product.designation,
                codeBarre: vente.codeBarre,
                stockInitial: 0,
                stockSecurite: 0,
                acc: delta,
                achats: 0,
                inventories:0,
                ventes: delta,
                operation: StockMouvementType.VENTE,
                productType:product.type
              },
            }, prisma);
          } else if (delta < 0) {
            // TODO: Add back stock for reduced quantity (-delta)
            // Example: await updateStockMouvement({ ..., dto: { ..., achats: -delta, operation: StockMouvementType.AJUSTEMENT } })
          }
        } else {
          // Create new vente
           await createVente(
            vente,
            product,
            entrepriseId,
            id,
            prisma
          );

          // Update stock mouvement for new vente
          await updateStockMouvement({
            entrepriseId,
            dto: {
              designation: product.designation,
              codeBarre: vente.codeBarre,
              stockInitial: 0,
              stockSecurite: 0,
              acc: vente.quantite,
              achats: 0,
              inventories:0,
              ventes: vente.quantite,
              operation: StockMouvementType.VENTE,
              productType:product.type
            },
          }, prisma);
        }
      }
    } else {
      // No ventes: delete all existing ventes and reverse stock
      for (const existing of existingVentes) {
        const product = await prisma.produit.findUnique({
          where: { codeBarre: existing.codeBarre, entrepriseId },
        });
        if (product) {
          // TODO: Reverse stock mouvement for existing.quantite
        }
        await prisma.vente.delete({ where: { id: existing.id } });
      }
      total = 0;
    }

    total -= (remise || 0);

    // Update commande
    const commande = await prisma.commande.update({
      where: { id, entrepriseId },
      data: {
        tpeAmount,
        especeAmount,
        ticketAmount,
        chequeAmount,
        remise,
        isWaiting,
        total,
        table: tableId ? { connect: { id: tableId } } : undefined,
      },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return {
      message: 'Commande updated successfully',
      commande: mapCommande(commande),
    };
  } catch (error) {
    console.error('service/commande updateCommande: ', error);
    throw error;
  }
}

export async function getCommandesByUserToday(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<UserCommandesResponse[]> {
  try {
    const { entrepriseId } = data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const commandes = await prisma.commande.groupBy({
      by: ['userId'],
      where: {
        entrepriseId,
        date: { gte: today, lt: tomorrow },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    const userIds = commandes.map((c) => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nom: true, prenom: true },
    });

    const userCommandes = await prisma.commande.findMany({
      where: { entrepriseId, userId: { in: userIds }, date: { gte: today, lt: tomorrow } },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return commandes.map((group) => {
      const user = users.find((u) => u.id === group.userId)!;
      return {
        user: { id: user.id, nom: user.nom ?? '', prenom: user.prenom ?? '' },
        total: Number(group._sum.total) || 0,
        count: group._count.id,
        commandes: userCommandes.filter((c) => c.userId === group.userId).map(mapCommande),
      };
    });
  } catch (error) {
    console.error('service/commande getCommandesByUserToday: ', error);
    throw error;
  }
}

export async function getCommandesByUserAll(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<UserCommandesResponse[]> {
  try {
    const { entrepriseId } = data;

    const commandes = await prisma.commande.groupBy({
      by: ['userId'],
      where: { entrepriseId },
      _sum: { total: true },
      _count: { id: true },
    });

    const userIds = commandes.map((c) => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nom: true, prenom: true },
    });

    const userCommandes = await prisma.commande.findMany({
      where: { entrepriseId, userId: { in: userIds } },
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return commandes.map((group) => {
      const user = users.find((u) => u.id === group.userId)!;
      return {
        user: { id: user.id, nom: user.nom ?? '', prenom: user.prenom ?? '' },
        total: Number(group._sum.total) || 0,
        count: group._count.id,
        commandes: userCommandes.filter((c) => c.userId === group.userId).map(mapCommande),
      };
    });
  } catch (error) {
    console.error('service/commande getCommandesByUserAll: ', error);
    throw error;
  }
}

export async function getCommandesByUserDateRange(
  data: { entrepriseId: string; dateDebut?: string; dateFin?: string; limit?: number },
  prisma: PrismaClient
): Promise<UserCommandesResponse[]> {
  try {
    const { entrepriseId, dateDebut, dateFin, limit = 1000 } = data; // limiter à 1000 commandes par défaut

    // Limiter la plage de dates à 31 jours max pour éviter les freezes
    let start = dateDebut ? new Date(dateDebut) : new Date();
    let end = dateFin ? new Date(dateFin) : new Date();

    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 31) {
      start = new Date(end);
      start.setDate(end.getDate() - 31);
    }

    const where = {
      entrepriseId,
      date: { gte: start, lte: end },
    };

    // Calcul des totaux par user directement en DB
    const commandesGroup = await prisma.commande.groupBy({
      by: ['userId'],
      where,
      _sum: { total: true },
      _count: { id: true },
    });

    const userIds = commandesGroup.map((c) => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nom: true, prenom: true },
    });

    // Limiter le nombre de commandes récupérées
    const userCommandes = await prisma.commande.findMany({
      where,
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
      take: limit,
      orderBy: { date: 'desc' },
    });

    return commandesGroup.map((group) => {
      const user = users.find((u) => u.id === group.userId)!;
      return {
        user: { id: user.id, nom: user.nom ?? '', prenom: user.prenom ?? '' },
        total: Number(group._sum.total) || 0,
        count: group._count.id,
        commandes: userCommandes.filter((c) => c.userId === group.userId).map(mapCommande),
      };
    });
  } catch (error) {
    console.error('service/commande getCommandesByUserDateRange: ', error);
    throw error;
  }
}


export async function getCommandesByUserAndDateRange(
  data: { entrepriseId: string; userId: string; dateDebut?: string; dateFin?: string },
  prisma: PrismaClient
): Promise<Commande[]> {
  try {
    const { entrepriseId, userId, dateDebut, dateFin } = data;

    const where = {
      entrepriseId,
      userId,
      ...(dateDebut && dateFin && {
        date: {
          gte: new Date(dateDebut),
          lte: new Date(dateFin),
        },
      }),
    };

    const commandes = await prisma.commande.findMany({
      where,
      take: limit,
      include: {
        ventes: true,
        user: { select: { nom: true, prenom: true } },
        table: { select: { id: true, number: true } },
      },
    });

    return commandes.map(mapCommande);
  } catch (error) {
    console.error('service/commande getCommandesByUserAndDateRange: ', error);
    throw error;
  }
}

export async function getCommandesOfLastWeek(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<LastWeekResponse> {
  try {
    const { entrepriseId } = data;
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const commandes = await prisma.commande.findMany({
      where: {
        entrepriseId,
        date: { gte: lastWeek, lte: today },
      },
      select: { total: true },
    });

    const total = commandes.reduce((sum, c) => sum + Number(c.total), 0);

    return {
      dateDebut: lastWeek.toISOString(),
      dateFin: today.toISOString(),
      total,
    };
  } catch (error) {
    console.error('service/commande getCommandesOfLastWeek: ', error);
    throw error;
  }
}

// Helper function to map Prisma Commande to TypeScript Commande
function mapCommande(commande: any): Commande {
  return {
    id: commande.id,
    date: commande.date.toISOString(),
    total: Number(commande.total),
    userId: commande.userId,
    entrepriseId: commande.entrepriseId,
    isWaiting: commande.isWaiting,
    tpeAmount: Number(commande.tpeAmount),
    especeAmount: Number(commande.especeAmount),
    ticketAmount: Number(commande.ticketAmount),
    chequeAmount: Number(commande.chequeAmount),
    remise: commande.remise ? Number(commande.remise) : undefined,
    createdAt: commande.createdAt.toISOString(),
    updatedAt: commande.updatedAt.toISOString(),
    ventes: commande.ventes &&
    commande.ventes.map(vente=>({
      ...vente,
      puht:Number(vente.puht),
      remise:Number(vente.remise),
      totalHT:Number(vente.totalHT),
      totalTTC:Number(vente.totalTTC),
      tva:Number(vente.tva),
      createdAt: vente.createdAt.toISOString(),
  updatedAt: vente.updatedAt.toISOString()
    })),
    user: commande.user ? { nom: commande.user.nom ?? '', prenom: commande.user.prenom ?? '' } : undefined,
    ticketNumber: commande.ticketNumber,
    usedTicketRestos: undefined, // Not in schema
    tableId: commande.tableId,
    table: commande.table ? { id: commande.table.id, number: commande.table.number } : undefined,
  };
}

