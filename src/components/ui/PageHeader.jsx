import React from 'react';
import Card from './Card';

const PageHeader = ({
  title,
  description,
  icon: Icon,
  actions,
  className = ''
}) => {
  return (
    <Card className={className}>
      <Card.Content>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {Icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-[#0079a9] to-[#58dd91] rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex space-x-3">
              {actions}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default PageHeader;