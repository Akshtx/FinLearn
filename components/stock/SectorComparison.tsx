
import React from 'react';
import { Link } from 'react-router-dom';
import { StockBasicData } from '../../types';

interface SectorComparisonProps {
  currentStock: StockBasicData;
  peers: StockBasicData[];
}

const SectorComparison: React.FC<SectorComparisonProps> = ({ currentStock, peers }) => {
  if (peers.length === 0) {
    return null; // Don't render if there are no peers to compare to
  }

  const getChangeColor = (value: number) => (value >= 0 ? 'text-green-400' : 'text-red-400');

  return (
    <div className="bg-gray-850 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-100 mb-4">Top Peers in {currentStock.sector}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase text-left">
              <th className="py-2 px-3 font-medium">Stock</th>
              <th className="py-2 px-3 font-medium text-right">Last Price</th>
              <th className="py-2 px-3 font-medium text-right">% Change</th>
              <th className="py-2 px-3 font-medium text-right">Market Cap</th>
              <th className="py-2 px-3 font-medium text-right">P/E Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {peers.map(stock => (
              <tr 
                key={stock.symbol} 
                className="transition-colors hover:bg-gray-800"
              >
                <td className="py-3 px-3 font-medium">
                  <Link to={`/stock/${stock.symbol}`} className="text-sky-400 hover:text-sky-300 hover:underline">
                    {stock.name}
                  </Link>
                </td>
                <td className="py-3 px-3 text-right font-mono text-gray-200">₹{stock.currentPrice.toFixed(2)}</td>
                <td className={`py-3 px-3 text-right font-mono font-semibold ${getChangeColor(stock.changePercent)}`}>
                  {stock.changePercent.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-right font-mono text-gray-200">{stock.marketCap}</td>
                <td className="py-3 px-3 text-right font-mono text-gray-200">{stock.peRatio?.toFixed(2) || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectorComparison;
