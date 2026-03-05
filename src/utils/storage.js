const STORAGE_KEY = 'habitos_data';

const defaultData = {
  habits: [],
  goals: [],
  dailyTasks: [],
  weeklyTasks: [],
  settings: {
    theme: 'dark',
  },
  history: {},
};

export const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return defaultData;
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

export const exportData = () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitos-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveData(data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onError = reject;
    reader.readAsText(file);
  });
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  return defaultData;
};

export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDaysInRange = (startDate, days) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() - i);
    dates.unshift(d.toISOString().split('T')[0]);
  }
  return dates;
};

export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export const getMonthName = (monthIndex) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
