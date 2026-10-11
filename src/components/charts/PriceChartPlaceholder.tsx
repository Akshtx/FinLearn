
import React from 'react';

interface PriceChartPlaceholderProps {
  stockSymbol: string;
  stockName: string;
  chartUrl?: string; // Optional URL for a static chart image
}

const PriceChartPlaceholder: React.FC<PriceChartPlaceholderProps> = ({ stockSymbol, stockName, chartUrl }) => {
  // Use a generic placeholder image from picsum.photos if no specific chartUrl is provided
  const imageUrl = chartUrl || `https://picsum.photos/seed/${stockSymbol}/600/300`;

  return (
    <div className="w-full aspect-[16/9] bg-gray-700 rounded-md overflow-hidden flex items-center justify-center relative shadow-inner">
      <img 
        src={imageUrl} 
        alt={`${stockName} Price Chart`} 
        className="w-full h-full object-cover" 
        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${stockSymbol}_fallback/600/300`; }} // Fallback image
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center p-4">
        <h5 className="text-lg font-semibold text-white text-center">{stockName} ({stockSymbol})</h5>
        <p className="text-xs text-gray-300 text-center">Illustrative Price Chart</p>
      </div>
    </div>
  );
};

export default PriceChartPlaceholder;
