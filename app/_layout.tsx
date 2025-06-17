import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/errors';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/config/reactQuery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Verificamos si estamos en un entorno de desarrollo para mostrar contenido de depuración
const isDevelopment = process.env.NODE_ENV === 'development';

export default function RootLayout() {
  useFrameworkReady();
  
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ 
              headerShown: false,
              // Configuración de estilo consistente para los encabezados
              headerStyle: {
                backgroundColor: '#ffffff',
              },
              headerShadowVisible: false,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
                color: '#0f172a',
              },
              headerTintColor: '#0891b2',
            }}>
              <Stack.Screen name="+not-found" options={{ title: 'No encontrado' }} />
            </Stack>
            <StatusBar style="auto" />
            
            {/* 
              Aquí podrías añadir un componente Toast o notificación 
              para mensajes del sistema al usuario 
            */}
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}