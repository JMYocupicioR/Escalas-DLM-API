import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { exportAssessmentPDF, GenericAssessmentForPDF } from '@/api/export/pdf';
import { Scale } from '@/types/scale';

interface ResultsActionsProps {
  assessment: GenericAssessmentForPDF;
  scale: Pick<Scale, 'id' | 'name'>;
  containerStyle?: ViewStyle;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ assessment, scale, containerStyle }) => {
  const { colors, isDark } = useThemedStyles();

  return (
    <View style={[styles.container, containerStyle]}> 
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
        onPress={async () => {
          await exportAssessmentPDF(assessment, scale as Scale, { 
            theme: isDark ? 'dark' : 'light',
            preset: 'compact',
            scale: 0.85,
            headerTitle: 'Informe de Resultados',
            headerSubtitle: scale.name,
            showPatientSummary: true,
          });
        }}
        accessibilityLabel="Exportar resultados como PDF"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Exportar PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
        onPress={async () => {
          const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(assessment, null, 2))}`;
          const anchor = document.createElement('a');
          anchor.href = dataStr;
          anchor.download = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.json`;
          anchor.click();
        }}
        accessibilityLabel="Exportar resultados como JSON"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Exportar JSON</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


