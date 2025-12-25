// renderer/src/components/dashboard_user_pages/DashboardContent/DashboardDataFetcher.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RapportDashboardContent from './RapportDashboardContent';
import { 
  getTicketFournisseurDateRange,
  getTicketsByDateRange 
} from "@renderer/api/ticket-resto";
import { getCommandesByUserDateRange } from "@renderer/api/commande";
import { getProducts } from "@renderer/api/produit";
import { getEmployeeById } from "@renderer/api/user-management";
import { getRetoursByDateRange } from "@renderer/api/retour";
import { getTotalAchatForDate } from "@renderer/api/achat-fournisseur";
import { getTotalAccMontantByDateRange, getAccDetailsByDateRange } from "@renderer/api/acc";
import { getTotalChargesByDateRange } from "@renderer/api/charge";
import { getVentesByDateRange, getVentesByCaissierDateRange } from "@renderer/api/vente";
import { getCaisseOuverture, getFondCaisseInitial } from "@renderer/api/caisse";
import { getProfileInfo } from "@renderer/api/settings";

interface DashboardDataFetcherProps {
  startDate: string;
  endDate: string;
  caissierId: string;
}

const DashboardDataFetcher: React.FC<DashboardDataFetcherProps> = ({
  startDate,
  endDate,
  caissierId
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  // Formatage des dates
  const formatDateDisplay = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const formatTimeDisplay = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm:ss', { locale: fr });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer les informations de l'entreprise
        const profile = await getProfileInfo();
        setProfileInfo(profile);
        
        // 2. Récupérer les informations du caissier
        const caissier = await getEmployeeById(caissierId);
        
        // 3. Récupérer les ventes
        const ventesData = await getVentesByDateRange(startDate, endDate);
        
        // 4. Récupérer les ventes par caissier
        const ventesParCaissierData = await getVentesByCaissierDateRange(startDate, endDate);
        
        // 5. Récupérer les tickets restaurant
        const ticketsData = await getTicketsByDateRange(startDate, endDate);
        
        // 6. Récupérer les tickets par fournisseur
        const ticketsFournisseurData = await getTicketFournisseurDateRange(startDate, endDate);
        
        // 7. Récupérer les commandes
        const commandesData = await getCommandesByUserDateRange(caissierId, startDate, endDate);
        
        // 8. Récupérer les retours
        const retoursData = await getRetoursByDateRange(startDate, endDate);
        
        // 9. Récupérer les achats
        const achatsData = await getTotalAchatForDate(startDate, endDate);
        
        // 10. Récupérer les ACC
        const accData = await getTotalAccMontantByDateRange(startDate, endDate);
        const accDetailsData = await getAccDetailsByDateRange(startDate, endDate);
        
        // 11. Récupérer les charges
        const chargesData = await getTotalChargesByDateRange(startDate, endDate);
        
        // 12. Récupérer l'ouverture de caisse
        const caisseOuverture = await getCaisseOuverture(caissierId, startDate);
        const fondCaisseInitial = await getFondCaisseInitial(caisseOuverture?.id);
        
        // 13. Récupérer tous les produits pour calculer les ventes par produit
        const produitsData = await getProducts();

        // Calculer les totaux
        const chiffreAffairesTotal = ventesData.reduce((sum, vente) => sum + (vente.total || 0), 0);
        const totalRemises = ventesData.reduce((sum, vente) => sum + (vente.remise || 0), 0);
        const totalRetours = retoursData.reduce((sum, retour) => sum + (retour.montant || 0), 0);
        const tvaCollecte = ventesData.reduce((sum, vente) => sum + (vente.tva || 0), 0);
        const nombreVentes = ventesData.length;
        
        // Calculer le bénéfice net
        const totalAchat = achatsData.total || 0;
        const totalCharge = chargesData.total || 0;
        const totalAcc = accData.total || 0;
        const totalNet = chiffreAffairesTotal - totalAchat - totalCharge - totalRemises - totalRetours;

        // Calculer les paiements par type
        const detailPaiements = ventesData.reduce((acc, vente) => {
          const type = vente.mode_paiement || 'Espèces';
          const amount = vente.total || 0;
          
          const existing = acc.find(p => p.PaymentType === type);
          if (existing) {
            existing.TotalAmount += amount;
          } else {
            acc.push({ PaymentType: type, TotalAmount: amount });
          }
          
          return acc;
        }, [] as Array<{ PaymentType: string; TotalAmount: number }>);

        // Calculer les ventes par produit
        const produitTotals = ventesData.reduce((acc, vente) => {
          vente.produits?.forEach(produit => {
            const existing = acc.find(p => p.NomProduit === produit.nom);
            if (existing) {
              existing.QuantiteTotale += produit.quantite || 0;
              existing.TotalVente += (produit.prix || 0) * (produit.quantite || 0);
            } else {
              acc.push({
                NomProduit: produit.nom,
                QuantiteTotale: produit.quantite || 0,
                TotalVente: (produit.prix || 0) * (produit.quantite || 0),
                TotalRetours: 0,
                TotalNet: (produit.prix || 0) * (produit.quantite || 0)
              });
            }
          });
          return acc;
        }, [] as Array<{
          NomProduit: string;
          QuantiteTotale: number;
          TotalVente: number;
          TotalRetours: number;
          TotalNet: number;
        }>);

        // Calculer les ventes par caissier
        const ventesParCaissier = await Promise.all(
          ventesParCaissierData.map(async (caissierVente) => {
            const caissierInfo = await getEmployeeById(caissierVente.caissier_id);
            return {
              nom: caissierInfo?.nom || 'Inconnu',
              nombreVentes: caissierVente.nombre_ventes || 0,
              montantTotal: caissierVente.montant_total || 0,
              totalRetours: caissierVente.total_retours || 0,
              paiements: {
                especes: caissierVente.especes || 0,
                carte: caissierVente.carte || 0,
                cheque: caissierVente.cheque || 0,
                ticketRestaurant: caissierVente.ticket_restaurant || 0
              },
              fondCaisse: caissierVente.fond_caisse || 0,
              totalRemises: caissierVente.total_remises || 0,
              totalNet: caissierVente.total_net || 0,
              totalEncaissements: caissierVente.total_encaissements || 0
            };
          })
        );

        // Préparer les données des commandes
        const commandesPayees = commandesData.filter(c => c.statut === 'payee');
        const commandesEnAttente = commandesData.filter(c => c.statut === 'en_attente');
        const commandesAnnulees = commandesData.filter(c => c.statut === 'annulee');

        const commandesStats = {
          commandesPayees: {
            nombre: commandesPayees.length,
            montant: commandesPayees.reduce((sum, c) => sum + (c.total || 0), 0)
          },
          commandesEnAttente: {
            nombre: commandesEnAttente.length,
            montant: commandesEnAttente.reduce((sum, c) => sum + (c.total || 0), 0)
          },
          commandesAnnulees: {
            nombre: commandesAnnulees.length,
            montant: commandesAnnulees.reduce((sum, c) => sum + (c.total || 0), 0)
          },
          montantTotalEncaissé: commandesPayees.reduce((sum, c) => sum + (c.total || 0), 0),
          montantTotalRemises: commandesData.reduce((sum, c) => sum + (c.remise || 0), 0)
        };

        // Préparer les données des retours
        const retoursDetails = {
          nombreRetours: retoursData.length,
          montantTotalRetourne: retoursData.reduce((sum, r) => sum + (r.montant || 0), 0),
          detailParProduit: retoursData.map(retour => ({
            nomProduit: retour.produit_nom || 'Inconnu',
            quantite: retour.quantite || 0,
            montant: retour.montant || 0
          })),
          retoursParCaissier: await Promise.all(
            retoursData.reduce((acc, retour) => {
              const existing = acc.find(r => r.nomCaissier === retour.caissier_nom);
              if (existing) {
                existing.nombreRetours++;
                existing.montantTotal += retour.montant || 0;
              } else {
                acc.push({
                  nomCaissier: retour.caissier_nom || 'Inconnu',
                  nombreRetours: 1,
                  montantTotal: retour.montant || 0
                });
              }
              return acc;
            }, [] as Array<{ nomCaissier: string; nombreRetours: number; montantTotal: number }>)
          )
        };

        // Calculer la trésorerie
        const totalEspecesEncaissées = ventesData
          .filter(v => v.mode_paiement === 'Espèces')
          .reduce((sum, v) => sum + (v.total || 0), 0);
        
        const totalEspecesSorties = 0; // À implémenter avec les dépenses
        const totalEspecesEntree = 0; // À implémenter avec les apports
        const totalEspecesFinalAttendu = fondCaisseInitial + totalEspecesEncaissées - totalEspecesSorties + totalEspecesEntree;

        // Générer un numéro de rapport unique
        const reportNumber = `RPT-${Date.now().toString(36).toUpperCase()}`;

        // Préparer les données finales
        const data = {
          profile: {
            Nom: profile?.nom_entreprise || 'Votre Entreprise',
            Adresse: profile?.adresse || 'Sfax, Tunisie',
            Telephone: profile?.telephone || 'XX XXX XXX'
          },
          caissier: caissier?.nom || 'Inconnu',
          reportNumber,
          dateOuverture: formatDateDisplay(startDate),
          heureOuverture: formatTimeDisplay(startDate),
          dateFermeture: formatDateDisplay(endDate),
          heureFermeture: formatTimeDisplay(endDate),
          dateGeneration: formatDateDisplay(new Date().toISOString()),
          heureGeneration: formatTimeDisplay(new Date().toISOString()),
          chiffreAffairesTotal,
          totalEncaissements: chiffreAffairesTotal,
          totalAchat,
          totalCharge,
          totalAcc,
          totalAccQuantite: accDetailsData.reduce((sum, acc) => sum + (acc.quantite || 0), 0),
          accDetails: accDetailsData.map(acc => ({
            codeBarre: acc.code_barre || '',
            designation: acc.designation || '',
            totalQuantite: acc.quantite || 0,
            montantTotal: acc.montant || 0,
            responsable: acc.responsable || ''
          })),
          totalRemises,
          totalRetours,
          totalNet,
          nombreVentes,
          tvaCollecte,
          detailPaiements,
          ticketRestaurantTotals: ticketsData.map(ticket => ({
            Type: ticket.type || 'Ticket Restaurant',
            NbTickets: ticket.nombre || 0,
            ValeurTicket: ticket.valeur || 0,
            TotalAmount: ticket.montant_total || 0
          })),
          ticketFournisseurDetails: ticketsFournisseurData.map(ticket => ({
            fournisseur: ticket.fournisseur || 'Inconnu',
            nbTickets: ticket.nombre_tickets || 0,
            valeurTicket: ticket.valeur_ticket || 0,
            totalAmount: ticket.montant_total || 0
          })),
          fondCaisseInitial: fondCaisseInitial || 0,
          totalEspecesEncaissées,
          totalEspecesSorties,
          totalEspecesEntree,
          totalEspecesFinalAttendu,
          produitTotals,
          ventesParCaissier,
          commandesStats,
          retoursDetails,
        };

        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors de la récupération des données du dashboard');
        setLoading(false);
      }
    };

    fetchAllData();
  }, [startDate, endDate, caissierId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Aucune donnée disponible</div>
      </div>
    );
  }

  return <RapportDashboardContent {...dashboardData} />;
};

export default DashboardDataFetcher;