// api/export/pdf.ts
import { Scale } from '@/types/scale';
import { GenericAssessmentForPDF, PdfOptions } from '@/api/export/types';

/**
 * Generates a PDF using the remote PDF service
 */
export const generatePdfFromService = async (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions,
  questions?: any[]
): Promise<string> => {
  // Prepare the request payload
  const additionalData = scale.id === 'botulinum' ? {
    puntosMotoresData: (assessment as any).puntosMotoresData,
    dosisDataComplete: (assessment as any).dosisDataComplete,
  } : {};

  const payload: any = {
    assessment,
    scale,
    options: options || {},
    ...additionalData
  };
  if (questions) payload.questions = questions;

  try {
    const dbg = __DEV__ ? '?debug=1' : '';

    // URL fallback logic without using process.env directly to avoid Metro resolution issues
    const endpoints = [
      `/api/pdf/export${dbg}`,
      // Fallback endpoints could be added here as hardcoded strings if needed for dev
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint as any, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.base64) {
            return result.base64;
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }

    throw lastError || new Error('PDF generation failed');
  } catch (error) {
    console.error('PDF service error:', error);
    throw error;
  }
};
