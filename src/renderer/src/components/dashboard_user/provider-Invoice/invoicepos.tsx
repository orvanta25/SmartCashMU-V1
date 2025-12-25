//orvanta-frontend\components\dashboard_user\provider-Invoice\invoicepos.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Download, Printer } from "lucide-react";
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import jsPDF from "jspdf";
import { getNextFactureNum, FactureType, createFacture } from "@renderer/api/facture";
import { getMyFacture } from "@renderer/api/my-facture";
import { getProductById } from "@renderer/api/produit";
import Decimal from "decimal.js";
import html2canvas from "html2canvas-pro"
const API_URL=""

type InvoiceItem = {
  barcode: string;
  description: string;
  unitPrice: number | string;
  quantity: number | string;
  tva: number | string;
  remise: number | string;
};

interface InvoiceProps {
  items?: InvoiceItem[];
  title?: string;
  entrepriseId: string;
  documentType: FactureType;
}

export default function Invoice({ items: itemsProp, title, entrepriseId, documentType }: InvoiceProps) {
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet } = useDeviceType();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dateEmission] = useState(new Date().toISOString().split("T")[0]);
  const [dateEcheance, setDateEcheance] = useState("");
  const [myFacture, setMyFacture] = useState<{
    denomination: string;
    matriculeFiscale: string;
    banque: string;
    rib: string;
    logo?: string;
    adresses: string[];
    emails: string[];
    telephones: string[];
    mobiles: string[];
  } | null>(null);
  const [recipient, setRecipient] = useState({
    denominationClient: "",
    matriculeFiscaleClient: "",
    adresseClient: "",
    clientTelephone: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [timbreFiscal, setTimbreFiscal] = useState<string>("");
  const [remise, setRemise] = useState<string>("");
  const [showTimbreFiscal, setShowTimbreFiscal] = useState<boolean>(documentType === FactureType.FACTURE);
  const [showRemise, setShowRemise] = useState<boolean>(false);

  // Color customization states
  const [rowColor, setRowColor] = useState("#f8fafc");
  const [colColor, setColColor] = useState("#1e293b");
  const [headerFromColor, setHeaderFromColor] = useState("#0f172a");
  const [headerViaColor, setHeaderViaColor] = useState("#1e293b");
  const [headerToColor, setHeaderToColor] = useState("#0f172a");

  const colorThemes = [
    {
      name: "Blue",
      headerFrom: "#2563eb",
      headerVia: "#3b82f6",
      headerTo: "#2563eb",
      row: "#eff6ff",
      col: "#1e40af",
    },
    {
      name: "Green",
      headerFrom: "#16a34a",
      headerVia: "#22d3ee",
      headerTo: "#16a34a",
      row: "#f0fdf4",
      col: "#166534",
    },
    {
      name: "Purple",
      headerFrom: "#7c3aed",
      headerVia: "#a78bfa",
      headerTo: "#7c3aed",
      row: "#f5f3ff",
      col: "#6d28d9",
    },
    {
      name: "Orange",
      headerFrom: "#f59e42",
      headerVia: "#fbbf24",
      headerTo: "#f59e42",
      row: "#fff7ed",
      col: "#c2410c",
    },
    {
      name: "Gray",
      headerFrom: "#6b7280",
      headerVia: "#9ca3af",
      headerTo: "#6b7280",
      row: "#f3f4f6",
      col: "#374151",
    },
  ];

  const handleThemeChange = (theme: typeof colorThemes[0]) => {
    setHeaderFromColor(theme.headerFrom);
    setHeaderViaColor(theme.headerVia);
    setHeaderToColor(theme.headerTo);
    setRowColor(theme.row);
    setColColor(theme.col);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const invoiceClone = invoiceRef.current.cloneNode(true) as HTMLElement;
      const noPrintElements = invoiceClone.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.remove());

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.4';

      tempContainer.appendChild(invoiceClone);
      document.body.appendChild(tempContainer);

      
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight,
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${title ? title.toLowerCase().replace(/\s+/g, '-') : 'facture'}-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = async () => {
    // Recalculate totals to ensure consistency with displayed values
    const calculatedTotalHT = items.reduce(
      (sum, item) => {
        const puht = new Decimal(item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
        const quantity = new Decimal(item.quantity === "" ? 0 : Number(item.quantity) || 0);
        const remise = new Decimal(item.remise === "" ? 0 : Number(item.remise) || 0);
        return sum.add(puht.mul(quantity).mul(Decimal.sub(1, remise.div(100)))).toDecimalPlaces(3);
      },
      new Decimal(0),
    ).toNumber();

    const calculatedTvaAmount = items.reduce(
      (sum, item) => {
        const puht = new Decimal(item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
        const quantity = new Decimal(item.quantity === "" ? 0 : Number(item.quantity) || 0);
        const tvaRate = new Decimal(item.tva === "" ? 0 : Number(item.tva) || 0);
        const remise = new Decimal(item.remise === "" ? 0 : Number(item.remise) || 0);
        const lineHT = puht.mul(quantity).mul(Decimal.sub(1, remise.div(100))).toDecimalPlaces(3);
        return sum.add(lineHT.mul(tvaRate.div(100))).toDecimalPlaces(3);
      },
      new Decimal(0),
    ).toNumber();

    const remiseAmount = new Decimal(calculatedTotalHT + calculatedTvaAmount)
      .mul(new Decimal(remise === "" ? 0 : Number(remise) || 0).div(100))
      .toDecimalPlaces(3)
      .toNumber();
    const subtotal = new Decimal(calculatedTotalHT + calculatedTvaAmount)
      .sub(remiseAmount)
      .toDecimalPlaces(3)
      .toNumber();
    const timbreFiscalAmount = timbreFiscal === "" ? 0 : Number(timbreFiscal) || 0;
    const calculatedTotalTTC = new Decimal(subtotal)
      .add(timbreFiscalAmount)
      .toDecimalPlaces(3)
      .toNumber();

    const factureData = {
      type: documentType,
      num: invoiceNumber,
      denominationClient: recipient.denominationClient,
      matriculeFiscaleClient: recipient.matriculeFiscaleClient || undefined,
      adresseClient: recipient.adresseClient,
      clientTelephone: recipient.clientTelephone || undefined,
      dateEmission,
      dateEcheance,
      totalHT: calculatedTotalHT,
      totalTVA: calculatedTvaAmount,
      timbreFiscal: timbreFiscal === "" ? undefined : Number(timbreFiscal),
      remise: remise === "" ? undefined : Number(remise),
      totalNet: calculatedTotalTTC,
      denomination: myFacture?.denomination || "",
      matriculeFiscale: myFacture?.matriculeFiscale || "",
      banque: myFacture?.banque || "",
      rib: myFacture?.rib || "",
      logo: myFacture?.logo || undefined,
      ventes: items.map(item => ({
        codeBarre: item.barcode,
        quantite: Number(item.quantity) || 0,
      })),
    };

    try {
      await createFacture(entrepriseId, factureData);
      alert("Facture créée avec succès !");
    } catch (error: any) {
      console.error("Error confirming facture:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la confirmation de la facture.";
      alert(`Erreur : ${errorMessage}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch next facture number
        const nextNum = await getNextFactureNum(documentType);
        setInvoiceNumber(nextNum.num);

        // Fetch MyFacture data (single element)
        const myFactureData = await getMyFacture(entrepriseId);
        if (myFactureData) {
          setMyFacture({
            denomination: myFactureData.denomination,
            matriculeFiscale: myFactureData.matriculeFiscale,
            banque: myFactureData.banque,
            rib: myFactureData.rib,
            logo: myFactureData.logo,
            adresses: myFactureData.adresses.map(a => a.adresse),
            emails: myFactureData.emails.map(e => e.email),
            telephones: myFactureData.telephones.map(t => t.numTel),
            mobiles: myFactureData.mobiles.map(m => m.numMobile),
          });
        }

        // Fetch product details for items
        const updatedItems = await Promise.all(
          itemsProp?.map(async (item) => {
            const product = await getProductById(entrepriseId, item.barcode);
            return {
              barcode: product.codeBarre,
              description: product.designation,
              unitPrice: product.puht,
              quantity: item.quantity,
              tva: product.tva || 0,
              remise: product.remise || 0,
            };
          }) || []
        );
        setItems(updatedItems);

        // Set default due date (30 days from emission)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        setDateEcheance(defaultDueDate.toISOString().split("T")[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [entrepriseId, documentType, itemsProp]);

  // Calculations for display
  const totalHT = items.reduce(
    (sum, item) => {
      const puht = new Decimal(item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
      const quantity = new Decimal(item.quantity === "" ? 0 : Number(item.quantity) || 0);
      const remise = new Decimal(item.remise === "" ? 0 : Number(item.remise) || 0);
      return sum.add(puht.mul(quantity).mul(Decimal.sub(1, remise.div(100)))).toDecimalPlaces(3);
    },
    new Decimal(0),
  ).toNumber();

  const tvaAmount = items.reduce(
    (sum, item) => {
      const puht = new Decimal(item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
      const quantity = new Decimal(item.quantity === "" ? 0 : Number(item.quantity) || 0);
      const tvaRate = new Decimal(item.tva === "" ? 0 : Number(item.tva) || 0);
      const remise = new Decimal(item.remise === "" ? 0 : Number(item.remise) || 0);
      const lineHT = puht.mul(quantity).mul(Decimal.sub(1, remise.div(100))).toDecimalPlaces(3);
      return sum.add(lineHT.mul(tvaRate.div(100))).toDecimalPlaces(3);
    },
    new Decimal(0),
  ).toNumber();

  const remiseAmount = new Decimal(totalHT + tvaAmount).mul(new Decimal(remise === "" ? 0 : Number(remise) || 0).div(100)).toDecimalPlaces(3).toNumber();
  const subtotal = new Decimal(totalHT + tvaAmount).sub(remiseAmount).toDecimalPlaces(3).toNumber();
  const timbreFiscalAmount = timbreFiscal === "" ? 0 : Number(timbreFiscal) || 0;
  const totalTTC = new Decimal(subtotal).add(timbreFiscalAmount).toDecimalPlaces(3).toNumber();

  // const logoStyle = isMobile
  //   ? "absolute top-2 left-2 w-12 h-12"
  //   : isTablet || isIPadMini
  //   ? "absolute top-4 left-4 w-16 h-16"
  //   : "absolute top-6 left-6 w-20 h-20";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <style >{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-inside: avoid;
          }
          .mobile-hidden {
            display: table-cell !important;
          }
        }
        @media (max-width: 540px) {
          .mobile-hidden {
            display: none;
          }
          .mobile-shrink {
            width: 50px !important;
            min-width: 50px !important;
          }
          table {
            font-size: 10px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 6px 4px !important;
            word-break: break-word;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        @media (min-width: 541px) and (max-width: 1024px) {
          table {
            font-size: 12px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 8px 6px !important;
          }
          .mobile-hidden {
            display: table-cell;
          }
          .mobile-shrink {
            width: 60px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          table {
            font-size: 14px;
            table-layout: fixed;
            width: 100%;
          }
          th,
          td {
            padding: 10px 8px !important;
          }
          .table-container {
            overflow-x: hidden;
          }
        }
      `}</style>

      <div className="no-print mb-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 justify-center">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  aria-label={`${theme.name} color theme`}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center shadow transition-all duration-200 ${
                    headerFromColor === theme.headerFrom &&
                    headerViaColor === theme.headerVia &&
                    headerToColor === theme.headerTo
                      ? "ring-3 ring-blue-400 border-blue-400"
                      : "border-slate-200 hover:ring-2 hover:ring-blue-200"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.headerFrom}, ${theme.headerVia}, ${theme.headerTo})`,
                  }}
                >
                  <div className="w-6 h-1.5 rounded mb-1" style={{ background: theme.row }} />
                  <div className="w-6 h-1.5 rounded" style={{ background: theme.col }} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <button
                type="button"
                onClick={generatePDF}
                className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Download className="h-3 w-3 mr-1" />
                Télécharger PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Printer className="h-3 w-3 mr-1" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={invoiceRef} className="invoice-container max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <div
            className="relative text-white p-4 sm:p-6 md:p-8"
            style={{
              background: `linear-gradient(to right, ${headerFromColor}, ${headerViaColor}, ${headerToColor})`,
            }}
          >
            {myFacture?.logo && (
              <div className="flex items-center mb-2">
                <img
                  src={`${API_URL}${myFacture.logo}`}
                  alt="Logo"
                  className="object-contain bg-white rounded-lg p-1 shadow-md w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mr-2"
                  style={{ maxHeight: '60px', maxWidth: '60px' }}
                />
              </div>
            )}
            <div className="text-right">
              <h1 className="font-bold tracking-wider mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl">
                {title ? title.toUpperCase() : 'FACTURE'}
              </h1>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid gap-3 mb-6 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Numéro de facture
                </label>
                <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{invoiceNumber}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Date d'émission
                </label>
                <input
                  type="text"
                  value={dateEmission}
                  readOnly
                  className="w-full font-semibold border-0 bg-transparent p-0 text-slate-800 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className="w-full font-semibold border-0 bg-transparent p-0 focus:outline-none focus:ring-0 text-slate-800 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <div className={`space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200 ${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-4'}`}>
                <h3 className={`font-bold text-slate-800 border-b-2 border-blue-600 pb-2 flex items-center ${isMobile ? 'text-sm' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-base' : 'text-base sm:text-lg'}`}>
                  <div className={`bg-blue-600 rounded-full mr-2 ${isMobile ? 'w-1.5 h-1.5' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'w-2 h-2' : 'w-2 h-2'}`}></div>
                  ÉMETTEUR
                </h3>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Dénomination: <span className="font-semibold text-slate-800">{myFacture?.denomination || 'N/A'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Matricule Fiscale: <span className="font-semibold text-slate-800">{myFacture?.matriculeFiscale || 'N/A'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Adresse: <span className="font-semibold text-slate-800">{myFacture?.adresses[0] || 'N/A'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Téléphone: <span className="font-semibold text-slate-800">{myFacture?.telephones[0] || myFacture?.mobiles[0] || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className={`space-y-3 p-4 bg-green-50 rounded-lg border border-green-200 ${isMobile ? 'p-3' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'p-4' : 'p-4'}`}>
                <h3 className={`font-bold text-slate-800 border-b-2 border-green-600 pb-2 flex items-center ${isMobile ? 'text-sm' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-base' : 'text-base sm:text-lg'}`}>
                  <div className={`bg-green-600 rounded-full mr-2 ${isMobile ? 'w-1.5 h-1.5' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'w-2 h-2' : 'w-2 h-2'}`}></div>
                  DESTINATAIRE
                </h3>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Dénomination: <span className="font-semibold text-slate-800">
                      <input
                        type="text"
                        value={recipient.denominationClient}
                        onChange={(e) => setRecipient({ ...recipient, denominationClient: e.target.value })}
                        className={`w-full border-0 bg-transparent px-0 py-1 focus:outline-none text-slate-800 font-semibold ${isMobile ? 'text-xs' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-sm' : 'text-sm'}`}
                        placeholder="Dénomination"
                      />
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Matricule Fiscale: <span className="font-semibold text-slate-800">
                      <input
                        type="text"
                        value={recipient.matriculeFiscaleClient}
                        onChange={(e) => setRecipient({ ...recipient, matriculeFiscaleClient: e.target.value })}
                        className={`w-full border-0 bg-transparent px-0 py-1 focus:outline-none text-slate-800 font-medium ${isMobile ? 'text-xs' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-sm' : 'text-sm'}`}
                        placeholder="Matricule Fiscale"
                      />
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Adresse: <span className="font-semibold text-slate-800">
                      <input
                        type="text"
                        value={recipient.adresseClient}
                        onChange={(e) => setRecipient({ ...recipient, adresseClient: e.target.value })}
                        className={`w-full border-0 bg-transparent px-0 py-1 focus:outline-none text-slate-800 font-medium ${isMobile ? 'text-xs' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-sm' : 'text-sm'}`}
                        placeholder="Adresse"
                      />
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Téléphone: <span className="font-semibold text-slate-800">
                      <input
                        type="text"
                        value={recipient.clientTelephone}
                        onChange={(e) => setRecipient({ ...recipient, clientTelephone: e.target.value })}
                        className={`w-full border-0 bg-transparent px-0 py-1 focus:outline-none text-slate-800 font-medium ${isMobile ? 'text-xs' : isTablet || isIPadMini || isIPadPro || isSUNMITablet ? 'text-sm' : 'text-sm'}`}
                        placeholder="Téléphone"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 print-break">
              <div className="table-container rounded-lg border border-slate-200 shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: colColor }}>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Réference</th>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Designation</th>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.HT</th>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">TVA (%)</th>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">P.U.TTC</th>
                      <th className="text-left py-2 px-2 font-bold text-white mobile-shrink text-xs sm:text-sm">Qté</th>
                      <th className="text-left py-2 px-2 font-bold text-white text-xs sm:text-sm">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const puht = new Decimal(item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
                      const tvaRate = new Decimal(item.tva === "" ? 0 : Number(item.tva) || 0);
                      const remise = new Decimal(item.remise === "" ? 0 : Number(item.remise) || 0);
                      const puTTC = puht.mul(Decimal.sub(1, remise.div(100))).mul(Decimal.add(1, tvaRate.div(100))).toDecimalPlaces(3).toNumber();
                      const total = puht.mul(item.quantity === "" ? 0 : Number(item.quantity) || 0).mul(Decimal.sub(1, remise.div(100))).toDecimalPlaces(3).toNumber();
                      return (
                        <tr
                          key={idx}
                          style={{ backgroundColor: idx % 2 === 0 ? rowColor : "white" }}
                          className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2 px-2 mobile-hidden text-xs sm:text-sm font-semibold text-slate-800">{item.barcode}</td>
                          <td className="py-2 px-2 text-xs sm:text-sm font-semibold text-slate-800" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {item.description}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.unitPrice).toFixed(3)}</td>
                          <td className="py-2 px-2 mobile-hidden font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.tva).toFixed(2)}</td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-700 text-xs sm:text-sm">{puTTC.toFixed(3)}</td>
                          <td className="py-2 px-2 mobile-shrink font-mono font-bold text-slate-700 text-xs sm:text-sm">{Number(item.quantity).toFixed(3)}</td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-900 text-xs sm:text-sm">{total.toFixed(3)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 border-b-2 border-orange-600 pb-2 flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                  MODALITÉS DE RÈGLEMENT
                </h3>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Par virement bancaire :
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    Banque: <span className="font-semibold text-slate-800">{myFacture?.banque || 'N/A'}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">
                    RIB: <span className="font-semibold text-slate-800">{myFacture?.rib || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-orange-200">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 border-b-2 border-purple-600 pb-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  RÉCAPITULATIF
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">Total HT :</span>
                    <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{totalHT.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">TVA :</span>
                    <span className="font-mono font-bold text-slate-800 text-base sm:text-lg">{tvaAmount.toFixed(3)}</span>
                  </div>
                  {showTimbreFiscal && (
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-slate-700 text-xs sm:text-sm">Timbre fiscal :</span>
                      <input
                        type="number"
                        value={timbreFiscal}
                        onChange={(e) => setTimbreFiscal(e.target.value)}
                        className="h-6 sm:h-7 border border-slate-300 rounded-lg px-2 text-xs font-mono bg-white shadow-sm w-12 sm:w-14 text-black"
                        placeholder="0"
                        min="0"
                        step="0.001"
                      />
                    </div>
                  )}
                  {!showTimbreFiscal && (
                    <div className="flex justify-end py-1">
                      <button
                        onClick={() => setShowTimbreFiscal(true)}
                        className="text-purple-600 hover:text-purple-800 text-xs font-medium hover:underline"
                      >
                        + Ajouter le timbre fiscal
                      </button>
                    </div>
                  )}
                  {showRemise && (
                    <div className="flex justify-between items-center py-1">
                      <span className="font-semibold text-slate-700 text-xs sm:text-sm">Remise (%) :</span>
                      <input
                        type="number"
                        value={remise}
                        onChange={(e) => setRemise(e.target.value)}
                        className="h-6 sm:h-7 border border-slate-300 rounded-lg px-2 text-xs font-mono bg-white shadow-sm w-12 sm:w-14 text-black"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  )}
                  {!showRemise && (
                    <div className="flex justify-end py-1">
                      <button
                        onClick={() => setShowRemise(true)}
                        className="text-purple-600 hover:text-purple-800 text-xs font-medium hover:underline"
                      >
                        + Ajouter une remise
                      </button>
                    </div>
                  )}
                  <div className="h-px bg-slate-300 my-2"></div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 rounded-lg shadow-md">
                    <span className="font-bold text-base sm:text-lg">TOTAL TTC :</span>
                    <span className="font-mono font-bold text-xl sm:text-2xl">{totalTTC.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 border-t-2 border-slate-200 pt-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-yellow-800 border-b-2 border-yellow-600 pb-2 flex items-center">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                  INFORMATIONS DE CONTACT
                </h3>
                <div className="space-y-2">
                  {myFacture?.adresses.map((adresse, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
                      Adresse: <span className="font-semibold text-slate-800">{adresse}</span>
                    </div>
                  ))}
                  {myFacture?.telephones.map((tel, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
                      Téléphone: <span className="font-semibold text-slate-800">{tel}</span>
                    </div>
                  ))}
                  {myFacture?.mobiles.map((mobile, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
                      Mobile: <span className="font-semibold text-slate-800">{mobile}</span>
                    </div>
                  ))}
                  {myFacture?.emails.map((email, index) => (
                    <div key={index} className="text-xs sm:text-sm text-slate-600 font-medium">
                      Email: <span className="font-semibold text-slate-800">{email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 mt-12 pt-6 border-t-2 border-slate-200 grid-cols-1 sm:grid-cols-2">
                <div className="text-center space-y-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">Signature du client</div>
                  <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
                    <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Signature</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Bon pour accord</div>
                </div>
                <div className="text-center space-y-4">
                  <div className="font-bold text-slate-800 text-sm sm:text-base">Signature & cachet de l'entreprise</div>
                  <div className="h-20 border-b-2 border-slate-400 mx-3 sm:mx-6 relative">
                    <div className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 text-center pb-1">Cachet et signature</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Cachet et signature</div>
                </div>
              </div>
            </div>

            <div className="no-print mt-4">
              <button
                onClick={handleConfirm}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}