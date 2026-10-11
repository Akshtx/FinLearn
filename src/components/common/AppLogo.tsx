import React from 'react';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Finlearn AI Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
      {/* Shield shape representing trust and protection */}
      <path
        d="M 50 10 L 90 30 V 60 C 90 80, 50 95, 50 95 C 50 95, 10 80, 10 60 V 30 Z"
        fill="url(#logoGradient)"
        stroke="#93c5fd"
        strokeWidth="1"
      />
      
      {/* Stylized stock chart arrow representing growth and analysis */}
      <path
        d="M 30 65 L 45 50 L 55 58 L 70 40"
        stroke="white"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* Arrowhead */}
      <path
        d="M 62 40 L 70 40 L 70 48"
        stroke="white"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </g>
  </svg>
);

export default AppLogo;