
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getTermExplanation } from '../../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const TextSelectionExplainer: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    // A small delay to allow for double-click selections to register fully.
    setTimeout(() => {
        if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
            return;
        }

        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? '';

        if (text.length > 2 && text.length < 150) { // Keep selection reasonable
          const range = selection?.getRangeAt(0);
          if (range) {
            const rect = range.getBoundingClientRect();
            // Don't show if selecting text in an input/textarea
            const startNode = range.startContainer.parentElement;
            if (startNode && (startNode.tagName === 'INPUT' || startNode.tagName === 'TEXTAREA')) {
              setShowButton(false);
              return;
            }

            setSelectedText(text);
            setPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX + (rect.width / 2),
            });
            setShowButton(true);
          }
        } else {
          setShowButton(false);
        }
    }, 10);
  }, []);

  const handleScroll = useCallback(() => {
    if (showButton) {
      setShowButton(false);
    }
  }, [showButton]);
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleMouseUp, handleScroll]);
  
  const handleExplainClick = async () => {
    setShowButton(false);
    setIsModalOpen(true);
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTermExplanation(selectedText);
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
    setExplanation('');
  };
  
  const button = showButton && (
    <button
      ref={buttonRef}
      onClick={handleExplainClick}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="z-[999] bg-sky-600 text-white px-3 py-1 text-xs rounded-md shadow-lg hover:bg-sky-500 transition-transform transform hover:scale-105"
      aria-label={`Explain "${selectedText}"`}
    >
      Explain It
    </button>
  );

  const modal = isModalOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="explanation-title" className="text-xl font-bold text-sky-400 mb-4 capitalize">
          What is "{selectedText}"?
        </h2>
        <div className="text-gray-300 min-h-[80px]">
          {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner size="w-8 h-8"/></div>}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && !error && <p>{explanation}</p>}
        </div>
      </div>
    </div>
  );
  
  if (typeof document === 'undefined') {
    return null;
  }
  
  return (
    <>
      {ReactDOM.createPortal(button, document.body)}
      {ReactDOM.createPortal(modal, document.body)}
    </>
  );
};

export default TextSelectionExplainer;
