import React from 'react';
import { AISectorOutlook } from '../../types';

interface SectorOutlookProps {
  outlook: AISectorOutlook | null;
  sectorName: string;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="flex-shrink-0 text-sky-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-gray-100">{value}</p>
        </div>
    </div>
);

const SectorOutlook: React.FC<SectorOutlookProps> = ({ outlook, sectorName }) => {
  if (!outlook) {
    return (
      <div className="bg-gray-850 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700 animate-pulse">
        <div className="h-7 bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg h-20"></div>
            <div className="bg-gray-800 p-4 rounded-lg h-20"></div>
        </div>
        <div className="mt-6">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mt-2"></div>
        </div>
      </div>
    );
  }

  const growthIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const lifespanIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="bg-gray-850 shadow-xl rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-100 mb-6">
        AI Outlook for the <span className="text-sky-400">{sectorName}</span> Sector
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <StatCard icon={growthIcon} label="Growth Potential" value={outlook.growthPotential} />
        <StatCard icon={lifespanIcon} label="Projected Lifespan / Relevance" value={outlook.lifespan} />
      </div>
      <div className="mt-6 bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-sky-400 mb-1">AI Rationale:</p>
        <p className="text-gray-300 text-sm leading-relaxed">{outlook.aiRationale}</p>
      </div>
    </div>
  );
};

export default SectorOutlook;
