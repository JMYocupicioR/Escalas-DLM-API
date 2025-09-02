"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const zod_1 = require("zod");
const puppeteer_1 = __importDefault(require("puppeteer"));
const AssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        name: zod_1.z.string().optional(),
        age: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        gender: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
    }),
    score: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    interpretation: zod_1.z.string().optional(),
    answers: zod_1.z.union([
        zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            question: zod_1.z.string().optional(),
            label: zod_1.z.string().optional(),
            value: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
            points: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        })),
        zod_1.z.record(zod_1.z.unknown()),
    ]).optional(),
});
const RequestSchema = zod_1.z.object({
    assessment: AssessmentSchema,
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    options: zod_1.z.object({
        theme: zod_1.z.enum(['light', 'dark']).optional(),
        customTheme: zod_1.z.record(zod_1.z.string()).optional(),
        footerNote: zod_1.z.string().optional(),
        preset: zod_1.z.enum(['compact', 'medical', 'formal']).optional(),
        headerTitle: zod_1.z.string().optional(),
        headerSubtitle: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().optional(),
        scale: zod_1.z.number().optional(),
        showPatientSummary: zod_1.z.boolean().optional(),
    }).optional(),
});
const generateHtml = (payload) => {
    const { assessment, scale, options } = payload;
    const theme = options?.theme === 'dark'
        ? { bg: '#0f172a', card: '#111827', text: '#f8fafc', muted: '#94a3b8', border: '#334155', primary: '#0891b2' }
        : { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e5e7eb', primary: '#0891b2' };
    const s = Math.max(0.7, Math.min(1.1, options?.scale ?? 0.9));
    const px = (n) => `${(n * s).toFixed(2)}px`;
    let detailsHTML = '';
    if (Array.isArray(assessment.answers)) {
        const rows = assessment.answers.map(a => `
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
    }
    else if (assessment.answers && typeof assessment.answers === 'object') {
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
        assessment.patientData.name ? `Paciente: <span class='value'>${assessment.patientData.name}</span>` : '',
        assessment.patientData.age ? `Edad: <span class='value'>${assessment.patientData.age}</span>` : '',
        assessment.patientData.gender ? `Género: <span class='value'>${assessment.patientData.gender}</span>` : '',
        assessment.patientData.doctorName ? `Evaluador: <span class='value'>${assessment.patientData.doctorName}</span>` : ''
    ].filter(Boolean).join(' · ')}
            </p>` : ''}
        </div>
      </div>
      <div class="section">
        <h2>Datos del Paciente</h2>
        <div class="grid">
          <div><span class="label">Nombre:</span> <span class="value">${assessment.patientData.name ?? ''}</span></div>
          <div><span class="label">Edad:</span> <span class="value">${assessment.patientData.age ?? ''}</span></div>
          <div><span class="label">Género:</span> <span class="value">${assessment.patientData.gender ?? ''}</span></div>
          <div><span class="label">Médico/Evaluador:</span> <span class="value">${assessment.patientData.doctorName ?? ''}</span></div>
        </div>
      </div>
      <div class="section">
        <h2>Resultados</h2>
        <div class="score">
          ${assessment.score !== undefined ? `<span class="scoreValue">Puntuación: ${assessment.score}</span>` : ''}
          ${assessment.interpretation ? `<span class="result">${assessment.interpretation}</span>` : ''}
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
const handler = async (event, context) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        if (!event.body) {
            throw new Error('Request body is required');
        }
        const body = JSON.parse(event.body);
        const parsed = RequestSchema.parse(body);
        const html = generateHtml(parsed);
        // Launch puppeteer with Netlify-compatible options
        const browser = await puppeteer_1.default.launch({
            headless: 'shell',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
            preferCSSPageSize: true,
        });
        await page.close();
        await browser.close();
        const filename = `${parsed.scale.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`;
        // Check if binary response is requested
        const isBinary = event.queryStringParameters?.binary === '1';
        if (isBinary) {
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
                body: Buffer.from(pdfBuffer).toString('base64'),
                isBase64Encoded: true,
            };
        }
        // Default: JSON response with base64
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                base64: Buffer.from(pdfBuffer).toString('base64'),
            }),
        };
    }
    catch (error) {
        console.error('PDF export error:', error);
        return {
            statusCode: 400,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: error?.message || 'Bad Request',
            }),
        };
    }
};
exports.handler = handler;
