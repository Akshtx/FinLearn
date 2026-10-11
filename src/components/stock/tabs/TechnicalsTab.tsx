import React, { useState, useEffect } from 'react';
import { AIAnalysisResponse, StockBasicData, PriceDataPoint, ChartInterval } from '../../../types';
import PriceHistoryChart from '../../charts/PriceHistoryChart';
import { getStockPriceHistory } from '../../../services/stockService';

interface TechnicalsTabProps {
  analysis: AIAnalysisResponse | null;
  stockData: StockBasicData | null;
}

const IndicatorDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-700">
    <span className="text-sm font-medium text-gray-400">{label}:</span>
    <span className="text-sm text-gray-100 font-semibold">{value}</span>
  </div>
);

const intervalButtons: { key: ChartInterval, label: string }[] = [
  { key: '5m', label: '5m' },
  { key: '15m', label: '15m' },
  { key: '1h', label: '1h' },
  { key: '1D', label: '1D' },
];

const TechnicalsTab: React.FC<TechnicalsTabProps> = ({ analysis, stockData }) => {
  const [activeInterval, setActiveInterval] = useState<ChartInterval>('5m');
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  useEffect(() => {
    if (!stockData?.symbol) return;

    const fetchHistory = async () => {
      setIsLoadingChart(true);
      setPriceHistory([]); // Clear old data before fetching
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
    if (isLoadingChart || !stockData || !['5m', '15m', '1h'].includes(activeInterval)) {
        return;
    }

    const lastPoint = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null;

    // Only add a new point if the price has actually changed since the last one.
    if (lastPoint && lastPoint.price === stockData.currentPrice) {
        return;
    }
    
    // Format current time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Avoid adding duplicate points for the same minute if the component re-renders quickly
    if (lastPoint && lastPoint.time === currentTime) {
       // If time is the same, update the last point's price instead of adding a new one
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
        // For intraday charts, keep a moving window of the last ~2 hours of 5m data to prevent clutter
        const maxPoints = activeInterval === '5m' ? 150 : 100;
        if (newHistory.length > maxPoints) {
            return newHistory.slice(newHistory.length - maxPoints);
        }
        return newHistory;
    });

}, [stockData?.currentPrice, activeInterval, isLoadingChart]);

  if (!analysis || !stockData) {
     return (
      <div className="grid md:grid-cols-2 gap-6 animate-pulse">
        <div className="bg-gray-800 p-4 rounded-lg shadow h-64"></div>
        <div className="bg-gray-800 p-4 rounded-lg shadow h-64"></div>
      </div>
    );
  }

  const { technicalIndicatorSummary, keyLevels } = analysis;

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
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
            <div className="w-full aspect-[16/9] bg-gray-750 rounded-md animate-pulse flex items-center justify-center">
                <p className="text-gray-400">Loading Chart Data...</p>
            </div>
        ) : (
            <PriceHistoryChart data={priceHistory} stockData={stockData} />
        )}
        <p className="text-xs text-gray-500 mt-2 text-center">Note: Chart displays live price updates. Use the brush below to zoom.</p>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
          <h4 className="text-xl font-semibold text-sky-400 mb-4">Indicator Summary</h4>
          <IndicatorDisplay label="RSI (14)" value={technicalIndicatorSummary.rsi} />
          <IndicatorDisplay label="MACD" value={technicalIndicatorSummary.macd} />
          <IndicatorDisplay label="Moving Averages" value={technicalIndicatorSummary.movingAverages} />
        </div>

        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
          <h4 className="text-xl font-semibold text-sky-400 mb-4">Key Levels</h4>
          <IndicatorDisplay label="Resistance 1" value={keyLevels.resistance1} />
          <IndicatorDisplay label="Support 1" value={keyLevels.support1} />
          {keyLevels.support2 && <IndicatorDisplay label="Support 2" value={keyLevels.support2} />}
        </div>
      </div>
    </div>
  );
};

export default TechnicalsTab;