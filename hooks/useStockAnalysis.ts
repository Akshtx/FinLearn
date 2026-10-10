import { useState, useEffect } from 'react';
import { 
  StockBasicData, 
  AIAnalysisResponse, 
  StockFundamentalData, 
  NewsItemRaw, 
  CorporateAnnouncement,
  PriceDataPoint
} from '../types';
import { 
  getStockBasicData, 
  getStockFundamentalData, 
  getNewsItemsRaw, 
  getCorporateAnnouncements,
  getSectorPeers
} from '../services/stockService';
import { getAIStockAnalysis } from '../services/geminiService';
import { isIndianMarketOpen } from '../services/marketTime';

interface UseStockAnalysisReturn {
  stockBasicData: StockBasicData | null;
  aiAnalysis: AIAnalysisResponse | null;
  stockFundamentalData: StockFundamentalData | null;
  corporateAnnouncements: CorporateAnnouncement[];
  sectorPeers: StockBasicData[];
  isLoading: boolean;
  error: string | null;
}

const useStockAnalysis = (stockSymbol: string): UseStockAnalysisReturn => {
  const [stockBasicData, setStockBasicData] = useState<StockBasicData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [stockFundamentalData, setStockFundamentalData] = useState<StockFundamentalData | null>(null);
  const [corporateAnnouncements, setCorporateAnnouncements] = useState<CorporateAnnouncement[]>([]);
  const [sectorPeers, setSectorPeers] = useState<StockBasicData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Initialized to false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataForEffect = async (symbolToFetch: string) => {
      setIsLoading(true);
      setError(null);
      // Reset data states for the new fetch
      setStockBasicData(null);
      setAiAnalysis(null);
      setStockFundamentalData(null);
      setCorporateAnnouncements([]);
      setSectorPeers([]);

      try {
        // Fetch all data in parallel where possible
        const [basicData, fundamentalDataResult, newsItemsRawResult, announcementsResult] = await Promise.all([
          getStockBasicData(symbolToFetch),
          getStockFundamentalData(symbolToFetch),
          getNewsItemsRaw(symbolToFetch),
          getCorporateAnnouncements(symbolToFetch),
        ]);

        if (!basicData) {
          throw new Error(`Stock data not found for symbol: ${symbolToFetch}`);
        }
        setStockBasicData(basicData);
        setStockFundamentalData(fundamentalDataResult); // Can be null
        setCorporateAnnouncements(announcementsResult || []); // Can be empty array
        
        // Fetch sector peers after getting basic data
        if (basicData.sector) {
          const peerIdentifiers = await getSectorPeers(basicData.sector, symbolToFetch);
          const peerDataPromises = peerIdentifiers.map(p => getStockBasicData(p.symbol));
          const peerData = await Promise.all(peerDataPromises);
          setSectorPeers(peerData.filter((p): p is StockBasicData => p !== null));
        }

        // Only proceed to AI analysis if basic data is found
        const aiData = await getAIStockAnalysis(basicData, newsItemsRawResult || []);
        setAiAnalysis(aiData);

      } catch (err) {
        console.error("Error fetching stock analysis data:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        // Clear data on error as well
        setStockBasicData(null);
        setAiAnalysis(null);
        setStockFundamentalData(null);
        setCorporateAnnouncements([]);
        setSectorPeers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (stockSymbol) {
      fetchDataForEffect(stockSymbol);
    } else {
      // If stockSymbol is not present (e.g., empty string, null, undefined)
      // Reset all states to default
      setIsLoading(false);
      setError(null);
      setStockBasicData(null);
      setAiAnalysis(null);
      setStockFundamentalData(null);
      setCorporateAnnouncements([]);
      setSectorPeers([]);
    }
  }, [stockSymbol]); // Only re-run the effect if stockSymbol changes

  // Effect for simulating live price ticks for the main stock
  useEffect(() => {
    // Don't run the interval if there's no data or if it's currently loading new data
    if (!stockBasicData || isLoading) {
      return;
    }

    const intervalId = setInterval(() => {
      // Only update prices if the market is open
      if (!isIndianMarketOpen()) {
        return;
      }

      setStockBasicData(prevData => {
        if (!prevData) return null;

        // Simulate a new price tick with small, realistic variations
        const variation = (Math.random() - 0.49) * (prevData.currentPrice * 0.0005);
        const newPrice = parseFloat((prevData.currentPrice + variation).toFixed(2));

        // Recalculate change based on the stable 'close' price
        const newChange = newPrice - prevData.close;
        const newChangePercent = (newChange / prevData.close) * 100;

        // Update daily high and low
        const newHigh = Math.max(prevData.high, newPrice);
        const newLow = Math.min(prevData.low, newPrice);

        return {
          ...prevData,
          currentPrice: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          high: newHigh,
          low: newLow,
        };
      });
    }, 5000); // Update every 5 seconds

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [stockBasicData, isLoading]); // Re-run effect if stock data changes or loading state toggles

  // Effect for simulating live price ticks for sector peers
  useEffect(() => {
    if (sectorPeers.length === 0 || isLoading) {
      return;
    }

    const intervalId = setInterval(() => {
      // Only update prices if the market is open
      if (!isIndianMarketOpen()) {
        return;
      }

      setSectorPeers(prevPeers => {
        return prevPeers.map(peer => {
          if (!peer) return peer;

          // Simulate a new price tick with small, realistic variations
          const variation = (Math.random() - 0.49) * (peer.currentPrice * 0.0005);
          const newPrice = parseFloat((peer.currentPrice + variation).toFixed(2));
          const newChange = newPrice - peer.close;
          const newChangePercent = (newChange / peer.close) * 100;
          const newHigh = Math.max(peer.high, newPrice);
          const newLow = Math.min(peer.low, newPrice);

          return {
            ...peer,
            currentPrice: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high: newHigh,
            low: newLow,
          };
        });
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, [sectorPeers, isLoading]);


  return { stockBasicData, aiAnalysis, stockFundamentalData, corporateAnnouncements, sectorPeers, isLoading, error };
};

export default useStockAnalysis;