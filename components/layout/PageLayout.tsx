import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../../constants';
import TextSelectionExplainer from '../common/TextSelectionExplainer';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-700 text-sky-400'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <TextSelectionExplainer />
      <header className="bg-gray-800 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <Link to="/" className="text-sky-400 hover:text-sky-300 transition-colors">
            <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-xs text-gray-400">{APP_TAGLINE}</p>
          </Link>
          <nav className="mt-4 sm:mt-0 flex items-center space-x-1 sm:space-x-4">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              Compare
            </NavLink>
            <NavLink to="/screener" className={navLinkClass}>
              Screener
            </NavLink>
             <NavLink to="/portfolio" className={navLinkClass}>
              Portfolio
            </NavLink>
            <NavLink to="/ml-model" className={navLinkClass}>
              ML Model
            </NavLink>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-gray-400 py-6 text-center shadow-inner-top">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p className="text-xs mt-1">AI-powered insights for informed decisions.</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;