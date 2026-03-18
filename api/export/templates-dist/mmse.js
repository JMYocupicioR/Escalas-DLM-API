"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = void 0;
const zod_1 = require("zod");
const AssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        age: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        gender: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
    }),
    score: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    interpretation: zod_1.z.string().optional(),
    answers: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        question: zod_1.z.string(),
        label: zod_1.z.string(),
        value: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
        points: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
        category: zod_1.z.string().optional(),
    })),
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
        ? { bg: '#0f172a', card: '#1e293b', text: '#f8fafc', muted: '#94a3b8', border: '#334155', primary: '#0891b2', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' }
        : { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', muted: '#64748b', border: '#e2e8f0', primary: '#0891b2', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
    const s = Math.max(0.7, Math.min(1.1, options?.scale ?? 0.9));
    const px = (n) => `${(n * s).toFixed(2)}px`;
    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    // Agrupar respuestas por categoría
    const categorizedAnswers = assessment.answers.reduce((acc, answer) => {
        const category = answer.category || 'General';
        if (!acc[category])
            acc[category] = [];
        acc[category].push(answer);
        return acc;
    }, {});
    // Calcular subtotales por categoría
    const categoryScores = Object.entries(categorizedAnswers).map(([category, answers]) => {
        const total = answers.reduce((sum, a) => sum + Number(a.value || 0), 0);
        const maxPoints = answers.length; // MMSE: 1 punto por pregunta
        return { category, total, maxPoints };
    });
    // Determinar color del resultado
    const score = Number(assessment.score);
    let resultColor = theme.success;
    let resultLevel = 'Normal';
    if (score < 18) {
        resultColor = theme.danger;
        resultLevel = 'Deterioro Severo';
    }
    else if (score < 24) {
        resultColor = theme.warning;
        resultLevel = 'Deterioro Leve';
    }
    const css = `
    @page { size: A4; margin: 18mm; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: ${theme.text};
      background: ${theme.bg};
      font-size: ${px(11)};
      line-height: 1.5;
    }
    .container { max-width: 820px; margin: 0 auto; padding: ${px(20)}; }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: ${px(24)};
      padding-bottom: ${px(16)};
      border-bottom: 2px solid ${theme.primary};
    }
    .headerLeft { display: flex; align-items: center; gap: ${px(12)}; }
    .logo { height: ${px(36)}; width: auto; }
    .headerText h1 {
      font-size: ${px(20)};
      font-weight: 700;
      margin: 0 0 ${px(4)} 0;
      color: ${theme.primary};
    }
    .headerText p {
      font-size: ${px(12)};
      color: ${theme.muted};
      margin: 0;
    }
    .headerRight { text-align: right; }
    .date {
      font-size: ${px(11)};
      color: ${theme.muted};
      font-weight: 500;
    }

    /* Sections */
    .section {
      margin-bottom: ${px(18)};
      padding: ${px(16)};
      border-radius: ${px(8)};
      background: ${theme.card};
      border: 1px solid ${theme.border};
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .section h2 {
      font-size: ${px(14)};
      font-weight: 700;
      margin: 0 0 ${px(12)} 0;
      color: ${theme.primary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: ${px(8)};
      border-bottom: 1px solid ${theme.border};
    }

    /* Patient info */
    .patientInfo {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: ${px(12)};
    }
    .infoItem {
      padding: ${px(8)};
      background: ${theme.bg};
      border-radius: ${px(4)};
    }
    .label {
      font-size: ${px(10)};
      font-weight: 600;
      color: ${theme.muted};
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: ${px(2)};
    }
    .value {
      font-size: ${px(13)};
      font-weight: 600;
      color: ${theme.text};
    }

    /* Score summary */
    .scoreSummary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${px(20)};
      background: linear-gradient(135deg, ${theme.card} 0%, ${theme.bg} 100%);
      border-radius: ${px(8)};
      border: 2px solid ${resultColor};
    }
    .scoreValue {
      font-size: ${px(48)};
      font-weight: 800;
      color: ${resultColor};
      line-height: 1;
    }
    .scoreMax {
      font-size: ${px(20)};
      color: ${theme.muted};
      margin-left: ${px(4)};
    }
    .scoreInfo h3 {
      font-size: ${px(16)};
      font-weight: 700;
      margin: 0 0 ${px(4)} 0;
      color: ${resultColor};
    }
    .scoreInfo p {
      font-size: ${px(12)};
      color: ${theme.muted};
      margin: 0;
    }

    /* Category breakdown */
    .categoryBreakdown {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${px(12)};
      margin-top: ${px(12)};
    }
    .categoryCard {
      padding: ${px(12)};
      background: ${theme.bg};
      border-radius: ${px(6)};
      border-left: 3px solid ${theme.primary};
    }
    .categoryName {
      font-size: ${px(11)};
      font-weight: 600;
      color: ${theme.muted};
      margin-bottom: ${px(4)};
    }
    .categoryScore {
      font-size: ${px(18)};
      font-weight: 700;
      color: ${theme.text};
    }
    .categoryMax {
      font-size: ${px(12)};
      color: ${theme.muted};
    }

    /* Detailed answers */
    .answersTable {
      width: 100%;
      border-collapse: collapse;
      margin-top: ${px(8)};
    }
    .answersTable th {
      background: ${theme.primary};
      color: white;
      padding: ${px(10)} ${px(8)};
      text-align: left;
      font-size: ${px(11)};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .answersTable td {
      padding: ${px(8)};
      border-bottom: 1px solid ${theme.border};
      font-size: ${px(11)};
    }
    .answersTable tr:last-child td { border-bottom: none; }
    .answersTable tr:hover { background: ${theme.bg}; }
    .questionCell { font-weight: 500; }
    .answerCell { color: ${theme.muted}; }
    .pointsCell {
      text-align: center;
      font-weight: 700;
      color: ${theme.primary};
    }

    /* Category section */
    .categorySection {
      margin-bottom: ${px(16)};
      page-break-inside: avoid;
    }
    .categoryHeader {
      background: ${theme.primary};
      color: white;
      padding: ${px(8)} ${px(12)};
      font-size: ${px(12)};
      font-weight: 700;
      border-radius: ${px(4)} ${px(4)} 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Interpretation */
    .interpretation {
      padding: ${px(16)};
      background: ${theme.bg};
      border-left: 4px solid ${resultColor};
      border-radius: ${px(4)};
      margin-top: ${px(12)};
    }
    .interpretation p {
      margin: 0;
      line-height: 1.6;
      font-size: ${px(12)};
    }

    /* Footer */
    .footer {
      font-size: ${px(9)};
      text-align: center;
      margin-top: ${px(32)};
      padding-top: ${px(16)};
      border-top: 1px solid ${theme.border};
      color: ${theme.muted};
    }

    @media print {
      .section { page-break-inside: avoid; }
      .categorySection { page-break-inside: avoid; }
    }
  `;
    const categoryHTML = Object.entries(categorizedAnswers).map(([category, answers]) => {
        const categoryTotal = answers.reduce((sum, a) => sum + Number(a.value || 0), 0);
        const maxPoints = answers.length;
        const rows = answers.map(a => `
      <tr>
        <td class="questionCell">${a.question}</td>
        <td class="answerCell">${a.label}</td>
        <td class="pointsCell">${a.value}</td>
      </tr>
    `).join('');
        return `
      <div class="categorySection">
        <div class="categoryHeader">
          <span>${category}</span>
          <span>${categoryTotal} / ${maxPoints} puntos</span>
        </div>
        <table class="answersTable">
          <thead>
            <tr>
              <th style="width: 50%">Pregunta</th>
              <th style="width: 35%">Respuesta</th>
              <th style="width: 15%">Puntos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    }).join('');
    const categoryCardsHTML = categoryScores.map(cat => `
    <div class="categoryCard">
      <div class="categoryName">${cat.category}</div>
      <div class="categoryScore">
        ${cat.total}<span class="categoryMax"> / ${cat.maxPoints}</span>
      </div>
    </div>
  `).join('');
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scale.name} - Reporte</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="headerLeft">
        ${options?.logoUrl ? `<img src="${options.logoUrl}" alt="Logo" class="logo">` : ''}
        <div class="headerText">
          <h1>${options?.headerTitle || 'Mini-Mental State Examination'}</h1>
          <p>${options?.headerSubtitle || 'Evaluación del Estado Cognitivo - Folstein et al.'}</p>
        </div>
      </div>
      <div class="headerRight">
        <div class="date">${today}</div>
      </div>
    </div>

    <!-- Patient Information -->
    ${options?.showPatientSummary !== false ? `
    <div class="section">
      <h2>Datos del Paciente</h2>
      <div class="patientInfo">
        ${assessment.patientData.name ? `
          <div class="infoItem">
            <div class="label">Nombre</div>
            <div class="value">${assessment.patientData.name}</div>
          </div>
        ` : ''}
        ${assessment.patientData.age ? `
          <div class="infoItem">
            <div class="label">Edad</div>
            <div class="value">${assessment.patientData.age} años</div>
          </div>
        ` : ''}
        ${assessment.patientData.gender ? `
          <div class="infoItem">
            <div class="label">Sexo</div>
            <div class="value">${assessment.patientData.gender}</div>
          </div>
        ` : ''}
        ${assessment.patientData.doctorName ? `
          <div class="infoItem">
            <div class="label">Evaluador</div>
            <div class="value">${assessment.patientData.doctorName}</div>
          </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Score Summary -->
    <div class="section">
      <h2>Resultado</h2>
      <div class="scoreSummary">
        <div>
          <span class="scoreValue">${assessment.score}</span>
          <span class="scoreMax">/ 30</span>
        </div>
        <div class="scoreInfo">
          <h3>${resultLevel}</h3>
          <p>Puntuación Total MMSE</p>
        </div>
      </div>

      ${assessment.interpretation ? `
        <div class="interpretation">
          <p><strong>Interpretación:</strong> ${assessment.interpretation}</p>
        </div>
      ` : ''}
    </div>

    <!-- Category Breakdown -->
    <div class="section">
      <h2>Resumen por Dominios Cognitivos</h2>
      <div class="categoryBreakdown">
        ${categoryCardsHTML}
      </div>
    </div>

    <!-- Detailed Results -->
    <div class="section">
      <h2>Resultados Detallados</h2>
      ${categoryHTML}
    </div>

    <!-- Footer -->
    <div class="footer">
      ${options?.footerNote || 'Este documento es un reporte generado automáticamente. Para uso clínico únicamente.'}
      <br>
      <strong>Referencia:</strong> Folstein MF, Folstein SE, McHugh PR. J Psychiatr Res. 1975;12(3):189-198.
    </div>
  </div>
</body>
</html>
  `.trim();
};
exports.generateHtml = generateHtml;
