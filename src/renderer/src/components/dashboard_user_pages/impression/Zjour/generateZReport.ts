// renderer/src/components/dashboard_user_pages/impression/zjour/generateZReport.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { printTicket } from '../../../../api/printer';
import { DashboardData } from './useZReportData'; 

// [Toutes les interfaces existantes restent inchangées]
export interface ProduitTotal {
  NomProduit: string;
  QuantiteTotale: number;
  TotalVente: number;
  TotalRetours: number;
  TotalNet: number;
}

export interface TicketFournisseurDetail {
  fournisseur: string;
  nbTickets: number;
  valeurTicket: number;
  totalAmount: number;
}

export interface VenteCaissier {
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
}

export interface RetourDetail {
  nomProduit: string;
  quantite: number;
  montant: number;
}

export interface RetourCaissier {
  nomCaissier: string;
  nombreRetours: number;
  montantTotal: number;
}

export interface CommandesStats {
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
}

export interface RetoursDetails {
  nombreRetours: number;
  montantTotalRetourne: number;
  detailParProduit: RetourDetail[];
  retoursParCaissier: RetourCaissier[];
}

export interface ZReportProps {
  // Informations de base
  profile: {
    entrepriseDenomination: string;
    Adresse: string;
    Telephone?: string;
  };
  caissier: string;
  reportNumber: string;
  dateDebut: string;
  heureDebut: string;
  dateFin: string;
  heureFin: string;
  dateGeneration?: string;
  heureGeneration?: string;
  
  // Synthèse financière
  chiffreAffairesTotal: number;
  totalAchat: number;
  totalCharge?: number;
  totalAcc?: number;
  totalRemises: number;
  totalRetours: number;
  totalNet: number;
  nombreVentes: number;
  tvaCollecte: number;
  totalEncaissements?: number;
  
  // Paiements
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
  ticketFournisseurDetails?: TicketFournisseurDetail[];
  
  // Trésorerie
  fondCaisseInitial: number;
  totalEspecesEncaissées: number;
  totalEspecesSorties: number;
  totalEspecesEntree: number;
  totalEspecesFinalAttendu: number;
  
  // Ventes par produit
  produitTotals: ProduitTotal[];
  
  // Ventes par caissier
  ventesParCaissier: VenteCaissier[];
  
  // Commandes
  commandesStats: CommandesStats;
  
  // Retours
  retoursDetails: RetoursDetails;
}

// ============================================
// FONCTIONS UTILITAIRES (inchangées)
// ============================================
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Number(value) || 0;
};

const safeArray = <T>(array: T[] | undefined | null): T[] => {
  return array || [];
};

const formatMontant = (montant: any): string => {
  const m = safeNumber(montant);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m);
};

const formatMontant3Decimals = (montant: any): string => {
  const m = safeNumber(montant);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(m);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatHeure = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// ============================================
// FONCTIONS DE CONVERSION DES DONNÉES (inchangée)
// ============================================
export const convertDashboardDataToZReportProps = (dashboardData: DashboardData): ZReportProps => {
  // [Le code de conversion reste exactement le même]
  const produitTotals: ProduitTotal[] = dashboardData.produitVentes?.map(pv => ({
    NomProduit: pv.NomProduit,
    QuantiteTotale: safeNumber(pv.QuantiteVendue),
    TotalVente: safeNumber(pv.MontantVente),
    TotalRetours: safeNumber(pv.MontantRetour),
    TotalNet: safeNumber(pv.MontantNet)
  })) || [];

  const ventesParCaissier: VenteCaissier[] = dashboardData.caissiersDetails?.map(c => ({
    nom: c.nom,
    nombreVentes: safeNumber(c.nombreVentes),
    montantTotal: safeNumber(c.montantTotal),
    totalRetours: safeNumber(c.totalRetours),
    paiements: {
      especes: safeNumber(c.paiements?.especes || 0),
      carte: safeNumber(c.paiements?.carte || 0),
      cheque: safeNumber(c.paiements?.cheque || 0),
      ticketRestaurant: safeNumber(c.paiements?.ticketRestaurant || 0)
    },
    fondCaisse: safeNumber(c.fondCaisse || 0),
    totalRemises: safeNumber(c.totalRemises || 0),
    totalNet: safeNumber(c.totalNet || 0),
    totalEncaissements: safeNumber(c.totalEncaissements || 0)
  })) || [];

  const retoursDetails: RetoursDetails = {
    nombreRetours: dashboardData.retoursDetails?.nombreRetours || 0,
    montantTotalRetourne: safeNumber(dashboardData.totalRetour),
    detailParProduit: dashboardData.produitRetours?.map(pr => ({
      nomProduit: pr.Produit,
      quantite: safeNumber(pr.Quantite),
      montant: safeNumber(pr.Montant)
    })) || [],
    retoursParCaissier: dashboardData.caissiersDetails?.map(c => ({
      nomCaissier: c.nom,
      nombreRetours: 0,
      montantTotal: safeNumber(c.totalRetours || 0)
    })) || []
  };

  const ticketFournisseurDetails: TicketFournisseurDetail[] = dashboardData.ticketRestaurantTotals?.map(t => ({
    fournisseur: t.Type,
    nbTickets: safeNumber(t.NbTickets),
    valeurTicket: safeNumber(t.ValeurTicket),
    totalAmount: safeNumber(t.TotalAmount)
  })) || [];

  const commandesStats: CommandesStats = {
    commandesPayees: {
      nombre: safeNumber(dashboardData.commandesStats?.commandesPayees?.nombre || 0),
      montant: safeNumber(dashboardData.commandesStats?.commandesPayees?.montant || 0)
    },
    commandesEnAttente: {
      nombre: safeNumber(dashboardData.commandesStats?.commandesEnAttente?.nombre || 0),
      montant: safeNumber(dashboardData.commandesStats?.commandesEnAttente?.montant || 0)
    },
    commandesAnnulees: {
      nombre: safeNumber(dashboardData.commandesStats?.commandesAnnulees?.nombre || 0),
      montant: safeNumber(dashboardData.commandesStats?.commandesAnnulees?.montant || 0)
    },
    montantTotalEncaissé: safeNumber(dashboardData.totalEncaissements || 0),
    montantTotalRemises: safeNumber(dashboardData.totalRemise || 0)
  };

  return {
    profile: {
      entrepriseDenomination: dashboardData.profile?.entrepriseDenomination || 'Votre Entreprise',
      Adresse: dashboardData.profile?.Adresse || '',
      Telephone: dashboardData.profile?.Telephone
    },
    caissier: dashboardData.caissier || '',
    reportNumber: dashboardData.reportNumber || `Z-${Date.now().toString(36).toUpperCase()}`,
    dateDebut: dashboardData.dateDebut || formatDate(new Date()),
    heureDebut: dashboardData.heureDebut || '00:00',
    dateFin: dashboardData.dateFin || formatDate(new Date()),
    heureFin: dashboardData.heureFin || '23:59',
    dateGeneration: dashboardData.dateGeneration || formatDate(new Date()),
    heureGeneration: dashboardData.heureGeneration || formatHeure(new Date()),
    
    chiffreAffairesTotal: safeNumber(dashboardData.chiffreAffaire || dashboardData.chiffreAffairesTotal || 0),
    totalAchat: safeNumber(dashboardData.totalAchat || 0),
    totalCharge: safeNumber(dashboardData.totalCharge || 0),
    totalAcc: safeNumber(dashboardData.totalAcc || 0),
    totalRemises: safeNumber(dashboardData.totalRemise || 0),
    totalRetours: safeNumber(dashboardData.totalRetour || 0),
    totalNet: safeNumber(dashboardData.beneficeNet || dashboardData.totalNet || 0),
    nombreVentes: safeNumber(dashboardData.nombreVentes || 0),
    tvaCollecte: safeNumber(dashboardData.tvaCollecte || 0),
    totalEncaissements: safeNumber(dashboardData.totalEncaissements || 0),
    
    detailPaiements: Object.values(
  (dashboardData.paiementsDetails || []).reduce((acc, p) => {
    const type = p.PaymentType.toLowerCase();

    let key: string;
    if (type.includes('espece')) key = 'espèces';
    else if (type.includes('carte') || type.includes('tpe')) key = 'tpe';
    else if (type.includes('cheque')) key = 'chèque';
    else if (type.includes('ticket')) key = 'ticket restaurant';
    else key = p.PaymentType;

    if (!acc[key]) {
      acc[key] = {
        PaymentType: key,
        TotalAmount: safeNumber(p.TotalAmount),
      };
    } else {
      acc[key].TotalAmount += safeNumber(p.TotalAmount);
    }

    return acc;
  }, {} as Record<string, { PaymentType: string; TotalAmount: number }>)
),

    ticketRestaurantTotals: dashboardData.ticketRestaurantTotals?.map(t => ({
      Type: t.Type,
      NbTickets: safeNumber(t.NbTickets),
      ValeurTicket: safeNumber(t.ValeurTicket),
      TotalAmount: safeNumber(t.TotalAmount)
    })) || [],
    ticketFournisseurDetails,
    
    fondCaisseInitial: safeNumber(dashboardData.tresorerie?.fondCaisseInitial || 0),
    totalEspecesEncaissées: safeNumber(dashboardData.tresorerie?.especeEncaissé || 0),
    totalEspecesSorties: safeNumber(dashboardData.tresorerie?.especeSorties || 0),
    totalEspecesEntree: safeNumber(dashboardData.tresorerie?.especeEntrees || 0),
    totalEspecesFinalAttendu: safeNumber(dashboardData.tresorerie?.totalEspeceAttendu || 0),
    
    produitTotals,
    
    ventesParCaissier,
    
    commandesStats,
    
    retoursDetails
  };
};

// ============================================
// GÉNÉRATION PDF 80mm (TICKET) - AVEC TABLEAU VERTICAL
// ============================================
export const generateZReportPDF80mm = (options: ZReportProps): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297],
  });

  const tableStyles = {
    fontSize: 6,
    font: "helvetica",
    cellPadding: 0.5,
    lineColor: [0, 0, 0],
    lineWidth: 0.1,
    overflow: 'linebreak' as const,
    halign: 'center' as const,
    valign: 'middle' as const,
  };

  const headerStyles = {
    fillColor: [0, 0, 0],
    textColor: [255, 255, 255],
    fontStyle: 'bold' as const,
    halign: 'center' as const,
    fontSize: 7,
    lineWidth: 0.1,
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 4;

  // ========== EN-TÊTE SIMPLIFIÉ ==========
  const etablissement = options.profile.entrepriseDenomination?.trim() || "VOTRE ENTREPRISE";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(etablissement.toUpperCase(), pageWidth / 2, yPosition, { align: "center" as const});
  yPosition += 2.5;
  
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  
  // Extraire la ville de l'adresse (première ligne)
  const adresseLignes = options.profile.Adresse.split(',');
  const ville = adresseLignes[adresseLignes.length - 1]?.trim() || options.profile.Adresse;
  
  doc.text(ville + " - RAPPORT Z", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 2.5;
  
  doc.setFont("helvetica", "bold");
  doc.text(`N°: ${options.reportNumber}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 2.5;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(`Début: ${options.dateDebut} ${options.heureDebut.split(':')[0]}h`, 5, yPosition);
  doc.text(`Fin: ${options.dateFin} ${options.heureFin.split(':')[0]}h`, pageWidth - 5, yPosition, { align: "right" });
  yPosition += 2.5;
  
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 2;

  // ========== ACTIVITÉ COMMERCIALE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ACTIVITÉ COMMERCIALE", 5, yPosition);
  yPosition += 2;
  
  const activiteData = [
    ['Ventes', safeNumber(options.nombreVentes).toString()],
    ['CA brut', formatMontant(options.chiffreAffairesTotal)],
    ['Remises', formatMontant(-options.totalRemises)],
    ['Retours', formatMontant(-options.totalRetours)],
    ['CA NET', formatMontant(options.totalNet)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: activiteData,
    styles: tableStyles,
    columnStyles: {
      0: { cellWidth: 35, halign: "left", fontStyle: "normal" },
      1: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 5, right: 5 },
    theme: 'grid',
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 2;

  // ========== ENCAISSEMENTS ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ENCAISSEMENTS", 5, yPosition);
  yPosition += 2;
  
  // Calculer les totaux par moyen de paiement
  const paiements = options.detailPaiements.reduce((acc, p) => {
    const type = p.PaymentType.toLowerCase();
    if (type.includes('espèces') || type.includes('espece')) acc.especes += p.TotalAmount;
    if (type.includes('carte') || type.includes('tpe')) acc.carte += p.TotalAmount;
    if (type.includes('chèque') || type.includes('cheque')) acc.cheque += p.TotalAmount;
    if (type.includes('ticket')) acc.ticketRestaurant += p.TotalAmount;
    return acc;
  }, { especes: 0, carte: 0, cheque: 0, ticketRestaurant: 0 });
  
  // Ajouter les tickets restaurant s'ils sont séparés
  options.ticketRestaurantTotals?.forEach(t => {
    paiements.ticketRestaurant += t.TotalAmount;
  });
  
  const totalEncaissement = paiements.especes + paiements.carte + paiements.cheque + paiements.ticketRestaurant;
  
  const paiementsData = [
    ['Espèces', formatMontant(paiements.especes)],
    ['TPE', formatMontant(paiements.carte)],
    ['Chèque', formatMontant(paiements.cheque)],
    ['Ticket', formatMontant(paiements.ticketRestaurant)],
    ['', ''],
    ['TOTAL', formatMontant(totalEncaissement)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: paiementsData,
    styles: tableStyles,
    columnStyles: {
      0: { cellWidth: 35, halign: "left", fontStyle: "normal" },
      1: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 5, right: 5 },
    theme: 'grid',
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 2;

  // ========== TABLEAU VERTICAL SIMPLIFIÉ (VENTES PAR PRODUIT) ==========
  if (options.produitTotals && options.produitTotals.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("PRODUITS VENDUS", 5, yPosition);
    yPosition += 2;
    
    // Prendre seulement les 5 premiers produits pour le ticket
    const topProduits = [...options.produitTotals]
      .sort((a, b) => safeNumber(b.TotalVente) - safeNumber(a.TotalVente))
      .slice(0, 5);
    
    const produitData = topProduits.map(p => [
      p.NomProduit.substring(0, 15), // Limiter la longueur du nom
      safeNumber(p.QuantiteTotale).toString(),
      formatMontant(safeNumber(p.TotalVente))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Produit', 'Qté', 'Montant']],
      body: produitData,
      headStyles: { ...headerStyles, fontSize: 6 },
      styles: { ...tableStyles, fontSize: 5 },
      theme: 'grid',
      margin: { left: 5, right: 5 },
      columnStyles: {
        0: { cellWidth: 40, halign: "left", fontStyle: "normal" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 20, halign: "right" },
      },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 2;
  }

  // ========== TRÉSORERIE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TRÉSORERIE ESPÈCES", 5, yPosition);
  yPosition += 2;
  
  const tresorerieData = [
    ['Fond initial', formatMontant(options.fondCaisseInitial)],
    ['+ Encaissées', formatMontant(options.totalEspecesEncaissées)],
    ['- Sorties', formatMontant(options.totalEspecesSorties)],
    ['+ Entrées', formatMontant(options.totalEspecesEntree)],
    ['', ''],
    ['FOND FINAL', formatMontant(options.totalEspecesFinalAttendu)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: tresorerieData,
    styles: tableStyles,
    columnStyles: {
      0: { cellWidth: 35, halign: "left", fontStyle: "normal" },
      1: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 5, right: 5 },
    theme: 'grid',
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 2;

  // ========== FOOTER ==========
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 2;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("*** RAPPORT Z TERMINÉ ***", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 2;
  
  const now = new Date();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(`Généré: ${formatDate(now)} ${formatHeure(now)}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 2;
  doc.text(`Caissier: ${options.caissier}`, pageWidth / 2, yPosition, { align: "center" });
  
  return doc;
};

// ============================================
// GÉNÉRATION PDF A4 (DÉTAILLÉ) - AVEC TABLEAUX ALIGNÉS ET OPTIMISÉS
// ============================================
export const generateZReportA4 = (options: ZReportProps): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const tableStyles = {
    fontSize: 9,
    font: "helvetica",
    cellPadding: 1.5,
    lineColor: [0, 0, 0],
    lineWidth: 0.2,
    overflow: 'linebreak' as const,
    halign: 'center' as const,
    valign: 'middle' as const,
  };

  // Style d'en-tête sans fond noir
  const headerStyles = {
    fillColor: [255, 255, 255], // Blanc au lieu de noir
    textColor: [0, 0, 0], // Texte noir
    fontStyle: 'bold' as const,
    halign: 'center' as const,
    fontSize: 10,
    lineWidth: 0.2,
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15; // Marge gauche constante pour tous les tableaux
  const marginRight = 15; // Marge droite constante
  const tableWidth = pageWidth - marginLeft - marginRight; // Largeur totale des tableaux
  
  let yPosition = 12;

 // ============================================
// EN-TÊTE PDF SÉCURISÉ - A4 ou TICKET
// ============================================
const etablissement = options.profile.entrepriseDenomination?.trim() || "VOTRE ENTREPRISE";
const adresse = options.profile.Adresse?.trim() || "Adresse non renseignée";



// Nom / dénomination
doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.text(etablissement.toUpperCase(), pageWidth / 2, yPosition, { align: "center" });
yPosition += 5;

// Extraire la ville de l'adresse (dernière partie après une virgule)
const adresseLignes = adresse.split(',');
const ville = adresseLignes[adresseLignes.length - 1]?.trim() || adresse;

doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.text(`${ville} - RAPPORT Z DE CLÔTURE`, pageWidth / 2, yPosition, { align: "center" });
yPosition += 5;

// Numéro de rapport
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text(`N°: ${options.reportNumber || "Z-XXXX"}`, pageWidth / 2, yPosition, { align: "center" });
yPosition += 5;

// Tableau des dates et heures
doc.setFont("helvetica", "normal");
doc.setFontSize(9);

const dateDebut = options.dateDebut || formatDate(new Date());
const dateFin = options.dateFin || formatDate(new Date());
const heureDebut = options.heureDebut || "00:00";
const heureFin = options.heureFin || "23:59";

const dateData = [
  ['Début', 'Fin', 'Heure début', 'Heure fin'],
  [dateDebut, dateFin, heureDebut, heureFin]
];

autoTable(doc, {
  startY: yPosition,
  body: dateData,
  styles: { fontSize: 8, font: "helvetica", cellPadding: 1 },
  headStyles: { fontStyle: 'bold', halign: 'center', fillColor: [255,255,255], textColor: [0,0,0] },
  theme: 'grid',
  margin: { left: 15, right: 15 },
  columnStyles: {
    0: { halign: "center" },
    1: { halign: "center" },
    2: { halign: "center" },
    3: { halign: "center" },
  },
});

yPosition = (doc as any).lastAutoTable?.finalY + 10;

 
  // ========== AJUSTEMENTS COMMERCIAUX ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("AJUSTEMENTS COMMERCIAUX", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  const activiteData = [
    ['RETOURS', formatMontant3Decimals(-options.totalRetours)],
    ['REMISES', formatMontant3Decimals(-options.totalRemises)],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: activiteData,
    styles: { ...tableStyles, fontSize: 10 },
    headStyles: headerStyles,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.7, halign: "left", fontStyle: "bold" },
      1: { cellWidth: tableWidth * 0.3, halign: "right", fontStyle: "bold" },
    },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 15;

  // ========== ENCAISSEMENTS PAR MOYEN DE PAIEMENT ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ENCAISSEMENTS PAR MOYEN DE PAIEMENT", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  // Calculer les totaux par moyen de paiement
  const paiements = options.detailPaiements.reduce((acc, p) => {
    const type = p.PaymentType.toLowerCase();
    if (type.includes('espèces') || type.includes('espece')) acc.especes += p.TotalAmount;
    if (type.includes('carte') || type.includes('tpe')) acc.carte += p.TotalAmount;
    if (type.includes('chèque') || type.includes('cheque')) acc.cheque += p.TotalAmount;
    if (type.includes('ticket')) acc.ticketRestaurant += p.TotalAmount;
    return acc;
  }, { especes: 0, carte: 0, cheque: 0, ticketRestaurant: 0 });
  
  const totalEncaissement = paiements.especes + paiements.carte + paiements.cheque + paiements.ticketRestaurant;
  
  const paiementsData = [
    ['Espèces', formatMontant3Decimals(paiements.especes)],
    ['TPE', formatMontant3Decimals(paiements.carte)],
    ['Chèque', formatMontant3Decimals(paiements.cheque)],
    ['Ticket restaurant', formatMontant3Decimals(paiements.ticketRestaurant)],
    ['TOTAL ENCAISSÉ', formatMontant3Decimals(totalEncaissement)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: paiementsData,
    styles: { ...tableStyles, fontSize: 10 },
    headStyles: headerStyles,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.7, halign: "left", fontStyle: "bold" },
      1: { cellWidth: tableWidth * 0.3, halign: "right", fontStyle: "bold" },
    },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 15;

  // ========== TICKETS RESTAURANT - DÉTAIL PAR FOURNISSEUR ==========
  const ticketsData = options.ticketFournisseurDetails || options.ticketRestaurantTotals;
  if (ticketsData && ticketsData.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DÉTAIL TICKETS RESTAURANT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    
    const formattedTickets = ticketsData.map((t: any) => [
      t.Type || t.fournisseur || 'Non spécifié',
      safeNumber(t.NbTickets || t.nbTickets).toString(),
      formatMontant3Decimals(safeNumber(t.TotalAmount || t.totalAmount))
    ]);
    
    // Ajouter le total
    const totalTickets = ticketsData.reduce((sum: number, t: any) => 
      sum + safeNumber(t.NbTickets || t.nbTickets), 0);
    const totalMontantTickets = ticketsData.reduce((sum: number, t: any) => 
      sum + safeNumber(t.TotalAmount || t.totalAmount), 0);
    
    formattedTickets.push([
      'TOTAL', 
      safeNumber(totalTickets).toString(), 
      formatMontant3Decimals(safeNumber(totalMontantTickets))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Fournisseur', 'Nb. Tickets', 'Montant total']],
      body: formattedTickets,
      headStyles: headerStyles,
      styles: { ...tableStyles, fontSize: 9 },
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.55, halign: "left", fontStyle: "bold" },
        1: { cellWidth: tableWidth * 0.2, halign: "center", fontStyle: "bold" },
        2: { cellWidth: tableWidth * 0.25, halign: "right", fontStyle: "bold" },
      },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 15;
  }
  
  // ========== VENTES PAR PRODUIT ==========
  if (options.produitTotals && options.produitTotals.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("VENTES PAR PRODUIT", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    
    // Calcul des totaux
    let totalQuantite = 0;
    let totalVentes = 0;
    let totalRetours = 0;
    let totalNet = 0;
    
    // Trier les produits par montant de vente décroissant
    const sortedProduits = [...options.produitTotals]
      .sort((a, b) => safeNumber(b.TotalVente) - safeNumber(a.TotalVente));
    
    // Préparer les données pour chaque produit
    const produitData = sortedProduits.map(p => {
      const quantite = safeNumber(p.QuantiteTotale);
      const ventes = safeNumber(p.TotalVente);
      const retours = safeNumber(p.TotalRetours);
      const net = ventes - retours;
      
      totalQuantite += quantite;
      totalVentes += ventes;
      totalRetours += retours;
      totalNet += net;
      
      return [
        p.NomProduit,
        quantite.toString(),
        formatMontant3Decimals(ventes),
        formatMontant3Decimals(-retours),
        formatMontant3Decimals(net)
      ];
    });
    
    // Ajouter la ligne de séparation et les totaux
    produitData.push(['', '', '', '', '']);
    produitData.push([
      'TOTAL',
      totalQuantite.toString(),
      formatMontant3Decimals(totalVentes),
      formatMontant3Decimals(-totalRetours),
      formatMontant3Decimals(totalNet)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Produit', 'Quantité', 'Ventes', 'Retours', 'Net']],
      body: produitData,
      headStyles: headerStyles,
      styles: { ...tableStyles, fontSize: 9 },
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.5, halign: "left" },
        1: { cellWidth: tableWidth * 0.125, halign: "center" },
        2: { cellWidth: tableWidth * 0.125, halign: "right" },
        3: { cellWidth: tableWidth * 0.125, halign: "right" },
        4: { cellWidth: tableWidth * 0.125, halign: "right" },
      },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 15;
  }

  // ========== DÉTAIL PAR CAISSIER ==========
  if (options.ventesParCaissier && options.ventesParCaissier.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DÉTAIL PAR CAISSIER", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    
    // Calcul des totaux
    const totals = {
      ventes: 0,
      montantTotal: 0,
      especes: 0,
      carte: 0,
      cheque: 0,
      ticketRestaurant: 0,
      fond: 0,
      remises: 0,
      retours: 0,
      net: 0,
      encaissements: 0
    };
    
    // Préparer les données pour chaque caissier
    const caissierData = options.ventesParCaissier.map(c => {
      const especes = safeNumber(c.paiements?.especes || 0);
      const carte = safeNumber(c.paiements?.carte || 0);
      const cheque = safeNumber(c.paiements?.cheque || 0);
      const ticket = safeNumber(c.paiements?.ticketRestaurant || 0);
      const retours = safeNumber(c.totalRetours || 0);
      const remises = safeNumber(c.totalRemises || 0);
      
      const encaissements = especes + carte + cheque + ticket ;
      const net = encaissements - remises - retours;
      
      // Mettre à jour les totaux
      totals.ventes += safeNumber(c.nombreVentes);
      totals.montantTotal += safeNumber(c.montantTotal);
      totals.especes += especes;
      totals.carte += carte;
      totals.cheque += cheque;
      totals.ticketRestaurant += ticket;
      totals.fond += safeNumber(c.fondCaisse || 0);
      totals.remises += safeNumber(c.totalRemises || 0);
      totals.retours += retours;
      totals.net += net;
      totals.encaissements += encaissements;
      
      return [
        c.nom,
        safeNumber(c.nombreVentes).toString(),
        formatMontant3Decimals(safeNumber(c.montantTotal)),
        formatMontant3Decimals(especes),
        formatMontant3Decimals(carte),
        formatMontant3Decimals(cheque),
        formatMontant3Decimals(ticket),
        formatMontant3Decimals(safeNumber(c.fondCaisse || 0)),
        formatMontant3Decimals(safeNumber(c.totalRemises || 0)),
        formatMontant3Decimals(-retours),
        formatMontant3Decimals(net),
        formatMontant3Decimals(encaissements)
      ];
    });
    
    // Ajouter la ligne TOTAL
    caissierData.push([
      'TOTAL',
      totals.ventes.toString(),
      formatMontant3Decimals(totals.montantTotal),
      formatMontant3Decimals(totals.especes),
      formatMontant3Decimals(totals.carte),
      formatMontant3Decimals(totals.cheque),
      formatMontant3Decimals(totals.ticketRestaurant),
      formatMontant3Decimals(totals.fond),
      formatMontant3Decimals(totals.remises),
      formatMontant3Decimals(-totals.retours),
      formatMontant3Decimals(totals.net),
      formatMontant3Decimals(totals.encaissements)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Caissier', 'Ventes', 'Total', 'Espèces', 'TPE', 'Chèque', 'Ticket', 'Fond', 'Remises', 'Retours', 'Net', 'Encaiss.']],
      body: caissierData,
      headStyles: headerStyles,
      styles: { ...tableStyles, fontSize: 8 },
      theme: 'grid',
      margin: { left: marginLeft, right: marginRight },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.15, halign: "left", fontStyle: "bold" },
        1: { cellWidth: tableWidth * 0.07, halign: "center" },
        2: { cellWidth: tableWidth * 0.08, halign: "right" },
        3: { cellWidth: tableWidth * 0.07, halign: "right" },
        4: { cellWidth: tableWidth * 0.07, halign: "right" },
        5: { cellWidth: tableWidth * 0.07, halign: "right" },
        6: { cellWidth: tableWidth * 0.07, halign: "right" },
        7: { cellWidth: tableWidth * 0.07, halign: "right" },
        8: { cellWidth: tableWidth * 0.07, halign: "right" },
        9: { cellWidth: tableWidth * 0.07, halign: "right" },
        10: { cellWidth: tableWidth * 0.07, halign: "right" },
        11: { cellWidth: tableWidth * 0.08, halign: "right" },
      },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 15;
  }

  // ========== CONTRÔLE FINAL ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("CONTRÔLE FINAL", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;
  
  const controleData = [
    ['ESPÈCES', formatMontant3Decimals(paiements.especes)],
    ['TPE', formatMontant3Decimals(paiements.carte)],
    ['CHÈQUE', formatMontant3Decimals(paiements.cheque)],
    ['TICKET RESTAURANT', formatMontant3Decimals(paiements.ticketRestaurant)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: controleData,
    styles: { ...tableStyles, fontSize: 11 },
    headStyles: headerStyles,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.7, halign: "left", fontStyle: "bold" },
      1: { cellWidth: tableWidth * 0.3, halign: "right", fontStyle: "bold" },
    },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 10;
  
  // ========== SYNTHÈSE FINALE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const now = new Date();
  doc.text(`Rapport généré le ${formatDate(now)} à ${formatHeure(now)}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Caissier: ${options.caissier}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  
  // Si on est proche de la fin de page, on peut ajouter une nouvelle page
  if (yPosition > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Ligne de fin
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("*** RAPPORT Z TERMINÉ ***", pageWidth / 2, yPosition, { align: "center" });
  
  return doc;
};
// ============================================
// FONCTIONS D'EXPORT (inchangées)
// ============================================
export const generateZReportBase64 = (options: ZReportProps, format: '80mm' | 'a4' = '80mm'): string => {
  const pdf = format === '80mm' ? generateZReportPDF80mm(options) : generateZReportA4(options);
  const dataUri = pdf.output('datauristring');
  return dataUri.split(',')[1];
};

export const print80mmZReport = async (
  options: ZReportProps,
  printerName?: string
): Promise<{ status: string; message: string }> => {
  try {
    const pdfBase64 = generateZReportBase64(options, '80mm');
    
    const printRequest = {
      pdf: pdfBase64,
      ...(printerName && { printerName })
    };

    const result = await printTicket(printRequest);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'impression:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'impression'
    };
  }
};

export const downloadZReportPDF = (options: ZReportProps, format: '80mm' | 'a4' = 'a4', filename?: string): void => {
  const pdf = format === '80mm' ? generateZReportPDF80mm(options) : generateZReportA4(options);
  const defaultFilename = format === '80mm' 
    ? `rapport_z_${options.reportNumber}_80mm.pdf`
    : `rapport_z_${options.reportNumber}_complet.pdf`;
  pdf.save(filename || defaultFilename);
};

export const printA4ZReport = async (
  options: ZReportProps,
  printerName?: string
): Promise<{ status: string; message: string }> => {
  try {
    const pdfBase64 = generateZReportBase64(options, 'a4');
    
    const printRequest = {
      pdf: pdfBase64,
      ...(printerName && { printerName })
    };

    const result = await printTicket(printRequest);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'impression A4:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'impression A4'
    };
  }
};

// ============================================
// FONCTION PRINCIPALE POUR GÉNÉRER LE RAPPORT
// ============================================
export async function generateZReportFromDashboardData(
  dashboardData: DashboardData
): Promise<{ data: ZReportProps; pdf80mm: string; pdfA4: string }> {
  
  const zReportData = convertDashboardDataToZReportProps(dashboardData);
  
  const pdf80mm = generateZReportBase64(zReportData, '80mm');
  const pdfA4 = generateZReportBase64(zReportData, 'a4');
  
  return {
    data: zReportData,
    pdf80mm,
    pdfA4
  };
}