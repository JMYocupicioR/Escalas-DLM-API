import { z } from 'zod';

// Schema para validación de datos de entrada
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Definir el tipo directamente para evitar warnings
export type BotulinumPayload = {
  assessment: z.infer<typeof BotulinumAssessmentSchema>;
  scale: { id: string; name: string };
  puntosMotoresData?: Record<string, string>;
  dosisDataComplete?: {
    Dysport: Record<string, { min: number; max: number }>;
    Botox: Record<string, { min: number; max: number }>;
    Xeomin: Record<string, { min: number; max: number }>;
  };
  options?: {
    theme?: 'light' | 'dark';
    customTheme?: Record<string, string>;
    footerNote?: string;
    preset?: 'compact' | 'medical' | 'formal';
    headerTitle?: string;
    headerSubtitle?: string;
    logoUrl?: string;
    scale?: number;
    showPatientSummary?: boolean;
  };
};

// SVG icons
const appIconSvg = `<svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f766e;" />
      <stop offset="100%" style="stop-color:#14b8a6;" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#iconGradient)"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="2"/>
  <path d="M30 50 L42 62 L70 34" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const patientIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0f766e">
  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
</svg>`;

const summaryIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0f766e">
  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
</svg>`;

const injectionIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0f766e">
  <path d="M9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
</svg>`;

const notesIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0f766e">
  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
</svg>`;

const anatomyIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0f766e">
  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
</svg>`;

export const generateHtml = (payload: BotulinumPayload): string => {
  // Corregir warning: remover variable 'scale' no usada
  const { assessment, puntosMotoresData = {}, dosisDataComplete } = payload;
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
  } as const;

  const uiFrasco = marca === 'Dysport' ? 500 : 100;
  const totalBase = (musculos || []).reduce((total, m) => total + (m.dosisBase || 0), 0);

  const getPuntoMotor = (musculo: string) => {
    return puntosMotoresData[musculo] || 'Referencia anatómica no disponible para este músculo. Consulte literatura especializada.';
  };

  const getDosisRange = (musculo: string, marcaSel: string) => {
    return dosisDataComplete?.[marcaSel as keyof typeof dosisDataComplete]?.[musculo] || { min: 0, max: 0 };
  };

  const musculosRows = (musculos || [])
    .map((m) => {
      const range = getDosisRange(m.nombre, marca);
      const seleccion = m.opcionDosis === 'min' ? 'Mínima' : 'Máxima';
      const puntoMotor = getPuntoMotor(m.nombre);
      const mlAplicar = ((m.dosisAjustada / uiFrasco) * parseFloat(dilucion)).toFixed(2);
      
      return `
    <tr>
      <td>${m.lado}</td>
      <td class="musculo-nombre">
        <div class="musculo-title">${m.nombre}</div>
        <div class="punto-motor">Punto motor: ${puntoMotor}</div>
      </td>
      <td class="referencias">
        <div class="rango-info">Rango: ${range.min}-${range.max} U</div>
        <div class="seleccion-info">${seleccion}: ${m.dosisBase} U</div>
      </td>
      <td class="dosis-ajustada">${m.dosisAjustada} U</td>
      <td class="ml-aplicar">${mlAplicar} ml</td>
    </tr>`;
    })
    .join('');

  // Generar lista de puntos motores únicos
  const puntosMotoresUnicos = Array.from(new Set((musculos || []).map(m => m.nombre)))
    .map(nombreMusculo => ({
      nombre: nombreMusculo,
      puntoMotor: getPuntoMotor(nombreMusculo)
    }))
    .filter(pm => pm.puntoMotor && !pm.puntoMotor.includes('no disponible'));

  const puntosMotoresList = puntosMotoresUnicos
    .map(pm => `
      <div class="punto-motor-item">
        <div class="punto-motor-nombre">${pm.nombre}</div>
        <div class="punto-motor-descripcion">${pm.puntoMotor}</div>
      </div>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reporte de Dosis de Toxina Botulínica</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { 
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; 
            margin: 0; 
            color: #1f2937; 
            line-height: 1.5;
            background: #fafafa;
          }
          .reporte-impresion { 
            max-width: 850px; 
            margin: 0 auto; 
            padding: 20px; 
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
          }
          
          /* Header mejorado */
          .reporte-header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 25px 20px;
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 8px 25px -8px rgba(15, 118, 110, 0.3);
          }
          .header-content {
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 15px; 
            margin-bottom: 15px;
          }
          .clinica-logo { 
            font-size: 22pt; 
            font-weight: 800; 
            letter-spacing: 0.8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .reporte-titulo { 
            font-size: 18pt; 
            font-weight: 600; 
            margin: 8px 0 4px 0;
            opacity: 0.95;
          }
          .fecha-reporte { 
            font-size: 11pt; 
            opacity: 0.8;
            font-weight: 400;
          }
          
          /* Secciones mejoradas */
          .seccion-paciente, .seccion-resumen, .seccion-tabla, .seccion-notas, .seccion-puntos-motores { 
            background: #ffffff; 
            border: 1px solid #e5e7eb; 
            border-radius: 12px; 
            padding: 20px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
          }
          .seccion-paciente:hover, .seccion-resumen:hover, .seccion-tabla:hover, .seccion-notas:hover, .seccion-puntos-motores:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .seccion-titulo { 
            font-size: 14pt; 
            font-weight: 700; 
            color: #0f766e; 
            margin: 0 0 16px; 
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0fdfa;
          }
          
          /* Grid y campos mejorados */
          .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 12px 20px; 
          }
          .info-campo { 
            display: flex; 
            flex-direction: column;
            gap: 4px; 
            padding: 8px 0;
          }
          .etiqueta { 
            font-weight: 600; 
            color: #6b7280; 
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .valor { 
            color: #1f2937; 
            font-weight: 500;
            font-size: 11pt;
          }
          
          /* Tabla mejorada */
          table { 
            width: 100%; 
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            font-size: 10pt;
            border-bottom: 1px solid #f3f4f6;
          }
          th { 
            background: linear-gradient(135deg, #0f766e, #14b8a6); 
            font-weight: 600; 
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 9pt;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tbody tr:hover {
            background-color: #f0fdfa;
          }
          .musculo-nombre {
            font-weight: 600;
            color: #1f2937;
          }
          .musculo-title {
            font-weight: 700;
            font-size: 10.5pt;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .punto-motor {
            font-size: 8pt;
            color: #6b7280;
            font-style: italic;
            line-height: 1.2;
            max-width: 200px;
          }
          .dosis-ajustada {
            font-weight: 700;
            color: #0f766e;
          }
          .ml-aplicar {
            font-weight: 600;
            color: #059669;
            background: #ecfdf5;
            border-radius: 4px;
          }
          .referencias {
            font-size: 9pt;
          }
          .rango-info {
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 2px;
          }
          .seleccion-info {
            color: #059669;
            font-weight: 600;
          }
          
          /* Puntos motores específicos */
          .punto-motor-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            transition: all 0.2s ease;
          }
          .punto-motor-item:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
          }
          .punto-motor-nombre {
            font-weight: 700;
            color: #1e293b;
            font-size: 10pt;
            margin-bottom: 4px;
          }
          .punto-motor-descripcion {
            font-size: 9pt;
            color: #475569;
            line-height: 1.4;
          }
          .puntos-motores-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 12px;
          }
          
          /* Cards de resumen mejoradas */
          .resumen-card { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
            gap: 16px; 
          }
          .card { 
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); 
            border: 1px solid #a7f3d0; 
            padding: 16px; 
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease;
          }
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .card .label { 
            font-size: 9pt; 
            color: #065f46; 
            text-transform: uppercase; 
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px; 
          }
          .card .value { 
            font-size: 16pt; 
            font-weight: 700; 
            color: #0f766e;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          /* Advertencia mejorada */
          .advertencia-limites { 
            background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); 
            border-left: 4px solid #f59e0b; 
            padding: 16px; 
            margin-top: 16px; 
            font-size: 10pt; 
            color: #92400e; 
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
          }
          
          /* Firma área mejorada */
          .firma-area { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 50px; 
            margin: 30px 0; 
            padding: 20px 0;
          }
          .firma-box {
            text-align: center;
          }
          .firma-box .firma-linea { 
            border-bottom: 2px solid #0f766e; 
            height: 60px; 
            margin-bottom: 8px;
            position: relative;
          }
          .firma-box .firma-linea::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 2px;
            background: #14b8a6;
          }
          .firma-label { 
            font-size: 10pt; 
            color: #6b7280; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Disclaimer mejorado */
          .disclaimer { 
            font-size: 8pt; 
            color: #9ca3af; 
            text-align: justify; 
            border-top: 2px solid #f3f4f6; 
            padding-top: 16px; 
            margin-top: 20px;
            line-height: 1.4;
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div class="header-content">
              <div style="width: 50px; height: 50px;">${appIconSvg}</div>
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Reporte de Dosis de Toxina Botulínica</div>
            <div class="fecha-reporte">${fecha}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">
              ${patientIcon}
              Información del Paciente
            </h2>
            <div class="grid">
              <div class="info-campo"><span class="etiqueta">Nombre del Paciente:</span><span class="valor">${pacienteNombre || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Edad:</span><span class="valor">${pacienteEdad ? `${pacienteEdad} años` : 'No especificada'}</span></div>
              <div class="info-campo"><span class="etiqueta">Peso:</span><span class="valor">${pacientePeso ? `${pacientePeso} kg` : 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Médico Tratante:</span><span class="valor">${medico || 'No especificado'}</span></div>
            </div>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">
              ${summaryIcon}
              Resumen
            </h2>
            <div class="resumen-card">
              <div class="card"><div class="label">Marca</div><div class="value">${toxinaInfo[marca as keyof typeof toxinaInfo] || marca}</div></div>
              <div class="card"><div class="label">Dilución</div><div class="value">${dilucion} ml</div></div>
              <div class="card"><div class="label">Músculos Tratados</div><div class="value">${(musculos || []).length}</div></div>
              <div class="card"><div class="label">Dosis Base Total</div><div class="value">${totalBase} U</div></div>
              <div class="card"><div class="label">Dosis Total Ajustada</div><div class="value">${totalDosisAjustada} U</div></div>
              <div class="card"><div class="label">Factor de Ajuste</div><div class="value">${pacienteEdad && pacientePeso && parseFloat(pacienteEdad) < 18 ? `${(parseFloat(pacientePeso) / 40).toFixed(2)}x` : '1.0x'}</div></div>
            </div>
            ${advertencia ? `<div class="advertencia-limites">${advertencia}</div>` : ''}
          </section>

          <section class="seccion-tabla">
            <h2 class="seccion-titulo">
              ${injectionIcon}
              Plan de Inyección
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Lado</th>
                  <th>Músculo y Punto Motor</th>
                  <th>Rango y Selección</th>
                  <th>Dosis Final</th>
                  <th>Vol. a aplicar</th>
                </tr>
              </thead>
              <tbody>${musculosRows}</tbody>
            </table>
          </section>

          ${puntosMotoresUnicos.length > 0 ? `
          <section class="seccion-puntos-motores">
            <h2 class="seccion-titulo">
              ${anatomyIcon}
              Puntos Motores de Referencia
            </h2>
            <div class="puntos-motores-container">
              ${puntosMotoresList}
            </div>
          </section>
          ` : ''}

          <section class="seccion-notas">
            <h2 class="seccion-titulo">
              ${notesIcon}
              Notas
            </h2>
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
            Documento generado automáticamente en ${fecha}. Información con fines clínicos; Se sugiere confirmar siempre con guías actualizadas y ficha técnica del producto.
          </div>
        </div>
      </body>
    </html>`;
};

