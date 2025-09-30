import { z } from 'zod';

const SixMWTAssessmentSchema = z.object({
  patientData: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    gender: z.string().optional(),
    doctorName: z.string().optional(),
  }),
  testData: z.object({
    // Datos del paciente
    height_cm: z.number(),
    weight_kg: z.number(),
    bmi: z.number().optional(),

    // Pre-test
    pre_hr: z.number(),
    pre_bp_systolic: z.number(),
    pre_bp_diastolic: z.number(),
    pre_spo2: z.number(),
    pre_dyspnea_borg: z.number(),
    pre_fatigue_borg: z.number(),

    // Test results
    distance_meters: z.number(),
    stops_count: z.number(),
    total_rest_time_seconds: z.number(),
    oxygen_use: z.boolean(),
    oxygen_flow: z.number().optional(),
    assistive_device: z.string().optional(),

    // Post-test
    post_hr: z.number(),
    post_bp_systolic: z.number(),
    post_bp_diastolic: z.number(),
    post_spo2: z.number(),
    post_dyspnea_borg: z.number(),
    post_fatigue_borg: z.number(),

    // Calculations
    predicted_distance: z.number().optional(),
    percent_predicted: z.number().optional(),

    observations: z.string().optional(),
  }),
  interpretation: z.object({
    severity: z.string(),
    interpretation: z.string(),
    color: z.string(),
    difference: z.number().optional(),
    percentPredicted: z.string().optional(),
  }).optional(),
});

const SixMWTRequestSchema = z.object({
  assessment: SixMWTAssessmentSchema,
  scale: z.object({ id: z.string(), name: z.string() }),
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

export type SixMWTPayload = z.infer<typeof SixMWTRequestSchema>;

export const generateHtml = (payload: SixMWTPayload): string => {
  const { assessment, scale, options } = payload;
  const { patientData, testData, interpretation } = assessment;

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate changes
  const hrChange = testData.post_hr - testData.pre_hr;
  const spo2Change = testData.post_spo2 - testData.pre_spo2;
  const dyspneaChange = testData.post_dyspnea_borg - testData.pre_dyspnea_borg;
  const fatigueChange = testData.post_fatigue_borg - testData.pre_fatigue_borg;

  const assistiveDeviceLabel = {
    'none': 'Ninguno',
    'cane': 'Bastón',
    'walker': 'Andador',
    'crutches': 'Muletas',
  }[testData.assistive_device || 'none'] || 'No especificado';

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Resultados Test de Marcha de 6 Minutos</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 15px;
            font-size: 13px;
            line-height: 1.5;
            color: #1e293b;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid ${interpretation?.color || '#0891b2'};
          }
          .header h1 {
            margin: 0 0 6px 0;
            color: #0f172a;
            font-size: 24px;
          }
          .header .subtitle {
            color: #64748b;
            font-size: 13px;
            margin: 0;
          }
          .section {
            margin-bottom: 18px;
            padding: 15px;
            border-radius: 6px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
          }
          .section h2 {
            margin: 0 0 12px 0;
            color: #0f172a;
            font-size: 16px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .data-box {
            padding: 10px;
            background: #f8fafc;
            border-radius: 4px;
            border-left: 3px solid ${interpretation?.color || '#0891b2'};
          }
          .data-box .label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 3px;
          }
          .data-box .value {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
          }
          .highlight-box {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, ${interpretation?.color || '#0891b2'}15, ${interpretation?.color || '#0891b2'}05);
            border-radius: 10px;
            border: 2px solid ${interpretation?.color || '#0891b2'};
          }
          .highlight-value {
            font-size: 42px;
            font-weight: bold;
            color: ${interpretation?.color || '#0891b2'};
            margin: 0;
          }
          .highlight-label {
            font-size: 14px;
            color: #64748b;
            margin: 6px 0 0 0;
          }
          .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .comparison-table th {
            background: #f1f5f9;
            padding: 8px;
            text-align: left;
            font-size: 12px;
            color: #475569;
            border-bottom: 2px solid #cbd5e1;
          }
          .comparison-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          .comparison-table tr:last-child td {
            border-bottom: none;
          }
          .change-positive {
            color: #059669;
            font-weight: 600;
          }
          .change-negative {
            color: #dc2626;
            font-weight: 600;
          }
          .change-neutral {
            color: #64748b;
          }
          .interpretation-box {
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 5px solid ${interpretation?.color || '#0891b2'};
            margin-top: 12px;
          }
          .interpretation-box h3 {
            margin: 0 0 10px 0;
            color: ${interpretation?.color || '#0891b2'};
            font-size: 18px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            background: ${interpretation?.color || '#0891b2'};
            color: white;
            border-radius: 16px;
            font-weight: 600;
            font-size: 12px;
            margin-top: 6px;
          }
          .info-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 12px;
            margin-top: 12px;
          }
          .info-box h4 {
            margin: 0 0 8px 0;
            color: #0369a1;
            font-size: 14px;
          }
          .info-box ul {
            margin: 6px 0;
            padding-left: 20px;
          }
          .info-box li {
            margin: 4px 0;
            font-size: 12px;
            color: #075985;
          }
          .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Test de Marcha de 6 Minutos (6MWT)</h1>
            <p class="subtitle">6-Minute Walk Test - Evaluación de Capacidad Funcional</p>
            <p class="subtitle">${today}</p>
          </div>

          <div class="section">
            <h2>📋 Datos del Paciente</h2>
            <div class="grid-3">
              <div class="data-box">
                <div class="label">ID Paciente</div>
                <div class="value">${patientData?.id || 'N/E'}</div>
              </div>
              <div class="data-box">
                <div class="label">Nombre</div>
                <div class="value">${patientData?.name || 'No especificado'}</div>
              </div>
              <div class="data-box">
                <div class="label">Edad</div>
                <div class="value">${patientData?.age || 'N/E'} años</div>
              </div>
              <div class="data-box">
                <div class="label">Género</div>
                <div class="value">${patientData?.gender === 'male' ? 'Masculino' : patientData?.gender === 'female' ? 'Femenino' : 'N/E'}</div>
              </div>
              <div class="data-box">
                <div class="label">Estatura</div>
                <div class="value">${testData.height_cm} cm</div>
              </div>
              <div class="data-box">
                <div class="label">Peso</div>
                <div class="value">${testData.weight_kg} kg</div>
              </div>
            </div>
            <div style="margin-top: 10px; padding: 8px; background: #f8fafc; border-radius: 4px;">
              <strong>Evaluador:</strong> ${patientData?.doctorName || 'No especificado'}
            </div>
          </div>

          <div class="section">
            <h2>🎯 Resultado Principal</h2>
            <div class="highlight-box">
              <p class="highlight-value">${testData.distance_meters} m</p>
              <p class="highlight-label">Distancia Total Recorrida</p>
            </div>

            ${interpretation ? `
              <div class="interpretation-box">
                <h3>${interpretation.severity}</h3>
                <p><strong>Interpretación:</strong> ${interpretation.interpretation}</p>
                ${interpretation.percentPredicted ? `
                  <p><strong>% del Predicho:</strong> ${interpretation.percentPredicted}% ${testData.predicted_distance ? `(Predicho: ${Math.round(testData.predicted_distance)}m)` : ''}</p>
                ` : ''}
                ${interpretation.difference !== undefined ? `
                  <p><strong>Diferencia vs Predicho:</strong> ${interpretation.difference > 0 ? '+' : ''}${Math.round(interpretation.difference)} metros</p>
                ` : ''}
                <span class="badge">${interpretation.severity}</span>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>📊 Signos Vitales y Síntomas</h2>
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th style="text-align: center;">Pre-Test</th>
                  <th style="text-align: center;">Post-Test</th>
                  <th style="text-align: center;">Cambio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Frecuencia Cardíaca</strong></td>
                  <td style="text-align: center;">${testData.pre_hr} lpm</td>
                  <td style="text-align: center;">${testData.post_hr} lpm</td>
                  <td style="text-align: center;" class="${hrChange > 0 ? 'change-positive' : 'change-neutral'}">
                    ${hrChange > 0 ? '+' : ''}${hrChange} lpm
                  </td>
                </tr>
                <tr>
                  <td><strong>Presión Arterial</strong></td>
                  <td style="text-align: center;">${testData.pre_bp_systolic}/${testData.pre_bp_diastolic} mmHg</td>
                  <td style="text-align: center;">${testData.post_bp_systolic}/${testData.post_bp_diastolic} mmHg</td>
                  <td style="text-align: center;" class="change-neutral">
                    ${testData.post_bp_systolic - testData.pre_bp_systolic}/${testData.post_bp_diastolic - testData.pre_bp_diastolic}
                  </td>
                </tr>
                <tr>
                  <td><strong>SpO₂</strong></td>
                  <td style="text-align: center;">${testData.pre_spo2}%</td>
                  <td style="text-align: center;">${testData.post_spo2}%</td>
                  <td style="text-align: center;" class="${spo2Change < 0 ? 'change-negative' : 'change-neutral'}">
                    ${spo2Change > 0 ? '+' : ''}${spo2Change}%
                  </td>
                </tr>
                <tr>
                  <td><strong>Disnea (Borg 0-10)</strong></td>
                  <td style="text-align: center;">${testData.pre_dyspnea_borg}</td>
                  <td style="text-align: center;">${testData.post_dyspnea_borg}</td>
                  <td style="text-align: center;" class="${dyspneaChange > 0 ? 'change-negative' : 'change-neutral'}">
                    ${dyspneaChange > 0 ? '+' : ''}${dyspneaChange}
                  </td>
                </tr>
                <tr>
                  <td><strong>Fatiga (Borg 0-10)</strong></td>
                  <td style="text-align: center;">${testData.pre_fatigue_borg}</td>
                  <td style="text-align: center;">${testData.post_fatigue_borg}</td>
                  <td style="text-align: center;" class="${fatigueChange > 0 ? 'change-negative' : 'change-neutral'}">
                    ${fatigueChange > 0 ? '+' : ''}${fatigueChange}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>🚶 Detalles de la Ejecución</h2>
            <div class="grid-2">
              <div class="data-box">
                <div class="label">Número de Paradas</div>
                <div class="value">${testData.stops_count}</div>
              </div>
              <div class="data-box">
                <div class="label">Tiempo Total de Descanso</div>
                <div class="value">${testData.total_rest_time_seconds} segundos</div>
              </div>
              <div class="data-box">
                <div class="label">Oxígeno Suplementario</div>
                <div class="value">${testData.oxygen_use ? 'Sí' : 'No'}${testData.oxygen_flow ? ` (${testData.oxygen_flow} L/min)` : ''}</div>
              </div>
              <div class="data-box">
                <div class="label">Dispositivo de Ayuda</div>
                <div class="value">${assistiveDeviceLabel}</div>
              </div>
            </div>
            ${testData.observations ? `
              <div style="margin-top: 12px; padding: 10px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px;">
                <strong style="color: #b45309;">Observaciones:</strong>
                <p style="margin: 6px 0 0 0; color: #78350f;">${testData.observations}</p>
              </div>
            ` : ''}
          </div>

          <div class="section" style="background: #f8fafc;">
            <h2>ℹ️ Información Clínica</h2>
            <div class="info-box">
              <h4>Interpretación por % del Predicho:</h4>
              <ul>
                <li><strong>≥82%:</strong> Capacidad funcional normal</li>
                <li><strong>70-81%:</strong> Limitación funcional leve</li>
                <li><strong>50-69%:</strong> Limitación funcional moderada</li>
                <li><strong>&lt;50%:</strong> Limitación funcional severa</li>
              </ul>
            </div>
            <div class="info-box" style="margin-top: 10px;">
              <h4>Diferencia Mínima Clínicamente Importante (MCID):</h4>
              <ul>
                <li><strong>General:</strong> 30-50 metros</li>
                <li><strong>EPOC:</strong> 25-35 metros</li>
                <li><strong>Insuficiencia Cardíaca:</strong> 30-40 metros</li>
                <li><strong>Hipertensión Pulmonar:</strong> 41 metros</li>
              </ul>
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #64748b; font-style: italic;">
              Referencia: ATS Statement: Guidelines for the Six-Minute Walk Test. Am J Respir Crit Care Med. 2002;166(1):111-117.
            </p>
          </div>

          <div class="footer">
            <p><strong>Nota:</strong> Este documento es un registro de evaluación clínica. Los resultados deben ser interpretados por un profesional de la salud cualificado en el contexto clínico del paciente.</p>
            <p>Generado con Escalas Médicas DLM - ${today}</p>
            ${options?.footerNote ? `<p>${options.footerNote}</p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
};