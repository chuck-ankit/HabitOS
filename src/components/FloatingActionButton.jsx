import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const FloatingActionButton = ({ onAdd, items = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2"
          >
            {items.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-primary-500/30 rounded-full text-sm text-white hover:bg-primary-600 transition-colors shadow-lg"
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 flex items-center justify-center text-white"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
