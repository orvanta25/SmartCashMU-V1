import { useState, useCallback } from 'react';
import { getTicketFournisseurDateRange } from "@renderer/api/ticket-resto";
import { getCommandesByUserDateRange } from "@renderer/api/commande";
import { getCategoriesAll } from "@renderer/api/categorie";
import { getProducts } from "@renderer/api/produit";
import { getRetoursByDateRange } from "@renderer/api/retour";
import { getTotalAchatForDate } from "@renderer/api/achat-fournisseur";
import { getTotalAccMontantByDateRange } from "@renderer/api/acc";
import { getTotalChargesByDateRange } from "@renderer/api/charge";
 import { getVentesByDateRange } from "@renderer/api/vente";



// Types
interface Vente {
  id: string;
  codeBarre: string;
  designation: string;
  puht: number;
  quantite: number;
  tva: number;
  remise: number;
  totalHT: number;
  totalTTC: number;
  entrepriseId: string;
  commandeId: string;
  createdAt: string;
  updatedAt: string;
  retourQuantite: number;
}

interface TicketRestaurantTotal {
  Type: string;
  NbTickets: number;
  ValeurTicket: number;
  TotalAmount: number;
}

interface CaissierDetail {
  nom: string;
  userId: string;
  nombreVentes: number;
  montantTotal: number;
  totalRetours: number;
  paiements: {
    especes: number;
    carte: number;
    cheque: number;
    ticketRestaurant: number;
  };
  fondCaisse: number;
  totalRemises: number;
  totalNet: number;
  totalEncaissements: number;
}

interface PaymentTypeTotal {
  PaymentType: string;
  TotalAmount: number;
}

interface ProduitVente {
  NomProduit: string;
  QuantiteVendue: number;
  MontantVente: number;
  QuantiteRetournee: number;
  MontantRetour: number;
  QuantiteNet: number;
  MontantNet: number;
}

interface ProduitRetour {
  Produit: string;
  Quantite: number;
  Montant: number;
}

interface CommandeStats {
  commandesPayees: { nombre: number; montant: number };
  commandesEnAttente: { nombre: number; montant: number };
  commandesAnnulees: { nombre: number; montant: number };
}

interface Tresorerie {
  fondCaisseInitial: number;
  especeEncaissé: number;
  especeSorties: number;
  especeEntrees: number;
  totalEspeceAttendu: number;
}

interface DashboardData {
  // Section 1: Totaux généraux
  totalAchat: number;
  totalCharge: number;
  totalAcc: number;
  totalRemise: number;
  totalRetour: number;
  chiffreAffaire: number;
  beneficeNet: number;
  tvaCollecte: number;

  // Section 2: Détail par caissier
  caissiersDetails: CaissierDetail[];

  // Section 3: Ticket restaurant
  ticketRestaurantTotals: TicketRestaurantTotal[];

  // Section 4: Moyens de paiement
  paiementsDetails: PaymentTypeTotal[];

  // Section 5: Synthèse des commandes
  commandesStats: CommandeStats;

  // Section 6: Trésorerie
  tresorerie: Tresorerie;

  // Section 7: Vente par produit
  produitVentes: ProduitVente[];

  // Section 8: Retours par produit
  produitRetours: ProduitRetour[];

  // Section 9: Résumé final
  resumeFinal: {
    espece: number;
    ticketResto: number;
    cheque: number;
    tpe: number;
    remise: number;
    acc: number;
    retours: number;
    total: number;
  };

  // Informations générales
  profile: {
    entrepriseDenomination: string;
    Adresse: string;
  };
  caissier: string;
  reportNumber: string;
  dateDebut: string;
  heureDebut: string;
  dateFin: string;
  heureFin: string;
  dateGeneration: string;
  heureGeneration: string;
  chiffreAffairesTotal: number;
  totalEncaissements: number;
  nombreVentes: number;
  totalNet: number;
}

// Fonctions utilitaires
async function getCaissiersDetailsComplete(
  userCommandes: any[], 
  retours: any[],
  caissierId?: string
): Promise<CaissierDetail[]> {
  const caissiersMap: { [key: string]: CaissierDetail } = {};
  
  // Filtrer par caissier si spécifié
  const filteredUserCommandes = caissierId 
    ? userCommandes.filter(uc => uc.user?.id === caissierId)
    : userCommandes;
  
  filteredUserCommandes.forEach((uc) => {
    if (!uc.user) return;
    
    const userId = uc.user.id;
    const nomCaissier = `${uc.user.prenom || ''} ${uc.user.nom || ''}`.trim();
    
    const commandesCaissier = Array.isArray(uc.commandes) ? uc.commandes : [];
    const commandesPayees = commandesCaissier.filter((cmd: any) => 
      cmd && !cmd.isWaiting && Number(cmd.total || 0) > 0
    );
    
    if (commandesPayees.length === 0) return;
    
    if (!caissiersMap[userId]) {
      caissiersMap[userId] = {
        nom: nomCaissier,
        userId,
        nombreVentes: 0,
        montantTotal: 0,
        totalRetours: 0,
        paiements: {
          especes: 0,
          carte: 0,
          cheque: 0,
          ticketRestaurant: 0
        },
        fondCaisse: 0,
        totalRemises: 0,
        totalNet: 0,
        totalEncaissements: 0
      };
    }
    
    caissiersMap[userId].nombreVentes += commandesPayees.length;
    
    commandesPayees.forEach((cmd: any) => {
      const total = Number(cmd.total || 0);
      caissiersMap[userId].montantTotal += total;
      
      // Paiements
      const especeAmount = Number(cmd.especeAmount || cmd.montantEspece || 0);
      const tpeAmount = Number(cmd.tpeAmount || cmd.montantCarte || 0);
      const chequeAmount = Number(cmd.chequeAmount || cmd.montantCheque || 0);
      const ticketAmount = Number(cmd.ticketAmount || cmd.montantTicket || 0);
      
      caissiersMap[userId].paiements.especes += especeAmount;
      caissiersMap[userId].paiements.carte += tpeAmount;
      caissiersMap[userId].paiements.cheque += chequeAmount;
      caissiersMap[userId].paiements.ticketRestaurant += ticketAmount;
      
      // Remises
      if (cmd?.remise && cmd?.total) {
        const remiseAmount = (Number(cmd.remise) * Number(cmd.total)) / 100;
        caissiersMap[userId].totalRemises += remiseAmount;
      }
    });
  });
  
  // Calculer les retours par caissier
  const commandesMap = new Map();
  filteredUserCommandes.forEach(uc => {
    if (uc.commandes && Array.isArray(uc.commandes)) {
      uc.commandes.forEach((cmd: any) => {
        if (cmd && cmd.id) {
          commandesMap.set(cmd.id, { ...cmd, userId: uc.user?.id });
        }
      });
    }
  });
  
  retours.forEach((retour) => {
    const commande = commandesMap.get(retour.commandeId);
    if (!commande || !commande.userId) return;

    const userId = commande.userId;
    if (!caissiersMap[userId]) return;

    const montantRetour = Number(retour.totalRetour || retour.montant || 0);
    caissiersMap[userId].totalRetours += montantRetour;
  });
  
  // Calculer les totaux nets
  Object.keys(caissiersMap).forEach(userId => {
    const caissier = caissiersMap[userId];
    caissier.totalNet = caissier.montantTotal - caissier.totalRemises - caissier.totalRetours;
    caissier.totalEncaissements = 
      caissier.paiements.especes + 
      caissier.paiements.carte + 
      caissier.paiements.cheque + 
      caissier.paiements.ticketRestaurant - 
      caissier.totalRetours;
  });
  
  return Object.values(caissiersMap);
}

function calculateTVACollectee(ventes: Vente[]): number {
  try {
    let totalTVA = 0;
    
    ventes.forEach((vente) => {
      const tvaRate = vente.tva || 0;
      const totalHT = vente.totalHT || (vente.puht * vente.quantite) || 0;
      const tvaAmount = totalHT * (tvaRate / 100);
      totalTVA += tvaAmount;
    });
    
    return Math.round(totalTVA * 100) / 100;
  } catch (error) {
    return 0;
  }
}

function aggregateProduitVentes(ventes: Vente[], products: any[], retours: any[]): ProduitVente[] {
  const ventesParProduit: { [codeBarre: string]: ProduitVente } = {};

  // Initialiser avec tous les produits
  products.forEach((product: any) => {
    ventesParProduit[product.codeBarre] = {
      NomProduit: product.designation,
      QuantiteVendue: 0,
      MontantVente: 0,
      QuantiteRetournee: 0,
      MontantRetour: 0,
      QuantiteNet: 0,
      MontantNet: 0
    };
  });

  // Ajouter les ventes
  ventes.forEach(vente => {
    if (ventesParProduit[vente.codeBarre]) {
      ventesParProduit[vente.codeBarre].QuantiteVendue += vente.quantite;
      ventesParProduit[vente.codeBarre].MontantVente += vente.totalTTC;
    }
  });

  // Ajouter les retours
  retours.forEach(retour => {
    const lignes = retour.lignes || retour.items || [];
    lignes.forEach((ligne: any) => {
      const codeBarre = ligne.vente?.codeBarre || ligne.codeBarre;
      if (ventesParProduit[codeBarre]) {
        ventesParProduit[codeBarre].QuantiteRetournee += ligne.quantite || 0;
        ventesParProduit[codeBarre].MontantRetour += ligne.montant || 0;
      }
    });
  });

  // Calculer les nets
  Object.keys(ventesParProduit).forEach(codeBarre => {
    const produit = ventesParProduit[codeBarre];
    produit.QuantiteNet = produit.QuantiteVendue - produit.QuantiteRetournee;
    produit.MontantNet = produit.MontantVente - produit.MontantRetour;
  });

  return Object.values(ventesParProduit).filter(p => p.QuantiteVendue > 0 || p.QuantiteRetournee > 0);
}

function aggregateProduitRetours(retours: any[], products: any[]): ProduitRetour[] {
  const retoursParProduit: { [designation: string]: ProduitRetour } = {};

  retours.forEach(retour => {
    const lignes = retour.lignes || retour.items || [];
    lignes.forEach((ligne: any) => {
      const codeBarre = ligne.vente?.codeBarre || ligne.codeBarre;
      const product = products.find((p: any) => p.codeBarre === codeBarre);
      const designation = product?.designation || 'Produit inconnu';
      
      if (!retoursParProduit[designation]) {
        retoursParProduit[designation] = {
          Produit: designation,
          Quantite: 0,
          Montant: 0
        };
      }
      
      retoursParProduit[designation].Quantite += ligne.quantite || 0;
      retoursParProduit[designation].Montant += ligne.montant || 0;
    });
  });

  return Object.values(retoursParProduit);
}

function aggregatePaymentTotals(commandes: any[], retours: any[]): PaymentTypeTotal[] {
  const paymentTypes = [
    { type: 'Espèces', field: 'especeAmount' },
    { type: 'TPE', field: 'tpeAmount' },
    { type: 'Chèque', field: 'chequeAmount' },
    { type: 'Ticket Restaurant', field: 'ticketAmount' },
  ];
  
  // Calculer le total des retours
  const totalRetours = retours.reduce((sum, retour) => 
    sum + Number(retour.totalRetour || retour.montant || 0), 0);
  
  const paymentTotals = paymentTypes.map(pt => {
    let TotalAmount = commandes.reduce((sum, cmd) => {
      const amount = cmd[pt.field as keyof any] || 
                    cmd[pt.field.toLowerCase() as keyof any] ||
                    cmd[`montant${pt.type.replace(' ', '')}` as keyof any] ||
                    0;
      return sum + Number(amount || 0);
    }, 0);
    
    // Soustraire les retours des espèces
    if (pt.type === 'Espèces') {
      TotalAmount = Math.max(TotalAmount - totalRetours, 0);
    }
    
    return { 
      PaymentType: pt.type, 
      TotalAmount: Math.max(TotalAmount, 0)
    };
  }).filter(pt => pt.TotalAmount > 0);

  return paymentTotals;
}

function calculateTotalRemises(commandes: any[]): number {
  let totalRemises = 0;
  
  commandes.forEach(cmd => {
    if (cmd.remise && cmd.total) {
      const remisePourcentage = Number(cmd.remise) || 0;
      const totalCommande = Number(cmd.total) || 0;
      totalRemises += (remisePourcentage * totalCommande) / 100;
    }
  });
  
  return totalRemises;
}

function aggregateTicketTotals(ticketFournisseurData: any[]): TicketRestaurantTotal[] {
  if (!ticketFournisseurData || ticketFournisseurData.length === 0) {
    return [];
  }

  const result = ticketFournisseurData.map(item => {
    return {
      Type: item.fournisseur || 'Inconnu',
      NbTickets: item.nbTickets || 0,
      ValeurTicket: item.valeurMoyenne || 0,
      TotalAmount: item.totalAmount || 0
    };
  });

  return result;
}

function calculateCommandeStats(commandes: any[]): CommandeStats {
  let commandesPayees = 0, montantPayees = 0;
  let commandesEnAttente = 0, montantEnAttente = 0;
  let commandesAnnulees = 0, montantAnnulees = 0;
  
  commandes.forEach(cmd => {
    const total = Number(cmd.total || 0);
    if (cmd.isWaiting) {
      commandesEnAttente++;
      montantEnAttente += total;
    } else if (total === 0) {
      commandesAnnulees++;
      montantAnnulees += total;
    } else {
      commandesPayees++;
      montantPayees += total;
    }
  });
  
  return {
    commandesPayees: { nombre: commandesPayees, montant: montantPayees },
    commandesEnAttente: { nombre: commandesEnAttente, montant: montantEnAttente },
    commandesAnnulees: { nombre: commandesAnnulees, montant: montantAnnulees }
  };
}

// Hook principal
export function useZReportData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async (
    entrepriseId: string,
    userId: string,
    dateDebut: string,
    heureDebut: string,
    dateFin: string,
    heureFin: string,
    entrepriseNom: string = 'Votre Restaurant',
    entrepriseAdresse: string = 'Votre Adresse',
    caissierNom: string = 'Caissier',
    caissierId?: string
  ) => {
     console.log('Paramètres reçus:', {
    entrepriseNom,
    entrepriseAdresse,
    caissierNom,
    entrepriseId
  })
    setLoading(true);
    setError(null);

    try {
      // Formater les dates
      const formatDateTime = (date: string, time: string): string => {
        let isoDate = date;

        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(date)) {
          const [day, month, year] = date.split("-");
          isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        const [hours, minutes] = time.split(":");
        const isoTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;

        return `${isoDate}T${isoTime}:00`;
      };
      
      const startDateTime = formatDateTime(dateDebut, heureDebut);
      const endDateTime = formatDateTime(dateFin, heureFin);
      
      console.log("📊 Récupération des données pour la période:", { startDateTime, endDateTime });
      
      // Récupérer les données en parallèle
      const [
        userCommandes, 
        ticketFournisseurData, 
        categories, 
        products, 
        retours,
        totalCharge,
        totalAcc,
        totalAchat,
      ] = await Promise.all([
        // 1. Commandes par utilisateur (pour les caissiers)
        getCommandesByUserDateRange(entrepriseId, startDateTime, endDateTime).catch(() => []),
        
        // 2. Tickets restaurant
        getTicketFournisseurDateRange(entrepriseId, startDateTime, endDateTime).catch(() => []),
        
        // 3. Catégories
        getCategoriesAll(entrepriseId).catch(() => []),
        
        // 4. Produits
        getProducts(entrepriseId).catch(() => []),
        
        // 5. Retours
        getRetoursByDateRange(entrepriseId, startDateTime, endDateTime).catch(() => []),
        
        // 6. Charges
        getTotalChargesByDateRange(entrepriseId, startDateTime, endDateTime, 'paye').catch(() => 0),
        
        // 7. ACC
        getTotalAccMontantByDateRange(entrepriseId, startDateTime, endDateTime).catch(() => 0),
        
        // 8. Achats fournisseurs
        getTotalAchatForDate(entrepriseId, dateFin).catch(() => 0),
      ]);
      
      console.log("✅ Données récupérées:", {
        commandes: userCommandes.length,
        retours: retours.length,
        produits: products.length,
        totalAchat,
        totalCharge,
        totalAcc
      });
      
      // Traitement des données
      const allCommandes = userCommandes.flatMap((uc: any) => uc.commandes || []);
      const filteredCommandes = allCommandes.filter((cmd: any) => !cmd.isWaiting && Number(cmd.total || 0) > 0);
      
      // Extraire toutes les ventes des commandes
      const toutesVentes: Vente[] = [];
      allCommandes.forEach((commande: any) => {
        if (commande.ventes && Array.isArray(commande.ventes)) {
          commande.ventes.forEach((venteItem: any) => {
            const totalTTC = venteItem.totalTTC || 
                            (venteItem.puht * venteItem.quantite * (1 + (venteItem.tva || 0) / 100)) ||
                            0;
            
            toutesVentes.push({
              id: venteItem.id || `${commande.id}-${venteItem.codeBarre}-${Date.now()}`,
              codeBarre: venteItem.codeBarre,
              designation: venteItem.designation || 'Produit inconnu',
              puht: venteItem.puht || 0,
              quantite: venteItem.quantite || 0,
              tva: venteItem.tva || 0,
              remise: venteItem.remise || 0,
              totalHT: venteItem.totalHT || (venteItem.puht * venteItem.quantite) || 0,
              totalTTC: totalTTC,
              entrepriseId: entrepriseId,
              commandeId: commande.id,
              createdAt: commande.createdAt || new Date().toISOString(),
              updatedAt: commande.updatedAt || new Date().toISOString(),
              retourQuantite: 0
            });
          });
        }
      });
      
      // Calculs
      const tvaCollecte = calculateTVACollectee(toutesVentes);
      const caissiersDetails = await getCaissiersDetailsComplete(userCommandes, retours, caissierId);
      const paiementsDetails = aggregatePaymentTotals(filteredCommandes, retours);
      const ticketRestaurantTotals = aggregateTicketTotals(ticketFournisseurData);
      const produitVentes = aggregateProduitVentes(toutesVentes, products, retours);
      const produitRetours = aggregateProduitRetours(retours, products);
      
      const commandesStats = calculateCommandeStats(allCommandes);
      
      // Calculer le total des remises
      const totalRemise = calculateTotalRemises(filteredCommandes);
      
      // Calculer le total des retours
      const totalRetours = retours.reduce((sum: number, retour: any) => {
        return sum + Number(retour.totalRetour || retour.montant || 0);
      }, 0);
      
      // Calcul des totaux
      const chiffreAffaire = commandesStats.commandesPayees.montant;
      const totalEncaissements = paiementsDetails.reduce((sum, pt) => sum + pt.TotalAmount, 0) + 
                                ticketRestaurantTotals.reduce((sum, t) => sum + t.TotalAmount, 0);
      const beneficeNet = chiffreAffaire - (totalAchat || 0) - (totalCharge || 0) - totalRemise - totalRetours - (totalAcc || 0);
      
      // Trésorerie
      const fondCaisseInitial = caissiersDetails.reduce((sum, c) => sum + (c.fondCaisse || 0), 0);
      const especeEncaissé = paiementsDetails.find(p => p.PaymentType === 'Espèces')?.TotalAmount || 0;
      const especeSorties = totalRetours;
      const especeEntrees = 0;
      const totalEspeceAttendu = fondCaisseInitial + especeEncaissé - especeSorties + especeEntrees;
      
      // Résumé final
      const resumeFinal = {
        espece: paiementsDetails.find(p => p.PaymentType === 'Espèces')?.TotalAmount || 0,
        ticketResto: paiementsDetails.find(p => p.PaymentType === 'Ticket Restaurant')?.TotalAmount || 0,
        cheque: paiementsDetails.find(p => p.PaymentType === 'Chèque')?.TotalAmount || 0,
        tpe: paiementsDetails.find(p => p.PaymentType === 'TPE')?.TotalAmount || 0,
        remise: totalRemise,
        acc: totalAcc || 0,
        retours: totalRetours,
        total: totalEncaissements
      };
      
      // Construire l'objet de données complet
      const reportData: DashboardData = {
        // Section 1: Totaux généraux
        totalAchat: totalAchat || 0,
        totalCharge: totalCharge || 0,
        totalAcc: totalAcc || 0,
        totalRemise: totalRemise || 0,
        totalRetour: totalRetours || 0,
        chiffreAffaire: chiffreAffaire || 0,
        beneficeNet: beneficeNet || 0,
        tvaCollecte: tvaCollecte || 0,
        
        // Section 2: Détail par caissier
        caissiersDetails,
        
        // Section 3: Ticket restaurant
        ticketRestaurantTotals,
        
        // Section 4: Moyens de paiement
        paiementsDetails,
        
        // Section 5: Synthèse des commandes
        commandesStats,
        
        // Section 6: Trésorerie
        tresorerie: {
          fondCaisseInitial: fondCaisseInitial || 0,
          especeEncaissé: especeEncaissé || 0,
          especeSorties: especeSorties || 0,
          especeEntrees: especeEntrees || 0,
          totalEspeceAttendu: totalEspeceAttendu || 0,
        },
        
        // Section 7: Vente par produit
        produitVentes,
        
        // Section 8: Retours par produit
        produitRetours,
        
        // Section 9: Résumé final
        resumeFinal,
        
        // Informations générales
        profile: {
          entrepriseDenomination: entrepriseNom || '',
          Adresse: entrepriseAdresse || '',
        },
        caissier: caissierNom,
        reportNumber: `Z-${Date.now().toString(36).toUpperCase()}`,
        dateDebut,
        heureDebut,
        dateFin,
        heureFin,
        dateGeneration: new Date().toISOString().split('T')[0],
        heureGeneration: new Date().toTimeString().slice(0, 8),
        chiffreAffairesTotal: chiffreAffaire,
        totalEncaissements,
        nombreVentes: commandesStats.commandesPayees.nombre,
        totalNet: beneficeNet,
      };
      
      console.log("📈 Données du rapport générées:", reportData);
      setData(reportData);
      return reportData;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('❌ Erreur lors de la récupération des données:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchReportData,
    clearData,
  };
}