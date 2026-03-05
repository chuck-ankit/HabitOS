import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  BarChart3,
  Calendar,
  PieChart,
  CheckCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { getToday, getDaysInRange, getMonthName } from '../utils/storage';

const Analytics = () => {
  const { habits } = useHabits();
  const { goals } = useGoals();
  const { dailyTasks } = useTasks();

  const getHabitCompletionTrend = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completed = habits.filter(h => h.completedDates[dateStr]).length;
      const total = habits.length || 1;
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completion: Math.round((completed / total) * 100),
        habits: completed,
      });
    }
    return data;
  };

  const getMonthlyProductivity = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const currentDay = new Date().getMonth() === month ? new Date().getDate() : daysInMonth;
      
      let totalCompletions = 0;
      for (let day = 1; day <= currentDay; day++) {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        totalCompletions += habits.filter(h => h.completedDates[dateStr]).length;
      }
      
      const maxPossible = habits.length * currentDay;
      data.push({
        month: getMonthName(month).slice(0, 3),
        productivity: maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0,
        completions: totalCompletions,
      });
    }
    return data;
  };

  const getGoalProgressData = () => {
    return goals.map(g => ({
      name: g.title.length > 12 ? g.title.slice(0, 12) + '...' : g.title,
      progress: g.progress,
      category: g.category,
    }));
  };

  const getTaskCompletionByPriority = () => {
    const completed = dailyTasks.filter(t => t.completed);
    const pending = dailyTasks.filter(t => !t.completed);
    
    return [
      { name: 'Completed', value: completed.length, color: '#10b981' },
      { name: 'Pending', value: pending.length, color: '#374151' },
    ];
  };

  const getStreakDistribution = () => {
    const streaks = habits.map(h => h.streak);
    const distribution = [
      { range: '0-7', count: 0 },
      { range: '8-14', count: 0 },
      { range: '15-30', count: 0 },
      { range: '30+', count: 0 },
    ];
    
    streaks.forEach(s => {
      if (s <= 7) distribution[0].count++;
      else if (s <= 14) distribution[1].count++;
      else if (s <= 30) distribution[2].count++;
      else distribution[3].count++;
    });
    
    return distribution;
  };

  const getHeatmapYearData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const completed = habits.filter(h => h.completedDates[dateStr]).length;
      const total = habits.length || 1;
      const intensity = completed / total;
      
      data.push({
        date: dateStr,
        intensity: Math.round(intensity * 100),
        dayOfWeek: d.getDay(),
        week: Math.floor(i / 7),
      });
    }
    return data;
  };

  const completionTrend = getHabitCompletionTrend();
  const monthlyProductivity = getMonthlyProductivity();
  const goalProgress = getGoalProgressData();
  const taskData = getTaskCompletionByPriority();
  const streakDist = getStreakDistribution();
  const yearData = getHeatmapYearData();

  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completedDates).length, 0);
  const avgHabitCompletions = habits.length > 0 ? Math.round(totalCompletions / habits.length) : 0;

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-dark-400">Track your productivity insights</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Completions', value: totalCompletions, icon: <CheckCircle size={20} />, color: '#10b981' },
          { label: 'Avg per Habit', value: avgHabitCompletions, icon: <Flame size={20} />, color: '#f59e0b' },
          { label: 'Goals Done', value: goals.filter(g => g.progress === 100).length, icon: <Target size={20} />, color: '#3b82f6' },
          { label: 'Tasks Done', value: dailyTasks.filter(t => t.completed).length, icon: <BarChart3 size={20} />, color: '#8b5cf6' },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-4">
            <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-sm text-dark-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <GlassCard delay={0.4} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" />
            30-Day Habit Completion
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrend}>
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} interval={4} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCompletion)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.5} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-400" />
            Monthly Productivity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProductivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Productivity']}
                />
                <Bar dataKey="productivity" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {monthlyProductivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${0.4 + (index * 0.1)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <GlassCard delay={0.6} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-primary-400" />
            Task Completion
          </h3>
          <div className="h-48 flex items-center justify-center">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-white">{dailyTasks.filter(t => t.completed).length}</p>
                <p className="text-xs text-dark-400">Done</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {taskData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-dark-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.7} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame size={20} className="text-primary-400" />
            Streak Distribution
          </h3>
          <div className="space-y-3">
            {streakDist.map((item, index) => (
              <div key={item.range}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">{item.range} days</span>
                  <span className="text-white">{item.count} habits</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${habits.length > 0 ? (item.count / habits.length) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.8} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-primary-400" />
            Goal Progress
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
            {goalProgress.slice(0, 5).map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white truncate">{goal.name}</span>
                  <span className="text-primary-400">{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} height="h-1.5" />
              </div>
            ))}
            {goalProgress.length === 0 && (
              <p className="text-dark-400 text-sm text-center py-4">No goals yet</p>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.9} className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary-400" />
          Yearly Activity
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayData = yearData.find(d => d.week === weekIndex && d.dayOfWeek === dayIndex);
                  return (
                    <div
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: dayData 
                          ? dayData.intensity > 66 
                            ? '#10b981' 
                            : dayData.intensity > 33 
                              ? '#34d399' 
                              : dayData.intensity > 0 
                                ? '#6ee7b7' 
                                : '#1f2937'
                          : '#1f2937'
                      }}
                      title={dayData ? `${dayData.date}: ${dayData.intensity}%` : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-dark-500">Less</span>
            <div className="flex gap-1">
              {['#1f2937', '#6ee7b7', '#34d399', '#10b981'].map((color, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="text-xs text-dark-500">More</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
