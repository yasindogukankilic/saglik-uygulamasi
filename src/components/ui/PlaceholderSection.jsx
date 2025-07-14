import React from 'react';
import Card from './Card';

const PlaceholderSection = ({
  title,
  description,
  icon: Icon,
  features = [],
  className = ''
}) => {
  return (
    <Card className={className}>
      <div className="px-6 py-4 border-b border-gray-200">
        <Card.Title>{title}</Card.Title>
      </div>
      <Card.Content className="p-8">
        <div className="text-center py-12">
          {Icon && (
            <div className="w-16 h-16 bg-gradient-to-br from-[#0079a9] to-[#58dd91] rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          {features.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-sm text-gray-500 mb-2">Gelecek özellikler:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default PlaceholderSection;