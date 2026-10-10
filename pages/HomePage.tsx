import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import { StockIdentifier } from '../types';
import { APP_NAME, APP_TAGLINE } from '../constants';
import AppLogo from '../components/common/AppLogo';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStockSelect = (stock: StockIdentifier) => {
    navigate(`/stock/${stock.symbol}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <AppLogo className="w-24 h-24 sm:w-32 sm:h-32 mb-6 text-sky-400" />
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-3">
        Welcome to {APP_NAME}
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl">
        {APP_TAGLINE} Dive into AI-powered stock analysis for Indian markets.
      </p>
      <SearchBar onStockSelect={handleStockSelect} />
      <div className="mt-12 text-sm text-gray-500 max-w-md">
        <p>Enter the name or symbol of any stock listed on NSE or BSE to get started. Our AI will provide you with a comprehensive analysis and actionable insights.</p>
      </div>
    </div>
  );
};

export default HomePage;