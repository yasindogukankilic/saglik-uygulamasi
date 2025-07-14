import React from 'react';

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full">
      {/* Progress bar container */}
      <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 overflow-hidden shadow-sm backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
        </div>
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs sm:text-sm text-white/80 font-medium">
          İlerleme
        </span>
        <span className="text-xs sm:text-sm font-bold text-white">
          %{Math.round(progress)}
        </span>
      </div>
    </div>
  );
}