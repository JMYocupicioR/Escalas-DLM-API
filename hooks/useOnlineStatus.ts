/**
 * @file hooks/useOnlineStatus.ts
 * @description Hook to track online/offline status and sync with scalesCache store
 */
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useScalesCacheStore } from '@/store/scalesCache';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const setOnlineStatus = useScalesCacheStore((s) => s.setOnlineStatus);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // On native, we're always "online" from this hook's perspective
      // NetInfo would be used for native, but this hook is web-focused
      return;
    }

    const updateStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);
      setOnlineStatus(status);
    };

    // Set initial status
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [setOnlineStatus]);

  return isOnline;
}
