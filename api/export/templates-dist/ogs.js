"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = void 0;
const zod_1 = require("zod");
const OgsAssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        age: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        gender: zod_1.z.string().optional(),
        evaluator: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
    }),
    leftTotalScore: zod_1.z.number(),
    rightTotalScore: zod_1.z.number(),
    leftInterpretation: zod_1.z.object({
        interpretation_level: zod_1.z.string(),
        interpretation_text: zod_1.z.string(),
        color_code: zod_1.z.string(),
    }),
    rightInterpretation: zod_1.z.object({
        interpretation_level: zod_1.z.string(),
        interpretation_text: zod_1.z.string(),
        color_code: zod_1.z.string(),
    }),
    responses: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string(),
        leftScore: zod_1.z.number(),
        rightScore: zod_1.z.number(),
    })).optional(),
});
const OgsRequestSchema = zod_1.z.object({
    assessment: OgsAssessmentSchema,
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        question: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        options: zod_1.z.array(zod_1.z.object({
            option_value: zod_1.z.number(),
            option_label: zod_1.z.string(),
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
    const { patientData, leftTotalScore, rightTotalScore, leftInterpretation, rightInterpretation, responses = [] } = assessment;
    const getScoreColor = (score) => {
        if (score === 3)
            return '#10B981';
        if (score === 2)
            return '#F59E0B';
        if (score === 1)
            return '#F97316';
        return '#EF4444';
    };
    const getScoreBgColor = (score) => {
        if (score === 3)
            return '#D1FAE5';
        if (score === 2)
            return '#FEF3C7';
        if (score === 1)
            return '#FFEDD5';
        return '#FEE2E2';
    };
    let detailHTML = '';
    if (questions && responses) {
        questions.forEach((q, idx) => {
            const response = responses.find(r => r.questionId === q.id);
            const leftScore = response?.leftScore || 0;
            const rightScore = response?.rightScore || 0;
            const leftOption = q.options.find(opt => opt.option_value === leftScore);
            const rightOption = q.options.find(opt => opt.option_value === rightScore);
            const asymmetry = Math.abs(leftScore - rightScore) >= 2;
            detailHTML += `
        <tr style="${asymmetry ? 'background-color: #FEF3C7;' : ''}">
          <td style="padding: 14px 12px; border-bottom: 1px solid #e0e0e0; vertical-align: top; width: 40%;">
            <div style="margin-bottom: 4px;">
              <strong style="color: #00796B; font-size: 14px;">${idx + 1}. ${q.question}</strong>
            </div>
            ${q.description ? `<div style="color: #666; font-size: 11px; font-style: italic; margin-top: 4px;">${q.description}</div>` : ''}
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e0e0e0; vertical-align: middle; width: 30%; background-color: ${getScoreBgColor(rightScore)}; border-left: 3px solid ${getScoreColor(rightScore)};">
            <div style="font-size: 13px; margin-bottom: 6px;">
              ${rightOption ? rightOption.option_label : 'No evaluada'}
            </div>
            <div style="display: inline-block; background-color: ${getScoreColor(rightScore)}; color: white; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: bold;">
              ${rightScore} pts
            </div>
          </td>
          <td style="padding: 14px 12px; border-bottom: 1px solid #e0e0e0; vertical-align: middle; width: 30%; background-color: ${getScoreBgColor(leftScore)}; border-left: 3px solid ${getScoreColor(leftScore)};">
            <div style="font-size: 13px; margin-bottom: 6px;">
              ${leftOption ? leftOption.option_label : 'No evaluada'}
            </div>
            <div style="display: inline-block; background-color: ${getScoreColor(leftScore)}; color: white; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: bold;">
              ${leftScore} pts
            </div>
          </td>
        </tr>
        ${asymmetry ? `
        <tr style="background-color: #FEF3C7;">
          <td colspan="3" style="padding: 8px 12px; border-bottom: 2px solid #F59E0B; font-size: 12px;">
            <strong style="color: #92400E;">⚠️ Asimetría significativa:</strong>
            <span style="color: #92400E;"> Diferencia de ${Math.abs(leftScore - rightScore)} puntos entre extremidades</span>
          </td>
        </tr>` : ''}`;
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
  <title>Reporte OGS - Escalas DLM</title>
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
        <div class="score-range">de 21 puntos</div>
        <div class="score-badge" style="background-color: ${rightInterpretation.color_code};">${rightInterpretation.interpretation_level}</div>
        <div class="score-description">${rightInterpretation.interpretation_text}</div>
      </div>
      <div class="score-card left">
        <div class="score-title">Pierna Izquierda</div>
        <div class="score-value" style="color: #10b981;">${leftTotalScore}</div>
        <div class="score-range">de 21 puntos</div>
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
    <h3>Evaluación Detallada por Parámetro</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 40%; text-align: left;">Parámetro de Marcha</th>
          <th style="width: 30%; text-align: center; background-color: #DBEAFE;">Pierna Derecha</th>
          <th style="width: 30%; text-align: center; background-color: #D1FAE5;">Pierna Izquierda</th>
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

  ${(() => {
        // Generar recomendaciones basadas en hallazgos
        const totalAsymmetries = responses.filter(r => Math.abs(r.leftScore - r.rightScore) >= 2).length;
        const criticalRight = responses.filter(r => r.rightScore <= 1).length;
        const criticalLeft = responses.filter(r => r.leftScore <= 1).length;
        const avgRight = rightTotalScore / 7;
        const avgLeft = leftTotalScore / 7;
        return `
    <div class="clinical-note" style="background: #EFF6FF; border: 1px solid #3B82F6; margin-top: 20px;">
      <h3 style="color: #1E40AF; margin-top: 0; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
        📋 Recomendaciones Terapéuticas
      </h3>

      ${totalAsymmetries > 0 ? `
        <div style="background: #FEF3C7; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #F59E0B;">
          <h4 style="color: #92400E; margin: 0 0 8px 0;">⚠️ Asimetría Bilateral Detectada</h4>
          <p style="color: #92400E; margin: 0;">
            <strong>${totalAsymmetries} parámetro(s)</strong> muestran diferencias significativas entre extremidades (≥2 puntos).
            Esto sugiere afectación asimétrica que requiere atención especializada.
          </p>
        </div>
      ` : ''}

      <div style="margin-bottom: 15px;">
        <h4 style="color: #1E40AF; margin-bottom: 8px;">Sugerencias de Manejo:</h4>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          ${avgLeft < 1.5 || avgRight < 1.5 ? `
            <li><strong>Fisioterapia intensiva:</strong> 4-5 sesiones semanales enfocadas en marcha y equilibrio</li>
            <li><strong>Evaluación ortopédica:</strong> Considerar férulas AFO (ankle-foot orthosis) para estabilización</li>
            <li><strong>Valoración para toxina botulínica:</strong> Si hay espasticidad asociada</li>
          ` : avgLeft < 2.5 || avgRight < 2.5 ? `
            <li><strong>Fisioterapia regular:</strong> 3-4 sesiones semanales con énfasis en corrección de marcha</li>
            <li><strong>Evaluación de ortesis:</strong> Considerar dispositivos de asistencia según necesidad</li>
            <li><strong>Entrenamiento funcional:</strong> Ejercicios de marcha en diferentes superficies</li>
          ` : `
            <li><strong>Mantenimiento:</strong> Fisioterapia 2-3 veces por semana</li>
            <li><strong>Ejercicios en casa:</strong> Programa de fortalecimiento y estiramiento</li>
            <li><strong>Seguimiento periódico:</strong> Reevaluación cada 3-6 meses</li>
          `}
        </ul>
      </div>

      ${criticalLeft > 0 || criticalRight > 0 ? `
        <div style="background: #FEE2E2; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #EF4444;">
          <h4 style="color: #991B1B; margin: 0 0 8px 0;">🔴 Áreas Críticas Identificadas</h4>
          <p style="color: #991B1B; margin: 0;">
            ${criticalRight > 0 ? `<strong>Derecha:</strong> ${criticalRight} parámetro(s) severamente afectado(s). ` : ''}
            ${criticalLeft > 0 ? `<strong>Izquierda:</strong> ${criticalLeft} parámetro(s) severamente afectado(s).` : ''}
            <br>Se recomienda evaluación multidisciplinaria urgente.
          </p>
        </div>
      ` : ''}

      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #BFDBFE;">
        <h4 style="color: #1E40AF; margin-bottom: 8px;">Próximos Pasos:</h4>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Correlacionar hallazgos con nivel GMFCS si aplica</li>
          <li>Evaluación de espasticidad (escala Ashworth modificada)</li>
          <li>Análisis de marcha instrumentado si está disponible</li>
          <li>Reevaluación con OGS en 3-6 meses para monitorear progreso</li>
        </ol>
      </div>
    </div>
    `;
    })()}

  <div class="footer">
    <div class="logo">escalas.deeplux.org</div>
    <p>Escalas Médicas Digitales</p>
    <p>Reporte generado el ${formattedDate} a las ${formattedTime}</p>
    <p style="font-size: 12px; margin-top: 15px;">Este reporte ha sido generado automáticamente por Escalas DLM — DeepLux Med. <br />Para uso clínico profesional únicamente.</p>
  </div>
</body>
</html>`;
};
exports.generateHtml = generateHtml;
