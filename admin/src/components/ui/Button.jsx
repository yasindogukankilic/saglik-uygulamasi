import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#0079a9] to-[#58dd91] text-white hover:shadow-lg transform hover:scale-105 focus:ring-[#0079a9] active:shadow-md",
    secondary: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200"
  };
  
  const sizes = {
    xs: "px-2 py-1 text-xs min-h-[28px]",
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[36px]",
    lg: "px-6 py-3 text-base min-h-[44px]",
    xl: "px-8 py-4 text-lg min-h-[52px]"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100" : "";
  const fullWidthClasses = fullWidth ? "w-full" : "";
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${fullWidthClasses} ${className}`;
  
  // Icon size based on button size
  const iconSizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6"
  };
  
  // Icon spacing based on button size
  const iconSpacing = {
    xs: Icon && iconPosition === 'left' ? "mr-1" : "ml-1",
    sm: Icon && iconPosition === 'left' ? "mr-1.5" : "ml-1.5",
    md: Icon && iconPosition === 'left' ? "mr-2" : "ml-2",
    lg: Icon && iconPosition === 'left' ? "mr-2.5" : "ml-2.5",
    xl: Icon && iconPosition === 'left' ? "mr-3" : "ml-3"
  };
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizeClasses[size]} ${iconSpacing[size]}`} />
      )}
      <span className="truncate">{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizeClasses[size]} ${iconSpacing[size]}`} />
      )}
    </button>
  );
};

export default Button;