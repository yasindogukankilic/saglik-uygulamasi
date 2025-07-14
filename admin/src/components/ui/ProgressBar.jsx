import React from 'react';

const ProgressBar = ({
  value,
  max = 100,
  color = 'bg-gradient-to-r from-[#0079a9] to-[#58dd91]',
  height = 'h-2',
  label,
  showValue = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-gray-600">{label}</span>}
          {showValue && <span className="font-medium">{value}</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`${color} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;