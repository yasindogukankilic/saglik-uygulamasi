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
      <Card.Content className="p-3 sm:p-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
                         text-sm sm:text-base transition-all duration-200
                         placeholder-gray-400"
            />
          </div>
          
          {/* Filters and Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Filter Button */}
            {showFilterButton && (
              <Button 
                variant="secondary" 
                icon={Filter}
                size="md"
                className="flex-1 sm:flex-none min-w-[100px]"
              >
                <span className="hidden sm:inline">Filtrele</span>
                <span className="sm:hidden">Filtre</span>
              </Button>
            )}
            
            {/* Filter Dropdowns */}
            {filters.map((filter, index) => (
              <select
                key={index}
                value={filter.value}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="flex-1 sm:flex-none min-w-[120px] px-3 py-2.5 sm:py-2 
                           border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#0079a9] focus:border-transparent
                           text-sm bg-white transition-all duration-200
                           appearance-none cursor-pointer
                           hover:border-gray-400"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
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