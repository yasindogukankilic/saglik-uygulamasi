import React from 'react';

export default function QuizButton({ children, disabled, ...rest }) {
  return (
    <button
      disabled={disabled}
      className={`w-full py-4 px-6 bg-[#0079a9] text-white font-bold rounded-xl text-base sm:text-lg
        relative overflow-hidden group
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-[#005c82] active:bg-[#004a6b] transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl'}
        transition-all duration-200 shadow-lg`}
      {...rest}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
        transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}