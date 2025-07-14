import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  required = false,
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm 
          focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
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
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm 
          focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Input.Select = Select;

export default Input;