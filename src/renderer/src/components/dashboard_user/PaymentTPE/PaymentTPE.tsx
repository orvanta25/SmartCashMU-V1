"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface PaymentTPEProps {
  montantInitial: number;
  onClose: () => void;
  onPaymentConfirm: (tpeAmount: number, isFullPayment: boolean) => void;
}

export default function PaymentTPE({
  montantInitial,
  onClose,
  onPaymentConfirm,
}: PaymentTPEProps) {
  const [tpeAmount, setTpeAmount] = useState<string>("");
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

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const round3 = (n: number) => Math.round((n + Number.EPSILON) * 1000) / 1000;
  const numericAmount = parseFloat(tpeAmount || "0");
  const resteAPayer = Math.max(0, montantInitial - numericAmount);
  const isFullPayment = numericAmount >= montantInitial;

  const handleConfirm = () => {
    if (numericAmount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    if (numericAmount > montantInitial) {
      toast.error(`Montant dépassé de : ${round3(numericAmount - montantInitial).toFixed(3)} TND`);
      return;
    }

    const adjustedAmount = Math.min(numericAmount, montantInitial);
    onPaymentConfirm(adjustedAmount, isFullPayment);
    onClose();
  };

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
      setTpeAmount(prev => prev.slice(0, -1));
    } else if (value === "." && !tpeAmount.includes(".")) {
      setTpeAmount(prev => prev + ".");
    } else if (value === "00") {
      setTpeAmount(prev => prev + "00");
    } else if (typeof value === "number") {
      setTpeAmount(prev => prev === "0" ? value.toString() : prev + value.toString());
    }
  };

  const quickAmounts = [10, 20, 50, 100, 200, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      {/* Overlay cyber */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal avec design cyber */}
      <div 
        className={`relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header cyber */}
        <div className="rounded-t-2xl p-3 bg-gradient-to-r from-[#00ffea]/20 to-[#0099ff]/20 border-b border-[#00ffea]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#00ffea] rounded-full animate-pulse shadow-lg shadow-[#00ffea]/40"></div>
              <h2 className="text-base font-bold font-orbitron tracking-widest text-[#00ffea]">
                PAIEMENT TPE
              </h2>
            </div>
            <div className="text-xs bg-[#00ffea]/10 px-2 py-1 rounded-full border border-[#00ffea]/30 font-mono text-[#00ffea]">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* Montant total */}
          <div className="text-center mb-4 p-3 bg-[#00ffea]/5 rounded-xl border border-[#00ffea]/20">
            <div className="text-xs text-[#00ffea]/70 uppercase tracking-wider mb-1 font-orbitron">TOTAL À PAYER</div>
            <div className="text-2xl font-bold text-white font-mono">
              {montantInitial.toFixed(3)} <span className="text-lg text-[#00ffea]">TND</span>
            </div>
          </div>

          {/* Input montant TPE */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">MONTANT CARTE</div>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                value={tpeAmount}
                onChange={(e) => setTpeAmount(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-xl font-mono text-white bg-[#050811] border-2 border-[#00ffea]/40 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-[#00ffea] focus:bg-[#0a0e17] transition-all no-spinner placeholder:text-[#00ffea]/30"
                placeholder="0.000"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00ffea] font-mono text-lg font-bold">
                TND
              </div>
            </div>
          </div>

          {/* Montants rapides */}
          <div className="mb-4">
            <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">MONTANTS RAPIDES</div>
            <div className="grid grid-cols-3 gap-1">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTpeAmount(amount.toString())}
                  className="py-1 text-xs font-medium bg-[#00ffea]/10 text-[#00ffea] rounded border border-[#00ffea]/30 hover:bg-[#00ffea]/20 hover:border-[#00ffea] hover:text-white transition-all duration-200 font-orbitron"
                >
                  {amount} TND
                </button>
              ))}
            </div>
          </div>

          {/* Calculs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#ff416c]/10 rounded-xl p-3 border border-[#ff416c]/30">
              <div className="text-xs text-[#ff416c] font-medium mb-1 uppercase tracking-wide font-orbitron">RESTE À PAYER</div>
              <div className="text-lg font-bold text-[#ff416c] font-mono">
                {resteAPayer.toFixed(3)} TND
              </div>
            </div>
            <div className={`rounded-xl p-3 border ${
              isFullPayment 
                ? "bg-[#00ff88]/10 border-[#00ff88]/30" 
                : "bg-[#0099ff]/10 border-[#0099ff]/30"
            }`}>
              <div className={`text-xs font-medium mb-1 uppercase tracking-wide font-orbitron ${
                isFullPayment ? "text-[#00ff88]" : "text-[#0099ff]"
              }`}>
                {isFullPayment ? "PAIEMENT COMPLET" : "PAIEMENT PARTIEL"}
              </div>
              <div className={`text-lg font-bold font-mono ${
                isFullPayment ? "text-[#00ff88]" : "text-[#0099ff]"
              }`}>
                {numericAmount.toFixed(3)} TND
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
              disabled={numericAmount <= 0}
              className="py-2 bg-[#00ff88]/20 text-[#00ff88] font-bold rounded-lg border border-[#00ff88]/40 hover:bg-[#00ff88]/30 hover:border-[#00ff88] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
            >
              VALIDER
            </button>
          </div>

          {/* Footer cyber */}
          <div className="mt-3 text-center">
            <div className="text-xs text-[#00ffea]/50 font-orbitron tracking-widest">
              SMARTCASH PAYMENT SYSTEM ©
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}