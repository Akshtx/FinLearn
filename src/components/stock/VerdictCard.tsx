import React from 'react';
import { AIAnalysisResponse, MLValuationResponse } from '../../types';

interface VerdictCardProps {
  analysis: AIAnalysisResponse | null;
  mlValuation?: MLValuationResponse | null;
}

const VerdictCard: React.FC<VerdictCardProps> = ({ analysis, mlValuation }) => {
  if (!analysis) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  let verdictColor = 'text-gray-100';
  if (analysis.verdict.toUpperCase().includes('BUY') || analysis.verdict.toUpperCase().includes('ACCUMULATE')) {
    verdictColor = 'text-green-400';
  } else if (analysis.verdict.toUpperCase().includes('SELL') || analysis.verdict.toUpperCase().includes('PROFIT')) {
    verdictColor = 'text-red-400';
  } else if (analysis.verdict.toUpperCase().includes('HOLD')) {
    verdictColor = 'text-yellow-400';
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-gray-750">
        <h3 className={`text-2xl sm:text-3xl font-bold ${verdictColor} tracking-wide`}>
          Finlearn AI Verdict: {analysis.verdict}
        </h3>
        {mlValuation && (
          <div className={`flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border self-start md:self-auto ${
            mlValuation.valuation_label === 'Undervalued' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
            mlValuation.valuation_label === 'Overvalued' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          }`}>
            <span>ML Valuation: {mlValuation.valuation_label}</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-700 text-xs text-gray-300 font-mono">Score: {mlValuation.financial_score.toFixed(2)}</span>
            <span className="text-xs text-gray-400">({(mlValuation.confidence * 100).toFixed(0)}% conf)</span>
          </div>
        )}
      </div>
      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
        <span className="font-semibold text-sky-400">AI Rationale:</span> {analysis.aiRationale}
      </p>
    </div>
  );
};

export default VerdictCard;