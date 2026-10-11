
import React, { useState } from 'react';
import { AIPortfolioAnalysis, PortfolioHolding } from '../../types';
import { getAIPortfolioAnalysis } from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';

interface AIPortfolioAnalysisCardProps {
    holdings: PortfolioHolding[];
}

const AIPortfolioAnalysisCard: React.FC<AIPortfolioAnalysisCardProps> = ({ holdings }) => {
    const [analysis, setAnalysis] = useState<AIPortfolioAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getAIPortfolioAnalysis(holdings);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze portfolio.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const scoreColor = analysis ? (analysis.overallScore >= 7 ? 'text-green-300' : analysis.overallScore >= 5 ? 'text-yellow-300' : 'text-red-300') : 'text-gray-300';
    const diversificationColor = analysis?.diversification.rating === 'Excellent' || analysis?.diversification.rating === 'Good' ? 'text-green-300' : analysis?.diversification.rating === 'Fair' ? 'text-yellow-300' : 'text-red-300';


    return (
        <div className="bg-gray-850 shadow-xl rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-100">AI Portfolio Analysis</h3>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || holdings.length === 0}
                    className="mt-3 sm:mt-0 bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                            </svg>
                            Run AI Analysis
                        </>
                    )}
                </button>
            </div>
            {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
            {error && <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">{error}</div>}
            {analysis && (
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Portfolio Health Score</p>
                            <p className={`text-4xl font-bold ${scoreColor}`}>{analysis.overallScore} <span className="text-2xl">/ 10</span></p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Diversification</p>
                            <p className={`text-xl font-semibold ${diversificationColor}`}>{analysis.diversification.rating}</p>
                            <p className="text-xs text-gray-300 mt-1">{analysis.diversification.feedback}</p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Summary</p>
                            <p className="text-sm text-gray-200">{analysis.healthSummary}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-sky-400 mb-2">AI Suggestions</p>
                        {analysis.suggestions.add.length > 0 && (
                             <div className="mb-3">
                                <p className="text-sm font-medium text-green-400">Consider Adding:</p>
                                <p className="text-sm text-gray-300">{analysis.suggestions.add.join(', ')}</p>
                            </div>
                        )}
                         {analysis.suggestions.reduce.length > 0 && (
                             <div>
                                <p className="text-sm font-medium text-yellow-400">Consider Reducing/Trimming:</p>
                                <p className="text-sm text-gray-300">{analysis.suggestions.reduce.join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {!analysis && !isLoading && !error && (
                <div className="text-center text-gray-500 p-6">Click the button to get your personalized portfolio analysis.</div>
            )}
        </div>
    );
}

export default AIPortfolioAnalysisCard;
