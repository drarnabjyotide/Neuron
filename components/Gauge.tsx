import React from 'react';

interface GaugeProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, max, unit = '' }) => {
  const percentage = max > 0 ? value / max : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - clampedPercentage);

  return (
    <div className="flex flex-col items-center justify-center text-white p-2">
      <svg width="180" height="100" viewBox="0 0 180 100" className="transform -rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#7b2ff7" />
          </linearGradient>
        </defs>
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="18"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference}
          strokeLinecap="round"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth="18"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
       <div className="text-center transform -translate-y-16">
          <div className="text-3xl font-bold">
            {value}
            <span className="text-xl font-normal text-gray-300 ml-1">{unit}</span>
          </div>
          <div className="text-md text-gray-300 mt-1">{label}</div>
      </div>
    </div>
  );
};

export default Gauge;