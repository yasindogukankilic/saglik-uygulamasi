import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const StatCard = ({
  title,
  value,
  change,
  changeType = 'positive', // 'positive', 'negative', 'neutral'
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-[#0079a9]',
  className = ''
}) => {
  const changeColors = {
    positive: 'text-[#58dd91]',
    negative: 'text-red-500',
    neutral: 'text-gray-600'
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card hover className={`${className} transition-all duration-200`}>
      <Card.Content className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1">
              {title}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              {value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                {TrendIcon && (
                  <TrendIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${changeColors[changeType]} flex-shrink-0`} />
                )}
                <p className={`text-xs sm:text-sm font-medium ${changeColors[changeType]} truncate`}>
                  {change}
                </p>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatCard;