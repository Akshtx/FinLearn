import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StockHeader from '../components/stock/StockHeader';
import VerdictCard from '../components/stock/VerdictCard';
import SuggestionPortal from '../components/stock/SuggestionPortal';
import TabbedContent from '../components/stock/TabbedContent';
import SummaryScoreTab from '../components/stock/tabs/SummaryScoreTab';
import FundamentalsTab from '../components/stock/tabs/FundamentalsTab';
import NewsTab from '../components/stock/tabs/NewsTab';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import SectorComparison from '../components/stock/SectorComparison';
import SectorOutlook from '../components/stock/SectorOutlook';
import { TabKey, MLValuationResponse } from '../types';
import useStockAnalysis from '../hooks/useStockAnalysis';
import LivePriceChartContainer from '../components/stock/LivePriceChartContainer';
import Chatbot from '../components/chatbot/Chatbot';
import { getMLValuation } from '../services/mlValuationService';

const StockDashboardPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { stockBasicData, aiAnalysis, stockFundamentalData, corporateAnnouncements, sectorPeers, isLoading, error } = useStockAnalysis(symbol || '');
  const [mlValuation, setMlValuation] = useState<MLValuationResponse | null>(null);

  useEffect(() => {
    if (symbol) {
      setMlValuation(null);
      getMLValuation(symbol)
        .then(data => setMlValuation(data))
        .catch(err => console.error("Error fetching ML valuation:", err));
    }
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-300">Analyzing {symbol}... Please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-red-400 mb-2">Error Fetching Stock Data</h2>
        <p className="text-gray-300">{error}</p>
        <p className="mt-4 text-gray-400">Please try again or search for a different stock.</p>
      </div>
    );
  }

  if (!stockBasicData || !aiAnalysis) {
    return <div className="text-center py-10 text-xl text-gray-400">Stock data not found for {symbol}.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <StockHeader stock={stockBasicData} />

      <div className="mt-8">
        <LivePriceChartContainer stockData={stockBasicData} analysis={aiAnalysis} />
      </div>
      
      <div className="bg-gray-850 shadow-2xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 mt-8">
        <VerdictCard analysis={aiAnalysis} mlValuation={mlValuation} />
        <SuggestionPortal suggestions={aiAnalysis.suggestionPortal} />
      </div>

      <div className="mt-8">
        <SectorOutlook outlook={aiAnalysis.sectorOutlook} sectorName={stockBasicData.sector} />
      </div>

      {sectorPeers.length > 0 && (
        <div className="mt-8">
          <SectorComparison currentStock={stockBasicData} peers={sectorPeers} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-1 text-center">All the Details of {stockBasicData.name}</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">Explore the data that powers Finlearn AI insights.</p>
        <TabbedContent>
          {(activeTab: TabKey) => (
            <div className="bg-gray-850 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 min-h-[400px]">
              {activeTab === TabKey.SUMMARY && <SummaryScoreTab stockData={stockBasicData} analysis={aiAnalysis} />}
              {activeTab === TabKey.FUNDAMENTALS && <FundamentalsTab data={stockFundamentalData} />}
              {activeTab === TabKey.NEWS && <NewsTab newsItems={aiAnalysis.newsAnalysis} announcements={corporateAnnouncements} />}
            </div>
          )}
        </TabbedContent>
      </div>
      <DisclaimerBanner />
      <Chatbot stockData={stockBasicData} />
    </div>
  );
};

export default StockDashboardPage;