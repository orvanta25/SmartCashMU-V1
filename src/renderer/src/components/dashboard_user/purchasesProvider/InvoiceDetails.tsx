
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/auth-context";
import { getAchatFournisseurById } from "@renderer/api/achat-fournisseur";
import { getEntreesByAchatFournisseurId } from "@renderer/api/entree";
import type { Entree } from "@renderer/types/achat-entree";
import { useDeviceType } from "@renderer/hooks/useDeviceType";
import { FileText, Loader2, AlertCircle, Receipt, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceDetailsProps {
  invoiceId: string;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
}

function formatNumber(n: number | string | null, digits = 3) {
  if (n === null || n === undefined) return "";
  return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceId }) => {
  const { entreprise } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, isTablet, isIPadMini, isIPadPro, isSUNMITablet, isSurfaceDuo, sunMy } = useDeviceType();
  const [products, setProducts] = useState<Entree[]>([]);

  useEffect(() => {
    if (!entreprise?.id) {
      setError("Utilisateur non authentifié.");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAchatFournisseurById(entreprise.id, invoiceId);
        setInvoice(data);
        const entrees = await getEntreesByAchatFournisseurId(entreprise.id, invoiceId);
        setProducts(entrees);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la facture");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [entreprise, invoiceId]);

  const getFontSizeClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "text-[10px]";
    if (isTablet || isIPadMini) return "text-xs";
    if (isIPadPro || isSUNMITablet) return "text-sm";
    return "text-sm";
  };

  const getPaddingClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "p-1.5";
    if (isTablet || isIPadMini) return "p-3";
    if (isIPadPro || isSUNMITablet) return "p-4";
    return "p-4";
  };

  const getIconSizeClass = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "w-4 h-4";
    if (isTablet || isIPadMini) return "w-5 h-5";
    if (isIPadPro || isSUNMITablet) return "w-6 h-6";
    return "w-6 h-6";
  };

  const getTableTextSize = () => {
    if (isMobile || isSurfaceDuo || sunMy) return "text-[9px]";
    if (isTablet || isIPadMini) return "text-[10px]";
    if (isIPadPro || isSUNMITablet) return "text-xs";
    return "text-xs";
  };

  const handleDownload = async () => {
    const element = document.getElementById("invoice-document");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: isMobile ? 1.5 : 2,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    pdf.save(`facture-${invoice.numeroFacture}.pdf`);
  };

  // Calculate totals
  let totalHT = 0,
    totalTVA = 0,
    totalTTC = 0;

  products.forEach((product) => {
    const montantHT = product.puht * product.quantite;
    const montantTVA = (montantHT * product.tva) / 100;
    const montantTTC = product.prixUnitaireTTC * product.quantite;
    totalHT += montantHT;
    totalTVA += montantTVA;
    totalTTC += montantTTC;
  });

  // Apply remise if it exists
  const remise = invoice?.remise ? Number(invoice.remise) : 0;
  const netAPayer = remise > 0 ? totalTTC * (1 - remise / 100) : totalTTC;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <Loader2 className={`text-purple-400 mx-auto mb-3 animate-spin ${getIconSizeClass()}`} />
          <p className={`text-white text-center ${getFontSizeClass()}`}>Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <AlertCircle className={`text-red-400 mx-auto mb-3 ${getIconSizeClass()}`} />
          <p className={`text-red-300 text-center ${getFontSizeClass()}`}>{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <FileText className={`text-white/40 mx-auto mb-3 ${getIconSizeClass()}`} />
          <p className={`text-white/60 text-center ${getFontSizeClass()}`}>Aucune facture trouvée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-purple-800/10">
      <div className={`space-y-3 ${getPaddingClass()} max-w-7xl mx-auto`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg flex items-center justify-center ${getIconSizeClass()}`}>
              <Receipt className={`text-white ${isMobile || isSurfaceDuo || sunMy ? "w-2 h-2" : "w-3 h-3"}`} />
            </div>
            <div>
              <h1 className={`font-bold text-white ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : isTablet || isIPadMini ? "text-base" : "text-lg"}`}>
                Facture
              </h1>
              <p className={`text-white/60 ${getFontSizeClass()}`}>N° {invoice.numeroFacture}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="p-1.5 bg-gradient-to-r from-purple-800 to-purple-700 hover:from-purple-900 hover:to-purple-800 text-white rounded-lg transition-all duration-200"
          >
            <Download className={`w-3 h-3 ${isMobile || isSurfaceDuo || sunMy ? "w-2.5 h-2.5" : "w-3 h-3"}`} />
          </button>
        </div>

        <div id="invoice-document" className="rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 text-white p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <h2 className={`font-bold ${isMobile || isSurfaceDuo || sunMy ? "text-base" : isTablet || isIPadMini ? "text-lg" : "text-xl"} mb-1.5`}>FACTURE</h2>
                <div className={`space-y-1 ${getFontSizeClass()}`}>
                  <p>Date: {formatDate(invoice.createdAt)}</p>
                  <p>FC N°: {invoice.numeroFacture}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:text-right bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                <p className={`font-medium ${getFontSizeClass()}`}>Fournisseur:</p>
                <p className="font-bold">{invoice.fournisseur || "FOURNISSEUR"}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
            <div className="flex justify-between items-center">
              <div className={`text-gray-600 ${getFontSizeClass()}`}></div>
              <div className={`text-right text-gray-600 ${getFontSizeClass()}`}></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-left font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : ""}`}>
                    Code
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-left font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()}`}>
                    Désignation
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-center font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()}`}>
                    Qté
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-right font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : ""}`}>
                    P.U.H.T
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-center font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : ""}`}>
                    TVA%
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-right font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : ""}`}>
                    P.U TTC
                  </th>
                  <th className={`px-1.5 sm:px-2 py-1.5 sm:py-2 text-right font-bold text-gray-700 uppercase tracking-wider ${getTableTextSize()}`}>
                    Mont.TTC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-3 sm:px-4 py-6 text-center text-gray-500 ${getTableTextSize()}`}>
                      Aucun produit dans cette facture
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    // const montantHT = product.puht * product.quantite;
                    // const montantTVA = (montantHT * product.tva) / 100;
                    const montantTTC = product.prixUnitaireTTC * product.quantite;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 flex flex-col sm:table-row">
                        <td className={`px-1.5 sm:px-2 py-1.5 text-gray-900 border-r border-gray-200 font-mono ${getTableTextSize()} ${isMobile ? "flex justify-between sm:table-cell" : "table-cell"}`}>
                          {isMobile && <span className="font-bold">Code:</span>} {product.codeBarre}
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-gray-900 border-r border-gray-200 ${getTableTextSize()} ${isMobile ? "flex justify-between sm:table-cell" : "table-cell"}`}>
                          <div className="font-medium">{isMobile && <span className="font-bold">Désignation:</span>} {product.designation}</div>
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-center text-gray-900 border-r border-gray-200 ${getTableTextSize()} ${isMobile ? "flex justify-between sm:table-cell" : "table-cell"}`}>
                          {isMobile && <span className="font-bold">Qté:</span>} {formatNumber(product.quantite, 0)}
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-right text-gray-900 border-r border-gray-200 font-mono ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : "table-cell"}`}>
                          {formatNumber(product.puht, 3)}
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-center text-gray-900 border-r border-gray-200 ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : "table-cell"}`}>
                          {formatNumber(product.tva, 2)}
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-right text-gray-900 border-r border-gray-200 font-mono ${getTableTextSize()} ${isMobile ? "hidden sm:table-cell" : "table-cell"}`}>
                          {formatNumber(product.prixUnitaireTTC, 3)}
                        </td>
                        <td className={`px-1.5 sm:px-2 py-1.5 text-right text-gray-900 font-mono font-medium ${getTableTextSize()} ${isMobile ? "flex justify-between sm:table-cell" : "table-cell"}`}>
                          {isMobile && <span className="font-bold">Mont.TTC:</span>} {formatNumber(montantTTC, 3)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4">
            <div className={`grid grid-cols-1 ${isTablet || isIPadMini || isIPadPro || isSUNMITablet ? "md:grid-cols-2" : ""} gap-3 sm:gap-4`}>
              <div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-200">
                    <h4 className={`font-bold text-gray-700 ${getFontSizeClass()}`}>T.V.A</h4>
                  </div>
                  <div className="p-3">
                    <div className={`grid grid-cols-3 gap-3 ${getFontSizeClass()}`}>
                      <div>
                        <div className="font-medium text-gray-600 mb-0.5">Base</div>
                        <div className="text-gray-900">{formatNumber(totalHT, 3)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 mb-0.5">Taux</div>
                        <div className="text-gray-900">19%</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 mb-0.5">Montant</div>
                        <div className="text-gray-900">{formatNumber(totalTVA, 3)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className={`space-y-1.5 ${getFontSizeClass()}`}>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qté:</span>
                      <span className="font-medium text-gray-900">{products.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className={`space-y-2 ${getFontSizeClass()}`}>
                    <div className="flex justify-between pb-1.5 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Total H.T Net:</span>
                      <span className="font-bold text-gray-900">{formatNumber(totalHT, 3)} DT</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Total TVA:</span>
                      <span className="font-bold text-gray-900">{formatNumber(totalTVA, 3)} DT</span>
                    </div>
                    {remise > 0 && (
                      <div className="flex justify-between pb-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Remise:</span>
                        <span className="font-bold text-gray-900">{formatNumber(remise, 2)} %</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5">
                      <span className={`font-bold text-purple-800 ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>Net à Payer:</span>
                      <span className={`font-bold text-purple-800 ${isMobile || isSurfaceDuo || sunMy ? "text-sm" : "text-base"}`}>{formatNumber(netAPayer, 3)} DT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;