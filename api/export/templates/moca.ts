import { z } from 'zod';

const MocaAssessmentSchema = z.object({
  patientData: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    doctorName: z.string().optional(),
    educationYears: z.number().optional(),
  }),
  rawScore: z.union([z.number(), z.string()]).optional(),
  adjustedScore: z.union([z.number(), z.string()]).optional(),
  educationAdjustment: z.number().optional(),
  interpretation: z.object({
    level: z.string(),
    description: z.string(),
    recommendations: z.string(),
    color: z.string(),
  }).optional(),
  domainScores: z.object({
    visoespacialEjecutiva: z.number(),
    identificacion: z.number(),
    atencion: z.number(),
    lenguaje: z.number(),
    abstraccion: z.number(),
    recuerdoDiferido: z.number(),
    orientacion: z.number(),
  }).optional(),
  responses: z.record(z.number()).optional(),
});

const MocaRequestSchema = z.object({
  assessment: MocaAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    category: z.string().optional(),
    options: z.array(z.object({
      value: z.number(),
      label: z.string(),
      description: z.string().optional(),
    })),
  })).optional(),
  options: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    customTheme: z.record(z.string()).optional(),
    footerNote: z.string().optional(),
    preset: z.enum(['compact', 'medical', 'formal']).optional(),
    headerTitle: z.string().optional(),
    headerSubtitle: z.string().optional(),
    logoUrl: z.string().optional(),
    scale: z.number().optional(),
    showPatientSummary: z.boolean().optional(),
  }).optional(),
});

export type MocaPayload = z.infer<typeof MocaRequestSchema>;

export const generateHtml = (payload: MocaPayload): string => {
  const { assessment, scale, questions = [], options } = payload;
  const { patientData, rawScore, adjustedScore, educationAdjustment, interpretation, domainScores, responses } = assessment;

  // Agrupar preguntas por categoría para mejor organización
  const questionsByCategory: Record<string, any[]> = {};
  questions.forEach(q => {
    const category = q.category || 'Otros';
    if (!questionsByCategory[category]) {
      questionsByCategory[category] = [];
    }
    questionsByCategory[category].push(q);
  });

  // Generar HTML de detalles por categoría
  let detailHTML = '';
  const categoryColors: Record<string, string> = {
    'Visoespacial/Ejecutiva': '#8b5cf6',
    'Identificación': '#3b82f6',
    'Memoria': '#10b981',
    'Atención': '#f59e0b',
    'Lenguaje': '#ec4899',
    'Abstracción': '#6366f1',
    'Orientación': '#14b8a6',
  };

  Object.entries(questionsByCategory).forEach(([category, categoryQuestions]) => {
    const categoryColor = categoryColors[category] || '#3b82f6';
    
    detailHTML += `
      <div style="margin-top: 20px; page-break-inside: avoid;">
        <h3 style="color: ${categoryColor}; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid ${categoryColor};">
          ${category}
        </h3>
    `;

    categoryQuestions.forEach((q, index) => {
      const answer = responses ? responses[q.id] : undefined;
      if (answer !== undefined) {
        const selectedOption = q.options.find((opt: any) => opt.value === answer);
        if (selectedOption) {
          detailHTML += `
            <div style="margin-bottom: 12px; padding: 10px; border-left: 4px solid ${categoryColor}; background: #f8fafc;">
              <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px;">${q.question}</h4>
              ${q.instructions ? `<p style="font-size: 12px; color: #64748b; margin: 4px 0;"><em>${q.instructions}</em></p>` : ''}
              <div style="margin-top: 6px; padding: 6px 8px; background: white; border-radius: 4px;">
                <p style="margin: 0; color: #0f172a; font-size: 13px;"><strong>${selectedOption.value} puntos - ${selectedOption.label}</strong></p>
                ${selectedOption.description ? `<p style="margin: 3px 0 0 0; font-size: 12px; color: #475569;">${selectedOption.description}</p>` : ''}
              </div>
            </div>
          `;
        }
      }
    });

    detailHTML += `</div>`;
  });

  // Generar HTML de puntuaciones por dominio
  let domainScoresHTML = '';
  if (domainScores) {
    const domainMaxScores: Record<string, number> = {
      visoespacialEjecutiva: 5,
      identificacion: 3,
      atencion: 6,
      lenguaje: 3,
      abstraccion: 2,
      recuerdoDiferido: 5,
      orientacion: 6,
    };

    const domainNames: Record<string, string> = {
      visoespacialEjecutiva: 'Visoespacial/Ejecutiva',
      identificacion: 'Identificación',
      atencion: 'Atención',
      lenguaje: 'Lenguaje',
      abstraccion: 'Abstracción',
      recuerdoDiferido: 'Recuerdo Diferido',
      orientacion: 'Orientación',
    };

    Object.entries(domainScores).forEach(([domain, score]) => {
      const maxScore = domainMaxScores[domain] || 1;
      const percentage = (score / maxScore) * 100;
      const color = categoryColors[domainNames[domain]] || '#3b82f6';

      domainScoresHTML += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 13px; color: #1e293b; font-weight: 600;">${domainNames[domain]}</span>
            <span style="font-size: 13px; color: #64748b; font-weight: 600;">${score}/${maxScore}</span>
          </div>
          <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background: ${color}; border-radius: 5px;"></div>
          </div>
        </div>
      `;
    });
  }

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const rawScoreNum = typeof rawScore === 'string' ? parseInt(rawScore) : rawScore;
  const adjustedScoreNum = typeof adjustedScore === 'string' ? parseInt(adjustedScore) : adjustedScore;
  const maxScore = 30;
  const scorePercentage = adjustedScoreNum ? (adjustedScoreNum / maxScore * 100).toFixed(1) : 0;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Resultados MoCA</title>
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
            border-bottom: 3px solid ${interpretation?.color || '#3b82f6'};
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
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert-box p {
            margin: 0;
            color: #92400e;
            font-size: 13px;
            line-height: 1.5;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            page-break-inside: avoid;
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
            font-size: 13px;
          }
          .patient-info strong {
            color: #475569;
            font-weight: 600;
          }
          .score-container {
            text-align: center;
            padding: 25px;
            background: ${interpretation?.color || '#3b82f6'}15;
            border: 2px solid ${interpretation?.color || '#3b82f6'};
            border-radius: 10px;
            margin: 20px 0;
          }
          .score-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 15px;
          }
          .score-item {
            text-align: center;
          }
          .score-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .score-value {
            font-size: 32px;
            font-weight: 700;
            color: ${interpretation?.color || '#3b82f6'};
          }
          .score-max {
            font-size: 18px;
            color: #94a3b8;
          }
          .interpretation {
            background: ${interpretation?.color || '#3b82f6'}10;
            padding: 15px;
            border-left: 4px solid ${interpretation?.color || '#3b82f6'};
            margin: 15px 0;
            border-radius: 4px;
          }
          .interpretation h3 {
            margin: 0 0 8px 0;
            color: ${interpretation?.color || '#3b82f6'};
            font-size: 20px;
          }
          .interpretation p {
            margin: 0;
            font-size: 14px;
            color: #334155;
            line-height: 1.6;
          }
          .recommendations {
            background: #fef3c7;
            padding: 15px;
            border-left: 4px solid #f59e0b;
            margin: 15px 0;
            border-radius: 4px;
          }
          .recommendations h3 {
            margin: 0 0 8px 0;
            color: #92400e;
            font-size: 16px;
          }
          .recommendations p {
            margin: 0;
            font-size: 13px;
            color: #92400e;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <h1>Evaluación Cognitiva de Montreal</h1>
            <p class="subtitle">Montreal Cognitive Assessment (MoCA)</p>
            <p class="subtitle">Fecha: ${today}</p>
          </div>

          <!-- ALERTA IMPORTANTE -->
          <div class="alert-box">
            <p><strong>⚠️ IMPORTANTE:</strong> El MoCA es una herramienta de <strong>cribado</strong>, no diagnóstica. 
            Un resultado anormal requiere evaluación neuropsicológica completa por especialista.</p>
          </div>

          <!-- DATOS DEL PACIENTE -->
          ${patientData?.name ? `
            <div class="section">
              <h2>Datos del Paciente</h2>
              <div class="patient-info">
                ${patientData.name ? `<p><strong>Nombre:</strong> ${patientData.name}</p>` : ''}
                ${patientData.age ? `<p><strong>Edad:</strong> ${patientData.age} años</p>` : ''}
                ${patientData.gender ? `<p><strong>Sexo:</strong> ${patientData.gender}</p>` : ''}
                ${patientData.doctorName ? `<p><strong>Evaluador:</strong> ${patientData.doctorName}</p>` : ''}
                ${patientData.educationYears !== undefined ? `<p><strong>Años de Educación:</strong> ${patientData.educationYears} años</p>` : ''}
                ${educationAdjustment !== undefined && educationAdjustment > 0 ? `<p style="background: #dcfce7; color: #166534;"><strong>Ajuste Educativo:</strong> +${educationAdjustment} punto</p>` : ''}
              </div>
            </div>
          ` : ''}

          <!-- PUNTUACIÓN -->
          <div class="section">
            <h2>Puntuación Total</h2>
            <div class="score-container">
              <div class="score-row">
                <div class="score-item">
                  <div class="score-label">Puntuación Bruta</div>
                  <div class="score-value">${rawScoreNum !== undefined ? rawScoreNum : 'N/A'}<span class="score-max">/30</span></div>
                </div>
                ${educationAdjustment !== undefined && educationAdjustment > 0 ? `
                  <div style="font-size: 24px; color: #64748b;">+</div>
                  <div class="score-item">
                    <div class="score-label">Ajuste</div>
                    <div class="score-value" style="font-size: 24px;">+${educationAdjustment}</div>
                  </div>
                  <div style="font-size: 24px; color: #64748b;">=</div>
                ` : ''}
                <div class="score-item">
                  <div class="score-label">Puntuación Final</div>
                  <div class="score-value" style="font-size: 42px;">${adjustedScoreNum !== undefined ? adjustedScoreNum : 'N/A'}<span class="score-max">/30</span></div>
                </div>
              </div>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;">
                Porcentaje: ${scorePercentage}%
              </p>
            </div>

            <!-- INTERPRETACIÓN -->
            ${interpretation ? `
              <div class="interpretation">
                <h3>${interpretation.level}</h3>
                <p>${interpretation.description}</p>
              </div>
            ` : ''}

            <!-- RECOMENDACIONES -->
            ${interpretation?.recommendations ? `
              <div class="recommendations">
                <h3>Recomendaciones</h3>
                <p>${interpretation.recommendations}</p>
              </div>
            ` : ''}
          </div>

          <!-- PUNTUACIÓN POR DOMINIOS -->
          ${domainScoresHTML ? `
            <div class="section">
              <h2>Puntuación por Dominios Cognitivos</h2>
              ${domainScoresHTML}
            </div>
          ` : ''}

          <!-- DETALLES DE RESPUESTAS -->
          ${detailHTML ? `
            <div class="section">
              <h2>Detalles de la Evaluación</h2>
              ${detailHTML}
            </div>
          ` : ''}

          <!-- INTERPRETACIÓN CLÍNICA -->
          <div class="section">
            <h2>Guía de Interpretación</h2>
            <div style="margin-bottom: 12px; padding: 10px; border-left: 4px solid #22c55e; background: #f0fdf4;">
              <p style="margin: 0; font-weight: 600; color: #166534;">≥26 puntos: Normal</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803d;">Cognición dentro de límites normales</p>
            </div>
            <div style="margin-bottom: 12px; padding: 10px; border-left: 4px solid #f59e0b; background: #fef3c7;">
              <p style="margin: 0; font-weight: 600; color: #92400e;">18-25 puntos: Deterioro Cognitivo Leve / Demencia Leve</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #a16207;">Requiere evaluación neurológica completa</p>
            </div>
            <div style="padding: 10px; border-left: 4px solid #ef4444; background: #fef2f2;">
              <p style="margin: 0; font-weight: 600; color: #991b1b;">0-17 puntos: Demencia Moderada-Severa</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #b91c1c;">Evaluación neurológica urgente</p>
            </div>
          </div>

          <!-- PIE DE PÁGINA -->
          <div class="footer">
            <p><strong>Escala de Evaluación Cognitiva de Montreal (MoCA)</strong></p>
            <p>Versión 8.1 en Español | www.mocatest.org</p>
            <p style="margin-top: 8px; font-size: 11px;">
              © Z. Nasreddine MD. Reproducido con permiso. Para uso clínico se recomienda certificación oficial.
            </p>
            ${options?.footerNote ? `<p style="margin-top: 8px;">${options.footerNote}</p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};

