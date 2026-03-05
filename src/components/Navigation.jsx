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
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/50 z-40 md:top-0 md:bottom-auto md:left-0 md:right-auto md:w-20 md:h-screen md:border-t-0 md:border-r">
      <div className="flex md:flex-col justify-around md:justify-start md:pt-8 md:gap-4 px-2 py-2 md:px-2 md:py-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary-500/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                size={22} 
                className={`
                  relative z-10 transition-colors duration-200
                  ${isActive ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200'}
                `}
              />
              <span className={`
                text-xs mt-1 hidden md:block relative z-10
                ${isActive ? 'text-primary-400 font-medium' : 'text-dark-400'}
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
