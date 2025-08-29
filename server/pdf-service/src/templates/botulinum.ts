import { z } from 'zod';

const BotulinumAssessmentSchema = z.object({
  medico: z.string().optional(),
  pacienteNombre: z.string().optional(),
  pacienteEdad: z.string().optional(),
  pacientePeso: z.string().optional(),
  marca: z.string(),
  musculos: z.array(z.object({
    lado: z.string(),
    nombre: z.string(),
    dosisBase: z.number(),
    dosisAjustada: z.number(),
    opcionDosis: z.string(),
  })),
  totalDosisAjustada: z.number(),
  advertencia: z.string().optional(),
  dilucion: z.string(),
});

const BotulinumRequestSchema = z.object({
  assessment: BotulinumAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
  puntosMotoresData: z.record(z.string()).optional(),
  dosisDataComplete: z.object({
    Dysport: z.record(z.object({ min: z.number(), max: z.number() })),
    Botox: z.record(z.object({ min: z.number(), max: z.number() })),
    Xeomin: z.record(z.object({ min: z.number(), max: z.number() })),
  }).optional(),
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

export type BotulinumPayload = z.infer<typeof BotulinumRequestSchema>;

// SVG del icono como string optimizado para PDF
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

export const generateHtml = (payload: BotulinumPayload): string => {
  const { assessment, scale, puntosMotoresData = {}, dosisDataComplete, options } = payload;
  const {
    medico,
    pacienteNombre,
    pacienteEdad,
    pacientePeso,
    marca,
    musculos,
    totalDosisAjustada,
    advertencia,
    dilucion
  } = assessment;

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

  // Función para obtener punto motor usando todos los datos disponibles
  const getPuntoMotor = (musculo: string) => {
    return puntosMotoresData[musculo] || "Referencia anatómica no disponible para este músculo. Consulte literatura especializada.";
  };

  // Obtener datos de dosis para mostrar rangos
  const getDosisRange = (musculo: string, marca: string) => {
    return dosisDataComplete?.[marca as keyof typeof dosisDataComplete]?.[musculo] || { min: 0, max: 0 };
  };

  const musculosRows = musculos
    .map(
      (m) => {
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
    </tr>
  `;
      }
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte de Dosis de Toxina Botulínica</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #fff;
            line-height: 1.4;
          }
          .reporte-impresion {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            box-sizing: border-box;
            background: white;
          }
          .reporte-header {
            text-align: center;
            border-bottom: 2px solid #00796b;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .clinica-logo {
            font-size: 22pt;
            font-weight: bold;
            color: #00796b;
          }
          .reporte-titulo {
            font-size: 16pt;
            font-weight: normal;
            color: #333;
          }
          .fecha-reporte {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
          }
          .seccion-paciente, .seccion-tratamiento, .seccion-resumen {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .seccion-titulo {
            font-size: 14pt;
            font-weight: bold;
            color: #00796b;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .paciente-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .tratamiento-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
          }
          .info-campo {
            display: flex;
            align-items: baseline;
          }
          .etiqueta {
            font-weight: bold;
            min-width: 60px;
            margin-right: 5px;
          }
          .valor {
            border-bottom: 1px dotted #999;
            flex-grow: 1;
            padding-bottom: 1px;
          }
          .toxina-info {
            font-size: 11pt;
          }
          .toxina-nombre {
            font-weight: bold;
            font-size: 12pt;
            color: #333;
          }
          .tabla-musculos {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .tabla-musculos thead {
            background-color: #00796b;
            color: white;
          }
          .tabla-musculos th, .tabla-musculos td {
            padding: 10px;
            text-align: left;
            border: 1px solid #e0e0e0;
          }
          .tabla-musculos th {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          .tabla-musculos tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .musculo-nombre {
            font-weight: bold;
          }
          .referencias, .dosis-ajustada, .ml-aplicar {
            text-align: center;
          }
          .referencias {
            font-size: 9pt;
          }
          .rango-info {
            font-weight: bold;
            color: #00796b;
            margin-bottom: 2px;
          }
          .seleccion-info {
            color: #666;
            font-style: italic;
          }
          .fila-total {
            background-color: #e0f2f1 !important;
            font-weight: bold;
          }
          .totales-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .total-item {
            text-align: center;
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #c8e6c9;
          }
          .total-label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .total-valor {
            font-size: 15pt;
            font-weight: bold;
            color: #2e7d32;
          }
          .advertencia-limites {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 10px;
            margin-top: 15px;
            font-size: 10pt;
            color: #e65100;
            font-weight: bold;
          }
          .reporte-pie {
            border-top: 2px solid #00796b;
            padding-top: 15px;
            margin-top: 25px;
          }
          .firma-area {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .firma-box .firma-linea {
            border-bottom: 1px solid #333;
            height: 50px;
            margin-bottom: 5px;
          }
          .firma-label {
            font-size: 9pt;
            color: #666;
            text-align: center;
          }
          .info-medico {
            text-align: center;
            margin-bottom: 20px;
          }
          .disclaimer {
            font-size: 8pt;
            color: #666;
            text-align: justify;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 20px;
          }
          .page-break {
            page-break-before: always;
          }
          .seccion-puntos-motores {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .punto-motor-item {
            background-color: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .musculo-titulo {
            color: #00796b;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 2px solid #c8e6c9;
            padding-bottom: 5px;
          }
          .punto-motor-descripcion {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          .punto-motor-descripcion p {
            margin: 0;
            text-align: justify;
            font-size: 10pt;
            color: #333;
          }
          .dosis-info-pequena {
            background-color: #e8f5e8;
            padding: 8px;
            border-radius: 4px;
            font-size: 9pt;
            color: #2e7d32;
            border-left: 3px solid #4caf50;
          }
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
            <div class="paciente-info">
              <div class="info-campo">
                <span class="etiqueta">Nombre:</span>
                <span class="valor">${pacienteNombre || 'No especificado'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Edad:</span>
                <span class="valor">${pacienteEdad || 'No especificada'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Peso:</span>
                <span class="valor">${pacientePeso || 'No especificado'}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Fecha:</span>
                <span class="valor">${fecha}</span>
              </div>
            </div>
          </section>

          <section class="seccion-tratamiento">
            <h2 class="seccion-titulo">Información del Tratamiento</h2>
            <div class="tratamiento-grid">
              <div class="info-campo">
                <span class="etiqueta">Toxina:</span>
                <span class="valor toxina-nombre">${toxinaInfo[marca as keyof typeof toxinaInfo] || marca}</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Dilución:</span>
                <span class="valor">${dilucion} ml por frasco (${uiFrasco} U)</span>
              </div>
              <div class="info-campo">
                <span class="etiqueta">Concentración:</span>
                <span class="valor">${(uiFrasco / parseFloat(dilucion)).toFixed(1)} U/ml</span>
              </div>
            </div>
          </section>

          <section>
            <h2 class="seccion-titulo">Músculos Tratados</h2>
            <table class="tabla-musculos">
              <thead>
                <tr>
                  <th>Lado</th>
                  <th>Músculo</th>
                  <th>Referencias (U)</th>
                  <th>Dosis Ajustada (U)</th>
                  <th>ml a aplicar</th>
                </tr>
              </thead>
              <tbody>
                ${musculosRows}
                <tr class="fila-total">
                  <td colspan="2"><strong>TOTAL</strong></td>
                  <td class="dosis-base"><strong>${totalBase} U</strong></td>
                  <td class="dosis-ajustada"><strong>${totalDosisAjustada} U</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resumen del Tratamiento</h2>
            <div class="totales-grid">
              <div class="total-item">
                <div class="total-label">Dosis Total Base</div>
                <div class="total-valor">${totalBase} U</div>
              </div>
              <div class="total-item">
                <div class="total-label">Dosis Total Ajustada</div>
                <div class="total-valor">${totalDosisAjustada} U</div>
              </div>
            </div>
            ${advertencia ? `<div class="advertencia-limites">${advertencia}</div>` : ''}
          </section>

          <footer class="reporte-pie">
            <div class="info-medico">
              <strong>Reporte generado para:</strong> ${medico || 'No especificado'}
            </div>
            <div class="firma-area">
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">Firma del Médico</div>
              </div>
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-label">Fecha y Sello</div>
              </div>
            </div>
            <div class="disclaimer">
              <strong>Disclaimer:</strong> Este reporte es generado por una herramienta de apoyo clínico y no sustituye 
              la evaluación médica profesional ni la revisión de la información oficial del producto. La dosificación 
              final debe ser determinada por el médico tratante.
            </div>
          </footer>
        </div>

        <!-- Segunda página: Referencias anatómicas de puntos motores -->
        <div class="page-break"></div>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
              <div style="width: 40px; height: 40px;">${appIconSvg}</div>
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Guía de Puntos Motores - Referencias Anatómicas</div>
            <div class="fecha-reporte">Músculos seleccionados para ${pacienteNombre || 'el tratamiento'}</div>
          </header>

          <section class="seccion-puntos-motores">
            <h2 class="seccion-titulo">Localización de Puntos Motores</h2>
            ${musculos.map((m) => {
              const puntoMotor = getPuntoMotor(m.nombre);
              return `
                <div class="punto-motor-item">
                  <h3 class="musculo-titulo">${m.nombre} (${m.lado})</h3>
                  <div class="punto-motor-descripcion">
                    <p>${puntoMotor}</p>
                  </div>
                  <div class="dosis-info-pequena">
                    <strong>Dosis aplicada:</strong> ${m.dosisAjustada} U 
                    (${((m.dosisAjustada / uiFrasco) * parseFloat(dilucion)).toFixed(2)} ml)
                  </div>
                </div>
              `;
            }).join('')}
          </section>

          <footer class="reporte-pie">
            <div class="info-medico">
              <strong>Referencia anatómica para:</strong> ${medico || 'No especificado'}
            </div>
            <div class="disclaimer">
              <strong>Nota importante:</strong> Estas descripciones son referencias anatómicas generales. 
              La localización exacta puede variar según la anatomía individual del paciente. 
              Utilice siempre electroestimulación o ecografía para confirmar la ubicación precisa del punto motor.
            </div>
          </footer>
        </div>
      </body>
    </html>
  `;
};