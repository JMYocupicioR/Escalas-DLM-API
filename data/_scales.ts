/**
 * @file data/_scales.ts
 * @description REGISTRO CENTRAL DE TODAS LAS ESCALAS MÉDICAS
 *
 * ⚠️ IMPORTANTE: Este archivo es el punto de entrada único para todas las escalas.
 * Toda nueva escala DEBE registrarse aquí.
 *
 * FLUJO DE TRABAJO:
 * 1. Importar la escala desde su archivo individual (ej: './katz')
 * 2. Agregar entrada básica en el array 'scales' con searchTerms
 * 3. Crear función build[Nombre]Detailed() que adapta al formato ScaleWithDetails
 * 4. Ejecutar la función y registrar en 'scalesById'
 *
 * Ver docs/ADDING_SCALES.md para guía completa.
 */

import type { Scale } from '@/types/scale';
import { denver2 } from './denver';
import { boston, scoreInterpretation as bostonScoreInterp } from './boston';
import { bergScale, questions as bergQuestions, scoreInterpretation as bergScoreInterp } from './berg';
import { katzScale, questions as katzQuestions, scoreInterpretation as katzScoreInterp } from './katz';
import { sf36Scale, questions as sf36Questions, scoreInterpretation as sf36ScoreInterp } from './sf36';
import { lequesneQuestions, getLequesneInterpretation } from './lequesne';
import { tinettiScale, tinettiQuestions, scoreInterpretation as tinettiScoreInterp } from './tinetti';
import { sixMWT } from './6mwt';
import type { ScaleWithDetails, ScaleQuestion, QuestionOption, ScaleScoring, ScoringRange } from '@/api/scales/types';

/**
 * Array principal de escalas médicas.
 *
 * ESTRUCTURA BÁSICA:
 * - id: Identificador único (minúsculas, sin espacios)
 * - name: Nombre completo de la escala
 * - description: Descripción breve
 * - category: Categoría principal (ADL, Balance, Neurology, etc.)
 * - searchTerms: Array de términos para búsqueda (abreviaturas, sinónimos)
 * - specialty: Especialidad médica (opcional)
 * - timeToComplete: Tiempo estimado de aplicación
 *
 * ⚠️ El array básico será enriquecido con datos detallados por las funciones
 * build[Nombre]Detailed() que se ejecutan al final de este archivo.
 */
export const scales: Scale[] = [
  denver2,
  // From functional.tsx
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    description: 'Evaluación de actividades básicas de la vida diaria',
    timeToComplete: '5-10 min',
    category: 'ADL',
    searchTerms: ['barthel', 'IB', 'actividades vida diaria', 'AVD', 'ABVD', 'independencia funcional', 'autocuidado'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'katz',
    name: 'Índice de Katz de Independencia en AVD',
    description: 'Evaluación de la independencia funcional en actividades básicas de la vida diaria en adultos mayores',
    timeToComplete: '5-10 min',
    category: 'ADL',
    specialty: 'Geriatría',
    searchTerms: ['katz', 'AVD', 'ABVD', 'actividades vida diaria', 'independencia funcional', 'geriatría', 'adulto mayor', 'autocuidado'],
    imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'gas',
    name: 'Escala GAS',
    description: 'Consecución de objetivos personalizados en rehabilitación',
    timeToComplete: '10-20 min',
    category: 'Rehab',
    searchTerms: ['GAS', 'goal attainment scaling', 'consecución objetivos', 'objetivos rehabilitación', 'metas terapéuticas'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    description: 'Evaluación del equilibrio y la marcha',
    timeToComplete: '10-15 min',
    category: 'Balance',
    searchTerms: ['tinetti', 'POMA', 'performance oriented mobility assessment', 'equilibrio', 'marcha', 'balance', 'caídas', 'riesgo caída'],
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'mmse',
    name: 'Mini-Mental State Examination',
    description: 'Evaluación del estado cognitivo',
    timeToComplete: '10 min',
    category: 'Cognitive',
    searchTerms: ['MMSE', 'mini mental', 'folstein', 'cognitivo', 'cognición', 'demencia', 'memoria', 'orientación'],
    crossReferences: ['geriatria'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'norton',
    name: 'Escala de Norton',
    description: 'Valoración del riesgo de úlceras por presión',
    timeToComplete: '5 min',
    category: 'Risk',
    searchTerms: ['norton', 'úlceras presión', 'UPP', 'escaras', 'decúbito', 'lesiones piel', 'riesgo úlceras'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'vas',
    name: 'Escala Visual Analógica',
    description: 'Evaluación del dolor',
    timeToComplete: '1 min',
    category: 'Pain',
    searchTerms: ['VAS', 'EVA', 'visual analógica', 'dolor', 'intensidad dolor', 'escala dolor'],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
  },
  // From segmento.tsx
  {
    id: 'glasgow',
    name: 'Escala de Glasgow',
    description: 'Evaluación del nivel de consciencia',
    timeToComplete: '2 min',
    category: 'Neurology',
    searchTerms: ['glasgow', 'GCS', 'coma scale', 'consciencia', 'nivel consciencia', 'trauma craneal', 'TCE'],
    crossReferences: ['trauma'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'house-brackmann',
    name: 'House-Brackmann',
    description: 'Evaluación de parálisis facial',
    timeToComplete: '5 min',
    category: 'Neurology',
    searchTerms: ['house-brackmann', 'HB', 'parálisis facial', 'nervio facial', 'VII par craneal', 'bell'],
    crossReferences: ['neurologia'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'oswestry',
    name: 'Índice de Discapacidad de Oswestry',
    description: 'Evaluación funcional de columna lumbar',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    searchTerms: ['oswestry', 'ODI', 'lumbar', 'columna lumbar', 'dolor lumbar', 'discapacidad lumbar', 'espalda baja'],
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1571019614113-b8dcf0bf7e56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'borg',
    name: 'Escala de Borg',
    description: 'Evaluación de disnea',
    timeToComplete: '2 min',
    category: 'Cardiopulmonary',
    searchTerms: ['borg', 'RPE', 'disnea', 'fatiga', 'esfuerzo percibido', 'ejercicio'],
    crossReferences: ['neumologia'],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-7a07110cb5d8?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'constant',
    name: 'Score de Constant',
    description: 'Evaluación funcional del hombro',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    searchTerms: ['constant', 'constant-murley', 'hombro', 'shoulder', 'dolor hombro', 'manguito rotador'],
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'harris',
    name: 'Harris Hip Score',
    description: 'Evaluación funcional de cadera',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    searchTerms: ['harris', 'HHS', 'cadera', 'hip', 'artroplastia cadera', 'prótesis cadera'],
    crossReferences: ['traumatologia'],
    imageUrl: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'koos',
    name: 'KOOS',
    description: 'Evaluación de resultados en lesiones de rodilla',
    timeToComplete: '15 min',
    category: 'Orthopedics',
    searchTerms: ['KOOS', 'knee injury', 'rodilla', 'osteoartritis rodilla', 'menisco', 'ligamento cruzado', 'LCA'],
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
    searchTerms: ['FIM', 'functional independence measure', 'independencia funcional', 'discapacidad', 'rehabilitación'],
    imageUrl: 'https://images.unsplash.com/photo-1571019614113-b8dcf0bf7e56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'lequesne-rodilla-es-v1',
    name: 'Índice de Lequesne para Osteoartritis de Rodilla',
    description: 'Cuestionario para cuantificar dolor/malestar, distancia máxima de marcha y dificultades en la vida diaria en osteoartritis de rodilla.',
    timeToComplete: '3-5 min',
    category: 'Osteoartritis de rodilla',
    specialty: 'Traumatología',
    searchTerms: ['lequesne', 'osteoartritis', 'OA', 'artrosis rodilla', 'gonartrosis', 'dolor rodilla'],
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
    searchTerms: ['boston', 'BCTQ', 'túnel carpiano', 'STC', 'carpal tunnel', 'nervio mediano', 'muñeca'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'botulinum',
    name: 'Calculadora de Toxina Botulínica',
    description: 'Dosificación de toxina botulínica por músculo y puntos motores',
    timeToComplete: '10-15 min',
    category: 'Neurology',
    specialty: 'Neurología',
    searchTerms: ['botulinum', 'toxina botulinica', 'botox', 'dysport', 'espasticidad', 'distonía', 'infiltración'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'ogs',
    name: 'Observational Gait Scale',
    description: 'Herramienta clínica cualitativa para valorar parámetros de la marcha, especialmente útil en población pediátrica con parálisis cerebral.',
    timeToComplete: '15 min',
    category: 'Funcional',
    specialty: 'Medicina Física y Rehabilitación',
    searchTerms: ['OGS', 'marcha', 'gait', 'parálisis cerebral', 'PC', 'marcha observacional', 'análisis marcha'],
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'hine',
    name: 'Hammersmith Infant Neurological Examination',
    description: 'Evaluación neurológica estandarizada para lactantes de 2 a 24 meses',
    timeToComplete: '30-45 min',
    category: 'Neurology',
    specialty: 'Neurología Pediátrica',
    searchTerms: ['HINE', 'hammersmith', 'lactante', 'neurológico infantil', 'desarrollo motor', 'hipotonía'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'berg',
    name: 'Escala de Equilibrio de Berg',
    description: 'Evaluación funcional del equilibrio estático y dinámico a través de 14 tareas',
    timeToComplete: '15-20 min',
    category: 'Balance',
    specialty: 'Medicina Física y Rehabilitación',
    searchTerms: ['berg', 'BBS', 'berg balance scale', 'equilibrio', 'balance', 'caídas', 'marcha', 'estabilidad'],
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: '6mwt',
    name: 'Test de Marcha de 6 Minutos',
    description: 'Evaluación de la capacidad funcional y tolerancia al ejercicio mediante distancia recorrida',
    timeToComplete: '15-20 min',
    category: 'Cardiopulmonary',
    specialty: 'Medicina Física y Rehabilitación',
    searchTerms: ['6MWT', '6 minutos', 'six minute walk', 'caminata', 'capacidad funcional', 'cardiopulmonar', 'ejercicio'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: 'sf36',
    name: 'Cuestionario de Salud SF-36',
    description: 'Cuestionario de calidad de vida relacionada con la salud que evalúa 8 dimensiones del estado de salud físico y mental',
    timeToComplete: '10-15 min',
    category: 'Calidad de Vida',
    specialty: 'Medicina General',
    searchTerms: ['sf-36', 'sf36', 'calidad de vida', 'CVRS', 'salud general', 'función física', 'salud mental', 'dolor', 'vitalidad', 'función social', 'quality of life', 'health survey'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop&crop=center',
  },
];

export const scalesById = scales.reduce((acc, scale) => {
  acc[scale.id] = scale;
  return acc;
}, {} as Record<string, Scale>);

/**
 * ============================================================================
 * SECCIÓN DE ADAPTADORES
 * ============================================================================
 *
 * Las funciones build[Nombre]Detailed() convierten definiciones simples de
 * escalas al formato ScaleWithDetails requerido por ScaleEvaluation.
 *
 * PATRÓN ESTÁNDAR:
 * 1. Mapear questions[] → ScaleQuestion[] con IDs únicos y metadatos
 * 2. Mapear opciones → QuestionOption[] con valores numéricos
 * 3. Crear ScoringRange[] desde scoreInterpretation
 * 4. Construir objeto ScaleScoring completo
 * 5. Ensamblar ScaleWithDetails con todos los campos
 *
 * ⚠️ IMPORTANTE: Cada escala estándar (basada en preguntas) REQUIERE su
 * función adaptadora. Sin ella, ScaleEvaluation no podrá renderizarla.
 *
 * Ver docs/ARCHITECTURE.md sección "Sistema de Adaptación" para detalles.
 */

/**
 * Adapta Cuestionario de Boston al formato ScaleWithDetails.
 *
 * Boston tiene 2 subescalas:
 * - Severidad de síntomas (11 preguntas)
 * - Estado funcional (8 preguntas)
 *
 * Scoring: Promedio de respuestas por subescala (1-5 puntos)
 */
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

// Adapt Berg to generic evaluation shape expected by ScaleEvaluation
const buildBergDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'berg';

  let order = 0;
  const questions: ScaleQuestion[] = bergQuestions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
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
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: undefined,
      instructions: q.instructions,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = bergScoreInterp.map((r, idx) => ({
    id: `r_berg_${idx+1}`,
    scoring_id: 'scoring_berg',
    min_value: r.min,
    max_value: r.max,
    interpretation_level: r.level,
    interpretation_text: `${r.description} - ${r.risk}`,
    order_index: idx + 1,
    created_at: now,
    color_code: r.color,
    recommendations: undefined,
  }));

  const scoring: ScaleScoring = {
    id: 'scoring_berg',
    scale_id: scaleId,
    scoring_method: 'sum',
    min_score: 0,
    max_score: 56,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: bergScale.name,
    acronym: bergScale.shortName,
    description: bergScale.description,
    category: bergScale.category,
    specialty: bergScale.specialty,
    body_system: 'Sistema Nervioso y Musculoesquelético',
    tags: ['equilibrio', 'balance', 'caídas', 'adulto mayor', 'neurología'],
    time_to_complete: bergScale.timeToComplete,
    popularity: 0,
    popular: false,
    image_url: undefined,
    instructions: bergScale.information,
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
    license: 'Public Domain',
    questions,
    scoring,
    references: [
      {
        id: 'ref_berg_1',
        scale_id: scaleId,
        title: 'Measuring balance in the elderly: validation of an instrument',
        authors: ['Berg KO', 'Wood-Dauphinee SL', 'Williams JI', 'Maki B'],
        year: 1992,
        journal: 'Can J Public Health',
        volume: '83 Suppl 2',
        pages: 'S7-11',
        is_primary: true,
        reference_type: 'original',
        created_at: now,
      },
      {
        id: 'ref_berg_2',
        scale_id: scaleId,
        title: 'The Balance Scale: reliability assessment with elderly residents and patients with an acute stroke',
        authors: ['Berg K', 'Wood-Dauphinee S', 'Williams JI'],
        year: 1995,
        journal: 'Scand J Rehabil Med',
        volume: '27',
        issue: '1',
        pages: '27-36',
        is_primary: true,
        reference_type: 'validation',
        created_at: now,
      },
    ],
    translations: [],
  };
  return detailed;
};

const bergDetailed = buildBergDetailed();

const existingBergIndex = scales.findIndex(s => s.id === 'berg');
if (existingBergIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingBergIndex] = { ...(scales[existingBergIndex] as any), ...bergDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(bergDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['berg'] = bergDetailed as any;

// Adapt Katz to generic evaluation shape expected by ScaleEvaluation
const buildKatzDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'katz';

  let order = 0;
  const questions: ScaleQuestion[] = katzQuestions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
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
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: q.category,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = katzScoreInterp.map((r, idx) => ({
    id: `r_katz_${idx+1}`,
    scoring_id: 'scoring_katz',
    min_value: r.score,
    max_value: r.score,
    interpretation_level: `${r.level} - ${r.description}`,
    interpretation_text: r.interpretation,
    order_index: idx + 1,
    created_at: now,
    color_code: r.color,
    recommendations: undefined,
  }));

  const scoring: ScaleScoring = {
    id: 'scoring_katz',
    scale_id: scaleId,
    scoring_method: 'sum',
    min_score: 0,
    max_score: 6,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: katzScale.name,
    acronym: katzScale.shortName,
    description: katzScale.description,
    category: katzScale.category,
    specialty: katzScale.specialty,
    body_system: 'Sistema Funcional',
    tags: ['AVD', 'ABVD', 'independencia', 'geriatría', 'funcional', 'autocuidado'],
    time_to_complete: katzScale.timeToComplete,
    popularity: 0,
    popular: true,
    image_url: undefined,
    instructions: katzScale.information,
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
    license: 'Public Domain',
    questions,
    scoring,
    references: [
      {
        id: 'ref_katz_1',
        scale_id: scaleId,
        title: 'Studies of illness in the aged. The Index of ADL: A standardized measure of biological and psychosocial function',
        authors: ['Katz S', 'Ford AB', 'Moskowitz RW', 'Jackson BA', 'Jaffe MW'],
        year: 1963,
        journal: 'JAMA',
        volume: '185',
        pages: '914-919',
        is_primary: true,
        reference_type: 'original',
        created_at: now,
      },
      {
        id: 'ref_katz_2',
        scale_id: scaleId,
        title: 'Progress in development of the index of ADL',
        authors: ['Katz S', 'Downs TD', 'Cash HR', 'Grotz RC'],
        year: 1970,
        journal: 'Gerontologist',
        volume: '10',
        issue: '1',
        pages: '20-30',
        is_primary: true,
        reference_type: 'validation',
        created_at: now,
      },
    ],
    translations: [],
  };
  return detailed;
};

const katzDetailed = buildKatzDetailed();

const existingKatzIndex = scales.findIndex(s => s.id === 'katz');
if (existingKatzIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingKatzIndex] = { ...(scales[existingKatzIndex] as any), ...katzDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(katzDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['katz'] = katzDetailed as any;

// ============================================================================
// SF-36: Cuestionario de Salud SF-36
// ============================================================================

const buildSF36Detailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'sf36';

  let order = 0;
  const questions: ScaleQuestion[] = sf36Questions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
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
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: q.dimension,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = sf36ScoreInterp.map((r, idx) => ({
    id: `r_sf36_${idx+1}`,
    scoring_id: 'scoring_sf36',
    min_value: r.min,
    max_value: r.max,
    interpretation_level: r.level,
    interpretation_text: r.description,
    order_index: idx + 1,
    created_at: now,
    color_code: r.color,
    recommendations: undefined,
  }));

  const scoring: ScaleScoring = {
    id: 'scoring_sf36',
    scale_id: scaleId,
    scoring_method: 'complex',
    min_score: 0,
    max_score: 100,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: sf36Scale.name,
    acronym: sf36Scale.acronym,
    description: sf36Scale.description,
    category: sf36Scale.category,
    specialty: sf36Scale.specialty,
    body_system: sf36Scale.bodySystem || 'Multisistémico',
    tags: sf36Scale.tags || [],
    time_to_complete: sf36Scale.timeToComplete,
    popularity: 0,
    popular: false,
    image_url: sf36Scale.imageUrl,
    instructions: sf36Scale.information,
    version: sf36Scale.version,
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
    license: 'Public Domain',
    questions,
    scoring,
    references: sf36Scale.references?.map((ref, idx) => ({
      id: `ref_sf36_${idx+1}`,
      scale_id: scaleId,
      title: ref.title,
      authors: ref.authors,
      year: ref.year,
      journal: ref.journal,
      volume: ref.volume,
      issue: ref.issue,
      pages: ref.pages,
      doi: ref.doi,
      is_primary: true,
      reference_type: 'validation',
      created_at: now,
    })) || [],
    translations: [],
  };
  return detailed;
};

const sf36Detailed = buildSF36Detailed();

const existingSF36Index = scales.findIndex(s => s.id === 'sf36');
if (existingSF36Index !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingSF36Index] = { ...(scales[existingSF36Index] as any), ...sf36Detailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(sf36Detailed as any);
}

// @ts-ignore attach detailed to map
scalesById['sf36'] = sf36Detailed as any;

// ============================================================================
// LEQUESNE: Índice de Lequesne para Osteoartritis de Rodilla
// ============================================================================

/**
 * Adapta el Índice de Lequesne al formato ScaleWithDetails.
 *
 * Lequesne evalúa:
 * - Dolor nocturno (0-2)
 * - Rigidez matutina (0-2)
 * - Dolor en bipedestación (0-1)
 * - Dolor al caminar (0-2)
 * - Dolor al levantarse (0-1)
 * - Distancia máxima de marcha (0-7)
 * - Ayuda para caminar (0-3)
 * - Subir escaleras (0-2, con 0.5 incrementos)
 * - Bajar escaleras (0-2, con 0.5 incrementos)
 * - Ponerse en cuclillas (0-2, con 0.5 incrementos)
 * - Caminar en terreno desigual (0-2, con 0.5 incrementos)
 *
 * Scoring: Suma directa (0-26 puntos)
 * - 0-7: Leve
 * - 7.5-13: Moderada
 * - 13.5-26: Severa
 */
const buildLequesneDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'lequesne-rodilla-es-v1';

  let order = 0;
  const questions: ScaleQuestion[] = lequesneQuestions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
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
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: undefined,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  // Create scoring ranges based on Lequesne interpretation levels
  const ranges: ScoringRange[] = [
    {
      id: 'r_lequesne_1',
      scoring_id: 'scoring_lequesne',
      min_value: 0,
      max_value: 7,
      interpretation_level: 'Leve',
      interpretation_text: 'Impacto limitado en la vida diaria. Mantener actividad física moderada y control médico periódico.',
      order_index: 1,
      created_at: now,
      color_code: '#10B981',
      recommendations: 'Mantener actividad física moderada y control médico periódico.',
    },
    {
      id: 'r_lequesne_2',
      scoring_id: 'scoring_lequesne',
      min_value: 7.5,
      max_value: 13,
      interpretation_level: 'Moderada',
      interpretation_text: 'Impacto significativo en la calidad de vida. Considerar fisioterapia, analgésicos y evaluación ortopédica.',
      order_index: 2,
      created_at: now,
      color_code: '#F59E0B',
      recommendations: 'Considerar fisioterapia, analgésicos y evaluación ortopédica.',
    },
    {
      id: 'r_lequesne_3',
      scoring_id: 'scoring_lequesne',
      min_value: 13.5,
      max_value: 26,
      interpretation_level: 'Severa',
      interpretation_text: 'Pronóstico malo para la función. Evaluación ortopédica urgente, considerar opciones quirúrgicas.',
      order_index: 3,
      created_at: now,
      color_code: '#EF4444',
      recommendations: 'Evaluación ortopédica urgente, considerar opciones quirúrgicas.',
    },
  ];

  const scoring: ScaleScoring = {
    id: 'scoring_lequesne',
    scale_id: scaleId,
    scoring_method: 'sum',
    min_score: 0,
    max_score: 26,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: 'Índice de Lequesne para Osteoartritis de Rodilla',
    acronym: 'Lequesne',
    description: 'Cuestionario para cuantificar dolor/malestar, distancia máxima de marcha y dificultades en la vida diaria en osteoartritis de rodilla.',
    category: 'Orthopedics',
    specialty: 'Traumatología',
    body_system: 'Sistema Musculoesquelético',
    tags: ['lequesne', 'osteoartritis', 'OA', 'artrosis', 'rodilla', 'gonartrosis', 'dolor rodilla', 'funcional'],
    time_to_complete: '3-5 min',
    popularity: 0,
    popular: false,
    image_url: 'https://images.unsplash.com/photo-1594824804732-5eaaea6da8e7?w=400&h=300&fit=crop&crop=center',
    instructions: 'Responda a cada pregunta seleccionando la opción que mejor describa su situación actual en relación a su rodilla afectada.',
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
    license: 'Public Domain',
    questions,
    scoring,
    references: [
      {
        id: 'ref_lequesne_1',
        scale_id: scaleId,
        title: 'The Lequesne algofunctional indices for hip and knee osteoarthritis',
        authors: ['Lequesne MG', 'Mery C', 'Samson M', 'Gerard P'],
        year: 1987,
        journal: 'J Rheumatol',
        volume: '14',
        issue: '1',
        pages: '3-6',
        is_primary: true,
        reference_type: 'original',
        created_at: now,
      },
    ],
    translations: [],
  };
  return detailed;
};

const lequesneDetailed = buildLequesneDetailed();

const existingLequesneIndex = scales.findIndex(s => s.id === 'lequesne-rodilla-es-v1');
if (existingLequesneIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingLequesneIndex] = { ...(scales[existingLequesneIndex] as any), ...lequesneDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(lequesneDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['lequesne-rodilla-es-v1'] = lequesneDetailed as any;

// ============================================================================
// TINETTI: Escala de Tinetti (POMA - Performance Oriented Mobility Assessment)
// ============================================================================

/**
 * Adapta la Escala de Tinetti al formato ScaleWithDetails.
 *
 * Tinetti/POMA evalúa:
 * - Equilibrio (9 ítems, máx 16 puntos):
 *   - Equilibrio sentado, levantarse, intentos, equilibrio de pie (inmediato y prolongado)
 *   - Romberg, resistencia al empujón, giro 360°, sentarse
 * - Marcha (7 ítems, máx 12 puntos):
 *   - Inicio, longitud y altura del paso (bilateral), simetría, continuidad,
 *   - trayectoria, tronco, distancia entre pies
 *
 * Scoring: Suma directa (0-28 puntos)
 * - 25-28: Riesgo bajo de caídas
 * - 19-24: Riesgo moderado de caídas
 * - 0-18: Riesgo alto de caídas
 */
const buildTinettiDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'tinetti';

  let order = 0;
  const questions: ScaleQuestion[] = tinettiQuestions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
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
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: q.section,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = tinettiScoreInterp.map((r, idx) => ({
    id: `r_tinetti_${idx+1}`,
    scoring_id: 'scoring_tinetti',
    min_value: r.min,
    max_value: r.max,
    interpretation_level: r.level,
    interpretation_text: `${r.description} - ${r.risk}`,
    order_index: idx + 1,
    created_at: now,
    color_code: r.color,
    recommendations: r.risk,
  }));

  const scoring: ScaleScoring = {
    id: 'scoring_tinetti',
    scale_id: scaleId,
    scoring_method: 'sum',
    min_score: 0,
    max_score: 28,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: tinettiScale.name,
    acronym: tinettiScale.shortName,
    description: tinettiScale.description,
    category: tinettiScale.category,
    specialty: tinettiScale.specialty,
    body_system: 'Sistema Nervioso y Musculoesquelético',
    tags: ['tinetti', 'POMA', 'equilibrio', 'marcha', 'balance', 'caídas', 'riesgo caída', 'geriatría', 'adulto mayor'],
    time_to_complete: tinettiScale.timeToComplete,
    popularity: 0,
    popular: false,
    image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop&crop=center',
    instructions: tinettiScale.information,
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
    license: 'Public Domain',
    questions,
    scoring,
    references: [
      {
        id: 'ref_tinetti_1',
        scale_id: scaleId,
        title: 'Performance-oriented assessment of mobility problems in elderly patients',
        authors: ['Tinetti ME'],
        year: 1986,
        journal: 'J Am Geriatr Soc',
        volume: '34',
        issue: '2',
        pages: '119-126',
        is_primary: true,
        reference_type: 'original',
        created_at: now,
      },
      {
        id: 'ref_tinetti_2',
        scale_id: scaleId,
        title: 'Fall risk index for elderly patients based on number of chronic disabilities',
        authors: ['Tinetti ME', 'Williams TF', 'Mayewski R'],
        year: 1986,
        journal: 'Am J Med',
        volume: '80',
        issue: '3',
        pages: '429-434',
        is_primary: true,
        reference_type: 'validation',
        created_at: now,
      },
    ],
    translations: [],
  };
  return detailed;
};

const tinettiDetailed = buildTinettiDetailed();

const existingTinettiIndex = scales.findIndex(s => s.id === 'tinetti');
if (existingTinettiIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingTinettiIndex] = { ...(scales[existingTinettiIndex] as any), ...tinettiDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(tinettiDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['tinetti'] = tinettiDetailed as any;
