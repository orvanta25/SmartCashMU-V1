"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/auth-context";
import { toast } from "react-toastify";
import qrRemiseAPI from "@renderer/api/qr-remise.api";
import { QrCode, X, Percent, Check, AlertCircle } from "lucide-react";

interface PaymentRemiseProps {
  onClose: () => void;
  onRemiseConfirm: (remisePercentage: number) => void;
  currentRemise: number;
  commandeId?: string;
}

export default function PaymentRemise({
  onClose,
  onRemiseConfirm,
  currentRemise,
  commandeId
}: PaymentRemiseProps) {
  const { user, entreprise } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [remisePercentage, setRemisePercentage] = useState<number>(currentRemise);
  const [scannedCode, setScannedCode] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  const numericButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "C"];
  const quickPercentages = [5, 10, 15, 20, 25, 50];

  useEffect(() => {
    setIsVisible(true);
    if (isAdmin) inputRef.current?.focus();

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
  }, [isAdmin]);

const processScannedCode = async (rawCode: string) => {
  if (!rawCode || !entreprise?.id || !user?.id) {
    toast.error("Code ou utilisateur invalide");
    return;
  }

  const cleaned = rawCode.trim().replace(/[\r\n]/g, "");
  setIsScanning(true);

  try {
    const match = cleaned.match(/QR-[A-Z0-9]{6,}/);
    const codeToUse = match ? match[0] : cleaned;

    const result = await qrRemiseAPI.scanQRCode(
      codeToUse,
      entreprise.id,
      user.id,
      commandeId // ⚠️ indispensable pour application auto
    );

    const finalResult = {
      ...result,
      qrData: {
        code: codeToUse,
      },
      rawInput: rawCode,
    };

    setScanResult(finalResult);

    if (!result.success) {
      toast.error(result.error || "Code invalide ou expiré");
      return;
    }

    // ✅ CAS 1 : APPLIQUÉ AUTOMATIQUEMENT
    if (result.application) {
      const { pourcentage } = result.validation;

      setRemisePercentage(pourcentage);
      setAutoApplied(true); // 🔑 IMPORTANT
      onRemiseConfirm(pourcentage);

      toast.success(
        `Remise ${pourcentage}% appliquée automatiquement (${result.application.remiseAppliquee.toFixed(2)} € économisés)`
      );

      setTimeout(onClose, 300);
      return;
    }

    // ✅ CAS 2 : VALIDÉ MAIS PAS APPLIQUÉ
    const { pourcentage } = result.validation;
    setRemisePercentage(pourcentage);

    toast.success(`Code valide : ${pourcentage}% prêt à être appliqué`);
  } catch (err: any) {
    toast.error(err?.message || "Erreur lors du scan du QR code");
  } finally {
    setIsScanning(false);
  }
};



  const handleConfirm = () => {
  if (autoApplied) return; 

  if (remisePercentage <= 0 || remisePercentage > 100) {
    toast.error("Veuillez saisir un pourcentage valide.");
    return;
  }

  onRemiseConfirm(remisePercentage);
  toast.success(`Remise de ${remisePercentage}% appliquée`);
  onClose();
};


  const handleRemoveRemise = () => {
     onRemiseConfirm(0);
    toast.info("Remise supprimée");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && scannedCode.trim()) {
      processScannedCode(scannedCode);
    } else if (e.key === "Enter") {
      handleConfirm();
    }
    if (e.key === "Escape") onClose();
  };

  const handleNumericInput = (value: string | number) => {
    if (!isAdmin) return;
    if (value === "⌫") {
      setRemisePercentage(prev => {
        const str = prev.toString();
        return str.length > 1 ? parseFloat(str.slice(0, -1)) || 0 : 0;
      });
    } else if (value === "C") {
      setRemisePercentage(0);
    } else if (typeof value === "number") {
      setRemisePercentage(prev => {
        const newValue = parseFloat(prev.toString() + value.toString());
        return newValue > 100 ? 100 : newValue;
      });
    }
  };

  const simulateScan = () => {
    const testCode = `QR-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setScannedCode(testCode);
    processScannedCode(testCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div
        className={`relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#0a0e17] to-[#050811] border border-[#00ffea]/30 shadow-2xl shadow-[#00ffea]/20 transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="rounded-t-2xl p-3 bg-gradient-to-r from-[#ffd700]/20 to-[#ffa500]/20 border-b border-[#ffd700]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse shadow-lg shadow-[#ffd700]/40"></div>
              <h2 className="text-base font-bold font-orbitron tracking-widest text-[#ffd700]">
                REMISE
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs bg-[#ffd700]/10 px-2 py-1 rounded-full border border-[#ffd700]/30 font-mono text-[#ffd700]">
                QR SYSTEM
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-[#ffd700]/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-[#ffd700]" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          {currentRemise > 0 && (
            <div className="mb-4 p-3 bg-[#ffd700]/10 rounded-xl border border-[#ffd700]/30 text-center">
              <div className="text-xs text-[#ffd700] uppercase tracking-wider mb-1 font-orbitron">
                REMISE ACTUELLE
              </div>
              <div className="text-2xl font-bold text-[#ffd700] font-mono">{currentRemise}%</div>
            </div>
          )}

          {/* Scan QR Code */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[#00ffea]/70 uppercase tracking-wide font-orbitron flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                SCAN QR CODE REMISE
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && processScannedCode(scannedCode)}
                placeholder="Scannez le QR code (ex: QR-ABC123)"
                className="w-full text-base font-mono text-white bg-[#050811] border-2 border-[#00ffea]/40 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-[#00ffea] transition-all disabled:opacity-50"
                disabled={isScanning}
              />
              {isScanning && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00ffea] border-t-transparent"></div>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <button
                onClick={() => processScannedCode(scannedCode)}
                disabled={isScanning || !scannedCode.trim()}
                className="w-full py-2 bg-gradient-to-r from-[#00ffea]/20 to-[#00ffea]/10 text-[#00ffea] font-bold rounded-lg border border-[#00ffea]/40 hover:bg-[#00ffea]/20 disabled:opacity-30 transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#00ffea] border-t-transparent mr-2"></div>
                    Validation...
                  </>
                ) : (
                  "Valider le Code"
                )}
              </button>
            </div>

            {/* Résultat du scan */}
            {scanResult && (
  <div className={`mt-3 p-3 rounded-lg border ${scanResult.success ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-[#ff416c]/10 border-[#ff416c]/30'}`}>
    <div className="flex items-start gap-2">
      {scanResult.success ? (
        <Check className="w-4 h-4 text-[#00ff88] mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[#ff416c] mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${scanResult.success ? 'text-[#00ff88]' : 'text-[#ff416c]'}`}>
          {scanResult.success ? '✓ Code validé!' : '✗ Erreur'}
        </p>
        
        {/* ✅ AFFICHER LES DONNÉES DU QR CODE SI DISPONIBLE */}
        {scanResult.qrData && (
          <div className="mt-2 p-2 bg-black/30 rounded border border-[#00ffea]/20">
            <p className="text-xs text-[#00ffea] mb-1">Données du QR code:</p>
            <div className="text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Entreprise:</span>
                <span className="text-[#ffd700]">{scanResult.qrData.entreprise}</span>
              </div>
              <div className="flex justify-between">
                <span>Code:</span>
                <span className="text-[#00ffea] font-mono">{scanResult.qrData.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Remise:</span>
                <span className="text-[#00ff88]">{scanResult.qrData.pourcentage}%</span>
              </div>
              {scanResult.qrData.validUntil && (
                <div className="flex justify-between">
                  <span>Valide jusqu'au:</span>
                  <span className="text-gray-400">
                    {new Date(scanResult.qrData.validUntil).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {scanResult.success && scanResult.validation && (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-[#00ff88]" />
              <span className="text-[#00ff88] text-sm">
                Remise: {scanResult.validation.pourcentage}%
              </span>
            </div>
            {scanResult.application && (
              <div className="mt-1 space-y-1">
                <p className="text-xs text-[#00ff88]/80">
                  Économie: {scanResult.application.remiseAppliquee.toFixed(2)} €
                </p>
                <p className="text-xs text-[#00ff88]/60">
                  Total: {scanResult.application.totalAvant.toFixed(2)} € → {scanResult.application.totalApres.toFixed(2)} €
                </p>
              </div>
            )}
          </div>
        )}
        <p className="text-xs mt-1 opacity-80">
          {scanResult.message || scanResult.error}
        </p>
      </div>
    </div>
  </div>
)}
          </div>

          {/* Saisie manuelle seulement pour admin */}
          {isAdmin && (
            <>
              <div className="mb-4">
                <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">
                  SAISIE MANUELLE REMISE
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={remisePercentage}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setRemisePercentage(Math.min(100, Math.max(0, value)));
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="0.00"
                  className="w-full text-xl font-mono text-white bg-[#050811] border-2 border-[#ffd700]/40 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-[#ffd700] focus:bg-[#0a0e17]"
                />
              </div>

              <div className="mb-4">
                <div className="text-xs text-[#00ffea]/70 mb-2 uppercase tracking-wide font-orbitron">
                  REMISES RAPIDES
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {quickPercentages.map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => setRemisePercentage(percentage)}
                      className="py-1 text-xs font-medium bg-[#ffd700]/10 text-[#ffd700] rounded border border-[#ffd700]/30 hover:bg-[#ffd700]/20 hover:border-[#ffd700] hover:text-white transition-all duration-200 font-orbitron"
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-3 gap-1">
                  {numericButtons.map((button) => (
                    <button
                      key={button}
                      onClick={() => handleNumericInput(button)}
                      className={`py-2 text-base font-bold rounded-lg border-2 transition-all duration-200 active:scale-95 font-orbitron ${
                        button === "⌫"
                          ? "bg-[#ff416c]/20 text-[#ff416c] border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c]/40 hover:text-white"
                          : button === "C"
                          ? "bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/40 hover:bg-[#ffd700]/30 hover:border-[#ffd700]/40 hover:text-white"
                          : "bg-[#ffd700]/5 text-white border-[#ffd700]/20 hover:bg-[#ffd700]/10 hover:border-[#ffd700] hover:text-[#ffd700]"
                      }`}
                    >
                      {button}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Indicateur visuel remise */}
          <div className="mb-4 p-3 bg-[#00ffea]/5 rounded-xl border border-[#00ffea]/20">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#00ffea]/70 font-orbitron tracking-wide">NOUVELLE REMISE:</span>
              <span className="text-[#ffd700] font-bold font-mono text-lg">{remisePercentage}%</span>
            </div>
            {remisePercentage > 0 && (
              <div className="mt-2 w-full bg-[#00ffea]/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#ffd700] to-[#ffa500] h-2 rounded-full transition-all duration-300 shadow-lg shadow-[#ffd700]/30"
                  style={{ width: `${remisePercentage}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Info QR Code */}

          {/* Boutons action */}
          <div className={`grid gap-2 ${currentRemise > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
            <button
              onClick={onClose}
              className="py-2 bg-[#ff416c]/20 text-[#ff416c] font-bold rounded-lg border border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c] hover:text-white transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
            >
              ANNULER
            </button>

            {currentRemise > 0 && isAdmin && (
              <button
                onClick={handleRemoveRemise}
                className="py-2 bg-[#ff416c]/20 text-[#ff416c] font-bold rounded-lg border border-[#ff416c]/40 hover:bg-[#ff416c]/30 hover:border-[#ff416c] hover:text-white transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
              >
                SUPPRIMER
              </button>
            )}

           {!autoApplied && (  
              <button
                onClick={handleConfirm}
                disabled={remisePercentage < 0 || remisePercentage > 100}
                className="py-2 bg-[#00ff88]/20 text-[#00ff88] font-bold rounded-lg border border-[#00ff88]/40 hover:bg-[#00ff88]/30 hover:border-[#00ff88] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-orbitron tracking-wide text-sm"
              >
                CONFIRMER
              </button>
                )}

          </div>

          {/* Footer */}
          <div className="mt-3 text-center">
            <div className="text-xs text-[#00ffea]/50 font-orbitron tracking-widest">
              SMARTCASH REMISE SYSTEM ©
            </div>
            <div className="text-[10px] text-[#00ffea]/30 mt-1">
              {isAdmin ? "Mode Administrateur" : "Mode Caissier"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}