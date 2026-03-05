import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Clock, 
  Flag,
  Pencil,
  Trash2,
  Calendar
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useTasks } from '../hooks/useTasks';
import { getToday } from '../utils/storage';

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#ef4444', bg: 'bg-red-500/10' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', bg: 'bg-amber-500/10' },
  { value: 'low', label: 'Low', color: '#10b981', bg: 'bg-emerald-500/10' },
];

const DailyPlanner = () => {
  const { 
    dailyTasks, 
    addDailyTask, 
    deleteDailyTask, 
    toggleDailyTask,
    getDailyStats,
    updateDailyTask
  } = useTasks();
  
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  const todayTasks = dailyTasks.filter(t => t.date === getToday());
  const stats = getDailyStats(getToday());

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium' });
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    
    if (editingTask) {
      updateDailyTask(editingTask.id, formData);
    } else {
      addDailyTask(formData);
    }
    setShowModal(false);
  };

  const sortedTasks = [...todayTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityStyle = (priority) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  };

  return (
    <div className="p-3 md:p-6 pb-28 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Daily Planner</h1>
        <div className="flex items-center gap-2 text-sm md:text-base text-slate-400">
          <Calendar size={14} md:size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        {[
          { label: 'Total', value: stats.total, color: '#3b82f6' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Score', value: `${stats.productivityScore}%`, color: '#f59e0b' },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs md:text-sm text-slate-400">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-4 md:mb-6">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.productivityScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task, index) => {
            const priorityStyle = getPriorityStyle(task.priority);
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <button
                      onClick={() => toggleDailyTask(task.id)}
                      className={`
                        w-5 h-5 md:w-6 md:h-6 mt-0.5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0
                        ${task.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'border-2 border-slate-600 hover:border-emerald-500'
                        }
                      `}
                    >
                      {task.completed && <Check size={12} md:size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-medium text-sm md:text-base truncate ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        <span 
                          className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${priorityStyle.bg}`}
                          style={{ color: priorityStyle.color }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs md:text-sm text-slate-400 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Pencil size={14} md:size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this task?')) deleteDailyTask(task.id);
                        }}
                        className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} md:size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sortedTasks.length === 0 && (
        <GlassCard className="text-center py-8 md:py-12">
          <Clock size={36} md:size={48} className="mx-auto text-slate-500 mb-3 md:mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tasks for today</h3>
          <p className="text-slate-400 mb-4 text-sm md:text-base">Add some tasks to get started!</p>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to do?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm md:text-base"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details"
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none text-sm md:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`
                    flex-1 p-2 rounded-lg border text-xs md:text-sm font-medium transition-colors
                    ${formData.priority === p.value 
                      ? 'border-white/20 text-white' 
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }
                  `}
                  style={formData.priority === p.value ? { backgroundColor: p.color + '30' } : {}}
                >
                  <Flag size={12} md:size={14} className="inline mr-1" style={{ color: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-2.5 md:py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
          >
            {editingTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DailyPlanner;
