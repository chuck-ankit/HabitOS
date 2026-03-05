import { useState, useEffect, useCallback } from 'react';
import { 
  initGoogleApi, 
  signInWithGoogle, 
  signOutGoogle, 
  isSignedIn,
  saveToGoogleDrive,
  loadFromGoogleDrive,
  getUserInfo
} from '../utils/googleDrive';
import { loadData, saveData } from '../utils/storage';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const checkStoredAuth = useCallback(async () => {
    const storedUser = localStorage.getItem('habitos_google_user');
    const storedLastSync = localStorage.getItem('habitos_last_sync');
    const token = localStorage.getItem('habitos_google_token');
    
    if (token && isSignedIn()) {
      setIsConnected(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
      if (storedLastSync) {
        setLastSync(JSON.parse(storedLastSync));
      }
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await initGoogleApi();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for stored auth
        const hasStoredAuth = await checkStoredAuth();
        
        if (!hasStoredAuth) {
          const wasConnected = isSignedIn();
          if (wasConnected) {
            const userInfo = await getUserInfo();
            if (userInfo) {
              setUser(userInfo);
              setIsConnected(true);
              const stored = localStorage.getItem('habitos_last_sync');
              if (stored) setLastSync(JSON.parse(stored));
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize Google API:', err);
        setError('Failed to initialize Google. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, [checkStoredAuth]);

  const signIn = useCallback(async (autoSync = true) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      
      const userInfo = await getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        setIsConnected(true);
      } else {
        setUser({ name: 'Google User', email: 'Signed in' });
        setIsConnected(true);
      }

      if (autoSync) {
        try {
          const cloudData = await loadFromGoogleDrive();
          if (cloudData) {
            saveData(cloudData);
            const now = new Date().toISOString();
            setLastSync(now);
            localStorage.setItem('habitos_last_sync', JSON.stringify(now));
            window.dispatchEvent(new CustomEvent('habitos-data-updated'));
          }
        } catch (syncErr) {
          console.warn('Auto-sync failed:', syncErr);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in with Google';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    signOutGoogle();
    setUser(null);
    setIsConnected(false);
    setLastSync(null);
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Not connected to Google');
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const localData = loadData();
      await saveToGoogleDrive(localData);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem('habitos_last_sync', JSON.stringify(now));
    } catch (err) {
      const errorMessage = err.message || 'Failed to sync to cloud';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const syncFromCloud = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Not connected to Google');
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const cloudData = await loadFromGoogleDrive();
      if (cloudData) {
        saveData(cloudData);
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem('habitos_last_sync', JSON.stringify(now));
        window.dispatchEvent(new CustomEvent('habitos-data-updated'));
      }
      return cloudData;
    } catch (err) {
      const errorMessage = err.message || 'Failed to sync from cloud';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return {
    isLoading,
    isConnected,
    user,
    lastSync,
    error,
    signIn,
    signOut,
    syncToCloud,
    syncFromCloud,
    clearError: () => setError(null),
  };
};
