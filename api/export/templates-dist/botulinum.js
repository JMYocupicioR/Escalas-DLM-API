"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtml = void 0;
const zod_1 = require("zod");
const BotulinumAssessmentSchema = zod_1.z.object({
    medico: zod_1.z.string().optional(),
    pacienteNombre: zod_1.z.string().optional(),
    pacienteEdad: zod_1.z.string().optional(),
    pacientePeso: zod_1.z.string().optional(),
    marca: zod_1.z.string(),
    musculos: zod_1.z.array(zod_1.z.object({
        lado: zod_1.z.string(),
        nombre: zod_1.z.string(),
        dosisBase: zod_1.z.number(),
        dosisAjustada: zod_1.z.number(),
        opcionDosis: zod_1.z.string(),
    })),
    totalDosisAjustada: zod_1.z.number(),
    advertencia: zod_1.z.string().optional(),
    dilucion: zod_1.z.string(),
});
const BotulinumRequestSchema = zod_1.z.object({
    assessment: BotulinumAssessmentSchema,
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    puntosMotoresData: zod_1.z.record(zod_1.z.string()).optional(),
    dosisDataComplete: zod_1.z.object({
        Dysport: zod_1.z.record(zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() })),
        Botox: zod_1.z.record(zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() })),
        Xeomin: zod_1.z.record(zod_1.z.object({ min: zod_1.z.number(), max: zod_1.z.number() })),
    }).optional(),
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
// SVG icon
const appIconSvg = `<svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0891b2;" />
      <stop offset="100%" style="stop-color:#06b6d4;" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#iconGradient)"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
  <path d="M32 50 L45 63 L68 40" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const generateHtml = (payload) => {
    const { assessment, scale, puntosMotoresData = {}, dosisDataComplete } = payload;
    const { medico, pacienteNombre, pacienteEdad, pacientePeso, marca, musculos, totalDosisAjustada, advertencia, dilucion } = assessment;
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const toxinaInfo = {
        'Dysport': 'Dysport (Abobotulinumtoxina A)',
        'Botox': 'Botox (Onabotulinumtoxina A)',
        'Xeomin': 'Xeomin (Incobotulinumtoxina A)'
    };
    const uiFrasco = marca === 'Dysport' ? 500 : 100;
    const totalBase = musculos.reduce((total, m) => total + (m.dosisBase || 0), 0);
    const getPuntoMotor = (musculo) => {
        return puntosMotoresData[musculo] || 'Referencia anatómica no disponible para este músculo. Consulte literatura especializada.';
    };
    const getDosisRange = (musculo, marcaSel) => {
        return dosisDataComplete?.[marcaSel]?.[musculo] || { min: 0, max: 0 };
    };
    const musculosRows = musculos
        .map((m) => {
        const range = getDosisRange(m.nombre, marca);
        const seleccion = m.opcionDosis === 'min' ? 'Mínima' : 'Máxima';
        return `
    <tr>
      <td>${m.lado}</td>
      <td class="musculo-nombre">${m.nombre}</td>
      <td class="referencias">
        <div class="rango-info">${range.min}-${range.max} U</div>
        <div class="seleccion-info">${seleccion} (${m.dosisBase} U)</div>
      </td>
      <td class="dosis-ajustada">${m.dosisAjustada} U</td>
      <td class="ml-aplicar">${((m.dosisAjustada / uiFrasco) * parseFloat(dilucion)).toFixed(2)} ml</td>
    </tr>`;
    })
        .join('');
    return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte de Dosis de Toxina Botulínica</title>
        <style>
          @page { size: A4; margin: 18mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; color: #111827; }
          .reporte-impresion { max-width: 820px; margin: 0 auto; padding: 16px; }
          .reporte-header { text-align: center; margin-bottom: 10px; }
          .clinica-logo { font-size: 18pt; font-weight: 800; color: #0e7490; letter-spacing: 0.5px; }
          .reporte-titulo { font-size: 16pt; font-weight: 700; margin-top: 6px; }
          .fecha-reporte { font-size: 10pt; color: #64748b; }
          .seccion-paciente, .seccion-resumen, .seccion-tabla, .seccion-notas { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
          .seccion-titulo { font-size: 12pt; font-weight: 700; color: #0e7490; margin: 0 0 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
          .info-campo { display: flex; gap: 6px; }
          .etiqueta { font-weight: 600; color: #334155; }
          .valor { color: #111827; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 10pt; }
          th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
          .resumen-card { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; }
          .card .label { font-size: 9pt; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .card .value { font-size: 14pt; font-weight: 700; color: #0e7490; }
          .advertencia-limites { background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 10px; margin-top: 10px; font-size: 10pt; color: #b45309; font-weight: 600; }
          .firma-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 22px 0; }
          .firma-box .firma-linea { border-bottom: 1px solid #333; height: 50px; margin-bottom: 5px; }
          .firma-label { font-size: 9pt; color: #666; text-align: center; }
          .disclaimer { font-size: 8pt; color: #666; text-align: justify; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 40px; height: 40px;">${appIconSvg}</div>
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Reporte de Dosis de Toxina Botulínica</div>
            <div class="fecha-reporte">${fecha}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">Información del Paciente</h2>
            <div class="grid">
              <div class="info-campo"><span class="etiqueta">Nombre:</span><span class="valor">${pacienteNombre || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Edad:</span><span class="valor">${pacienteEdad || 'No especificada'}</span></div>
              <div class="info-campo"><span class="etiqueta">Peso:</span><span class="valor">${pacientePeso || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Médico:</span><span class="valor">${medico || 'No especificado'}</span></div>
            </div>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resumen</h2>
            <div class="resumen-card">
              <div class="card"><div class="label">Marca</div><div class="value">${toxinaInfo[marca] || marca}</div></div>
              <div class="card"><div class="label">Dilución</div><div class="value">${dilucion} ml</div></div>
              <div class="card"><div class="label">Dosis Base Total</div><div class="value">${totalBase} U</div></div>
              <div class="card"><div class="label">Dosis Total Ajustada</div><div class="value">${totalDosisAjustada} U</div></div>
            </div>
            ${advertencia ? `<div class="advertencia-limites">${advertencia}</div>` : ''}
          </section>

          <section class="seccion-tabla">
            <h2 class="seccion-titulo">Plan de Inyección</h2>
            <table>
              <thead>
                <tr>
                  <th>Lado</th>
                  <th>Músculo</th>
                  <th>Rango / Selección</th>
                  <th>Dosis Ajustada</th>
                  <th>ml a aplicar</th>
                </tr>
              </thead>
              <tbody>${musculosRows}</tbody>
            </table>
          </section>

          <section class="seccion-notas">
            <h2 class="seccion-titulo">Notas</h2>
            <p style="margin: 0; line-height: 1.5;">Las dosis fueron ajustadas en función de la edad y el peso cuando corresponde. Verifique la técnica, puntos motores y contraindicaciones antes de la aplicación.</p>
          </section>

          <div class="firma-area">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-label">Firma del Médico</div>
            </div>
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-label">Vo. Bo.</div>
            </div>
          </div>

          <div class="disclaimer">
            Documento generado automáticamente en ${fecha}. Información con fines clínicos; confirmar siempre con guías actualizadas y ficha técnica del producto.
          </div>
        </div>
      </body>
    </html>`;
};
exports.generateHtml = generateHtml;
