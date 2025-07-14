import React from 'react';

export default function InputField({
  label, value, onChange, placeholder = '', error, Icon, type = 'text'
}) {
  return (
    <div>
      <label className="block text-white/90 text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-white/60" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 bg-white/20 
            border-2 rounded-xl text-white placeholder-white/50 focus:outline-none
            focus:ring-2 focus:ring-white/60 focus:border-white/60 transition-all duration-200
            hover:bg-white/25 text-base sm:text-lg
            ${error ? 'border-red-300 bg-red-500/10' : 'border-white/40'}`}
        />
        {/* Focus glow effect */}
        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-200 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}