import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, getToday, generateId } from '../utils/storage';

export const useTasks = () => {
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Listen for data updates from cloud sync
  useEffect(() => {
    const handleDataUpdate = () => {
      const freshData = loadData();
      setData(freshData);
    };
    
    window.addEventListener('habitos-data-updated', handleDataUpdate);
    return () => window.removeEventListener('habitos-data-updated', handleDataUpdate);
  }, []);

  const addDailyTask = useCallback((task) => {
    const newTask = {
      id: generateId(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      completed: false,
      date: getToday(),
      createdAt: getToday(),
    };
    setData(prev => ({ ...prev, dailyTasks: [...prev.dailyTasks, newTask] }));
    return newTask;
  }, []);

  const updateDailyTask = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const deleteDailyTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter(t => t.id !== id)
    }));
  }, []);

  const toggleDailyTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  }, []);

  const addWeeklyTask = useCallback((task) => {
    const newTask = {
      id: generateId(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      completed: false,
      weekStart: getWeekStart(),
      createdAt: getToday(),
    };
    setData(prev => ({ ...prev, weeklyTasks: [...prev.weeklyTasks, newTask] }));
    return newTask;
  }, []);

  const toggleWeeklyTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      weeklyTasks: prev.weeklyTasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  }, []);

  const deleteWeeklyTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      weeklyTasks: prev.weeklyTasks.filter(t => t.id !== id)
    }));
  }, []);

  const getDailyTasks = useCallback((date = getToday()) => {
    return data.dailyTasks.filter(t => t.date === date);
  }, [data.dailyTasks]);

  const getWeeklyTasks = useCallback((weekStart = getWeekStart()) => {
    return data.weeklyTasks.filter(t => t.weekStart === weekStart);
  }, [data.weeklyTasks]);

  const getDailyStats = useCallback((date = getToday()) => {
    const tasks = getDailyTasks(date);
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      remaining: total - completed,
      productivityScore,
    };
  }, [getDailyTasks]);

  const getWeeklyStats = useCallback((weekStart = getWeekStart()) => {
    const tasks = getWeeklyTasks(weekStart);
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      remaining: total - completed,
      productivityScore,
    };
  }, [getWeeklyTasks]);

  return {
    dailyTasks: data.dailyTasks,
    weeklyTasks: data.weeklyTasks,
    addDailyTask,
    updateDailyTask,
    deleteDailyTask,
    toggleDailyTask,
    addWeeklyTask,
    toggleWeeklyTask,
    deleteWeeklyTask,
    getDailyTasks,
    getWeeklyTasks,
    getDailyStats,
    getWeeklyStats,
    data,
    setData,
  };
};

function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}
