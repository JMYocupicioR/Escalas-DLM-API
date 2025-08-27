import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { exportAssessmentPDF, printAssessmentPDF, generatePDFContent } from '@/api/export/pdf';
import { GenericAssessmentForPDF } from '@/api/export/types';
import { exportAssessmentServerPDF } from '@/api/export/server';
import { Scale } from '@/types/scale';
import { Platform, Alert } from 'react-native';

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
          // Primero intentamos vía backend (Puppeteer) para máxima consistencia.
          const ok = await exportAssessmentServerPDF(assessment, scale as Scale, {
            theme: isDark ? 'dark' : 'light',
            preset: 'compact',
            scale: 0.85,
            headerTitle: 'Informe de Resultados',
            headerSubtitle: scale.name,
            showPatientSummary: true,
          });
          if (!ok) {
            // Fallback local con expo-print
            await exportAssessmentPDF(assessment, scale as Scale, {
              theme: isDark ? 'dark' : 'light',
              preset: 'compact',
              scale: 0.85,
              headerTitle: 'Informe de Resultados',
              headerSubtitle: scale.name,
              showPatientSummary: true,
            });
          }
        }}
        accessibilityLabel="Exportar resultados como PDF"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Exportar PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
        onPress={async () => {
          try {
            if (Platform.OS === 'web') {
              // Para web: usar la función de impresión del navegador
              const htmlContent = await generatePDFContent(assessment, scale as Scale, {
                theme: isDark ? 'dark' : 'light',
                preset: 'compact',
                scale: 0.85,
                headerTitle: 'Informe de Resultados',
                headerSubtitle: scale.name,
                showPatientSummary: true,
              });
              
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.onload = () => {
                  printWindow.print();
                  printWindow.close();
                };
              }
            } else {
              // Para móvil: usar expo-print
              const success = await printAssessmentPDF(assessment, scale as Scale, {
                theme: isDark ? 'dark' : 'light',
                preset: 'compact',
                scale: 0.85,
                headerTitle: 'Informe de Resultados',
                headerSubtitle: scale.name,
                showPatientSummary: true,
              });
              
              if (!success) {
                Alert.alert('Error', 'No se pudo imprimir. Intente exportar como PDF primero.');
              }
            }
          } catch (error) {
            console.error('Error al imprimir:', error);
            Alert.alert('Error', 'No se pudo imprimir. Intente exportar como PDF primero.');
          }
        }}
        accessibilityLabel="Imprimir resultados"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Imprimir</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
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


