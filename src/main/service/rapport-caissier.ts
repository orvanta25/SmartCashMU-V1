import { PrismaClient } from "@prisma/client";
import { GenerateRapportCaissierDto, CaissierRapport, PaiementStats } from "../model/rapport-caissier";

export async function generateRapportCaissier(
  data: GenerateRapportCaissierDto,
  prisma: PrismaClient
) {
  const { caissiers, dateOuverture, dateFermeture, periode, includeDetails = false } = data;

  if (!caissiers || !Array.isArray(caissiers) || caissiers.length === 0) {
    throw new Error('Liste des caissiers requise');
  }

  const startDate = dateOuverture 
    ? new Date(dateOuverture + 'T00:00:00')
    : new Date(new Date().setHours(0, 0, 0, 0));
  
  const endDate = dateFermeture
    ? new Date(dateFermeture + 'T23:59:59')
    : new Date(new Date().setHours(23, 59, 59, 999));

  const rapports: CaissierRapport[] = [];

  for (const caissier of caissiers) {
    const ventes = await prisma.vente.findMany({
      where: {
        caissier: caissier.nom,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        statut: 'PAYEE'
      },
      include: {
        lignesVente: {
          include: {
            produit: true
          }
        },
        paiements: true
      }
    });

    const retours = await prisma.retour.findMany({
      where: {
        caissier: caissier.nom,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalVentes = ventes.reduce((sum, v) => sum + Number(v.totalTTC), 0);
    const totalRemises = ventes.reduce((sum, v) => sum + Number(v.remise || 0), 0);
    const totalRetours = retours.reduce((sum, r) => sum + Number(r.montantTotal), 0);
    
    const paiements = ventes.flatMap(v => v.paiements);
    const paiementsByType: PaiementStats = {
      especes: paiements.filter(p => p.type === 'ESPECES').reduce((sum, p) => sum + Number(p.montant), 0),
      carte: paiements.filter(p => p.type === 'CARTE').reduce((sum, p) => sum + Number(p.montant), 0),
      cheque: paiements.filter(p => p.type === 'CHEQUE').reduce((sum, p) => sum + Number(p.montant), 0),
      ticketRestaurant: paiements.filter(p => p.type === 'TICKET_RESTAURANT').reduce((sum, p) => sum + Number(p.montant), 0),
      virement: paiements.filter(p => p.type === 'VIREMENT').reduce((sum, p) => sum + Number(p.montant), 0)
    };

    const fondCaisse = await prisma.fondCaisse.findFirst({
      where: {
        caissier: caissier.nom,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcul des produits vendus (si includeDetails)
    const produitsVendus = [];
    if (includeDetails) {
      const produitMap = new Map();
      ventes.forEach(vente => {
        vente.lignesVente.forEach(ligne => {
          const key = ligne.produitId;
          if (produitMap.has(key)) {
            const existing = produitMap.get(key);
            existing.quantite += ligne.quantite;
            existing.total += Number(ligne.prixTotalTTC || ligne.prixTotalHT || 0);
          } else {
            produitMap.set(key, {
              produitId: ligne.produitId,
              nomProduit: ligne.produit?.nom || 'Inconnu',
              quantite: ligne.quantite,
              total: Number(ligne.prixTotalTTC || ligne.prixTotalHT || 0)
            });
          }
        });
      });
      produitsVendus.push(...produitMap.values());
    }

    rapports.push({
      nom: caissier.nom,
      nombreVentes: ventes.length,
      montantTotal: totalVentes,
      totalRemises,
      totalRetours,
      totalNet: totalVentes - totalRetours - totalRemises,
      fondCaisse: Number(fondCaisse?.montant || 0),
      totalEncaissements: totalVentes - totalRetours,
      paiements: paiementsByType,
      ventes: includeDetails ? ventes.slice(0, 10) : [],
      retours: includeDetails ? retours : [],
      produitsVendus: includeDetails ? produitsVendus : []
    });
  }

  return {
    rapports,
    periode: periode || `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`,
    dateGeneration: new Date().toLocaleString('fr-FR'),
    totalGeneral: {
      nombreVentes: rapports.reduce((sum, r) => sum + r.nombreVentes, 0),
      montantTotal: rapports.reduce((sum, r) => sum + r.montantTotal, 0),
      totalRemises: rapports.reduce((sum, r) => sum + r.totalRemises, 0),
      totalRetours: rapports.reduce((sum, r) => sum + r.totalRetours, 0),
      totalNet: rapports.reduce((sum, r) => sum + r.totalNet, 0)
    }
  };
}

export async function generateRapportCaissierUnique(
  data: {
    caissier: string;
    startDate?: string;
    endDate?: string;
    includeDetails?: boolean;
  },
  prisma: PrismaClient
) {
  const { caissier, startDate, endDate, includeDetails = true } = data;

  const dateDebut = startDate 
    ? new Date(startDate + 'T00:00:00')
    : new Date(new Date().setDate(new Date().getDate() - 30));
  
  const dateFin = endDate
    ? new Date(endDate + 'T23:59:59')
    : new Date();

  const ventes = await prisma.vente.findMany({
    where: {
      caissier,
      createdAt: {
        gte: dateDebut,
        lte: dateFin
      },
      statut: 'PAYEE'
    },
    include: {
      lignesVente: {
        include: {
          produit: true
        }
      },
      paiements: true
    }
  });

  const retours = await prisma.retour.findMany({
    where: {
      caissier,
      createdAt: {
        gte: dateDebut,
        lte: dateFin
      }
    }
  });

  const stats = {
    periode: `${dateDebut.toLocaleDateString('fr-FR')} - ${dateFin.toLocaleDateString('fr-FR')}`,
    caissier,
    nombreVentes: ventes.length,
    montantTotal: ventes.reduce((sum, v) => sum + Number(v.totalTTC), 0),
    totalRemises: ventes.reduce((sum, v) => sum + Number(v.remise || 0), 0),
    totalRetours: retours.reduce((sum, r) => sum + Number(r.montantTotal), 0),
    totalNet: 0,
    moyennePanier: 0,
    meilleurJour: '',
    produitsVendus: [] as any[]
  };

  stats.totalNet = stats.montantTotal - stats.totalRetours - stats.totalRemises;
  stats.moyennePanier = ventes.length > 0 ? stats.montantTotal / ventes.length : 0;

  // Calculer les produits vendus
  const produitMap = new Map();
  ventes.forEach(vente => {
    vente.lignesVente.forEach(ligne => {
      const key = ligne.produitId;
      if (produitMap.has(key)) {
        const existing = produitMap.get(key);
        existing.quantite += ligne.quantite;
        existing.total += Number(ligne.prixTotalTTC || ligne.prixTotalHT || 0);
      } else {
        produitMap.set(key, {
          produitId: ligne.produitId,
          nomProduit: ligne.produit?.nom || 'Inconnu',
          quantite: ligne.quantite,
          total: Number(ligne.prixTotalTTC || ligne.prixTotalHT || 0)
        });
      }
    });
  });

  stats.produitsVendus = Array.from(produitMap.values())
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 20);

  return {
    stats,
    ventes: includeDetails ? ventes.slice(0, 50) : [],
    retours: includeDetails ? retours : []
  };
}