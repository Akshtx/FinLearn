
import React, { useState, useCallback } from 'react';
import { StockIdentifier } from '../../types';
import StockAutoCompleteItem from './StockAutoCompleteItem';
import { searchStocks } from '../../services/stockService'; // Mock service
import { MOCK_API_DELAY } from '../../constants';

interface SearchBarProps {
  onStockSelect: (stock: StockIdentifier) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onStockSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockIdentifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (currentQuery: string) => {
    if (currentQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(async () => {
        try {
            const results = await searchStocks(currentQuery);
            setSuggestions(results);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching stock suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    }, MOCK_API_DELAY / 2); // Shorter delay for autocomplete
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    fetchSuggestions(newQuery);
  };

  const handleSelect = (stock: StockIdentifier) => {
    setQuery(`${stock.name} (${stock.symbol})`);
    setSuggestions([]);
    setShowSuggestions(false);
    onStockSelect(stock);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg shadow-lg focus-within:ring-2 focus-within:ring-sky-500 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          // onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click on suggestions
          placeholder="Search for any Indian stock (e.g., Reliance, INFY, 500325)"
          className="w-full p-4 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
        />
        {isLoading && (
            <div className="p-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-sky-400 rounded-full animate-spin"></div>
            </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {suggestions.map((stock) => (
            <StockAutoCompleteItem key={`${stock.symbol}-${stock.exchange}`} stock={stock} onSelect={handleSelect} />
          ))}
        </ul>
      )}
      {showSuggestions && suggestions.length === 0 && query.length > 1 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-gray-400">
          No stocks found matching "{query}".
        </div>
      )}
    </div>
  );
};

export default SearchBar;
