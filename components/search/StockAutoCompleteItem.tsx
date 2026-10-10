
import React from 'react';
import { StockIdentifier } from '../../types';

interface StockAutoCompleteItemProps {
  stock: StockIdentifier;
  onSelect: (stock: StockIdentifier) => void;
}

const StockAutoCompleteItem: React.FC<StockAutoCompleteItemProps> = ({ stock, onSelect }) => {
  return (
    <li
      className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors duration-150 ease-in-out border-b border-gray-700 last:border-b-0"
      onClick={() => onSelect(stock)}
      onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing before onClick
    >
      <div className="font-semibold text-gray-100">{stock.name} <span className="text-xs text-sky-400">({stock.symbol})</span></div>
      <div className="text-sm text-gray-400">{stock.exchange}</div>
    </li>
  );
};

export default StockAutoCompleteItem;
