/**
 * @file data/borg.ts
 * @description Escala de Borg (RPE) para evaluación de disnea y esfuerzo percibido
 */

export const borgScale = {
  id: 'borg',
  name: 'Escala de Borg',
  shortName: 'Borg RPE',
  description: 'Evaluación de disnea y esfuerzo percibido durante el ejercicio',
  category: 'Cardiopulmonary',
  specialty: 'Neumología',
  timeToComplete: '2 min',
  information: `
La Escala de Borg (Rating of Perceived Exertion - RPE) es una herramienta para cuantificar la percepción subjetiva del esfuerzo físico o la disnea durante el ejercicio.

**Versión Modificada (0-10):**
Escala simplificada utilizada frecuentemente en rehabilitación cardiopulmonar.

**Aplicaciones:**
- Evaluación de disnea en EPOC
- Monitoreo de intensidad de ejercicio
- Pruebas de esfuerzo
- Rehabilitación cardíaca y pulmonar
- Test de marcha de 6 minutos

**Instrucciones:**
El paciente selecciona el número que mejor describe su sensación de esfuerzo o dificultad para respirar en el momento actual.

**Utilidad Clínica:**
- Determinar intensidad de entrenamiento
- Evaluar progresión de enfermedad
- Ajustar programas de rehabilitación
  `.trim(),
};

export const borgQuestions = [
  {
    id: 'borg_1',
    question: '¿Cómo calificaría su sensación de falta de aire o esfuerzo en este momento?',
    description: 'Seleccione el nivel que mejor describe su sensación actual',
    type: 'single_choice' as const,
    options: [
      { value: 0, label: '0 - Nada en absoluto', description: 'Sin esfuerzo' },
      { value: 0.5, label: '0.5 - Muy, muy leve', description: 'Apenas perceptible' },
      { value: 1, label: '1 - Muy leve', description: 'Esfuerzo mínimo' },
      { value: 2, label: '2 - Leve', description: 'Respiración ligera' },
      { value: 3, label: '3 - Moderado', description: 'Esfuerzo notable pero cómodo' },
      { value: 4, label: '4 - Algo intenso', description: 'Comienza a ser incómodo' },
      { value: 5, label: '5 - Intenso', description: 'Respiración dificultosa' },
      { value: 6, label: '6', description: 'Entre intenso y muy intenso' },
      { value: 7, label: '7 - Muy intenso', description: 'Difícil mantener el ritmo' },
      { value: 8, label: '8', description: 'Muy, muy intenso' },
      { value: 9, label: '9 - Muy, muy intenso', description: 'Casi máximo esfuerzo' },
      { value: 10, label: '10 - Máximo', description: 'No puede continuar' },
    ],
  },
];

export const scoreInterpretation = [
  {
    min: 0,
    max: 0.5,
    level: 'Reposo',
    description: 'Sin esfuerzo o esfuerzo mínimo imperceptible',
    recommendation: 'Nivel basal, puede aumentar intensidad',
    color: '#10b981',
  },
  {
    min: 1,
    max: 2,
    level: 'Actividad muy leve',
    description: 'Esfuerzo muy ligero, actividades de la vida diaria',
    recommendation: 'Intensidad apropiada para calentamiento',
    color: '#84cc16',
  },
  {
    min: 3,
    max: 4,
    level: 'Actividad moderada',
    description: 'Esfuerzo moderado, puede mantener conversación',
    recommendation: 'Zona óptima para ejercicio aeróbico',
    color: '#3b82f6',
  },
  {
    min: 5,
    max: 6,
    level: 'Actividad intensa',
    description: 'Esfuerzo significativo, conversación difícil',
    recommendation: 'Ejercicio vigoroso, monitorear de cerca',
    color: '#f59e0b',
  },
  {
    min: 7,
    max: 9,
    level: 'Actividad muy intensa',
    description: 'Esfuerzo muy alto, difícil de sostener',
    recommendation: 'Considerar reducir intensidad',
    color: '#f97316',
  },
  {
    min: 10,
    max: 10,
    level: 'Esfuerzo máximo',
    description: 'Agotamiento total, no puede continuar',
    recommendation: 'Detener actividad, reposo inmediato',
    color: '#ef4444',
  },
];
