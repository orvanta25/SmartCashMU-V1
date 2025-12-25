// components/pos/CartPanel/Calculator.tsx
"use client";

import React from 'react';

interface CalculatorProps {
  onButtonClick: (value: string) => void;
  currentValue: string; 
}

const Calculator: React.FC<CalculatorProps> = ({ onButtonClick, currentValue }) => {
  return (
    <div className="p-3 bg-black/20 ">
      {currentValue && (
        <div className="text-white text-right mb-2 text-xl bg-black/30 p-2 rounded">
          {currentValue}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {['7', '8', '9', 'C', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
          <button 
            key={btn}
            className="p-2 bg-black/30 rounded hover:bg-cyber-green transition"
            onClick={() => onButtonClick(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;