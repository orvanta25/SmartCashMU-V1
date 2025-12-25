"use client";
import { useState } from "react";
import { CreditCard, Ticket, DollarSign } from "lucide-react";
import { FactureType } from "../../../api/facture";
// import { getProductById, getProductByBarcode } from "../../../api/produit";
// import { getAllMyFactures } from "../../../api/my-facture";
// import { getAllBalanceConfigs } from "../../../api/balance";
import { CartItem } from "../../../types/product";
// import Invoice from "../../dashboard_user/provider-Invoice/invoicepos";

interface OrderFooterProps {
  cartItems: CartItem[];
  entrepriseId: string;
  clearCart: () => void;
  companyName: string;
  city: string;
  telephone: string;
}

export default function OrderFooter({
  cartItems,
}: OrderFooterProps) {
  const [isProcessing, _setIsProcessing] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBonCommandeInvoiceModal, setShowBonCommandeInvoiceModal] = useState(false);
  const [showDevisInvoiceModal, setShowDevisInvoiceModal] = useState(false);
  const [_selectedDocumentType, setSelectedDocumentType] = useState<FactureType | null>(null);

  const formatNumber = (num: number): string => num.toFixed(3);

  const calculateTotal = (): number =>
    parseFloat(cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(3));

  // const prepareProductsData = async () => {
  //   if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
  //     throw new Error("Le panier est vide ou invalide");
  //   }

  //   if (cartItems.some((item) => Array.isArray(item))) {
  //     console.error("Cart items contains nested arrays:", cartItems);
  //     throw new Error("Les articles du panier contiennent des tableaux imbriqués");
  //   }

  //   const ventes: { codeBarre: string; quantite: number }[] = [];
  //   const balanceConfigs = await getAllBalanceConfigs(entrepriseId);

  //   for (const item of cartItems) {
  //     if (!item || typeof item !== "object" || !item.id || !item.quantity || !item.designation) {
  //       console.error("Invalid cart item:", item);
  //       throw new Error("Article du panier invalide");
  //     }

  //     if (item.id.startsWith("temp-")) {
  //       const barcode = item.designation;
  //       const config = balanceConfigs.find((c) => barcode.startsWith(c.balanceCode));
  //       if (!config) throw new Error("Configuration balance non trouvée");

  //       const productCode = barcode.substring(
  //         config.productCodeStart - 1,
  //         config.productCodeStart - 1 + config.productCodeLength
  //       );
  //       const product = await getProductByBarcode(entrepriseId, productCode);
  //       if (!product) throw new Error(`Produit non trouvé pour le code-barres: ${productCode}`);

  //       ventes.push({
  //         codeBarre: product.codeBarre,
  //         quantite: parseFloat(item.quantity.toFixed(3)),
  //       });
  //     } else {
  //       const product = await getProductById(entrepriseId, item.id);
  //       if (!product) throw new Error(`Produit non trouvé pour l'ID: ${item.id}`);

  //       ventes.push({
  //         codeBarre: product.codeBarre,
  //         quantite: parseFloat(item.quantity.toFixed(3)),
  //       });
  //     }
  //   }

  //   return ventes;
  // };

  // const handleConfirmFacture = async (factureData: {
  //   denominationClient: string;
  //   matriculeFiscaleClient?: string;
  //   adresseClient: string;
  //   dateEmission: string;
  //   dateEcheance: string;
  // }) => {
  //   if (cartItems.length === 0) {
  //     toast.error("Le panier est vide");
  //     return;
  //   }

  //   setIsProcessing(true);
  //   try {
  //     const ventes = await prepareProductsData();
  //     const totalHT = parseFloat(cartItems.reduce((sum, item) => sum + item.quantity * item.priceUnit / (1 + (item.tva || 0) / 100), 0).toFixed(3));
  //     const totalTVA = parseFloat(cartItems.reduce((sum, item) => sum + (item.quantity * item.priceUnit * (item.tva || 0) / 100) / (1 + (item.tva || 0) / 100), 0).toFixed(3));
  //     const totalNet = totalHT + totalTVA;

  //     const myFactures = await getAllMyFactures(entrepriseId);
  //     const myFacture = myFactures[0]; // Use the first MyFacture
  //     if (!myFacture) throw new Error("Aucune information de facture disponible");

  //     const nextNum = await getNextFactureNum(selectedDocumentType!, factureData.dateEmission);

  //     const paymentData = {
  //       type: selectedDocumentType!,
  //       num: nextNum.num,
  //       dateEmission: factureData.dateEmission,
  //       dateEcheance: factureData.dateEcheance,
  //       denominationClient: factureData.denominationClient,
  //       matriculeFiscaleClient: factureData.matriculeFiscaleClient,
  //       adresseClient: factureData.adresseClient,
  //       totalHT,
  //       totalTVA,
  //       totalNet,
  //       denomination: myFacture.denomination,
  //       matriculeFiscale: myFacture.matriculeFiscale,
  //       banque: myFacture.banque,
  //       rib: myFacture.rib,
  //       logo: myFacture.logo,
  //       ventes,
  //     };

  //     const response = await createFacture(entrepriseId, paymentData);
  //     const documentTitle = selectedDocumentType === FactureType.FACTURE ? "Facture" : selectedDocumentType === FactureType.BDC ? "Bon de Commande" : "Devis";

  //     const ticketDoc = generatePosTicket({
  //       companyName,
  //       city,
  //       cartItems,
  //       ticketNumber: response.facture.num,
  //       total: totalNet,
  //       paymentMethods: [{ method: documentTitle, amount: totalNet }],
  //       telephone,
  //     });
  //     await printPosTicket(ticketDoc);

  //     clearCart();
  //     toast.success(`${documentTitle} généré avec succès`);
  //   } catch (error) {
  //     console.error(`Erreur lors de la génération du ${selectedDocumentType}:`, error);
  //     toast.error(error instanceof Error ? error.message : `Erreur lors de la génération du ${selectedDocumentType}`);
  //   } finally {
  //     setIsProcessing(false);
  //     setShowInvoiceModal(false);
  //     setShowBonCommandeInvoiceModal(false);
  //     setShowDevisInvoiceModal(false);
  //   }
  // };

  return (
    <div className="p-3 bg-orvanta grid gap-2 rounded-lg">
      {calculateTotal() > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Total</span>
          <span>{formatNumber(calculateTotal())} TND</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 border-0">
        <button
          onClick={() => {
            setSelectedDocumentType(FactureType.FACTURE);
            setShowInvoiceModal(true);
          }}
          disabled={isProcessing || cartItems.length === 0}
          className="flex items-center justify-center gap-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 border-0"
        >
          <CreditCard className="w-5 h-5" />
          <span>Facture</span>
        </button>
        <button
          onClick={() => {
            setSelectedDocumentType(FactureType.BDC);
            setShowBonCommandeInvoiceModal(true);
          }}
          disabled={isProcessing || cartItems.length === 0}
          className="flex items-center justify-center gap-2 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 border-0"
        >
          <Ticket className="w-5 h-5" />
          <span>Bon de Commande</span>
        </button>
        <button
          onClick={() => {
            setSelectedDocumentType(FactureType.DEV);
            setShowDevisInvoiceModal(true);
          }}
          disabled={isProcessing || cartItems.length === 0}
          className="flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 border-0"
        >
          <DollarSign className="w-5 h-5" />
          <span>Devis</span>
        </button>
      </div>

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            {/* <Invoice
              items={cartItems.map((item) => ({
                barcode: item.id,
                description: item.designation,
                unitPrice: item.priceUnit,
                quantity: item.quantity,
                tva: item.tva || 0,
              }))}
              title="Facture"
              entrepriseId={entrepriseId}
              documentType={FactureType.FACTURE}
              onConfirm={handleConfirmFacture}
            /> */}
          </div>
        </div>
      )}

      {showBonCommandeInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4">
            <button
              onClick={() => setShowBonCommandeInvoiceModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            {/* <Invoice
              items={cartItems.map((item) => ({
                barcode: item.id,
                description: item.designation,
                unitPrice: item.priceUnit,
                quantity: item.quantity,
                tva: item.tva || 0,
              }))}
              title="Bon de Commande"
              entrepriseId={entrepriseId}
              documentType={FactureType.BDC}
              onConfirm={handleConfirmFacture}
            /> */}
          </div>
        </div>
      )}

      {showDevisInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4">
            <button
              onClick={() => setShowDevisInvoiceModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            {/* <Invoice
              items={cartItems.map((item) => ({
                barcode: item.id,
                description: item.designation,
                unitPrice: item.priceUnit,
                quantity: item.quantity,
                tva: item.tva || 0,
              }))}
              title="Devis"
              entrepriseId={entrepriseId}
              documentType={FactureType.DEV}
              onConfirm={handleConfirmFacture}
            /> */}
          </div>
        </div>
      )}
    </div>
  );
}