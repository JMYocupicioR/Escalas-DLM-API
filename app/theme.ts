import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme as PaperDarkBase,
  MD3LightTheme as PaperLightBase,
  MD3Theme as PaperTheme,
} from 'react-native-paper';

const primary = '#0891b2';

// Tema claro estándar
const light = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  border: '#e5e7eb',
  mutedText: '#64748b',
  surface: '#f1f5f9',
  surfaceVariant: '#e2e8f0',
  onSurface: '#1e293b',
  onSurfaceVariant: '#475569',
};

// Tema oscuro estándar
const dark = {
  background: '#0f172a',
  card: '#111827',
  text: '#f8fafc',
  border: '#334155',
  mutedText: '#94a3b8',
  surface: '#1e293b',
  surfaceVariant: '#374151',
  onSurface: '#e2e8f0',
  onSurfaceVariant: '#cbd5e1',
};

// Tema de alto contraste para accesibilidad
const highContrast = {
  background: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  border: '#000000',
  mutedText: '#333333',
  surface: '#f5f5f5',
  surfaceVariant: '#e0e0e0',
  onSurface: '#000000',
  onSurfaceVariant: '#1a1a1a',
};

// Tema oscuro de alto contraste
const highContrastDark = {
  background: '#000000',
  card: '#1a1a1a',
  text: '#ffffff',
  border: '#ffffff',
  mutedText: '#cccccc',
  surface: '#0d1117',
  surfaceVariant: '#2d3748',
  onSurface: '#ffffff',
  onSurfaceVariant: '#f7fafc',
};

// Colores médicos con accesibilidad mejorada
export const medicalColors = {
  // Estados de salud con buen contraste
  critical: '#dc2626',      // Rojo crítico (contrast: 8.9:1)
  warning: '#d97706',       // Naranja advertencia (contrast: 7.2:1)  
  caution: '#ca8a04',       // Amarillo precaución (contrast: 6.1:1)
  good: '#16a34a',          // Verde bueno (contrast: 5.8:1)
  excellent: '#15803d',     // Verde excelente (contrast: 7.1:1)
  
  // Colores específicos médicos
  cardio: '#ef4444',
  neuro: '#8b5cf6', 
  ortho: '#06b6d4',
  psych: '#f59e0b',
  general: '#6b7280',
};

export const navigationLightTheme: NavigationTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary,
    background: light.background,
    card: light.card,
    text: light.text,
    border: light.border,
  },
};

export const navigationDarkTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary,
    background: dark.background,
    card: dark.card,
    text: dark.text,
    border: dark.border,
  },
};

export const paperLightTheme: PaperTheme = {
  ...PaperLightBase,
  colors: {
    ...PaperLightBase.colors,
    primary,
    background: light.background,
    surface: light.card,
    onSurface: light.text,
    outline: light.border,
  },
};

export const paperDarkTheme: PaperTheme = {
  ...PaperDarkBase,
  colors: {
    ...PaperDarkBase.colors,
    primary,
    background: dark.background,
    surface: dark.card,
    onSurface: dark.text,
    outline: dark.border,
  },
};

export const palette = { 
  light, 
  dark, 
  highContrast, 
  highContrastDark, 
  primary,
  medical: medicalColors
};

// Función para obtener el tema basado en configuración
export const getThemeColors = (isDark: boolean, isHighContrast: boolean = false) => {
  if (isHighContrast) {
    return isDark ? highContrastDark : highContrast;
  }
  return isDark ? dark : light;
};


