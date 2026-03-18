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
  
  const colors = useMemo(() => {
    // Seleccionar colores de severidad según el modo
    const severityColors = effectiveDarkMode
      ? medicalColors.severityDark
      : medicalColors.severity;

    return {
      // Colores base del tema con soporte para alto contraste
      ...baseTheme,
      primary: palette.primary,

      // Colores extendidos para interfaces complejas
      iconBackground: baseTheme.background,
      searchBackground: baseTheme.card,
      shadowColor: effectiveDarkMode ? '#000000' : '#00000020',

      // Colores específicos para escalas y formularios
      inputBackground: baseTheme.surface || baseTheme.card,
      inputBorder: baseTheme.border,
      sectionBackground: baseTheme.surface || baseTheme.card,
      headerBackground: baseTheme.background,

      // Estados de botones con contraste mejorado
      buttonPrimary: palette.primary,
      buttonPrimaryText: '#FFFFFF',
      buttonPrimaryHover: effectiveDarkMode ? '#0284C7' : '#0284C7',
      buttonSecondary: baseTheme.surfaceVariant || (effectiveDarkMode ? '#475569' : '#F3F4F6'),
      buttonSecondaryText: baseTheme.onSurfaceVariant || baseTheme.text,
      buttonSecondaryHover: effectiveDarkMode ? '#64748B' : '#E5E7EB',
      buttonDanger: effectiveDarkMode ? '#F87171' : '#EF4444',
      buttonDangerHover: effectiveDarkMode ? '#EF4444' : '#DC2626',
      buttonSuccess: effectiveDarkMode ? '#34D399' : '#10B981',
      buttonSuccessHover: effectiveDarkMode ? '#10B981' : '#059669',

      // Colores de estado con mejor contraste
      success: severityColors.excellent,
      warning: medicalColors.warning,
      error: severityColors.critical,
      info: palette.primary,

      // Backgrounds de estado
      successBackground: effectiveDarkMode ? '#064E3B' : '#ECFDF5',
      warningBackground: effectiveDarkMode ? '#78350F' : '#FFFBEB',
      errorBackground: effectiveDarkMode ? '#7F1D1D' : '#FEF2F2',
      infoBackground: effectiveDarkMode ? '#1E3A8A' : '#EFF6FF',

      // Colores para badges y tags
      tagBackground: baseTheme.surfaceVariant || baseTheme.surface || baseTheme.card,
      tagText: baseTheme.onSurfaceVariant || baseTheme.mutedText,

      // Colores médicos mejorados para accesibilidad (usando severity)
      scoreLow: severityColors.critical,
      scoreMedium: severityColors.concerning,
      scoreModerate: severityColors.moderate,
      scoreGood: severityColors.good,
      scoreExcellent: severityColors.excellent,
      scoreOptimal: severityColors.optimal,

      // Colores específicos por especialidad médica
      cardio: medicalColors.specialty.cardiology,
      neuro: medicalColors.specialty.neurology,
      ortho: medicalColors.specialty.orthopedics,
      psych: medicalColors.specialty.psychiatry,
      rehab: medicalColors.specialty.rehabilitation,
      pediatrics: medicalColors.specialty.pediatrics,
      geriatrics: medicalColors.specialty.geriatrics,
      general: medicalColors.specialty.general,

      // Colores de dolor
      painNone: medicalColors.pain.none,
      painMild: medicalColors.pain.mild,
      painModerate: medicalColors.pain.moderate,
      painSevere: medicalColors.pain.severe,
      painExtreme: medicalColors.pain.extreme,

      // Colores para elementos específicos
      iconMuted: baseTheme.mutedText,
      linkText: palette.primary,
      placeholderText: baseTheme.mutedText,

      // Estados de interacción
      hover: effectiveDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      pressed: effectiveDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',

      // Indicadores de contraste
      isHighContrast,
      contrastLevel,
    };
  }, [effectiveDarkMode, baseTheme, isHighContrast, contrastLevel]);

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
