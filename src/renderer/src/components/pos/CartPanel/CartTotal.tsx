import React from 'react';

interface CartTotalProps {
  total: number;
}

const CartTotal: React.FC<CartTotalProps> = ({ total }) => {
  return (
    <div className="p-3 shadow-xl bg-sidebar-pattern flex justify-between items-center font-semibold text-white font-poppins text-lg px-4 py-2 border-t border-white/20">
      <span>Total</span>
      <span className="text-[#ffff00] text-2xl">{total.toFixed(3)}</span>
    </div>
  );
};

export default CartTotal; 


