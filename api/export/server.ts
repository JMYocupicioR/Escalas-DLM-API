import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Scale } from '@/types/scale';
import { GenericAssessmentForPDF, PdfOptions } from '@/api/export/types';

type ServerPdfResponse = {
  filename: string;
  base64: string; // PDF en base64
};

const getPdfServiceUrl = (): string | null => {
  const url = process.env.EXPO_PUBLIC_PDF_SERVICE_URL || '';
  return url ? url.replace(/\/$/, '') : null;
};

/**
 * Intenta exportar el PDF a través del servicio backend (Puppeteer).
 * - Web: descarga directamente el archivo
 * - Nativo: guarda en cache y abre diálogo de compartir
 * Devuelve true si tuvo éxito; false si falla (para permitir fallback local)
 */
export const exportAssessmentServerPDF = async (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): Promise<boolean> => {
  try {
    const serviceBase = getPdfServiceUrl();
    if (!serviceBase) return false;

    const endpoint = `${serviceBase}/api/pdf/export${Platform.OS === 'web' ? '?binary=1' : ''}`;

    const payload = {
      assessment,
      scale: { id: scale.id, name: scale.name },
      options,
    };

    if (Platform.OS === 'web') {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    }

    // Nativo: esperamos JSON con base64 para evitar problemas de fetch binario
    const res = await fetch(endpoint.replace('?binary=1', ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as ServerPdfResponse;
    if (!data?.base64) throw new Error('Respuesta inválida del servicio PDF');

    const fileName = data.filename || `${(scale.name || 'reporte').replace(/\s+/g, '_').toLowerCase()}.pdf`;
    const targetPath = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(targetPath, data.base64, { encoding: FileSystem.EncodingType.Base64 });
    await shareAsync(targetPath, {
      mimeType: 'application/pdf',
      dialogTitle: `Resultados de ${scale.name}`,
      UTI: 'com.adobe.pdf',
    });
    return true;
  } catch (error) {
    console.error('Error en exportación PDF vía servidor:', error);
    return false;
  }
};


