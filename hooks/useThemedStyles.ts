import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { palette } from '@/app/theme';

export const useThemedStyles = () => {
  const darkMode = useSettingsStore((s) => s.darkMode);
  
  const colors = useMemo(() => ({
    // Colores base del sistema
    background: darkMode ? palette.dark.background : palette.light.background,
    card: darkMode ? palette.dark.card : palette.light.card,
    text: darkMode ? palette.dark.text : palette.light.text,
    mutedText: darkMode ? palette.dark.mutedText : palette.light.mutedText,
    border: darkMode ? palette.dark.border : palette.light.border,
    primary: palette.primary,
    
    // Colores extendidos para interfaces complejas
    iconBackground: darkMode ? '#0f172a' : '#f8fafc',
    searchBackground: darkMode ? '#1e293b' : '#ffffff',
    shadowColor: '#000',
    
    // Colores específicos para escalas y formularios
    inputBackground: darkMode ? '#1e293b' : '#ffffff',
    inputBorder: darkMode ? '#334155' : '#e2e8f0',
    sectionBackground: darkMode ? '#1e293b' : '#ffffff',
    headerBackground: darkMode ? '#111827' : '#f8fafc',
    
    // Estados de botones y elementos interactivos
    buttonPrimary: palette.primary,
    buttonPrimaryText: '#ffffff',
    buttonSecondary: darkMode ? '#374151' : '#f1f5f9',
    buttonSecondaryText: darkMode ? '#f8fafc' : '#0f172a',
    buttonDanger: '#ef4444',
    buttonSuccess: '#22c55e',
    
    // Colores de estado
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Colores para badges y tags
    tagBackground: darkMode ? '#0f172a' : '#f1f5f9',
    tagText: darkMode ? '#94a3b8' : '#64748b',
    
    // Colores específicos para contenido médico
    scoreLow: '#ef4444',      // Rojo para puntuaciones bajas/preocupantes
    scoreMedium: '#f97316',   // Naranja para puntuaciones medias
    scoreGood: '#eab308',     // Amarillo para puntuaciones buenas
    scoreExcellent: '#22c55e', // Verde para puntuaciones excelentes
    scoreOptimal: '#15803d',  // Verde oscuro para puntuaciones óptimas
    
    // Colores para elementos específicos
    iconMuted: darkMode ? '#64748b' : '#94a3b8',
    linkText: palette.primary,
    placeholderText: darkMode ? '#64748b' : '#94a3b8',
  }), [darkMode]);

  return {
    colors,
    isDark: darkMode,
  };
};
