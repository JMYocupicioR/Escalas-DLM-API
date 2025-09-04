"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = void 0;
const zod_1 = require("zod");
const BarthelAssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        age: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        gender: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
    }),
    score: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    interpretation: zod_1.z.object({
        result: zod_1.z.string(),
        explanation: zod_1.z.string(),
        color: zod_1.z.string(),
    }).optional(),
    answers: zod_1.z.record(zod_1.z.number()).optional(),
});
const BarthelRequestSchema = zod_1.z.object({
    assessment: BarthelAssessmentSchema,
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        question: zod_1.z.string(),
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
            <p><strong>ID Paciente:</strong> ${patientData?.id || 'No especificado'}</p>
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
exports.generateHtml = generateHtml;
