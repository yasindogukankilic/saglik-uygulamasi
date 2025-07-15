import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  required = false,
  ...props
}) => {
  const baseInputClasses = `
    w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm
    text-sm sm:text-base
    transition-all duration-200
    placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
  `;
  
  const stateClasses = error 
    ? "border-red-300 bg-red-50 focus:ring-red-200"
    : props.disabled 
      ? "bg-gray-50 cursor-not-allowed border-gray-300"
      : "border-gray-300 bg-white hover:border-gray-400";

  const inputClasses = `${baseInputClasses} ${stateClasses}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 flex items-start space-x-1">
          <span className="text-red-500">•</span>
          <span className="leading-relaxed">{error}</span>
        </p>
      )}
    </div>
  );
};

const Select = ({
  label,
  error,
  options = [],
  className = '',
  required = false,
  ...props
}) => {
  const baseSelectClasses = `
    w-full px-3 py-2.5 sm:py-2 border rounded-lg shadow-sm
    text-sm sm:text-base
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
    appearance-none cursor-pointer
  `;
  
  const stateClasses = error 
    ? "border-red-300 bg-red-50 focus:ring-red-200"
    : props.disabled 
      ? "bg-gray-50 cursor-not-allowed border-gray-300"
      : "border-gray-300 bg-white hover:border-gray-400";

  const selectClasses = `${baseSelectClasses} ${stateClasses}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          className={selectClasses}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-start space-x-1">
          <span className="text-red-500">•</span>
          <span className="leading-relaxed">{error}</span>
        </p>
      )}
    </div>
  );
};

Input.Select = Select;

export default Input;