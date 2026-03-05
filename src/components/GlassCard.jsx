import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
      } : undefined}
      onClick={onClick}
      className={`
        glass-card p-6 
        ${hover ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
