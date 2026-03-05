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
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Daily Planner</h1>
        <div className="flex items-center gap-2 text-dark-400">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: '#3b82f6' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Score', value: `${stats.productivityScore}%`, color: '#f59e0b' },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-dark-400">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mb-4">
        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.productivityScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
          />
        </div>
      </div>

      <div className="space-y-3">
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
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDailyTask(task.id)}
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
                          className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.bg}`}
                          style={{ color: priorityStyle.color }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-dark-400 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this task?')) deleteDailyTask(task.id);
                        }}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
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
        <GlassCard className="text-center py-12">
          <Clock size={48} className="mx-auto text-dark-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tasks for today</h3>
          <p className="text-dark-400 mb-4">Add some tasks to get started!</p>
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
            <label className="block text-sm text-dark-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to do?"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Description (optional)</label>
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
            {editingTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DailyPlanner;
