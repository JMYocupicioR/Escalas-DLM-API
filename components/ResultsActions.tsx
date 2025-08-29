import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, Platform, Alert, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { generatePdfFromService } from '@/api/export/pdf';
import { GenericAssessmentForPDF } from '@/api/export/types';
import { Scale } from '@/types/scale';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

interface ResultsActionsProps {
  assessment: GenericAssessmentForPDF;
  scale: Pick<Scale, 'id' | 'name'>;
  containerStyle?: ViewStyle;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ assessment, scale, containerStyle }) => {
  const { colors, isDark } = useThemedStyles();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const base64ToBlob = (base64: string, type: string = 'application/pdf'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  };

  const handlePdfGeneration = async (action: 'export' | 'print') => {
    if (isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    try {
      const base64Pdf = await generatePdfFromService(assessment, scale as Scale, {
        theme: isDark ? 'dark' : 'light',
        preset: 'compact',
        scale: 0.85,
        headerTitle: 'Informe de Resultados',
        headerSubtitle: scale.name,
        showPatientSummary: true,
      });

      if (Platform.OS === 'web') {
        // Web: Convert base64 to Blob and create URL
        const blob = base64ToBlob(base64Pdf);
        const url = URL.createObjectURL(blob);

        if (action === 'export') {
          // Download the PDF
          const link = document.createElement('a');
          link.href = url;
          link.download = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Open in new tab for printing
          const printWindow = window.open(url, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
            // Clean up URL after 30 seconds
            setTimeout(() => URL.revokeObjectURL(url), 30000);
          } else {
            Alert.alert('Error', 'No se pudo abrir ventana de impresión. Verifique que no esté bloqueada.');
          }
        }
      } else {
        // iOS/Android: Save to temporary file and share
        const fileName = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(filePath, base64Pdf, {
          encoding: FileSystem.EncodingType.Base64
        });

        await shareAsync(filePath, {
          mimeType: 'application/pdf',
          dialogTitle: action === 'export' ? `Resultados de ${scale.name}` : `Imprimir ${scale.name}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error(`Error al ${action === 'export' ? 'exportar' : 'imprimir'} PDF:`, error);
      Alert.alert(
        'Error',
        `No se pudo ${action === 'export' ? 'exportar' : 'imprimir'} el PDF. ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}> 
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
        onPress={() => handlePdfGeneration('export')}
        disabled={isGeneratingPdf}
        accessibilityLabel="Exportar resultados como PDF"
        accessibilityRole="button"
      >
        {isGeneratingPdf ? (
          <ActivityIndicator size="small" color={colors.buttonSecondaryText} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Exportar PDF</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
        onPress={() => handlePdfGeneration('print')}
        disabled={isGeneratingPdf}
        accessibilityLabel="Imprimir resultados"
        accessibilityRole="button"
      >
        {isGeneratingPdf ? (
          <ActivityIndicator size="small" color={colors.buttonPrimaryText} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Imprimir</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
        onPress={async () => {
          if (Platform.OS === 'web') {
            const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(assessment, null, 2))}`;
            const anchor = document.createElement('a');
            anchor.href = dataStr;
            anchor.download = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.json`;
            anchor.click();
          } else {
            // For mobile platforms, save JSON to temporary file and share
            try {
              const fileName = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.json`;
              const filePath = `${FileSystem.cacheDirectory}${fileName}`;
              
              await FileSystem.writeAsStringAsync(filePath, JSON.stringify(assessment, null, 2));
              await shareAsync(filePath, {
                mimeType: 'application/json',
                dialogTitle: `Datos de ${scale.name}`,
              });
            } catch (error) {
              Alert.alert(
                'Error',
                `No se pudo exportar el archivo JSON. ${error instanceof Error ? error.message : 'Error desconocido'}`
              );
            }
          }
        }}
        accessibilityLabel="Exportar resultados como JSON"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Exportar JSON</Text>
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
    minHeight: 44, // Ensure consistent height for loading indicator
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});