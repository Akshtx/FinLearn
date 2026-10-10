import React, { useState } from 'react';
import { StockBasicData } from '../../types';
import { BROKERS } from '../../constants';
import MarketStatusIndicator from '../common/MarketStatusIndicator';

interface StockHeaderProps {
  stock: StockBasicData | null; // Allow null for loading state
}

const StockHeader: React.FC<StockHeaderProps> = ({ stock }) => {
  const [selectedBroker, setSelectedBroker] = useState(BROKERS[0]);

  if (!stock) {
    return (
      <div className="animate-pulse mb-6 p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  return (
    <div className="mb-6 p-6 bg-gray-800 rounded-lg shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-sky-400">{stock.name} <span className="text-xl text-gray-400">({stock.symbol} - {stock.exchange})</span></h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-300">Sector: {stock.sector} | Market Cap: {stock.marketCap}</p>
            <MarketStatusIndicator />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mt-3 sm:mt-0 w-full sm:w-auto">
            <div className="text-right flex-grow">
              <p className="text-4xl font-semibold text-gray-100">₹{stock.currentPrice.toFixed(2)}</p>
              <p className={`text-lg font-semibold ${changeColor}`}>
                {changeSign}{stock.change.toFixed(2)} ({changeSign}{stock.changePercent.toFixed(2)}%)
              </p>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="relative">
                    <select
                        value={selectedBroker.name}
                        onChange={(e) => {
                            const broker = BROKERS.find(b => b.name === e.target.value);
                            if (broker) setSelectedBroker(broker);
                        }}
                        className="appearance-none w-full bg-gray-700 border border-gray-600 text-white py-3 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                        aria-label="Select Broker"
                    >
                        {BROKERS.map(broker => (
                            <option key={broker.name} value={broker.name}>{broker.name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
                <a
                    href={selectedBroker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Trade on ${selectedBroker.name}`}
                    className="flex-shrink-0 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
                >
                    <span>Checkout</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;