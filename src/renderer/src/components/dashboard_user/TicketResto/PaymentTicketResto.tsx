"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { validateTicketRestoWithoutSave, saveTicketsBatch } from "@renderer/api/ticket-resto";
import { TicketItem } from "@renderer/types/ticket-resto";

interface PaymentTicketRestoProps {
  totalAmount: number;
  onClose: () => void;
  onPaymentConfirm: (tickets: TicketItem[]) => void;
  entrepriseId: string;
}

export default function PaymentTicketResto({
  totalAmount,
  onClose,
  onPaymentConfirm,
  entrepriseId,
}: PaymentTicketRestoProps) {
  const [barcode, setBarcode] = useState("");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(totalAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
    setRemainingAmount(totalAmount);
  }, [totalAmount]);

  useEffect(() => {
    const totalPaid = tickets.reduce((sum, ticket) => sum + ticket.finalAmount, 0);
    const newRemaining = Number((totalAmount - totalPaid).toFixed(3));
    setRemainingAmount(newRemaining);
  }, [tickets, totalAmount]);

  useEffect(() => {
    if (barcode.length >= 10 && !isLoading) {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        processTicket(barcode);
      }, 50);
    }

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [barcode, isLoading]);

  const processTicket = async (barcodeValue: string) => {
    if (isLoading || !barcodeValue.trim()) return;
    
    const isAlreadyInList = tickets.some(ticket => ticket.codeBarre === barcodeValue);
    if (isAlreadyInList) {
      toast.error("❌ Ce ticket a déjà été scanné");
      resetScan();
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔍 Validation du ticket:", barcodeValue);
      
      const result = await validateTicketRestoWithoutSave(
        entrepriseId, 
        barcodeValue.trim(), 
        remainingAmount,
        tickets.map(t => t.codeBarre)
      );
      
      console.log("📋 Résultat validation:", result);
      
      if (!result.isValid) {
        toast.error(`❌ ${result.error || "Ticket invalide"}`);
        resetScan();
        return;
      }

      if (result.finalAmount > remainingAmount) {
        toast.error(`❌ Le ticket (${result.finalAmount.toFixed(3)} TND) dépasse le montant restant (${remainingAmount.toFixed(3)} TND)`);
        resetScan();
        return;
      }

      const newTicket: TicketItem = {
        id: Date.now(),
        codeBarre: result.codeBarre,
        fournisseur: result.fournisseur,
        finalAmount: result.finalAmount,
      };

      setTickets((prev) => [...prev, newTicket]);
      toast.success(`✅ Ticket ${result.fournisseur} - ${result.finalAmount.toFixed(3)} TND ajouté`);
      resetScan();
    } catch (error) {
      console.error("💥 Erreur validation:", error);
      toast.error("❌ Erreur lors de la validation du ticket");
      resetScan();
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setBarcode("");
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    setTimeout(() => {
      if (barcodeRef.current) {
        barcodeRef.current.focus();
      }
    }, 50);
  };

  const handleConfirmPayment = async () => {
    if (tickets.length === 0) {
      toast.error("❌ Aucun ticket ajouté");
      return;
    }

    const totalTickets = tickets.reduce((sum, t) => sum + t.finalAmount, 0);

    if (totalTickets > totalAmount) {
      toast.error("❌ Le total des tickets dépasse le montant du panier");
      return;
    }

    try {
      setIsLoading(true);
      
      console.log("💾 Enregistrement des tickets:", tickets.map(t => t.codeBarre));
      
      await saveTicketsBatch(
        entrepriseId, 
        tickets.map(t => t.codeBarre)
      );
      
      onPaymentConfirm(tickets);
      toast.success("🎉 Paiement par tickets resto confirmé !");
      onClose();
    } catch (error: any) {
      console.error("💥 Erreur enregistrement:", error);
      toast.error(`❌ Erreur lors de l'enregistrement: ${error.message || "Veuillez réessayer"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (e.key === "Enter" && barcode.length > 0) {
      e.preventDefault();
      processTicket(barcode);
      return;
    }
    
    if (e.key === "Escape") {
      onClose();
      return;
    }
  };

  const removeTicket = (ticketId: number) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    toast.info("🗑️ Ticket retiré");
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 50);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      barcodeRef.current?.focus();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
      onClick={handleModalClick}
    >
      {/* Overlay cyber */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal cyber */}
      <div 
        className={`relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header cyber */}
        <div className="rounded-t-2xl p-3 bg-gradient-to-r from-[#ffd700]/20 to-[#ffa500]/20 border-b border-[#ffd700]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full shadow-lg ${
                isLoading ? "bg-[#ffd700] animate-pulse shadow-[#ffd700]/40" : "bg-[#ffd700] shadow-[#ffd700]/40"
              }`}></div>
              <h2 className="text-base font-bold font-orbitron tracking-widest text-[#ffd700]">
                TICKET RESTO
              </h2>
            </div>
            <div className="text-xs bg-[#ffd700]/10 px-2 py-1 rounded-full border border-[#ffd700]/30 font-mono text-[#ffd700]">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* Montant total */}
          <div className="text-center mb-4 p-3 bg-[#ffd700]/5 rounded-xl border border-[#ffd700]/20">
            <div className="text-xs text-[#ffd700]/70 uppercase tracking-wider mb-1 font-orbitron">TOTAL À PAYER</div>
            <div className="text-2xl font-bold text-white font-mono">
              {totalAmount.toFixed(3)} <span className="text-lg text-[#ffd700]">TND</span>
            </div>
          </div>

          {/* Scanner code barre */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">SCANNER LE CODE BARRE</div>
            <div className="relative">
              <input
                ref={barcodeRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-lg font-mono text-white bg-[#050811] border-2 border-[#ffd700]/40 rounded-lg px-3 py-2 pr-12 focus:outline-none focus:border-[#ffd700] focus:bg-[#0a0e17] transition-all placeholder:text-[#ffd700]/30"
                placeholder="Scanner le code barre..."
                disabled={isLoading}
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="text-xs text-[#00ffea]/50 mt-1 flex justify-between font-orbitron">
              <span>Longueur: {barcode.length} caractères</span>
              <span>{isLoading ? "⏳ Validation..." : "✅ Prêt à scanner"}</span>
            </div>
          </div>

          {/* Calculs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#ff416c]/10 rounded-xl p-3 border border-[#ff416c]/30">
              <div className="text-xs text-[#ff416c] font-medium mb-1 uppercase tracking-wide font-orbitron">RESTE À PAYER</div>
              <div className="text-lg font-bold text-[#ff416c] font-mono">
                {remainingAmount.toFixed(3)} TND
              </div>
            </div>
            <div className="bg-[#00ff88]/10 rounded-xl p-3 border border-[#00ff88]/30">
              <div className="text-xs text-[#00ff88] font-medium mb-1 uppercase tracking-wide font-orbitron">TOTAL TICKETS</div>
              <div className="text-lg font-bold text-[#00ff88] font-mono">
                {(totalAmount - remainingAmount).toFixed(3)} TND
              </div>
            </div>
          </div>

          {/* Liste des tickets */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">
              TICKETS SCANNÉS ({tickets.length})
            </div>
            <div className="max-h-48 overflow-y-auto border border-[#ffd700]/30 rounded-xl bg-[#050811]/50">
              {tickets.length > 0 ? (
                <div className="bg-transparent">
                  {/* En-têtes du tableau */}
                  <div className="grid grid-cols-12 gap-2 p-3 bg-[#ffd700]/5 border-b border-[#ffd700]/20 text-xs font-medium text-[#ffd700] font-orbitron">
                    <div className="col-span-5">CODE BARRE</div>
                    <div className="col-span-4">FOURNISSEUR</div>
                    <div className="col-span-2 text-right">MONTANT</div>
                    <div className="col-span-1 text-center">ACTION</div>
                  </div>
                  
                  {/* Liste des tickets */}
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="grid grid-cols-12 gap-2 p-3 border-b border-[#ffd700]/10 hover:bg-[#ffd700]/5 transition-colors"
                    >
                      <div className="col-span-5 font-mono text-sm text-white truncate">
                        {ticket.codeBarre}
                      </div>
                      <div className="col-span-4 text-sm text-[#00ffea] truncate">
                        {ticket.fournisseur}
                      </div>
                      <div className="col-span-2 text-right font-mono text-sm font-bold text-[#00ff88]">
                        {ticket.finalAmount.toFixed(3)} TND
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="w-6 h-6 flex items-center justify-center text-[#ff416c] hover:text-white hover:bg-[#ff416c]/30 rounded transition-colors border border-[#ff416c]/40"
                          title="Supprimer le ticket"
                          tabIndex={-1}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-[#ffd700]/50">
                  <div className="text-4xl mb-2">🎫</div>
                  <div className="font-orbitron tracking-wide">AUCUN TICKET SCANNÉ</div>
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action cyber */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="py-2 bg-[#ff416c]/20 text-[#ff416c] font-bold rounded-lg border border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c] hover:text-white transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm disabled:opacity-30"
              disabled={isLoading}
              tabIndex={-1}
            >
              ANNULER
            </button>
            <button
              onClick={handleConfirmPayment}
              className="py-2 bg-[#00ff88]/20 text-[#00ff88] font-bold rounded-lg border border-[#00ff88]/40 hover:bg-[#00ff88]/30 hover:border-[#00ff88] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
              disabled={isLoading || tickets.length === 0 || remainingAmount < 0}
              tabIndex={-1}
            >
              VALIDER LE PAIEMENT
            </button>
          </div>

          {/* Footer cyber */}
          <div className="mt-3 text-center">
            <div className="text-xs text-[#00ffea]/50 font-orbitron tracking-widest">
              SMARTCASH TICKET SYSTEM ©
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}