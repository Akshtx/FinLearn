import React, { useState, useEffect } from 'react';
import { AIAnalysisResponse, StockBasicData, PriceDataPoint, ChartInterval } from '../../types';
import PriceHistoryChart from '../charts/PriceHistoryChart';
import { getStockPriceHistory } from '../../services/stockService';

interface LivePriceChartContainerProps {
  analysis: AIAnalysisResponse | null;
  stockData: StockBasicData | null;
}

const intervalButtons: { key: ChartInterval, label: string }[] = [
  { key: '1m', label: '1m' },
  { key: '5m', label: '5m' },
  { key: '15m', label: '15m' },
  { key: '1h', label: '1h' },
  { key: '1D', label: '1D' },
];

const LivePriceChartContainer: React.FC<LivePriceChartContainerProps> = ({ analysis, stockData }) => {
  const [activeInterval, setActiveInterval] = useState<ChartInterval>('1m');
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    if (!stockData?.symbol) return;

    const fetchHistory = async () => {
      setIsLoadingChart(true);
      setPriceHistory([]);
      try {
        const history = await getStockPriceHistory(stockData.symbol, activeInterval);
        setPriceHistory(history);
      } catch (error) {
        console.error("Failed to fetch price history:", error);
        setPriceHistory([]);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchHistory();
  }, [stockData?.symbol, activeInterval]);


  useEffect(() => {
    if (isLoadingChart || !stockData || !['1m', '5m', '15m', '1h'].includes(activeInterval)) {
        return;
    }

    const lastPoint = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null;

    if (lastPoint && lastPoint.price === stockData.currentPrice) {
        return;
    }
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (lastPoint && lastPoint.time === currentTime) {
       setPriceHistory(prev => {
           const updatedHistory = [...prev];
           updatedHistory[updatedHistory.length - 1] = { ...lastPoint, price: stockData.currentPrice };
           return updatedHistory;
       });
       return;
    }

    const newPoint: PriceDataPoint = {
        time: currentTime,
        price: stockData.currentPrice,
    };

    setPriceHistory(prev => {
        const newHistory = [...prev, newPoint];
        const maxPoints = activeInterval === '1m' ? 390 : activeInterval === '5m' ? 150 : 100;
        if (newHistory.length > maxPoints) {
            return newHistory.slice(newHistory.length - maxPoints);
        }
        return newHistory;
    });

}, [stockData?.currentPrice, activeInterval, isLoadingChart]);

  if (!analysis || !stockData) {
     return (
        <div className="bg-gray-800 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 animate-pulse">
            <div className="w-full aspect-[9/2] bg-gray-700 rounded-lg"></div>
        </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h4 className="text-xl font-semibold text-sky-400">Live Price Chart</h4>
            <div className="flex items-center gap-1 bg-gray-700 p-1 rounded-md mt-2 sm:mt-0">
            {intervalButtons.map(interval => (
                <button
                    key={interval.key}
                    onClick={() => setActiveInterval(interval.key)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                        activeInterval === interval.key 
                        ? 'bg-sky-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {interval.label}
                </button>
            ))}
            </div>
        </div>
        {isLoadingChart ? (
            <div className="w-full aspect-[9/2] bg-gray-700 rounded-md animate-pulse flex items-center justify-center">
                <p className="text-gray-400">Loading Chart Data...</p>
            </div>
        ) : (
            <PriceHistoryChart data={priceHistory} stockData={stockData} />
        )}
        <p className="text-xs text-gray-500 mt-2 text-center">Note: Chart displays live price updates. Use the brush below to zoom.</p>
    </div>
  );
};

export default LivePriceChartContainer;