import React from 'react';
import { Link } from 'react-router-dom';
import { AIScreenerAnalysis } from '../../types';

interface AIScreenerAnalysisCardProps {
  analysis: AIScreenerAnalysis;
}

const AIScreenerAnalysisCard: React.FC<AIScreenerAnalysisCardProps> = ({ analysis }) => {
  return (
    <div className="bg-gray-850 shadow-xl rounded-xl p-6 border border-gray-700 mb-8">
      <h3 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-sky-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
        Finlearn AI Screener Analysis
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-sky-400 mb-2">Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-sky-400 mb-2">Common Themes</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {analysis.commonThemes.map((theme, i) => <li key={i}>{theme}</li>)}
            </ul>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="font-bold text-green-400 mb-3 text-lg">AI's Top Picks</h4>
            <div className="space-y-4">
            {analysis.topPicks.map(pick => (
                <div key={pick.symbol} className="bg-gray-900/50 p-3 rounded-md border-l-4 border-green-500">
                    <h5 className="font-semibold text-gray-200">
                        <Link to={`/stock/${pick.symbol}`} className="hover:underline">{pick.name} ({pick.symbol})</Link>
                    </h5>
                    <p className="text-xs text-gray-300 mt-1">{pick.reason}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIScreenerAnalysisCard;