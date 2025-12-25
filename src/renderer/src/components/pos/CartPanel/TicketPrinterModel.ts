import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode"; // IMPORT DU QR CODE
import { printTicket, PrintTicketRequest, PrintTicketResponse } from "../../../api/printer";

interface TicketPrinterOptions {
  companyName: string;
  city: string;
  cartItems: Array<{
    designation: string;
    quantity: number;
    priceUnit: number;
    totalPrice: number;
  }>;
  ticketNumber: string;
  total: number;
  paymentMethods: Array<{ method: string; amount: number }>;
  telephone: string;
  qrData?: {
    code: string;
    pourcentage: number;
    dateExpiration: string;
    entrepriseNom: string;
  };
  includeQR?: boolean;
}

export const generatePosTicket = async (options: TicketPrinterOptions) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleString("fr-FR");

  // En-tête du ticket
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(options.companyName, pageWidth / 2, 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(options.city, pageWidth / 2, 12, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TICKET DE CAISSE", pageWidth / 2, 20, { align: "center" });

  // Informations du ticket
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`N°: ${options.ticketNumber}`, 5, 26);
  doc.text(`Date: ${date}`, 5, 32);
  doc.line(5, 35, pageWidth - 5, 35);

  // Tableau des produits
  autoTable(doc, {
    startY: 38,
    head: [["Produit", "Qté", "P.U", "Total"]],
    body: options.cartItems.map((item) => [
      item.designation.slice(0, 20),
      item.quantity,
      item.priceUnit.toFixed(3),
      item.totalPrice.toFixed(3),
    ]),
    styles: {
      fontSize: 9,
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
      0: { cellWidth: 35, halign: "left" },
      1: { cellWidth: 10, halign: "right" },
      2: { cellWidth: 15, halign: "right" },
      3: { cellWidth: 15, halign: "right" },
    },
    margin: { left: 5, right: 5 },
  });

  // Total et méthodes de paiement
  const finalY = (doc as any).lastAutoTable?.finalY || 38;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Total: ${options.total.toFixed(3)}`, pageWidth - 5, finalY + 10, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  let paymentY = finalY + 18;
  options.paymentMethods.forEach((payment) => {
    if (payment.amount > 0) {
      doc.text(`${payment.method}: ${payment.amount.toFixed(3)}`, 5, paymentY);
      paymentY += 6;
    }
  });

  doc.line(5, paymentY + 3, pageWidth - 5, paymentY + 3);
  
  // ========== SECTION QR CODE PROMOTIONNEL AVEC IMAGE ==========
  let currentY = paymentY + 10;
  
  if (options.includeQR && options.qrData) {
    const qr = options.qrData;
    
     doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        `Revenez nous voir : ${qr.pourcentage}% DE REMISE sur votre prochain achat`,
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 7;

    
    // ========== GÉNÉRATION DU VRAI QR CODE ==========
    try {
      // Créer le contenu du QR code
       const qrContent = qr.code;
  
  const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
    width: 150,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });
  
      
      // Taille du QR code en mm (environ 25mm pour un ticket de 80mm)
      const qrCodeSize = 18;
      const qrCodeX = (pageWidth - qrCodeSize) / 2; // Centrer horizontalement
      
      // Ajouter l'image du QR code au PDF
      doc.addImage(qrCodeDataURL, 'PNG', qrCodeX, currentY, qrCodeSize, qrCodeSize);
      currentY += qrCodeSize + 4;
      
    } catch (error) {
      console.error("Erreur génération QR code:", error);
      // Fallback: texte si échec
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Code promotionnel:", pageWidth / 2, currentY, { align: "center" });
      currentY += 5;
      doc.setFont("helvetica", "bold");
      doc.text(qr.code, pageWidth / 2, currentY, { align: "center" });
      currentY += 5;
    }
    
    // Code promotion (toujours affiché)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Code: ${qr.code}`, pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    
    // Date de validité
    const expirationDate = new Date(qr.dateExpiration).toLocaleDateString("fr-FR");
    doc.text(`Valide jusqu'au: ${expirationDate}`, pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    
    // Ligne de séparation après la section promotion
    doc.line(5, currentY, pageWidth - 5, currentY);
    currentY += 8;
  }
  
  // Message de remerciement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Merci pour votre visite !", pageWidth / 2, currentY, { align: "center" });
  currentY += 6;
  doc.text(`Service client : ${options.telephone}`, pageWidth / 2, currentY, { align: "center" });

  return doc;
};

export const printPosTicket = async (ticketPdf: jsPDF): Promise<PrintTicketResponse> => {
  const pdfBlob = ticketPdf.output("blob");
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const base64String = reader.result?.toString().split(",")[1];
        if (!base64String) {
          throw new Error("Erreur lors de la conversion du PDF en Base64");
        }
        const response = await printTicket({ pdf: base64String } as PrintTicketRequest);
        resolve(response);
      } catch (error: any) {
        reject(error.response?.data?.message || "Erreur lors de l'envoi au serveur");
      }
    };
    reader.readAsDataURL(pdfBlob);
  });
};