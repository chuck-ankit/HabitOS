import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Flame, 
  TrendingUp, 
  Check, 
  Pencil, 
  Trash2,
  BarChart2,
  Sparkles
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useHabits } from '../hooks/useHabits';
import { getToday, getDaysInRange, formatDate } from '../utils/storage';
import confetti from 'canvas-confetti';

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#a855f7', '#f43f5e', '#22c55e', '#0ea5e9', '#eab308'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  }
};

const HabitTracker = () => {
  const { 
    habits, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    toggleHabitCompletion,
    getHabitStats 
  } = useHabits();
  
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    color: COLORS[Math.floor(Math.random() * COLORS.length)] 
  });

  const handleAddHabit = () => {
    setEditingHabit(null);
    setFormData({ 
      name: '', 
      description: '', 
      color: COLORS[Math.floor(Math.random() * COLORS.length)] 
    });
    setShowModal(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setFormData({ 
      name: habit.name, 
      description: habit.description || '', 
      color: habit.color 
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    
    if (editingHabit) {
      updateHabit(editingHabit.id, formData);
    } else {
      if (habits.length >= 30) {
        alert('Maximum 30 habits allowed');
        return;
      }
      addHabit(formData);
    }
    setShowModal(false);
  };

  const handleToggle = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    const wasCompleted = habit?.completedDates[getToday()];
    toggleHabitCompletion(habitId);
    
    if (!wasCompleted) {
      const newStreak = calculateNewStreak(habitId);
      if (newStreak > 0 && newStreak % 7 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      }
    }
  };

  const calculateNewStreak = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    let streak = 0;
    const date = new Date();
    
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      if (habit.completedDates[dateStr]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getHeatmapData = (habit) => {
    const days = getDaysInRange(getToday(), 365);
    return days.map(date => ({
      date,
      completed: !!habit.completedDates[date],
    }));
  };

  return (
    <div className="p-3 md:p-6 pb-28 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={24} />
          Habit Tracker
        </h1>
        <p className="text-sm md:text-base text-slate-400">{habits.length}/30 habits</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 md:space-y-4"
      >
        {habits.map((habit) => {
          const stats = getHabitStats(habit.id);
          const isCompletedToday = habit.completedDates[getToday()];
          
          return (
            <motion.div key={habit.id} variants={itemVariants}>
              <GlassCard hover className="p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(habit.id)}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-200
                      ${isCompletedToday 
                        ? 'text-white' 
                        : 'text-slate-400 hover:bg-emerald-500/20'
                      }
                    `}
                    style={{ 
                      backgroundColor: isCompletedToday ? habit.color : undefined,
                      boxShadow: isCompletedToday ? `0 4px 15px ${habit.color}60` : undefined
                    }}
                  >
                    {isCompletedToday ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check size={18} md:size={24} />
                      </motion.div>
                    ) : (
                      <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full" style={{ borderColor: habit.color, borderWidth: 2 }} />
                    )}
                  </motion.button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white text-sm md:text-base truncate max-w-[160px] md:max-w-[200px]">
                        {habit.name}
                      </h3>
                      {habit.streak > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full"
                        >
                          <Flame size={10} />
                          {habit.streak}
                        </motion.span>
                      )}
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                    
                    {habit.description && (
                      <p className="text-xs md:text-sm text-slate-400 mb-2 line-clamp-1">{habit.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-slate-400">
                      <span>
                        <TrendingUp size={12} className="inline mr-1" />
                        {stats?.winRate || 0}%
                      </span>
                      <span>Best: {habit.longestStreak}</span>
                    </div>
                    
                    <div className="mt-2 md:mt-3">
                      <ProgressBar 
                        value={stats?.winRate || 0} 
                        color={habit.color}
                        height="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowHeatmap(showHeatmap === habit.id ? null : habit.id)}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <BarChart2 size={14} md:size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditHabit(habit)}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Pencil size={14} md:size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (confirm('Delete this habit?')) deleteHabit(habit.id);
                      }}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} md:size={18} />
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showHeatmap === habit.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-700"
                    >
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getHeatmapData(habit).slice(-60).map((day) => (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.3 }}
                            key={day.date}
                            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm cursor-pointer"
                            title={`${formatDate(day.date)}: ${day.completed ? 'Done' : 'Missed'}`}
                            style={{ 
                              backgroundColor: day.completed ? habit.color : '#1f2937',
                              opacity: day.completed ? 1 : 0.4
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {habits.length === 0 && (
        <GlassCard className="text-center py-10 md:py-14">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame size={40} md:size={56} className="mx-auto text-slate-600 mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">No habits yet</h3>
          <p className="text-slate-400 mb-5 text-sm md:text-base">Start building better habits today!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddHabit}
            className="px-6 py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25 text-sm md:text-base"
          >
            Add Your First Habit
          </motion.button>
        </GlassCard>
      )}

      <FloatingActionButton 
        onAdd={handleAddHabit}
        items={[
          { 
            label: 'Add Habit', 
            icon: <Plus size={18} />, 
            onClick: handleAddHabit 
          }
        ]}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingHabit ? 'Edit Habit' : 'New Habit'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter habit name"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm md:text-base transition-all"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description"
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none text-sm md:text-base transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`
                    w-8 h-8 md:w-9 md:h-9 rounded-lg transition-all
                    ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : ''}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-sm md:text-base"
          >
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default HabitTracker;
