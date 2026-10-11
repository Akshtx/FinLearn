
import React from 'react';

interface InfoIconProps {
  tooltipText: string;
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ tooltipText, className }) => {
  return (
    <div className={`tooltip inline-block ml-1 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-sky-400 cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
      <span className="tooltiptext">{tooltipText}</span>
    </div>
  );
};

export default InfoIcon;
