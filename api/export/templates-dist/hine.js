"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHineReport = generateHineReport;
const hine_1 = require("@/data/hine");
function generateHineReport(data) {
    const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const sectionMaxScores = {
        craneales: 15,
        postura: 18,
        movimientos: 6,
        tono: 24,
        reflejos: 15
    };
    const presentMilestones = data.motorMilestones.filter(m => m.status !== 'no_presente');
    const presentBehaviors = data.behaviors.filter(b => b.present);
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe HINE - ${data.patientData.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin-bottom: 5px;
            font-size: 28px;
        }
        .header h2 {
            color: #64748b;
            font-weight: normal;
            margin-top: 0;
            font-size: 16px;
        }
        .patient-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #3b82f6;
        }
        .patient-info h3 {
            margin-top: 0;
            color: #1e40af;
            font-size: 18px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .info-value {
            color: #1f2937;
            font-size: 14px;
        }
        .score-section {
            margin-bottom: 25px;
        }
        .total-score {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 25px;
        }
        .total-score h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .score-value {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-max {
            font-size: 14px;
            opacity: 0.9;
        }
        .interpretation {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid;
        }
        .interpretation.optimal {
            background-color: #f0fdf4;
            border-color: #16a34a;
            color: #166534;
        }
        .interpretation.normal {
            background-color: #f0fdf4;
            border-color: #22c55e;
            color: #166534;
        }
        .interpretation.vigilance {
            background-color: #fffbeb;
            border-color: #f59e0b;
            color: #92400e;
        }
        .interpretation.high-risk {
            background-color: #fef2f2;
            border-color: #ef4444;
            color: #dc2626;
        }
        .interpretation h4 {
            margin-top: 0;
            font-size: 16px;
            font-weight: 600;
        }
        .sections-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        .section-card {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .section-name {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .section-score {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        .asymmetry-section {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid;
        }
        .asymmetry-section.significant {
            background-color: #fffbeb;
            border-color: #f59e0b;
        }
        .asymmetry-section.normal {
            background-color: #f0fdf4;
            border-color: #22c55e;
        }
        .asymmetry-count {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .asymmetry-count.significant {
            color: #f59e0b;
        }
        .asymmetry-count.normal {
            color: #22c55e;
        }
        .milestones-section, .behavior-section, .comments-section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .milestone-item, .behavior-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .milestone-item:last-child, .behavior-item:last-child {
            border-bottom: none;
        }
        .milestone-text, .behavior-text {
            flex: 1;
            color: #374151;
        }
        .milestone-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-observed {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-referred {
            background-color: #dcfce7;
            color: #166534;
        }
        .no-data {
            color: #6b7280;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        .comments-text {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .checkmark {
            color: #22c55e;
            font-weight: bold;
            margin-right: 8px;
        }
        @media print {
            body {
                background-color: white;
                font-size: 12px;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .score-value {
                font-size: 36px;
            }
            .sections-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Informe de Evaluación Neurológica HINE</h1>
            <h2>Hammersmith Infant Neurological Examination</h2>
            <p>Generado el ${currentDate}</p>
        </div>

        <div class="patient-info">
            <h3>Datos del Paciente</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${data.patientData.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Nacimiento</span>
                    <span class="info-value">${data.patientData.birthDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha del Examen</span>
                    <span class="info-value">${data.patientData.examDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Edad Cronológica</span>
                    <span class="info-value">${data.patientData.chronologicalAge}</span>
                </div>
                ${data.patientData.correctedAge !== 'No aplica' ? `
                <div class="info-item">
                    <span class="info-label">Edad Corregida</span>
                    <span class="info-value">${data.patientData.correctedAge}</span>
                </div>
                ` : ''}
                ${data.patientData.headCircumference ? `
                <div class="info-item">
                    <span class="info-label">Perímetro Cefálico</span>
                    <span class="info-value">${data.patientData.headCircumference} cm</span>
                </div>
                ` : ''}
                ${data.patientData.examiner ? `
                <div class="info-item">
                    <span class="info-label">Examinador</span>
                    <span class="info-value">${data.patientData.examiner}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="total-score">
            <h3>Puntuación Global HINE</h3>
            <div class="score-value">${data.totalScore}</div>
            <div class="score-max">de 78 puntos máximos</div>
        </div>

        <div class="interpretation ${getInterpretationClass(data.interpretation.interpretation_level)}">
            <h4>${data.interpretation.interpretation_level}</h4>
            <p>${data.interpretation.interpretation_text}</p>
        </div>

        <div class="score-section">
            <h3 class="section-title">Desglose de Puntuaciones por Sección</h3>
            <div class="sections-grid">
                <div class="section-card">
                    <div class="section-name">Pares Craneales</div>
                    <div class="section-score">${data.sectionScores.craneales} / ${sectionMaxScores.craneales}</div>
                </div>
                <div class="section-card">
                    <div class="section-name">Postura</div>
                    <div class="section-score">${data.sectionScores.postura} / ${sectionMaxScores.postura}</div>
                </div>
                <div class="section-card">
                    <div class="section-name">Movimientos</div>
                    <div class="section-score">${data.sectionScores.movimientos} / ${sectionMaxScores.movimientos}</div>
                </div>
                <div class="section-card">
                    <div class="section-name">Tono Muscular</div>
                    <div class="section-score">${data.sectionScores.tono} / ${sectionMaxScores.tono}</div>
                </div>
                <div class="section-card">
                    <div class="section-name">Reflejos y Reacciones</div>
                    <div class="section-score">${data.sectionScores.reflejos} / ${sectionMaxScores.reflejos}</div>
                </div>
            </div>
        </div>

        <div class="asymmetry-section ${data.asymmetryInterpretation.isSignificant ? 'significant' : 'normal'}">
            <h3 class="section-title">Evaluación de Asimetría</h3>
            <div class="asymmetry-count ${data.asymmetryInterpretation.isSignificant ? 'significant' : 'normal'}">
                ${data.asymmetryInterpretation.count}
            </div>
            <p><strong>Hallazgos asimétricos identificados</strong></p>
            <p>${data.asymmetryInterpretation.text}</p>
        </div>

        <div class="milestones-section">
            <h3 class="section-title">Hitos Motores Registrados</h3>
            ${presentMilestones.length > 0 ? `
                ${presentMilestones.map(milestone => {
        const milestoneData = hine_1.hineMotorMilestones.find(hm => hm.id === milestone.milestoneId);
        return `
                    <div class="milestone-item">
                        <div class="milestone-text">
                            <span class="checkmark">✓</span>
                            ${milestoneData?.name || milestone.milestoneId}
                            <small style="display: block; color: #6b7280; margin-left: 20px;">
                                ${milestoneData?.normalAge || ''}
                            </small>
                        </div>
                        <span class="milestone-status ${milestone.status === 'observado' ? 'status-observed' : 'status-referred'}">
                            ${milestone.status === 'observado' ? 'Observado' : 'Referido'}
                        </span>
                    </div>
                  `;
    }).join('')}
            ` : `
                <div class="no-data">No se registraron hitos motores como presentes.</div>
            `}
        </div>

        <div class="behavior-section">
            <h3 class="section-title">Conducta Durante el Examen</h3>
            ${presentBehaviors.length > 0 ? `
                ${presentBehaviors.map(behavior => {
        const behaviorData = hine_1.hineBehaviorItems.find(hb => hb.id === behavior.behaviorId);
        return `
                    <div class="behavior-item">
                        <div class="behavior-text">
                            <span class="checkmark">✓</span>
                            ${behaviorData?.name || behavior.behaviorId}
                        </div>
                    </div>
                  `;
    }).join('')}
            ` : `
                <div class="no-data">No se seleccionaron observaciones de conducta.</div>
            `}
        </div>

        ${data.comments ? `
        <div class="comments-section">
            <h3 class="section-title">Comentarios del Examinador</h3>
            <div class="comments-text">${data.comments}</div>
        </div>
        ` : ''}

        <div class="footer">
            <p><strong>HINE - Hammersmith Infant Neurological Examination</strong></p>
            <p>Este informe fue generado automáticamente por DeepLux Med | Escalas DLM</p>
            <p>Para interpretación clínica, consulte siempre con un profesional especializado</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}
function getInterpretationClass(level) {
    switch (level.toLowerCase()) {
        case 'óptimo':
        case 'optimo':
            return 'optimal';
        case 'desarrollo normal':
        case 'normal':
            return 'normal';
        case 'zona de vigilancia':
        case 'vigilancia':
            return 'vigilance';
        case 'riesgo muy alto':
        case 'riesgo alto':
        case 'alto riesgo':
            return 'high-risk';
        default:
            return 'normal';
    }
}
