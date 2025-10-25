import React from 'react';

interface StatBoxProps {
  value: string | number;
  label: string;
}

const StatBox: React.FC<StatBoxProps> = ({ value, label }) => {
  return (
    <div className="bg-black/30 p-4 rounded-lg text-center">
      <div className="text-2xl font-bold text-[#00d4ff]">{value}</div>
      <div className="text-sm text-gray-200 mt-1">{label}</div>
    </div>
  );
};

export default StatBox;