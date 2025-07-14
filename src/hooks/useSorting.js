import { useState, useMemo } from 'react';

export const useSorting = (data = [], defaultSortConfig = null) => {
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Convert to string for comparison if needed
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      let comparison = 0;

      // Different comparison types
      switch (sortConfig.type) {
        case 'number':
          comparison = Number(aValue) - Number(bValue);
          break;
        case 'date':
          comparison = new Date(aValue) - new Date(bValue);
          break;
        case 'string':
        default:
          comparison = aStr.localeCompare(bStr);
          break;
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [data, sortConfig]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Sort by a specific key
  const sortBy = (key, type = 'string') => {
    let direction = 'asc';
    
    // If we're already sorting by this key, toggle direction
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction, type });
  };

  // Clear sorting
  const clearSort = () => {
    setSortConfig(null);
  };

  // Get sort direction for a specific key
  const getSortDirection = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction;
  };

  return {
    sortedData,
    sortConfig,
    sortBy,
    clearSort,
    getSortDirection
  };
};

export default useSorting;