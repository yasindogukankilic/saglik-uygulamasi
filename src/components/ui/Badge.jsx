import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon: Icon,
  dot = false,
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-gradient-to-r from-[#0079a9] to-[#58dd91] text-white',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <span className={classes}>
      {dot && (
        <div className={`
          w-2 h-2 rounded-full mr-1.5
          ${variant === 'success' ? 'bg-green-500' : ''}
          ${variant === 'warning' ? 'bg-yellow-500' : ''}
          ${variant === 'danger' ? 'bg-red-500' : ''}
          ${variant === 'info' ? 'bg-blue-500' : ''}
          ${variant === 'primary' ? 'bg-white' : ''}
          ${variant === 'default' ? 'bg-gray-500' : ''}
        `} />
      )}
      
      {Icon && (
        <Icon className={`
          ${size === 'sm' ? 'w-3 h-3' : ''}
          ${size === 'md' ? 'w-4 h-4' : ''}
          ${size === 'lg' ? 'w-5 h-5' : ''}
          ${children ? 'mr-1.5' : ''}
        `} />
      )}
      
      {children}
    </span>
  );
};

// Notification Badge (for counts)
const NotificationBadge = ({ 
  count, 
  max = 99, 
  showZero = false,
  className = '' 
}) => {
  if (!showZero && (!count || count === 0)) return null;
  
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge 
      variant="danger" 
      size="sm" 
      className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Status Badge (for user/content status)
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Aktif', dot: true },
    inactive: { variant: 'danger', label: 'Pasif', dot: true },
    pending: { variant: 'warning', label: 'Beklemede', dot: true },
    draft: { variant: 'warning', label: 'Taslak' },
    published: { variant: 'success', label: 'Yayınlandı' },
    archived: { variant: 'default', label: 'Arşiv' },
    suspended: { variant: 'danger', label: 'Askıda' },
    verified: { variant: 'info', label: 'Doğrulandı' }
  };
  
  const config = statusConfig[status] || { variant: 'default', label: status };
  
  return (
    <Badge 
      variant={config.variant}
      dot={config.dot}
      size="sm"
    >
      {config.label}
    </Badge>
  );
};

Badge.Notification = NotificationBadge;
Badge.Status = StatusBadge;

export default Badge;