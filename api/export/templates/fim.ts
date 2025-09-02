import { z } from 'zod';

const FimAssessmentSchema = z.object({
  patientData: z.object({
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    doctorName: z.string().optional(),
  }),
  totalScore: z.number(),
  motorScore: z.number(),
  cognitiveScore: z.number(),
  answers: z.record(z.number()).optional(),
});

const FimRequestSchema = z.object({
  assessment: FimAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.string(),
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

export type FimPayload = z.infer<typeof FimRequestSchema>;

export const generateHtml = (payload: FimPayload): string => {
  const { assessment, scale, questions = [], options } = payload;
  const { patientData, totalScore, motorScore, cognitiveScore, answers } = assessment;
  
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
  } as const;

  let tableRows = '';
  Object.entries(categories).forEach(([categoryKey, categoryName]) => {
    tableRows += `<tr class="category-header-print"><td colspan="2">${categoryName}</td></tr>`;
    questions
      .filter(q => q.category === categoryKey)
      .forEach(q => {
        const score = answers?.[q.id] || 0;
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
          @page { size: A4; margin: 18mm; }
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
              <div class="info-field"><strong>Paciente:</strong> ${patientData?.name || 'No especificado'}</div>
              <div class="info-field"><strong>Edad:</strong> ${patientData?.age ? patientData.age + ' años' : 'No especificada'}</div>
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

