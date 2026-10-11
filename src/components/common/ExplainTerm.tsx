
import React, { useState } from 'react';
import { getTermExplanation } from '../../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface ExplainTermProps {
  term: string;
  className?: string;
}

const ExplainTerm: React.FC<ExplainTermProps> = ({ term, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleExplainClick = async () => {
    setIsModalOpen(true);
    if (explanation) return; // Don't re-fetch if already loaded

    setIsLoading(true);
    setError(null);
    try {
      const result = await getTermExplanation(term);
      setExplanation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch explanation.');
      setExplanation('');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        type="button" 
        onClick={handleExplainClick} 
        className={`ml-1 text-gray-400 hover:text-sky-400 focus:outline-none ${className}`}
        aria-label={`Explain ${term}`}
        title={`Explain ${term}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="explanation-title"
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border border-gray-700"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 id="explanation-title" className="text-xl font-bold text-sky-400 mb-4">
              What is "{term}"?
            </h2>
            <div className="text-gray-300 min-h-[80px]">
              {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner size="w-8 h-8"/></div>}
              {error && <p className="text-red-400">{error}</p>}
              {!isLoading && !error && <p>{explanation}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExplainTerm;
