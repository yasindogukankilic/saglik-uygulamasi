import React from 'react';
import { TrendingUp } from 'lucide-react';
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

  return (
    <Card hover className={className}>
      <Card.Content>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {change && (
              <div className="flex items-center space-x-1 mt-1">
                {changeType === 'positive' && <TrendingUp className="w-4 h-4 text-[#58dd91]" />}
                <p className={`text-sm font-medium ${changeColors[changeType]}`}>
                  {change}
                </p>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatCard;