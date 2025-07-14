// Common gradient backgrounds
export const gradients = {
  primary: 'bg-gradient-to-br from-[#0079a9] to-[#58dd91]',
  primaryR: 'bg-gradient-to-r from-[#0079a9] to-[#58dd91]',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
  green: 'bg-gradient-to-br from-green-50 to-green-100',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100'
};

// Common icon background colors
export const iconBgs = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  yellow: 'bg-yellow-100'
};

// Common icon colors
export const iconColors = {
  primary: 'text-[#0079a9]',
  success: 'text-[#58dd91]',
  purple: 'text-purple-600',
  orange: 'text-orange-500',
  red: 'text-red-500',
  yellow: 'text-yellow-600'
};

// Common text colors
export const textColors = {
  primary: 'text-[#0079a9]',
  success: 'text-[#58dd91]',
  error: 'text-red-500',
  warning: 'text-yellow-600',
  muted: 'text-gray-600'
};

// Utility function to combine classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};