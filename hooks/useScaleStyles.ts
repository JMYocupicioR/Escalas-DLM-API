import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemedStyles } from './useThemedStyles';

export const useScaleStyles = () => {
  const { colors, isDark } = useThemedStyles();

  const styles = useMemo(() => StyleSheet.create({
    // Contenedores principales
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    section: {
      backgroundColor: colors.sectionBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    // Tipografía
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    questionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    text: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    mutedText: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
    bold: {
      fontWeight: '600',
    },

    // Formularios e inputs
    inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    inputIcon: {
      marginRight: 8,
    },

    // Botones
    button: {
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonDanger: {
      backgroundColor: colors.buttonDanger,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonDisabled: {
      backgroundColor: colors.mutedText,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSecondaryText: {
      color: colors.buttonSecondaryText,
      fontSize: 16,
      fontWeight: '600',
    },

    // Navegación
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    navButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    prevButton: {
      backgroundColor: colors.mutedText,
    },
    nextButton: {
      backgroundColor: colors.buttonPrimary,
    },
    navButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },

    // Radio buttons y opciones
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingVertical: 8,
    },
    optionTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 18,
    },

    // Resultados y puntuaciones
    scoreContainer: {
      alignItems: 'center',
      padding: 20,
      marginBottom: 16,
    },
    scoreValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    scoreLabel: {
      fontSize: 16,
      color: colors.mutedText,
    },
    interpretationText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    interpretationDescription: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },

    // Lista de detalles
    detailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailQuestion: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      marginRight: 12,
    },
    detailAnswer: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      textAlign: 'right',
    },
    detailPoints: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'right',
    },

    // Indicadores de progreso
    progressContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    progressText: {
      fontSize: 14,
      color: colors.mutedText,
      textAlign: 'center',
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.buttonPrimary,
      borderRadius: 2,
    },

    // Tags y badges
    tag: {
      backgroundColor: colors.tagBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    tagText: {
      fontSize: 12,
      color: colors.tagText,
      fontWeight: '500',
    },

    // Estados de error y éxito
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    successText: {
      color: colors.success,
      fontSize: 14,
      marginTop: 4,
    },
    warningText: {
      color: colors.warning,
      fontSize: 14,
      marginTop: 4,
    },
  }), [colors]);

  return {
    styles,
    colors,
    isDark,
    // Colores específicos para puntuaciones médicas
    getScoreColor: (score: number, maxScore: number = 100) => {
      const percentage = (score / maxScore) * 100;
      if (percentage >= 90) return colors.scoreOptimal;
      if (percentage >= 70) return colors.scoreExcellent;
      if (percentage >= 50) return colors.scoreGood;
      if (percentage >= 30) return colors.scoreMedium;
      return colors.scoreLow;
    }
  };
};
