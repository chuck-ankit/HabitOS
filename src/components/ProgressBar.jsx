import { motion } from 'framer-motion';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  color = '#10b981',
  showLabel = false,
  height = 'h-2',
  className = '',
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-primary-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-dark-700/50 rounded-full overflow-hidden`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
