import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  Palette,
  HardDrive,
  Cloud,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useSettings } from '../hooks/useSettings';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { exportData, importData, resetData, saveData } from '../utils/storage';

const Settings = () => {
  const { settings, toggleTheme } = useSettings();
  const { habits } = useHabits();
  const { goals } = useGoals();
  const { dailyTasks, weeklyTasks } = useTasks();
  const { isConnected, user, lastSync, signIn, syncToCloud, syncFromCloud, isLoading: isSyncing, error, signOut } = useGoogleAuth();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    exportData();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    importData(file)
      .then(() => {
        setImportStatus({ type: 'success', message: 'Data imported successfully!' });
        setTimeout(() => window.location.reload(), 1500);
      })
      .catch(() => {
        setImportStatus({ type: 'error', message: 'Failed to import data.' });
      });
  };

  const handleReset = () => {
    const freshData = resetData();
    saveData(freshData);
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="p-3 md:p-6 pb-28 md:pb-6 md:ml-20 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Settings</h1>
        <p className="text-sm md:text-base text-slate-400">Manage your app preferences</p>
      </motion.div>

      <div className="grid gap-4 md:gap-6 max-w-2xl">
        {/* Appearance */}
        <GlassCard delay={0.1} className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Palette size={18} md:size={20} className="text-emerald-400" />
            Appearance
          </h2>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon size={20} className="text-emerald-400" />
              ) : (
                <Sun size={20} className="text-amber-400" />
              )}
              <div>
                <p className="font-medium text-white text-sm md:text-base">Theme</p>
                <p className="text-xs md:text-sm text-slate-400">
                  {settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`
                relative w-12 h-6 md:w-14 md:h-8 rounded-full transition-colors duration-300
                ${settings.theme === 'dark' ? 'bg-emerald-500' : 'bg-amber-400'}
              `}
            >
              <motion.div
                animate={{ x: settings.theme === 'dark' ? 24 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </GlassCard>

        {/* Cloud Sync */}
        <GlassCard delay={0.2} className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Cloud size={18} md:size={20} className="text-emerald-400" />
            Cloud Sync
          </h2>
          
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 mb-1">{error}</p>
              <p className="text-xs text-slate-400">
                Fix: Enable Google Drive API in{' '}
                <a 
                  href="https://console.cloud.google.com/apis/library" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>
          )}
          
          {!isConnected ? (
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-slate-400">
                Sign in with Google to sync your data across devices.
              </p>
              <button
                onClick={signIn}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 bg-white text-slate-900 font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {isSyncing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92-4.74 3.28 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Cloud size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm md:text-base truncate">{user?.name || 'Google User'}</p>
                  <p className="text-xs md:text-sm text-slate-400 truncate">{user?.email}</p>
                </div>
                <Check size={20} className="text-green-400 flex-shrink-0" />
              </div>
              
              {lastSync && (
                <p className="text-xs text-slate-500 text-center">
                  Last synced: {new Date(lastSync).toLocaleString()}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    try {
                      setSyncStatus({ type: 'syncing', message: 'Saving...' });
                      await syncToCloud();
                      setSyncStatus({ type: 'success', message: 'Saved to cloud!' });
                      setTimeout(() => setSyncStatus(null), 2000);
                    } catch (err) {
                      console.error(err);
                      setSyncStatus({ type: 'error', message: 'Failed to save' });
                    }
                  }}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors disabled:opacity-50 text-xs md:text-sm"
                >
                  <Upload size={14} md:size={16} />
                  Save to Cloud
                </button>
                <button
                  onClick={async () => {
                    try {
                      setSyncStatus({ type: 'syncing', message: 'Loading...' });
                      await syncFromCloud();
                      setSyncStatus({ type: 'success', message: 'Loaded from cloud!' });
                      setTimeout(() => setSyncStatus(null), 2000);
                    } catch (err) {
                      console.error(err);
                      setSyncStatus({ type: 'error', message: 'Failed to load' });
                    }
                  }}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 text-xs md:text-sm"
                >
                  <Download size={14} md:size={16} />
                  Load from Cloud
                </button>
              </div>
              
              {syncStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-2 rounded-lg text-xs text-center
                    ${syncStatus.type === 'success' ? 'bg-green-500/20 text-green-400' : 
                      syncStatus.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}
                  `}
                >
                  {syncStatus.message}
                </motion.div>
              )}
              
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-red-400 transition-colors text-xs md:text-sm"
              >
                <Trash2 size={14} md:size={16} />
                Sign out
              </button>
            </div>
          )}
        </GlassCard>

        {/* Data Management */}
        <GlassCard delay={0.3} className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <HardDrive size={18} md:size={20} className="text-emerald-400" />
            Data Management
          </h2>
          
          <div className="space-y-2 md:space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={18} md:size={20} className="text-emerald-400" />
                <div className="text-left">
                  <p className="font-medium text-white text-sm md:text-base">Export Data</p>
                  <p className="text-xs md:text-sm text-slate-400">Download as JSON</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload size={18} md:size={20} className="text-blue-400" />
                <div className="text-left">
                  <p className="font-medium text-white text-sm md:text-base">Import Data</p>
                  <p className="text-xs md:text-sm text-slate-400">Restore from backup</p>
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            
            {importStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  p-2 rounded-lg text-xs text-center
                  ${importStatus.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                `}
              >
                {importStatus.message}
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Storage Info */}
        <GlassCard delay={0.4} className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <Info size={18} md:size={20} className="text-emerald-400" />
            Storage Info
          </h2>
          
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {[
              { label: 'Habits', value: habits.length, color: '#10b981' },
              { label: 'Goals', value: goals.length, color: '#3b82f6' },
              { label: 'Daily Tasks', value: dailyTasks.length, color: '#f59e0b' },
              { label: 'Weekly Tasks', value: weeklyTasks.length, color: '#8b5cf6' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 bg-slate-800/50 rounded-xl text-center">
                <p className="text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] md:text-xs text-slate-500 mt-3 md:mt-4 text-center">
            Data stored locally in browser
          </p>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard delay={0.5} className="p-4 md:p-5 border border-red-500/20">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
            <AlertTriangle size={18} md:size={20} className="text-red-400" />
            Danger Zone
          </h2>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 md:py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-colors text-sm md:text-base"
            >
              Reset All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-400">
                This will permanently delete all your data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm md:text-base"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* About */}
        <GlassCard delay={0.6} className="p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">About HabitOS</h2>
          <div className="space-y-1 text-xs md:text-sm text-slate-400">
            <p><span className="text-white font-medium">Version:</span> 1.0.0</p>
            <p><span className="text-white font-medium">Built with:</span> React, Vite, TailwindCSS, Framer Motion</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Settings;
