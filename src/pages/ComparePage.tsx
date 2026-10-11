import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from '../components/search/SearchBar';
import ComparisonTable from '../components/compare/ComparisonTable';
import useStockComparison from '../hooks/useStockComparison';
import { StockIdentifier, AIComparisonResponse, ComparisonData, MLValuationResponse } from '../types';
import { getAIComparison } from '../services/geminiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getBatchMLValuations } from '../services/mlValuationService';

const ComparePage: React.FC = () => {
  const [selectedStocks, setSelectedStocks] = useState<StockIdentifier[]>([]);
  const { stocksData, isLoading: isTableLoading } = useStockComparison(selectedStocks);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIComparisonResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [mlValuations, setMlValuations] = useState<{ [symbol: string]: MLValuationResponse }>({});

  useEffect(() => {
    if (selectedStocks.length > 0) {
      const symbols = selectedStocks.map(s => s.symbol);
      getBatchMLValuations(symbols)
        .then(res => {
          if (res.success && res.predictions) {
            const valMap: { [symbol: string]: MLValuationResponse } = {};
            Object.entries(res.predictions).forEach(([sym, val]) => {
              if (val && !('error' in val)) {
                valMap[sym.toUpperCase()] = val;
              }
            });
            setMlValuations(valMap);
          }
        })
        .catch(err => console.error("Error fetching batch ML valuations:", err));
    } else {
      setMlValuations({});
    }
  }, [selectedStocks]);


  const handleStockSelect = useCallback((stock: StockIdentifier) => {
    if (!selectedStocks.some(s => s.symbol === stock.symbol)) {
      if (selectedStocks.length < 5) {
        setSelectedStocks(prevStocks => [...prevStocks, stock]);
      }
    }
    setIsSearchModalOpen(false);
  }, [selectedStocks]);

  const handleRemoveStock = (symbolToRemove: string) => {
    setSelectedStocks(prevStocks => prevStocks.filter(s => s.symbol !== symbolToRemove));
    setAiAnalysis(null); // Reset AI analysis if a stock is removed
  };

  const proceedWithAnalysis = async () => {
    const validData = stocksData.filter((d): d is ComparisonData => d !== null);
    if (validData.length < 2) return;

    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const analysis = await getAIComparison(validData);
      setAiAnalysis(analysis);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to get AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAIAnalysis = () => {
    if (stocksData.some(s => s === null) || stocksData.length < 2) return;

    // Use a less strict sector check, comparing the base sector name before any " - "
    const sectors = new Set(stocksData.filter(s => s).map(s => s!.sector.trim().toLowerCase().split(' - ')[0]));
    if (sectors.size > 1) {
      setIsWarningModalOpen(true);
    } else {
      proceedWithAnalysis();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
          Stock Head-to-Head
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Compare stocks side-by-side and get an AI-powered verdict.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {selectedStocks.map((stock) => (
          <div key={stock.symbol} className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between text-center min-h-[90px]">
            <div className="flex-grow">
              <p className="font-bold text-gray-100 text-sm truncate" title={stock.name}>{stock.name}</p>
              <p className="text-xs text-gray-400">{stock.symbol}</p>
            </div>
            <button
              onClick={() => handleRemoveStock(stock.symbol)}
              className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full bg-red-500/10 hover:bg-red-500/20 py-1 rounded"
              aria-label={`Remove ${stock.name}`}
            >
              Remove
            </button>
          </div>
        ))}
        {selectedStocks.length < 5 && (
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="border-2 border-dashed border-gray-600 hover:border-sky-500 hover:bg-gray-800 text-gray-400 hover:text-sky-400 rounded-lg flex flex-col items-center justify-center transition-colors min-h-[90px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm mt-1">Add Stock</span>
          </button>
        )}
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xl relative border border-gray-700">
            <button onClick={() => setIsSearchModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-sky-400 mb-4">Add a stock to compare</h2>
            <SearchBar onStockSelect={handleStockSelect} />
          </div>
        </div>
      )}

      {isWarningModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border border-gray-700">
            <h3 className="text-lg font-bold text-yellow-400">Cross-Sector Comparison</h3>
            <p className="text-gray-300 mt-2 mb-4">You've selected stocks from different sectors. AI analysis is most effective when comparing similar companies. Do you want to proceed anyway?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsWarningModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { setIsWarningModalOpen(false); proceedWithAnalysis(); }} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Proceed</button>
            </div>
          </div>
        </div>
      )}

      <ComparisonTable stocksData={stocksData} mlValuations={mlValuations} isLoading={isTableLoading} />

      {stocksData.length > 1 && !isTableLoading && (
        <div className="mt-6 text-center">
          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : "Run AI Head-to-Head Analysis ✨"}
          </button>
        </div>
      )}

      {isAnalyzing && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
      {aiError && <div className="my-4 text-center p-4 text-red-400 bg-red-900/20 rounded-lg">{aiError}</div>}
      {aiAnalysis && (
        <div className="mt-8 bg-gray-850 shadow-xl rounded-xl p-6 border border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-100 mb-4">Finlearn AI Comparison Verdict</h3>
          {aiAnalysis.winnerSymbol && (
            <div className="mb-4 text-center p-3 bg-green-500/20 rounded-lg">
              <p className="font-bold text-lg text-green-300">AI's Pick: {aiAnalysis.winnerSymbol}</p>
            </div>
          )}
          <div className="mb-4">
            <h4 className="font-bold text-sky-400">Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis.summary}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-bold text-sky-400">Recommendation</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis.recommendation}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-bold text-green-400 mb-2">Pros</h4>
              {Object.entries(aiAnalysis.pros).map(([symbol, pros]) => (
                <div key={symbol} className="mb-3">
                  <p className="font-semibold text-gray-200">{symbol}</p>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {(pros as string[]).map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-red-400 mb-2">Cons</h4>
              {Object.entries(aiAnalysis.cons).map(([symbol, cons]) => (
                <div key={symbol} className="mb-3">
                  <p className="font-semibold text-gray-200">{symbol}</p>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {(cons as string[]).map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;