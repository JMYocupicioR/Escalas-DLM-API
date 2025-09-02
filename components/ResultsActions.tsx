import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, Platform, Alert, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { generatePdfFromService } from '@/api/export/pdf';
import { exportAssessmentServerPDF } from '@/api/export/server';
import { GenericAssessmentForPDF, PdfOptions } from '@/api/export/types';
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

  

  const escapeCsv = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const handleExcelExport = async () => {
    try {
      const lines: string[] = [];
      if (assessment.patientData) {
        const pd = assessment.patientData as Record<string, unknown>;
        for (const key of Object.keys(pd)) {
          lines.push([escapeCsv('Paciente'), escapeCsv(key), escapeCsv(pd[key])].join(','));
        }
      }
      if (assessment.score !== undefined) {
        lines.push([escapeCsv('Resultado'), escapeCsv('Puntuacion'), escapeCsv(assessment.score)].join(','));
      }
      if (assessment.interpretation) {
        lines.push([escapeCsv('Resultado'), escapeCsv('Interpretacion'), escapeCsv(assessment.interpretation)].join(','));
      }
      if (lines.length > 0) lines.push('');
      lines.push(['Tipo', 'ID', 'Pregunta', 'Etiqueta', 'Valor', 'Puntos'].map(escapeCsv).join(','));
      const answers = assessment.answers as any;
      if (Array.isArray(answers)) {
        for (const a of answers) {
          lines.push([
            escapeCsv('Respuesta'),
            escapeCsv(a.id),
            escapeCsv(a.question ?? ''),
            escapeCsv(a.label ?? ''),
            escapeCsv(a.value ?? ''),
            escapeCsv(a.points ?? ''),
          ].join(','));
        }
      } else if (answers && typeof answers === 'object') {
        for (const [k, v] of Object.entries(answers as Record<string, unknown>)) {
          lines.push([
            escapeCsv('Campo'),
            escapeCsv(k),
            '',
            '',
            escapeCsv(v),
            '',
          ].join(','));
        }
      }

      const csv = lines.join('\n');
      const fileBase = (scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase();

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBase}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const filePath = `${FileSystem.cacheDirectory}${fileBase}.csv`;
        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
        await shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: `Resultados (CSV) de ${scale.name}`,
          UTI: 'public.comma-separated-values-text',
        });
      }
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      Alert.alert('Error', `No se pudo exportar a Excel/CSV. ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handlePdfGeneration = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    const theme: 'light' | 'dark' = isDark ? 'dark' : 'light';
    const options: PdfOptions = {
      theme,
      preset: 'compact',
      scale: 0.85,
      headerTitle: 'Informe de Resultados',
      headerSubtitle: scale.name,
      showPatientSummary: true,
    };
    try {
      if (Platform.OS === 'web') {
        const dbg = __DEV__ ? '&debug=1' : '';
        const base = (process.env.EXPO_PUBLIC_PDF_SERVICE_URL || '').replace(/\/$/, '');
        const payload = { assessment, scale: { id: (scale as Scale).id, name: (scale as Scale).name }, options };

        const tryDownload = async (endpoint: string) => {
          const res = await fetch(endpoint as any, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            let serverMsg = `HTTP ${res.status}`;
            try {
              const ct = res.headers.get('content-type') || '';
              if (ct.includes('application/json')) {
                const j = await res.json();
                if (j?.error) serverMsg = j.error;
              } else {
                const t = await res.text();
                if (t) serverMsg = t.slice(0, 500);
              }
            } catch {}
            throw new Error(serverMsg);
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        };

        // Prefer direct service if configured, then fall back to Netlify route
        let lastError: unknown = null;
        if (base) {
          try {
            await tryDownload(`${base}/api/pdf/export?binary=1${dbg}`);
            return;
          } catch (e) { lastError = e; }
        }
        try {
          await tryDownload(`/api/pdf/export?binary=1${dbg}`);
          return;
        } catch (e) { lastError = e; }
        throw lastError instanceof Error ? lastError : new Error('PDF export failed');
      } else {
        // Native: fetch JSON base64 then save/share
        const base64Pdf = await generatePdfFromService(assessment, scale as Scale, options);
        const fileName = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, base64Pdf, { encoding: FileSystem.EncodingType.Base64 });
        await shareAsync(filePath, {
          mimeType: 'application/pdf',
          dialogTitle: `Resultados de ${scale.name}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('Error al exportar PDF (Netlify):', error);
      try {
        const ok = await exportAssessmentServerPDF(assessment, scale as Scale, options);
        if (ok) return;
      } catch (fallbackErr) {
        console.error('Fallback PDF service failed:', fallbackErr);
      }
      Alert.alert('Error', `No se pudo exportar el PDF. ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
        onPress={handlePdfGeneration}
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
        onPress={handleExcelExport}
        accessibilityLabel="Exportar resultados como Excel (CSV)"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Exportar Excel</Text>
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
            try {
              const fileName = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.json`;
              const filePath = `${FileSystem.cacheDirectory}${fileName}`;
              await FileSystem.writeAsStringAsync(filePath, JSON.stringify(assessment, null, 2));
              await shareAsync(filePath, {
                mimeType: 'application/json',
                dialogTitle: `Datos de ${scale.name}`,
              });
            } catch (error) {
              Alert.alert('Error', `No se pudo exportar el archivo JSON. ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
    minHeight: 44,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


