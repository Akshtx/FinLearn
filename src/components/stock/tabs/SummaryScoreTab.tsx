import React from 'react';
import { StockBasicData, AIAnalysisResponse } from '../../../types';

interface SummaryScoreTabProps {
  stockData: StockBasicData | null;
  analysis: AIAnalysisResponse | null;
}

const DataPoint: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="text-sm text-gray-100">{value !== undefined ? value : 'N/A'}</dd>
  </div>
);

const ScoreIndicator: React.FC<{ label: string; score: number; justification: string }> = ({ label, score, justification }) => {
  const scoreColor = score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="mb-3 p-3 bg-gray-750 rounded">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-300">{label}:</span>
        <span className={`font-bold ${scoreColor}`}>{score.toFixed(1)} / 10</span>
      </div>
      <p className="text-xs text-gray-400">{justification}</p>
    </div>
  );
};

const SummaryScoreTab: React.FC<SummaryScoreTabProps> = ({ stockData, analysis }) => {
  if (!stockData || !analysis) {
    return (
      <div className="grid md:grid-cols-2 gap-6 animate-pulse">
        <div className="bg-gray-800 p-4 rounded-lg shadow"><div className="h-40 bg-gray-700 rounded"></div></div>
        <div className="bg-gray-800 p-4 rounded-lg shadow"><div className="h-40 bg-gray-700 rounded"></div></div>
      </div>
    );
  }

  const { sreeAIScore } = analysis;

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Key Stock Information</h4>
        <dl>
          <DataPoint label="Open" value={`₹${stockData.open.toFixed(2)}`} />
          <DataPoint label="High" value={`₹${stockData.high.toFixed(2)}`} />
          <DataPoint label="Low" value={`₹${stockData.low.toFixed(2)}`} />
          <DataPoint label="Previous Close" value={`₹${stockData.close.toFixed(2)}`} />
          <DataPoint label="Per Day Volume" value={stockData.volume.toLocaleString()} />
          <DataPoint label="52-Week High" value={`₹${stockData.fiftyTwoWeekHigh.toFixed(2)}`} />
          <DataPoint label="52-Week Low" value={`₹${stockData.fiftyTwoWeekLow.toFixed(2)}`} />
        </dl>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Finlearn AI Score</h4>
         <div className="mb-4 p-4 bg-sky-600/20 rounded-lg text-center">
            <span className="text-gray-100 text-lg">Overall Score:</span>
            <span className={`font-bold text-3xl ml-2 ${sreeAIScore.overall.score >= 7 ? 'text-green-300' : sreeAIScore.overall.score >= 5 ? 'text-yellow-300' : 'text-red-300'}`}>
              {sreeAIScore.overall.score.toFixed(1)} / 10
            </span>
            <p className="text-xs text-gray-300 mt-1">{sreeAIScore.overall.justification}</p>
        </div>
        <ScoreIndicator label="Fundamentals" score={sreeAIScore.fundamentals.score} justification={sreeAIScore.fundamentals.justification} />
        <ScoreIndicator label="Valuation" score={sreeAIScore.valuation.score} justification={sreeAIScore.valuation.justification} />
        <ScoreIndicator label="Technicals" score={sreeAIScore.technicals.score} justification={sreeAIScore.technicals.justification} />
        <ScoreIndicator label="Sentiment & News" score={sreeAIScore.sentimentNews.score} justification={sreeAIScore.sentimentNews.justification} />
      </div>
    </div>
  );
};

export default SummaryScoreTab;