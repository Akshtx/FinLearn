
import React from 'react';
import { AISuggestionPortal } from '../../types';

interface SuggestionPortalProps {
  suggestions: AISuggestionPortal | null;
}

const SuggestionSection: React.FC<{title: string, data: {label: string, value?: string}[], icon: React.ReactNode}> = ({ title, data, icon }) => (
  <div className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 hover:shadow-sky-500/20 transition-shadow duration-300">
    <h4 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h4>
    {data.map(item => item.value && (
      <div key={item.label} className="mb-2">
        <p className="text-sm font-medium text-gray-400">{item.label}:</p>
        <p className="text-gray-200">{item.value}</p>
      </div>
    ))}
  </div>
);


const SuggestionPortal: React.FC<SuggestionPortalProps> = ({ suggestions }) => {
  if (!suggestions) {
    return (
      <div className="mt-6 grid md:grid-cols-3 gap-6 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-800 p-5 rounded-lg shadow-lg">
            <div className="h-5 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const buyIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>;
  const holdIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991 0-3.181-3.184m0 0-3.181 3.183M3 12.75h4.992A4.5 4.5 0 0 1 12 8.25a4.5 4.5 0 0 1 4.5 4.5H21m-3.75 6.75v-4.992m0 0h4.992M12 17.25h.008v.015H12V17.25Z" /></svg>;
  const sellIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0-3.182-5.511m3.182 5.51-5.511-3.181" /></svg>;

  return (
    <div className="mt-8">
       <h3 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Suggestion Portal</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <SuggestionSection 
          title="When to BUY?" 
          icon={buyIcon}
          data={[
            {label: "Ideal Buy Range", value: suggestions.buy.idealRange},
            {label: "Trigger", value: suggestions.buy.trigger}
          ]} 
        />
        <SuggestionSection 
          title="When to HOLD?"
          icon={holdIcon}
          data={[
            {label: "If you already own it", value: suggestions.hold.advice},
            {label: "Stop-Loss", value: suggestions.hold.stopLoss}
          ]}
        />
        <SuggestionSection 
          title="When to SELL?" 
          icon={sellIcon}
          data={[
            {label: "Target for Profit Booking", value: suggestions.sell.target},
            {label: "Trigger", value: suggestions.sell.trigger}
          ]}
        />
      </div>
    </div>
  );
};

export default SuggestionPortal;
