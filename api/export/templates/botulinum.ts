import { z } from 'zod';
import { getMusculoImage, hasMusculoImage } from '@/data/botulinumImages';

// Schema para validación de datos de entrada
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BotulinumAssessmentSchema = z.object({
  medico: z.string().optional(),
  pacienteId: z.string().optional(),
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



export const generateHtml = (payload: BotulinumPayload): string => {
  // Corregir warning: remover variable 'scale' no usada
  const { assessment } = payload;
  // Aceptar datos auxiliares tanto en la raíz del payload como embebidos en assessment
  // Esto alinea el template con el componente BotulinumCalculator, que los envía dentro de assessment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const puntosMotoresData: Record<string, string> = (payload as any).puntosMotoresData || (assessment as any)?.puntosMotoresData || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dosisDataComplete: BotulinumPayload['dosisDataComplete'] = (payload as any).dosisDataComplete || (assessment as any)?.dosisDataComplete;
  const {
    medico,
    pacienteId,
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
    // Soporta estructuras completas de dosis por marca como las de data/botulinum.ts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byBrand = (dosisDataComplete as any)?.[marcaSel];
    return byBrand?.[musculo] || { min: 0, max: 0 };
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
      puntoMotor: getPuntoMotor(nombreMusculo),
      imagen: getMusculoImage(nombreMusculo),
      tieneImagen: hasMusculoImage(nombreMusculo)
    }))
    .filter(pm => pm.puntoMotor && !pm.puntoMotor.includes('no disponible'));



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
          
          /* Header simplificado para impresión B/N */
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
          .seccion-paciente, .seccion-resumen, .seccion-tabla, .seccion-notas { 
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
          
          /* Grid compacto */
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
          
          /* Tabla compacta para impresión */
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
          .musculo-nombre {
            font-weight: bold;
            color: #000;
          }
          .musculo-title {
            font-weight: bold;
            font-size: 8pt;
            color: #000;
            margin-bottom: 2px;
          }
          .punto-motor {
            font-size: 7pt;
            color: #333;
            font-style: italic;
            line-height: 1.1;
          }
          .dosis-ajustada {
            font-weight: bold;
            color: #000;
          }
          .ml-aplicar {
            font-weight: bold;
            color: #000;
          }
          .referencias {
            font-size: 7pt;
          }
          .rango-info {
            color: #333;
            font-weight: normal;
            margin-bottom: 1px;
          }
          .seleccion-info {
            color: #000;
            font-weight: bold;
          }
          
          /* Estilos para hoja de puntos motores separada */
          .puntos-motores-page {
            page-break-before: always;
            padding: 20px 0;
          }
          .punto-motor-item {
            border: 1px solid #000;
            padding: 10px;
            margin-bottom: 15px;
            background: white;
            display: flex;
            gap: 15px;
            align-items: flex-start;
          }
          .punto-motor-content {
            flex: 1;
            min-width: 0;
          }
          .punto-motor-nombre {
            font-weight: bold;
            color: #000;
            font-size: 11pt;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
          }
          .punto-motor-descripcion {
            font-size: 9pt;
            color: #000;
            line-height: 1.4;
            margin: 0;
          }
          .imagen-placeholder {
            border: 2px dashed #666;
            height: 120px;
            width: 180px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 5px;
          }
          
          /* Cards de resumen compactas */
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
          
          /* Advertencia simplificada */
          .advertencia-limites { 
            background: #f5f5f5; 
            border: 1px solid #000; 
            padding: 8px; 
            margin-top: 8px; 
            font-size: 8pt; 
            color: #000; 
            font-weight: bold;
          }
          
          /* Firma simplificada - solo médico */
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
          
          /* Disclaimer simplificado */
          .disclaimer { 
            font-size: 7pt; 
            color: #333; 
            text-align: justify; 
            border-top: 1px solid #000; 
            padding-top: 8px; 
            margin-top: 15px;
            line-height: 1.3;
          }
          
          /* Separador de página para puntos motores */
          .page-break { 
            page-break-before: always; 
          }
        </style>
      </head>
      <body>
        <div class="reporte-impresion">
          <header class="reporte-header">
            <div class="header-content">
              <div class="clinica-logo">Escalas DLM</div>
            </div>
            <div class="reporte-titulo">Reporte de Dosis de Toxina Botulínica</div>
            <div class="fecha-reporte">${fecha}</div>
          </header>

          <section class="seccion-paciente">
            <h2 class="seccion-titulo">Información del Paciente</h2>
            <div class="grid">
              <div class="info-campo"><span class="etiqueta">ID Paciente:</span><span class="valor">${pacienteId || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Paciente:</span><span class="valor">${pacienteNombre || 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Edad:</span><span class="valor">${pacienteEdad ? `${pacienteEdad} años` : 'No especificada'}</span></div>
              <div class="info-campo"><span class="etiqueta">Peso:</span><span class="valor">${pacientePeso ? `${pacientePeso} kg` : 'No especificado'}</span></div>
              <div class="info-campo"><span class="etiqueta">Médico:</span><span class="valor">${medico || 'No especificado'}</span></div>
            </div>
          </section>

          <section class="seccion-resumen">
            <h2 class="seccion-titulo">Resumen</h2>
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
            <h2 class="seccion-titulo">Plan de Inyección</h2>
            <table>
              <thead>
                <tr>
                  <th>Lado</th>
                  <th>Músculo</th>
                  <th>Rango y Selección</th>
                  <th>Dosis Final</th>
                  <th>Vol. a aplicar</th>
                </tr>
              </thead>
              <tbody>${musculosRows}</tbody>
            </table>
          </section>

          <section class="seccion-notas">
            <h2 class="seccion-titulo">Notas</h2>
            <p style="margin: 0; line-height: 1.3; font-size: 8pt;">Las dosis fueron ajustadas en función de la edad y el peso cuando corresponde. Verifique la técnica, puntos motores y contraindicaciones antes de la aplicación.</p>
          </section>

          <div class="firma-area">
            <div class="firma-box">
              <div class="firma-linea"></div>
              <div class="firma-label">Firma del Médico</div>
            </div>
          </div>

          <div class="disclaimer">
            Documento generado automáticamente en ${fecha}. Información con fines clínicos; Se sugiere confirmar siempre con guías actualizadas y ficha técnica del producto.
          </div>
        </div>

        ${puntosMotoresUnicos.length > 0 ? `
        <!-- PÁGINA SEPARADA: PUNTOS MOTORES -->
        <div class="puntos-motores-page">
          <header class="reporte-header">
            <div class="header-content">
              <div class="clinica-logo">DeepLuxMed</div>
            </div>
            <div class="reporte-titulo">Puntos Motores de Referencia</div>
            <div class="fecha-reporte">${fecha}</div>
          </header>

          <div style="padding: 10px 0;">
            ${puntosMotoresUnicos.map(pm => `
              <div class="punto-motor-item">
                <div class="punto-motor-content">
                  <div class="punto-motor-nombre">${pm.nombre}</div>
                  <div class="punto-motor-descripcion">${pm.puntoMotor}</div>
                </div>
                ${pm.tieneImagen ? `
                  <div class="imagen-container">
                    <img src="${pm.imagen?.url}" 
                         alt="${pm.imagen?.alt}" 
                         style="width: 180px; height: 120px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div class="imagen-placeholder" style="display: none;">
                      [Error al cargar imagen anatómica]
                    </div>
                    ${pm.imagen?.description ? `
                      <div style="font-size: 7pt; color: #666; margin-top: 4px; font-style: italic;">
                        ${pm.imagen.description}
                      </div>
                    ` : ''}
                  </div>
                ` : `
                  <div class="imagen-placeholder">
                    [Imagen anatómica no disponible]
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </body>
    </html>`;
};

