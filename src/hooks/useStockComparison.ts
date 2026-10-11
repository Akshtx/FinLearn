import { useState, useEffect } from 'react';
import { StockIdentifier, ComparisonData, StockBasicData, StockFundamentalData } from '../types';
import { getStockBasicData, getStockFundamentalData } from '../services/stockService';

interface UseStockComparisonReturn {
  stocksData: (ComparisonData | null)[];
  isLoading: boolean;
}

const useStockComparison = (stocks: StockIdentifier[]): UseStockComparisonReturn => {
  const [stocksData, setStocksData] = useState<(ComparisonData | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (stocks.length === 0) {
        setStocksData([]);
        return;
      }
      setIsLoading(true);
      
      const results = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const [basicData, fundamentalData] = await Promise.all([
              getStockBasicData(stock.symbol),
              getStockFundamentalData(stock.symbol),
            ]);

            if (!basicData) return null;
            
            return {
              ...basicData,
              fundamentals: fundamentalData,
            } as ComparisonData;

          } catch (error) {
            console.error(`Failed to fetch data for ${stock.symbol}`, error);
            return null;
          }
        })
      );
      
      setStocksData(results);
      setIsLoading(false);
    };

    fetchAllData();
  }, [stocks]); // Re-run when the list of stocks to compare changes

  return { stocksData, isLoading };
};

export default useStockComparison;
