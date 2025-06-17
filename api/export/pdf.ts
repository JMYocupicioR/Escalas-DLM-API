// api/export/pdf.ts
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Assessment } from '@/types/question';
import { Scale } from '@/types/scale';

/**
 * Genera y comparte un PDF con los resultados de la evaluación
 */
export const generateAndSharePDF = async (
  assessment: Assessment, 
  scale: Scale
): Promise<boolean> => {
  try {
    const htmlContent = generatePDFContent(assessment, scale);
    
    const { uri } = await Print.printToFileAsync({ 
      html: htmlContent,
      base64: false
    });
    
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Resultados de ${scale.name}`,
      UTI: 'com.adobe.pdf'
    });
    
    return true;
  } catch (error) {
    console.error('Error al generar o compartir PDF:', error);
    return false;
  }
};

/**
 * Genera el contenido HTML para el PDF
 */
const generatePDFContent = (assessment: Assessment, scale: Scale): string => {
  const today = new Date().toLocaleDateString();
  const { patientData, score, interpretation, answers } = assessment;
  
  // HTML para los detalles de respuestas
  let detailsHTML = '';
  // Aquí se añadiría código para generar el detalle de respuestas
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Resultados ${scale.name}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .result { font-size: 24px; font-weight: bold; }
          .footer { font-size: 12px; text-align: center; margin-top: 40px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resultados ${scale.name}</h1>
            <p>${today}</p>
            <p><strong>Aviso:</strong> Esta evaluación es orientativa y no reemplaza el diagnóstico médico profesional.</p>
          </div>
          <div class="section">
            <h2>Datos del Paciente</h2>
            <p><strong>Nombre:</strong> ${patientData.name}</p>
            <p><strong>Edad:</strong> ${patientData.age}</p>
            <p><strong>Género:</strong> ${patientData.gender}</p>
            <p><strong>Médico/Evaluador:</strong> ${patientData.doctorName}</p>
          </div>
          <div class="section">
            <h2>Puntuación: ${score}</h2>
            <p class="result">${interpretation}</p>
          </div>
          <div class="section">
            <h2>Detalle de Respuestas</h2>
            ${detailsHTML}
          </div>
          <div class="footer">
            <p>Documento generado por DeepLuxMed.mx</p>
            <p>Esta información está protegida por la privacidad médico-paciente.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};