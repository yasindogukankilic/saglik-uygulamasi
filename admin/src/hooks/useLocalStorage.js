import { useState, useEffect } from 'react';

// Note: This hook is for external use only - not for Claude.ai artifacts
// In Claude.ai, use React state instead of localStorage

export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Check if localStorage is available (browser environment)
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'tr',
    pageSize: 10,
    sidebarCollapsed: false
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    setPreferences,
    updatePreference,
    removePreferences
  };
};

// Hook for managing recent searches
export const useRecentSearches = (maxItems = 5) => {
  const [searches, setSearches] = useLocalStorage('recentSearches', []);

  const addSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearches(prev => {
      const filtered = prev.filter(item => item !== searchTerm);
      return [searchTerm, ...filtered].slice(0, maxItems);
    });
  };

  const removeSearch = (searchTerm) => {
    setSearches(prev => prev.filter(item => item !== searchTerm));
  };

  const clearSearches = () => {
    setSearches([]);
  };

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches
  };
};

export default useLocalStorage;