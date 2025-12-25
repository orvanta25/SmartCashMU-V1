'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@renderer/components/auth/auth-context';
import { getTicketFournisseurDateRange } from "@renderer/api/ticket-resto";
import { getCommandesByUserDateRange } from "@renderer/api/commande";
import { getCategoriesAll } from "@renderer/api/categorie";
import { getProducts } from "@renderer/api/produit";
import { getEmployeeById } from "@renderer/api/user-management";
import type { Vente } from "@renderer/types/vente";
import type { Commande } from "@renderer/types/commande";
import type { Product, Categorie } from "@renderer/types/product";
import { getRetoursByDateRange } from "@renderer/api/retour";
import RapportDashboardContent from '@renderer/components/dashboard_user_pages/DashboardContent/RapportDashboardContent';
import { getTotalAchatForDate } from "@renderer/api/achat-fournisseur";
import { getTotalAccMontantByDateRange } from "@renderer/api/acc";
import { getTotalChargesByDateRange } from "@renderer/api/charge";
import ClotureJourButton from './ClotureJourButton'




interface TicketRestaurantTotal {
  Type: string;
  NbTickets: number;
  ValeurTicket: number;
  TotalAmount: number;
}

interface TicketFournisseur {
  fournisseur: string;
  nbTickets: number;
  valeurTicket: number;
  totalAmount: number;
}

interface CaissierDetails {
  nom: string;
  userId?: string;
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

interface ZReportProps {
  produitTotals: ProduitTotal[];
  categorieTotals: CategorieTotal[];
  ventesParCaissier: { [key: string]: number };
  caissiersDetails: CaissierDetails[];
  totalsByPaymentType: PaymentTypeTotal[];
  ticketRestaurantTotals: TicketRestaurantTotal[];
  remises: number;
  NBcommandeNp: number;
  TotalCommandeNp: number;
  NBcommandeP: number;
  TotalcommandeP: number;
  NBcommandeO: number;
  TotalcommandeO: number;
  TotalRetours: number;
  servers: { Nom: string; FondCaisse: number }[];
  profile: { Nom: string; Adresse: string };
}

export default function DashboardContent() {
  const { entreprise, user, loading: authLoading } = useAuth();
  const [dateDebut, setDateDebut] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [heureDebut, setHeureDebut] = useState<string>('00:00');
  const [dateFin, setDateFin] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [heureFin, setHeureFin] = useState<string>('23:59');
  const [reportData, setReportData] = useState<ZReportProps>({
    produitTotals: [],
    categorieTotals: [],
    ventesParCaissier: {},
    caissiersDetails: [],
    totalsByPaymentType: [],
    ticketRestaurantTotals: [],
    remises: 0,
    NBcommandeNp: 0,
    TotalCommandeNp: 0,
    NBcommandeP: 0,
    TotalcommandeP: 0,
    NBcommandeO: 0,
    TotalcommandeO: 0,
    TotalRetours: 0,
    servers: [],
    profile: { Nom: 'Votre Restaurant', Adresse: 'Votre Adresse' },
  });
  
  const [rapportModerneData, setRapportModerneData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (authLoading || !entreprise?.id || !user?.id) {
    return;
  }

const fetchData = async () => {
  setLoading(true);
  try {
    const entrepriseId = entreprise.id;
    
    function formatDateTime(date: string, time: string): string {
      let isoDate = date;

      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split("-");
        isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      const [hours, minutes] = time.split(":");
      const isoTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;

      return `${isoDate}T${isoTime}:00`;
    }
    
    const startDateTime = formatDateTime(dateDebut, heureDebut);
    const endDateTime = formatDateTime(dateFin, heureFin);
    
    console.log("📅 Dates formatées:", { startDateTime, endDateTime });
    let totalAchat = 0;
    try {
      totalAchat = await getTotalAchatForDate(entrepriseId, dateFin);
    } catch (error) {}

    const [
      userCommandes, 
      ticketFournisseurData, 
      categories, 
      products, 
      retours,
      totalCharge,
      totalAcc
    ] = await Promise.all([
      getCommandesByUserDateRange(entrepriseId, startDateTime, endDateTime),
      getTicketFournisseurDateRange(entrepriseId, startDateTime, endDateTime),
      getCategoriesAll(entrepriseId),
      getProducts(entrepriseId),
      getRetoursByDateRange(entrepriseId, startDateTime, endDateTime),
      (async () => {
        try {
          const result = await getTotalChargesByDateRange(
            entrepriseId, 
            startDateTime, 
            endDateTime,
            'paye'
          );
          return result;
        } catch (error) {
          return 0;
        }
      })(),
      getTotalAccMontantByDateRange(entrepriseId, startDateTime, endDateTime)
    ]);
    
    const allCommandes = userCommandes.flatMap(uc => uc.commandes || []);
    
    const filteredCommandes = allCommandes.filter(cmd => !cmd.isWaiting && Number(cmd.total || 0) > 0);
    
    const typedProducts: Product[] = products.map((p: any) => ({
      ...p,
      puht: Number(p.puht),
      tva: Number(p.tva),
      remise: Number(p.remise),
      quantite: Number(p.quantite),
    }));
    
    const toutesVentes: Vente[] = [];
    
    allCommandes.forEach(commande => {
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
    
    const tvaCollecte = calculateTVACollectee(toutesVentes, allCommandes);
    
    const venteBarcodes = new Set(toutesVentes.map(v => v.codeBarre));
    const filteredProducts = typedProducts.filter(p => venteBarcodes.has(p.codeBarre));
    
    const venteCategoryNames = new Set(filteredProducts.map(p => p.categorie?.nom).filter(Boolean));
    const filteredCategories = categories.filter(cat => venteCategoryNames.has(cat.nom));
    
    const totalRemise = filteredCommandes.reduce((sum, cmd) => sum + (Number(cmd.remise || 0) * Number(cmd.total || 0) / 100), 0);
    
    const produitTotals: ProduitTotal[] = aggregateProduitTotals(toutesVentes, filteredProducts, filteredCommandes, retours);
    const categorieTotals: CategorieTotal[] = aggregateCategorieTotals(toutesVentes, filteredCategories, filteredProducts, filteredCommandes, retours);
    const totalsByPaymentType: PaymentTypeTotal[] = aggregatePaymentTotals(filteredCommandes, retours);
    
    const ticketRestaurantTotals: TicketRestaurantTotal[] = aggregateTicketTotals(ticketFournisseurData);
    
    const { 
      NBcommandeNp, 
      TotalCommandeNp, 
      NBcommandeP, 
      TotalcommandeP, 
      NBcommandeO, 
      TotalcommandeO,
      TotalRetours 
    } = calculateCommandeStats(allCommandes, retours);
    
    const caissiersDetails: CaissierDetails[] = await getCaissiersDetailsComplete(userCommandes, retours);
    
    const totalEncaissements = totalsByPaymentType.reduce((sum, pt) => sum + pt.TotalAmount, 0) + 
                             ticketRestaurantTotals.reduce((sum, t) => sum + t.TotalAmount, 0);
    const totalNet = TotalcommandeP - TotalRetours;
    
    const retoursParProduit = aggregateRetoursParProduit(retours, typedProducts);
    
    const moderneData = {
      profile: {
        Nom: entreprise.nom || 'Votre Restaurant',
        Adresse: entreprise.region || 'Votre Adresse',
      },
      caissier: `${user?.prenom} ${user?.nom}`,
      reportNumber: `Z-${Date.now()}`,
      dateOuverture: dateDebut,
      heureOuverture: heureDebut,
      dateFermeture: dateFin,
      heureFermeture: heureFin,
      dateGeneration: new Date().toLocaleDateString('fr-FR'),
      heureGeneration: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),

      totalAchat: totalAchat,
      totalCharge: totalCharge,
      totalAcc: totalAcc,  
      tvaCollecte: tvaCollecte,

      chiffreAffairesTotal: TotalcommandeP,
      totalEncaissements: totalEncaissements,
      totalRemises: totalRemise,
      totalRetours: TotalRetours,
      totalNet: totalNet,
      nombreVentes: NBcommandeP,
      nombreRetours: retours.length,

      detailPaiements: totalsByPaymentType,
      ticketRestaurantTotals: ticketRestaurantTotals,
      
      ticketFournisseurDetails: ticketRestaurantTotals.map(ticket => ({
        fournisseur: ticket.Type,
        nbTickets: ticket.NbTickets,
        valeurTicket: ticket.ValeurTicket,
        totalAmount: ticket.TotalAmount
      })),

      fondCaisseInitial: caissiersDetails.reduce((sum, c) => sum + c.fondCaisse, 0),
      totalEspecesEncaissées: caissiersDetails.reduce((sum, c) => sum + c.paiements.especes, 0),
      totalEspecesSorties: TotalRetours,
      totalEspecesEntree: 0,
      totalEspecesFinalAttendu: caissiersDetails.reduce((sum, c) => sum + c.paiements.especes, 0) + 
                               caissiersDetails.reduce((sum, c) => sum + c.fondCaisse, 0) - 
                               TotalRetours,

      produitTotals: produitTotals.map(produit => {
        const produitRetour = retoursParProduit.find(r => r.nomProduit === produit.NomProduit);
        return {
          ...produit,
          TotalRetours: produitRetour?.montant || 0,
          TotalNet: produit.TotalVente - (produitRetour?.montant || 0)
        };
      }),

      ventesParCaissier: caissiersDetails.map(caissier => ({
        nom: caissier.nom,
        nombreVentes: caissier.nombreVentes,
        montantTotal: caissier.montantTotal,
        totalRetours: caissier.totalRetours,
        paiements: caissier.paiements,
        fondCaisse: caissier.fondCaisse,
        totalRemises: caissier.totalRemises,
        totalNet: caissier.totalNet,
        totalEncaissements: caissier.totalEncaissements
      })),

      commandesStats: {
        commandesPayees: {
          nombre: NBcommandeP,
          montant: TotalcommandeP,
        },
        commandesEnAttente: {
          nombre: NBcommandeNp,
          montant: TotalCommandeNp,
        },
        commandesAnnulees: {
          nombre: NBcommandeO,
          montant: TotalcommandeO,
        },
        montantTotalEncaissé: TotalcommandeP,
        montantTotalRemises: totalRemise,
      },

      retoursDetails: {
        nombreRetours: retours.length,
        montantTotalRetourne: TotalRetours,
        detailParProduit: retoursParProduit,
        retoursParCaissier: caissiersDetails.map(c => ({
          nom: c.nom,
          montant: c.totalRetours
        }))
      }
    };

    setReportData({
      produitTotals,
      categorieTotals,
      caissiersDetails,
      totalsByPaymentType,
      ticketRestaurantTotals,
      remises: totalRemise,
      NBcommandeNp,
      TotalCommandeNp,
      NBcommandeP,
      TotalcommandeP,
      NBcommandeO,
      TotalcommandeO,
      TotalRetours,
      servers: caissiersDetails.map(c => ({ Nom: c.nom, FondCaisse: c.fondCaisse })),
      profile: {
        Nom: entreprise.nom || 'Votre Restaurant',
        Adresse: entreprise.region || 'Votre Adresse',
      },
    });
    
    setRapportModerneData(moderneData);
    
  } catch (error) {
  } finally {
    setLoading(false);
  }
};

  fetchData();
}, [authLoading, entreprise, user, dateDebut, dateFin, heureDebut, heureFin]);

  if (loading || authLoading) {
    return <div>Chargement des données...</div>;
  }

  if (!rapportModerneData) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-6 mb-8 items-end flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-white mb-1" htmlFor="date-debut">Date Début</label>
          <input
            id="date-debut"
            type="date"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-transparent text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-white mb-1" htmlFor="heure-debut">Heure Début</label>
          <input
            id="heure-debut"
            type="time"
            value={heureDebut}
            onChange={e => setHeureDebut(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-transparent text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-white mb-1" htmlFor="date-fin">Date Fin</label>
          <input
            id="date-fin"
            type="date"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-transparent text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-white mb-1" htmlFor="heure-fin">Heure Fin</label>
          <input
            id="heure-fin"
            type="time"
            value={heureFin}
            onChange={e => setHeureFin(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-transparent text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>
      <RapportDashboardContent {...rapportModerneData} />
    </div>
  );
}
async function getCaissiersDetailsComplete(
  userCommandes: any[], 
  retours: any[]
): Promise<CaissierDetails[]> {
  const caissiersMap: { [key: string]: CaissierDetails } = {};
  
  userCommandes.forEach((uc) => {
    if (!uc.user) {
      return;
    }
    
    const hasValidName = Boolean(uc.user.nom || uc.user.prenom);
    const hasValidId = Boolean(uc.user.id);
    
    if (!hasValidName || !hasValidId) {
      return;
    }
    
    const userId = uc.user.id;
    const nomCaissier = `${uc.user.prenom || ''} ${uc.user.nom || ''}`.trim();
    
    const commandesCaissier = Array.isArray(uc.commandes) ? uc.commandes : [];
    const commandesPayees = commandesCaissier.filter((cmd: any) => 
      cmd && !cmd.isWaiting && Number(cmd.total || 0) > 0
    );
    
    if (commandesPayees.length === 0) {
      return;
    }
    
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
      
      const especeAmount = Number(cmd.especeAmount || cmd.montantEspece || 0);
      const tpeAmount = Number(cmd.tpeAmount || cmd.montantCarte || 0);
      const chequeAmount = Number(cmd.chequeAmount || cmd.montantCheque || 0);
      const ticketAmount = Number(cmd.ticketAmount || cmd.montantTicket || 0);
      
      if (especeAmount === 0 && tpeAmount === 0 && chequeAmount === 0 && ticketAmount === 0) {
        const moyenPaiement = cmd.moyenPaiement || cmd.paymentMethod;
        if (moyenPaiement) {
          switch (moyenPaiement.toUpperCase()) {
            case 'ESPÈCES':
            case 'ESPECES':
            case 'CASH':
              caissiersMap[userId].paiements.especes += total;
              break;
            case 'CARTE':
            case 'TPE':
            case 'CREDIT_CARD':
              caissiersMap[userId].paiements.carte += total;
              break;
            case 'CHÈQUE':
            case 'CHEQUE':
            case 'CHECK':
              caissiersMap[userId].paiements.cheque += total;
              break;
            case 'TICKET':
            case 'TICKET_RESTAURANT':
            case 'MEAL_TICKET':
              caissiersMap[userId].paiements.ticketRestaurant += total;
              break;
            default:
              caissiersMap[userId].paiements.especes += total;
          }
        } else {
          caissiersMap[userId].paiements.especes += total;
        }
      } else {
        caissiersMap[userId].paiements.especes += especeAmount;
        caissiersMap[userId].paiements.carte += tpeAmount;
        caissiersMap[userId].paiements.cheque += chequeAmount;
        caissiersMap[userId].paiements.ticketRestaurant += ticketAmount;
      }
      
      if (cmd?.remise && cmd?.total) {
        const remiseAmount = (Number(cmd.remise) * Number(cmd.total)) / 100;
        caissiersMap[userId].totalRemises += remiseAmount;
      }
    });
  });
  
  const commandesMap = new Map();
  const usersMap = new Map();
  userCommandes.forEach(uc => {
    if (uc.user && uc.user.id) {
      usersMap.set(uc.user.id, uc.user);
    }
  });
  
  userCommandes.forEach(uc => {
    if (uc.commandes && Array.isArray(uc.commandes)) {
      uc.commandes.forEach((cmd: any) => {
        if (cmd && cmd.id) {
          const commandeAvecUser = { ...cmd };
          
          if (!commandeAvecUser.user && commandeAvecUser.userId) {
            const user = usersMap.get(commandeAvecUser.userId);
            if (user) {
              commandeAvecUser.user = {
                id: user.id,
                nom: user.nom || '',
                prenom: user.prenom || ''
              };
            }
          } else if (commandeAvecUser.user && !commandeAvecUser.user.id && commandeAvecUser.userId) {
            const user = usersMap.get(commandeAvecUser.userId);
            if (user) {
              commandeAvecUser.user.id = user.id;
            }
          }
          
          commandesMap.set(cmd.id, commandeAvecUser);
        }
      });
    }
  });
  
  retours.forEach((retour) => {
    let commande = retour.commande;
    
    if (!commande && retour.commandeId) {
      commande = commandesMap.get(retour.commandeId);
    }
    
    if (!commande || !commande.user) {
      return;
    }

    const userId = commande.user.id;
    
    if (!caissiersMap[userId]) {
      return;
    }

    const montantRetour = Number(retour.totalRetour || 0);
    caissiersMap[userId].totalRetours += montantRetour;
  });
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
function calculateTVACollectee(ventes: any[], commandes: any[]): number {
  try {
    let totalTVA = 0;
    
    if (ventes && ventes.length > 0) {
      ventes.forEach((vente: any) => {
        const tvaRate = vente.tva || 0;
        const totalHT = vente.totalHT || (vente.puht * vente.quantite) || 0;
        const tvaAmount = totalHT * (tvaRate / 100);
        totalTVA += tvaAmount;
      });
    }
    
    if (commandes && commandes.length > 0 && ventes.length === 0) {
      commandes.forEach((commande: any) => {
        if (commande.ventes && Array.isArray(commande.ventes)) {
          commande.ventes.forEach((vente: any) => {
            const tvaRate = vente.tva || 0;
            const totalHT = vente.totalHT || (vente.puht * vente.quantite) || 0;
            const tvaAmount = totalHT * (tvaRate / 100);
            totalTVA += tvaAmount;
          });
        }
      });
    }
    
    return Math.round(totalTVA * 100) / 100;
  } catch (error) {
    return 0;
  }
}
function aggregateRetoursParProduit(retours: any[], products: any[]): Array<{ nomProduit: string; quantite: number; montant: number }> {
  const retoursParProduit: { [key: string]: { nomProduit: string; quantite: number; montant: number } } = {};

  retours.forEach(retour => {
    const lignes = retour.lignes || retour.items || [];
    lignes.forEach((ligne: any) => {
      if (ligne.vente && ligne.vente.codeBarre) {
        const product = products.find(p => p.codeBarre === ligne.vente.codeBarre);
        const nomProduit = product?.designation || 'Produit inconnu';
        if (!retoursParProduit[nomProduit]) {
          retoursParProduit[nomProduit] = {
            nomProduit,
            quantite: 0,
            montant: 0,
          };
        }
        retoursParProduit[nomProduit].quantite += ligne.quantite || 0;
        retoursParProduit[nomProduit].montant += ligne.montant || 0;
      } else if (ligne.codeBarre) {
        const product = products.find(p => p.codeBarre === ligne.codeBarre);
        const nomProduit = product?.designation || 'Produit inconnu';
        if (!retoursParProduit[nomProduit]) {
          retoursParProduit[nomProduit] = {
            nomProduit,
            quantite: 0,
            montant: 0,
          };
        }
        retoursParProduit[nomProduit].quantite += ligne.quantite || 0;
        retoursParProduit[nomProduit].montant += ligne.montant || 0;
      }
    });
  });

  return Object.values(retoursParProduit);
}
function aggregateProduitTotals(
    ventes: Vente[], 
    products: Product[], 
    commandes: Commande[],
    retours: any[]
): ProduitTotal[] {
    if (ventes.length === 0 || products.length === 0) {
        return [];
    }
  
    const remiseByProduct: { [codeBarre: string]: number } = {};
    commandes.forEach(cmd => {
        if (cmd.remise && cmd.ventes) {
            const commandeRemisePercentage = Number(cmd.remise) / 100;
            cmd.ventes.forEach((vente: any) => {
                if (!remiseByProduct[vente.codeBarre]) {
                    remiseByProduct[vente.codeBarre] = 0;
                }
                const venteTotal = Number(vente.totalTTC || 0);
                remiseByProduct[vente.codeBarre] += venteTotal * commandeRemisePercentage;
            });
        }
    });

    const retourByProduct: { [codeBarre: string]: { quantite: number, montant: number } } = {};
    retours.forEach(retour => {
        const lignes = retour.lignes || retour.items || [];
        lignes.forEach((ligne: any) => {
            const codeBarre = ligne.vente?.codeBarre || ligne.codeBarre;
            if (codeBarre) {
                if (!retourByProduct[codeBarre]) {
                    retourByProduct[codeBarre] = { quantite: 0, montant: 0 };
                }
                retourByProduct[codeBarre].quantite += ligne.quantite || 0;
                retourByProduct[codeBarre].montant += ligne.montant || 0;
            }
        });
    });

    const produitTotals = products.map(product => {
        const productVentes = ventes.filter(v => v.codeBarre === product.codeBarre);
        const QuantiteTotale = productVentes.reduce((sum, v) => sum + (Number(v.quantite) || 0), 0);
        const TotalVente = productVentes.reduce((sum, v) => sum + Number(v.totalTTC || 0), 0);
        
        const produitRetour = retourByProduct[product.codeBarre];
        const quantiteNet = produitRetour ? QuantiteTotale - produitRetour.quantite : QuantiteTotale;
        const totalNet = produitRetour ? TotalVente - produitRetour.montant : TotalVente;

        return { 
            NomProduit: product.designation, 
            QuantiteTotale: quantiteNet, 
            TotalVente: totalNet 
        };
    }).filter(p => p.QuantiteTotale > 0 || p.TotalVente > 0);

    Object.entries(remiseByProduct).forEach(([codeBarre, remiseAmount]) => {
        if (remiseAmount > 0) {
            const product = products.find(p => p.codeBarre === codeBarre);
            if (product) {
                produitTotals.push({
                    NomProduit: `Remise ${product.designation}`,
                    QuantiteTotale: 0,
                    TotalVente: -remiseAmount
                });
            }
        }
    });

    const totalRetourGlobal = retours.reduce((sum, retour) => sum + Number(retour.totalRetour || retour.montant || 0), 0);
    if (totalRetourGlobal > 0) {
        produitTotals.push({
            NomProduit: "TOTAL RETOURS",
            QuantiteTotale: 0,
            TotalVente: -totalRetourGlobal
        });
    }
    
    return produitTotals;
}
function aggregateCategorieTotals(
  ventes: Vente[], 
  categories: Categorie[], 
  products: Product[], 
  commandes: Commande[],
  retours: any[]
): CategorieTotal[] {
  const remiseByCategory: { [categoryName: string]: number } = {};
  commandes.forEach(cmd => {
    if (cmd.remise && cmd.ventes) {
      const commandeRemisePercentage = Number(cmd.remise) / 100;
      cmd.ventes.forEach((vente: any) => {
        const product = products.find(p => p.codeBarre === vente.codeBarre);
        if (product && product.categorie?.nom) {
          if (!remiseByCategory[product.categorie.nom]) {
            remiseByCategory[product.categorie.nom] = 0;
          }
          const venteTotal = Number(vente.totalTTC || 0);
          remiseByCategory[product.categorie.nom] += venteTotal * commandeRemisePercentage;
        }
      });
    }
  });

  const retourByCategory: { [categoryName: string]: number } = {};
  retours.forEach(retour => {
    const lignes = retour.lignes || retour.items || [];
    lignes.forEach((ligne: any) => {
      const codeBarre = ligne.vente?.codeBarre || ligne.codeBarre;
      const product = products.find(p => p.codeBarre === codeBarre);
      if (product && product.categorie?.nom) {
        if (!retourByCategory[product.categorie.nom]) {
          retourByCategory[product.categorie.nom] = 0;
        }
        retourByCategory[product.categorie.nom] += ligne.montant || 0;
      }
    });
  });

  const categorieTotals = categories.map(category => {
    const categoryProducts = products.filter(p => p.categorie?.nom === category.nom);
    const categoryVentes = ventes.filter(v => categoryProducts.some(p => p.codeBarre === v.codeBarre));
    const TotalVente = categoryVentes.reduce((sum, v) => sum + Number(v.totalTTC || 0), 0);
    
    const categoryRetour = retourByCategory[category.nom || ''] || 0;
    const totalNet = TotalVente - categoryRetour;
    
    return { 
      NomCategorie: category.nom || '', 
      TotalVente: totalNet 
    };
  }).filter(c => c.TotalVente > 0);

  Object.entries(remiseByCategory).forEach(([categoryName, remiseAmount]) => {
    if (remiseAmount > 0) {
      categorieTotals.push({
        NomCategorie: `Remise ${categoryName}`,
        TotalVente: -remiseAmount
      });
    }
  });

  Object.entries(retourByCategory).forEach(([categoryName, retourAmount]) => {
    if (retourAmount > 0) {
      categorieTotals.push({
        NomCategorie: `⇨ Retour ${categoryName}`,
        TotalVente: -retourAmount
      });
    }
  });

  return categorieTotals;
}
function aggregatePaymentTotals(commandes: Commande[], retours: any[]): PaymentTypeTotal[] {
    const paymentTypes = [
        { type: 'Espèces', field: 'especeAmount' },
        { type: 'TPE', field: 'tpeAmount' },
        { type: 'Chèque', field: 'chequeAmount' },
        { type: 'Ticket Restaurant', field: 'ticketAmount' },
    ];
    
    const totalRetours = retours.reduce((sum, retour) => sum + Number(retour.totalRetour || retour.montant || 0), 0);
    
    const paymentTotals = paymentTypes.map(pt => {
        let TotalAmount = commandes.reduce((sum, cmd) => {
            const amount = cmd[pt.field as keyof Commande] || 
                          cmd[pt.field.toLowerCase() as keyof Commande] ||
                          cmd[`montant${pt.type.replace(' ', '')}` as keyof Commande] ||
                          0;
            return sum + Number(amount || 0);
        }, 0);
        
        if (pt.type === 'Espèces') {
            TotalAmount -= totalRetours;
        }
        
        return { 
            PaymentType: pt.type, 
            TotalAmount: Math.max(TotalAmount, 0)
        };
    }).filter(pt => pt.TotalAmount > 0);

    return paymentTotals;
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

function calculateCommandeStats(
    commandes: Commande[], 
    retours: any[]
): {
    NBcommandeNp: number;
    TotalCommandeNp: number;
    NBcommandeP: number;
    TotalcommandeP: number;
    NBcommandeO: number;
    TotalcommandeO: number;
    TotalRetours: number;
} {
    let NBcommandeNp = 0, TotalCommandeNp = 0, NBcommandeP = 0, TotalcommandeP = 0, 
        NBcommandeO = 0, TotalcommandeO = 0;
    
    commandes.forEach(cmd => {
        const total = Number(cmd.total || 0);
        if (cmd.isWaiting) {
            NBcommandeNp++;
            TotalCommandeNp += total;
        } else if (total === 0) {
            NBcommandeO++;
            TotalcommandeO += total;
        } else {
            NBcommandeP++;
            TotalcommandeP += total;
        }
    });
    
    const TotalRetours = retours.reduce((sum, retour) => sum + Number(retour.totalRetour || retour.montant || 0), 0);
    
    return { 
        NBcommandeNp, 
        TotalCommandeNp, 
        NBcommandeP, 
        TotalcommandeP, 
        NBcommandeO, 
        TotalcommandeO,
        TotalRetours
    };
}