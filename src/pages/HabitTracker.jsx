import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Flame, 
  TrendingUp, 
  Check, 
  X, 
  Pencil, 
  Trash2,
  BarChart2
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
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

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
  const [formData, setFormData] = useState({ name: '', description: '', color: COLORS[0] });

  const handleAddHabit = () => {
    setEditingHabit(null);
    setFormData({ name: '', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] });
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
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Habit Tracker</h1>
        <p className="text-dark-400">{habits.length}/30 habits</p>
      </motion.div>

      <div className="space-y-4">
        {habits.map((habit, index) => {
          const stats = getHabitStats(habit.id);
          const isCompletedToday = habit.completedDates[getToday()];
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover className="p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                      ${isCompletedToday 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700 text-dark-400 hover:bg-primary-500/20'
                      }
                    `}
                  >
                    {isCompletedToday ? <Check size={24} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{habit.name}</h3>
                      {habit.streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Flame size={12} />
                          {habit.streak}
                        </span>
                      )}
                    </div>
                    
                    {habit.description && (
                      <p className="text-sm text-dark-400 mb-2 line-clamp-1">{habit.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-dark-400">
                        <TrendingUp size={14} className="inline mr-1" />
                        {stats?.winRate || 0}% win rate
                      </span>
                      <span className="text-dark-400">
                        Best: {habit.longestStreak}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <ProgressBar 
                        value={stats?.winRate || 0} 
                        color={habit.color}
                        height="h-1.5"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowHeatmap(showHeatmap === habit.id ? null : habit.id)}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <BarChart2 size={18} />
                    </button>
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this habit?')) deleteHabit(habit.id);
                      }}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showHeatmap === habit.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-dark-700"
                    >
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getHeatmapData(habit).slice(-90).map((day, i) => (
                          <div
                            key={day.date}
                            className="heatmap-cell"
                            title={`${formatDate(day.date)}: ${day.completed ? 'Completed' : 'Not completed'}`}
                            style={{ 
                              backgroundColor: day.completed ? habit.color : '#1f2937',
                              opacity: day.completed ? 1 : 0.3
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
      </div>

      {habits.length === 0 && (
        <GlassCard className="text-center py-12">
          <Flame size={48} className="mx-auto text-dark-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No habits yet</h3>
          <p className="text-dark-400 mb-4">Start building better habits today!</p>
          <button
            onClick={handleAddHabit}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Add Your First Habit
          </button>
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
            <label className="block text-sm text-dark-400 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter habit name"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description"
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`
                    w-8 h-8 rounded-lg transition-transform
                    ${formData.color === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-dark-800' : ''}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HabitTracker;
