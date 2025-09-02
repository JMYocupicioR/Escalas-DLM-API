import { z } from 'zod';

const BarthelAssessmentSchema = z.object({
  patientData: z.object({
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    doctorName: z.string().optional(),
  }),
  score: z.union([z.number(), z.string()]).optional(),
  interpretation: z.object({
    result: z.string(),
    explanation: z.string(),
    color: z.string(),
  }).optional(),
  answers: z.record(z.number()).optional(),
});

const BarthelRequestSchema = z.object({
  assessment: BarthelAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.object({
      value: z.number(),
      label: z.string(),
      description: z.string(),
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

export type BarthelPayload = z.infer<typeof BarthelRequestSchema>;

export const generateHtml = (payload: BarthelPayload): string => {
  const { assessment, scale, questions = [], options } = payload;
  const { patientData, score, interpretation, answers } = assessment;

  let detailHTML = '';
  if (questions && answers) {
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const selectedOption = q.options.find(opt => opt.value === answer);
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
  }

  const today = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Resultados Escala de Barthel</title>
        <style>
          @page { size: A4; margin: 18mm; }
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .result { font-size: 24px; color: ${interpretation?.color || '#0891b2'}; }
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
            <p><strong>Nombre:</strong> ${patientData?.name || 'No especificado'}</p>
            <p><strong>Edad:</strong> ${patientData?.age || 'No especificada'}</p>
            <p><strong>Género:</strong> ${patientData?.gender || 'No especificado'}</p>
            <p><strong>Médico/Evaluador:</strong> ${patientData?.doctorName || 'No especificado'}</p>
          </div>
          <div class="section">
            <h2>Puntuación Total: ${score}/100</h2>
            <p class="result">${interpretation?.result || ''}</p>
            <p>${interpretation?.explanation || ''}</p>
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

