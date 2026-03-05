import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';

export const useSettings = () => {
  const [data, setData] = useState(() => {
    const loaded = loadData();
    return {
      ...loaded,
      settings: {
        theme: 'dark',
        ...loaded.settings
      }
    };
  });

  // Listen for data updates from cloud sync
  useEffect(() => {
    const handleDataUpdate = () => {
      const freshData = loadData();
      setData({
        ...freshData,
        settings: {
          theme: 'dark',
          ...freshData.settings
        }
      });
    };
    
    window.addEventListener('habitos-data-updated', handleDataUpdate);
    return () => window.removeEventListener('habitos-data-updated', handleDataUpdate);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  };

  useEffect(() => {
    saveData(data);
    applyTheme(data.settings?.theme || 'dark');
  }, [data]);

  const toggleTheme = useCallback(() => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings?.theme === 'dark' ? 'light' : 'dark'
      }
    }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  return {
    settings: data.settings || { theme: 'dark' },
    toggleTheme,
    updateSettings,
    data,
    setData,
  };
};
