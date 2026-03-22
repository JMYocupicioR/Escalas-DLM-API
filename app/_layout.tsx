import { useEffect } from 'react';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/errors';
import { ToastContainer } from '@/components/Toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/config/reactQuery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useSettingsStore } from '@/store/settingsStore';
import { navigationDarkTheme, navigationLightTheme, paperDarkTheme, paperLightTheme } from '@/app/theme';
import { setupDevelopmentEnvironment } from '@/config/development';
import { Appearance, Platform } from 'react-native';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function RootLayout() {
  useFrameworkReady();
  
  // Configurar entorno de desarrollo
  useEffect(() => {
    setupDevelopmentEnvironment();
  }, []);

  // Fix tab bar label clipping on web (React Navigation inline style override)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const patchTabBar = () => {
      const tablist = document.querySelector('[role="tablist"]') as HTMLElement | null;
      if (!tablist) return;
      // Patch inner container (the one with inline height set by RN Web)
      const inner = tablist.parentElement as HTMLElement | null;
      if (inner) {
        inner.style.height = '85px';
        inner.style.minHeight = '85px';
        inner.style.overflow = 'visible';
        inner.style.paddingTop = '8px';
        inner.style.paddingBottom = '10px';
        inner.style.boxSizing = 'border-box';
      }
      tablist.style.height = '100%';
      tablist.style.overflow = 'visible';
      // Patch each tab item
      tablist.querySelectorAll('[role="tab"]').forEach((tab) => {
        (tab as HTMLElement).style.overflow = 'visible';
        (tab as HTMLElement).style.height = '100%';
      });
    };

    // Try immediately and via MutationObserver for dynamic renders
    patchTabBar();
    const observer = new MutationObserver(patchTabBar);
    observer.observe(document.body, { childList: true, subtree: true });
    // After 2 seconds stop observing (tab bar is stable)
    const timer = setTimeout(() => observer.disconnect(), 2000);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Podríamos añadir lógica de inicialización aquí si es necesario
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Verificar la primera ejecución o actualización importante
        const appVersion = await AsyncStorage.getItem('@app_version');
        const currentVersion = '1.0.0'; // Obtener de package.json en un caso real
        
        if (appVersion !== currentVersion) {
          // Acciones para primera ejecución o actualización
          await AsyncStorage.setItem('@app_version', currentVersion);
        }
      } catch (error) {
        console.error('Error en la inicialización de la app:', error);
      }
    };
    initializeApp();
  }, []);

  const { darkMode, themeMode } = useSettingsStore((s) => ({
    darkMode: s.darkMode,
    themeMode: s.themeMode,
  }));
  
  // Determinar el modo efectivo considerando el sistema
  const systemColorScheme = Appearance.getColorScheme();
  const effectiveDarkMode = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark' || darkMode;
  
  const navTheme = effectiveDarkMode ? navigationDarkTheme : navigationLightTheme;
  const paperTheme = effectiveDarkMode ? paperDarkTheme : paperLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navTheme}>
              <BottomSheetModalProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
                  <Stack.Screen name="register" options={{ title: 'Registro' }} />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="+not-found" options={{ title: 'No encontrado' }} />
                </Stack>
                <StatusBar style={effectiveDarkMode ? 'light' : 'dark'} />
                <ToastContainer />
                <OfflineBanner />
                <PWAInstallBanner />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </PaperProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}