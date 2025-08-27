// api/export/pdf.ts
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';
import { Scale } from '@/types/scale';
import { palette } from '@/app/theme';
import { GenericAssessmentForPDF, PdfOptions, PdfTheme } from '@/api/export/types';
import { puntosMotoresData } from '../../data/botulinum';

/**
 * Genera y comparte un PDF con los resultados de la evaluación
 */
// tipos movidos a '@/api/export/types'

const getPdfTheme = (theme: 'light' | 'dark' = 'light', overrides?: Partial<PdfTheme>): PdfTheme => {
  const base: PdfTheme = theme === 'dark'
    ? { background: palette.dark.background, card: palette.dark.card, text: palette.dark.text, mutedText: palette.dark.mutedText, border: palette.dark.border, primary: palette.primary }
    : { background: palette.light.background, card: palette.light.card, text: palette.light.text, mutedText: palette.light.mutedText, border: palette.light.border, primary: palette.primary };
  return { ...base, ...overrides } as PdfTheme;
};

export const exportAssessmentPDF = async (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): Promise<boolean> => {
  try {
    const htmlContent = generatePDFContent(assessment, scale, options);
    const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Resultados de ${scale.name}`,
      UTI: 'com.adobe.pdf',
    });
    return true;
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    return false;
  }
};

export const printAssessmentPDF = async (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): Promise<boolean> => {
  try {
    const htmlContent = generatePDFContent(assessment, scale, options);
    
    if (Platform.OS === 'web') {
      // Para web: usar la función de impresión del navegador
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
      return true;
    } else {
      // Para móvil: intentar imprimir directamente
      try {
        await Print.printAsync({ html: htmlContent });
        return true;
      } catch (printError) {
        console.log('Impresión directa falló, intentando fallback...');
        
        // Fallback: generar archivo y compartir
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        // Compartir el archivo generado como alternativa
        await shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Imprimir ${scale.name}`,
          UTI: 'com.adobe.pdf',
        });
        return true;
      }
    }
  } catch (error) {
    console.error('Error al imprimir PDF:', error);
    return false;
  }
};

/**
 * Genera el contenido HTML para el PDF
 */
// SVG del icono como string optimizado para PDF
const appIconSvg = `<svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0891b2;" />
      <stop offset="100%" style="stop-color:#06b6d4;" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#iconGradient)"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
  <path d="M32 50 L45 63 L68 40" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const generatePDFContent = (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): string => {
  const today = new Date().toLocaleDateString();
  const { patientData, score, interpretation } = assessment;
  const theme = getPdfTheme(options?.theme ?? 'light', options?.customTheme);
  const preset = options?.preset ?? 'medical';
  const s = Math.max(0.7, Math.min(1.1, options?.scale ?? (preset === 'compact' ? 0.85 : preset === 'medical' ? 0.9 : 1)));
  const px = (n: number) => `${(n * s).toFixed(2)}px`;

  // HTML para los detalles de respuestas
  let detailsHTML = '';
  if (Array.isArray(assessment.answers)) {
    const rows = assessment.answers.map((a) => `
      <tr>
        <td>${a.question ?? a.id}</td>
        <td>${a.label ?? ''}</td>
        <td>${a.value ?? ''}</td>
        <td>${a.points ?? ''}</td>
      </tr>
    `).join('');
    detailsHTML = `
      <table>
        <thead>
          <tr>
            <th>Pregunta</th>
            <th>Respuesta</th>
            <th>Valor</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  } else if (assessment.answers && typeof assessment.answers === 'object') {
    const rows = Object.entries(assessment.answers).map(([k, v]) => `
      <tr>
        <td>${k}</td>
        <td colspan="3">${String(v)}</td>
      </tr>
    `).join('');
    detailsHTML = `
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th colspan="3">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }
  
  const baseCss = `
          :root {
            --bg: ${theme.background};
            --card: ${theme.card};
            --text: ${theme.text};
            --muted: ${theme.mutedText};
            --border: ${theme.border};
            --primary: ${theme.primary};
          }
          * { box-sizing: border-box; }
          @page { size: A4; margin: ${preset === 'compact' ? '14mm' : '18mm'}; }
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; color: var(--text); background: var(--bg); font-size: ${px(12)}; }
          .container { max-width: 820px; margin: 0 auto; padding: ${px(preset === 'compact' ? 10 : 16)}; }
          .header { display: flex; align-items: center; gap: ${px(10)}; margin-bottom: ${px(preset === 'compact' ? 12 : 18)}; }
          .logo { height: ${px(28)}; width: auto; }
          .headerText h1 { font-size: ${px(preset === 'compact' ? 16 : 18)}; font-weight: 700; color: var(--text); margin: 0 0 ${px(2)} 0; }
          .headerText p { font-size: ${px(11)}; color: var(--muted); margin: 0; }
          .section { margin-bottom: ${px(preset === 'compact' ? 10 : 14)}; padding: ${px(preset === 'compact' ? 8 : 12)}; border-radius: ${px(8)}; background: var(--card); border: 1px solid var(--border); }
          .section h2 { font-size: ${px(preset === 'compact' ? 13 : 14)}; font-weight: 700; color: var(--text); margin: 0 0 ${px(6)} 0; letter-spacing: ${preset === 'medical' ? '0.3px' : '0'}; text-transform: ${preset === 'medical' ? 'uppercase' : 'none'}; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${px(6)} ${px(preset === 'compact' ? 8 : 12)}; }
          .label { font-weight: 600; color: var(--text); }
          .value { color: var(--text); }
          .muted { color: var(--muted); }
          .kv { display: flex; gap: ${px(4)}; font-size: ${px(preset === 'compact' ? 10 : 11)}; line-height: 1.35; }
          .score { display: flex; align-items: baseline; gap: ${px(6)}; }
          .scoreValue { font-size: ${px(preset === 'compact' ? 16 : 18)}; font-weight: 800; color: var(--text); }
          .result { font-size: ${px(preset === 'compact' ? 11 : 12)}; font-weight: 700; color: var(--primary); }
          .footer { font-size: ${px(9)}; text-align: center; margin-top: ${px(preset === 'compact' ? 18 : 28)}; color: var(--muted); }
          .hr { height: 1px; background: var(--border); margin: ${px(preset === 'compact' ? 6 : 8)} 0; }
          table { width: 100%; border-collapse: collapse; font-size: ${px(preset === 'compact' ? 10 : 11)}; }
          th, td { padding: ${px(preset === 'compact' ? 5 : 6)}; border-bottom: 1px solid var(--border); text-align: left; }
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Resultados ${scale.name}</title>
        <style>
          ${baseCss}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="width: 32px; height: 32px; margin-right: 10px;">${appIconSvg}</div>
            <div class="headerText">
              <h1>${options?.headerTitle ?? 'Informe de Resultados'}</h1>
              <p>${options?.headerSubtitle ?? `Fecha: ${today}`}</p>
              ${options?.showPatientSummary !== false ? `
                <p class="muted">
                  ${[(patientData && patientData.name) ? `Paciente: <span class='value'>${patientData.name}</span>` : '',
                     (patientData && patientData.age) ? `Edad: <span class='value'>${patientData.age}</span>` : '',
                     (patientData && patientData.gender) ? `Género: <span class='value'>${patientData.gender}</span>` : '',
                     (patientData && patientData.doctorName) ? `Evaluador: <span class='value'>${patientData.doctorName}</span>` : ''
                    ].filter(Boolean).join(' · ')}
                </p>
              ` : ''}
            </div>
          </div>
          <div class="section">
            <h2>Datos del Paciente</h2>
            <div class="grid">
              <div class="kv"><span class="label">Nombre:</span> <span class="value">${(patientData && patientData.name) || ''}</span></div>
              <div class="kv"><span class="label">Edad:</span> <span class="value">${(patientData && patientData.age) || ''}</span></div>
              <div class="kv"><span class="label">Género:</span> <span class="value">${(patientData && patientData.gender) || ''}</span></div>
              <div class="kv"><span class="label">Médico/Evaluador:</span> <span class="value">${(patientData && patientData.doctorName) || ''}</span></div>
            </div>
          </div>
          <div class="section">
            <h2>Resultados</h2>
            <div class="score">
              ${score !== undefined ? `<span class="scoreValue">Puntuación: ${score}</span>` : ''}
              ${interpretation ? `<span class="result">${interpretation}</span>` : ''}
            </div>
          </div>
          <div class="section">
            <h2>Detalle de Respuestas</h2>
            ${detailsHTML || '<p class="muted">Sin detalle disponible.</p>'}
          </div>
          <div class="footer">
            <p>Documento generado por DeepLuxMed.mx</p>
            <p>${options?.footerNote ?? 'Esta información está protegida por la privacidad médico-paciente.'}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateBarthelReportHtml = (
  patientData: any,
  answers: Record<string, number>,
  total: number,
  interpretation: { result: string; explanation: string; color: string },
  questions: any[]
) => {
  let detailHTML = '';
  questions.forEach(q => {
    const answer = answers[q.id];
    if (answer !== undefined) {
      const selectedOption = q.options.find((opt: any) => opt.value === answer);
      if (selectedOption) {
        detailHTML += `
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
            <h4>${q.question}</h4>
            <p><strong>${selectedOption.label}</strong> (${selectedOption.value} puntos)</p>
            <p>${selectedOption.description}</p>
          </div>
        `;
      }
    }
  });

  const today = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Resultados Escala de Barthel</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .result { font-size: 24px; color: ${interpretation.color}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resultados Escala de Barthel</h1>
            <p>${today}</p>
          </div>
          <div class="section">
            <h2>Datos del Paciente</h2>
            <p><strong>Nombre:</strong> ${(patientData && patientData.name) || 'No especificado'}</p>
            <p><strong>Edad:</strong> ${(patientData && patientData.age) || 'No especificada'}</p>
            <p><strong>Género:</strong> ${(patientData && patientData.gender) || 'No especificado'}</p>
            <p><strong>Médico/Evaluador:</strong> ${(patientData && patientData.doctorName) || 'No especificado'}</p>
          </div>
          <div class="section">
            <h2>Puntuación Total: ${total}/100</h2>
            <p class="result">${interpretation.result}</p>
            <p>${interpretation.explanation}</p>
          </div>
          <div class="section">
            <h2>Detalle de Respuestas</h2>
            ${detailHTML}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateFimReportHtml = (assessmentData: any) => {
  const { patientData, totalScore, motorScore, cognitiveScore, answers, questions } = assessmentData;
  
  // Get interpretation and recommendation text
  let interpretation = '';
  let recommendation = '';
  if (totalScore >= 108) {
    interpretation = '<strong>Independencia completa o modificada:</strong> El paciente demuestra un alto grado de autonomía en las actividades de la vida diaria.';
    recommendation = 'Mantener el nivel actual de funcionamiento. Implementar programas de prevención y mantenimiento de la independencia funcional. Revisión periódica cada 6 meses.';
  } else if (totalScore >= 72) {
    interpretation = '<strong>Dependencia moderada:</strong> El paciente requiere asistencia supervisada en múltiples actividades, pero mantiene cierto grado de independencia.';
    recommendation = 'Programa de rehabilitación intensiva enfocado en las áreas deficitarias. Terapia ocupacional y fisioterapia 3-4 veces por semana. Evaluación familiar para entrenamiento en técnicas de asistencia.';
  } else if (totalScore >= 36) {
    interpretation = '<strong>Dependencia severa:</strong> El paciente requiere asistencia significativa en la mayoría de las actividades de la vida diaria.';
    recommendation = 'Plan de rehabilitación multidisciplinario intensivo. Considerar adaptaciones ambientales y tecnológicas de asistencia. Soporte psicológico para paciente y familia. Evaluación médica integral.';
  } else {
    interpretation = '<strong>Dependencia completa:</strong> El paciente requiere asistencia total en prácticamente todas las actividades evaluadas.';
    recommendation = 'Cuidados especializados continuos. Plan de atención médica integral. Soporte familiar extensivo. Considerar cuidados paliativos si es apropiado. Evaluación neurológica especializada.';
  }

  const categories = {
    autocuidado: 'AUTOCUIDADO',
    esfinteres: 'CONTROL DE ESFÍNTERES',
    movilidad: 'MOVILIDAD / TRANSFERENCIAS',
    locomocion: 'LOCOMOCIÓN',
    comunicacion: 'COMUNICACIÓN',
    cognicion: 'COGNICIÓN SOCIAL',
  };

  let tableRows = '';
  Object.entries(categories).forEach(([categoryKey, categoryName]) => {
    tableRows += `<tr class="category-header-print"><td colspan="2">${categoryName}</td></tr>`;
    questions
      .filter((q: any) => q.category === categoryKey)
      .forEach((q: any) => {
        const score = answers[q.id] || 0;
        tableRows += `<tr><td>${q.question}</td><td class="score-cell">${score}</td></tr>`;
      });
  });
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES');
  const formattedTime = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Reporte FIM</title>
      <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; color: #333; }
          .container { max-width: 800px; margin: auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #00796B; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { font-size: 18pt; color: #00796B; margin: 0; }
          .header p { font-size: 12pt; color: #666; margin: 5px 0 0; }
          .patient-info { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-field { font-size: 10pt; }
          .info-field strong { color: #495057; }
          .summary { background: #e0f2f1; border: 1px solid #00796B; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center; }
          .summary h2 { font-size: 14pt; color: #00796B; margin: 0 0 10px 0; }
          .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .score-item .number { font-size: 20pt; font-weight: bold; color: #00796B; }
          .score-item .label { font-size: 9pt; color: #666; }
          .interpretation-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; }
          .recommendation-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin-bottom: 20px; }
          h3 { font-size: 12pt; font-weight: bold; color: #00796B; margin: 0 0 8px 0; }
          .results-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .results-table th, .results-table td { padding: 8px; border: 1px solid #dee2e6; text-align: left; }
          .results-table th { background: #00796B; color: white; font-size: 10pt; }
          .results-table .category-header-print { background: #e0e0e0; font-weight: bold; text-align: center; }
          .results-table .score-cell { text-align: center; font-weight: bold; }
          .footer { border-top: 1px solid #dee2e6; padding-top: 10px; margin-top: 20px; font-size: 8pt; color: #6c757d; text-align: center; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>ESCALA DE INDEPENDENCIA FUNCIONAL (FIM)</h1>
              <p>Reporte de Evaluación Médica</p>
          </div>
          <div class="patient-info">
              <div class="info-field"><strong>Paciente:</strong> ${(patientData && patientData.name) || 'No especificado'}</div>
              <div class="info-field"><strong>Edad:</strong> ${(patientData && patientData.age) ? patientData.age + ' años' : 'No especificada'}</div>
          </div>
          <div class="summary">
              <h2>Resumen de Puntuación</h2>
              <div class="score-grid">
                  <div class="score-item"><div class="number">${totalScore}</div><div class="label">Puntaje Total /126</div></div>
                  <div class="score-item"><div class="number">${motorScore}</div><div class="label">Puntaje Motor /91</div></div>
                  <div class="score-item"><div class="number">${cognitiveScore}</div><div class="label">Puntaje Cognitivo /35</div></div>
              </div>
          </div>
          <div class="interpretation-box">
              <h3>Interpretación Clínica</h3>
              <p>${interpretation}</p>
          </div>
          <div class="recommendation-box">
              <h3>Recomendaciones Terapéuticas</h3>
              <p>${recommendation}</p>
          </div>
          <h3>Resultados Detallados</h3>
          <table class="results-table">
              <thead><tr><th>Actividad Evaluada</th><th>Puntuación</th></tr></thead>
              <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">
              <p>Generado por DeepLuxMed.mx | ${formattedDate} ${formattedTime}</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

export const generateLequesneReportHtml = (assessmentData: any) => {
  const { patientData, totalScore, answers, questions, interpretation } = assessmentData;
  
  // Build detailed results table
  let detailHTML = '';
  questions.forEach((q: any) => {
    const answer = answers[q.id];
    const option = q.options.find((opt: any) => opt.value === answer);
    detailHTML += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
          <strong>${q.question}</strong><br>
          <em style="color: #666; font-size: 12px;">${q.description}</em>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">
          ${option ? `${option.label} (${answer} puntos)` : 'No respondida'}
        </td>
      </tr>
    `;
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES');
  const formattedTime = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Índice de Lequesne - DeepLuxMed</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      text-align: center;
      background: linear-gradient(135deg, #00796B 0%, #004D40 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 300;
    }
    .header .subtitle {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .patient-info {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .patient-info h2 {
      color: #00796B;
      margin-top: 0;
      border-bottom: 2px solid #00796B;
      padding-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      color: #333;
    }
    .score-summary {
      background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
      border: 2px solid #4CAF50;
      border-radius: 10px;
      padding: 25px;
      text-align: center;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .score-summary h2 {
      color: #2E7D32;
      margin-top: 0;
      font-size: 24px;
    }
    .total-score {
      font-size: 48px;
      font-weight: bold;
      color: #00796B;
      margin: 20px 0;
    }
    .score-range {
      font-size: 18px;
      color: #666;
      margin-bottom: 15px;
    }
    .interpretation {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .interpretation h3 {
      color: #00796B;
      margin-top: 0;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 10px;
    }
    .interpretation-text {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .recommendation {
      background: #FFF3E0;
      border-left: 4px solid #FF9800;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .recommendation h3 {
      color: #E65100;
      margin-top: 0;
    }
    .recommendation-text {
      font-size: 16px;
      line-height: 1.6;
    }
    .results-table {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .results-table h3 {
      color: #00796B;
      margin-top: 0;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #00796B;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      color: #666;
    }
    .footer .logo {
      font-weight: bold;
      color: #00796B;
      font-size: 18px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .header, .patient-info, .score-summary, .interpretation, .recommendation, .results-table, .footer {
        box-shadow: none;
        border: 1px solid #ddd;
        margin-bottom: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Índice de Lequesne para Osteoartritis de Rodilla</h1>
    <p class="subtitle">Reporte de Evaluación Médica</p>
  </div>

  <div class="patient-info">
    <h2>Información del Paciente</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Nombre:</span>
        <span class="info-value">${patientData.name || 'No especificado'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Edad:</span>
        <span class="info-value">${patientData.age ? patientData.age + ' años' : 'No especificada'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Fecha de Evaluación:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Hora:</span>
        <span class="info-value">${formattedTime}</span>
      </div>
    </div>
  </div>

  <div class="score-summary">
    <h2>Resumen de Puntuación</h2>
    <div class="total-score">${totalScore.toFixed(1)}</div>
    <div class="score-range">de un máximo de 26 puntos</div>
    <p><strong>Interpretación:</strong> ${interpretation.level}</p>
  </div>

  <div class="interpretation">
    <h3>Análisis Clínico</h3>
    <div class="interpretation-text">
      <strong>Nivel de Severidad:</strong> ${interpretation.level}<br>
      <strong>Explicación:</strong> ${interpretation.explanation}
    </div>
  </div>

  <div class="recommendation">
    <h3>Recomendación Clínica</h3>
    <div class="recommendation-text">
      ${interpretation.recommendation}
    </div>
  </div>

  <div class="results-table">
    <h3>Resultados Detallados por Pregunta</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 70%">Pregunta</th>
          <th style="width: 30%">Respuesta y Puntuación</th>
        </tr>
      </thead>
      <tbody>
        ${detailHTML}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div class="logo">DeepLuxMed.mx</div>
    <p>Escalas Médicas Digitales</p>
    <p>Reporte generado el ${formattedDate} a las ${formattedTime}</p>
    <p style="font-size: 12px; margin-top: 15px;">
      Este reporte ha sido generado automáticamente por el sistema de evaluación Lequesne de DeepLuxMed.
      <br>Para uso clínico profesional únicamente.
    </p>
  </div>
</body>
</html>`;
  };

// Datos de dosis completos (importados de botulinum.ts)
const dosisDataComplete = {
  Dysport: {
    "Abductor hallucis": { min: 40, max: 80 },
    "Adductor longus": { min: 125, max: 250 },
    "Adductor magnus": { min: 250, max: 500 },
    "Biceps brachii": { min: 200, max: 300 },
    "Biceps femoris": { min: 250, max: 375 },
    "Gastrocnemio (cabeza lateral)": { min: 125, max: 300 },
    "Gastrocnemio (cabeza medial)": { min: 125, max: 300 },
    "Glúteo medio": { min: 150, max: 225 },
    "Gracilis": { min: 200, max: 300 },
    "Psoas mayor": { min: 300, max: 500 },
    "Rectus femoris (cuádriceps anterior)": { min: 250, max: 375 },
    "Semitendinosus": { min: 200, max: 375 },
    "Triceps surae (sóleo)": { min: 125, max: 300 },
    "Tibialis posterior": { min: 125, max: 240 },
    "Vastus lateralis, intermedius y medialis": { min: 200, max: 375 }
  },
  Botox: {
    "Abductor hallucis": { min: 10, max: 20 },
    "Adductor longus": { min: 50, max: 100 },
    "Adductor magnus": { min: 100, max: 200 },
    "Biceps brachii": { min: 50, max: 100 },
    "Biceps femoris": { min: 100, max: 150 },
    "Gastrocnemio (cabeza lateral)": { min: 50, max: 120 },
    "Gastrocnemio (cabeza medial)": { min: 50, max: 120 },
    "Glúteo medio": { min: 60, max: 90 },
    "Gracilis": { min: 80, max: 120 },
    "Psoas mayor": { min: 120, max: 200 },
    "Rectus femoris (cuádriceps anterior)": { min: 100, max: 150 },
    "Semitendinosus": { min: 80, max: 150 },
    "Triceps surae (sóleo)": { min: 50, max: 120 },
    "Tibialis posterior": { min: 50, max: 96 },
    "Vastus lateralis, intermedius y medialis": { min: 80, max: 150 }
  },
  Xeomin: {
    "Abductor hallucis": { min: 10, max: 20 },
    "Adductor longus": { min: 50, max: 100 },
    "Adductor magnus": { min: 100, max: 200 },
    "Biceps brachii": { min: 50, max: 100 },
    "Biceps femoris": { min: 100, max: 150 },
    "Gastrocnemio (cabeza lateral)": { min: 50, max: 120 },
    "Gastrocnemio (cabeza medial)": { min: 50, max: 120 },
    "Glúteo medio": { min: 60, max: 90 },
    "Gracilis": { min: 80, max: 120 },
    "Psoas mayor": { min: 120, max: 200 },
    "Rectus femoris (cuádriceps anterior)": { min: 100, max: 150 },
    "Semitendinosus": { min: 80, max: 150 },
    "Triceps surae (sóleo)": { min: 50, max: 120 },
    "Tibialis posterior": { min: 50, max: 96 },
    "Vastus lateralis, intermedius y medialis": { min: 80, max: 150 }
  }
};

export const generateBotulinumReportHtml = (data: any): string => {
  const {
    medico,
    pacienteNombre,
    pacienteEdad,
    pacientePeso,
    marca,
    musculos,
    totalDosisAjustada,
    advertencia,
    dilucion
  } = data;

  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const toxinaInfo = {
    'Dysport': 'Dysport (Abobotulinumtoxina A)',
    'Botox': 'Botox (Onabotulinumtoxina A)',
    'Xeomin': 'Xeomin (Incobotulinumtoxina A)'
  };

  const uiFrasco = marca === 'Dysport' ? 500 : 100;

  const totalBase = musculos.reduce((total: number, m: any) => total + (m.dosisBase || 0), 0);

  // Función para obtener punto motor usando todos los datos disponibles
  const getPuntoMotor = (musculo: string) => {
    return puntosMotoresData[musculo as keyof typeof puntosMotoresData] || "Referencia anatómica no disponible para este músculo. Consulte literatura especializada.";
  };

  // Obtener datos de dosis para mostrar rangos
  const getDosisRange = (musculo: string, marca: string) => {
    return dosisDataComplete[marca as keyof typeof dosisDataComplete]?.[musculo as keyof typeof dosisDataComplete['Dysport']] || { min: 0, max: 0 };
  };

  const musculosRows = musculos
    .map(
      (m: any) => {
        const range = getDosisRange(m.nombre, marca);
        const seleccion = m.opcionDosis === 'min' ? 'Mínima' : 'Máxima';
        return `
    <tr>
      <td>${m.lado}</td>
      <td class="musculo-nombre">${m.nombre}</td>
      <td class="referencias">
        <div class="rango-info">${range.min}-${range.max} U</div>
        <div class="seleccion-info">${seleccion} (${m.dosisBase} U)</div>
      </td>
      <td class="dosis-ajustada">${m.dosisAjustada} U</td>
      <td class="ml-aplicar">${((m.dosisAjustada / uiFrasco) * parseFloat(dilucion)).toFixed(2)} ml</td>
    </tr>
  `;
      }
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte de Dosis de Toxina Botulínica</title>
        <style>
          @media print {
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            body { margin: 0 !important; padding: 0 !important; }
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #fff;
            line-height: 1.4;
          }
          .reporte-impresion {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            box-sizing: border-box;
            background: white;
          }
          .reporte-header {
            text-align: center;
            border-bottom: 2px solid #00796b;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .clinica-logo {
            font-size: 22pt;
            font-weight: bold;
            color: #00796b;
          }
          .reporte-titulo {
            font-size: 16pt;
            font-weight: normal;
            color: #333;
          }
          .fecha-reporte {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
          }
          .seccion-paciente, .seccion-tratamiento, .seccion-resumen {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .seccion-titulo {
            font-size: 14pt;
            font-weight: bold;
            color: #00796b;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .paciente-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .tratamiento-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
          }
          .info-campo {
            display: flex;
            align-items: baseline;
          }
          .etiqueta {
            font-weight: bold;
            min-width: 60px;
            margin-right: 5px;
          }
          .valor {
            border-bottom: 1px dotted #999;
            flex-grow: 1;
            padding-bottom: 1px;
          }
          .toxina-info {
            font-size: 11pt;
          }
          .toxina-nombre {
            font-weight: bold;
            font-size: 12pt;
            color: #333;
          }
          .tabla-musculos {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .tabla-musculos thead {
            background-color: #00796b;
            color: white;
          }
          .tabla-musculos th, .tabla-musculos td {
            padding: 10px;
            text-align: left;
            border: 1px solid #e0e0e0;
          }
          .tabla-musculos th {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          .tabla-musculos tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .musculo-nombre {
            font-weight: bold;
          }
          .referencias, .dosis-ajustada, .ml-aplicar {
            text-align: center;
          }
          .referencias {
            font-size: 9pt;
          }
          .rango-info {
            font-weight: bold;
            color: #00796b;
            margin-bottom: 2px;
          }
          .seleccion-info {
            color: #666;
            font-style: italic;
          }
          .fila-total {
            background-color: #e0f2f1 !important;
            font-weight: bold;
          }
          .totales-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .total-item {
            text-align: center;
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #c8e6c9;
          }
          .total-label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .total-valor {
            font-size: 15pt;
            font-weight: bold;
            color: #2e7d32;
          }
          .advertencia-limites {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 10px;
            margin-top: 15px;
            font-size: 10pt;
            color: #e65100;
            font-weight: bold;
          }
          .reporte-pie {
            border-top: 2px solid #00796b;
            padding-top: 15px;
            margin-top: 25px;
          }
          .firma-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .firma-box .firma-linea {
            border-bottom: 1px solid #333;
            height: 50px;
            margin-bottom: 5px;
          }
          .firma-label {
            font-size: 9pt;
            color: #666;
            text-align: center;
          }
          .info-medico {
            text-align: center;
            margin-bottom: 20px;
          }
          .disclaimer {
            font-size: 8pt;
            color: #666;
            text-align: justify;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 20px;
          }
          .page-break {
            page-break-before: always;
          }
          .seccion-puntos-motores {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .punto-motor-item {
            background-color: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .musculo-titulo {
            color: #00796b;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 2px solid #c8e6c9;
            padding-bottom: 5px;
          }
          .punto-motor-descripcion {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          .punto-motor-descripcion p {
            margin: 0;
            text-align: justify;
            font-size: 10pt;
            color: #333;
          }
          .dosis-info-pequena {
            background-color: #e8f5e8;
            padding: 8px;
            border-radius: 4px;
            font-size: 9pt;
            color: #2e7d32;
            border-left: 3px solid #4caf50;
          }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 40px; height: 40px;">${appIconSvg.replace('width="32" height="32"', 'width="40" height="40"')}</div>
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Reporte de Dosis de Toxina Botulínica</div>
            <div class="fecha-reporte">${fecha}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">Información del Paciente</h2>
            <div class="paciente-info">
              <div class="info-campo">
                <span class="etiqueta">Nombre:</span>
                <span class="valor">${pacienteNombre || 'No especificado'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Edad:</span>
                <span class="valor">${pacienteEdad || 'No especificada'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Peso:</span>
                <span class="valor">${pacientePeso || 'No especificado'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Fecha:</span>
                <span class="valor">${fecha}</span>
              </div>
            </div>
          </section>

          <section class="seccion-tratamiento">
            <h2 class="seccion-titulo">Información del Tratamiento</h2>
            <div class="tratamiento-grid">
              <div class="info-campo">
                <span class="etiqueta">Toxina:</span>
                <span class="valor toxina-nombre">${toxinaInfo[marca as keyof typeof toxinaInfo] || marca}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Dilución:</span>
                <span class="valor">${dilucion} ml por frasco (${uiFrasco} U)</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Concentración:</span>
                <span class="valor">${(uiFrasco / parseFloat(dilucion)).toFixed(1)} U/ml</span>
              </div>
            </div>
          </section>

          <section>
            <h2 class="seccion-titulo">Músculos Tratados</h2>
            <table class="tabla-musculos">
              <thead>
                <tr>
                  <th>Lado</th>
                  <th>Músculo</th>
                  <th>Referencias (U)</th>
                  <th>Dosis Ajustada (U)</th>
                  <th>ml a aplicar</th>
                </tr>
              </thead>
              <tbody>
                ${musculosRows}
                <tr class="fila-total">
                  <td colspan="2"><strong>TOTAL</strong></td>
                  <td class="dosis-base"><strong>${totalBase} U</strong></td>
                  <td class="dosis-ajustada"><strong>${totalDosisAjustada} U</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resumen del Tratamiento</h2>
            <div class="totales-grid">
              <div class="total-item">
                <div class="total-label">Dosis Total Base</div>
                <div class="total-valor">${totalBase} U</div>
              </div>
              <div class="total-item">
                <div class="total-label">Dosis Total Ajustada</div>
                <div class="total-valor">${totalDosisAjustada} U</div>
              </div>
            </div>
            ${advertencia ? `<div class="advertencia-limites">${advertencia}</div>` : ''}
          </section>

          <footer class="reporte-pie">
            <div class="info-medico">
              <strong>Reporte generado para:</strong> ${medico}
            </div>
            <div class="firma-area">
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">Firma del Médico</div>
              </div>
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">Fecha y Sello</div>
              </div>
            </div>
            <div class="disclaimer">
              <strong>Disclaimer:</strong> Este reporte es generado por una herramienta de apoyo clínico y no sustituye 
              la evaluación médica profesional ni la revisión de la información oficial del producto. La dosificación 
              final debe ser determinada por el médico tratante.
            </div>
          </footer>
        </div>

        <!-- Segunda página: Referencias anatómicas de puntos motores -->
        <div class="page-break"></div>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 40px; height: 40px;">${appIconSvg.replace('width="32" height="32"', 'width="40" height="40"')}</div>
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Guía de Puntos Motores - Referencias Anatómicas</div>
            <div class="fecha-reporte">Músculos seleccionados para ${pacienteNombre || 'el tratamiento'}</div>
          </header>

          <section class="seccion-puntos-motores">
            <h2 class="seccion-titulo">Localización de Puntos Motores</h2>
            ${musculos.map((m: any) => {
              const puntoMotor = getPuntoMotor(m.nombre);
              return `
                <div class="punto-motor-item">
                  <h3 class="musculo-titulo">${m.nombre} (${m.lado})</h3>
                  <div class="punto-motor-descripcion">
                    <p>${puntoMotor}</p>
                  </div>
                  <div class="dosis-info-pequena">
                    <strong>Dosis aplicada:</strong> ${m.dosisAjustada} U 
                    (${((m.dosisAjustada / uiFrasco) * parseFloat(dilucion)).toFixed(2)} ml)
                  </div>
                </div>
              `;
            }).join('')}
          </section>

          <footer class="reporte-pie">
            <div class="info-medico">
              <strong>Referencia anatómica para:</strong> ${medico}
            </div>
            <div class="disclaimer">
              <strong>Nota importante:</strong> Estas descripciones son referencias anatómicas generales. 
              La localización exacta puede variar según la anatomía individual del paciente. 
              Utilice siempre electroestimulación o ecografía para confirmar la ubicación precisa del punto motor.
            </div>
          </footer>
        </div>
      </body>
    </html>
  `;
};