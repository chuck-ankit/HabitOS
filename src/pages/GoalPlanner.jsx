import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Flag, 
  Calendar,
  Check,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import FloatingActionButton from '../components/FloatingActionButton';
import { useGoals } from '../hooks/useGoals';
import { getToday, getMonthName } from '../utils/storage';

const GOAL_TYPES = [
  { value: 'yearly', label: 'Yearly', icon: Flag },
  { value: 'quarterly', label: 'Quarterly', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: Calendar },
  { value: 'weekly', label: 'Weekly', icon: Calendar },
];

const CATEGORIES = [
  { value: 'personal', label: 'Personal', color: '#10b981' },
  { value: 'career', label: 'Career', color: '#3b82f6' },
  { value: 'health', label: 'Health', color: '#f59e0b' },
  { value: 'learning', label: 'Learning', color: '#8b5cf6' },
  { value: 'finance', label: 'Finance', color: '#14b8a6' },
];

const GoalPlanner = () => {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    addMilestone, 
    toggleMilestone,
    getGoalStats
  } = useGoals();
  
  const [showModal, setShowModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'yearly',
    category: 'personal',
    progress: 0,
  });
  const [milestoneData, setMilestoneData] = useState({ title: '' });
  const [expandedGoal, setExpandedGoal] = useState(null);

  const stats = getGoalStats();

  const handleAddGoal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      type: 'yearly',
      category: 'personal',
      progress: 0,
    });
    setShowModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      type: goal.type,
      category: goal.category,
      progress: goal.progress,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    
    if (editingGoal) {
      updateGoal(editingGoal.id, formData);
    } else {
      addGoal(formData);
    }
    setShowModal(false);
  };

  const handleAddMilestone = (goalId) => {
    setSelectedGoalId(goalId);
    setMilestoneData({ title: '' });
    setShowMilestoneModal(true);
  };

  const handleSaveMilestone = () => {
    if (!milestoneData.title.trim()) return;
    addMilestone(selectedGoalId, milestoneData);
    setShowMilestoneModal(false);
  };

  const getCategoryColor = (category) => {
    return CATEGORIES.find(c => c.value === category)?.color || '#10b981';
  };

  const groupedGoals = GOAL_TYPES.map(type => ({
    ...type,
    goals: goals.filter(g => g.type === type.value),
  }));

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Goal Planner</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-dark-400">
            {stats.completed} completed
          </span>
          <span className="text-dark-400">
            {stats.inProgress} in progress
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Goals', value: stats.total, color: '#10b981' },
          { label: 'Completed', value: stats.completed, color: '#3b82f6' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#f59e0b' },
        ].map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1} className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-dark-400">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-6">
        {groupedGoals.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.value}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-primary-400" />
                <h2 className="text-lg font-semibold text-white capitalize">{group.label} Goals</h2>
                <span className="text-sm text-dark-500">({group.goals.length})</span>
              </div>
              
              <div className="space-y-3">
                {group.goals.map((goal, index) => {
                  const categoryColor = getCategoryColor(goal.category);
                  const isExpanded = expandedGoal === goal.id;
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="p-4">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-1 h-12 rounded-full" 
                            style={{ backgroundColor: categoryColor }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate">{goal.title}</h3>
                              {goal.progress === 100 && (
                                <span className="flex items-center gap-1 text-xs text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-full">
                                  <Check size={12} />
                                  Done
                                </span>
                              )}
                            </div>
                            
                            {goal.description && (
                              <p className="text-sm text-dark-400 mb-2 line-clamp-1">{goal.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 mb-2">
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${categoryColor}20`,
                                  color: categoryColor 
                                }}
                              >
                                {goal.category}
                              </span>
                            </div>
                            
                            <ProgressBar 
                              value={goal.progress} 
                              color={categoryColor}
                              showLabel
                            />
                            
                            {goal.milestones.length > 0 && (
                              <button
                                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                                className="flex items-center gap-1 mt-3 text-sm text-dark-400 hover:text-white"
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                {goal.milestones.length} milestones
                              </button>
                            )}
                            
                            {isExpanded && goal.milestones.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 space-y-2"
                              >
                                {goal.milestones.map((milestone) => (
                                  <div
                                    key={milestone.id}
                                    onClick={() => toggleMilestone(goal.id, milestone.id)}
                                    className="flex items-center gap-2 p-2 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-700/50"
                                  >
                                    <div className={`
                                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                                      ${milestone.completed ? 'bg-primary-500 border-primary-500' : 'border-dark-500'}
                                    `}>
                                      {milestone.completed && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${milestone.completed ? 'text-dark-400 line-through' : 'text-white'}`}>
                                      {milestone.title}
                                    </span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAddMilestone(goal.id)}
                              className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                            >
                              <Plus size={18} />
                            </button>
                            <button
                              onClick={() => handleEditGoal(goal)}
                              className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this goal?')) deleteGoal(goal.id);
                              }}
                              className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
                
                {group.goals.length === 0 && (
                  <p className="text-dark-500 text-sm text-center py-4">No {group.label.toLowerCase()} goals yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <FloatingActionButton 
        onAdd={handleAddGoal}
        items={[
          { 
            label: 'Add Goal', 
            icon: <Plus size={18} />, 
            onClick: handleAddGoal 
          }
        ]}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingGoal ? 'Edit Goal' : 'New Goal'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter goal title"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description"
              rows={3}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-colors
                    ${formData.type === type.value 
                      ? 'border-primary-500 bg-primary-500/10 text-white' 
                      : 'border-dark-700 text-dark-400 hover:border-dark-600'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-dark-400 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${formData.category === cat.value 
                      ? 'text-white'
                      : 'text-dark-400 bg-dark-800 hover:bg-dark-700'
                    }
                  `}
                  style={formData.category === cat.value ? { backgroundColor: cat.color } : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            {editingGoal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark-400 mb-1">Milestone Title</label>
            <input
              type="text"
              value={milestoneData.title}
              onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
              placeholder="Enter milestone"
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              autoFocus
            />
          </div>
          
          <button
            onClick={handleSaveMilestone}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Add Milestone
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GoalPlanner;
