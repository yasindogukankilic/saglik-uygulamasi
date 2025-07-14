import React from 'react';
import { Search, Filter } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const SearchBar = ({
  searchValue = '',
  onSearchChange,
  placeholder = 'Ara...',
  filters = [],
  onFilterChange,
  showFilterButton = true,
  className = ''
}) => {
  return (
    <Card className={className}>
      <Card.Content>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0079a9] focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-3">
            {showFilterButton && (
              <Button variant="secondary" icon={Filter}>
                Filtrele
              </Button>
            )}
            
            {filters.map((filter, index) => (
              <select
                key={index}
                value={filter.value}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0079a9] focus:border-transparent"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default SearchBar;