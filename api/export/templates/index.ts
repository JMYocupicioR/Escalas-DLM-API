export type PdfTemplatePayload = {
  assessment: any;
  scale: { id: string; name: string };
  options?: {
    theme?: 'light' | 'dark';
    customTheme?: Record<string, string>;
    footerNote?: string;
    preset?: 'compact' | 'medical' | 'formal';
    headerTitle?: string;
    headerSubtitle?: string;
    logoUrl?: string;
    scale?: number;
    showPatientSummary?: boolean;
  };
};

/* moved to ./generic */
export const renderGenericHtml = (payload: PdfTemplatePayload): string => {
  const { assessment, scale, options } = payload;
  const theme = options?.theme === 'dark'
    ? { bg: '#0f172a', card: '#111827', text: '#f8fafc', muted: '#94a3b8', border: '#334155', primary: '#0891b2' }
    : { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e5e7eb', primary: '#0891b2' };
  const s = Math.max(0.7, Math.min(1.1, options?.scale ?? 0.9));
  const px = (n: number) => `${(n * s).toFixed(2)}px`;

  let detailsHTML = '';
  if (Array.isArray(assessment?.answers)) {
    const rows = assessment.answers.map((a: any) => `
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
            <th>Pregunta</th><th>Respuesta</th><th>Valor</th><th>Puntos</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } else if (assessment?.answers && typeof assessment.answers === 'object') {
    const rows = Object.entries(assessment.answers).map(([k, v]) => `
      <tr><td>${k}</td><td colspan="3">${String(v)}</td></tr>
    `).join('');
    detailsHTML = `
      <table>
        <thead><tr><th>Campo</th><th colspan="3">Valor</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  const today = new Date().toLocaleDateString();
  const css = `
    @page { size: A4; margin: 18mm; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${theme.text}; background: ${theme.bg}; font-size: ${px(12)}; }
    .container { max-width: 820px; margin: 0 auto; padding: ${px(16)}; }
    .header { display: flex; align-items: center; gap: ${px(10)}; margin-bottom: ${px(18)}; }
    .logo { height: ${px(28)}; width: auto; }
    .headerText h1 { font-size: ${px(18)}; font-weight: 700; margin: 0 0 ${px(2)} 0; }
    .headerText p { font-size: ${px(11)}; color: ${theme.muted}; margin: 0; }
    .section { margin-bottom: ${px(14)}; padding: ${px(12)}; border-radius: ${px(8)}; background: ${theme.card}; border: 1px solid ${theme.border}; }
    .section h2 { font-size: ${px(14)}; font-weight: 700; margin: 0 0 ${px(6)} 0; letter-spacing: 0.3px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${px(6)} ${px(12)}; }
    .label { font-weight: 600; }
    .value { color: ${theme.text}; }
    .muted { color: ${theme.muted}; }
    .score { display: flex; align-items: baseline; gap: ${px(6)}; }
    .scoreValue { font-size: ${px(18)}; font-weight: 800; }
    .result { font-size: ${px(12)}; font-weight: 700; color: ${theme.primary}; }
    .footer { font-size: ${px(9)}; text-align: center; margin-top: ${px(28)}; color: ${theme.muted}; }
    table { width: 100%; border-collapse: collapse; font-size: ${px(11)}; }
    th, td { padding: ${px(6)}; border-bottom: 1px solid ${theme.border}; text-align: left; }
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Resultados ${scale.name}</title><style>${css}</style></head><body>
    <div class="container">
      <div class="header">
        ${options?.logoUrl ? `<img class="logo" src="${options.logoUrl}" />` : ''}
        <div class="headerText">
          <h1>${options?.headerTitle ?? 'Informe de Resultados'}</h1>
          <p>${options?.headerSubtitle ?? `Fecha: ${today}`}</p>
          ${options?.showPatientSummary !== false ? `
            <p class="muted">
              ${[
                assessment?.patientData?.name ? `Paciente: ${assessment.patientData.name}` : '',
                assessment?.patientData?.age ? `Edad: ${assessment.patientData.age}` : '',
                assessment?.patientData?.gender ? `Género: ${assessment.patientData.gender}` : '',
                assessment?.patientData?.doctorName ? `Médico: ${assessment.patientData.doctorName}` : ''
              ].filter(Boolean).join(' · ')}
            </p>` : ''}
        </div>
      </div>
      <div class="section">
        <h2>Resultados</h2>
        <div class="score">
          ${assessment?.score !== undefined ? `<span class="scoreValue">Puntuación: ${assessment.score}</span>` : ''}
          ${assessment?.interpretation ? `<span class="result">${assessment.interpretation}</span>` : ''}
        </div>
      </div>
      <div class="section">
        <h2>Detalle de Respuestas</h2>
        ${detailsHTML || '<p class="muted">Sin detalle disponible.</p>'}
      </div>
      <div class="footer">
        <p>Documento generado por DeepLuxMed.mx</p>
        <p>${options?.footerNote ?? 'Privacidad médico-paciente aplicada.'}</p>
      </div>
    </div>
  </body></html>`;
};

export { generateHtml as renderGenericHtml } from './generic';
// Simple dispatcher for now; extend with per-scale templates over time
export { generateHtml as renderBotulinumHtml } from './botulinum';
export { generateHtml as renderFimHtml } from './fim';
export { generateHtml as renderBarthelHtml } from './barthel';
export { generateHtml as renderLequesneHtml } from './lequesne';

export const renderHtmlForScale = (payload: PdfTemplatePayload): string => {
  const id = payload?.scale?.id || '';
  if (id === 'botulinum') {
    // Dynamic import via direct file to keep tree-shaking predictable
    return (require('./botulinum') as typeof import('./botulinum')).generateHtml(payload as any);
  }
  if (id === 'fim') {
    return (require('./fim') as typeof import('./fim')).generateHtml(payload as any);
  }
  if (id === 'barthel') {
    return (require('./barthel') as typeof import('./barthel')).generateHtml(payload as any);
  }
  if (id === 'lequesne') {
    return (require('./lequesne') as typeof import('./lequesne')).generateHtml(payload as any);
  }
  return (require('./generic') as typeof import('./generic')).generateHtml(payload as any);
};

// Provide a map + selector for compatibility with existing server code
export const TEMPLATE_MAP = {
  botulinum: (payload: PdfTemplatePayload) => (require('./botulinum') as typeof import('./botulinum')).generateHtml(payload as any),
  fim: (payload: PdfTemplatePayload) => (require('./fim') as typeof import('./fim')).generateHtml(payload as any),
  barthel: (payload: PdfTemplatePayload) => (require('./barthel') as typeof import('./barthel')).generateHtml(payload as any),
  lequesne: (payload: PdfTemplatePayload) => (require('./lequesne') as typeof import('./lequesne')).generateHtml(payload as any),
  generic: (payload: PdfTemplatePayload) => (require('./generic') as typeof import('./generic')).generateHtml(payload as any),
} as const;

export const getTemplateFunction = (scaleId: string) => {
  return (TEMPLATE_MAP as Record<string, (p: PdfTemplatePayload) => string>)[scaleId] || TEMPLATE_MAP.generic;
};
