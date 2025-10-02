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
import { Appearance } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  
  // Configurar entorno de desarrollo
  useEffect(() => {
    setupDevelopmentEnvironment();
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
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="+not-found" options={{ title: 'No encontrado' }} />
                </Stack>
                <StatusBar style={effectiveDarkMode ? 'light' : 'dark'} />
                <ToastContainer />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </PaperProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}