import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';

const getMonthName = (monthIndex) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

const getWeeksInMonth = (year, month) => {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentWeek = [];
  let currentDay = 1;
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    currentWeek.push(null);
  }
  
  while (currentDay <= lastDay.getDate()) {
    currentWeek.push(new Date(year, month, currentDay));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentDay++;
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
};

const History = () => {
  const { habits } = useHabits();
  const { goals } = useGoals();
  const { dailyTasks } = useTasks();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const getMonthlyData = () => {
    const weeks = getWeeksInMonth(year, month);
    return weeks.map(week => 
      week.map(day => {
        if (!day) return { date: null, completed: 0, total: 0 };
        const dateStr = day.toISOString().split('T')[0];
        const completed = habits.filter(h => h.completedDates[dateStr]).length;
        return { 
          date: dateStr, 
          day: day.getDate(),
          completed, 
          total: habits.length,
          percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
        };
      })
    );
  };

  const getWeeklyHistory = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      let weekCompletions = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        weekCompletions += habits.filter(h => h.completedDates[dateStr]).length;
      }
      
      data.push({
        week: `Week ${12 - i}`,
        completions: weekCompletions,
        avg: Math.round(weekCompletions / 7),
      });
    }
    return data;
  };

  const getMonthStats = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalCompletions = 0;
    let daysTracked = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        totalCompletions += habits.filter(h => h.completedDates[dateStr]).length;
        daysTracked++;
      }
    }
    
    const maxPossible = habits.length * daysTracked;
    const avgDaily = daysTracked > 0 ? Math.round(totalCompletions / daysTracked) : 0;
    const consistency = maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0;
    
    return { totalCompletions, avgDaily, consistency };
  };

  const getGoalsForMonth = () => {
    return goals.filter(g => {
      const created = new Date(g.createdAt);
      return created.getFullYear() === year && created.getMonth() === month;
    });
  };

  const weeklyHistory = getWeeklyHistory();
  const monthStats = getMonthStats();
  const monthlyGoals = getGoalsForMonth();

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-dark-400">View your past performance</p>
      </motion.div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold text-white min-w-[160px] text-center">
            {viewMode === 'month' 
              ? `${getMonthName(month)} ${year}`
              : year
            }
          </span>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex gap-1 bg-dark-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'month' 
                ? 'bg-primary-500 text-white' 
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'year' 
                ? 'bg-primary-500 text-white' 
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { 
            label: 'Total Completions', 
            value: monthStats.totalCompletions, 
            icon: CheckCircle2, 
            color: '#10b981' 
          },
          { 
            label: 'Daily Average', 
            value: monthStats.avgDaily, 
            icon: TrendingUp, 
            color: '#3b82f6' 
          },
          { 
            label: 'Consistency', 
            value: `${monthStats.consistency}%`, 
            icon: Flame, 
            color: '#f59e0b' 
          },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-4 text-center">
            <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-dark-400">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {viewMode === 'month' && (
        <GlassCard delay={0.4} className="p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-400" />
            Monthly Calendar
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-dark-500 py-2">
                {day}
              </div>
            ))}
            {getMonthlyData().flat().map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg
                  ${day.date 
                    ? day.completed > 0 
                      ? day.percentage >= 80 
                        ? 'bg-primary-500/80 text-white'
                        : day.percentage >= 50 
                          ? 'bg-primary-500/50 text-white'
                          : 'bg-primary-500/30 text-white'
                      : 'bg-dark-700/50 text-dark-400'
                    : 'bg-transparent'
                  }
                `}
                title={day.date ? `${day.completed}/${day.total} habits completed` : ''}
              >
                {day.day}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard delay={0.5} className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-400" />
          Weekly Trend (12 Weeks)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={10} interval={2} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completions" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard delay={0.6} className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary-400" />
          Goals Created This Month
        </h3>
        <div className="space-y-3">
          {monthlyGoals.length > 0 ? monthlyGoals.map(goal => (
            <div key={goal.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">{goal.title}</p>
                <p className="text-xs text-dark-400">{goal.type} - {goal.category}</p>
              </div>
              <ProgressBar value={goal.progress} className="w-24" />
            </div>
          )) : (
            <p className="text-dark-400 text-sm text-center py-4">No goals created this month</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default History;
