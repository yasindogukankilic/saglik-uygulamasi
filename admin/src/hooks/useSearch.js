import { useState, useMemo } from 'react';

// Generic search hook
export const useSearch = (data = [], searchFields = [], options = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  const {
    caseSensitive = false,
    exactMatch = false,
    debounceDelay = 300
  } = options;

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);
    
    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    let result = data;

    // Apply search filter
    if (debouncedSearchTerm) {
      const term = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
      
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          const searchValue = caseSensitive ? String(value || '') : String(value || '').toLowerCase();
          
          if (exactMatch) {
            return searchValue === term;
          }
          return searchValue.includes(term);
        });
      });
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          return itemValue === value;
        });
      }
    });

    return result;
  }, [data, debouncedSearchTerm, filters, searchFields, caseSensitive, exactMatch]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    filteredData,
    totalResults: filteredData.length,
    hasFilters: Object.keys(filters).length > 0 || searchTerm.length > 0
  };
};

// Specialized hook for users
export const useUserSearch = (users = []) => {
  return useSearch(users, ['name', 'email', 'role'], {
    caseSensitive: false,
    debounceDelay: 300
  });
};

// Specialized hook for content
export const useContentSearch = (content = []) => {
  return useSearch(content, ['title', 'description', 'category', 'author'], {
    caseSensitive: false,
    debounceDelay: 300
  });
};

export default useSearch;