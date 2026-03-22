/**
 * @file hooks/usePWAInstall.ts
 * @description Hook to manage PWA install prompt (beforeinstallprompt)
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = '@pwa_install_dismissed';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // start hidden until we check
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed as standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    if (isStandalone) return;

    // Check if user previously dismissed the banner
    AsyncStorage.getItem(DISMISSED_KEY).then((value) => {
      if (value) {
        const dismissedAt = parseInt(value, 10);
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) {
          setIsDismissed(true);
          return;
        }
      }
      setIsDismissed(false);
    });

    // Listen for the browser's install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(async () => {
    setIsDismissed(true);
    await AsyncStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  const canInstall = Platform.OS === 'web' && !isInstalled && !isDismissed;
  const canPromptNative = canInstall && deferredPrompt !== null;
  const showIOSInstructions = canInstall && isIOS && !deferredPrompt;

  return {
    canInstall,
    canPromptNative,
    showIOSInstructions,
    isInstalled,
    promptInstall,
    dismiss,
  };
}
