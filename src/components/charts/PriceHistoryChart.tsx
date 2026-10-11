import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Brush } from 'recharts';
import { PriceDataPoint, StockBasicData } from '../../types';

interface PriceHistoryChartProps {
  data: PriceDataPoint[];
  stockData: StockBasicData;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded shadow-lg text-sm">
        <p className="label text-gray-300">{`Time: ${label}`}</p>
        <p className="intro text-sky-400">{`Price: ₹${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, stockData }) => {
  if (!data || data.length === 0) {
    return (
        <div className="w-full aspect-[9/2] bg-gray-750 rounded-md flex items-center justify-center">
            <p className="text-gray-400">Price history data is currently unavailable.</p>
        </div>
    );
  }
  
  const lastDataPoint = data[data.length - 1];
  const minPrice = Math.min(...data.map(p => p.price), stockData.close);
  const maxPrice = Math.max(...data.map(p => p.price), stockData.close);
  const domainPadding = (maxPrice - minPrice) * 0.1;

  const priceColor = lastDataPoint.price >= stockData.close ? "#22c55e" : "#ef4444";
  const gradientId = "priceGradient";

  const isDaily = data[0]?.time.includes('-'); // Check if it's 'YYYY-MM-DD' format

  const CustomizedDot: React.FC<any> = (props) => {
    const { cx, cy, index } = props;
    if (index === data.length - 1) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} stroke="none" fill={priceColor} fillOpacity={0.4}>
            <animate attributeName="r" from="6" to="15" dur="1.5s" begin="0s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={4} stroke="#fff" strokeWidth={1.5} fill={priceColor} />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="w-full aspect-[9/2]">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 25 }}>
                 <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={priceColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={priceColor} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    tickFormatter={(timeStr) => {
                       if (isDaily) {
                           // Show month name for first tick of the month or first tick overall
                           const date = new Date(timeStr);
                           if (date.getDate() === 1) {
                               return date.toLocaleDateString('en-US', { month: 'short' });
                           }
                           return '';
                       }
                       return timeStr.endsWith(':00') || timeStr.endsWith(':30') ? timeStr : '';
                    }}
                    interval="preserveStartEnd"
                    minTickGap={isDaily ? 1 : 40}
                />
                <YAxis 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    domain={[minPrice - domainPadding, maxPrice + domainPadding]}
                    tickFormatter={(price) => `₹${price.toFixed(0)}`}
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Previous Close Line */}
                <ReferenceLine y={stockData.close} stroke="#f59e0b" strokeDasharray="3 3">
                     <Label value={`Prev Close ${stockData.close.toFixed(2)}`} position="insideTopLeft" fill="#f59e0b" fontSize={10} />
                </ReferenceLine>

                {/* Live Price Line */}
                <ReferenceLine y={lastDataPoint.price} stroke={priceColor} strokeDasharray="4 4">
                    <Label
                      value={lastDataPoint.price.toFixed(2)}
                      position="right"
                      fill="white"
                      fontSize={12}
                      style={{
                        backgroundColor: priceColor,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    />
                </ReferenceLine>

                <Area 
                    isAnimationActive={false}
                    type="monotone" 
                    dataKey="price" 
                    stroke={priceColor} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill={`url(#${gradientId})`} 
                    dot={<CustomizedDot />}
                />
                 <Brush dataKey="time" height={25} stroke="#38bdf8" fill="#1f2937" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;