import React from 'react';
import { ComparisonData, MLValuationResponse } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface ComparisonTableProps {
  stocksData: (ComparisonData | null)[];
  mlValuations?: { [symbol: string]: MLValuationResponse } | null;
  isLoading: boolean;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ stocksData, mlValuations, isLoading }) => {
  if (stocksData.length === 0 && !isLoading) {
    return null;
  }
  
  const metrics = [
    { key: 'currentPrice', label: 'Last Price', format: (val: number) => `₹${val.toFixed(2)}` },
    { key: 'changePercent', label: '% Change', format: (val: number) => `${val.toFixed(2)}%`, higherIsBetter: true },
    { key: 'marketCap', label: 'Market Cap', format: (val: string) => val },
    { key: 'peRatio', label: 'P/E Ratio', format: (val?: number) => val?.toFixed(2) || 'N/A', lowerIsBetter: true },
    { key: 'pbRatio', label: 'P/B Ratio', format: (val?: number) => val?.toFixed(2) || 'N/A', lowerIsBetter: true },
    { key: 'roe', label: 'RoE (%)', format: (val?: number) => val?.toFixed(2) || 'N/A', higherIsBetter: true },
    { key: 'debtToEquity', label: 'Debt to Equity', format: (val?: number) => val?.toFixed(2) || 'N/A', lowerIsBetter: true },
    { key: 'dividendYield', label: 'Dividend Yield (%)', format: (val?: number) => val?.toFixed(2) || 'N/A', higherIsBetter: true },
    { key: 'promoterHolding', label: 'Promoter Holding (%)', format: (val?: number) => val?.toFixed(2) || 'N/A', higherIsBetter: true },
    { key: 'volume', label: 'Per Day Volume', format: (val: number) => val.toLocaleString(), higherIsBetter: true },
  ];

  const findBestValue = (metricKey: string, higherIsBetter?: boolean, lowerIsBetter?: boolean): number | undefined => {
      if (!higherIsBetter && !lowerIsBetter) return undefined;

      const values = stocksData
          .map(data => {
              if (!data) return null;
              if (['roe', 'debtToEquity', 'dividendYield'].includes(metricKey)) {
                  return data.fundamentals?.keyRatios?.[metricKey as keyof typeof data.fundamentals.keyRatios];
              }
              if (metricKey === 'promoterHolding') {
                  return data.fundamentals?.shareholdingPattern.promoter;
              }
              return data[metricKey as keyof ComparisonData] as number;
          })
          .filter(v => typeof v === 'number' && !isNaN(v));

      if (values.length < 2) return undefined;
      
      return higherIsBetter ? Math.max(...values as number[]) : Math.min(...values as number[]);
  };

  const getChangeColor = (value: number) => (value >= 0 ? 'text-green-400' : 'text-red-400');

  return (
    <div className="mt-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-x-auto">
      <table className="w-full min-w-[800px] divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            <th scope="col" className="sticky left-0 bg-gray-750 px-4 py-3 text-left text-xs font-medium text-sky-400 uppercase tracking-wider z-10">
              Metric
            </th>
            {stocksData.map((data) => (
              <th key={data?.symbol || Math.random()} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">
                {data ? `${data.name} (${data.symbol})` : 'Loading...'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {isLoading && stocksData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-8">
                <div className="flex justify-center items-center">
                  <LoadingSpinner />
                  <span className="ml-4 text-gray-300">Fetching comparison data...</span>
                </div>
              </td>
            </tr>
          ) : (
            metrics.map((metric) => {
              const bestValue = findBestValue(metric.key, metric.higherIsBetter, metric.lowerIsBetter);
              return (
                <tr key={metric.key}>
                  <td className="sticky left-0 bg-gray-800 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-300 z-10">
                    {metric.label}
                  </td>
                  {stocksData.map((data, index) => {
                    if (!data) {
                      return <td key={index} className="px-4 py-3"><div className="w-20 h-4 bg-gray-700 rounded animate-pulse mx-auto"></div></td>;
                    }
                    
                    let value: number | string | undefined;
                    if (['roe', 'debtToEquity', 'dividendYield'].includes(metric.key)) {
                        value = data.fundamentals?.keyRatios?.[metric.key as keyof typeof data.fundamentals.keyRatios];
                    } else if (metric.key === 'promoterHolding') {
                        value = data.fundamentals?.shareholdingPattern.promoter;
                    } else {
                        // FIX: The type of data[key] is too broad and could include objects like StockFundamentalData.
                        // Safely access the property and ensure it's a primitive type before assignment to fix the type error.
                        const potentialValue = data[metric.key as keyof ComparisonData];
                        if (typeof potentialValue === 'string' || typeof potentialValue === 'number') {
                          value = potentialValue;
                        }
                    }

                    const colorClass = metric.key === 'changePercent' && typeof value === 'number' ? getChangeColor(value) : 'text-gray-100';
                    const isBest = typeof value === 'number' && value === bestValue;
                    const bestClass = isBest ? 'bg-green-500/10 border-l-2 border-green-500' : '';

                    return (
                      <td key={data.symbol} className={`px-4 py-3 whitespace-nowrap text-sm text-center font-semibold transition-colors ${colorClass} ${bestClass}`}>
                        {data ? (metric.format as (val: any) => string)(value) : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
      
      {/* ML Valuation Verdict Row */}
      {!isLoading && stocksData.length > 0 && (
        <tr>
          <td className="sticky left-0 bg-gray-800 px-4 py-3.5 whitespace-nowrap text-sm font-semibold text-sky-400 z-10 border-t border-gray-700">
            ML Valuation Verdict
          </td>
          {stocksData.map((data, index) => {
            if (!data) {
              return <td key={index} className="px-4 py-3 border-t border-gray-700"><div className="w-20 h-4 bg-gray-700 rounded animate-pulse mx-auto"></div></td>;
            }
            const valuation = mlValuations ? mlValuations[data.symbol.toUpperCase()] : null;
            if (!valuation) {
              return <td key={data.symbol} className="px-4 py-3 text-center text-gray-500 border-t border-gray-700">-</td>;
            }
            
            let valColor = 'text-gray-300';
            if (valuation.valuation_label === 'Undervalued') valColor = 'text-green-400';
            if (valuation.valuation_label === 'Overvalued') valColor = 'text-red-400';
            if (valuation.valuation_label === 'Fairly Valued') valColor = 'text-yellow-400';
            
            return (
              <td key={data.symbol} className="px-4 py-3.5 text-center border-t border-gray-700">
                <div className="flex flex-col items-center justify-center">
                  <span className={`font-extrabold ${valColor}`}>{valuation.valuation_label}</span>
                  <span className="text-xs text-gray-400">({(valuation.confidence * 100).toFixed(0)}% conf)</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5">Score: {valuation.financial_score.toFixed(2)}</span>
                </div>
              </td>
            );
          })}
        </tr>
      )}
    </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;