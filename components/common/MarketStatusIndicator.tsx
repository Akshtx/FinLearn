
import React, { useState, useEffect } from 'react';
import { isIndianMarketOpen } from '../../services/marketTime';

const MarketStatusIndicator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(isIndianMarketOpen());

  useEffect(() => {
    // Update the status every minute
    const intervalId = setInterval(() => {
      setIsOpen(isIndianMarketOpen());
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  const indicatorColor = isOpen ? 'bg-green-500' : 'bg-red-500';
  const text = isOpen ? 'MARKET LIVE' : 'MARKET CLOSED';

  return (
    <div className="flex items-center gap-2 text-xs font-semibold">
      <span className={`relative flex h-2 w-2`}>
        {isOpen && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorColor} opacity-75`}></span>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${indicatorColor}`}></span>
      </span>
      <span className={isOpen ? 'text-green-400' : 'text-red-400'}>{text}</span>
    </div>
  );
};

export default MarketStatusIndicator;
