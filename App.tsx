import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StockDashboardPage from './pages/StockDashboardPage';
import PageLayout from './components/layout/PageLayout';
import ComparePage from './pages/ComparePage';
import ScreenerPage from './pages/ScreenerPage';
import PortfolioPage from './pages/PortfolioPage';
import MLModelPage from './pages/MLModelPage';


const App: React.FC = () => {
  return (
    <HashRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock/:symbol" element={<StockDashboardPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/ml-model" element={<MLModelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageLayout>
    </HashRouter>
  );
};

export default App;