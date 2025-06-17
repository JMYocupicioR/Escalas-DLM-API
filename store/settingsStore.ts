// store/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DateFormat = '12h' | '24h';
export type MeasurementSystem = 'metric' | 'imperial';
export type Language = 'es' | 'en';

export interface SettingsState {
  // Preferencias de usuario
  darkMode: boolean;
  language: Language;
  dateFormat: DateFormat;
  measurementSystem: MeasurementSystem;
  
  // Notificaciones
  notifications: boolean;
  reminderNotifications: boolean;
  updateNotifications: boolean;
  
  // Acciones
  toggleDarkMode: () => void;
  setLanguage: (language: Language) => void;
  setDateFormat: (format: DateFormat) => void;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  toggleNotifications: () => void;
  toggleReminderNotifications: () => void;
  toggleUpdateNotifications: () => void;
  resetSettings: () => void;
}

// Valores predeterminados para las configuraciones
const defaultSettings = {
  darkMode: false,
  language: 'es' as Language,
  dateFormat: '24h' as DateFormat,
  measurementSystem: 'metric' as MeasurementSystem,
  notifications: true,
  reminderNotifications: true,
  updateNotifications: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Estado inicial
      ...defaultSettings,
      
      // Acciones
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      setLanguage: (language) => set({ language }),
      
      setDateFormat: (dateFormat) => set({ dateFormat }),
      
      setMeasurementSystem: (measurementSystem) => set({ measurementSystem }),
      
      toggleNotifications: () => set((state) => {
        const newNotificationsState = !state.notifications;
        return { 
          notifications: newNotificationsState,
          // Si se desactivan las notificaciones globales, desactivar todas las específicas
          reminderNotifications: newNotificationsState ? state.reminderNotifications : false,
          updateNotifications: newNotificationsState ? state.updateNotifications : false,
        };
      }),
      
      toggleReminderNotifications: () => set((state) => ({
        reminderNotifications: !state.reminderNotifications,
        // Asegurar que las notificaciones globales estén activas si alguna específica está activa
        notifications: !state.reminderNotifications || state.updateNotifications ? true : state.notifications
      })),
      
      toggleUpdateNotifications: () => set((state) => ({
        updateNotifications: !state.updateNotifications,
        // Asegurar que las notificaciones globales estén activas si alguna específica está activa
        notifications: state.reminderNotifications || !state.updateNotifications ? true : state.notifications
      })),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);