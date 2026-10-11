import { useState, useEffect, useCallback } from 'react';
import { PortfolioHolding, PortfolioHoldingWithMarketData } from '../types';
import { getStockBasicData } from '../services/stockService';
import { isIndianMarketOpen } from '../services/marketTime';

const PORTFOLIO_STORAGE_KEY = 'finlearn-ai-portfolio';

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error reading portfolio from localStorage", error);
      return [];
    }
  });

  const [portfolioData, setPortfolioData] = useState<PortfolioHoldingWithMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings));
    } catch (error) {
      console.error("Error saving portfolio to localStorage", error);
    }
  }, [holdings]);

  const addHolding = (holding: PortfolioHolding) => {
    const existingByName = holdings.find(h => h.name.toLowerCase() === holding.name.toLowerCase());

    if (existingByName) {
      // If the same stock from a different exchange is being added, throw an error.
      if (existingByName.exchange !== holding.exchange) {
        throw new Error(`You already hold ${holding.name} from ${existingByName.exchange}. Cannot add the same stock from multiple exchanges.`);
      }
      
      // If it's the same stock from the same exchange, update the existing one.
      setHoldings(prev => {
        return prev.map(h => {
          if (h.symbol === holding.symbol) {
            const totalShares = h.quantity + holding.quantity;
            const newAvgPrice = ((h.quantity * h.buyPrice) + (holding.quantity * holding.buyPrice)) / totalShares;
            return { ...h, quantity: totalShares, buyPrice: newAvgPrice };
          }
          return h;
        });
      });
    } else {
      // If it's a new stock, add it.
      setHoldings(prev => [...prev, holding]);
    }
  };

  const removeHolding = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
  };
  
  const updateHolding = (symbol: string, quantity: number, buyPrice: number) => {
     setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, quantity, buyPrice } : h));
  };

  const fetchMarketData = useCallback(async () => {
    if (holdings.length === 0) {
      setPortfolioData([]);
      return;
    }

    setIsLoading(true);
    const marketDataPromises = holdings.map(h => getStockBasicData(h.symbol));
    const marketDataResults = await Promise.all(marketDataPromises);

    const enrichedData = holdings.map((holding, index) => {
      const marketData = marketDataResults[index];
      if (!marketData) {
        // Handle case where stock data couldn't be fetched
        return {
          ...holding,
          currentPrice: holding.buyPrice,
          changePercent: 0,
          currentValue: holding.quantity * holding.buyPrice,
          totalPandL: 0,
          totalPandLPercent: 0,
        };
      }
      const currentValue = holding.quantity * marketData.currentPrice;
      const costBasis = holding.quantity * holding.buyPrice;
      const totalPandL = currentValue - costBasis;
      const totalPandLPercent = (totalPandL / costBasis) * 100;

      return {
        ...holding,
        currentPrice: marketData.currentPrice,
        changePercent: marketData.changePercent,
        currentValue,
        totalPandL,
        totalPandLPercent: isNaN(totalPandLPercent) ? 0 : totalPandLPercent,
      };
    });

    setPortfolioData(enrichedData);
    setIsLoading(false);
  }, [holdings]);


  useEffect(() => {
    fetchMarketData(); // Fetch once on load to get latest data
    const interval = setInterval(() => {
      if (isIndianMarketOpen()) { // Only set up recurring fetch if market is open
        fetchMarketData();
      }
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return { holdings, addHolding, removeHolding, updateHolding, portfolioData, isLoading };
};