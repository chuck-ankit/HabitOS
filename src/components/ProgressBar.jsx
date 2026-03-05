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
        <div className="flex justify-between mb-1 text-xs md:text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="text-emerald-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-700/50 rounded-full overflow-hidden`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full relative overflow-hidden"
          style={{ 
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          }}
        >
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 1,
              ease: 'linear' 
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
