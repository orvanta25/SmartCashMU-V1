"use client";
import { useState, useEffect } from "react";
import { CreditCard, Ticket, DollarSign, Receipt, Percent, Clover } from "lucide-react";
import { toast } from "react-toastify";
import { createCommande, updateCommande, getCommandeByTableId } from "../../../api/commande";
import { getProductById, getProductByBarcode } from "../../../api/produit";
import { getAllBalanceConfigs } from "../../../api/balance";
import { getEntreprise } from "../../../api/entreprise";
import { CartItem } from "../../../types/product";
import { TicketItem } from "../../../types/ticket-resto";
import { generatePosTicket, printPosTicket } from "./TicketPrinterModel";
import qrRemiseAPI from "@renderer/api/qr-remise.api";

import PaymentTicketResto from "../../dashboard_user/TicketResto/PaymentTicketResto";
import PaymentTPE from "../../dashboard_user/PaymentTPE/PaymentTPE";
import PaymentCheque from "../../dashboard_user/PaymentCheque/PaymentCheque";
import PaymentCash from "../../dashboard_user/PaymentCash/PaymentCash";
import PaymentRemise from "../../dashboard_user/PaymentRemise/PaymentRemise";
import { useAuth } from "@renderer/components/auth/auth-context";



interface CartFooterProps {
  cartItems: CartItem[];
  entrepriseId: string;
  clearCart: () => void;
  companyName: string;
  city: string;
  telephone: string;
  setCartItems: (items: CartItem[]) => void;
  selectedTable: { id: string; number: string } | null;
  setSelectedTable: (table: { id: string; number: string } | null) => void;
  activeCommandId: string | null;
  setActiveCommandId: (id: string | null) => void;
  onCommandeConfirm:()=>void;
}

interface TpePayment {
  id: string;
  amount: number;
}

interface ChequePayment {
  id: string;
  amount: number;
}

interface Vente {
  id: string;
  codeBarre: string;
  designation: string;
  puht: number;
  quantite: number;
  tva: number;
  remise?: number;
}

export default function CartFooter({
  cartItems,
  entrepriseId,
  telephone,
  clearCart,
  companyName,
  city,
  setCartItems,
  selectedTable,
  setSelectedTable,
  activeCommandId,
  setActiveCommandId,
  onCommandeConfirm
}: CartFooterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTpeModal, setShowTpeModal] = useState(false);
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [showRemiseModal, setShowRemiseModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [_totalAmount, setTotalAmount] = useState(0);
  const [_ticketPayments, setTicketPayments] = useState<TicketItem[]>([]);
  const [_tpePayments, setTpePayments] = useState<TpePayment[]>([]);
  const [_chequePayments, setChequePayments] = useState<ChequePayment[]>([]);
  const [ticketTotal, setTicketTotal] = useState(0);
  const [tpeTotal, setTpeTotal] = useState(0);
  const [chequeTotal, setChequeTotal] = useState(0);
  const [remisePercentage, setRemisePercentage] = useState(0);
  const [isRestaurantModuleActive, setIsRestaurantModuleActive] = useState(false);
  const [printTicketEnabled, setPrintTicketEnabled] = useState(false);
  const [isWaitIems,setIsWaitItems] = useState(false)
  const [cashPayments, setCashPayments] = useState<{ id: string; amount: number }[]>([]);
  const [cashTotal, setCashTotal] = useState(0);

  const {user} = useAuth()
  useEffect(() => {
    async function fetchEnterprise() {
      try {
        const entreprise = await getEntreprise();
        setIsRestaurantModuleActive(entreprise.hasRestaurantModule || false);
      } catch (error) {
        console.error("Error fetching enterprise:", error);
        toast.error("Erreur lors de la vérification du module restaurant");
      }
    }
    fetchEnterprise();
  }, []);

  useEffect(() => {
    async function fetchTableCommande() {
      if (!selectedTable || !isRestaurantModuleActive) {
        setActiveCommandId(null);
        setCartItems([]);
        return;
      }
      try {
        const commande = await getCommandeByTableId(entrepriseId, selectedTable.id);
        if (commande) {
          setActiveCommandId(commande.id);
          const newCartItems = await Promise.all(
            commande.ventes.map(async (vente: Vente) => {
              const product = await getProductByBarcode(entrepriseId, vente.codeBarre);
              return {
                id: product.id,
                designation: vente.designation,
                quantity: vente.quantite,
                priceUnit: Number(vente.puht) * (1 + Number(vente.tva || 0) / 100) * (1 - Number(vente.remise || 0) / 100),
                totalPrice: Number((vente.quantite * Number(vente.puht) * (1 + Number(vente.tva || 0) / 100) * (1 - Number(vente.remise || 0) / 100)).toFixed(3)),
              };
            })
          );
          setCartItems(newCartItems);
          if (commande.remise) {
            setRemisePercentage(Number(commande.remise));
          }
        } else {
          setActiveCommandId(null);
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error fetching table commande:", error);
        toast.error("Erreur lors de la récupération de la commande pour la table");
      }
    }
    fetchTableCommande();
  }, [selectedTable, entrepriseId, isRestaurantModuleActive, setCartItems, setActiveCommandId]);

  const waitOrderItems = ()=>{
    if(!isWaitIems){
    window.localStorage.setItem("waitItems",JSON.stringify(cartItems))
    setIsWaitItems(true)
    console.log(cartItems)
    setCartItems([]);
    }else{
      const savedItems = window.localStorage.getItem("waitItems") 
      if(savedItems){
        setCartItems(JSON.parse(savedItems))
        window.localStorage.removeItem("waitItems")
        setIsWaitItems(false)
      }
    }
    
  }
  useEffect(()=>{
    const savedItems = window.localStorage.getItem("waitItems") 
    if(savedItems)setIsWaitItems(true)
  },[])
  const formatNumber = (num: number): string => {
    const rounded = Math.round((num + Number.EPSILON) * 1000) / 1000;
    return rounded.toFixed(3).replace(/\.0+$/,'').replace(/\.$/,'');
  };

  const calculateSubtotal = (): number =>
    parseFloat(cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(3));

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    if (remisePercentage > 0) {
      return parseFloat((subtotal * (1 - remisePercentage / 100)).toFixed(3));
    }
    return subtotal;
  };

  const calculateRemaining = (): number =>
  parseFloat((calculateTotal() - ticketTotal - tpeTotal - chequeTotal - cashTotal).toFixed(3));

  const printTicketAutomatically = async (
    ticketNumber: string,
    total: number,
    paymentMethods: { method: string; amount: number }[]
  ) => {
    try {
      if (!printTicketEnabled) return;
      const ticketDoc = generatePosTicket({
        companyName,
        city,
        cartItems,
        ticketNumber,
        total,
        paymentMethods,
        telephone,
      });
      await printPosTicket(ticketDoc);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'impression");
      throw error;
    }
  };

  const prepareProductsData = async () => {
    console.log("Cart items in prepareProductsData:", JSON.stringify(cartItems, null, 2));

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Le panier est vide ou invalide");
    }

    if (cartItems.some((item) => Array.isArray(item))) {
      console.error("Cart items contains nested arrays:", cartItems);
      throw new Error("Les articles du panier contiennent des tableaux imbriqués");
    }

    const ventes: { codeBarre: string; quantite: number }[] = [];
    const balanceConfigs = await getAllBalanceConfigs(entrepriseId);

    for (const item of cartItems) {
      if (!item || typeof item !== 'object' || !item.id || !item.quantity || !item.designation) {
        console.error("Invalid cart item:", item);
        throw new Error("Article du panier invalide");
      }

      if (item.id.startsWith("temp-")) {
        const barcode = item.designation;
        const config = balanceConfigs.find((c) => barcode.startsWith(c.balanceCode));
        if (!config) throw new Error("Configuration balance non trouvée");

        const productCode = barcode.substring(
          config.productCodeStart - 1,
          config.productCodeStart - 1 + config.productCodeLength
        );
        const product = await getProductByBarcode(entrepriseId, productCode);
        if (!product) throw new Error(`Produit non trouvé pour le code-barres: ${productCode}`);

        ventes.push({
          codeBarre: product.codeBarre,
          quantite: parseFloat(item.quantity.toFixed(3)),
        });
      } else {
        const product = await getProductById(entrepriseId, item.id);
        if (!product) throw new Error(`Produit non trouvé pour l'ID: ${item.id}`);

        ventes.push({
          codeBarre: product.codeBarre,
          quantite: parseFloat(item.quantity.toFixed(3)),
        });
      }
    }

    console.log("Prepared ventes:", JSON.stringify(ventes, null, 2));
    return ventes;
  };

  const processPayment = async (paymentData: any) => {
    console.log('Payment data before API call:', JSON.stringify(paymentData, null, 2));
    let response;
    if (activeCommandId) {
      response = await updateCommande(entrepriseId, activeCommandId, paymentData);
    } else {
      response = await createCommande(entrepriseId, paymentData);
    }
    onCommandeConfirm()
    return response;
  };

const printPaymentTicket = async (
  response: any,
  total: number,
  paymentMethods: { method: string; amount: number }[],
  qrCodeData?: any
) => {
  const rawTicketNumber = response.commande.ticketNumber || `CMD${response.commande.id}`;
  const cleanedTicketNumber = rawTicketNumber.slice(8);
  
  const ticketOptions = {
    companyName,
    city,
    cartItems,
    ticketNumber: cleanedTicketNumber,
    total,
    paymentMethods,
    telephone,
    includeQR: !!qrCodeData,
    qrData: qrCodeData ? {
      code: qrCodeData.ticketInfo?.code || "PROMO15",
      pourcentage: qrCodeData.ticketInfo?.pourcentage || 15,
      dateExpiration: qrCodeData.ticketInfo?.dateExpiration || new Date(Date.now() + 24*60*60*1000).toISOString(),
      entrepriseNom: companyName,
      // ✅ AJOUT: Données pour le contenu du QR code
      qrContent: qrCodeData.qrCodeData ? JSON.stringify(qrCodeData.qrCodeData) : undefined
    } : undefined
  };
  
  try {
    const ticketDoc = await generatePosTicket(ticketOptions);
    await printPosTicket(ticketDoc);
  } catch (error) {
    console.error("Erreur lors de la génération du ticket:", error);
    toast.error("Erreur lors de l'impression du ticket");
  }
};

const handleTPEPayment = async (amount: number) => {
  if (cartItems.length === 0) {
    toast.error("Le panier est vide");
    return;
  }

  setIsProcessing(true);
  try {
    const total = calculateTotal();
    const currentRemaining = calculateRemaining();
    const paymentAmount = parseFloat(Math.min(amount, currentRemaining).toFixed(3));

    const newTpeTotal = tpeTotal + paymentAmount;
    const newRemaining = total - ticketTotal - newTpeTotal - chequeTotal - cashTotal;

    setTpePayments((prev) => [
      ...prev,
      { id: `tpe-${Date.now()}`, amount: paymentAmount },
    ]);
    setTpeTotal(newTpeTotal);

    if (paymentAmount >= currentRemaining) {
      const ventes = await prepareProductsData();
      const paymentData = {
        ventes,
        isWaiting: false,
        ticketAmount: parseFloat(ticketTotal.toFixed(3)),
        tpeAmount: parseFloat(newTpeTotal.toFixed(3)),
        especeAmount: parseFloat(cashTotal.toFixed(3)),
        chequeAmount: parseFloat(chequeTotal.toFixed(3)),
        remise: remisePercentage > 0 ? remisePercentage : undefined,
        tableId: selectedTable?.id || undefined,
      };

      const response = await processPayment(paymentData); 
      
      // ✅ CORRECTION: Déclarer paymentMethods AVANT de l'utiliser
      const paymentMethods = [
        { method: "Espèces", amount: parseFloat(cashTotal.toFixed(3)) },
        { method: "Ticket", amount: parseFloat(ticketTotal.toFixed(3)) },
        { method: "Carte", amount: parseFloat(newTpeTotal.toFixed(3)) },
        { method: "Chèque", amount: parseFloat(chequeTotal.toFixed(3)) },
      ].filter((pm) => pm.amount > 0);

      // ✅ CORRECTION: Générer le QR code APRES la vente
      let qrCodeData = null;
      try {
        // Trouver l'ID de vente depuis la réponse
        if (response.commande && response.commande.ventes && response.commande.ventes.length > 0) {
          const venteId = response.commande.ventes[0].id;
          qrCodeData = await generateQRCodeAfterVente(venteId);
        }
      } catch (qrError) {
        console.log("QR code non généré:", qrError);
      }

      // ✅ CORRECTION: Passer le qrCodeData à printPaymentTicket
      await printPaymentTicket(response, total, paymentMethods, qrCodeData);

      clearCart();
      setTicketPayments([]);
      setTicketTotal(0);
      setTpePayments([]);
      setTpeTotal(0);
      setChequePayments([]);
      setChequeTotal(0);
      setCashPayments([]);
      setCashTotal(0);
      setRemisePercentage(0);
      setSelectedTable(null);
      setActiveCommandId(null);
      toast.success("Paiement complet par carte effectué avec succès");
    } else {
      toast.info(`Reste à payer: ${formatNumber(newRemaining)} TND`);
    }

    if (amount > currentRemaining) {
      const change = amount - currentRemaining;
      toast.info(`Montant à rendre au client: ${formatNumber(change)} TND`);
    }
  } catch (error) {
    console.error("Erreur lors du paiement par carte:", error);
    toast.error(error instanceof Error ? error.message : "Erreur lors du paiement par carte");
  } finally {
    setIsProcessing(false);
    setShowTpeModal(false);
  }
};

const handleChequePayment = async (amount: number) => {
  if (cartItems.length === 0) {
    toast.error("Le panier est vide");
    return;
  }

  setIsProcessing(true);
  try {
    const total = calculateTotal();
    const currentRemaining = calculateRemaining();
    const paymentAmount = parseFloat(Math.min(amount, currentRemaining).toFixed(3));

    const newChequeTotal = chequeTotal + paymentAmount;
    const newRemaining = total - ticketTotal - tpeTotal - newChequeTotal - cashTotal;

    setChequePayments((prev) => [
      ...prev,
      { id: `cheque-${Date.now()}`, amount: paymentAmount },
    ]);
    setChequeTotal(newChequeTotal);

    if (paymentAmount >= currentRemaining) {
      const ventes = await prepareProductsData();
      const paymentData = {
        ventes,
        isWaiting: false,
        ticketAmount: parseFloat(ticketTotal.toFixed(3)),
        tpeAmount: parseFloat(tpeTotal.toFixed(3)),
        especeAmount: parseFloat(cashTotal.toFixed(3)),
        chequeAmount: parseFloat(newChequeTotal.toFixed(3)),
        remise: remisePercentage > 0 ? remisePercentage : undefined,
        tableId: selectedTable?.id || undefined,
      };

      const response = await processPayment(paymentData); 
      
      // ✅ CORRECTION: Définir paymentMethods ICI (pas avant)
      const paymentMethods = [
        { method: "Ticket", amount: parseFloat(ticketTotal.toFixed(3)) },
        { method: "Carte", amount: parseFloat(tpeTotal.toFixed(3)) },
        { method: "Espèces", amount: parseFloat(cashTotal.toFixed(3)) },
        { method: "Chèque", amount: parseFloat(newChequeTotal.toFixed(3)) }
      ].filter((pm) => pm.amount > 0);

      // ✅ CORRECTION: Générer le QR code APRES la vente
      let qrCodeData = null;
      try {
        if (response.commande && response.commande.ventes && response.commande.ventes.length > 0) {
          const venteId = response.commande.ventes[0].id;
          qrCodeData = await generateQRCodeAfterVente(venteId);
        }
      } catch (qrError) {
        console.log("QR code non généré:", qrError);
      }

      // ✅ CORRECTION: Appeler printPaymentTicket UNE SEULE FOIS avec toutes les données
      await printPaymentTicket(response, total, paymentMethods, qrCodeData);

      clearCart();
      setTicketPayments([]);
      setTicketTotal(0);
      setTpePayments([]);
      setTpeTotal(0);
      setChequePayments([]);
      setChequeTotal(0);
      setCashPayments([]);
      setCashTotal(0);
      setRemisePercentage(0);
      setSelectedTable(null);
      setActiveCommandId(null);
      toast.success("Paiement complet par chèque effectué avec succès");
    } else {
      toast.info(`Reste à payer: ${formatNumber(newRemaining)} TND`);
    }

    if (amount > currentRemaining) {
      const change = amount - currentRemaining;
      toast.info(`Montant à rendre au client: ${formatNumber(change)} TND`);
    }
  } catch (error) {
    console.error("Erreur lors du paiement par chèque:", error);
    toast.error(error instanceof Error ? error.message : "Erreur lors du paiement par chèque");
  } finally {
    setIsProcessing(false);
    setShowChequeModal(false);
  }
};

  const handleRemiseApplication = async (percentage: number) => {
    setRemisePercentage(percentage);
    setShowRemiseModal(false);
  };

const handleTicketPayment = async (tickets: TicketItem[]) => {
  if (cartItems.length === 0) {
    toast.error("Le panier est vide");
    return;
  }

  setIsProcessing(true);
  try {
    const totalPaid = parseFloat(
      tickets.reduce((sum, ticket) => sum + ticket.finalAmount, 0).toFixed(3)
    );

    const total = calculateTotal();
    const currentRemaining = total - ticketTotal - tpeTotal - chequeTotal - cashTotal;

    const newTicketTotal = ticketTotal + totalPaid;
    const newRemaining = total - newTicketTotal - tpeTotal - chequeTotal - cashTotal;

    setTicketPayments(tickets);
    setTicketTotal(newTicketTotal);

    if (totalPaid >= currentRemaining) {
      const ventes = await prepareProductsData();
      const paymentData = {
        ventes,
        isWaiting: false,
        ticketAmount: parseFloat(newTicketTotal.toFixed(3)),
        tpeAmount: parseFloat(tpeTotal.toFixed(3)),
        especeAmount: parseFloat(cashTotal.toFixed(3)),
        chequeAmount: parseFloat(chequeTotal.toFixed(3)),
        remise: remisePercentage > 0 ? remisePercentage : undefined,
        tableId: selectedTable?.id || undefined,
      };

      const response = await processPayment(paymentData); 
      
      // ✅ CORRECTION: Déclarer paymentMethods
      const paymentMethods = [
        { method: "Ticket", amount: parseFloat(newTicketTotal.toFixed(3)) },
        { method: "Carte", amount: parseFloat(tpeTotal.toFixed(3)) },
        { method: "Chèque", amount: parseFloat(chequeTotal.toFixed(3)) },
        { method: "Espèces", amount: parseFloat(cashTotal.toFixed(3)) },
      ].filter((pm) => pm.amount > 0);

      // ✅ CORRECTION: Générer QR code
      let qrCodeData = null;
      try {
        if (response.commande && response.commande.ventes && response.commande.ventes.length > 0) {
          const venteId = response.commande.ventes[0].id;
          qrCodeData = await generateQRCodeAfterVente(venteId);
        }
      } catch (qrError) {
        console.log("QR code non généré:", qrError);
      }

      // ✅ CORRECTION: Passer qrCodeData
      await printPaymentTicket(response, total, paymentMethods, qrCodeData);

      clearCart();
      setTicketPayments([]);
      setTicketTotal(0);
      setTpePayments([]);
      setTpeTotal(0);
      setChequePayments([]);
      setChequeTotal(0);
      setCashPayments([]);
      setCashTotal(0);
      setRemisePercentage(0);
      setSelectedTable(null);
      setActiveCommandId(null);
      toast.success("Paiement complet par tickets");
    } else {
      toast.info(`Reste à payer: ${formatNumber(newRemaining)} TND`);
    }
  } catch (error) {
    console.error("Erreur lors du paiement par tickets:", error);
    toast.error(error instanceof Error ? error.message : "Erreur lors du paiement par tickets");
  } finally {
    setIsProcessing(false);
    setShowTicketModal(false);
  }
};

const handleCashPayment = async (amount: number) => {
  if (cartItems.length === 0) {
    toast.error("Le panier est vide");
    return;
  }

  setIsProcessing(true);
  try {
    const total = calculateTotal();
    const currentRemaining = calculateRemaining();
    const paymentAmount = parseFloat(Math.min(amount, currentRemaining).toFixed(3));

    const newCashTotal = cashTotal + paymentAmount;
    const newRemaining = total - ticketTotal - tpeTotal - chequeTotal - newCashTotal;

    setCashPayments((prev) => [
      ...prev,
      { id: `cash-${Date.now()}`, amount: paymentAmount },
    ]);
    setCashTotal(newCashTotal);

    if (paymentAmount >= currentRemaining) {
      const ventes = await prepareProductsData();
      const paymentData = {
        ventes,
        isWaiting: false,
        ticketAmount: parseFloat(ticketTotal.toFixed(3)),
        tpeAmount: parseFloat(tpeTotal.toFixed(3)),
        especeAmount: parseFloat(newCashTotal.toFixed(3)),
        chequeAmount: parseFloat(chequeTotal.toFixed(3)),
        remise: remisePercentage > 0 ? remisePercentage : undefined,
        tableId: selectedTable?.id || undefined,
      };

      const response = await processPayment(paymentData); 
      
      // ✅ CORRECTION: Déclarer paymentMethods AVANT
      const paymentMethods = [
        { method: "Ticket", amount: parseFloat(ticketTotal.toFixed(3)) },
        { method: "Carte", amount: parseFloat(tpeTotal.toFixed(3)) },
        { method: "Espèces", amount: parseFloat(newCashTotal.toFixed(3)) },
        { method: "Chèque", amount: parseFloat(chequeTotal.toFixed(3)) },
      ].filter((pm) => pm.amount > 0);

      // ✅ CORRECTION: Générer QR code
      let qrCodeData = null;
      try {
        if (response.commande && response.commande.ventes && response.commande.ventes.length > 0) {
          const venteId = response.commande.ventes[0].id;
          qrCodeData = await generateQRCodeAfterVente(venteId);
        }
      } catch (qrError) {
        console.log("QR code non généré:", qrError);
      }

      // ✅ CORRECTION: Passer qrCodeData
      await printPaymentTicket(response, total, paymentMethods, qrCodeData);

      clearCart();
      setTicketPayments([]);
      setTicketTotal(0);
      setTpePayments([]);
      setTpeTotal(0);
      setChequePayments([]);
      setChequeTotal(0);
      setCashPayments([]);
      setCashTotal(0);
      setRemisePercentage(0);
      setSelectedTable(null);
      setActiveCommandId(null);
      toast.success("Paiement complet en espèces effectué avec succès");
    } else {
      toast.info(`Reste à payer: ${formatNumber(newRemaining)} TND`);
    }

    if (amount > currentRemaining) {
      const change = amount - currentRemaining;
      toast.info(`Montant à rendre au client: ${formatNumber(change)} TND`);
    }
  } catch (error) {
    console.error("Erreur lors du paiement en espèces:", error);
    toast.error(error instanceof Error ? error.message : "Erreur lors du paiement en espèces");
  } finally {
    setIsProcessing(false);
    setShowCashModal(false);
  }
};
// 1. Corrigez la fonction generateQRCodeAfterVente (complète) :
const generateQRCodeAfterVente = async (venteId: string) => {
  if (!entrepriseId) {
    console.log("⚠️ Impossible de générer QR: entrepriseId manquant");
    return null;
  }

  try {
    console.log("🎫 Tentative génération QR pour vente:", venteId);
    
    const configResponse = await qrRemiseAPI.getActiveConfig(entrepriseId);
    if (!configResponse.success || !configResponse.config) {
      console.log("ℹ️ Configuration QR remise non active");
      return null;
    }

    const qrResponse = await qrRemiseAPI.generateTicketAfterVente(venteId);
    
    if (qrResponse.success && qrResponse.hasTicket && qrResponse.ticket) {
      const ticketInfo = {
        pourcentage: qrResponse.ticket.pourcentage,
        dateExpiration: new Date(qrResponse.ticket.dateExpiration).toISOString(),
        code: qrResponse.ticket.code,
        joursRestants: Math.ceil(
          (new Date(qrResponse.ticket.dateExpiration).getTime() - Date.now()) / 
          (1000 * 60 * 60 * 24)
        ),
        entrepriseNom: companyName || "Notre boutique"
      };
      
      // ✅ AJOUT: Préparer les données pour le QR code
      const qrCodeData = {
        type: "promotion",
        code: qrResponse.ticket.code,
        pourcentage: qrResponse.ticket.pourcentage,
        entreprise: companyName || "MonMarket",
        validUntil: new Date(qrResponse.ticket.dateExpiration).toISOString(),
        ticket: venteId.substring(0, 8) // ID raccourci
      };
      
      return { 
        ticketInfo, 
        venteId,
        qrCodeData // ✅ NOUVEAU: données pour le QR code
      };
    }
    
    return null;
  } catch (error) {
    console.error("❌ Erreur génération QR code:", error);
    return null;
  }
};


  return (
    <div className="p-3 bg-orvanta grid gap-2 rounded-lg">

      {ticketTotal > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Ticket Resto</span>
          <span>{formatNumber(ticketTotal)} TND</span>
        </div>
      )}
      {tpeTotal > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Paiement par Carte</span>
          <span>{formatNumber(tpeTotal)} TND</span>
        </div>
      )}
      {chequeTotal > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Paiement par Chèque</span>
          <span>{formatNumber(chequeTotal)} TND</span>
        </div>
      )}
      {cashTotal > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Paiement en Espèces</span>
          <span>{formatNumber(cashTotal)} TND</span>
        </div>
      )}
      {remisePercentage > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Remise ({remisePercentage}%)</span>
          <span>-{formatNumber(calculateSubtotal() * remisePercentage / 100)} TND</span>
        </div>
      )}

      {/* Ticket printing toggle */}
      <div className="flex items-center justify-between text-sm font-semibold text-white dark:text-white">
        <span>Imprimer le ticket</span>
        <button
          onClick={() => setPrintTicketEnabled((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${printTicketEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
          aria-pressed={printTicketEnabled}
          aria-label="Basculer l'impression du ticket"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${printTicketEnabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {calculateRemaining() > 0 && (
        <div className="flex justify-between items-center text-sm font-semibold text-white dark:text-white">
          <span>Reste à payer</span>
          <span>{formatNumber(calculateRemaining())} TND</span>
        </div>
      )}
      <div>
        {isWaitIems ?(
          <button
            onClick={() => {
              waitOrderItems()
            }}
            className="flex items-center justify-center gap-2 p-2 bg-black text-white rounded-lg hover:bg-white hover:text-black transition disabled:opacity-50 border-0"
          >
            <Clover className="w-5 h-5" />
            <span>{"Reprendre l'ordre"}</span>
        </button>
        ):(
          <button
            onClick={() => {
              waitOrderItems()
            }}
            disabled={cartItems.length === 0 }
            className="flex items-center justify-center gap-2 p-2 bg-cyan-500 text-black rounded-lg hover:bg-white hover:text-black transition disabled:opacity-50 border-0"
          >
            <Clover className="w-5 h-5" />
            <span>{"Mettre en Attente"}</span>
        </button>
        )}
      </div>

      {/* First row: Remise, Espèces */}
      <div className="grid grid-cols-2 gap-2 border-0 mb-2">
        <button
          onClick={() => setShowRemiseModal(true)}
          disabled={isProcessing || cartItems.length === 0 }
          className={`flex items-center justify-center gap-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 border-0 
${user?.role === "ADMIN" || user?.role === "CAISSIER" ? "" : "hidden"}`}

        >
          <Percent className="w-5 h-5" />
          <span>Remise</span>
        </button>
        <button
          onClick={() => {
            setTotalAmount(calculateTotal());
            setShowCashModal(true);
          }}
          disabled={isProcessing || calculateRemaining() <= 0}
          className="flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 border-0"
        >
          <DollarSign className="w-5 h-5" />
          <span>Espèces</span>
        </button>
      </div>

      {/* Table selection info */}
      <div className="mt-4 text-center">
        <p className={`text-lg font-semibold ${
          isRestaurantModuleActive ? "text-white" : "text-gray-400"
        }`}>
          {isRestaurantModuleActive && selectedTable ? `Table sélectionnée: ${selectedTable.number}` : ""}
        </p>
      </div>

      {/* Second row: TPE, Ticket, Chèque */}
      <div className="grid grid-cols-3 gap-2 border-0">
        <button
          onClick={() => {
            setTotalAmount(calculateTotal());
            setShowTpeModal(true);
          }}
          disabled={isProcessing || calculateRemaining() <= 0}
          className="flex items-center justify-center gap-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 border-0"
        >
          <CreditCard className="w-5 h-5" />
          <span>TPE</span>
        </button>
        <button
          onClick={() => {
            setTotalAmount(calculateTotal());
            setShowTicketModal(true);
          }}
          disabled={isProcessing || calculateRemaining() <= 0}
          className="flex items-center justify-center gap-2 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 border-0"
        >
          <Ticket className="w-5 h-5" />
          <span>Ticket</span>
        </button>
        <button
          onClick={() => {
            setTotalAmount(calculateTotal());
            setShowChequeModal(true);
          }}
          disabled={isProcessing || calculateRemaining() <= 0}
          className="flex items-center justify-center gap-2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 border-0"
        >
          <Receipt className="w-5 h-5" />
          <span>Chèque</span>
        </button>
      </div>

      {/* Modals */}
      {showTpeModal && (
        <PaymentTPE
          montantInitial={calculateRemaining()}
          onClose={() => setShowTpeModal(false)}
          onPaymentConfirm={handleTPEPayment}
        />
      )}

      {showChequeModal && (
        <PaymentCheque
          montantInitial={calculateRemaining()}
          onClose={() => setShowChequeModal(false)}
          onPaymentConfirm={handleChequePayment}
        />
      )}

      {(user?.role === "ADMIN" || user?.role === "CAISSIER") && showRemiseModal && (
    <PaymentRemise
  onClose={() => setShowRemiseModal(false)}
  onRemiseConfirm={handleRemiseApplication}
  currentRemise={remisePercentage}
  commandeId={activeCommandId ?? undefined}
/>
)}


      {showCashModal && (
        <PaymentCash
          montantInitial={calculateRemaining()}
          onClose={() => setShowCashModal(false)}
          onPaymentConfirm={(amount) => handleCashPayment(amount)}
        />
      )}

      {showTicketModal && (
        <PaymentTicketResto
          totalAmount={calculateRemaining()}
          entrepriseId={entrepriseId}
          onClose={() => setShowTicketModal(false)}
          onPaymentConfirm={handleTicketPayment}
        />
      )}
     
    </div>
  );
}

