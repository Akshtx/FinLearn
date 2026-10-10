
import React, { useState } from 'react';
import { TABS_CONFIG } from '../../constants';
import { TabKey } from '../../types';

interface TabbedContentProps {
  children: (activeTab: TabKey) => React.ReactNode;
}

const TabbedContent: React.FC<TabbedContentProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TABS_CONFIG[0].key);

  return (
    <div className="mt-8">
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-1" aria-label="Tabs">
          {TABS_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150
                ${activeTab === tab.key
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {children(activeTab)}
      </div>
    </div>
  );
};

export default TabbedContent;
