import { z } from 'zod';

const LequesneAssessmentSchema = z.object({
  patientData: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    doctorName: z.string().optional(),
  }),
  totalScore: z.number(),
  answers: z.record(z.number()).optional(),
  interpretation: z.object({
    level: z.string(),
    explanation: z.string(),
    recommendation: z.string(),
  }).optional(),
});

const LequesneRequestSchema = z.object({
  assessment: LequesneAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    description: z.string().optional(),
    options: z.array(z.object({
      value: z.number(),
      label: z.string(),
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

export type LequesnePayload = z.infer<typeof LequesneRequestSchema>;

export const generateHtml = (payload: LequesnePayload): string => {
  const { assessment, scale, questions = [], options } = payload;
  const { patientData, totalScore, answers, interpretation } = assessment;

  let detailHTML = '';
  if (questions && answers) {
    questions.forEach(q => {
      const answer = answers[q.id];
      const option = q.options.find(opt => opt.value === answer);
      detailHTML += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
            <strong>${q.question}</strong><br>
            ${q.description ? `<em style="color: #666; font-size: 12px;">${q.description}</em>` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">
            ${option ? `${option.label} (${answer} puntos)` : 'No respondida'}
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
  <title>Reporte Índice de Lequesne - DeepLuxMed</title>
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
    .score-summary, .interpretation, .recommendation, .results-table { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06); }
    .score-summary h2 { color: #00796B; margin-top: 0; }
    .total-score { font-size: 32px; font-weight: bold; color: #0e7490; }
    .score-range { font-size: 12px; color: #64748b; }
    .interpretation h3, .recommendation h3, .results-table h3 { color: #00796B; margin-top: 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #00796B; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px; color: #666; }
    .footer .logo { font-weight: bold; color: #00796B; font-size: 18px; }
    @media print { body { background: white; padding: 0; } .header, .patient-info, .score-summary, .interpretation, .recommendation, .results-table, .footer { box-shadow: none; border: 1px solid #ddd; margin-bottom: 15px; } }
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
        <div class="info-item"><span class="info-label">ID Paciente:</span><span class="info-value">${patientData?.id || 'No especificado'}</span></div>
        <div class="info-item"><span class="info-label">Nombre:</span><span class="info-value">${patientData?.name || 'No especificado'}</span></div>
        <div class="info-item"><span class="info-label">Edad:</span><span class="info-value">${patientData?.age ? patientData.age + ' años' : 'No especificada'}</span></div>
        <div class="info-item"><span class="info-label">Fecha de Evaluación:</span><span class="info-value">${formattedDate}</span></div>
        <div class="info-item"><span class="info-label">Hora:</span><span class="info-value">${formattedTime}</span></div>
      </div>
    </div>

    <div class="score-summary">
      <h2>Resumen de Puntuación</h2>
      <div class="total-score">${totalScore.toFixed(1)}</div>
      <div class="score-range">de un máximo de 26 puntos</div>
      <p><strong>Interpretación:</strong> ${interpretation?.level || 'No disponible'}</p>
    </div>

    <div class="interpretation">
      <h3>Análisis Clínico</h3>
      <div class="interpretation-text">
        <strong>Nivel de Severidad:</strong> ${interpretation?.level || 'No disponible'}<br>
        <strong>Explicación:</strong> ${interpretation?.explanation || 'No disponible'}
      </div>
    </div>

    <div class="recommendation">
      <h3>Recomendación Clínica</h3>
      <div class="recommendation-text">${interpretation?.recommendation || 'No disponible'}</div>
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
        <tbody>${detailHTML}</tbody>
      </table>
    </div>

    <div class="footer">
      <div class="logo">DeepLuxMed.mx</div>
      <p>Escalas Médicas Digitales</p>
      <p>Reporte generado el ${formattedDate} a las ${formattedTime}</p>
      <p style="font-size: 12px; margin-top: 15px;">Este reporte ha sido generado automáticamente por el sistema de evaluación Lequesne de DeepLuxMed. <br />Para uso clínico profesional únicamente.</p>
    </div>
  </body>
  </html>`;
};

