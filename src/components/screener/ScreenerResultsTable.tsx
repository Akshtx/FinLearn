
import React from 'react';
import { Link } from 'react-router-dom';
import { StockBasicData } from '../../types';

interface ScreenerResultsTableProps {
  stocks: StockBasicData[];
}

const ScreenerResultsTable: React.FC<ScreenerResultsTableProps> = ({ stocks }) => {
  if (stocks.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400 bg-gray-800/50 rounded-lg">
        No stocks found matching your criteria. Please try a different query.
      </div>
    );
  }

  const getChangeColor = (value: number) => (value >= 0 ? 'text-green-400' : 'text-red-400');

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase text-left">
            <th className="py-3 px-4 font-medium">Stock Name</th>
            <th className="py-3 px-4 font-medium text-right">Price (₹)</th>
            <th className="py-3 px-4 font-medium text-right">% Change</th>
            <th className="py-3 px-4 font-medium text-right">Market Cap</th>
            <th className="py-3 px-4 font-medium text-right">P/E Ratio</th>
            <th className="py-3 px-4 font-medium text-right">Promoter Holding (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {stocks.map(stock => (
            <tr key={stock.symbol} className="transition-colors hover:bg-gray-750">
              <td className="py-3 px-4 font-medium">
                <Link to={`/stock/${stock.symbol}`} className="text-sky-400 hover:text-sky-300 hover:underline">
                  <div>{stock.name}</div>
                  <div className="text-xs text-gray-500">{stock.symbol}</div>
                </Link>
              </td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">{stock.currentPrice.toFixed(2)}</td>
              <td className={`py-3 px-4 text-right font-mono font-semibold ${getChangeColor(stock.changePercent)}`}>
                {stock.changePercent.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">{stock.marketCap}</td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">{stock.peRatio?.toFixed(2) || 'N/A'}</td>
              <td className="py-3 px-4 text-right font-mono text-gray-200">{stock.promoterHolding?.toFixed(2) || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScreenerResultsTable;
