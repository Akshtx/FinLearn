
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ChartDataPoint } from '../../types';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  title: string;
  barColor?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, dataKey, title, barColor = "#8884d8" }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-sm text-gray-400 h-64 flex items-center justify-center bg-gray-750 rounded">{title} data not available.</div>;
  }
  return (
    <div className="h-64 bg-gray-750 p-2 rounded-md shadow">
      <p className="text-center font-semibold text-gray-300 text-sm mb-1">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} interval={0} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: '0.25rem' }} 
            labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
            itemStyle={{ color: '#d1d5db' }}
          />
          <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]}>
            <LabelList dataKey={dataKey} position="top" style={{ fontSize: '10px', fill: barColor }} formatter={(value: number) => value.toFixed(0)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;
