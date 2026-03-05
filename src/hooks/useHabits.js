import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, getToday, generateId } from '../utils/storage';

export const useHabits = () => {
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

  const addHabit = useCallback((habit) => {
    const newHabit = {
      id: generateId(),
      name: habit.name,
      description: habit.description || '',
      color: habit.color || '#10b981',
      createdAt: getToday(),
      completedDates: {},
      streak: 0,
      longestStreak: 0,
    };
    setData(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
    return newHabit;
  }, []);

  const updateHabit = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  }, []);

  const deleteHabit = useCallback((id) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  }, []);

  const toggleHabitCompletion = useCallback((habitId, date = getToday()) => {
    setData(prev => {
      const habits = prev.habits.map(habit => {
        if (habit.id !== habitId) return habit;
        
        const completedDates = { ...habit.completedDates };
        const wasCompleted = completedDates[date];
        
        if (wasCompleted) {
          delete completedDates[date];
        } else {
          completedDates[date] = true;
        }
        
        const streak = calculateStreak(completedDates, date);
        const longestStreak = Math.max(habit.longestStreak, streak);
        
        return {
          ...habit,
          completedDates,
          streak,
          longestStreak
        };
      });
      return { ...prev, habits };
    });
  }, []);

  const calculateStreak = (completedDates, currentDate) => {
    if (!completedDates[currentDate]) return 0;
    
    let streak = 0;
    const date = new Date(currentDate);
    
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      if (completedDates[dateStr]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getHabitStats = useCallback((habitId) => {
    const habit = data.habits.find(h => h.id === habitId);
    if (!habit) return null;
    
    const today = getToday();
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(d.toISOString().split('T')[0]);
    }
    
    const completedInLast30 = last30Days.filter(d => habit.completedDates[d]).length;
    const winRate = Math.round((completedInLast30 / 30) * 100);
    
    return {
      ...habit,
      winRate,
      completedCount: Object.keys(habit.completedDates).length,
    };
  }, [data.habits]);

  const getOverallStats = useCallback(() => {
    const today = getToday();
    const habits = data.habits;
    
    if (habits.length === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionPercentage: 0,
        totalStreak: 0,
        avgWinRate: 0,
      };
    }
    
    const completedToday = habits.filter(h => h.completedDates[today]).length;
    const totalStreak = Math.max(...habits.map(h => h.streak), 0);
    const avgWinRate = Math.round(
      habits.reduce((acc, h) => {
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          last30Days.push(d.toISOString().split('T')[0]);
        }
        const completed = last30Days.filter(d => h.completedDates[d]).length;
        return acc + (completed / 30);
      }, 0) / habits.length * 100
    );
    
    return {
      totalHabits: habits.length,
      completedToday,
      completionPercentage: Math.round((completedToday / habits.length) * 100),
      totalStreak,
      longestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
      avgWinRate,
    };
  }, [data.habits]);

  return {
    habits: data.habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitStats,
    getOverallStats,
    data,
    setData,
  };
};
