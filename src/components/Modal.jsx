import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-2 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, borderRadius: '24px' }}
            animate={{ opacity: 1, scale: 1, y: 0, borderRadius: '16px' }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="relative w-full max-w-md bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden max-h-[85vh] md:max-h-[70vh]"
          >
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-between p-4 md:p-5 border-b border-slate-700"
            >
              <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </motion.div>
            <div className="p-4 md:p-5 overflow-y-auto max-h-[calc(85vh-70px)] md:max-h-[calc(70vh-70px)] scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
