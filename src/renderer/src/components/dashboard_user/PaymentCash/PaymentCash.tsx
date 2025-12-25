"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface PaymentCashProps {
  montantInitial: number;
  onClose: () => void;
  onPaymentConfirm: (paidAmount: number, remainingAmount: number) => void;
}

export default function PaymentCash({
  montantInitial,
  onClose,
  onPaymentConfirm,
}: PaymentCashProps) {
  const [cashGiven, setCashGiven] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    inputRef.current?.focus();
    
    const style = document.createElement("style");
    style.innerHTML = `
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
      }
      input[type="number"] { 
        -moz-appearance: textfield; 
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Calculs internes avec 3 décimales
  const round3 = (n: number) => Math.round((n + Number.EPSILON) * 1000) / 1000;
  const numericCash = round3(parseFloat(cashGiven || "0"));
  const montant = round3(montantInitial);
  const resteAPayer = numericCash < montant ? round3(montant - numericCash) : 0;
  const monnaieARendre = numericCash > montant ? round3(numericCash - montant) : 0;

  const handleConfirm = () => {
    if (numericCash <= 0) {
      toast.error("Veuillez saisir un montant");
      return;
    }

    if (numericCash < montant) {
      const remaining = round3(montant - numericCash);
      onPaymentConfirm(numericCash, remaining);
      toast.info(
        `Paiement partiel : ${numericCash.toFixed(3)} TND, reste ${remaining.toFixed(3)} TND`
      );
      return;
    }

    const paidAmount = Math.min(numericCash, montant);
    onPaymentConfirm(paidAmount, 0);

    if (numericCash > montant) {
      const change = round3(numericCash - montant);
      toast.info(
        `Montant reçu : ${numericCash.toFixed(3)} TND, monnaie : ${change.toFixed(3)} TND`
      );
    } else {
      toast.success(`Paiement complet : ${numericCash.toFixed(3)} TND`);
    }
    onClose();
  };

  const formatAmount = (n: number) => n.toFixed(3);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const numericButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0, "⌫"];

  const handleNumericInput = (value: string | number) => {
    if (value === "⌫") {
      setCashGiven(prev => prev.slice(0, -1));
    } else if (value === "." && !cashGiven.includes(".")) {
      setCashGiven(prev => prev + ".");
    } else if (value === "00") {
      setCashGiven(prev => prev + "00");
    } else if (typeof value === "number") {
      setCashGiven(prev => prev === "0" ? value.toString() : prev + value.toString());
    }
  };

  const quickAmounts = [5, 10, 20, 50, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      {/* Overlay cyber */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal compact avec design cyber */}
      <div 
        className={`relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header cyber */}
        <div className="rounded-t-2xl p-3 bg-gradient-to-r from-[#00ffea]/20 to-[#7c3aed]/20 border-b border-[#00ffea]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#00ffea] rounded-full animate-pulse shadow-lg shadow-[#00ffea]/40"></div>
              <h2 className="text-base font-bold font-orbitron tracking-widest text-[#00ffea]">
                ESPÈCES
              </h2>
            </div>
            <div className="text-xs bg-[#00ffea]/10 px-2 py-1 rounded-full border border-[#00ffea]/30 font-mono text-[#00ffea]">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* Montant total */}
          <div className="text-center mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-1 font-orbitron tracking-wide">TOTAL À PAYER</div>
            <div className="text-2xl font-bold text-white font-mono bg-[#00ffea]/5 py-2 px-4 rounded-lg border border-[#00ffea]/20">
              {formatAmount(montant)} <span className="text-lg text-[#00ffea]">TND</span>
            </div>
          </div>

          {/* Input montant */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 font-orbitron tracking-wide">MONTANT REÇU</div>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-xl font-mono text-white bg-[#050811] border-2 border-[#00ffea]/40 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-[#00ffea] focus:bg-[#0a0e17] transition-all no-spinner placeholder:text-[#00ffea]/30"
                placeholder="0.000"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00ffea] font-mono text-sm">
                TND
              </div>
            </div>
          </div>

          {/* Montants rapides */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 font-orbitron tracking-wide">MONTANTS RAPIDES</div>
            <div className="grid grid-cols-3 gap-1">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashGiven(amount.toString())}
                  className="py-1 text-xs font-medium bg-[#00ffea]/10 text-[#00ffea] rounded border border-[#00ffea]/30 hover:bg-[#00ffea]/20 hover:border-[#00ffea] hover:text-white transition-all duration-200 font-orbitron"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Calculs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#ff416c]/10 rounded-lg p-2 border border-[#ff416c]/30">
              <div className="text-xs text-[#ff416c] font-orbitron tracking-wide mb-1">RESTE</div>
              <div className="text-sm font-bold text-[#ff416c] font-mono">
                {formatAmount(resteAPayer)} TND
              </div>
            </div>
            <div className="bg-[#00ff88]/10 rounded-lg p-2 border border-[#00ff88]/30">
              <div className="text-xs text-[#00ff88] font-orbitron tracking-wide mb-1">MONNAIE</div>
              <div className="text-sm font-bold text-[#00ff88] font-mono">
                {formatAmount(monnaieARendre)} TND
              </div>
            </div>
          </div>

          {/* Clavier numérique cyber */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-1">
              {numericButtons.map((button) => (
                <button
                  key={button}
                  onClick={() => handleNumericInput(button)}
                  className={`py-2 text-base font-bold rounded-lg border-2 transition-all duration-200 active:scale-95 font-orbitron ${
                    button === "⌫" 
                      ? "bg-[#ff416c]/20 text-[#ff416c] border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c] hover:text-white" 
                      : button === "00"
                      ? "bg-[#00ffea]/10 text-[#00ffea] border-[#00ffea]/30 hover:bg-[#00ffea]/20 hover:border-[#00ffea] hover:text-white"
                      : "bg-[#00ffea]/5 text-white border-[#00ffea]/20 hover:bg-[#00ffea]/10 hover:border-[#00ffea] hover:text-[#00ffea]"
                  }`}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>

          {/* Boutons d'action cyber */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="py-2 bg-[#ff416c]/20 text-[#ff416c] font-bold rounded-lg border border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c] hover:text-white transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
            >
              ANNULER
            </button>
            <button
              onClick={handleConfirm}
              disabled={numericCash <= 0}
              className="py-2 bg-[#00ff88]/20 text-[#00ff88] font-bold rounded-lg border border-[#00ff88]/40 hover:bg-[#00ff88]/30 hover:border-[#00ff88] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
            >
              VALIDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}