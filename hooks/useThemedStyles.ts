import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { palette, getThemeColors, medicalColors } from '@/app/theme';
import { Appearance } from 'react-native';

export const useThemedStyles = () => {
  const { themeMode, contrastLevel, fontSize } = useSettingsStore((s) => ({
    themeMode: s.themeMode,
    contrastLevel: s.contrastLevel,
    fontSize: s.fontSize,
  }));
  
  const systemColorScheme = Appearance.getColorScheme();
  
  // Determinar el modo efectivo considerando el sistema
  const effectiveDarkMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);
  
  const isHighContrast = contrastLevel === 'high';
  const baseTheme = getThemeColors(effectiveDarkMode, isHighContrast);
  
  // Factores de tamaño de fuente
  const fontSizeMultiplier = useMemo(() => {
    switch (fontSize) {
      case 'small': return 0.875;
      case 'large': return 1.125;
      case 'xlarge': return 1.25;
      default: return 1;
    }
  }, [fontSize]);
  
  const colors = useMemo(() => ({
    // Colores base del tema con soporte para alto contraste
    ...baseTheme,
    primary: palette.primary,
    
    // Colores extendidos para interfaces complejas
    iconBackground: baseTheme.background,
    searchBackground: baseTheme.card,
    shadowColor: effectiveDarkMode ? '#000' : '#00000020',
    
    // Colores específicos para escalas y formularios  
    inputBackground: baseTheme.surface || baseTheme.card,
    inputBorder: baseTheme.border,
    sectionBackground: baseTheme.surface || baseTheme.card,
    headerBackground: baseTheme.background,
    
    // Estados de botones con contraste mejorado
    buttonPrimary: palette.primary,
    buttonPrimaryText: '#ffffff',
    buttonSecondary: baseTheme.surfaceVariant || (effectiveDarkMode ? '#374151' : '#f1f5f9'),
    buttonSecondaryText: baseTheme.onSurfaceVariant || baseTheme.text,
    buttonDanger: isHighContrast ? (effectiveDarkMode ? '#ff6b6b' : '#dc2626') : '#ef4444',
    buttonSuccess: isHighContrast ? (effectiveDarkMode ? '#51cf66' : '#16a34a') : '#22c55e',
    
    // Colores de estado con mejor contraste
    success: medicalColors.good,
    warning: medicalColors.warning,
    error: medicalColors.critical,
    info: palette.primary,
    
    // Colores para badges y tags
    tagBackground: baseTheme.surfaceVariant || baseTheme.surface || baseTheme.card,
    tagText: baseTheme.onSurfaceVariant || baseTheme.mutedText,
    
    // Colores médicos mejorados para accesibilidad
    scoreLow: medicalColors.critical,
    scoreMedium: medicalColors.warning,
    scoreGood: medicalColors.caution,
    scoreExcellent: medicalColors.good,
    scoreOptimal: medicalColors.excellent,
    
    // Colores específicos por especialidad médica
    cardio: medicalColors.cardio,
    neuro: medicalColors.neuro,
    ortho: medicalColors.ortho,
    psych: medicalColors.psych,
    general: medicalColors.general,
    
    // Colores para elementos específicos
    iconMuted: baseTheme.mutedText,
    linkText: palette.primary,
    placeholderText: baseTheme.mutedText,
    
    // Indicadores de contraste
    isHighContrast,
    contrastLevel,
  }), [effectiveDarkMode, baseTheme, isHighContrast, contrastLevel]);

  return {
    colors,
    isDark: effectiveDarkMode,
    isHighContrast,
    fontSizeMultiplier,
    themeMode,
    contrastLevel,
    fontSize,
  };
};
