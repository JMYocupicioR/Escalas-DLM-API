// store/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DateFormat = '12h' | '24h';
export type MeasurementSystem = 'metric' | 'imperial';
export type Language = 'es' | 'en';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ContrastLevel = 'normal' | 'high';

export interface SettingsState {
  // Preferencias de usuario básicas
  darkMode: boolean;
  language: Language;
  dateFormat: DateFormat;
  measurementSystem: MeasurementSystem;
  
  // Configuración de tema avanzada
  themeMode: ThemeMode;
  contrastLevel: ContrastLevel;
  fontSize: FontSize;
  
  // Notificaciones
  notifications: boolean;
  reminderNotifications: boolean;
  updateNotifications: boolean;
  evaluationReminders: boolean;
  dataBackupNotifications: boolean;
  
  // Comportamiento de la app
  autoAdvanceQuestions: boolean;
  oneQuestionAtATime: boolean;
  showDetailedScores: boolean;
  enableHapticFeedback: boolean;
  defaultView: 'grid' | 'list';
  autoSaveEnabled: boolean;
  
  // Accesibilidad
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigationEnabled: boolean;
  
  // Privacidad y datos
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  dataRetentionDays: number;
  
  // Acciones básicas
  toggleDarkMode: () => void;
  setLanguage: (language: Language) => void;
  setDateFormat: (format: DateFormat) => void;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  
  // Acciones de tema
  setThemeMode: (mode: ThemeMode) => void;
  setContrastLevel: (level: ContrastLevel) => void;
  setFontSize: (size: FontSize) => void;
  
  // Acciones de notificaciones
  toggleNotifications: () => void;
  toggleReminderNotifications: () => void;
  toggleUpdateNotifications: () => void;
  toggleEvaluationReminders: () => void;
  toggleDataBackupNotifications: () => void;
  
  // Acciones de comportamiento
  toggleAutoAdvance: () => void;
  toggleOneQuestionAtATime: () => void;
  toggleDetailedScores: () => void;
  toggleHapticFeedback: () => void;
  setDefaultView: (view: 'grid' | 'list') => void;
  toggleAutoSave: () => void;
  
  // Acciones de accesibilidad
  toggleReduceMotion: () => void;
  toggleScreenReaderOptimization: () => void;
  toggleKeyboardNavigation: () => void;
  
  // Acciones de privacidad
  toggleAnalytics: () => void;
  toggleCrashReporting: () => void;
  setDataRetentionDays: (days: number) => void;
  
  resetSettings: () => void;
}

// Valores predeterminados para las configuraciones
const defaultSettings = {
  // Preferencias básicas
  darkMode: true,
  language: 'es' as Language,
  dateFormat: '24h' as DateFormat,
  measurementSystem: 'metric' as MeasurementSystem,
  
  // Tema avanzado
  themeMode: 'system' as ThemeMode,
  contrastLevel: 'normal' as ContrastLevel,
  fontSize: 'normal' as FontSize,
  
  // Notificaciones
  notifications: true,
  reminderNotifications: true,
  updateNotifications: true,
  evaluationReminders: false,
  dataBackupNotifications: true,
  
  // Comportamiento
  autoAdvanceQuestions: true,
  oneQuestionAtATime: false,
  showDetailedScores: true,
  enableHapticFeedback: true,
  defaultView: 'grid' as const,
  autoSaveEnabled: true,
  
  // Accesibilidad
  reduceMotion: false,
  screenReaderOptimized: false,
  keyboardNavigationEnabled: false,
  
  // Privacidad
  analyticsEnabled: true,
  crashReportingEnabled: true,
  dataRetentionDays: 365,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Estado inicial
      ...defaultSettings,
      
      // Acciones básicas
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        // Sincronizar themeMode con darkMode para mantener consistencia
        const newThemeMode = newDarkMode ? 'dark' : 'light';
        return { 
          darkMode: newDarkMode,
          themeMode: newThemeMode
        };
      }),
      setLanguage: (language) => set({ language }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setMeasurementSystem: (measurementSystem) => set({ measurementSystem }),
      
      // Acciones de tema
      setThemeMode: (themeMode) => set({ themeMode }),
      setContrastLevel: (contrastLevel) => set({ contrastLevel }),
      setFontSize: (fontSize) => set({ fontSize }),
      
      // Acciones de notificaciones
      toggleNotifications: () => set((state) => {
        const newNotificationsState = !state.notifications;
        return { 
          notifications: newNotificationsState,
          reminderNotifications: newNotificationsState ? state.reminderNotifications : false,
          updateNotifications: newNotificationsState ? state.updateNotifications : false,
          evaluationReminders: newNotificationsState ? state.evaluationReminders : false,
          dataBackupNotifications: newNotificationsState ? state.dataBackupNotifications : false,
        };
      }),
      
      toggleReminderNotifications: () => set((state) => ({
        reminderNotifications: !state.reminderNotifications,
        notifications: !state.reminderNotifications || state.updateNotifications || state.evaluationReminders || state.dataBackupNotifications
      })),
      
      toggleUpdateNotifications: () => set((state) => ({
        updateNotifications: !state.updateNotifications,
        notifications: state.reminderNotifications || !state.updateNotifications || state.evaluationReminders || state.dataBackupNotifications
      })),
      
      toggleEvaluationReminders: () => set((state) => ({
        evaluationReminders: !state.evaluationReminders,
        notifications: state.reminderNotifications || state.updateNotifications || !state.evaluationReminders || state.dataBackupNotifications
      })),
      
      toggleDataBackupNotifications: () => set((state) => ({
        dataBackupNotifications: !state.dataBackupNotifications,
        notifications: state.reminderNotifications || state.updateNotifications || state.evaluationReminders || !state.dataBackupNotifications
      })),
      
      // Acciones de comportamiento
      toggleAutoAdvance: () => set((state) => ({ autoAdvanceQuestions: !state.autoAdvanceQuestions })),
      toggleOneQuestionAtATime: () => set((state) => ({ oneQuestionAtATime: !state.oneQuestionAtATime })),
      toggleDetailedScores: () => set((state) => ({ showDetailedScores: !state.showDetailedScores })),
      toggleHapticFeedback: () => set((state) => ({ enableHapticFeedback: !state.enableHapticFeedback })),
      setDefaultView: (defaultView) => set({ defaultView }),
      toggleAutoSave: () => set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),
      
      // Acciones de accesibilidad
      toggleReduceMotion: () => set((state) => ({ reduceMotion: !state.reduceMotion })),
      toggleScreenReaderOptimization: () => set((state) => ({ screenReaderOptimized: !state.screenReaderOptimized })),
      toggleKeyboardNavigation: () => set((state) => ({ keyboardNavigationEnabled: !state.keyboardNavigationEnabled })),
      
      // Acciones de privacidad
      toggleAnalytics: () => set((state) => ({ analyticsEnabled: !state.analyticsEnabled })),
      toggleCrashReporting: () => set((state) => ({ crashReportingEnabled: !state.crashReportingEnabled })),
      setDataRetentionDays: (dataRetentionDays) => set({ dataRetentionDays }),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);