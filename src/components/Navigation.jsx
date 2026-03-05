import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Flame,
  History
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/habits', icon: Flame, label: 'Habits' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/daily', icon: Calendar, label: 'Daily' },
  { path: '/weekly', icon: CheckSquare, label: 'Weekly' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-40 md:top-0 md:bottom-auto md:left-0 md:right-auto md:w-16 md:h-screen md:border-t-0 md:border-r">
      <div className="flex md:flex-col justify-around md:justify-start md:pt-4 md:gap-1 px-1 py-2 md:px-1 md:py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center p-2 md:p-2.5 rounded-xl transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-emerald-500/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                size={20} md:size={22} 
                className={`
                  relative z-10 transition-colors duration-200
                  ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}
                `}
              />
              <span className={`
                text-[10px] md:text-xs mt-0.5 md:mt-1 hidden md:block relative z-10
                ${isActive ? 'text-emerald-400 font-medium' : 'text-slate-400'}
              `}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
