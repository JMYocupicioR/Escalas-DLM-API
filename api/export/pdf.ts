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
    // Prepare the request payload
    const payload = {
      assessment,
      scale,
      options: options || {}
    };

    // Make the API call to our PDF service
    const response = await fetch('/api/pdf/export', {
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

    // Return the base64 string
    return result.base64;
  } catch (error) {
    console.error('Error calling PDF service:', error);
    throw new Error(
      error instanceof Error 
        ? `PDF generation failed: ${error.message}`
        : 'PDF generation failed: Unknown error'
    );
  }
};