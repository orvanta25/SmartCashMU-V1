// This file is a copy of rapportPrinterModer.ts, adapted for Rapport X (single caissier)
// Update imports and types to use XReportProps and generateXReport
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { XReportProps } from "./generateXReport";

export const generateXReportPDF = (options: XReportProps) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleString("fr-FR");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RAPPORT X (CAISSIER)", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(14);
  doc.text(options.profile?.Nom || '', pageWidth / 2, 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (options.profile?.Adresse) {
    doc.text(options.profile.Adresse, pageWidth / 2, 24, { align: "center" });
  }
  doc.text(`Date: ${date}`, 10, 32);
  doc.line(10, 35, pageWidth - 10, 35);

  let currentY = 40;

  const addSectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);
    currentY += 8;
  };

  addSectionTitle("VENTE PAR PRODUIT");
  autoTable(doc, {
    startY: currentY,
    head: [["Produit", "Qté", "Total"]],
    body: options.produitTotals?.map((p) => [
      p.NomProduit.slice(0, 30),
      Number(p.QuantiteTotale || 0).toFixed(3),
      Number.isFinite(Number(p.TotalVente)) ? Number(p.TotalVente).toFixed(3) : "0.000",
    ]) || [],
    foot: [[
      "TOTAL GÉNÉRAL",
      "",
      options.produitTotals?.reduce((sum, p) => sum + (Number.isFinite(Number(p.TotalVente)) ? Number(p.TotalVente) : 0), 0).toFixed(3) || '0.000',
    ]],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 30, halign: "right" },
      2: { cellWidth: 50, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  addSectionTitle("RECETTE PAR FAMILLE");
  autoTable(doc, {
    startY: currentY,
    head: [["Famille", "Total"]],
    body: options.categorieTotals?.map((c) => [
      c.NomCategorie,
      Number(c.TotalVente || 0).toFixed(3),
    ]) || [],
    foot: [[
      "TOTAL GÉNÉRAL",
      options.categorieTotals?.reduce((sum, c) => sum + (Number(c.TotalVente) || 0), 0).toFixed(3) || '0.000',
    ]],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  addSectionTitle("DÉTAIL DES PAIEMENTS");
  autoTable(doc, {
    startY: currentY,
    head: [["Type de Paiement", "Montant"]],
    body: [
      ...(options.totalsByPaymentType?.map((p) => [
        p.PaymentType,
        Number(p.TotalAmount || 0).toFixed(3),
      ]) || []),
      ["Remises", `-${Number(options.remises || 0).toFixed(3)}`],
    ],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  addSectionTitle("TICKETS RESTAURANT");
  autoTable(doc, {
    startY: currentY,
    head: [["Type", "Montant"]],
    body: options.ticketRestaurantTotals?.map((t) => [
      t.Type,
      Number(t.TotalAmount || 0).toFixed(3),
    ]) || [],
    foot: [[
      "TOTAL TICKETS",
      options.ticketRestaurantTotals?.reduce((sum, t) => sum + (Number(t.TotalAmount) || 0), 0).toFixed(3) || '0.000',
    ]],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  addSectionTitle("STATISTIQUES DES COMMANDES");
  autoTable(doc, {
    startY: currentY,
    head: [["Description", "Valeur"]],
    body: [
      ["Commandes non payées", options.NBcommandeNp?.toString() || '0'],
      ["Montant non payé", Number(options.TotalCommandeNp || 0).toFixed(3)],
      ["Commandes payées", options.NBcommandeP?.toString() || '0'],
      ["Montant payé", Number(options.TotalcommandeP || 0).toFixed(3)],
      ["Commandes offertes", options.NBcommandeO?.toString() || '0'],
      ["Montant offert", Number(options.TotalcommandeO || 0).toFixed(3)],
    ],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  addSectionTitle("CAISSIER");
  autoTable(doc, {
    startY: currentY,
    head: [["Nom", "Fond Caisse"]],
    body: [[options.serveur?.Nom || 'Inconnu', Number(options.serveur?.FondCaisse || 0).toFixed(3)]],
    styles: {
      fontSize: 10,
      font: "helvetica",
      textColor: [0, 0, 0],
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 100, halign: "left" },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });

  return doc;
}; 