import { z } from 'zod';

const OgsAssessmentSchema = z.object({
  patientData: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    evaluator: z.string().optional(),
    date: z.string().optional(),
  }),
  leftTotalScore: z.number(),
  rightTotalScore: z.number(),
  leftInterpretation: z.object({
    interpretation_level: z.string(),
    interpretation_text: z.string(),
    color_code: z.string(),
  }),
  rightInterpretation: z.object({
    interpretation_level: z.string(),
    interpretation_text: z.string(),
    color_code: z.string(),
  }),
  responses: z.array(z.object({
    questionId: z.string(),
    leftScore: z.number(),
    rightScore: z.number(),
  })).optional(),
});

const OgsRequestSchema = z.object({
  assessment: OgsAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    description: z.string().optional(),
    options: z.array(z.object({
      option_value: z.number(),
      option_label: z.string(),
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

export type OgsPayload = z.infer<typeof OgsRequestSchema>;

export const generateHtml = (payload: OgsPayload): string => {
  const { assessment, scale, questions = [], options } = payload;
  const { patientData, leftTotalScore, rightTotalScore, leftInterpretation, rightInterpretation, responses = [] } = assessment;

  let detailHTML = '';
  if (questions && responses) {
    questions.forEach(q => {
      const response = responses.find(r => r.questionId === q.id);
      const leftScore = response?.leftScore || 0;
      const rightScore = response?.rightScore || 0;
      
      const leftOption = q.options.find(opt => opt.option_value === leftScore);
      const rightOption = q.options.find(opt => opt.option_value === rightScore);
      
      detailHTML += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; vertical-align: top;">
            <strong>${q.question}</strong><br>
            ${q.description ? `<em style="color: #666; font-size: 12px;">${q.description}</em>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; background-color: #f8f9fa;">
            <div style="margin-bottom: 8px;">
              <strong>Derecha:</strong><br>
              ${rightOption ? `${rightOption.option_label} (${rightScore} pts)` : 'No evaluada'}
            </div>
            <div>
              <strong>Izquierda:</strong><br>
              ${leftOption ? `${leftOption.option_label} (${leftScore} pts)` : 'No evaluada'}
            </div>
          </td>
        </tr>`;
    });
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES');
  const formattedTime = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte OGS - DeepLuxMed</title>
  <style>
    @page { size: A4; margin: 18mm; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { text-align: center; background: linear-gradient(135deg, #00796B 0%, #004D40 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
    .header .subtitle { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
    .patient-info { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
    .patient-info h2 { color: #00796B; margin-top: 0; border-bottom: 2px solid #00796B; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .info-label { font-weight: 600; color: #555; }
    .info-value { color: #333; }
    .score-summary { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); }
    .score-summary h2 { color: #00796B; margin-top: 0; text-align: center; }
    .scores-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .score-card { text-align: center; padding: 20px; border-radius: 8px; border: 2px solid #e0e0e0; }
    .score-card.right { border-color: #3b82f6; }
    .score-card.left { border-color: #10b981; }
    .score-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #333; }
    .score-value { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
    .score-range { font-size: 14px; color: #666; margin-bottom: 15px; }
    .score-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; }
    .score-description { font-size: 14px; color: #666; margin-top: 10px; }
    .interpretation { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); }
    .interpretation h3 { color: #00796B; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
    .results-table { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); }
    .results-table h3 { color: #00796B; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #00796B; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px; color: #666; }
    .footer .logo { font-weight: bold; color: #00796B; font-size: 18px; }
    .clinical-note { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .clinical-note h4 { color: #856404; margin-top: 0; }
    .clinical-note p { color: #856404; margin: 0; }
    @media print { 
      body { background: white; padding: 0; } 
      .header, .patient-info, .score-summary, .interpretation, .results-table, .footer { box-shadow: none; border: 1px solid #ddd; margin-bottom: 15px; } 
      .scores-container { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Observational Gait Scale (OGS)</h1>
    <p class="subtitle">Evaluación Cualitativa de Parámetros de la Marcha</p>
  </div>

  <div class="patient-info">
    <h2>Información del Paciente</h2>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Nombre:</span><span class="info-value">${patientData?.name || 'No especificado'}</span></div>
      <div class="info-item"><span class="info-label">Edad:</span><span class="info-value">${patientData?.age ? patientData.age + ' años' : 'No especificada'}</span></div>
      <div class="info-item"><span class="info-label">Género:</span><span class="info-value">${patientData?.gender || 'No especificado'}</span></div>
      <div class="info-item"><span class="info-label">Evaluador:</span><span class="info-value">${patientData?.evaluator || 'No especificado'}</span></div>
      <div class="info-item"><span class="info-label">Fecha:</span><span class="info-value">${formattedDate}</span></div>
      <div class="info-item"><span class="info-label">Hora:</span><span class="info-value">${formattedTime}</span></div>
    </div>
  </div>

  <div class="score-summary">
    <h2>Puntuaciones por Extremidad</h2>
    <div class="scores-container">
      <div class="score-card right">
        <div class="score-title">Pierna Derecha</div>
        <div class="score-value" style="color: #3b82f6;">${rightTotalScore}</div>
        <div class="score-range">de 22 puntos</div>
        <div class="score-badge" style="background-color: ${rightInterpretation.color_code};">${rightInterpretation.interpretation_level}</div>
        <div class="score-description">${rightInterpretation.interpretation_text}</div>
      </div>
      <div class="score-card left">
        <div class="score-title">Pierna Izquierda</div>
        <div class="score-value" style="color: #10b981;">${leftTotalScore}</div>
        <div class="score-range">de 22 puntos</div>
        <div class="score-badge" style="background-color: ${leftInterpretation.color_code};">${leftInterpretation.interpretation_level}</div>
        <div class="score-description">${leftInterpretation.interpretation_text}</div>
      </div>
    </div>
  </div>

  <div class="clinical-note">
    <h4>📋 Nota Clínica Importante</h4>
    <p>La interpretación clínica debe centrarse en el perfil de puntuaciones de cada ítem, no solo en el total. Analice los patrones específicos de alteración para cada extremidad y considere la asimetría entre ambas piernas.</p>
  </div>

  <div class="results-table">
    <h3>Evaluación Detallada por Ítem</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 60%">Parámetro de Marcha</th>
          <th style="width: 40%">Puntuación por Extremidad</th>
        </tr>
      </thead>
      <tbody>${detailHTML}</tbody>
    </table>
  </div>

  <div class="interpretation">
    <h3>Análisis Clínico</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h4 style="color: #3b82f6; margin-bottom: 10px;">Pierna Derecha</h4>
        <p><strong>Nivel:</strong> ${rightInterpretation.interpretation_level}</p>
        <p><strong>Interpretación:</strong> ${rightInterpretation.interpretation_text}</p>
      </div>
      <div>
        <h4 style="color: #10b981; margin-bottom: 10px;">Pierna Izquierda</h4>
        <p><strong>Nivel:</strong> ${leftInterpretation.interpretation_level}</p>
        <p><strong>Interpretación:</strong> ${leftInterpretation.interpretation_text}</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="logo">DeepLuxMed.mx</div>
    <p>Escalas Médicas Digitales</p>
    <p>Reporte generado el ${formattedDate} a las ${formattedTime}</p>
    <p style="font-size: 12px; margin-top: 15px;">Este reporte ha sido generado automáticamente por el sistema de evaluación OGS de DeepLuxMed. <br />Para uso clínico profesional únicamente.</p>
  </div>
</body>
</html>`;
};
