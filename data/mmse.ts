/**
 * @file data/mmse.ts
 * @description Mini-Mental State Examination (MMSE) de Folstein
 *
 * Escala de evaluación cognitiva más utilizada mundialmente.
 * Evalúa orientación, memoria, atención, cálculo, lenguaje y construcción.
 *
 * Puntuación total: 0-30 puntos
 * - 24-30: Normal
 * - 18-23: Deterioro cognitivo leve
 * - 0-17: Deterioro cognitivo severo
 *
 * Referencia: Folstein MF, Folstein SE, McHugh PR. "Mini-mental state".
 * A practical method for grading the cognitive state of patients for the clinician.
 * J Psychiatr Res. 1975;12(3):189-198.
 */

export interface MMSEQuestion {
  id: string;
  question: string;
  description?: string;
  category: string;
  points: number;
  options: {
    label: string;
    value: number;
    description?: string;
  }[];
  order_index: number;
  question_type: 'single_choice' | 'text_input';
  instructions?: string;
}

export const mmseScale = {
  id: 'mmse',
  name: 'Mini-Mental State Examination',
  shortName: 'MMSE',
  acronym: 'MMSE',
  description: 'Evaluación del estado cognitivo global. Herramienta de cribado para detectar deterioro cognitivo y demencia.',
  category: 'Cognitive',
  specialty: 'Neurología',
  timeToComplete: '10 min',
  information: `El Mini-Mental State Examination (MMSE) es la prueba de cribado cognitivo más ampliamente utilizada en el mundo. Fue desarrollado por Marshal Folstein y colaboradores en 1975.

**Dominios evaluados:**
- **Orientación temporal y espacial** (10 puntos)
- **Memoria inmediata** - Registro (3 puntos)
- **Atención y cálculo** (5 puntos)
- **Memoria diferida** - Recuerdo (3 puntos)
- **Lenguaje** (8 puntos)
- **Construcción visuoespacial** (1 punto)

**Puntuación total: 0-30 puntos**

**Interpretación:**
- 24-30 puntos: Función cognitiva normal
- 18-23 puntos: Deterioro cognitivo leve
- 0-17 puntos: Deterioro cognitivo severo

**Ajuste por escolaridad:**
Se recomienda sumar 1 punto si la persona tiene ≤8 años de escolaridad.

**Consideraciones:**
- Altamente influenciado por nivel educativo
- Puede presentar efecto techo en personas con alta escolaridad
- Menos sensible para detectar deterioro cognitivo leve que MoCA
- Excelente para seguimiento de demencia moderada-severa`,
  version: '1.0',
  language: 'es',
  body_system: 'Sistema Nervioso Central',
  tags: ['cognición', 'demencia', 'screening', 'folstein', 'memoria', 'orientación'],
  cross_references: ['MoCA', 'Katz'],
  license: 'Public Domain',
  references: [
    {
      title: 'Mini-mental state. A practical method for grading the cognitive state of patients for the clinician',
      authors: ['Folstein MF', 'Folstein SE', 'McHugh PR'],
      year: 1975,
      journal: 'J Psychiatr Res',
      volume: '12',
      issue: '3',
      pages: '189-198',
      pmid: '1202204',
      is_primary: true,
      reference_type: 'original',
    },
    {
      title: 'Validity and reliability of the Mini-Mental State Examination in dementia screening',
      authors: ['Tombaugh TN', 'McIntyre NJ'],
      year: 1992,
      journal: 'J Am Geriatr Soc',
      volume: '40',
      issue: '9',
      pages: '922-935',
      is_primary: true,
      reference_type: 'validation',
    },
  ],
};

export const mmseQuestions: MMSEQuestion[] = [
  // ============================================================================
  // ORIENTACIÓN TEMPORAL (5 puntos)
  // ============================================================================
  {
    id: 'mmse-q1',
    question: '¿En qué año estamos?',
    category: 'Orientación Temporal',
    points: 1,
    order_index: 1,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q2',
    question: '¿En qué estación del año estamos?',
    category: 'Orientación Temporal',
    points: 1,
    order_index: 2,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q3',
    question: '¿En qué mes estamos?',
    category: 'Orientación Temporal',
    points: 1,
    order_index: 3,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q4',
    question: '¿Qué día del mes es hoy?',
    category: 'Orientación Temporal',
    points: 1,
    order_index: 4,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q5',
    question: '¿Qué día de la semana es hoy?',
    category: 'Orientación Temporal',
    points: 1,
    order_index: 5,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },

  // ============================================================================
  // ORIENTACIÓN ESPACIAL (5 puntos)
  // ============================================================================
  {
    id: 'mmse-q6',
    question: '¿En qué país estamos?',
    category: 'Orientación Espacial',
    points: 1,
    order_index: 6,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q7',
    question: '¿En qué provincia/estado estamos?',
    category: 'Orientación Espacial',
    points: 1,
    order_index: 7,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q8',
    question: '¿En qué ciudad/pueblo estamos?',
    category: 'Orientación Espacial',
    points: 1,
    order_index: 8,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q9',
    question: '¿En qué lugar estamos? (hospital, clínica, consultorio)',
    category: 'Orientación Espacial',
    points: 1,
    order_index: 9,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q10',
    question: '¿En qué piso/planta estamos?',
    category: 'Orientación Espacial',
    points: 1,
    order_index: 10,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },

  // ============================================================================
  // REGISTRO/MEMORIA INMEDIATA (3 puntos)
  // ============================================================================
  {
    id: 'mmse-q11',
    question: 'Palabra 1 recordada (Ej: PELOTA, BANDERA, ÁRBOL)',
    description: 'Diga al paciente 3 palabras no relacionadas. Luego pida que las repita. Registre 1 punto por cada palabra correcta.',
    category: 'Memoria Inmediata',
    points: 1,
    order_index: 11,
    question_type: 'single_choice',
    instructions: 'Pronunciar claramente cada palabra (1 segundo cada una). Puntuación por primer intento. Repetir hasta que aprenda las 3 (máximo 6 intentos).',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },
  {
    id: 'mmse-q12',
    question: 'Palabra 2 recordada',
    category: 'Memoria Inmediata',
    points: 1,
    order_index: 12,
    question_type: 'single_choice',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },
  {
    id: 'mmse-q13',
    question: 'Palabra 3 recordada',
    category: 'Memoria Inmediata',
    points: 1,
    order_index: 13,
    question_type: 'single_choice',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },

  // ============================================================================
  // ATENCIÓN Y CÁLCULO (5 puntos)
  // ============================================================================
  {
    id: 'mmse-q14',
    question: 'Serie de 7: 100 - 7 = 93',
    description: 'Pida al paciente que reste 7 de 100, y continúe restando 7 del resultado 5 veces (93, 86, 79, 72, 65). 1 punto por cada respuesta correcta. Deténgase después de 5 restas.',
    category: 'Atención y Cálculo',
    points: 1,
    order_index: 14,
    question_type: 'single_choice',
    instructions: 'Alternativa: Deletrear MUNDO al revés (ODNUM). 1 punto por cada letra en posición correcta.',
    options: [
      { label: 'Correcto (93)', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q15',
    question: 'Serie de 7: 93 - 7 = 86',
    category: 'Atención y Cálculo',
    points: 1,
    order_index: 15,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto (86)', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q16',
    question: 'Serie de 7: 86 - 7 = 79',
    category: 'Atención y Cálculo',
    points: 1,
    order_index: 16,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto (79)', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q17',
    question: 'Serie de 7: 79 - 7 = 72',
    category: 'Atención y Cálculo',
    points: 1,
    order_index: 17,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto (72)', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },
  {
    id: 'mmse-q18',
    question: 'Serie de 7: 72 - 7 = 65',
    category: 'Atención y Cálculo',
    points: 1,
    order_index: 18,
    question_type: 'single_choice',
    options: [
      { label: 'Correcto (65)', value: 1 },
      { label: 'Incorrecto', value: 0 },
    ],
  },

  // ============================================================================
  // MEMORIA DIFERIDA/RECUERDO (3 puntos)
  // ============================================================================
  {
    id: 'mmse-q19',
    question: 'Recuerdo diferido: Palabra 1',
    description: 'Pregunte al paciente por las 3 palabras que se le pidió recordar anteriormente. 1 punto por cada palabra correcta.',
    category: 'Memoria Diferida',
    points: 1,
    order_index: 19,
    question_type: 'single_choice',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },
  {
    id: 'mmse-q20',
    question: 'Recuerdo diferido: Palabra 2',
    category: 'Memoria Diferida',
    points: 1,
    order_index: 20,
    question_type: 'single_choice',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },
  {
    id: 'mmse-q21',
    question: 'Recuerdo diferido: Palabra 3',
    category: 'Memoria Diferida',
    points: 1,
    order_index: 21,
    question_type: 'single_choice',
    options: [
      { label: 'Recordó correctamente', value: 1 },
      { label: 'No recordó', value: 0 },
    ],
  },

  // ============================================================================
  // LENGUAJE (8 puntos)
  // ============================================================================
  {
    id: 'mmse-q22',
    question: 'Nombrar: Reloj',
    description: 'Muestre un reloj y pregunte "¿Qué es esto?"',
    category: 'Lenguaje - Denominación',
    points: 1,
    order_index: 22,
    question_type: 'single_choice',
    options: [
      { label: 'Nombró correctamente', value: 1 },
      { label: 'No nombró correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q23',
    question: 'Nombrar: Lápiz',
    description: 'Muestre un lápiz/bolígrafo y pregunte "¿Qué es esto?"',
    category: 'Lenguaje - Denominación',
    points: 1,
    order_index: 23,
    question_type: 'single_choice',
    options: [
      { label: 'Nombró correctamente', value: 1 },
      { label: 'No nombró correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q24',
    question: 'Repetición: "NI SÍ, NI NO, NI PERO"',
    description: 'Pida al paciente que repita exactamente la frase. Sólo 1 intento permitido.',
    category: 'Lenguaje - Repetición',
    points: 1,
    order_index: 24,
    question_type: 'single_choice',
    options: [
      { label: 'Repitió correctamente', value: 1 },
      { label: 'No repitió correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q25',
    question: 'Orden de 3 pasos - Paso 1: "Tome el papel"',
    description: 'Dé una hoja de papel y diga: "Tome este papel con su mano derecha, dóblelo por la mitad y póngalo en el suelo"',
    category: 'Lenguaje - Comprensión',
    points: 1,
    order_index: 25,
    question_type: 'single_choice',
    options: [
      { label: 'Ejecutó correctamente', value: 1 },
      { label: 'No ejecutó correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q26',
    question: 'Orden de 3 pasos - Paso 2: "Dóblelo por la mitad"',
    category: 'Lenguaje - Comprensión',
    points: 1,
    order_index: 26,
    question_type: 'single_choice',
    options: [
      { label: 'Ejecutó correctamente', value: 1 },
      { label: 'No ejecutó correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q27',
    question: 'Orden de 3 pasos - Paso 3: "Póngalo en el suelo"',
    category: 'Lenguaje - Comprensión',
    points: 1,
    order_index: 27,
    question_type: 'single_choice',
    options: [
      { label: 'Ejecutó correctamente', value: 1 },
      { label: 'No ejecutó correctamente', value: 0 },
    ],
  },
  {
    id: 'mmse-q28',
    question: 'Lectura: "CIERRE LOS OJOS"',
    description: 'Muestre la frase escrita "CIERRE LOS OJOS" y pida al paciente que lea y obedezca. Puntúe sólo si cierra los ojos.',
    category: 'Lenguaje - Lectura',
    points: 1,
    order_index: 28,
    question_type: 'single_choice',
    options: [
      { label: 'Obedeció (cerró los ojos)', value: 1 },
      { label: 'No obedeció', value: 0 },
    ],
  },
  {
    id: 'mmse-q29',
    question: 'Escritura: Escribir una frase completa',
    description: 'Pida al paciente que escriba una frase completa. Debe tener sujeto y verbo y tener sentido.',
    category: 'Lenguaje - Escritura',
    points: 1,
    order_index: 29,
    question_type: 'single_choice',
    instructions: 'No importa la ortografía ni la gramática.',
    options: [
      { label: 'Escribió frase válida', value: 1 },
      { label: 'No escribió frase válida', value: 0 },
    ],
  },

  // ============================================================================
  // CONSTRUCCIÓN VISUOESPACIAL (1 punto)
  // ============================================================================
  {
    id: 'mmse-q30',
    question: 'Copiar pentágonos intersectados',
    description: 'Pida al paciente que copie el dibujo de dos pentágonos que se intersectan. Cada uno debe tener 5 lados claramente distinguibles y la intersección debe formar un cuadrilátero.',
    category: 'Construcción Visuoespacial',
    points: 1,
    order_index: 30,
    question_type: 'single_choice',
    instructions: 'Los temblores y rotaciones se ignoran.',
    options: [
      { label: 'Copió correctamente', value: 1, description: 'Ambos pentágonos con 5 lados e intersección visible' },
      { label: 'Copió incorrectamente', value: 0, description: 'No cumple criterios' },
    ],
  },
];

export const scoreInterpretation = [
  {
    min: 24,
    max: 30,
    level: 'Normal',
    description: 'Función cognitiva normal',
    interpretation: 'El paciente presenta una función cognitiva global dentro de límites normales. No se detecta deterioro cognitivo significativo.',
    color: '#10B981', // green
    recommendations: 'Continuar con seguimiento habitual. Promover actividades de estimulación cognitiva y estilos de vida saludables.',
  },
  {
    min: 18,
    max: 23,
    level: 'Deterioro Leve',
    description: 'Deterioro cognitivo leve',
    interpretation: 'El paciente presenta deterioro cognitivo leve. Se recomienda evaluación neuropsicológica más detallada y descartar causas reversibles.',
    color: '#F59E0B', // amber
    recommendations: 'Evaluación neuropsicológica formal, neuroimagen, laboratorios (TSH, B12, etc.), valorar referencia a neurología/geriatría.',
  },
  {
    min: 0,
    max: 17,
    level: 'Deterioro Severo',
    description: 'Deterioro cognitivo severo',
    interpretation: 'El paciente presenta deterioro cognitivo severo. Requiere evaluación especializada urgente y valoración de capacidad funcional.',
    color: '#EF4444', // red
    recommendations: 'Referencia urgente a neurología/geriatría. Evaluación de seguridad y necesidades de cuidado. Valorar causas reversibles y opciones terapéuticas.',
  },
];

export const scoring = {
  scoring_method: 'sum' as const,
  min_score: 0,
  max_score: 30,
  ranges: scoreInterpretation.map((interp, idx) => ({
    min_value: interp.min,
    max_value: interp.max,
    interpretation_level: interp.level,
    interpretation_text: interp.interpretation,
    color_code: interp.color,
    order_index: idx + 1,
    recommendations: interp.recommendations,
  })),
};
