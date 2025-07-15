import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-200";
  const hoverClasses = hover ? "hover:shadow-md transition-shadow duration-200" : "";
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`text-base sm:text-lg font-semibold text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Title = CardTitle;

export default Card;