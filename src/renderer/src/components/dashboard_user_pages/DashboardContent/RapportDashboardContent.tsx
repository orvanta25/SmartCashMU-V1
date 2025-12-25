"use client";
import React, { useState, useEffect } from 'react';
import { Printer, Download, Calendar, User, Store, CreditCard, BarChart3, Package, RefreshCw, Menu, X, Ticket, ShoppingCart, TrendingUp, Percent, Undo, AlertTriangle } from 'lucide-react';
import ClotureJourButton from '../impression/Zjour/ClotureJourButton';
import RapportCaissierButton from '../impression/xjour/RapportCaissierButton';

interface RapportDashboardContentProps {
  profile: {
    entrepriseDenomination: string;
    Adresse: string;
  };
  caissier: string;
  reportNumber: string;
  dateOuverture: string;
  heureOuverture: string;
  dateFermeture: string;
  heureFermeture: string;
  dateGeneration: string;
  heureGeneration: string;
  chiffreAffairesTotal: number;
  totalEncaissements: number;
  totalAchat: number; 
  totalCharge?: number;
  totalAcc?: number;
  totalAccQuantite?: number;
  accDetails?: Array<{
    codeBarre: string;
    designation: string;
    totalQuantite: number;
    montantTotal: number;
    responsable: string;
  }>;
  totalRemises: number;
  totalRetours: number;
  totalNet: number;
  nombreVentes: number;
  tvaCollecte: number; 
  detailPaiements: Array<{
    PaymentType: string;
    TotalAmount: number;
  }>;
  ticketRestaurantTotals: Array<{
    Type: string;
    NbTickets: number;
    ValeurTicket: number;
    TotalAmount: number;
  }>;
  ticketFournisseurDetails?: Array<{
    fournisseur: string;
    nbTickets: number;
    valeurTicket: number;
    totalAmount: number;
  }>;
  fondCaisseInitial: number;
  totalEspecesEncaissées: number;
  totalEspecesSorties: number;
  totalEspecesEntree: number;
  totalEspecesFinalAttendu: number;
  produitTotals: Array<{
    NomProduit: string;
    QuantiteTotale: number;
    TotalVente: number;
    TotalRetours: number;
    TotalNet: number;
  }>;
  ventesParCaissier: Array<{
    nom: string;
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
  }>;
  commandesStats: {
    commandesPayees: {
      nombre: number;
      montant: number;
    };
    commandesEnAttente: {
      nombre: number;
      montant: number;
    };
    commandesAnnulees: {
      nombre: number;
      montant: number;
    };
    montantTotalEncaissé: number;
    montantTotalRemises: number;
  };
  retoursDetails: {
    nombreRetours: number;
    montantTotalRetourne: number;
    detailParProduit: Array<{
      nomProduit: string;
      quantite: number;
      montant: number;
    }>;
    retoursParCaissier: Array<{
      nomCaissier: string;
      nombreRetours: number;
      montantTotal: number;
    }>;
  };
}

const RapportDashboardContent: React.FC<RapportDashboardContentProps> = ({
  profile,
  caissier,
  reportNumber,
  dateOuverture,
  heureOuverture,
  dateFermeture,
  heureFermeture,
  dateGeneration,
  heureGeneration,
  chiffreAffairesTotal,
  totalEncaissements,
  totalAchat,
  totalCharge,
  totalAcc,
  accDetails = [],
  totalRemises,
  totalRetours,
  totalNet,
  nombreVentes,
  tvaCollecte,
  detailPaiements,
  ticketRestaurantTotals,
  ticketFournisseurDetails,
  fondCaisseInitial,
  totalEspecesEncaissées,
  totalEspecesSorties,
  totalEspecesEntree,
  totalEspecesFinalAttendu,
  produitTotals,
  ventesParCaissier,
  commandesStats,
  retoursDetails,
}) => {

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showCompactTable, setShowCompactTable] = useState(false);
  const [activeSection, setActiveSection] = useState<'paiements' | 'fournisseurs'>('paiements');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setShowCompactTable(width < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fonction pour formater les nombres sans symbole de devise
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Fonction pour formater les nombres entiers (quantités)
  const formatInteger = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Votre logique d'export PDF
  };

  // Rendu des détails des fournisseurs de tickets (mobile)
  const renderMobileFournisseurTickets = () => {
    const dataToDisplay = ticketFournisseurDetails || ticketRestaurantTotals;
    
    if (!dataToDisplay || dataToDisplay.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun ticket restaurant utilisé</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {dataToDisplay.map((ticket, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-white">
                {ticket.Type || ticket.fournisseur}
              </span>
              <span className="text-blue-400 font-bold">
                {formatNumber(ticket.TotalAmount || ticket.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatInteger(ticket.NbTickets || ticket.nbTickets)} tickets</span>
              <span>{formatNumber(ticket.ValeurTicket || ticket.valeurTicket)}/ticket</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rendu des détails des fournisseurs de tickets (desktop)
  const renderDesktopFournisseurTickets = () => {
    const dataToDisplay = ticketFournisseurDetails || ticketRestaurantTotals;
    
    if (!dataToDisplay || dataToDisplay.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">Aucun ticket restaurant utilisé</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full bg-gray-900 table-auto">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-4 px-4 text-left text-white font-semibold text-sm border-r border-gray-700">Fournisseur</th>
              <th className="py-4 px-4 text-right text-white font-semibold text-sm border-r border-gray-700">Nb. Tickets</th>
              <th className="py-4 px-4 text-right text-white font-semibold text-sm">Montant total</th>
            </tr>
          </thead>
          <tbody>
            {dataToDisplay.map((ticket, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                <td className="py-4 px-4 text-white border-r border-gray-700">{ticket.Type || ticket.fournisseur}</td>
                <td className="py-4 px-4 text-right text-white border-r border-gray-700">{formatInteger(ticket.NbTickets || ticket.nbTickets)}</td>
                <td className="py-4 px-4 text-right text-blue-400 font-semibold">{formatNumber(ticket.TotalAmount || ticket.totalAmount)}</td>
              </tr>
            ))}
            {/* Total */}
            {dataToDisplay.length > 1 && (
              <tr className="bg-gray-800 border-t border-gray-700 font-bold">
                <td className="py-4 px-4 text-white border-r border-gray-700">TOTAL</td>
                <td className="py-4 px-4 text-right text-white border-r border-gray-700">
                  {formatInteger(dataToDisplay.reduce((sum, t) => sum + (t.NbTickets || t.nbTickets || 0), 0))}
                </td>
                <td className="py-4 px-4 text-right text-blue-400 font-semibold">
                  {formatNumber(dataToDisplay.reduce((sum, t) => sum + (t.TotalAmount || t.totalAmount || 0), 0))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Version mobile/tablette pour le tableau des caissiers (cartes)
  const renderMobileCaissierTable = () => {
    return (
      <div className="space-y-4">
        {ventesParCaissier.map((caissierData, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 touch-manipulation">
            <div className="mb-3 pb-3 border-b border-gray-700">
              <h4 className="font-bold text-white text-lg">{caissierData.nom}</h4>
              <div className="flex justify-between mt-2">
                <span className="text-gray-400 text-sm">{caissierData.nombreVentes} ventes</span>
                <span className="text-white font-bold">{formatNumber(caissierData.montantTotal)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Espèces</p>
                <p className="text-white text-sm">{formatNumber(caissierData.paiements?.especes || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">TPE</p>
                <p className="text-white text-sm">{formatNumber(caissierData.paiements?.carte || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Chèque</p>
                <p className="text-white text-sm">{formatNumber(caissierData.paiements?.cheque || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Ticket</p>
                <p className="text-white text-sm">{formatNumber(caissierData.paiements?.ticketRestaurant || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Fond</p>
                <p className="text-white text-sm">{formatNumber(caissierData.fondCaisse || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Remises</p>
                <p className="text-yellow-400 text-sm">{formatNumber(caissierData.totalRemises || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Retours</p>
                <p className="text-red-400 text-sm">-{formatNumber(caissierData.totalRetours || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Net</p>
                <p className="text-green-400 text-sm font-bold">{formatNumber(caissierData.totalNet || 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

// Version desktop pour le tableau des caissiers
const renderDesktopCaissierTable = () => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full bg-gray-900 table-auto">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-4 px-3 text-left text-white font-semibold text-sm border-r border-gray-700">Caissier</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Ventes</th>
            {/* COLONNE TOTAL SUPPRIMÉE ICI */}
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Espèces</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">TPE</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Chèque</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Ticket</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Fond</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Remises</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Retours</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm border-r border-gray-700">Net</th>
            <th className="py-4 px-3 text-center text-white font-semibold text-sm">Encaissements</th>
          </tr>
        </thead>
        <tbody>
          {ventesParCaissier.map((caissierData, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
              <td className="py-4 px-3 text-white font-medium border-r border-gray-700">{caissierData.nom}</td>
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{caissierData.nombreVentes}</td>
              
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{formatNumber(caissierData.paiements?.especes || 0)}</td>
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{formatNumber(caissierData.paiements?.carte || 0)}</td>
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{formatNumber(caissierData.paiements?.cheque || 0)}</td>
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{formatNumber(caissierData.paiements?.ticketRestaurant || 0)}</td>
              <td className="py-4 px-3 text-center text-white border-r border-gray-700">{formatNumber(caissierData.fondCaisse || 0)}</td>
              <td className="py-4 px-3 text-center text-yellow-400 border-r border-gray-700">{formatNumber(caissierData.totalRemises || 0)}</td>
              <td className="py-4 px-3 text-center text-red-400 border-r border-gray-700">-{formatNumber(caissierData.totalRetours || 0)}</td>
              <td className="py-4 px-3 text-center text-green-400 font-semibold border-r border-gray-700">{formatNumber(caissierData.totalNet || 0)}</td>
              <td className="py-4 px-3 text-center text-blue-400 font-semibold">{formatNumber(caissierData.totalEncaissements || 0)}</td>
            </tr>
          ))}
          {/* Total général - CORRECTION: 11 colonnes au lieu de 12 */}
          <tr className="bg-gray-800 border-t border-gray-700 font-bold">
            <td className="py-4 px-3 text-white border-r border-gray-700">TOTAL</td>
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {ventesParCaissier.reduce((sum, c) => sum + c.nombreVentes, 0)}
            </td>
            
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.paiements?.especes || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.paiements?.carte || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.paiements?.cheque || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.paiements?.ticketRestaurant || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-white border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.fondCaisse || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-yellow-400 border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.totalRemises || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-red-400 border-r border-gray-700">
              -{formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.totalRetours || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-green-400 border-r border-gray-700">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.totalNet || 0), 0))}
            </td>
            <td className="py-4 px-3 text-center text-blue-400">
              {formatNumber(ventesParCaissier.reduce((sum, c) => sum + (c.totalEncaissements || 0), 0))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
  // Version mobile/tablette pour les ventes par produit (cartes)
  const renderMobileProduitTable = () => {
    if (!produitTotals || produitTotals.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucune donnée de vente par produit disponible</p>
          <p className="text-gray-500 text-xs mt-2">
            Total des ventes: {formatNumber(chiffreAffairesTotal)}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide space-y-3">
          {produitTotals.map((produit, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 touch-manipulation hover:bg-gray-700/30 transition-colors duration-150"
            >
              <h4 className="font-bold text-white text-base mb-3">{produit.NomProduit}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Quantité</p>
                  <p className="text-white text-sm">{formatInteger(produit.QuantiteTotale)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Ventes</p>
                  <p className="text-white text-sm">{formatNumber(produit.TotalVente)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Retours</p>
                  <p className="text-red-400 text-sm">-{formatNumber(produit.TotalRetours)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Net</p>
                  <p className="text-green-400 text-sm font-bold">{formatNumber(produit.TotalNet)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicateur de scroll pour mobile */}
        {produitTotals.length > 5 && (
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">
              {produitTotals.length} produits au total - Faites défiler pour voir tous
            </p>
          </div>
        )}
      </div>
    );
  };

  // Version desktop pour les ventes par produit
  const renderDesktopProduitTable = () => {
    if (!produitTotals || produitTotals.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">Aucune donnée de vente par produit disponible</p>
          <p className="text-gray-500 text-sm mt-2">
            Total des ventes: {formatNumber(chiffreAffairesTotal)}
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          <table className="w-full bg-gray-900 table-auto">
            <thead>
              <tr className="bg-gray-800 sticky top-0 z-10">
                <th className="py-4 px-4 text-left text-white font-semibold text-sm border-r border-gray-700">Produit</th>
                <th className="py-4 px-4 text-right text-white font-semibold text-sm border-r border-gray-700">Quantité</th>
                <th className="py-4 px-4 text-right text-white font-semibold text-sm border-r border-gray-700">Ventes</th>
                <th className="py-4 px-4 text-right text-white font-semibold text-sm border-r border-gray-700">Retours</th>
                <th className="py-4 px-4 text-right text-white font-semibold text-sm">Net</th>
              </tr>
            </thead>
            <tbody>
              {produitTotals.map((produit, index) => (
                <tr 
                  key={index} 
                  className={`
                    ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}
                    hover:bg-gray-700/30 transition-colors duration-150
                  `}
                >
                  <td className="py-4 px-4 text-white border-r border-gray-700">{produit.NomProduit}</td>
                  <td className="py-4 px-4 text-right text-white border-r border-gray-700">{formatInteger(produit.QuantiteTotale)}</td>
                  <td className="py-4 px-4 text-right text-white border-r border-gray-700">{formatNumber(produit.TotalVente)}</td>
                  <td className="py-4 px-4 text-right text-red-400 border-r border-gray-700">-{formatNumber(produit.TotalRetours)}</td>
                  <td className="py-4 px-4 text-right text-green-400 font-semibold">{formatNumber(produit.TotalNet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Indicateur de scroll si plus de 10 lignes */}
        {produitTotals.length > 10 && (
          <div className="bg-gray-800/50 py-2 px-4 text-center border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              {produitTotals.length - 10} ligne(s) supplémentaire(s) - Faites défiler pour voir plus
            </p>
          </div>
        )}
      </div>
    );
  };

  // Version mobile/tablette pour les retours par produit (cartes)
  const renderMobileRetourProduit = () => {
    if (!retoursDetails?.detailParProduit || retoursDetails.detailParProduit.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Undo className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun retour disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {retoursDetails.detailParProduit.map((produit, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 touch-manipulation">
            <h4 className="font-bold text-white text-base mb-3">{produit.nomProduit}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Quantité</p>
                <p className="text-white text-sm">{formatInteger(produit.quantite)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Montant</p>
                <p className="text-red-400 text-sm font-bold">-{formatNumber(produit.montant)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Version desktop pour les retours par produit
  const renderDesktopRetourProduit = () => {
    if (!retoursDetails?.detailParProduit || retoursDetails.detailParProduit.length === 0) {
      return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
          <Undo className="w-16 h-16 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">Aucun retour disponible</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full bg-gray-900 table-auto">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-4 px-4 text-left text-white font-semibold text-sm border-r border-gray-700">Produit</th>
              <th className="py-4 px-4 text-right text-white font-semibold text-sm border-r border-gray-700">Quantité</th>
              <th className="py-4 px-4 text-right text-white font-semibold text-sm">Montant</th>
            </tr>
          </thead>
          <tbody>
            {retoursDetails.detailParProduit.map((produit, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                <td className="py-4 px-4 text-white border-r border-gray-700">{produit.nomProduit}</td>
                <td className="py-4 px-4 text-right text-white border-r border-gray-700">{formatInteger(produit.quantite)}</td>
                <td className="py-4 px-4 text-right text-red-400 font-semibold">-{formatNumber(produit.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orvanta p-3 sm:p-4 md:p-6 touch-manipulation select-none">
      <div className="w-full mx-auto max-w-7xl">
        {/* En-tête responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-orbitron break-words">Tableau de Bord</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Rapport détaillé des activités commerciales</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Bouton Clôture du jour - COMPOSANT EXTERNE */}
            <ClotureJourButton className="flex-1 sm:flex-none" />
            
            {/* Bouton Aperçu par caissier - COMPOSANT EXTERNE */}
            <RapportCaissierButton className="flex-1 sm:flex-none" />
          </div>
        </div>
        
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 mb-6">
          {/* Section identité responsive */}
          <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Store className="text-blue-400" size={20} />
              <h2 className="text-xl sm:text-2xl font-semibold text-white font-orbitron">Identité du Rapport</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-3 sm:p-4 rounded-xl border border-blue-800/30 touch-manipulation">
                <div className="flex items-center gap-2 mb-2">
                  <Store size={16} className="text-blue-400" />
                  <span className="font-medium text-gray-300 text-sm sm:text-base">Commerce</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white break-words">
                 {profile.entreprise?.denomination || profile.entrepriseDenomination}
                </p>

                <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">{profile.Adresse}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 p-3 sm:p-4 rounded-xl border border-purple-800/30 touch-manipulation">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-purple-400" />
                  <span className="font-medium text-gray-300 text-sm sm:text-base">Caissier</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white break-words">{caissier}</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">N° Rapport: {reportNumber}</p>
              </div>

              <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 p-3 sm:p-4 rounded-xl border border-green-800/30 touch-manipulation">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-green-400" />
                  <span className="font-medium text-gray-300 text-sm sm:text-base">Période</span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-white">Ouverture:</span><br/>
                    {dateOuverture} {heureOuverture}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold text-white">Fermeture:</span><br/>
                    {dateFermeture} {heureFermeture}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Généré le: {dateGeneration} {heureGeneration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section synthèse responsive */}
          <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <BarChart3 className="text-green-400" size={20} />
              <h2 className="text-xl sm:text-2xl font-semibold text-white font-orbitron">Synthèse du Jour</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Première ligne : Total Achat, Total Charge, Total Remise, Total Retour */}
              <StatCard
                title="Total Achat"
                value={formatNumber(totalAchat)}
                icon={<ShoppingCart size={16} />}
                trend="neutral"
                color="blue"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="Total Charge"
                value={formatNumber(totalCharge || 0)}
                icon={<CreditCard size={16} />}
                trend="up"
                color="red"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="Total Remise"
                value={formatNumber(totalRemises)}
                icon={<Percent size={16} />}
                trend="down"
                color="yellow"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="Total Retour"
                value={formatNumber(totalRetours)}
                icon={<Undo size={16} />}
                trend="down"
                color="red"
                mobile={isMobile || isTablet}
              />

              {/* Deuxième ligne : Chiffre d'affaire, Bénéfices Net, Nombre de vente, TVA Collecté */}
              <StatCard
                title="Chiffre d'Affaires"
                value={formatNumber(chiffreAffairesTotal)}
                icon={<TrendingUp size={16} />}
                trend="up"
                color="green"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="Bénéfices Net"
                value={formatNumber(totalNet)}
                icon={<BarChart3 size={16} />}
                trend="up"
                color="green"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="Total ACC"
                value={formatNumber(totalAcc || 0)}
                icon={<User size={16} />}
                trend="neutral"
                color="orange"
                mobile={isMobile || isTablet}
              />
              <StatCard
                title="TVA Collecté"
                value={formatNumber(tvaCollecte)}
                icon={<CreditCard size={16} />}
                trend="neutral"
                color="orange"
                mobile={isMobile || isTablet}
              />
            </div>
          </div>

          {/* TABLEAU DES CAISSIERS RESPONSIVE */}
          <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <User className="text-purple-400" size={20} />
                <h2 className="text-xl sm:text-2xl font-semibold text-white font-orbitron">Détail par Caissier</h2>
              </div>
              <button
                onClick={() => setShowCompactTable(!showCompactTable)}
                className="md:hidden px-3 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm touch-manipulation"
              >
                {showCompactTable ? 'Tableau' : 'Cartes'}
              </button>
            </div>
            
            <div className="hidden md:block">
              {renderDesktopCaissierTable()}
            </div>
            
            <div className="md:hidden">
              {showCompactTable ? renderDesktopCaissierTable() : renderMobileCaissierTable()}
            </div>
          </div>

          {/* SECTION TICKETS RESTAURANT */}
          <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <Ticket className="text-yellow-400" size={20} />
                <h2 className="text-xl sm:text-2xl font-semibold text-white font-orbitron">Tickets Restaurant</h2>
              </div>
              
              {/* Toggle pour mobile/tablette */}
              <div className="flex gap-2 md:hidden">
                <button
                  onClick={() => setActiveSection('paiements')}
                  className={`px-3 py-2 rounded-lg text-sm touch-manipulation ${
                    activeSection === 'paiements'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Paiements
                </button>
                <button
                  onClick={() => setActiveSection('fournisseurs')}
                  className={`px-3 py-2 rounded-lg text-sm touch-manipulation ${
                    activeSection === 'fournisseurs'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Fournisseurs
                </button>
              </div>
            </div>
            
            {/* Desktop: Afficher les deux sections côte à côte */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {/* Section Moyens de Paiement */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 touch-manipulation">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <CreditCard className="text-blue-400" size={18} />
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Moyens de Paiement</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {detailPaiements.map((paiement, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <span className="font-medium text-gray-300 text-sm sm:text-base">{paiement.PaymentType}</span>
                      <span className="font-bold text-white text-sm sm:text-base">{formatNumber(paiement.TotalAmount)}</span>
                    </div>
                  ))}
                  
                  {/* Total Tickets Restaurant */}
                  {ticketRestaurantTotals.length > 0 && (
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <span className="font-medium text-gray-300 text-sm sm:text-base">Total Tickets Restaurant</span>
                      <span className="font-bold text-yellow-400 text-sm sm:text-base">
                        {formatNumber(ticketRestaurantTotals.reduce((sum, t) => sum + t.TotalAmount, 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Fournisseurs de Tickets */}
              <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 p-4 sm:p-6 rounded-xl border border-yellow-800/30 touch-manipulation">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <Ticket className="text-yellow-400" size={18} />
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Détail par Fournisseur</h3>
                </div>
                
                {renderDesktopFournisseurTickets()}
              </div>
            </div>
            
            {/* Mobile/Tablette: Afficher une section à la fois */}
            <div className="md:hidden">
              {activeSection === 'paiements' ? (
                <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 touch-manipulation mb-4">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <CreditCard className="text-blue-400" size={18} />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Moyens de Paiement</h3>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {detailPaiements.map((paiement, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="font-medium text-gray-300 text-sm sm:text-base">{paiement.PaymentType}</span>
                        <span className="font-bold text-white text-sm sm:text-base">{formatNumber(paiement.TotalAmount)}</span>
                      </div>
                    ))}
                    
                    {/* Total Tickets Restaurant */}
                    {ticketRestaurantTotals.length > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="font-medium text-gray-300 text-sm sm:text-base">Total Tickets Restaurant</span>
                        <span className="font-bold text-yellow-400 text-sm sm:text-base">
                          {formatNumber(ticketRestaurantTotals.reduce((sum, t) => sum + t.TotalAmount, 0))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 p-4 sm:p-6 rounded-xl border border-yellow-800/30 touch-manipulation">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Ticket className="text-yellow-400" size={18} />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Détail par Fournisseur</h3>
                  </div>
                  
                  {renderMobileFournisseurTickets()}
                </div>
              )}
            </div>
          </div>

          {/* Sections grid responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Trésorerie */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-4 sm:p-6 rounded-xl border border-blue-800/30 touch-manipulation">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <CreditCard className="text-blue-400" size={18} />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Trésorerie</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm sm:text-base">Fond de caisse initial</span>
                  <span className="font-bold text-white text-sm sm:text-base">{formatNumber(fondCaisseInitial)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm sm:text-base">Espèces encaissées</span>
                  <span className="font-bold text-green-400 text-sm sm:text-base">+{formatNumber(totalEspecesEncaissées)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm sm:text-base">Espèces sorties</span>
                  <span className="font-bold text-red-400 text-sm sm:text-base">-{formatNumber(totalEspecesSorties)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm sm:text-base">Espèces entrée</span>
                  <span className="font-bold text-green-400 text-sm sm:text-base">+{formatNumber(totalEspecesEntree)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="font-semibold text-gray-300 text-sm sm:text-base">Total espèces final attendu</span>
                  <span className="font-bold text-lg text-blue-400 text-sm sm:text-base">
                    {formatNumber(totalEspecesFinalAttendu)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Synthèse des commandes */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 p-4 sm:p-6 rounded-xl border border-indigo-800/30 touch-manipulation">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Package className="text-indigo-400" size={18} />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Synthèse des Commandes</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white text-sm sm:text-base">Commandes payées</span>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {formatInteger(commandesStats.commandesPayees.nombre)} commandes
                      </p>
                    </div>
                    <span className="font-bold text-green-400 text-sm sm:text-base">
                      {formatNumber(commandesStats.commandesPayees.montant)}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white text-sm sm:text-base">Commandes en attente</span>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {formatInteger(commandesStats.commandesEnAttente.nombre)} commandes
                      </p>
                    </div>
                    <span className="font-bold text-yellow-400 text-sm sm:text-base">
                      {formatNumber(commandesStats.commandesEnAttente.montant)}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white text-sm sm:text-base">Commandes annulées</span>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {formatInteger(commandesStats.commandesAnnulees.nombre)} commandes
                      </p>
                    </div>
                    <span className="font-bold text-red-400 text-sm sm:text-base">
                      {formatNumber(commandesStats.commandesAnnulees.montant)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ventes par produit */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Package className="text-purple-400" size={18} />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Ventes par Produit</h3>
              </div>
              
              <div className="hidden md:block">
                {renderDesktopProduitTable()}
              </div>
              <div className="md:hidden">
                {showCompactTable ? renderDesktopProduitTable() : renderMobileProduitTable()}
              </div>
            </div>

            {/* Retours par produit */}
            <div className="lg:col-span-2 bg-gradient-to-br from-red-900/20 to-red-800/10 p-4 sm:p-6 rounded-xl border border-red-800/30">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Undo className="text-red-400" size={18} />
                <h3 className="text-lg sm:text-xl font-semibold text-white">Retours par Produit</h3>
              </div>
              
              <div className="hidden md:block">
                {renderDesktopRetourProduit()}
              </div>
              <div className="md:hidden">
                {renderMobileRetourProduit()}
              </div>
            </div>

          </div>

          {/* Résumé final */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700">
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-4 sm:p-6 rounded-2xl border border-blue-800/30 touch-manipulation">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white font-orbitron">Résumé Final de la Journée</h4>
                  <p className="text-gray-300 mt-1 text-sm sm:text-base">
                    Rapport Z généré avec succès. Toutes les transactions ont été comptabilisées.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-center md:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-blue-400 font-orbitron">{formatNumber(totalNet)}</div>
                  <p className="text-sm text-gray-400">Total net de la journée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: string;
  mobile?: boolean;
}> = ({ title, value, icon, trend, color, mobile = false }) => {
  const colorClasses = {
    green: 'bg-green-900/30 text-green-400 border-green-800/50',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    red: 'bg-red-900/30 text-red-400 border-red-800/50',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
  };

  return (
    <div className="bg-gray-900/50 p-3 sm:p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 touch-manipulation">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <h4 className="text-xs sm:text-sm font-medium text-gray-400">
            {mobile ? title.split(' ').slice(0, 2).join(' ') : title}
          </h4>
        </div>
        {trend !== 'neutral' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className={`font-bold text-white ${mobile ? 'text-sm' : 'text-base sm:text-xl'}`}>{value}</span>
      </div>
    </div>
  );
};

export default RapportDashboardContent;