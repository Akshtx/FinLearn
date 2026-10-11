
import React from 'react';

const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-yellow-600 bg-opacity-80 text-white p-3 text-center text-xs mt-8 rounded-md shadow-lg">
      <span className="font-bold">⚠️ Disclaimer:</span> Finlearn AI provides AI-generated analysis and is for informational purposes only. It is not financial advice. All investments carry risk. Please consult a SEBI-registered financial advisor before making any investment decisions.
    </div>
  );
};

export default DisclaimerBanner;