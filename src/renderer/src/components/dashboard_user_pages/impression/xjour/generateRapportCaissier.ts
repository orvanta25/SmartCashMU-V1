import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface RapportCaissierData {
  caissier: {
    id: string;
    nom: string;
    email?: string;
    telephone?: string;
    fondCaisse: number;
  };
  periode: {
    start: string;
    end: string;
    heureStart?: string;
    heureEnd?: string;
  };
  stats: {
    totalVentes: number;
    totalRemises: number;
    totalRetours: number;
    totalNet: number;
    nbCommandes: number;
    nbCommandesPayees: number;
    nbCommandesNonPayees: number;
    moyennePanier: number;
    meilleurJour?: {
      date: string;
      montant: number;
    };
  };
  paiements: {
    especes: number;
    carte: number;
    cheque: number;
    ticketRestaurant: number;
    virement?: number;
    total: number;
  };
  produitsVendus: Array<{
    produitId: string;
    nomProduit: string;
    quantite: number;
    total: number;
  }>;
  ventes: Array<{
    id: string;
    date: string;
    montant: number;
    typePaiement: string;
    numeroTicket?: string;
  }>;
  retours?: Array<{
    id: string;
    date: string;
    montant: number;
    raison?: string;
  }>;
  profileEntreprise: {
    nom: string;
    adresse: string;
    telephone?: string;
    email?: string;
  };
}

export function generateRapportCaissierPDF(data: RapportCaissierData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Styles
  const styles = {
    header1: { fontSize: 16, bold: true, align: 'center' },
    header2: { fontSize: 14, bold: true },
    header3: { fontSize: 12, bold: true },
    normal: { fontSize: 10 },
    small: { fontSize: 8 },
    bold: { fontSize: 10, bold: true }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(num);
  };

  let yPos = 20;

  // En-tête
  doc.setFontSize(styles.header1.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text("RAPPORT X - PAR CAISSIER", pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(styles.normal.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(data.profileEntreprise.nom, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(data.profileEntreprise.adresse, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Informations caissier et période
  doc.setFontSize(styles.header3.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text("CAISSIER", 14, yPos);
  yPos += 7;
  
  doc.setFontSize(styles.normal.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${data.caissier.nom}`, 14, yPos);
  yPos += 5;
  doc.text(`Fond de caisse: ${formatNumber(data.caissier.fondCaisse)}`, 14, yPos);
  yPos += 5;
  doc.text(`Période: ${data.periode.start} - ${data.periode.end}`, 14, yPos);
  yPos += 10;

  // Date de génération
  const now = new Date();
  doc.text(`Généré le: ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 14, yPos);
  yPos += 15;

  // Statistiques principales
  autoTable(doc, {
    startY: yPos,
    head: [['STATISTIQUES', 'VALEUR']],
    body: [
      ['Total Ventes', formatNumber(data.stats.totalVentes)],
      ['Total Remises', `-${formatNumber(data.stats.totalRemises)}`],
      ['Total Retours', `-${formatNumber(data.stats.totalRetours)}`],
      ['Total Net', formatNumber(data.stats.totalNet)],
      ['Nombre Commandes', data.stats.nbCommandes.toString()],
      ['Commandes Payées', data.stats.nbCommandesPayees.toString()],
      ['Moyenne Panier', formatNumber(data.stats.moyennePanier)],
    ],
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Détail des paiements
  doc.setFontSize(styles.header3.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text("DÉTAIL DES PAIEMENTS", 14, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [['TYPE', 'MONTANT', '%']],
    body: [
      ['Espèces', formatNumber(data.paiements.especes), 
        `${((data.paiements.especes / data.paiements.total) * 100).toFixed(1)}%`],
      ['Carte', formatNumber(data.paiements.carte), 
        `${((data.paiements.carte / data.paiements.total) * 100).toFixed(1)}%`],
      ['Chèque', formatNumber(data.paiements.cheque), 
        `${((data.paiements.cheque / data.paiements.total) * 100).toFixed(1)}%`],
      ['Ticket Resto', formatNumber(data.paiements.ticketRestaurant), 
        `${((data.paiements.ticketRestaurant / data.paiements.total) * 100).toFixed(1)}%`],
      ...(data.paiements.virement ? [
        ['Virement', formatNumber(data.paiements.virement), 
          `${((data.paiements.virement / data.paiements.total) * 100).toFixed(1)}%`]
      ] : []),
      ['TOTAL', formatNumber(data.paiements.total), '100%']
    ],
    headStyles: { fillColor: [46, 204, 113], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Produits vendus (top 15)
  if (data.produitsVendus.length > 0) {
    doc.setFontSize(styles.header3.fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text("PRODUITS VENDUS (TOP 15)", 14, yPos);
    yPos += 7;

    const topProduits = data.produitsVendus
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    autoTable(doc, {
      startY: yPos,
      head: [['PRODUIT', 'QUANTITÉ', 'TOTAL']],
      body: topProduits.map(p => [
        p.nomProduit.substring(0, 40),
        p.quantite.toString(),
        formatNumber(p.total)
      ]),
      headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      theme: 'striped',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Ventes récentes (10 dernières)
  if (data.ventes.length > 0) {
    doc.setFontSize(styles.header3.fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text("VENTES RÉCENTES (10 dernières)", 14, yPos);
    yPos += 7;

    const recentVentes = data.ventes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    autoTable(doc, {
      startY: yPos,
      head: [['DATE', 'N° TICKET', 'MONTANT', 'PAIEMENT']],
      body: recentVentes.map(v => [
        new Date(v.date).toLocaleDateString('fr-FR'),
        v.numeroTicket || '-',
        formatNumber(v.montant),
        v.typePaiement
      ]),
      headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      theme: 'striped',
      pageBreak: 'auto',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Calcul de caisse
  doc.setFontSize(styles.header3.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text("CALCUL DE CAISSE", 14, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [['DÉTAIL', 'MONTANT']],
    body: [
      ['Fond de caisse initial', formatNumber(data.caissier.fondCaisse)],
      ['Ventes nettes', formatNumber(data.stats.totalNet)],
      ['Total espèces théorique', formatNumber(data.caissier.fondCaisse + data.paiements.especes)],
      ['Total à remettre', formatNumber(data.paiements.especes)],
    ],
    headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    theme: 'striped',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Pied de page
  doc.setFontSize(styles.small.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text("*** RAPPORT CAISSIER ***", pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Caissier: ${data.caissier.nom} - Période: ${data.periode.start} à ${data.periode.end}`, 
    pageWidth / 2, yPos, { align: 'center' });

  return doc;
}

export function generateRapportCaissierHTML(data: RapportCaissierData): string {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(num);
  };

  const now = new Date();
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport Caissier - ${data.caissier.nom}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          padding: 20px;
          max-width: 210mm;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3498db;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #3498db;
          font-size: 22px;
          margin-bottom: 10px;
        }
        
        .header h2 {
          color: #2c3e50;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .caissier-info {
          background: #e8f4fc;
          border: 1px solid #3498db;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          background: #3498db;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 14px;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th {
          background: #2c3e50;
          color: white;
          text-align: left;
          padding: 10px;
          font-weight: bold;
          font-size: 11px;
        }
        
        td {
          padding: 8px 10px;
          border: 1px solid #ddd;
          font-size: 11px;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .total-row {
          background: #d4edda !important;
          font-weight: bold;
        }
        
        .highlight-row {
          background: #fff3cd !important;
        }
        
        .negative {
          color: #e74c3c;
        }
        
        .positive {
          color: #27ae60;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #7f8c8d;
          border-top: 1px solid #ecf0f1;
          padding-top: 15px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .stat-label {
          color: #7f8c8d;
          font-size: 11px;
        }
        
        .payment-badge {
          display: inline-block;
          background: #ecf0f1;
          padding: 4px 8px;
          border-radius: 3px;
          margin: 2px;
          font-size: 10px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .caissier-photo {
          text-align: center;
          margin: 20px 0;
        }
        
        .signature {
          margin-top: 40px;
          border-top: 1px solid #000;
          width: 200px;
          padding-top: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RAPPORT X - PAR CAISSIER</h1>
        <h2>${data.profileEntreprise.nom}</h2>
        <p>${data.profileEntreprise.adresse}</p>
      </div>
      
      <div class="caissier-info">
        <h3>INFORMATIONS CAISSIER</h3>
        <p><strong>Nom:</strong> ${data.caissier.nom}</p>
        <p><strong>Fond de caisse initial:</strong> ${formatNumber(data.caissier.fondCaisse)}</p>
        <p><strong>Période:</strong> ${data.periode.start} ${data.periode.heureStart || ''} - ${data.periode.end} ${data.periode.heureEnd || ''}</p>
        <p><strong>Généré le:</strong> ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}</p>
      </div>
      
      <!-- Statistiques principales -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Ventes</div>
          <div class="stat-value positive">${formatNumber(data.stats.totalVentes)}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Total Net</div>
          <div class="stat-value positive">${formatNumber(data.stats.totalNet)}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Moyenne Panier</div>
          <div class="stat-value">${formatNumber(data.stats.moyennePanier)}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Commandes</div>
          <div class="stat-value">${data.stats.nbCommandes}</div>
          <div class="stat-label">dont ${data.stats.nbCommandesPayees} payées</div>
        </div>
      </div>
      
      <!-- Détail des paiements -->
      <div class="section">
        <div class="section-title">DÉTAIL DES PAIEMENTS</div>
        <table>
          <thead>
            <tr>
              <th>Type de paiement</th>
              <th>Montant</th>
              <th>Pourcentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Espèces</td>
              <td class="positive">${formatNumber(data.paiements.especes)}</td>
              <td>${((data.paiements.especes / data.paiements.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Carte</td>
              <td class="positive">${formatNumber(data.paiements.carte)}</td>
              <td>${((data.paiements.carte / data.paiements.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Chèque</td>
              <td class="positive">${formatNumber(data.paiements.cheque)}</td>
              <td>${((data.paiements.cheque / data.paiements.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Ticket Restaurant</td>
              <td class="positive">${formatNumber(data.paiements.ticketRestaurant)}</td>
              <td>${((data.paiements.ticketRestaurant / data.paiements.total) * 100).toFixed(1)}%</td>
            </tr>
            ${data.paiements.virement ? `
            <tr>
              <td>Virement</td>
              <td class="positive">${formatNumber(data.paiements.virement)}</td>
              <td>${((data.paiements.virement / data.paiements.total) * 100).toFixed(1)}%</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td><strong class="positive">${formatNumber(data.paiements.total)}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Produits vendus -->
      ${data.produitsVendus.length > 0 ? `
      <div class="section">
        <div class="section-title">PRODUITS VENDUS (TOP 15)</div>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.produitsVendus.slice(0, 15).map(p => `
              <tr>
                <td>${p.nomProduit}</td>
                <td>${p.quantite.toFixed(3)}</td>
                <td class="positive">${formatNumber(p.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${data.produitsVendus.length > 15 ? `
        <p style="text-align: center; color: #7f8c8d; margin-top: 10px;">
          ... et ${data.produitsVendus.length - 15} produits supplémentaires
        </p>
        ` : ''}
      </div>
      ` : ''}
      
      <!-- Ventes récentes -->
      ${data.ventes.length > 0 ? `
      <div class="section">
        <div class="section-title">VENTES RÉCENTES (10 dernières)</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>N° Ticket</th>
              <th>Montant</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            ${data.ventes.slice(0, 10).map(v => `
              <tr>
                <td>${new Date(v.date).toLocaleDateString('fr-FR')}</td>
                <td>${v.numeroTicket || '-'}</td>
                <td class="positive">${formatNumber(v.montant)}</td>
                <td><span class="payment-badge">${v.typePaiement}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${data.ventes.length > 10 ? `
        <p style="text-align: center; color: #7f8c8d; margin-top: 10px;">
          ... et ${data.ventes.length - 10} ventes supplémentaires
        </p>
        ` : ''}
      </div>
      ` : ''}
      
      <!-- Retours -->
      ${data.retours && data.retours.length > 0 ? `
      <div class="section">
        <div class="section-title">RETOURS (${data.retours.length})</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Montant</th>
              <th>Raison</th>
            </tr>
          </thead>
          <tbody>
            ${data.retours.slice(0, 10).map(r => `
              <tr>
                <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td>
                <td class="negative">-${formatNumber(r.montant)}</td>
                <td>${r.raison || 'Non spécifiée'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <!-- Calcul de caisse -->
      <div class="section">
        <div class="section-title">CALCUL DE CAISSE</div>
        <table>
          <thead>
            <tr>
              <th>Détail</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fond de caisse initial</td>
              <td>${formatNumber(data.caissier.fondCaisse)}</td>
            </tr>
            <tr>
              <td>Ventes nettes</td>
              <td class="positive">${formatNumber(data.stats.totalNet)}</td>
            </tr>
            <tr class="highlight-row">
              <td><strong>Total espèces théorique en caisse</strong></td>
              <td><strong>${formatNumber(data.caissier.fondCaisse + data.paiements.especes)}</strong></td>
            </tr>
            <tr class="total-row">
              <td><strong>Total espèces à remettre</strong></td>
              <td><strong>${formatNumber(data.paiements.especes)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Signature -->
      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div class="signature">
          Signature du caissier<br><br>
          ${data.caissier.nom}
        </div>
        
        <div class="signature">
          Signature du responsable<br><br>
          ____________________
        </div>
      </div>
      
      <div class="footer">
        <p>*** RAPPORT CAISSIER - ${data.caissier.nom.toUpperCase()} ***</p>
        <p>Période: ${data.periode.start} à ${data.periode.end} - Généré le ${now.toLocaleDateString('fr-FR')}</p>
        <p>Document confidentiel - Ne pas diffuser</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

export function printRapportCaissier80mm(data: RapportCaissierData) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(num);
  };

  const now = new Date();
  
  const receiptContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Ticket Caissier</title>
    <style>
      @media print {
        @page {
          size: 80mm 297mm;
          margin: 0;
        }
        body {
          width: 80mm;
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          font-size: 9px;
          line-height: 1.2;
        }
      }
      
      body {
        width: 80mm;
        margin: 0 auto;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        line-height: 1.2;
        white-space: pre-line;
      }
      
      .center {
        text-align: center;
      }
      
      .right {
        text-align: right;
      }
      
      .bold {
        font-weight: bold;
      }
      
      .underline {
        border-bottom: 1px dashed #000;
        padding-bottom: 2px;
        margin: 3px 0;
      }
      
      .divider {
        border-top: 1px dashed #000;
        margin: 5px 0;
        padding-top: 2px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      th {
        border-bottom: 1px solid #000;
        padding: 2px 0;
        text-align: left;
      }
      
      td {
        padding: 2px 0;
      }
      
      .total {
        border-top: 2px solid #000;
        font-weight: bold;
        padding-top: 3px;
      }
      
      .caissier-name {
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="center bold">
      ${data.profileEntreprise.nom}<br>
      ${data.profileEntreprise.adresse}
    </div>
    
    <div class="center underline caissier-name">
      RAPPORT CAISSIER<br>
      ${data.caissier.nom}
    </div>
    
    <div class="center">
      ${data.periode.start} - ${data.periode.end}<br>
      Généré: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
    </div>
    
    <div class="divider"></div>
    
    <div class="bold">STATISTIQUES</div>
    <table>
      <tr>
        <td>Ventes:</td>
        <td class="right">${formatNumber(data.stats.totalVentes)}</td>
      </tr>
      <tr>
        <td>Remises:</td>
        <td class="right">-${formatNumber(data.stats.totalRemises)}</td>
      </tr>
      <tr>
        <td>Retours:</td>
        <td class="right">-${formatNumber(data.stats.totalRetours)}</td>
      </tr>
      <tr class="total">
        <td>NET:</td>
        <td class="right">${formatNumber(data.stats.totalNet)}</td>
      </tr>
      <tr>
        <td>Commandes:</td>
        <td class="right">${data.stats.nbCommandes}</td>
      </tr>
      <tr>
        <td>Moy.panier:</td>
        <td class="right">${formatNumber(data.stats.moyennePanier)}</td>
      </tr>
    </table>
    
    <div class="divider"></div>
    
    <div class="bold">PAIEMENTS</div>
    <div>Espèces: ${formatNumber(data.paiements.especes).padStart(12, ' ')}</div>
    <div>Carte: ${formatNumber(data.paiements.carte).padStart(14, ' ')}</div>
    <div>Chèque: ${formatNumber(data.paiements.cheque).padStart(13, ' ')}</div>
    <div>Ticket R: ${formatNumber(data.paiements.ticketRestaurant).padStart(12, ' ')}</div>
    ${data.paiements.virement ? `
    <div>Virement: ${formatNumber(data.paiements.virement).padStart(12, ' ')}</div>
    ` : ''}
    <div class="total">Total: ${formatNumber(data.paiements.total).padStart(15, ' ')}</div>
    
    <div class="divider"></div>
    
    <div class="bold">CALCUL CAISSE</div>
    <table>
      <tr>
        <td>Fond initial:</td>
        <td class="right">${formatNumber(data.caissier.fondCaisse)}</td>
      </tr>
      <tr>
        <td>Ventes espèces:</td>
        <td class="right">${formatNumber(data.paiements.especes)}</td>
      </tr>
      <tr class="total">
        <td>Total théorique:</td>
        <td class="right">${formatNumber(data.caissier.fondCaisse + data.paiements.especes)}</td>
      </tr>
      <tr class="total">
        <td>À remettre:</td>
        <td class="right">${formatNumber(data.paiements.especes)}</td>
      </tr>
    </table>
    
    <div class="divider"></div>
    
    ${data.produitsVendus.length > 0 ? `
    <div class="bold">TOP PRODUITS</div>
    ${data.produitsVendus.slice(0, 3).map(p => `
      <div>
        ${p.nomProduit.substring(0, 20).padEnd(20, '.')} ${p.quantite.toFixed(1).padStart(5, ' ')} x ${formatNumber(p.total / p.quantite).padStart(8, ' ')}
      </div>
    `).join('')}
    <div class="divider"></div>
    ` : ''}
    
    <div class="center">
      *** RAPPORT CAISSIER ***<br>
      Caissier: ${data.caissier.nom}<br>
      Conserver pour vérification
    </div>
    
    <div class="center" style="margin-top: 10px;">
      ----------------------------
    </div>
  </body>
  </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  }
}