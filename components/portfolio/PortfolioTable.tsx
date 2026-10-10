
import React from 'react';
import { PortfolioHoldingWithMarketData } from '../../types';

interface PortfolioTableProps {
  portfolioData: PortfolioHoldingWithMarketData[];
  onRemove: (symbol: string) => void;
  isLoading: boolean;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolioData, onRemove, isLoading }) => {
  const getChangeColor = (value: number) => (value >= 0 ? 'text-green-400' : 'text-red-400');

  return (
    <div className="mt-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-gray-750">
          <tr className="text-xs text-gray-400 uppercase text-left">
            <th className="py-3 px-4 font-medium">Stock</th>
            <th className="py-3 px-4 font-medium text-right">Qty</th>
            <th className="py-3 px-4 font-medium text-right">Avg. Buy Price</th>
            <th className="py-3 px-4 font-medium text-right">Current Price</th>
            <th className="py-3 px-4 font-medium text-right">Day's Change</th>
            <th className="py-3 px-4 font-medium text-right">Current Value</th>
            <th className="py-3 px-4 font-medium text-right">Total P&L</th>
            <th className="py-3 px-4 font-medium text-right">Total Return</th>
            <th className="py-3 px-4 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {portfolioData.map(h => (
            <tr key={h.symbol} className="transition-colors hover:bg-gray-750">
              <td className="py-3 px-4 font-medium">
                <div className="text-gray-100">{h.name}</div>
                <div className="text-xs text-gray-500">{h.symbol}</div>
              </td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">{h.quantity}</td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">₹{h.buyPrice.toFixed(2)}</td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">₹{h.currentPrice.toFixed(2)}</td>
              <td className={`py-3 px-4 text-right font-mono font-semibold ${getChangeColor(h.changePercent)}`}>
                {h.changePercent.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className={`py-3 px-4 text-right font-mono font-semibold ${getChangeColor(h.totalPandL)}`}>
                ₹{h.totalPandL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </td>
              <td className={`py-3 px-4 text-right font-mono font-semibold ${getChangeColor(h.totalPandLPercent)}`}>
                {h.totalPandLPercent.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-center">
                <button 
                  onClick={() => onRemove(h.symbol)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${h.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && <div className="text-center p-4 text-xs text-gray-400">Updating prices...</div>}
    </div>
  );
};

export default PortfolioTable;
