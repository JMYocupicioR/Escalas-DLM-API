// Boston Carpal Tunnel Questionnaire (BCTQ / Boston CTS Questionnaire)
// Texto normalizado en UTF-8; incluye SSS (11) + FSS (8)

export const boston = {
  id: 'boston',
  name: 'Cuestionario del Túnel Carpiano de Boston (BCTSQ)',
  shortName: 'BCTSQ',
  description:
    'Evalúa la severidad de los síntomas y el estado funcional en pacientes con síndrome del túnel carpiano.',
  information:
    'Consta de dos partes: Severidad de Síntomas (SSS) y Estado Funcional (FSS). Cada ítem se valora de 1 a 5.',
  timeToComplete: '5-10 min',
  category: 'Neurology',
  specialty: 'Neurología',

  questions: [
    // SSS (11)
    { id: 'sss-1', question: '¿Qué tan severo es el dolor en la mano/muñeca durante la noche?', options: [
      { score: 1, text: 'Sin dolor' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderado' }, { score: 4, text: 'Severo' }, { score: 5, text: 'Muy severo' }, ], subscale: 'SSS' },
    { id: 'sss-2', question: '¿Con qué frecuencia el dolor lo despierta durante la noche?', options: [
      { score: 1, text: 'Nunca' }, { score: 2, text: 'Una vez' }, { score: 3, text: '2-3 veces' }, { score: 4, text: '4-5 veces' }, { score: 5, text: 'Más de 5 veces' }, ], subscale: 'SSS' },
    { id: 'sss-3', question: '¿Suele tener dolor en la mano/muñeca durante el día?', options: [
      { score: 1, text: 'No' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderado' }, { score: 4, text: 'Severo' }, { score: 5, text: 'Muy severo' }, ], subscale: 'SSS' },
    { id: 'sss-4', question: '¿Con qué frecuencia tiene dolor durante el día?', options: [
      { score: 1, text: 'Nunca' }, { score: 2, text: '1-2 veces/día' }, { score: 3, text: '3-5 veces/día' }, { score: 4, text: 'Más de 5 veces/día' }, { score: 5, text: 'Continuo' }, ], subscale: 'SSS' },
    { id: 'sss-5', question: '¿Cuánto dura en promedio un episodio de dolor durante el día?', options: [
      { score: 1, text: 'No tengo dolor' }, { score: 2, text: '<10 min' }, { score: 3, text: '10-60 min' }, { score: 4, text: '>60 min' }, { score: 5, text: 'Continuo' }, ], subscale: 'SSS' },
    { id: 'sss-6', question: '¿Tiene adormecimiento en la mano/muñeca?', options: [
      { score: 1, text: 'No' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderado' }, { score: 4, text: 'Severo' }, { score: 5, text: 'Muy severo' }, ], subscale: 'SSS' },
    { id: 'sss-7', question: '¿Tiene debilidad en la mano/muñeca?', options: [
      { score: 1, text: 'No' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Severa' }, { score: 5, text: 'Muy severa' }, ], subscale: 'SSS' },
    { id: 'sss-8', question: '¿Tiene sensaciones de hormigueo en la mano?', options: [
      { score: 1, text: 'No' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderado' }, { score: 4, text: 'Severo' }, { score: 5, text: 'Muy severo' }, ], subscale: 'SSS' },
    { id: 'sss-9', question: '¿Qué tan severo es el adormecimiento u hormigueo en la noche?', options: [
      { score: 1, text: 'No tengo' }, { score: 2, text: 'Leve' }, { score: 3, text: 'Moderado' }, { score: 4, text: 'Severo' }, { score: 5, text: 'Muy severo' }, ], subscale: 'SSS' },
    { id: 'sss-10', question: '¿Con qué frecuencia la debilidad o el hormigueo lo despiertan?', options: [
      { score: 1, text: 'Nunca' }, { score: 2, text: 'Una vez' }, { score: 3, text: '2-3 veces' }, { score: 4, text: '4-5 veces' }, { score: 5, text: 'Más de 5 veces' }, ], subscale: 'SSS' },
    { id: 'sss-11', question: '¿Tiene dificultad para agarrar objetos pequeños (llaves, bolígrafos)?', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Mucha' }, { score: 5, text: 'Muy severa' }, ], subscale: 'SSS' },

    // FSS (8)
    { id: 'fss-1', question: 'Escritura', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-2', question: 'Abotonarse la ropa', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-3', question: 'Sostener un libro mientras lee', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-4', question: 'Agarre del auricular del teléfono', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-5', question: 'Apertura de frascos', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-6', question: 'Tareas domésticas', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-7', question: 'Llevar la cesta de la compra', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
    { id: 'fss-8', question: 'Bañarse y vestirse', options: [
      { score: 1, text: 'Sin dificultad' }, { score: 2, text: 'Poca' }, { score: 3, text: 'Moderada' }, { score: 4, text: 'Intensa' }, { score: 5, text: 'No puede' }, ], subscale: 'FSS' },
  ],

  subscales: [
    { id: 'SSS', name: 'Escala de Severidad de Síntomas', longName: 'Escala de Severidad de Síntomas (SSS)', interpretation: [
      { score: [1, 1.9], text: 'Síntomas leves' }, { score: [2, 3.4], text: 'Síntomas moderados' }, { score: [3.5, 5], text: 'Síntomas severos' }, ] },
    { id: 'FSS', name: 'Escala de Estado Funcional', longName: 'Escala de Estado Funcional (FSS)', interpretation: [
      { score: [1, 1.9], text: 'Función normal/leve' }, { score: [2, 3.4], text: 'Dificultad moderada' }, { score: [3.5, 5], text: 'Dificultad severa' }, ] },
  ],

  meta: {
    specialty: ['Neurología', 'Rehabilitación'],
    bodySegment: ['Miembro Superior'],
    functionalArea: ['Actividades de la Vida Diaria'],
  },
};

// Rango de interpretación utilizado por el hook useBostonAssessment
export const scoreInterpretation = {
  symptomSeverity: [
    { min: 1, max: 1.9, level: 'Síntomas leves' },
    { min: 2, max: 3.4, level: 'Síntomas moderados' },
    { min: 3.5, max: 5, level: 'Síntomas severos' },
  ],
  functionalStatus: [
    { min: 1, max: 1.9, level: 'Función normal/leve' },
    { min: 2, max: 3.4, level: 'Dificultad moderada' },
    { min: 3.5, max: 5, level: 'Dificultad severa' },
  ],
};
