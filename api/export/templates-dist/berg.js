"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = void 0;
const zod_1 = require("zod");
const BergAssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        age: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        gender: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
    }),
    score: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    interpretation: zod_1.z.object({
        level: zod_1.z.string(),
        description: zod_1.z.string(),
        risk: zod_1.z.string(),
        color: zod_1.z.string(),
    }).optional(),
    answers: zod_1.z.record(zod_1.z.number()).optional(),
});
const BergRequestSchema = zod_1.z.object({
    assessment: BergAssessmentSchema,
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        question: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        instructions: zod_1.z.string().optional(),
        options: zod_1.z.array(zod_1.z.object({
            value: zod_1.z.number(),
            label: zod_1.z.string(),
            description: zod_1.z.string(),
        })),
    })).optional(),
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
    const { assessment, scale, questions = [], options } = payload;
    const { patientData, score, interpretation, answers } = assessment;
    let detailHTML = '';
    if (questions && answers) {
        questions.forEach((q, index) => {
            const answer = answers[q.id];
            if (answer !== undefined) {
                const selectedOption = q.options.find(opt => opt.value === answer);
                if (selectedOption) {
                    detailHTML += `
            <div style="margin-bottom: 15px; padding: 12px; border-left: 4px solid ${interpretation?.color || '#0891b2'}; background: #f8fafc;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b;">Ítem ${index + 1}: ${q.question}</h4>
              ${q.instructions ? `<p style="font-size: 13px; color: #64748b; margin: 4px 0;"><em>${q.instructions}</em></p>` : ''}
              <div style="margin-top: 8px; padding: 8px; background: white; border-radius: 4px;">
                <p style="margin: 0; color: #0f172a;"><strong>${selectedOption.value} puntos - ${selectedOption.label}</strong></p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">${selectedOption.description}</p>
              </div>
            </div>
          `;
                }
            }
        });
    }
    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const scoreNum = typeof score === 'string' ? parseInt(score) : score;
    const maxScore = 56;
    const scorePercentage = scoreNum ? (scoreNum / maxScore * 100).toFixed(1) : 0;
    return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Resultados Escala de Berg</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 18mm;
          }
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.6;
            color: #1e293b;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${interpretation?.color || '#0891b2'};
          }
          .header h1 {
            margin: 0 0 8px 0;
            color: #0f172a;
            font-size: 28px;
          }
          .header .subtitle {
            color: #64748b;
            font-size: 14px;
            margin: 0;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
          }
          .section h2 {
            margin: 0 0 15px 0;
            color: #0f172a;
            font-size: 18px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .patient-info p {
            margin: 0;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
          }
          .score-card {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, ${interpretation?.color || '#0891b2'}15, ${interpretation?.color || '#0891b2'}05);
            border-radius: 12px;
            border: 2px solid ${interpretation?.color || '#0891b2'};
          }
          .score-value {
            font-size: 48px;
            font-weight: bold;
            color: ${interpretation?.color || '#0891b2'};
            margin: 0;
          }
          .score-label {
            font-size: 16px;
            color: #64748b;
            margin: 8px 0;
          }
          .interpretation-box {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border-left: 6px solid ${interpretation?.color || '#0891b2'};
          }
          .interpretation-box h3 {
            margin: 0 0 12px 0;
            color: ${interpretation?.color || '#0891b2'};
            font-size: 22px;
          }
          .interpretation-box p {
            margin: 8px 0;
            font-size: 15px;
          }
          .risk-badge {
            display: inline-block;
            padding: 6px 16px;
            background: ${interpretation?.color || '#0891b2'};
            color: white;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 8px;
          }
          .progress-bar {
            width: 100%;
            height: 24px;
            background: #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin: 12px 0;
          }
          .progress-fill {
            height: 100%;
            background: ${interpretation?.color || '#0891b2'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            transition: width 0.3s ease;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Escala de Equilibrio de Berg</h1>
            <p class="subtitle">Berg Balance Scale - Evaluación Funcional del Equilibrio</p>
            <p class="subtitle">${today}</p>
          </div>

          <div class="section">
            <h2>📋 Datos del Paciente</h2>
            <div class="patient-info">
              <p><strong>ID:</strong> ${patientData?.id || 'No especificado'}</p>
              <p><strong>Nombre:</strong> ${patientData?.name || 'No especificado'}</p>
              <p><strong>Edad:</strong> ${patientData?.age || 'No especificada'} años</p>
              <p><strong>Género:</strong> ${patientData?.gender || 'No especificado'}</p>
              <p style="grid-column: 1 / -1;"><strong>Evaluador:</strong> ${patientData?.doctorName || 'No especificado'}</p>
            </div>
          </div>

          <div class="section">
            <h2>🎯 Resultado de la Evaluación</h2>
            <div class="score-card">
              <p class="score-value">${score}/${maxScore}</p>
              <p class="score-label">Puntuación Total</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${scorePercentage}%">
                  ${scorePercentage}%
                </div>
              </div>
            </div>

            ${interpretation ? `
              <div class="interpretation-box">
                <h3>${interpretation.level}</h3>
                <p><strong>Interpretación:</strong> ${interpretation.description}</p>
                <p><strong>Evaluación clínica:</strong> ${interpretation.risk}</p>
                <span class="risk-badge">${interpretation.level} - ${interpretation.risk.split(' - ')[0]}</span>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>📝 Detalle de la Evaluación</h2>
            <p style="color: #64748b; margin-bottom: 20px;">
              La Escala de Berg evalúa el equilibrio mediante 14 tareas funcionales. Cada ítem se califica de 0-4 puntos.
            </p>
            ${detailHTML || '<p style="color: #94a3b8;">No hay detalles de respuestas disponibles.</p>'}
          </div>

          <div class="section" style="background: #f8fafc;">
            <h2>ℹ️ Información Clínica</h2>
            <p><strong>Interpretación de Resultados:</strong></p>
            <ul style="margin: 8px 0; padding-left: 24px;">
              <li><strong>41-56 puntos:</strong> Bajo riesgo de caídas, independencia funcional en equilibrio</li>
              <li><strong>21-40 puntos:</strong> Riesgo moderado de caídas, equilibrio funcional aceptable</li>
              <li><strong>0-20 puntos:</strong> Alto riesgo de caídas, requiere dispositivo de ayuda</li>
            </ul>
            <p style="margin-top: 12px;"><strong>Punto de corte clínico:</strong> Una puntuación ≤45 indica mayor riesgo de caídas múltiples.</p>
            <p style="margin-top: 8px; font-size: 13px; color: #64748b;"><em>
              Referencia: Berg KO, Wood-Dauphinee SL, Williams JI, Maki B. Measuring balance in the elderly: validation of an instrument. Can J Public Health. 1992.
            </em></p>
          </div>

          <div class="footer">
            <p><strong>Nota:</strong> Este documento es un registro de evaluación clínica. Los resultados deben ser interpretados por un profesional de la salud cualificado.</p>
            <p>Generado con Escalas Médicas DLM - ${today}</p>
            ${options?.footerNote ? `<p>${options.footerNote}</p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};
exports.generateHtml = generateHtml;
