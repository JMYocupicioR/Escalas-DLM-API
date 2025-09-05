import type { Scale } from '@/types/scale';
import { denver2 } from './denver';
import { boston, scoreInterpretation as bostonScoreInterp } from './boston';
import type { ScaleWithDetails, ScaleQuestion, QuestionOption, ScaleScoring, ScoringRange } from '@/api/scales/types';

export const scales: Scale[] = [
  denver2,
  // From functional.tsx
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    description: 'Evaluación de actividades básicas de la vida diaria',
    timeToComplete: '5-10 min',
    category: 'ADL',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'gas',
    name: 'Escala GAS',
    description: 'Consecución de objetivos personalizados en rehabilitación',
    timeToComplete: '10-20 min',
    category: 'Rehab',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    description: 'Evaluación del equilibrio y la marcha',
    timeToComplete: '10-15 min',
    category: 'Balance',
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'mmse',
    name: 'Mini-Mental State Examination',
    description: 'Evaluación del estado cognitivo',
    timeToComplete: '10 min',
    category: 'Cognitive',
    crossReferences: ['geriatria'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'norton',
    name: 'Escala de Norton',
    description: 'Valoración del riesgo de úlceras por presión',
    timeToComplete: '5 min',
    category: 'Risk',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'vas',
    name: 'Escala Visual Analógica',
    description: 'Evaluación del dolor',
    timeToComplete: '1 min',
    category: 'Pain',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
  },
  // From segmento.tsx
  {
    id: 'glasgow',
    name: 'Escala de Glasgow',
    description: 'Evaluación del nivel de consciencia',
    timeToComplete: '2 min',
    category: 'Neurology',
    crossReferences: ['trauma'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'house-brackmann',
    name: 'House-Brackmann',
    description: 'Evaluación de parálisis facial',
    timeToComplete: '5 min',
    category: 'Neurology',
    crossReferences: ['neurologia'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'oswestry',
    name: 'Índice de Discapacidad de Oswestry',
    description: 'Evaluación funcional de columna lumbar',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1571019614113-b8dcf0bf7e56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'borg',
    name: 'Escala de Borg',
    description: 'Evaluación de disnea',
    timeToComplete: '2 min',
    category: 'Cardiopulmonary',
    crossReferences: ['neumologia'],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-7a07110cb5d8?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'constant',
    name: 'Score de Constant',
    description: 'Evaluación funcional del hombro',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'harris',
    name: 'Harris Hip Score',
    description: 'Evaluación funcional de cadera',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'koos',
    name: 'KOOS',
    description: 'Evaluación de resultados en lesiones de rodilla',
    timeToComplete: '15 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'fim',
    name: 'Escala de Independencia Funcional (FIM)',
    description: 'Evaluación de la discapacidad y la carga de cuidados en rehabilitación.',
    timeToComplete: '20-30 min',
    category: 'Rehab',
    specialty: 'Medicina Física y Rehabilitación',
    imageUrl: 'https://images.unsplash.com/photo-1571019614113-b8dcf0bf7e56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'lequesne-rodilla-es-v1',
    name: 'Índice de Lequesne para Osteoartritis de Rodilla',
    description: 'Cuestionario para cuantificar dolor/malestar, distancia máxima de marcha y dificultades en la vida diaria en osteoartritis de rodilla.',
    timeToComplete: '3-5 min',
    category: 'Osteoartritis de rodilla',
    specialty: 'Traumatología',
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
    scoring: {
      method: 'sum',
      ranges: [
        {
          min: 0,
          max: 7,
          interpretation: 'Leve - Impacto limitado en la vida diaria.'
        },
        {
          min: 7.5,
          max: 13,
          interpretation: 'Moderada - Impacto significativo en la calidad de vida.'
        },
        {
          min: 13.5,
          max: 26,
          interpretation: 'Severa - Pronóstico malo para la función.'
        }
      ]
    }
  },
  {
    id: 'boston',
    name: 'Cuestionario de Boston',
    description: 'Evaluación de síntomas y función en síndrome del túnel carpiano',
    timeToComplete: '5-10 min',
    category: 'Neurology',
    specialty: 'Neurología',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'botulinum',
    name: 'Calculadora de Toxina Botulínica',
    description: 'Dosificación de toxina botulínica por músculo y puntos motores',
    timeToComplete: '10-15 min',
    category: 'Neurology',
    specialty: 'Neurología',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
];

export const scalesById = scales.reduce((acc, scale) => {
  acc[scale.id] = scale;
  return acc;
}, {} as Record<string, Scale>);

// Adapt Boston to generic evaluation shape expected by ScaleEvaluation
const buildBostonDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'boston';
  // Map simple questions to detailed questions
  let order = 0;
  const questions: ScaleQuestion[] = (boston.questions as any[]).map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = (q.options as any[]).map((opt: any, idx: number) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.score),
      option_label: String(opt.text),
      option_description: undefined,
      order_index: idx + 1,
      is_default: false,
      created_at: now,
    }));
    order += 1;
    const dq: ScaleQuestion = {
      id: `q_${order}`,
      scale_id: scaleId,
      question_id: questionId,
      question_text: String(q.question),
      description: undefined,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: q.subscale || undefined,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = [
    ...bostonScoreInterp.symptomSeverity.map((r, idx) => ({
      id: `r_sym_${idx+1}`,
      scoring_id: 'scoring_boston',
      min_value: r.min,
      max_value: r.max,
      interpretation_level: r.level,
      interpretation_text: r.level,
      order_index: idx + 1,
      created_at: now,
      color_code: undefined,
      recommendations: undefined,
    })),
    ...bostonScoreInterp.functionalStatus.map((r, idx) => ({
      id: `r_fun_${idx+1}`,
      scoring_id: 'scoring_boston',
      min_value: r.min,
      max_value: r.max,
      interpretation_level: r.level,
      interpretation_text: r.level,
      order_index: 100 + idx + 1,
      created_at: now,
      color_code: undefined,
      recommendations: undefined,
    })),
  ];

  const scoring: ScaleScoring = {
    id: 'scoring_boston',
    scale_id: scaleId,
    scoring_method: 'average',
    min_score: 1,
    max_score: 5,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: boston.name,
    acronym: boston.shortName,
    description: boston.description,
    category: boston.category,
    specialty: boston.specialty,
    body_system: undefined,
    tags: [],
    time_to_complete: boston.timeToComplete,
    popularity: 0,
    popular: false,
    image_url: undefined,
    instructions: boston.information,
    version: '1.0',
    language: 'es',
    status: 'active',
    created_at: now,
    updated_at: now,
    created_by: undefined,
    validated_by: undefined,
    validation_date: undefined,
    cross_references: [],
    doi: undefined,
    copyright_info: undefined,
    license: undefined,
    questions,
    scoring,
    references: [],
    translations: [],
  };
  return detailed;
};

const bostonDetailed = buildBostonDetailed();

const existingBostonIndex = scales.findIndex(s => s.id === 'boston');
if (existingBostonIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingBostonIndex] = { ...(scales[existingBostonIndex] as any), ...bostonDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.unshift(bostonDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['boston'] = bostonDetailed as any;
