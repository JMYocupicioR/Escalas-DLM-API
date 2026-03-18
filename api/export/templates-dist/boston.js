"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = exports.BostonAssessmentSchema = void 0;
const zod_1 = require("zod");
// Schema de validación para los datos de la escala de Boston
exports.BostonAssessmentSchema = zod_1.z.object({
    patientData: zod_1.z.object({
        name: zod_1.z.string().optional(),
        age: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        dominantHand: zod_1.z.string().optional(),
        affectedHand: zod_1.z.string().optional(),
        duration: zod_1.z.string().optional(),
        doctorName: zod_1.z.string().optional(),
    }),
    symptomsAnswers: zod_1.z.record(zod_1.z.number()),
    functionAnswers: zod_1.z.record(zod_1.z.number()),
    symptomsScore: zod_1.z.number(),
    functionalScore: zod_1.z.number(),
    symptomsInterpretation: zod_1.z.string(),
    functionalInterpretation: zod_1.z.string(),
    date: zod_1.z.string().optional(),
});
const generateHtml = (assessment) => {
    const { patientData, symptomsScore, functionalScore, symptomsInterpretation, functionalInterpretation, date } = assessment;
    const currentDate = date || new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cuestionario del Túnel Carpiano de Boston (BCTSQ)</title>
        <style>
          @page { size: A4; margin: 10mm 8mm; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; color: #000; line-height: 1.3;
            background: white; font-size: 10pt;
          }
          .reporte-impresion { 
            max-width: 100%; margin: 0; padding: 8px; background: white;
          }
          .reporte-header { 
            text-align: center; margin-bottom: 15px; padding: 10px 0;
            border-bottom: 2px solid #000;
          }
          .clinica-logo { font-size: 16pt; font-weight: bold; color: #000; }
          .reporte-titulo { 
            font-size: 14pt; font-weight: bold; margin: 4px 0; color: #000;
          }
          .fecha-reporte { font-size: 9pt; color: #000; font-weight: normal; }
          
          .seccion-paciente, .seccion-resumen, .seccion-notas { 
            background: white; border: 1px solid #000; padding: 8px; 
            margin-bottom: 10px; page-break-inside: avoid;
          }
          .seccion-titulo { 
            font-size: 11pt; font-weight: bold; color: #000; margin: 0 0 8px; 
            display: flex; align-items: center; gap: 5px; padding-bottom: 4px;
            border-bottom: 1px solid #000;
          }
          
          .grid { 
            display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 12px; 
          }
          .info-campo { 
            display: flex; flex-direction: column; gap: 2px; padding: 2px 0;
          }
          .etiqueta { 
            font-weight: bold; color: #000; font-size: 8pt; text-transform: uppercase;
          }
          .valor { color: #000; font-weight: normal; font-size: 9pt; }
          
          .resultado-destacado {
            background: #f0f9ff; border: 2px solid #0891b2; padding: 12px;
            border-radius: 8px; margin: 16px 0; text-align: center;
          }
          .puntuacion { 
            font-size: 18pt; font-weight: bold; color: #0891b2; margin-bottom: 8px;
          }
          .interpretacion { font-size: 12pt; font-weight: 600; color: #000; }
          
          .subescalas-container {
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;
          }
          .subescala {
            border: 1px solid #000; padding: 12px; border-radius: 8px;
          }
          .subescala-titulo {
            font-size: 10pt; font-weight: bold; margin-bottom: 8px;
            border-bottom: 1px solid #000; padding-bottom: 4px;
          }
          .subescala-score {
            font-size: 16pt; font-weight: bold; color: #0891b2; margin-bottom: 4px;
          }
          .subescala-interpretacion {
            font-size: 9pt; color: #000;
          }
          
          .firma-area { margin: 20px 0; padding: 10px 0; }
          .firma-box { text-align: left; width: 50%; }
          .firma-linea { 
            border-bottom: 1px solid #000; height: 40px; margin-bottom: 4px;
          }
          .firma-label { 
            font-size: 8pt; color: #000; font-weight: bold; text-transform: uppercase;
          }
          .disclaimer { 
            font-size: 7pt; color: #333; text-align: justify; 
            border-top: 1px solid #000; padding-top: 8px; margin-top: 15px;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div class="clinica-logo">Escalas DLM</div>
            <div class="reporte-titulo">Cuestionario del Túnel Carpiano de Boston (BCTSQ)</div>
            <div class="fecha-reporte">${currentDate}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">Datos del Paciente</h2>
            <div class="grid">
              <div class="info-campo">
                <div class="etiqueta">Nombre</div>
                <div class="valor">${patientData.name || 'No especificado'}</div>
              </div>
              <div class="info-campo">
                <div class="etiqueta">Edad</div>
                <div class="valor">${patientData.age || 'No especificada'}</div>
              </div>
              <div class="info-campo">
                <div class="etiqueta">Género</div>
                <div class="valor">${patientData.gender || 'No especificado'}</div>
              </div>
              <div class="info-campo">
                <div class="etiqueta">Mano Dominante</div>
                <div class="valor">${patientData.dominantHand || 'No especificada'}</div>
              </div>
              <div class="info-campo">
                <div class="etiqueta">Mano Afectada</div>
                <div class="valor">${patientData.affectedHand || 'No especificada'}</div>
              </div>
              <div class="info-campo">
                <div class="etiqueta">Médico</div>
                <div class="valor">${patientData.doctorName || 'No especificado'}</div>
              </div>
            </div>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resultados por Subescala</h2>
            <div class="subescalas-container">
              <div class="subescala">
                <div class="subescala-titulo">Escala de Severidad de Síntomas (SSS)</div>
                <div class="subescala-score">${symptomsScore.toFixed(2)}</div>
                <div class="subescala-interpretacion">${symptomsInterpretation}</div>
              </div>
              <div class="subescala">
                <div class="subescala-titulo">Escala de Estado Funcional (FSS)</div>
                <div class="subescala-score">${functionalScore.toFixed(2)}</div>
                <div class="subescala-interpretacion">${functionalInterpretation}</div>
              </div>
            </div>
          </section>

          <section class="seccion-notas">
            <h2 class="seccion-titulo">Interpretación Clínica</h2>
            <p style="margin: 0; line-height: 1.3; font-size: 8pt;">
              <strong>Escala de Severidad de Síntomas (SSS):</strong> Evalúa la intensidad y frecuencia de los síntomas 
              del síndrome del túnel carpiano. Puntuaciones más altas indican síntomas más severos.
            </p>
            <br>
            <p style="margin: 0; line-height: 1.3; font-size: 8pt;">
              <strong>Escala de Estado Funcional (FSS):</strong> Evalúa la dificultad para realizar actividades 
              de la vida diaria. Puntuaciones más altas indican mayor limitación funcional.
            </p>
            <br>
            <p style="margin: 0; line-height: 1.3; font-size: 8pt;">
              Este reporte debe ser interpretado por un profesional médico en el contexto clínico apropiado.
            </p>
          </section>

          <div class="firma-area">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-label">Firma del Médico</div>
            </div>
          </div>

          <div class="disclaimer">
            Documento generado automáticamente en ${currentDate}. 
            Cuestionario del Túnel Carpiano de Boston (BCTSQ) - Información con fines clínicos.
          </div>
        </div>
      </body>
    </html>`;
};
exports.generateHtml = generateHtml;
