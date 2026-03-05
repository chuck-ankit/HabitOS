import { motion } from 'framer-motion';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  Trophy,
  Calendar,
  ArrowUpRight,
  BarChart3
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { getToday, getDaysInRange } from '../utils/storage';

const Dashboard = () => {
  const { habits, getOverallStats } = useHabits();
  const { goals, getGoalStats } = useGoals();
  const { getDailyStats, getWeeklyStats } = useTasks();

  const habitStats = getOverallStats();
  const goalStats = getGoalStats();
  const dailyStats = getDailyStats();
  const weeklyStats = getWeeklyStats();

  const getCompletionData = () => {
    const last7Days = getDaysInRange(getToday(), 7);
    return last7Days.map(date => {
      const completed = habits.filter(h => h.completedDates[date]).length;
      const total = habits.length || 1;
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completion: Math.round((completed / total) * 100),
      };
    });
  };

  const getMonthlyProductivity = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const daysPassed = d.getMonth() === new Date().getMonth() 
        ? new Date().getDate() 
        : daysInMonth;
      
      let totalCompletions = 0;
      for (let day = 0; day < daysPassed; day++) {
        const date = new Date(d.getFullYear(), d.getMonth(), day + 1).toISOString().split('T')[0];
        totalCompletions += habits.filter(h => h.completedDates[date]).length;
      }
      
      const maxPossible = habits.length * daysPassed;
      const productivity = maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0;
      
      data.push({ month, productivity });
    }
    return data;
  };

  const getHabitLeaderboard = () => {
    return habits
      .map(h => ({
        name: h.name.length > 10 ? h.name.slice(0, 10) + '...' : h.name,
        streak: h.streak,
        color: h.color,
      }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);
  };

  const completionData = getCompletionData();
  const monthlyData = getMonthlyProductivity();
  const leaderboard = getHabitLeaderboard();

  const stats = [
    { 
      label: 'Completion', 
      value: `${habitStats.completionPercentage}%`, 
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'from-emerald-500/20 to-emerald-600/10'
    },
    { 
      label: 'Current Streak', 
      value: habitStats.totalStreak,
      icon: Flame,
      color: '#f59e0b',
      bg: 'from-amber-500/20 to-amber-600/10'
    },
    { 
      label: 'Longest Streak', 
      value: habitStats.longestStreak,
      icon: Trophy,
      color: '#8b5cf6',
      bg: 'from-violet-500/20 to-violet-600/10'
    },
    { 
      label: 'Win Rate', 
      value: `${habitStats.avgWinRate}%`,
      icon: TrendingUp,
      color: '#3b82f6',
      bg: 'from-blue-500/20 to-blue-600/10'
    },
  ];

  const pieData = [
    { name: 'Completed', value: dailyStats.completed, color: '#10b981' },
    { name: 'Remaining', value: dailyStats.remaining, color: '#374151' },
  ];

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! <span className="gradient-text">Let's crush it.</span>
        </h1>
        <p className="text-dark-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} hover className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={18} style={{ color: stat.color }} />
                <span className="text-sm text-dark-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassCard delay={0.4} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" />
            Weekly Completion
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.5} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-400" />
            Monthly Productivity
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="productivity" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard delay={0.6} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-primary-400" />
            Goal Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-dark-400">Overall Progress</span>
                <span className="text-primary-400">{goalStats.avgProgress}%</span>
              </div>
              <ProgressBar value={goalStats.avgProgress} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-dark-800/50 rounded-lg">
                <p className="text-xl font-bold text-white">{goalStats.total}</p>
                <p className="text-xs text-dark-400">Total</p>
              </div>
              <div className="p-2 bg-dark-800/50 rounded-lg">
                <p className="text-xl font-bold text-primary-400">{goalStats.completed}</p>
                <p className="text-xs text-dark-400">Done</p>
              </div>
              <div className="p-2 bg-dark-800/50 rounded-lg">
                <p className="text-xl font-bold text-amber-400">{goalStats.inProgress}</p>
                <p className="text-xs text-dark-400">Active</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.7} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-400" />
            Today's Tasks
          </h3>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-white">{dailyStats.completed}</p>
                <p className="text-xs text-dark-400">of {dailyStats.total}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.8} className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame size={20} className="text-primary-400" />
            Top Habits
          </h3>
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-sm text-white">{habit.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={14} className="text-amber-500" />
                  <span className="text-sm font-medium text-white">{habit.streak}</span>
                </div>
              </div>
            )) : (
              <p className="text-dark-400 text-sm text-center py-4">No habits yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
