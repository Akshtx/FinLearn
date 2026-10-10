import React from 'react';
// FIX: `PieLabelProps` is not an exported member of 'recharts' and has been removed from the import.
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartDataPoint } from '../../types';

interface SimplePieChartProps {
  data: ChartDataPoint[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#facc15', '#a855f7', '#f43f5e']; // Sky, Green, Yellow, Purple, Red

const RADIAN = Math.PI / 180;

// FIX: A local type for the Pie chart's label renderer props is defined as it is not exported from recharts.
// The properties are optional, aligning with the existing guards that validate their presence and type.
interface PieLabelRenderProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  [key: string]: any;
}

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // Guard against undefined properties that are optional in the render props
  if (
    midAngle === undefined ||
    percent === undefined ||
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number'
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null; // Don't render label for small slices

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
   if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return <div className="text-center p-4 text-sm text-gray-400 h-64 flex items-center justify-center bg-gray-750 rounded">Pie chart data not available.</div>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: '0.25rem' }} 
            labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
            itemStyle={{ color: '#d1d5db' }}
          />
          <Legend wrapperStyle={{fontSize: "12px", color: "#9ca3af"}} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimplePieChart;
