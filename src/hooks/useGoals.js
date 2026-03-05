import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, getToday, generateId } from '../utils/storage';

export const useGoals = () => {
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

  const addGoal = useCallback((goal) => {
    const newGoal = {
      id: generateId(),
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'personal',
      progress: goal.progress || 0,
      type: goal.type || 'yearly',
      milestones: goal.milestones || [],
      createdAt: getToday(),
      completedAt: null,
    };
    setData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    return newGoal;
  }, []);

  const updateGoal = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  }, []);

  const deleteGoal = useCallback((id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  }, []);

  const addMilestone = useCallback((goalId, milestone) => {
    const newMilestone = {
      id: generateId(),
      title: milestone.title,
      completed: false,
      createdAt: getToday(),
    };
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        return { ...g, milestones: [...g.milestones, newMilestone] };
      })
    }));
  }, []);

  const toggleMilestone = useCallback((goalId, milestoneId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = milestones.filter(m => m.completed).length;
        const progress = milestones.length > 0 
          ? Math.round((completedCount / milestones.length) * 100) 
          : g.progress;
        return { ...g, milestones, progress };
      })
    }));
  }, []);

  const getGoalsByType = useCallback((type) => {
    return data.goals.filter(g => g.type === type);
  }, [data.goals]);

  const getGoalStats = useCallback(() => {
    const goals = data.goals;
    const completed = goals.filter(g => g.progress === 100).length;
    const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;
    
    return {
      total: goals.length,
      completed,
      inProgress,
      avgProgress,
    };
  }, [data.goals]);

  return {
    goals: data.goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    getGoalsByType,
    getGoalStats,
    data,
    setData,
  };
};
