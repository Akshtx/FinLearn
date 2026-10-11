
import React from 'react';
import { StockFundamentalData } from '../../../types';
import ExplainTerm from '../../common/ExplainTerm';
import SimpleBarChart from '../../charts/SimpleBarChart';
import SimplePieChart from '../../charts/SimplePieChart';

interface FundamentalsTabProps {
  data: StockFundamentalData | null;
}

const RatioDisplay: React.FC<{ label: string; value?: number | string; unit?: string; term: string; higherIsBetter?: boolean; lowerIsBetter?: boolean }> = ({ label, value, unit = '', term, higherIsBetter, lowerIsBetter }) => {
  let valueColor = 'text-gray-100';
  if (typeof value === 'number') {
    if (higherIsBetter && value > 0) valueColor = 'text-green-400'; // Example thresholds
    if (lowerIsBetter && value < 1) valueColor = 'text-green-400'; // Example for D/E
    if (higherIsBetter && value < 0) valueColor = 'text-red-400';
    if (lowerIsBetter && value > 2) valueColor = 'text-red-400';
  }

  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-700">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <ExplainTerm term={term} />
      </div>
      <span className={`text-sm font-semibold ${valueColor}`}>{value !== undefined ? `${value}${unit}` : 'N/A'}</span>
    </div>
  );
};

const FundamentalsTab: React.FC<FundamentalsTabProps> = ({ data }) => {
  if (!data) {
    return <div className="text-center p-8 text-gray-500">Fundamental data is currently unavailable.</div>;
  }

  const financialChartData = data.financialHealth.map(fh => ({
    name: fh.period,
    Revenue: fh.revenue,
    NetProfit: fh.netProfit,
    EPS: fh.eps,
  }));
  
  const shareholdingChartData = [
    { name: 'Promoter', value: data.shareholdingPattern.promoter },
    { name: 'FII', value: data.shareholdingPattern.fii },
    { name: 'DII', value: data.shareholdingPattern.dii },
    { name: 'Public', value: data.shareholdingPattern.public },
  ];

  const promoterPledgeHigh = (data.shareholdingPattern.pledgedPromoter || 0) > 15; // Example threshold

  return (
    <div className="space-y-8">
      <section className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Financial Health (Figures in Cr, EPS in ₹)</h4>
        {financialChartData.length > 0 ? (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <SimpleBarChart data={financialChartData.map(d => ({ name: d.name, value: d.Revenue }))} dataKey="value" title="Revenue" barColor="#38bdf8" />
            <SimpleBarChart data={financialChartData.map(d => ({ name: d.name, value: d.NetProfit }))} dataKey="value" title="Net Profit" barColor="#34d399" />
            <SimpleBarChart data={financialChartData.map(d => ({ name: d.name, value: d.EPS }))} dataKey="value" title="EPS" barColor="#facc15" />
          </div>
        ) : (
          <p className="text-gray-400">Financial health charts are not available.</p>
        )}
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Key Ratios</h4>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
          <RatioDisplay label="P/E Ratio" value={data.keyRatios.pe?.toFixed(2)} term="P/E Ratio" lowerIsBetter />
          <RatioDisplay label="P/B Ratio" value={data.keyRatios.pb?.toFixed(2)} term="P/B Ratio" lowerIsBetter />
          <RatioDisplay label="Debt-to-Equity" value={data.keyRatios.debtToEquity?.toFixed(2)} term="Debt-to-Equity Ratio" lowerIsBetter />
          <RatioDisplay label="Return on Equity (RoE)" value={data.keyRatios.roe?.toFixed(2)} unit="%" term="Return on Equity (RoE)" higherIsBetter />
          <RatioDisplay label="Dividend Yield" value={data.keyRatios.dividendYield?.toFixed(2)} unit="%" term="Dividend Yield" higherIsBetter />
        </div>
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h4 className="text-xl font-semibold text-sky-400 mb-4">Shareholding Pattern (%)</h4>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
                {shareholdingChartData.some(d => d.value > 0) ? (
                    <SimplePieChart data={shareholdingChartData} />
                ) : (
                    <p className="text-gray-400">Shareholding pattern chart is not available.</p>
                )}
            </div>
            <div className="text-sm">
                <p className="text-gray-300 mb-1"><span className="font-semibold">Promoter:</span> {data.shareholdingPattern.promoter.toFixed(2)}%</p>
                <p className="text-gray-300 mb-1"><span className="font-semibold">FII:</span> {data.shareholdingPattern.fii.toFixed(2)}%</p>
                <p className="text-gray-300 mb-1"><span className="font-semibold">DII:</span> {data.shareholdingPattern.dii.toFixed(2)}%</p>
                <p className="text-gray-300 mb-1"><span className="font-semibold">Public & Others:</span> {data.shareholdingPattern.public.toFixed(2)}%</p>
                {data.shareholdingPattern.pledgedPromoter !== undefined && (
                    <p className={`mt-3 p-2 rounded ${promoterPledgeHigh ? 'bg-red-500/30 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        <span className="font-semibold">Promoter Pledged:</span> {data.shareholdingPattern.pledgedPromoter.toFixed(2)}%
                         <ExplainTerm term="Promoter Pledged Percentage" className="ml-1"/>
                    </p>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default FundamentalsTab;
