// api/export/pdf.ts
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Scale } from '@/types/scale';
import { palette } from '@/app/theme';

/**
 * Genera y comparte un PDF con los resultados de la evaluación
 */
export type GenericAssessmentForPDF = {
  patientData: {
    name?: string;
    age?: number | string;
    gender?: string;
    doctorName?: string;
  };
  score?: number | string;
  interpretation?: string;
  answers?: Array<{
    id: string;
    question?: string;
    label?: string;
    value?: number | string;
    points?: number | string;
  }> | Record<string, unknown>;
};

export interface PdfTheme {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
}

export interface PdfOptions {
  theme?: 'light' | 'dark';
  customTheme?: Partial<PdfTheme>;
  footerNote?: string;
  preset?: 'compact' | 'medical' | 'formal';
  headerTitle?: string;
  headerSubtitle?: string;
  logoUrl?: string; // opcional
  scale?: number; // 0.7 - 1.1, para ajustar densidad
  showPatientSummary?: boolean; // muestra resumen en cabecera
}

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
    await Print.printAsync({ html: htmlContent });
    return true;
  } catch (error) {
    console.error('Error al imprimir PDF:', error);
    return false;
  }
};

/**
 * Genera el contenido HTML para el PDF
 */
const generatePDFContent = (
  assessment: GenericAssessmentForPDF,
  scale: Scale,
  options?: PdfOptions
): string => {
  const today = new Date().toLocaleDateString();
  const { patientData, score, interpretation, answers } = assessment;
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
            ${options?.logoUrl ? `<img class="logo" src="${options.logoUrl}" />` : ''}
            <div class="headerText">
              <h1>${options?.headerTitle ?? 'Informe de Resultados'}</h1>
              <p>${options?.headerSubtitle ?? `Fecha: ${today}`}</p>
              ${options?.showPatientSummary !== false ? `
                <p class="muted">
                  ${[patientData.name ? `Paciente: <span class='value'>${patientData.name}</span>` : '',
                     patientData.age ? `Edad: <span class='value'>${patientData.age}</span>` : '',
                     patientData.gender ? `Género: <span class='value'>${patientData.gender}</span>` : '',
                     patientData.doctorName ? `Evaluador: <span class='value'>${patientData.doctorName}</span>` : ''
                    ].filter(Boolean).join(' · ')}
                </p>
              ` : ''}
            </div>
          </div>
          <div class="section">
            <h2>Datos del Paciente</h2>
            <div class="grid">
              <div class="kv"><span class="label">Nombre:</span> <span class="value">${patientData.name ?? ''}</span></div>
              <div class="kv"><span class="label">Edad:</span> <span class="value">${patientData.age ?? ''}</span></div>
              <div class="kv"><span class="label">Género:</span> <span class="value">${patientData.gender ?? ''}</span></div>
              <div class="kv"><span class="label">Médico/Evaluador:</span> <span class="value">${patientData.doctorName ?? ''}</span></div>
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