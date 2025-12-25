import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interfaces
export interface ProduitTotal {
  NomProduit: string;
  QuantiteTotale: number;
  TotalVente: number;
}

export interface CategorieTotal {
  NomCategorie: string;
  TotalVente: number;
}

export interface PaymentTypeTotal {
  PaymentType: string;
  TotalAmount: number;
}

export interface TicketRestaurantTotal {
  Type: string;
  TotalAmount: number;
}

export interface Serveur {
  FondCaisse: number;
  Nom?: string;
}

export interface ZReportProps {
  produitTotals?: ProduitTotal[];
  categorieTotals?: CategorieTotal[];
  ventesParCaissier?: { [key: string]: number };
  totalsByPaymentType?: PaymentTypeTotal[];
  ticketRestaurantTotals?: TicketRestaurantTotal[];
  remises?: number;
  NBcommandeNp?: number;
  TotalCommandeNp?: number;
  NBcommandeP?: number;
  TotalcommandeP?: number;
  NBcommandeO?: number;
  TotalcommandeO?: number;
  TotalRetours?: number; // AJOUTÉ
  servers?: Serveur[];
  numberOfTables?: number;
  totalCommandes?: number;
  profile?: { Nom: string; Adresse: string };
  dateDebut?: string;
  heureDebut?: string;
  dateFin?: string;
  heureFin?: string;
}

export const generateZReport = (options: ZReportProps) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297],
  });

  // Styles optimisés pour la lisibilité
  const tableStyles = {
    fontSize: 9,
    font: "helvetica",
    fontStyle: 'bold' as const,
    cellPadding: 2,
    overflow: 'linebreak' as const,
    textColor: [0, 0, 0] as [number, number, number]
  };

  const headStyles = {
    fillColor: [0, 0, 0] as [number, number, number],
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
    halign: 'center' as const,
    fontSize: 10
  };

  const negativeStyle = {
    textColor: [255, 0, 0] as [number, number, number]
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 6; // Position verticale initiale

  // Fonctions de formatage
  const formatDateFrench = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // En-tête avec styles optimisés
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text('RAPPORT Z DE JOURNÉE', pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.text(options.profile?.Nom || 'Votre Restaurant', pageWidth / 2, yPosition, { align: "center" });
  yPosition += 6;
  
  doc.setFont("helvetica", "normal");
  if (options.profile?.Adresse) {
    doc.text(options.profile.Adresse, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
  }

  // Ajout de la période
  if (options.dateDebut && options.heureDebut && options.dateFin && options.heureFin) {
    doc.text(`Période: ${formatDateFrench(options.dateDebut)} ${options.heureDebut.substring(0, 5)} - ${formatDateFrench(options.dateFin)} ${options.heureFin.substring(0, 5)}`, 
             pageWidth / 2, yPosition, { align: "center" });
    yPosition += 6;
  }
  
  doc.text(`Généré le: ${getCurrentDateTime()}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 6;

  // Vente par produit
  if (options.produitTotals?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('VENTES PAR PRODUIT', 5, yPosition);
    yPosition += 6;
    
    const produitBody = options.produitTotals.map((p) => {
      const isNegative = p.TotalVente < 0;
      
      return [
        p.NomProduit.slice(0, 20),
        { content: p.QuantiteTotale > 0 ? p.QuantiteTotale.toFixed(3) : '', styles: isNegative ? negativeStyle : {} },
        { content: p.TotalVente.toFixed(3), styles: isNegative ? negativeStyle : {} }
      ];
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Produit', 'Qté', 'Total']],
      body: produitBody,
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {
        0: { cellWidth: 35, halign: "left" },
        1: { cellWidth: 15, halign: "right" },
        2: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 5, right: 5 },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 6;
    const totalProduits = options.produitTotals.reduce((sum, p) => sum + (p.TotalVente || 0), 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Total: ${totalProduits.toFixed(3)}`,
      pageWidth - 5,
      yPosition,
      { align: "right" }
    );
    yPosition += 10;
  }

  // Recette par famille
  if (options.categorieTotals?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('RECETTE PAR FAMILLE', 5, yPosition);
    yPosition += 6;
    
    const categorieBody = options.categorieTotals.map((c) => {
      const isNegative = c.TotalVente < 0;
      
      return [
        c.NomCategorie.slice(0, 25),
        { content: c.TotalVente.toFixed(3), styles: isNegative ? negativeStyle : {} }
      ];
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Famille', 'Total']],
      body: categorieBody,
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {
        0: { cellWidth: 45, halign: "left" },
        1: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 5, right: 5 },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 6;
    const totalCategories = options.categorieTotals.reduce((sum, c) => sum + (c.TotalVente || 0), 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Total: ${totalCategories.toFixed(3)}`,
      pageWidth - 5,
      yPosition,
      { align: "right" }
    );
    yPosition += 10;
  }

  // Détail des paiements - AJOUT DES RETOURS
  if (options.totalsByPaymentType?.length || options.remises || options.TotalRetours) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('DÉTAIL DES PAIEMENTS', 5, yPosition);
    yPosition += 6;
    
    const paymentBody = [
      ...(options.totalsByPaymentType?.map((p) => [
        p.PaymentType.slice(0, 25),
        p.TotalAmount.toFixed(3),
      ]) || []),
    ];
    
    // Ajout des remises
    if (options.remises && options.remises > 0) {
      paymentBody.push(['Remises', `-${options.remises.toFixed(3)}`]);
    }
    
    // AJOUT DES RETOURS
    if (options.TotalRetours && options.TotalRetours > 0) {
      paymentBody.push(['Retours', `-${options.TotalRetours.toFixed(3)}`]);
    }
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Type', 'Montant']],
      body: paymentBody,
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {
        0: { cellWidth: 45, halign: "left" },
        1: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 5, right: 5 },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 6;
  }

  // Tickets Restaurant
  if (options.ticketRestaurantTotals?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('TICKETS RESTAURANT', 5, yPosition);
    yPosition += 6;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Fournisseur', 'Montant']],
      body: options.ticketRestaurantTotals.map((t) => [
        t.Type.slice(0, 25),
        t.TotalAmount.toFixed(3),
      ]),
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {
        0: { cellWidth: 45, halign: "left" },
        1: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 5, right: 5 },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 6;
  }

  // Statistiques des commandes - AJOUT DES RETOURS
  if (options.NBcommandeP || options.TotalRetours) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('STATISTIQUES', 5, yPosition);
    yPosition += 6;
    
    const statsBody = [];
    
    if (options.NBcommandeP && options.NBcommandeP > 0) {
      statsBody.push(['Commandes payées', `${options.NBcommandeP}`, options.TotalcommandeP?.toFixed(3)]);
    }
    
    // AJOUT DES RETOURS
    if (options.TotalRetours && options.TotalRetours > 0) {
      statsBody.push(['Total retours', '', `-${options.TotalRetours.toFixed(3)}`]);
    }
    
    if (statsBody.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Nb', 'Montant']],
        body: statsBody,
        styles: tableStyles,
        headStyles: headStyles,
        columnStyles: {
          0: { cellWidth: 35, halign: "left" },
          1: { cellWidth: 15, halign: "center" },
          2: { cellWidth: 20, halign: "right" },
        },
        margin: { left: 5, right: 5 },
      });
      
      yPosition = (doc as any).lastAutoTable?.finalY + 6;
    }
  }

  // Récapitulatif financier - AJOUT DES RETOURS DANS LE CALCUL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text('RÉCAPITULATIF FINANCIER', 5, yPosition);
  yPosition += 6;
  
  const fondCaisse = options.servers?.[options.servers.length - 1]?.FondCaisse || 0;
  const totalPayment = options.totalsByPaymentType?.reduce((sum, p) => sum + (p.TotalAmount || 0), 0) || 0;
  const totalTickets = options.ticketRestaurantTotals?.reduce((sum, t) => sum + (t.TotalAmount || 0), 0) || 0;
  const totalRetours = options.TotalRetours || 0;
  const totalRemises = options.remises || 0;
  
  // NOUVEAU CALCUL AVEC RETOURS
  const totalRevenue = totalPayment + totalTickets - totalRemises - totalRetours;
  
  const summaryBody = [
    ['Fond de caisse', fondCaisse.toFixed(3)],
    ['Recette totale', totalRevenue.toFixed(3)],
    ['Total caisse', (totalRevenue + fondCaisse).toFixed(3)],
  ];
  
  // Ajouter une ligne pour les retours si applicable
  if (totalRetours > 0) {
    summaryBody.splice(1, 0, ['Dont retours', `-${totalRetours.toFixed(3)}`]);
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Montant']],
    body: summaryBody,
    styles: tableStyles,
    headStyles: headStyles,
    columnStyles: {
      0: { cellWidth: 45, halign: "left" },
      1: { cellWidth: 20, halign: "right" },
    },
    margin: { left: 5, right: 5 },
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY + 10;

  // Ventes par caissier
  if (options.ventesParCaissier && Object.keys(options.ventesParCaissier).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text('VENTES PAR CAISSIER', 5, yPosition);
    yPosition += 6;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Caissier', 'Montant']],
      body: Object.entries(options.ventesParCaissier).map(([name, amount]) => [
        name.slice(0, 25),
        amount.toFixed(3),
      ]),
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {
        0: { cellWidth: 45, halign: "left" },
        1: { cellWidth: 20, halign: "right" },
      },
      margin: { left: 5, right: 5 },
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY + 10;
  }

  // Signature
  const caissierNom = options.servers?.[options.servers.length - 1]?.Nom || 'Inconnu';
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text('Clôturé par: ' + caissierNom, 5, yPosition);
  yPosition += 8;
  
  doc.line(5, yPosition, pageWidth - 5, yPosition);
  yPosition += 6;
  
  doc.setFont("helvetica", "normal");
  doc.text('Signature:', pageWidth - 5, yPosition, { align: "right" });
  yPosition += 8;
  doc.line(pageWidth - 25, yPosition, pageWidth - 5, yPosition);

  return doc;
};

// Fonction pour imprimer directement sans sauvegarder de PDF
// Dans generateZReport.ts, ajoutez cette fonction
export const printZReportDirect = (options: ZReportProps) => {
  // Créer un iframe caché
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    alert('Erreur lors de la création du document d\'impression');
    return;
  }

  // Générer le PDF et le convertir en URL de données
  const pdf = generateZReport(options);
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Créer un document HTML simple avec le PDF
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rapport Z</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        embed {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <embed src="${pdfUrl}" type="application/pdf">
      <script>
        // Imprimer automatiquement quand le PDF est chargé
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Fermer après impression
            setTimeout(function() {
              window.close();
            }, 1000);
          }, 1000);
        };
      </script>
    </body>
    </html>
  `);
  doc.close();
};

// Fonction pour générer le HTML pour l'impression
const generateZReportHTML = (options: ZReportProps): string => {
  // Calculs des totaux
  const totalProduits = options.produitTotals?.reduce((sum, p) => sum + (p.TotalVente || 0), 0) || 0;
  const totalCategories = options.categorieTotals?.reduce((sum, c) => sum + (c.TotalVente || 0), 0) || 0;
  const totalPayment = options.totalsByPaymentType?.reduce((sum, p) => sum + (p.TotalAmount || 0), 0) || 0;
  const totalTickets = options.ticketRestaurantTotals?.reduce((sum, t) => sum + (t.TotalAmount || 0), 0) || 0;
  const totalRetours = options.TotalRetours || 0;
  const totalRemises = options.remises || 0;
  const totalRevenue = totalPayment + totalTickets - totalRemises - totalRetours;
  const fondCaisse = options.servers?.[options.servers.length - 1]?.FondCaisse || 0;
  const totalCaisse = totalRevenue + fondCaisse;

  const formatDateFrench = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rapport Z - ${options.profile?.Nom || 'Restaurant'}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            width: 80mm;
            margin: 0 auto;
            padding: 4mm;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            line-height: 1.2;
            color: #000;
            background: #fff;
          }
        }
        body {
          width: 80mm;
          margin: 0 auto;
          padding: 4mm;
          font-family: 'Courier New', monospace;
          font-size: 9pt;
          line-height: 1.2;
          color: #000;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 4mm;
        }
        .restaurant-name {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 1mm;
        }
        .address {
          font-size: 8pt;
          margin-bottom: 2mm;
        }
        .title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 2mm;
        }
        .period {
          font-size: 8pt;
          margin-bottom: 1mm;
        }
        .date {
          font-size: 8pt;
          color: #666;
        }
        .divider {
          border: none;
          border-top: 1px solid #000;
          margin: 4mm 0;
        }
        .section-title {
          font-size: 9pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2mm;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2mm;
        }
        th {
          text-align: left;
          padding: 1mm 0;
          border-bottom: 1px solid #000;
          font-weight: bold;
          font-size: 8pt;
        }
        th.right {
          text-align: right;
        }
        td {
          padding: 0.5mm 0;
          font-size: 8pt;
          text-align: left;
        }
        td.right {
          text-align: right;
        }
        .negative {
          color: #d32f2f;
          font-weight: bold;
        }
        .total-row {
          border-top: 1px solid #000;
        }
        .total-label {
          padding: 1mm 0;
          font-weight: bold;
          font-size: 9pt;
        }
        .total-amount {
          font-weight: bold;
          font-size: 9pt;
        }
        .grand-total {
          border-top: 2px solid #000;
          font-weight: bold;
          font-size: 10pt;
        }
        .spacer {
          height: 3mm;
        }
        .signature {
          margin-top: 8mm;
          text-align: right;
          font-size: 8pt;
        }
      </style>
    </head>
    <body>
      <!-- En-tête -->
      <div class="header">
        <div class="restaurant-name">${options.profile?.Nom || 'RESTAURANT'}</div>
        <div class="address">${options.profile?.Adresse || ''}</div>
        <div class="title">RAPPORT Z DE JOUR</div>
        <div class="period">
          Période: ${formatDateFrench(options.dateDebut)} ${options.heureDebut?.substring(0, 5) || '00:00'} 
          → ${formatDateFrench(options.dateFin)} ${options.heureFin?.substring(0, 5) || '23:59'}
        </div>
        <div class="date">${getCurrentDateTime()}</div>
      </div>

      <hr class="divider" />

      <!-- Section Ventes par produit -->
      ${options.produitTotals && options.produitTotals.length > 0 ? `
        <div class="section-title">VENTES PAR PRODUIT</div>
        <table>
          <thead>
            <tr>
              <th>PRODUIT</th>
              <th class="right">QTÉ</th>
              <th class="right">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            ${options.produitTotals.map(p => `
              <tr>
                <td>${p.NomProduit.length > 25 ? p.NomProduit.substring(0, 22) + '...' : p.NomProduit}</td>
                <td class="right">${p.QuantiteTotale > 0 ? p.QuantiteTotale.toFixed(3) : ''}</td>
                <td class="right ${p.TotalVente < 0 ? 'negative' : ''}">${p.TotalVente.toFixed(3)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2" class="total-label">TOTAL PRODUITS</td>
              <td class="right total-amount">${totalProduits.toFixed(3)}</td>
            </tr>
          </tfoot>
        </table>
      ` : ''}

      <div class="spacer"></div>

      <!-- Section Recette par famille -->
      ${options.categorieTotals && options.categorieTotals.length > 0 ? `
        <div class="section-title">RECETTE PAR FAMILLE</div>
        <table>
          <thead>
            <tr>
              <th>FAMILLE</th>
              <th class="right">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            ${options.categorieTotals.map(c => `
              <tr>
                <td>${c.NomCategorie.length > 25 ? c.NomCategorie.substring(0, 22) + '...' : c.NomCategorie}</td>
                <td class="right ${c.TotalVente < 0 ? 'negative' : ''}">${c.TotalVente.toFixed(3)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="total-label">TOTAL FAMILLES</td>
              <td class="right total-amount">${totalCategories.toFixed(3)}</td>
            </tr>
          </tfoot>
        </table>
      ` : ''}

      <div class="spacer"></div>

      <!-- Section Détail des paiements -->
      ${(options.totalsByPaymentType?.length || options.remises || options.TotalRetours) ? `
        <div class="section-title">DÉTAIL DES PAIEMENTS</div>
        <table>
          <tbody>
            ${options.totalsByPaymentType?.map(p => `
              <tr>
                <td>${p.PaymentType}</td>
                <td class="right">${p.TotalAmount.toFixed(3)}</td>
              </tr>
            `).join('')}
            ${options.remises && options.remises > 0 ? `
              <tr>
                <td>REMISES</td>
                <td class="right negative">-${options.remises.toFixed(3)}</td>
              </tr>
            ` : ''}
            ${options.TotalRetours && options.TotalRetours > 0 ? `
              <tr>
                <td>RETOURS</td>
                <td class="right negative">-${options.TotalRetours.toFixed(3)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      ` : ''}

      <div class="spacer"></div>

      <!-- Section Récapitulatif -->
      <div class="section-title">RÉCAPITULATIF</div>
      <table>
        <tbody>
          <tr>
            <td>Fond de caisse</td>
            <td class="right">${fondCaisse.toFixed(3)}</td>
          </tr>
          ${totalRetours > 0 ? `
            <tr>
              <td>Dont retours</td>
              <td class="right negative">-${totalRetours.toFixed(3)}</td>
            </tr>
          ` : ''}
          <tr>
            <td>Recette totale</td>
            <td class="right">${totalRevenue.toFixed(3)}</td>
          </tr>
          <tr class="grand-total">
            <td>TOTAL CAISSE</td>
            <td class="right">${totalCaisse.toFixed(3)}</td>
          </tr>
        </tbody>
      </table>

      <div class="spacer"></div>

      <!-- Section Statistiques -->
      ${(options.NBcommandeP || options.TotalRetours) ? `
        <div class="section-title">STATISTIQUES</div>
        <table>
          <tbody>
            ${options.NBcommandeP && options.NBcommandeP > 0 ? `
              <tr>
                <td>Commandes payées:</td>
                <td class="right">${options.NBcommandeP}</td>
                <td class="right">${options.TotalcommandeP?.toFixed(3) || '0.000'}</td>
              </tr>
            ` : ''}
            ${options.TotalRetours && options.TotalRetours > 0 ? `
              <tr>
                <td>Total retours:</td>
                <td class="right">-</td>
                <td class="right negative">-${options.TotalRetours.toFixed(3)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      ` : ''}

      <div class="spacer"></div>

      <!-- Section Caissiers -->
      ${options.ventesParCaissier && Object.keys(options.ventesParCaissier).length > 0 ? `
        <div class="section-title">VENTES PAR CAISSIER</div>
        <table>
          <tbody>
            ${Object.entries(options.ventesParCaissier).map(([nom, montant]) => `
              <tr>
                <td>${nom}</td>
                <td class="right">${montant.toFixed(3)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="spacer"></div>
      ` : ''}

      <!-- Footer et signature -->
      <div>
        <hr class="divider" />
        <div class="signature">
          <div>Clôturé par: ${options.servers?.[options.servers.length - 1]?.Nom || 'N/A'}</div>
          <div>Signature: ___________________________</div>
        </div>
      </div>
    </body>
    </html>
  `;
};