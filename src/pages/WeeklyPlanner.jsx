import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Flag,
  Pencil,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { getToday } from '../utils/storage';

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#10b981' },
];

const WeeklyPlanner = () => {
  const { 
    weeklyTasks, 
    addWeeklyTask, 
    deleteWeeklyTask, 
    toggleWeeklyTask,
    getWeeklyStats
  } = useTasks();
  const { habits, getOverallStats } = useHabits();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  const weekStartStr = currentWeekStart.toISOString().split('T')[0];
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const weekTasks = weeklyTasks.filter(t => t.weekStart === weekStartStr);
  const stats = getWeeklyStats(weekStartStr);
  const habitStats = getOverallStats();

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: d.toISOString().split('T')[0] === getToday(),
      });
    }
    return days;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleAddTask = () => {
    setFormData({ title: '', description: '', priority: 'medium' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    addWeeklyTask({ ...formData, weekStart: weekStartStr });
    setShowModal(false);
  };

  const getWeekProgress = () => {
    const days = getDaysOfWeek();
    const completedDays = days.filter(d => {
      const dayCompleted = habits.filter(h => h.completedDates[d.dateStr]).length;
      const totalHabits = habits.length || 1;
      return (dayCompleted / totalHabits) >= 0.5;
    }).length;
    return Math.round((completedDays / 7) * 100);
  };

  const days = getDaysOfWeek();

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Weekly Planner</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-dark-400">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day) => (
          <GlassCard 
            key={day.dateStr} 
            className={`p-2 text-center ${day.isToday ? 'border-primary-500/50' : ''}`}
          >
            <p className="text-xs text-dark-400 mb-1">{day.dayName}</p>
            <p className={`text-lg font-semibold ${day.isToday ? 'text-primary-400' : 'text-white'}`}>
              {day.dayNum}
            </p>
            <div className="mt-2 h-1 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500"
                style={{ 
                  width: `${habits.length > 0 ? (habits.filter(h => h.completedDates[day.dateStr]).length / habits.length) * 100 : 0}%` 
                }}
              />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tasks', value: stats.total, color: '#3b82f6' },
          { label: 'Done', value: stats.completed, color: '#10b981' },
          { label: 'Score', value: `${getWeekProgress()}%`, color: '#f59e0b' },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-dark-400">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {weekTasks.map((task, index) => {
            const priority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1];
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleWeeklyTask(task.id)}
                      className={`
                        w-6 h-6 mt-0.5 rounded-full flex items-center justify-center transition-all duration-200
                        ${task.completed 
                          ? 'bg-primary-500 text-white' 
                          : 'border-2 border-dark-600 hover:border-primary-500'
                        }
                      `}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium truncate ${task.completed ? 'text-dark-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${priority.color}20`,
                            color: priority.color 
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-dark-400 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        if (confirm('Delete this task?')) deleteWeeklyTask(task.id);
                      }}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {weekTasks.length === 0 && (
        <GlassCard className="text-center py-12">
          <Calendar size={48} className="mx-auto text-dark-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No weekly tasks</h3>
          <p className="text-dark-400 mb-4">Add tasks for this week!</p>
        </GlassCard>
      )}

      <FloatingActionButton 
        onAdd={handleAddTask}
        items={[
          { 
            label: 'Add Task', 
            icon: <Plus size={18} />, 
            onClick: handleAddTask 
          }
        ]}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Weekly Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to do this week?"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details"
              rows={2}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`
                    flex-1 p-2 rounded-lg border text-sm font-medium transition-colors
                    ${formData.priority === p.value 
                      ? 'border-white/20 text-white' 
                      : 'border-dark-700 text-dark-400 hover:border-dark-600'
                    }
                  `}
                  style={formData.priority === p.value ? { backgroundColor: p.color + '30' } : {}}
                >
                  <Flag size={14} className="inline mr-1" style={{ color: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyPlanner;
