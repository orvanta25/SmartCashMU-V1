import React, { useEffect, useRef, useState } from "react";
import { X, Trash, Plus, Minus, Check } from "lucide-react";
import { CartItem } from "../../../types/product";

interface CartItemModalProps {
  item: CartItem;
  position: { top: number; left: number };
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

const safeNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const CartItemModal: React.FC<CartItemModalProps> = ({
  item,
  position,
  onClose,
  onUpdateQty,
  onRemoveItem,
}) => {
  // Sécurité : si item invalide -> rien
  if (!item || !item.id) return null;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const [qty, setQty] = useState<number>(safeNumber(item.quantity));
  const [localPriceUnit, setLocalPriceUnit] = useState<number>(
    safeNumber(item.priceUnit)
  );

  // calcul local affichage du total (ne remplace pas le total global)
  const localTotal = Number((safeNumber(qty) * safeNumber(localPriceUnit)).toFixed(3));

  useEffect(() => {
    // empecher overflow hors écran : ajuste left/top si besoin
    const el = modalRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 8;
    let newLeft = position.left;
    let newTop = position.top;

    // si dépasse à droite, décale vers la gauche
    if (rect.right > window.innerWidth - padding) {
      newLeft = Math.max(padding, position.left - (rect.right - (window.innerWidth - padding)));
    }
    // si dépasse en bas, décale vers le haut
    if (rect.bottom > window.innerHeight - padding) {
      newTop = Math.max(padding, position.top - (rect.bottom - (window.innerHeight - padding)));
    }

    // positionnement via style
    el.style.left = `${Math.round(newLeft)}px`;
    el.style.top = `${Math.round(newTop)}px`;
  }, [position.left, position.top]);

  // handlers
  const inc = () => setQty((q) => Number((q + 1).toFixed(3)));
  const dec = () => setQty((q) => Number(Math.max(0, +(q - 1)).toFixed(3)));

  const handleApply = () => {
    // appeler seulement onUpdateQty — CartList recalculera le total
    try {
      onUpdateQty(item.id, qty);
    } catch (err) {
      console.error("onUpdateQty failed:", err);
    } finally {
      onClose();
    }
  };

  const handleRemove = () => {
    try {
      onRemoveItem(item.id);
    } catch (err) {
      console.error("onRemoveItem failed:", err);
    } finally {
      onClose();
    }
  };

  // empêcher propagation des clics pour ne pas fermer le modal involontairement
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    // wrapper absolu pour placer le modal en top/left
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      style={{ pointerEvents: "auto" }}
    >
      <div
        ref={modalRef}
        onClick={stop}
        className="absolute w-64 bg-orange-800 text-lg text-shadow-white rounded-lg shadow-lg p-3"
        // initial position ; useEffect repositionnera précisément
        style={{ left: position.left, top: position.top, transform: "translate(0, -50%)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">{item.designation ?? "Article"}</div>
          <button onClick={onClose} className="p-1">
            <X size={16} />
          </button>
        </div>

        <div className="text-xs text-shadow-2xs-white/80 mb-2">
          PU: {safeNumber(localPriceUnit).toFixed(3)} • Stock: {safeNumber(item.quantity).toFixed(3)}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={dec}
            aria-label="decrease"
            className="px-2 py-1 rounded bg-white/5"
            type="button"
          >
            <Minus size={14} />
          </button>
          <input
            value={qty}
            onChange={(e) => {
              const v = safeNumber(e.target.value);
              setQty(Number(v.toFixed(3)));
            }}
            className="w-full text-right bg-transparent border border-white/10 rounded px-2 py-1"
            type="number"
            step="0.001"
            min={0}
          />
          <button
            onClick={inc}
            aria-label="increase"
            className="px-2 py-1 rounded bg-cyan-300/5"
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="text-sm">Total local</div>
          <div className="text-sm font-semibold">{localTotal.toFixed(3)}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded"
            type="button"
          >
            <Check size={14} /> Appliquer
          </button>

          <button
            onClick={handleRemove}
            className="w-12 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white py-2 rounded"
            type="button"
            aria-label="supprimer"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemModal;
