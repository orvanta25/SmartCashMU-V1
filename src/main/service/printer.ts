import { PrismaClient } from '@prisma/client';
import type {
  PrinterModel,
  CreatePrinterDto,
  UpdatePrinterDto,
  PrintTicketRequest,
  PrintTicketResponse,
} from '../model/printer';

import { print } from "pdf-to-printer";
import fs from "fs";
import os from "os";
import path from "path";
import { QRRemiseService } from './qr-remise.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function printToPrinter(
  pdf: Base64URLString, // base64 PDF string
  printerName: string   // printer name from backend
): Promise<PrintTicketResponse> {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `temp_ticket_${Date.now()}.pdf`);

  try {
    
    // Remove data URL prefix if present
    const base64Data = pdf.replace(/^data:application\/pdf;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Save PDF temporarily
    fs.writeFileSync(tempFile, buffer);

    // Print using pdf-to-printer
    await print(tempFile, { printer: printerName });

    console.log(`Printed ticket successfully on printer: ${printerName}`);
    return { status: "success", message: "Ticket printed successfully" };

  } catch (error) {
    console.error("Printing failed:", error);
    return { status: "error", message: String(error) || "Failed to print ticket" };

  } finally {
    // Cleanup temporary file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

export async function createPrinter(
  data: { dto: CreatePrinterDto; userId?: string; entrepriseId: string },
  prisma: PrismaClient
): Promise<{ message: string; printer: PrinterModel }> {
  try {
    const { dto, userId, entrepriseId } = data;

    if (!dto.name || !entrepriseId) {
      throw new Error('Missing required parameters: name or entrepriseId');
    }

    const printer = await prisma.printer.create({
      data: {
        name: dto.name,
        user: userId ? { connect: { id: userId } } : undefined,
        entreprise: { connect: { id: entrepriseId } },
      },
      include: { user: 
        { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    return {
      message: 'Printer created successfully',
      printer:{...printer,
        createdAt:printer.createdAt.toISOString(),
        updatedAt:printer.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('service/printer createPrinter: ', error);
    throw error;
  }
}

export async function getAllPrinters(
  data: { entrepriseId: string; userId: string; userRole: string },
  prisma: PrismaClient
): Promise<PrinterModel[]> {
  try {
    const { entrepriseId, userId, userRole } = data;

    const whereClause = userRole === 'ADMIN' 
      ? { entrepriseId }
      : { entrepriseId, userId };

    const printers =  await prisma.printer.findMany({
      where: whereClause,
      include: { user: { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    if(!printers)throw "no printers found !"

    return printers.map(printer=>(
        {...printer,
        createdAt:printer.createdAt.toISOString(),
        updatedAt:printer.updatedAt.toISOString()
      }
    )) 
  } catch (error) {
    console.error('service/printer getAllPrinters: ', error);
    throw error;
  }
}

export async function getPrinterById(
  data: { id: string; entrepriseId: string },
  prisma: PrismaClient
): Promise<PrinterModel> {
  try {
    const { id, entrepriseId } = data;

    const printer = await prisma.printer.findFirst({
      where: { id, entrepriseId },
      include: { user: { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    if (!printer) {
      throw new Error('Printer not found');
    }

    return {...printer,
        createdAt:printer.createdAt.toISOString(),
        updatedAt:printer.updatedAt.toISOString()
      };
  } catch (error) {
    console.error('service/printer getPrinterById: ', error);
    throw error;
  }
}

export async function updatePrinter(
  data: { id: string; dto: UpdatePrinterDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<{ message: string; printer: PrinterModel }> {
  try {
    const { id, dto, entrepriseId } = data;

    const printer = await prisma.printer.update({
      where: { id, entrepriseId },
      data: {
        name: dto.name,
      },
      include: { user: { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    return {
      message: 'Printer updated successfully',
      printer:{...printer,
        createdAt:printer.createdAt.toISOString(),
        updatedAt:printer.updatedAt.toISOString()
      },
    };
  } catch (error) {
    console.error('service/printer updatePrinter: ', error);
    throw error;
  }
}

export async function deletePrinter(
  data: { id: string; entrepriseId: string },
  prisma: PrismaClient
): Promise<{ message: string }> {
  try {
    const { id, entrepriseId } = data;

    await prisma.printer.delete({
      where: { id, entrepriseId },
    });

    return { message: 'Printer deleted successfully' };
  } catch (error) {
    console.error('service/printer deletePrinter: ', error);
    throw error;
  }
}

// Dans votre service d'impression existant
export async function printTicket(
  data: { request: PrintTicketRequest, entrepriseId: string },
  prisma: PrismaClient
): Promise<PrintTicketResponse> {
  try {
    const { request, entrepriseId } = data;
    const { pdf, venteId, commandeId } = request;

    if (!pdf) {
      throw new Error('PDF manquant');
    }

    // Imprimer d'abord
    const printer = await prisma.printer.findFirst({
      where: { entrepriseId }
    });

    const printerName = printer?.name || "";
    
    if (!printerName) {
      throw new Error("Aucune imprimante configurée");
    }

    const printResult = await printToPrinter(pdf, printerName);

    // Ensuite, générer le QR code si venteId existe
    if (printResult.status === "success" && venteId) {
      try {
        const qrResult = await QRRemiseService.generateTicketAfterVente(venteId);
        
        if (qrResult) {
          console.log('QR code généré pour vente:', venteId, 'Code:', qrResult.code);
          
          // Vous pourriez aussi envoyer un événement au renderer
          // event.sender.send('qr-code-generated', { venteId, ticket: qrResult });
        }
      } catch (qrError) {
        console.warn('Échec génération QR:', qrError);
        // Ne pas échouer l'impression à cause du QR
      }
    }

    return printResult;

  } catch (error) {
    console.error('Erreur impression:', error);
    throw error;
  }
}

// Function to add QR code to PDF using pdf-lib
async function addQRCodeToPDF(
  basePDF: string,
  qrCodeBase64: string,
  message: string
): Promise<string> {
  try {
    // Remove data URL prefix if present
    const pdfData = basePDF.replace(/^data:application\/pdf;base64,/, "");
    const pdfBytes = Buffer.from(pdfData, 'base64');
    
    // Remove data URL prefix from QR code if present
    const cleanQRBase64 = qrCodeBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const qrImageBytes = Buffer.from(cleanQRBase64, 'base64');

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the first page (ticket page)
    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      throw new Error('No pages in PDF');
    }
    
    const page = pages[0];
    const { width, height } = page.getSize();
    
    // Embed the QR code image
    let qrImage;
    try {
      qrImage = await pdfDoc.embedPng(qrImageBytes);
    } catch (pngError) {
      try {
        qrImage = await pdfDoc.embedJpg(qrImageBytes);
      } catch (jpgError) {
        console.error('Failed to embed QR image as PNG or JPG:', pngError, jpgError);
        return basePDF; // Return original PDF if embedding fails
      }
    }
    
    // Calculate position for QR code (bottom of page)
    const qrSize = 100; // QR code size in points
    const margin = 20;
    
    // Draw QR code at bottom left
    page.drawImage(qrImage, {
      x: margin,
      y: margin,
      width: qrSize,
      height: qrSize,
    });
    
    // Draw message text next to QR code
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText(message, {
      x: margin + qrSize + 10,
      y: margin + qrSize / 2,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: width - (margin * 2) - qrSize - 20,
    });
    
    // Add separator line
    page.drawLine({
      start: { x: margin, y: margin + qrSize + 10 },
      end: { x: width - margin, y: margin + qrSize + 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Add promotional text
    page.drawText("Merci de votre visite !", {
      x: margin,
      y: margin + qrSize + 20,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Serialize the PDF to base64
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedBase64 = Buffer.from(modifiedPdfBytes).toString('base64');
    
    return `data:application/pdf;base64,${modifiedBase64}`;
    
  } catch (error) {
    console.error('Error adding QR code to PDF:', error);
    // Return original PDF if modification fails
    return basePDF;
  }
}

// Optional: Function to generate a full ticket with QR (alternative approach)
async function generateFullTicketWithQR(
  commandeId: string,
  qrCodeBase64: string,
  message: string
): Promise<string> {
  // This is a placeholder for a complete ticket regeneration
  // You would implement this based on your ticket generation logic
  throw new Error('generateFullTicketWithQR not implemented');
}