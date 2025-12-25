import React, { useState, useEffect, useRef } from 'react';
import { Edit, MoreVertical } from 'lucide-react';
import CartItemModal from './CartItemModal';
import { CartItem } from '../../../types/product';  

interface CartListProps {
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onTotalChange: (total: number) => void;
}

const CartList: React.FC<CartListProps> = ({ items, onUpdateQty, onRemoveItem, onTotalChange }) => {
  const [contextMenu, setContextMenu] = useState<{
    item: CartItem;
    position: { top: number; left: number };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const formatQuantity = (qty: number) => {
    return parseFloat(qty.toFixed(3)).toString();
  };

  const handleItemClick = (e: React.MouseEvent, item: CartItem) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    let top: number;
    let left: number;

    if (isMobile) {
      top = e.clientY - containerRect.top;
      left = e.clientX - containerRect.left;
    } else {
      const modalWidth = 256;
      top = containerRect.top + (containerRect.height / 2);
      left = containerRect.right - modalWidth - 60;
      if (left < 10) left = 10;
    }

    setContextMenu({
      item,
      position: { top, left },
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    onTotalChange(total);
  }, [items, onTotalChange]);

  const containerHeight = items.length > 6 ? 'h-[300px]' : 'h-auto';

  return (
    <div className="text-white font-mono w-full relative" ref={containerRef}>
      {/* En-tête moderne avec effet numérique */}
      <div className="grid grid-cols-[25%_30%_20%_25%] md:grid-cols-[30%_30%_20%_20%] font-bold text-xs md:text-sm border-b border-amber-400/30 pb-3 mb-2">
        <span className="text-amber-300 uppercase tracking-wider">Qté</span>
        <span className="text-amber-300 uppercase tracking-wider pl-1 md:pl-0">Désignation</span>
        <span className="text-amber-300 uppercase tracking-wider text-right pr-2 md:pr-0">P.U</span>
        <span className="text-amber-300 uppercase tracking-wider text-right">Total</span>
      </div>

      {/* Liste des articles avec design numérique */}
      <div className={`${containerHeight} overflow-y-auto space-y-1`}>
        {items.map((item: CartItem, index) => (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(e, item)}
            className={`
              group grid grid-cols-[25%_30%_20%_25%] md:grid-cols-[30%_30%_20%_20%] items-center 
              text-xs md:text-sm py-3 px-2 rounded-xl border border-white/10 
              hover:border-amber-400/30 hover:bg-amber-400/5 cursor-pointer 
              transition-all duration-200 backdrop-blur-sm
              ${index % 2 === 0 ? 'bg-white/3' : 'bg-white/1'}
            `}
          >
            {/* Quantité avec badge moderne */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                {formatQuantity(item.quantity)}
              </span>
              <button className="opacity-0 group-hover:opacity-100 text-amber-400 hover:text-amber-300 p-1 transition-all duration-200 hover:scale-110">
                <MoreVertical size={14} />
              </button>
            </div>

            {/* Désignation avec effet de brillance */}
            <div className="truncate pl-1 md:pl-0 font-medium text-white/90 bg-gradient-to-r from-transparent to-white/5 px-2 py-1 rounded">
              {item.designation}
            </div>

            {/* Prix unitaire style compteur */}
            <div className="text-right pr-2 md:pr-0 font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
              {item.priceUnit.toFixed(3)}
            </div>

            {/* Prix total style compteur */}
            <div className="text-right font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
              {item.totalPrice.toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      {/* Indicateur de défilement moderne */}
      {items.length > 6 && (
        <div className="text-center text-xs text-amber-300/70 mt-3 bg-amber-400/10 py-2 rounded-lg border border-amber-400/20 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            <span>{items.length - 6} produit(s) supplémentaires - faites défiler</span>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Indicateur vide */}
      {items.length === 0 && (
        <div className="text-center py-8 text-white/50 border-2 border-dashed border-white/20 rounded-xl backdrop-blur-sm">
          <div className="text-amber-300/50 text-lg mb-2">🛒</div>
          <div className="text-sm">Panier vide</div>
          <div className="text-xs mt-1">Ajoutez des produits pour commencer</div>
        </div>
      )}

      {contextMenu && (
        <CartItemModal
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onUpdateQty={onUpdateQty}
          onRemoveItem={onRemoveItem}
        />
      )}
    </div>
  );
};

export default CartList;