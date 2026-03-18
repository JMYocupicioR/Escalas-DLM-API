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

const primary = '#0EA5E9'; // Azul cyan más vibrante y profesional

// Tema claro mejorado - Inspirado en Material Design 3
const light = {
  // Fondos con mejor jerarquía
  background: '#F9FAFB',           // Gris muy claro, menos fatiga visual
  backgroundSecondary: '#FFFFFF',   // Blanco puro para tarjetas destacadas
  card: '#FFFFFF',

  // Superficies con gradación clara
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',       // Para modales y diálogos
  surfaceVariant: '#F3F4F6',        // Hover states, inputs deshabilitados

  // Textos con mejor jerarquía visual
  text: '#111827',                  // Negro cálido principal (Gray 900)
  textSecondary: '#6B7280',         // Gris medio para texto secundario (Gray 500)
  textTertiary: '#9CA3AF',          // Gris claro para metadatos (Gray 400)
  mutedText: '#6B7280',

  // Bordes y divisores sutiles
  border: '#E5E7EB',                // Gray 200
  borderStrong: '#D1D5DB',          // Gray 300 - para énfasis
  divider: '#F3F4F6',               // Divisores ultra sutiles

  // Estados de superficie
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',

  // Estados hover/pressed
  hover: 'rgba(0, 0, 0, 0.04)',
  pressed: 'rgba(0, 0, 0, 0.08)',
};

// Tema oscuro mejorado - Basado en Slate palette
const dark = {
  // Fondos con mejor profundidad
  background: '#0F172A',            // Slate 900 - Mejor que negro puro
  backgroundSecondary: '#1E293B',   // Slate 800
  card: '#1E293B',

  // Superficies elevadas con gradación clara
  surface: '#1E293B',               // Slate 800
  surfaceElevated: '#334155',       // Slate 700 - para modals
  surfaceVariant: '#475569',        // Slate 600 - hover states

  // Textos con contraste optimizado
  text: '#F8FAFC',                  // Slate 50 - blanco suave
  textSecondary: '#CBD5E1',         // Slate 300
  textTertiary: '#94A3B8',          // Slate 400
  mutedText: '#94A3B8',

  // Bordes sutiles pero visibles
  border: '#334155',                // Slate 700
  borderStrong: '#475569',          // Slate 600
  divider: '#1E293B',               // Slate 800

  // Estados de superficie
  onSurface: '#F8FAFC',
  onSurfaceVariant: '#CBD5E1',

  // Estados hover/pressed
  hover: 'rgba(255, 255, 255, 0.05)',
  pressed: 'rgba(255, 255, 255, 0.10)',
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

// Colores médicos especializados con mejor semántica
export const medicalColors = {
  // Escalas de severidad (de mejor a peor) - Modo claro
  severity: {
    optimal: '#059669',      // Verde esmeralda (Emerald 600)
    excellent: '#10B981',    // Verde (Emerald 500)
    good: '#84CC16',         // Lima (Lime 500)
    moderate: '#F59E0B',     // Ámbar (Amber 500)
    concerning: '#F97316',   // Naranja (Orange 500)
    severe: '#EF4444',       // Rojo (Red 500)
    critical: '#DC2626',     // Rojo oscuro (Red 600)
  },

  // Escalas de severidad - Modo oscuro (más saturadas)
  severityDark: {
    optimal: '#34D399',      // Emerald 400
    excellent: '#10B981',    // Emerald 500
    good: '#A3E635',         // Lime 400
    moderate: '#FBBF24',     // Amber 400
    concerning: '#FB923C',   // Orange 400
    severe: '#F87171',       // Red 400
    critical: '#EF4444',     // Red 500
  },

  // Por especialidad médica
  specialty: {
    cardiology: '#EF4444',      // Rojo - corazón
    neurology: '#8B5CF6',       // Violeta - cerebro
    orthopedics: '#06B6D4',     // Cyan - huesos
    psychiatry: '#EC4899',      // Rosa - mente
    rehabilitation: '#10B981',  // Verde - recuperación
    pediatrics: '#F59E0B',      // Naranja - niños
    geriatrics: '#6366F1',      // Índigo - adultos mayores
    general: '#64748B',         // Gris - general
  },

  // Indicadores de dolor
  pain: {
    none: '#ECFDF5',       // Green 50
    mild: '#FEF3C7',       // Amber 100
    moderate: '#FED7AA',   // Orange 200
    severe: '#FECACA',     // Red 200
    extreme: '#FEE2E2',    // Red 100
  },

  // Legacy colors (mantener compatibilidad)
  critical: '#DC2626',
  warning: '#F97316',
  caution: '#F59E0B',
  good: '#10B981',
  excellent: '#059669',
  cardio: '#EF4444',
  neuro: '#8B5CF6',
  ortho: '#06B6D4',
  psych: '#EC4899',
  general: '#64748B',
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

// Exportación por defecto para evitar errores de ruta
export default {
  palette,
  getThemeColors,
  navigationLightTheme,
  navigationDarkTheme,
  paperLightTheme,
  paperDarkTheme,
  medicalColors
};


