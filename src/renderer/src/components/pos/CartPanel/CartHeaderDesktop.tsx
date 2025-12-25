import React, { useEffect, useRef, useState } from 'react';

interface CartHeaderDesktopProps {
  companyName: string;
  city: string;
  onScan: (barcode: string) => void;
  scannedCode?: string;
  onChangeScannedCode?: (value: string) => void;
  isLoading?: boolean;
  error?: string;
}

const SCAN_MAX_DURATION_MS = 500;
const SCAN_PAUSE_MS = 150;

const CartHeaderDesktop: React.FC<CartHeaderDesktopProps> = ({
  companyName,
  city,
  onScan,
  scannedCode = '',
  onChangeScannedCode,
  isLoading = false,
  error = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const sequenceStartRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const [internalCode, setInternalCode] = useState(scannedCode);

  // Sync controlled prop if used
  useEffect(() => {
    setInternalCode(scannedCode);
  }, [scannedCode]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const triggerScan = (code: string) => {
    if (!code) return;
    onScan(code);
    if (onChangeScannedCode) {
      onChangeScannedCode(''); // reset external if controlled
    }
    setInternalCode(''); // reset internal
    sequenceStartRef.current = null;
    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const now = Date.now();

    // début d'une séquence si champ était vide
    if (!internalCode) {
      sequenceStartRef.current = now;
    }

    setInternalCode(value);
    if (onChangeScannedCode) {
      onChangeScannedCode(value);
    }

    // clear ancien timeout
    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
    }

    // poser un délai pour juger si c'est un scan
    pauseTimeoutRef.current = window.setTimeout(() => {
      const seqStart = sequenceStartRef.current ?? now;
      const duration = now - seqStart;
      // heuristique : entrée rapide (scan) si durée totale < SCAN_MAX_DURATION_MS et longueur suffisante
      if (value && value.length >= 3 && duration <= SCAN_MAX_DURATION_MS) {
        triggerScan(value);
      }
      // sinon, attente manuelle (l'utilisateur devra appuyer Enter)
    }, SCAN_PAUSE_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log(e.key)
     if (e.ctrlKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      e.stopPropagation();
      console.log("Blocked Ctrl + M from scanner");
    }
    if (e.key === 'Enter' && internalCode) {
      triggerScan(internalCode);
    }
  };

  return (
    <header className="w-full p-4 bg-transparent flex flex-col gap-3">
      {/* En-tête avec style numérique moderne */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-lg font-mono tracking-wide">{companyName}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-white/80 font-medium text-sm font-mono">{city}</span>
        </div>
      </div>

      {/* Zone de scan avec design numérique */}
      <div className="w-full relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={isLoading ? '🔄 Scan en cours...' : '📷 Scanner code-barres ici'}
            className={`w-full font-mono text-white bg-white/10 border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-white/50 ${
              error 
                ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                : 'border-amber-400/50 focus:border-amber-400 focus:ring-amber-400/20'
            } ${isLoading ? 'animate-pulse' : ''}`}
            value={internalCode}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          {/* Indicateur de statut */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            ) : error ? (
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            ) : internalCode ? (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="text-white/50">↵</div>
            )}
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-sm font-mono bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            <span>{error}</span>
          </div>
        )}

        {/* Indicateur de scan actif */}
        <div className="mt-2 flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="font-mono">SCANNER ACTIF</span>
          </div>
          <span className="font-mono">AUTO-DÉTECTION</span>
        </div>
      </div>
    </header>
  );
};

export default CartHeaderDesktop;