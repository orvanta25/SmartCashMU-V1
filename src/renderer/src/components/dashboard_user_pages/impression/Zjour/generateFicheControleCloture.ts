import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ZReportProps } from './generateZReport';

export interface FicheControleData {
  // Données automatiques du Rapport Z
  reportData: ZReportProps;
  
  // Données manuelles saisies par le caissier
  manuel: {
    // Tickets Restaurant
    ticketsTrouves: Array<{
      fournisseur: string;
      nbTrouve: number;
      montantTrouve: number;
    }>;
    
    // TPE
    tpeTrouve: {
      nbTransactions?: number;
      montantTrouve: number;
    };
    
    // Chèques
    chequesTrouves: Array<{
      fournisseur?: string;
      nbTrouve: number;
      montantTrouve: number;
    }>;
    
    // Espèces (comptage détaillé)
    especesComptees: Array<{
      denomination: string; 
      quantite: number;
      valeurUnitaire: number;
    }>;
    
    // Observations
    observations?: string;
    
    // Signatures
    responsable: string;
    gerant: string;
    dateControle: string;
  };
}

// Interface pour les calculs automatiques
interface CalculsControle {
  totalEspecesZ: number;
  totalTicketsZ: number;
  totalTPEZ: number;
  totalChequesZ: number;
  
  totalEspecesTrouve: number;
  totalTicketsTrouve: number;
  totalTPETrouve: number;
  totalChequesTrouve: number;
  
  ecartEspeces: number;
  ecartTickets: number;
  ecartTPE: number;
  ecartCheques: number;
  ecartGlobal: number;
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Number(value) || 0;
};

const formatMontant = (montant: any): string => {
  const m = safeNumber(montant);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(m);
};

const formatMontant2Decimals = (montant: any): string => {
  const m = safeNumber(montant);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m);
};

// Calculs automatiques
const calculerTotaux = (data: FicheControleData): CalculsControle => {
  const report = data.reportData;
  
  // Totaux du Rapport Z
  const paiements = report.detailPaiements.reduce((acc, p) => {
    const type = p.PaymentType.toLowerCase();
    if (type.includes('espèces') || type.includes('espece')) acc.especes += p.TotalAmount;
    if (type.includes('carte') || type.includes('tpe')) acc.carte += p.TotalAmount;
    if (type.includes('chèque') || type.includes('cheque')) acc.cheque += p.TotalAmount;
    return acc;
  }, { especes: 0, carte: 0, cheque: 0 });
  
  const totalTicketsZ = report.ticketRestaurantTotals?.reduce((sum, t) => 
    sum + safeNumber(t.TotalAmount), 0) || 0;
  
  // Totaux trouvés manuellement
  const totalTicketsTrouve = data.manuel.ticketsTrouves.reduce((sum, t) => 
    sum + safeNumber(t.montantTrouve), 0);
  
  const totalChequesTrouve = data.manuel.chequesTrouves.reduce((sum, c) => 
    sum + safeNumber(c.montantTrouve), 0);
  
  const totalEspecesTrouve = data.manuel.especesComptees.reduce((sum, e) => 
    sum + (safeNumber(e.quantite) * safeNumber(e.valeurUnitaire)), 0);
  
  // Calcul des écarts
  const ecartEspeces = paiements.especes - totalEspecesTrouve;
  const ecartTickets = totalTicketsZ - totalTicketsTrouve;
  const ecartTPE = paiements.carte - safeNumber(data.manuel.tpeTrouve.montantTrouve);
  const ecartCheques = paiements.cheque - totalChequesTrouve;
  const ecartGlobal = ecartEspeces + ecartTickets + ecartTPE + ecartCheques;
  
  return {
    totalEspecesZ: paiements.especes,
    totalTicketsZ,
    totalTPEZ: paiements.carte,
    totalChequesZ: paiements.cheque,
    
    totalEspecesTrouve,
    totalTicketsTrouve,
    totalTPETrouve: safeNumber(data.manuel.tpeTrouve.montantTrouve),
    totalChequesTrouve,
    
    ecartEspeces,
    ecartTickets,
    ecartTPE,
    ecartCheques,
    ecartGlobal
  };
};

export const generateFicheControleCloturePDF = (data: FicheControleData): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  

  const tableStyles = {
    fontSize: 8,
    font: "helvetica",
    cellPadding: 1.2,
    lineColor: [0, 0, 0],
    lineWidth: 0.1,
    overflow: 'linebreak' as const,
    halign: 'center' as const,
    valign: 'middle' as const,
  };

  const headerStyles = {
    fillColor: [240, 240, 240],
    textColor: [0, 0, 0],
    fontStyle: 'bold' as const,
    halign: 'center' as const,
    fontSize: 9,
    lineWidth: 0.1,
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const tableWidth = pageWidth - marginLeft - marginRight;
  
  let yPosition = 15;
  
  // Calculs automatiques
  const calculs = calculerTotaux(data);

  // ========== EN-TÊTE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FICHE DE CONTRÔLE DE CLÔTURE DE CAISSE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  const report = data.reportData;
  doc.setFontSize(10);
  doc.text(`Établissement: ${report.profile.entrepriseDenomination || 'Nom non spécifié'}`, marginLeft, yPosition);
  doc.text(`Date: ${report.dateFin}`, pageWidth - marginRight, yPosition, { align: "right" });
  yPosition += 5;
  
  doc.text(`Rapport Z: ${report.reportNumber}`, marginLeft, yPosition);
  doc.text(`Caissier: ${report.caissier}`, pageWidth - marginRight, yPosition, { align: "right" });
  yPosition += 10;

  // ========== 1. DÉPENSES / RETRAITS CAISSE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. DÉPENSES / RETRAITS CAISSE (ESPÈCES)", marginLeft, yPosition);
  yPosition += 6;
  
  const depensesData = [
    ['Fond initial', formatMontant(report.fondCaisseInitial)],
    ['Sorties espèces', formatMontant(report.totalEspecesSorties)],
    ['Entrées espèces', formatMontant(report.totalEspecesEntree)],
    ['', ''],
    ['SOLDE ESPÈCES ATTENDU', formatMontant(report.totalEspecesFinalAttendu)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: depensesData,
    styles: tableStyles,
    headStyles: headerStyles,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.7, halign: "left", fontStyle: "bold" },
      1: { cellWidth: tableWidth * 0.3, halign: "right", fontStyle: "bold" },
    },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 10;

 // ========== 2. TICKETS RESTAURANT ==========
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("2. TICKETS RESTAURANT", marginLeft, yPosition);
yPosition += 6;

const ticketsZ = data.reportData.ticketRestaurantTotals || [];

// Construire le tableau avec Total (Z) calculé
const ticketsData = ticketsZ.map((t) => {
  const nbZ = safeNumber(t.NbTickets);
  const valeurZ = safeNumber(t.ValeurTicket); // Valeur unitaire du ticket
  const totalZ = nbZ * valeurZ;

  return [
    t.Type ?? '',           // Fournisseur / Type
    nbZ.toString(),         // Nb (Z)
    formatMontant(valeurZ), // Valeur (Z)
    formatMontant(totalZ),  // Total (Z) calculé automatiquement
    '',                     // Nb trouvé vide
    '',                     // Valeur trouvé vide
    ''                      // Écart vide
  ];
});

// Ajouter la ligne TOTAL avec Total (Z) calculé, autres colonnes vides
ticketsData.push([
  'TOTAL',
  ticketsZ.reduce((sum, t) => sum + safeNumber(t.NbTickets), 0).toString(),
  '', // Valeur unitaire pour le total global éventuellement vide
  formatMontant(
    ticketsZ.reduce((sum, t) => sum + safeNumber(t.NbTickets) * safeNumber(t.ValeurTicket), 0)
  ),
  '', '', '' // Nb trouvé, Valeur trouvé, Écart vides
]);

autoTable(doc, {
  startY: yPosition,
  head: [['Fournisseur', 'Nb (Z)', 'Valeur (Z)', 'Total (Z)', 'Nb trouvé', 'Valeur trouvé', 'Écart']],
  body: ticketsData,
  styles: { ...tableStyles, fontSize: 7 },
  headStyles: headerStyles,
  theme: 'grid',
  margin: { left: marginLeft, right: marginRight },
  columnStyles: {
    0: { cellWidth: tableWidth * 0.20, halign: "left" },
    1: { cellWidth: tableWidth * 0.10, halign: "center" },
    2: { cellWidth: tableWidth * 0.10, halign: "right" },
    3: { cellWidth: tableWidth * 0.15, halign: "right" },
    4: { cellWidth: tableWidth * 0.10, halign: "center" },
    5: { cellWidth: tableWidth * 0.15, halign: "right" },
    6: { cellWidth: tableWidth * 0.15, halign: "right" },
  },
});

yPosition = (doc as any).lastAutoTable?.finalY + 10;


// ========== 3. TPE (CARTE BANCAIRE) ==========
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("3. TPE (CARTE BANCAIRE)", marginLeft, yPosition);
yPosition += 6;

// Tableau avec Total(Z) importé et autres colonnes vides
const tpeData = [
  [
    formatMontant(calculs.totalTPEZ), // Total (Z) importé automatiquement
    '',                                // Total trouvé vide
    ''                                 // Écart vide
  ]
];

// Ajouter la ligne TOTAL (ici idem ligne unique)
tpeData.push([
  formatMontant(calculs.totalTPEZ),
  '',
  ''
]);

autoTable(doc, {
  startY: yPosition,
  head: [['Total (Z)', 'Total trouvé', 'Écart']],
  body: tpeData,
  styles: tableStyles,
  headStyles: headerStyles,
  theme: 'grid',
  margin: { left: marginLeft, right: marginRight },
  columnStyles: {
    0: { cellWidth: tableWidth * 0.33, halign: "right" },
    1: { cellWidth: tableWidth * 0.33, halign: "right" },
    2: { cellWidth: tableWidth * 0.33, halign: "right" },
  },
});

yPosition = (doc as any).lastAutoTable?.finalY + 10;



  // ========== 4. CHÈQUES ==========
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("4. CHÈQUES", marginLeft, yPosition);
yPosition += 6;

// Construire le tableau avec Total(Z) importé et autres colonnes vides
const chequesData = data.manuel.chequesTrouves.map((c) => {
  return [
    formatMontant(c.totalZ || 0), // Total (Z) importé automatiquement
    '',                            // Total trouvé vide
    ''                             // Écart vide
  ];
});

// Ajouter la ligne TOTAL avec Total(Z) importé, autres colonnes vides
chequesData.push([
  formatMontant(calculs.totalChequesZ),
  '', 
  ''  
]);

autoTable(doc, {
  startY: yPosition,
  head: [['Total (Z)', 'Total trouvé', 'Écart']],
  body: chequesData,
  styles: { ...tableStyles, fontSize: 7 },
  headStyles: headerStyles,
  theme: 'grid',
  margin: { left: marginLeft, right: marginRight },
  columnStyles: {
    0: { cellWidth: tableWidth * 0.33, halign: "right" },
    1: { cellWidth: tableWidth * 0.33, halign: "right" },
    2: { cellWidth: tableWidth * 0.33, halign: "right" },
  },
});

yPosition = (doc as any).lastAutoTable?.finalY + 10;

// ========== 5. COMPTAGE DES ESPÈCES (BILLETS ET PIÈCES) ==========
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("5. COMPTAGE DES ESPÈCES (BILLETS ET PIÈCES)", marginLeft, yPosition);
yPosition += 6;

// Tableau de comptage détaillé (tout vide par défaut)
const especesData = data.manuel.especesComptees.map(e => {
  return [
    e.denomination ?? '', 
    '',                    
    '',                    
    ''                     
  ];
});

// Ajouter la ligne TOTAL complètement vide
especesData.push([
  'TOTAL ESPÈCES COMPTÉES',
  '',
  '',
  '' 
]);

// Génération du tableau avec autoTable
autoTable(doc, {
  startY: yPosition,
  head: [['Dénomination', 'Quantité', 'Valeur unitaire', 'Total']],
  body: especesData,
  styles: tableStyles,
  headStyles: headerStyles,
  theme: 'grid',
  margin: { left: marginLeft, right: marginRight },
  columnStyles: {
    0: { cellWidth: tableWidth * 0.3, halign: "left" },
    1: { cellWidth: tableWidth * 0.2, halign: "center" },
    2: { cellWidth: tableWidth * 0.2, halign: "right" },
    3: { cellWidth: tableWidth * 0.3, halign: "right" },
  },
});

// Mettre à jour la position Y après le tableau
yPosition = (doc as any).lastAutoTable?.finalY + 10;



  // ========== 6. SYNTHÈSE & CONTRÔLE ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("6. SYNTHÈSE & CONTRÔLE", marginLeft, yPosition);
  yPosition += 6;
  
  const syntheseData = [
    ['ESPÈCES', formatMontant(calculs.totalEspecesZ), formatMontant(calculs.totalEspecesTrouve), formatMontant(calculs.ecartEspeces)],
    ['TICKETS RESTAURANT', formatMontant(calculs.totalTicketsZ), formatMontant(calculs.totalTicketsTrouve), formatMontant(calculs.ecartTickets)],
    ['TPE', formatMontant(calculs.totalTPEZ), formatMontant(calculs.totalTPETrouve), formatMontant(calculs.ecartTPE)],
    ['CHÈQUES', formatMontant(calculs.totalChequesZ), formatMontant(calculs.totalChequesTrouve), formatMontant(calculs.ecartCheques)],
    ['', '', '', ''],
    ['TOTAL GLOBAL', formatMontant(calculs.totalEspecesZ + calculs.totalTicketsZ + calculs.totalTPEZ + calculs.totalChequesZ), 
     formatMontant(calculs.totalEspecesTrouve + calculs.totalTicketsTrouve + calculs.totalTPETrouve + calculs.totalChequesTrouve), 
     formatMontant(calculs.ecartGlobal)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Moyen de paiement', 'Total (Z)', 'Total trouvé', 'Écart']],
    body: syntheseData,
    styles: { ...tableStyles, fontSize: 9 },
    headStyles: headerStyles,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.4, halign: "left", fontStyle: "bold" },
      1: { cellWidth: tableWidth * 0.2, halign: "right", fontStyle: "bold" },
      2: { cellWidth: tableWidth * 0.2, halign: "right", fontStyle: "bold" },
      3: { cellWidth: tableWidth * 0.2, halign: "right", fontStyle: "bold" },
    },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 10;

  // ========== 7. REMARQUES / OBSERVATIONS ==========
 doc.setFont("helvetica", "normal");
doc.setFontSize(10);

// Construire un tableau vide avec 5 lignes pour remarques
const remarquesData = Array.from({ length: 5 }, () => ['', '', '']);

autoTable(doc, {
  startY: yPosition,
  head: [['Remarque', 'Responsable', 'Signature']],
  body: remarquesData,
  styles: { ...tableStyles, fontSize: 10 },
  headStyles: { ...headerStyles, fillColor: [220, 220, 220] }, 
  theme: 'grid',
  margin: { left: marginLeft, right: marginRight },
  columnStyles: {
    0: { cellWidth: tableWidth * 0.5, halign: "left" },   
    1: { cellWidth: tableWidth * 0.25, halign: "center" }, 
    2: { cellWidth: tableWidth * 0.25, halign: "center" }, 
  },
});

yPosition = (doc as any).lastAutoTable?.finalY + 10;


  // ========== 8. VALIDATION & SIGNATURES ==========
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("8. VALIDATION", marginLeft, yPosition);
  yPosition += 8;
  
  // Lignes de signatures
  const signatureY = yPosition + 20;
  
  // Signature responsable
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Le Responsable", marginLeft + 20, yPosition);
  doc.line(marginLeft + 10, signatureY, marginLeft + 80, signatureY);
  doc.text(data.manuel.responsable || "________________", marginLeft + 10, signatureY + 5);
  doc.text(`Date: ${data.manuel.dateControle}`, marginLeft + 10, signatureY + 10);
  
  // Signature gérant
  doc.text("Le Gérant", pageWidth - marginRight - 60, yPosition);
  doc.line(pageWidth - marginRight - 90, signatureY, pageWidth - marginRight - 10, signatureY);
  doc.text(data.manuel.gerant || "________________", pageWidth - marginRight - 90, signatureY + 5);
  doc.text(`Date: ${data.manuel.dateControle}`, pageWidth - marginRight - 90, signatureY + 10);
  
  return doc;
};

// Fonction pour créer des données par défaut
export const createDefaultFicheControleData = (zReportData: ZReportProps): FicheControleData => {
  // Valeurs par défaut pour les dénominations d'espèces
  const denominationsEspeces = [
    { denomination: "Billet 200 ", valeurUnitaire: 200 },
    { denomination: "Billet 100 ", valeurUnitaire: 100 },
    { denomination: "Billet 50 ", valeurUnitaire: 50 },
    { denomination: "Billet 20 ", valeurUnitaire: 20 },
    { denomination: "Billet 10 ", valeurUnitaire: 10 },
    { denomination: "Billet 5 ", valeurUnitaire: 5 },
    { denomination: "Pièce 2 ", valeurUnitaire: 2 },
    { denomination: "Pièce 1 ", valeurUnitaire: 1 },
    { denomination: "Pièce 0,50 ", valeurUnitaire: 0.5 },
    { denomination: "Pièce 0,20 ", valeurUnitaire: 0.2 },
    { denomination: "Pièce 0,10 ", valeurUnitaire: 0.1 },
    { denomination: "Pièce 0,05 ", valeurUnitaire: 0.05 },
    { denomination: "Pièce 0,02 ", valeurUnitaire: 0.02 },
    { denomination: "Pièce 0,01 ", valeurUnitaire: 0.01 },
  ];
  
  return {
    reportData: zReportData,
    manuel: {
      ticketsTrouves: (zReportData.ticketRestaurantTotals || []).map(t => ({
        fournisseur: t.Type,
        nbTrouve: 0,
        montantTrouve: 0
      })),
      tpeTrouve: {
        nbTransactions: 0,
        montantTrouve: 0
      },
      chequesTrouves: [],
      especesComptees: denominationsEspeces.map(d => ({
        denomination: d.denomination,
        quantite: 0,
        valeurUnitaire: d.valeurUnitaire
      })),
      observations: "",
      responsable: "",
      gerant: "",
      dateControle: new Date().toLocaleDateString('fr-FR')
    }
  };
};

// Fonction d'export
export const downloadFicheControleCloture = (
  data: FicheControleData,
  filename?: string
): void => {
  const pdf = generateFicheControleCloturePDF(data);
  const defaultFilename = `fiche_controle_cloture_${data.reportData.reportNumber}.pdf`;
  pdf.save(filename || defaultFilename);
};

// Fonction pour obtenir la base64 (si besoin pour l'API d'impression)
export const generateFicheControleBase64 = (data: FicheControleData): string => {
  const pdf = generateFicheControleCloturePDF(data);
  const dataUri = pdf.output('datauristring');
  return dataUri.split(',')[1];
};