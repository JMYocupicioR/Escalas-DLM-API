// api/export/pdf.ts
import { Scale } from '@/types/scale';
import { GenericAssessmentForPDF, PdfOptions } from '@/api/export/types';

/**
 * Generates a PDF using the remote PDF service
 */
export const generatePdfFromService = async (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): Promise<string> => {
  try {
    const dbg = __DEV__ ? '?debug=1' : '';
    // Prepare the request payload
    const payload = {
      assessment,
      scale,
      options: options || {}
    };

    // Make the API call to our Netlify Function first
    const response = await fetch(`/api/pdf/export${dbg}` as any, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    if (!result.base64) {
      throw new Error('No PDF data received from service');
    }
    return result.base64;
  } catch (error) {
    console.error('Error calling Netlify PDF function:', error);
    // Fallback: try direct PDF service if available via EXPO_PUBLIC_PDF_SERVICE_URL
    try {
      const base = (process.env.EXPO_PUBLIC_PDF_SERVICE_URL || '').replace(/\/$/, '');
      if (!base) throw new Error('Direct PDF service URL not configured');

      const res = await fetch(`${base}/api/pdf/export${dbg}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.base64) throw new Error('No PDF data in fallback response');
      return data.base64 as string;
    } catch (fallbackError) {
      console.error('Direct PDF service fallback failed:', fallbackError);
      throw new Error(
        fallbackError instanceof Error
          ? `PDF generation failed: ${fallbackError.message}`
          : 'PDF generation failed: Unknown error'
      );
    }
  }
};
