import { z } from 'zod';

const BarthelAssessmentSchema = z.object({
  patientData: z.object({
    id: z.string().optional(),
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
    description: z.string(),
    category: z.enum(['autocuidado', 'esfinteres', 'movilidad']),
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

  const scoreNum = typeof score === 'string' ? parseInt(score) : (score || 0);
  
  // Función para obtener recomendaciones terapéuticas
  const getTherapeuticRecommendations = (total: number) => {
    if (total < 21) {
      return {
        level: 'Dependencia Total',
        recommendations: [
          'Cuidados especializados continuos las 24 horas',
          'Plan de atención médica integral multidisciplinario',
          'Soporte familiar extensivo y capacitación de cuidadores',
          'Considerar cuidados paliativos si es apropiado',
          'Evaluación neurológica especializada urgente',
          'Adaptaciones ambientales y tecnológicas de asistencia'
        ],
        frequency: 'Terapia diaria intensiva',
        priority: 'Todas las áreas requieren intervención inmediata'
      };
    } else if (total < 61) {
      return {
        level: 'Dependencia Severa',
        recommendations: [
          'Programa de rehabilitación multidisciplinario intensivo',
          'Terapia ocupacional y fisioterapia 4-5 veces por semana',
          'Evaluación familiar para entrenamiento en técnicas de asistencia',
          'Considerar adaptaciones ambientales y tecnológicas',
          'Soporte psicológico para paciente y familia',
          'Evaluación médica integral y seguimiento estrecho'
        ],
        frequency: 'Terapia 4-5 veces por semana',
        priority: 'Autocuidado y movilidad básica'
      };
    } else if (total < 91) {
      return {
        level: 'Dependencia Moderada',
        recommendations: [
          'Programa de rehabilitación enfocado en áreas deficitarias',
          'Terapia ocupacional y fisioterapia 3-4 veces por semana',
          'Entrenamiento en actividades de la vida diaria',
          'Evaluación de dispositivos de asistencia',
          'Seguimiento médico regular',
          'Apoyo familiar moderado'
        ],
        frequency: 'Terapia 3-4 veces por semana',
        priority: 'Transferencias y deambulación'
      };
    } else if (total < 100) {
      return {
        level: 'Dependencia Leve',
        recommendations: [
          'Programa de mantenimiento y fortalecimiento',
          'Terapia ocupacional 2-3 veces por semana',
          'Ejercicios de equilibrio y coordinación',
          'Evaluación de seguridad en el hogar',
          'Seguimiento médico cada 3-6 meses',
          'Apoyo familiar mínimo'
        ],
        frequency: 'Terapia 2-3 veces por semana',
        priority: 'Equilibrio y escaleras'
      };
    } else {
      return {
        level: 'Independencia Completa',
        recommendations: [
          'Mantener el nivel actual de funcionamiento',
          'Implementar programas de prevención',
          'Ejercicios de mantenimiento 1-2 veces por semana',
          'Revisión periódica cada 6 meses',
          'Educación sobre envejecimiento saludable',
          'Prevención de caídas y lesiones'
        ],
        frequency: 'Mantenimiento 1-2 veces por semana',
        priority: 'Prevención y mantenimiento'
      };
    }
  };

  const therapeuticData = getTherapeuticRecommendations(scoreNum);

  // Categorizar preguntas por dominio funcional
  const categorizedQuestions = {
    autocuidado: questions.filter(q => q.category === 'autocuidado'),
    esfinteres: questions.filter(q => q.category === 'esfinteres'),
    movilidad: questions.filter(q => q.category === 'movilidad')
  };

  const categoryNames = {
    autocuidado: 'AUTOCUIDADO',
    esfinteres: 'CONTROL DE ESFÍNTERES',
    movilidad: 'MOVILIDAD'
  };

  // Generar tabla de resultados categorizada
  let resultsTable = '';
  Object.entries(categorizedQuestions).forEach(([categoryKey, categoryQuestions]) => {
    if (categoryQuestions.length > 0) {
      resultsTable += `<tr class="category-header"><td colspan="3">${categoryNames[categoryKey as keyof typeof categoryNames]}</td></tr>`;
      
      categoryQuestions.forEach(q => {
        const answer = answers?.[q.id];
        if (answer !== undefined) {
          const selectedOption = q.options.find(opt => opt.value === answer);
          if (selectedOption) {
            resultsTable += `
              <tr>
                <td class="activity-name">${q.question}</td>
                <td class="independence-level">${selectedOption.label}</td>
                <td class="score-value">${selectedOption.value} pts</td>
              </tr>
            `;
          }
        }
      });
    }
  });

  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hora = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte Índice de Barthel</title>
        <style>
          @page { 
            size: A4; 
            margin: 10mm 8mm; 
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            color: #000; 
            line-height: 1.3;
            background: white;
            font-size: 10pt;
          }
          .reporte-impresion { 
            max-width: 100%; 
            margin: 0; 
            padding: 8px; 
            background: white;
          }
          
          /* Header profesional */
          .reporte-header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding: 10px 0;
            border-bottom: 2px solid #000;
          }
          .header-content {
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
            margin-bottom: 8px;
          }
          .clinica-logo { 
            font-size: 16pt; 
            font-weight: bold; 
            color: #000;
          }
          .reporte-titulo { 
            font-size: 14pt; 
            font-weight: bold; 
            margin: 4px 0;
            color: #000;
          }
          .fecha-reporte { 
            font-size: 9pt; 
            color: #000;
            font-weight: normal;
          }
          
          /* Secciones compactas para impresión */
          .seccion-paciente, .seccion-resumen, .seccion-tabla, .seccion-recomendaciones, .seccion-clinica { 
            background: white; 
            border: 1px solid #000; 
            padding: 8px; 
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          
          .seccion-titulo { 
            font-size: 11pt; 
            font-weight: bold; 
            color: #000; 
            margin: 0 0 8px; 
            display: flex;
            align-items: center;
            gap: 5px;
            padding-bottom: 4px;
            border-bottom: 1px solid #000;
          }
          
          /* Grid compacto para información del paciente */
          .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr; 
            gap: 6px 12px; 
          }
          .info-campo { 
            display: flex; 
            flex-direction: column;
            gap: 2px; 
            padding: 2px 0;
          }
          .etiqueta { 
            font-weight: bold; 
            color: #000; 
            font-size: 8pt;
            text-transform: uppercase;
          }
          .valor { 
            color: #000; 
            font-weight: normal;
            font-size: 9pt;
          }
          
          /* Cards de resumen */
          .resumen-card { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 8px; 
          }
          .card { 
            background: white; 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: center;
          }
          .card .label { 
            font-size: 7pt; 
            color: #000; 
            text-transform: uppercase; 
            font-weight: bold;
            margin-bottom: 4px; 
          }
          .card .value { 
            font-size: 10pt; 
            font-weight: bold; 
            color: #000;
          }
          
          /* Tabla de resultados */
          table { 
            width: 100%; 
            border-collapse: collapse;
            border: 1px solid #000;
          }
          th, td { 
            padding: 4px 6px; 
            text-align: left; 
            font-size: 8pt;
            border: 1px solid #000;
            vertical-align: top;
          }
          th { 
            background: #f0f0f0; 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
            font-size: 7pt;
          }
          tbody tr:nth-child(even) {
            background-color: #f8f8f8;
          }
          .category-header {
            background: #e0e0e0;
            font-weight: bold;
            text-align: center;
          }
          .activity-name {
            font-weight: bold;
            color: #000;
          }
          .independence-level {
            color: #333;
            font-style: italic;
          }
          .score-value {
            font-weight: bold;
            color: #000;
            text-align: center;
          }
          
          /* Box de recomendaciones */
          .recomendaciones-box { 
            background: #f5f5f5; 
            border: 1px solid #000; 
            padding: 8px; 
            margin-top: 8px; 
            font-size: 8pt; 
            color: #000;
          }
          .recomendaciones-box h4 {
            margin: 0 0 6px 0;
            font-size: 9pt;
            font-weight: bold;
            color: #000;
          }
          .recomendaciones-list {
            margin: 4px 0;
            padding-left: 16px;
          }
          .recomendaciones-list li {
            margin-bottom: 2px;
          }
          
          /* Información clínica */
          .info-clinica { 
            background: #f8f8f8; 
            border: 1px solid #000; 
            padding: 8px; 
            margin-top: 8px; 
            font-size: 8pt; 
            color: #000;
            line-height: 1.4;
          }
          
          /* Firma */
          .firma-area { 
            margin: 20px 0; 
            padding: 10px 0;
          }
          .firma-box {
            text-align: left;
            width: 50%;
          }
          .firma-box .firma-linea { 
            border-bottom: 1px solid #000; 
            height: 40px; 
            margin-bottom: 4px;
          }
          .firma-label { 
            font-size: 8pt; 
            color: #000; 
            font-weight: bold;
            text-transform: uppercase;
          }
          
          /* Footer */
          .disclaimer { 
            font-size: 7pt; 
            color: #333; 
            text-align: justify; 
            border-top: 1px solid #000; 
            padding-top: 8px; 
            margin-top: 15px;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div class="header-content">
              <div class="clinica-logo">Escalas DLM</div>
            </div>
            <div class="reporte-titulo">ÍNDICE DE BARTHEL - Actividades Básicas de la Vida Diaria</div>
            <div class="fecha-reporte">Reporte de Evaluación Funcional - ${fecha}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">Información del Paciente</h2>
            <div class="grid">
              <div class="info-campo"><span class="etiqueta">ID Paciente:</span><span class="valor">${patientData?.id || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Paciente:</span><span class="valor">${patientData?.name || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Edad:</span><span class="valor">${patientData?.age ? `${patientData.age} años` : 'No especificada'}</span></div>
              <div class="info-campo"><span class="etiqueta">Género:</span><span class="valor">${patientData?.gender || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Evaluador:</span><span class="valor">${patientData?.doctorName || 'No especificado'}</span></div>
            </div>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resumen de Evaluación</h2>
            <div class="resumen-card">
              <div class="card"><div class="label">Puntuación Total</div><div class="value">${scoreNum}/100</div></div>
              <div class="card"><div class="label">Nivel de Dependencia</div><div class="value">${therapeuticData.level}</div></div>
              <div class="card"><div class="label">Categoría Funcional</div><div class="value">${interpretation?.result || therapeuticData.level}</div></div>
              <div class="card"><div class="label">Fecha Evaluación</div><div class="value">${fecha}</div></div>
              <div class="card"><div class="label">Hora</div><div class="value">${hora}</div></div>
            </div>
          </section>

          <section class="seccion-tabla">
            <h2 class="seccion-titulo">Resultados Detallados por Dominio Funcional</h2>
            <table>
              <thead>
                <tr>
                  <th>Actividad Evaluada</th>
                  <th>Nivel de Independencia</th>
                  <th>Puntuación</th>
                </tr>
              </thead>
              <tbody>${resultsTable}</tbody>
            </table>
          </section>

          <section class="seccion-recomendaciones">
            <h2 class="seccion-titulo">Recomendaciones Terapéuticas</h2>
            <div class="recomendaciones-box">
              <h4>Nivel de Dependencia: ${therapeuticData.level}</h4>
              <p><strong>Frecuencia de Terapia:</strong> ${therapeuticData.frequency}</p>
              <p><strong>Áreas Prioritarias:</strong> ${therapeuticData.priority}</p>
              <h4>Recomendaciones Específicas:</h4>
              <ul class="recomendaciones-list">
                ${therapeuticData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          </section>

          <section class="seccion-clinica">
            <h2 class="seccion-titulo">Información Clínica de Referencia</h2>
            <div class="info-clinica">
              <p><strong>Índice de Barthel:</strong> Escala de evaluación funcional que mide la capacidad del paciente para realizar actividades básicas de la vida diaria de forma independiente. Puntuación máxima: 100 puntos.</p>
              <p><strong>Puntos de Corte Clínicos:</strong></p>
              <ul style="margin: 4px 0; padding-left: 16px;">
                <li><strong>0-20:</strong> Dependencia total</li>
                <li><strong>21-60:</strong> Dependencia severa</li>
                <li><strong>61-90:</strong> Dependencia moderada</li>
                <li><strong>91-99:</strong> Dependencia leve</li>
                <li><strong>100:</strong> Independencia completa</li>
              </ul>
              <p><strong>Validez y Fiabilidad:</strong> Escala validada internacionalmente con alta confiabilidad inter-evaluador (ICC > 0.95) y excelente validez de constructo.</p>
              <p><strong>Referencia:</strong> Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J 1965;14:61-5</p>
            </div>
          </section>

          <div class="firma-area">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-label">Firma del Evaluador</div>
            </div>
          </div>

          <div class="disclaimer">
            Documento generado automáticamente el ${fecha} a las ${hora}. Este reporte es un registro de evaluación clínica y debe ser interpretado por un profesional de la salud cualificado. Los resultados deben considerarse en el contexto clínico completo del paciente.
            <br><br>
            Generado por Escalas DLM — DeepLux Med | escalas.deeplux.org
            ${options?.footerNote ? `<br>${options.footerNote}` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};