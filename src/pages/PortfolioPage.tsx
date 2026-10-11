
import React, { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import AddStockForm from '../components/portfolio/AddStockForm';
import PortfolioTable from '../components/portfolio/PortfolioTable';
import AIPortfolioAnalysisCard from '../components/portfolio/AIPortfolioAnalysisCard';

const PortfolioPage: React.FC = () => {
  const { holdings, addHolding, removeHolding, portfolioData, isLoading } = usePortfolio();
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  
  const totalInvestment = portfolioData.reduce((acc, h) => acc + (h.quantity * h.buyPrice), 0);
  const totalCurrentValue = portfolioData.reduce((acc, h) => acc + h.currentValue, 0);
  const totalPandL = totalCurrentValue - totalInvestment;
  const totalPandLPercent = totalInvestment > 0 ? (totalPandL / totalInvestment) * 100 : 0;
  
  const pnlColor = totalPandL >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            AI Portfolio Manager
          </h1>
          <p className="mt-1 text-lg text-gray-300">
            Track your investments and get AI-powered insights.
          </p>
        </div>
        <button
          onClick={() => setIsAddFormVisible(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          Add Stock
        </button>
      </div>
      
      {isAddFormVisible && (
        <AddStockForm 
            onAdd={addHolding} 
            onClose={() => setIsAddFormVisible(false)} 
        />
      )}

      {holdings.length > 0 ? (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-gray-800 p-4 rounded-lg shadow"><p className="text-sm text-gray-400">Total Investment</p><p className="text-xl font-bold">₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p></div>
                <div className="bg-gray-800 p-4 rounded-lg shadow"><p className="text-sm text-gray-400">Current Value</p><p className="text-xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p></div>
                <div className="bg-gray-800 p-4 rounded-lg shadow"><p className="text-sm text-gray-400">Overall P&L</p><p className={`text-xl font-bold ${pnlColor}`}>₹{totalPandL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p></div>
                <div className="bg-gray-800 p-4 rounded-lg shadow"><p className="text-sm text-gray-400">Overall Return</p><p className={`text-xl font-bold ${pnlColor}`}>{totalPandLPercent.toFixed(2)}%</p></div>
            </div>

            <AIPortfolioAnalysisCard holdings={holdings} />
            
            <PortfolioTable 
                portfolioData={portfolioData} 
                onRemove={removeHolding} 
                isLoading={isLoading} 
            />
        </>
      ) : (
         <div className="mt-12 text-center text-gray-500 bg-gray-800/50 p-10 rounded-lg border border-dashed border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-300">Your portfolio is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Click "Add Stock" to start building your portfolio.</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
