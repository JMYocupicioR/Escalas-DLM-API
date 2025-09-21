// data/ogs.ts
import { CreateScaleRequest } from '@/api/scales/types';

export const ogsQuestions = [
  {
    id: 'rodilla-fase-media-apoyo',
    question: 'Rodilla en parte media de fase de apoyo',
    description: 'Evalúa la flexión o recurvatum de la rodilla.',
    question_type: 'single_choice',
    order_index: 1,
    options: [
      { option_value: 0, option_label: 'Flexión severa > 30°' },
      { option_value: 1, option_label: 'Flexión moderada 16–30°' },
      { option_value: 2, option_label: 'Flexión leve < 15°' },
      { option_value: 3, option_label: 'Neutral' },
      { option_value: 2, option_label: 'Recurvatum leve < 5°' },
      { option_value: 1, option_label: 'Recurvatum moderado 5–15°' },
      { option_value: 0, option_label: 'Recurvatum severo > 15°' }
    ]
  },
  {
    id: 'contacto-inicial-pie',
    question: 'Contacto inicial del pie',
    description: 'Evalúa la forma en que el pie hace contacto con el suelo.',
    question_type: 'single_choice',
    order_index: 2,
    options: [
      { option_value: 0, option_label: 'Punta (cabeza metatarsianos–falanges)' },
      { option_value: 1, option_label: 'Pie anterior (arco medio–cabeza metatarsiano)' },
      { option_value: 2, option_label: 'Pie plano' },
      { option_value: 3, option_label: 'Talón' }
    ]
  },
  {
    id: 'pie-fase-media-apoyo',
    question: 'Pie en parte media de fase de apoyo',
    description: 'Evalúa la posición del pie durante la fase media de apoyo.',
    question_type: 'single_choice',
    order_index: 3,
    options: [
      { option_value: 0, option_label: 'Pie en mecedora' },
      { option_value: 1, option_label: 'Equino' },
      { option_value: 2, option_label: 'Contacto ocasional y/o elevación temprana del talón (< 50% tiempo)' },
      { option_value: 3, option_label: 'Pie plano' }
    ]
  },
  {
    id: 'pie-posterior-fase-media-apoyo',
    question: 'Pie posterior en parte media de fase de apoyo',
    description: 'Evalúa la posición del talón.',
    question_type: 'single_choice',
    order_index: 4,
    options: [
      { option_value: 0, option_label: 'Talón en varo' },
      { option_value: 1, option_label: 'Talón en valgo' },
      { option_value: 2, option_label: 'Ocasionalmente neutral (< 50% tiempo)' },
      { option_value: 3, option_label: 'Neutral' }
    ]
  },
  {
    id: 'velocidad-marcha',
    question: 'Velocidad de marcha',
    description: 'Evalúa la consistencia de la velocidad del paciente.',
    question_type: 'single_choice',
    order_index: 5,
    options: [
      { option_value: 0, option_label: 'Una sola velocidad' },
      { option_value: 1, option_label: 'Velocidad variable (por solicitud)' }
    ]
  },
  {
    id: 'base-sustentacion',
    question: 'Base de sustentación',
    description: 'Evalúa la anchura de la base de apoyo al caminar.',
    question_type: 'single_choice',
    order_index: 6,
    options: [
      { option_value: 0, option_label: 'Posición en tijera franca (pie cruza línea media)' },
      { option_value: 1, option_label: 'Base angosta y/o rodillas pegadas' },
      { option_value: 2, option_label: 'Base amplia' },
      { option_value: 3, option_label: 'Normal (ancho de los hombros)' }
    ]
  },
  {
    id: 'aparatos-asistencia',
    question: 'Aparatos de asistencia',
    description: 'Evalúa el uso de dispositivos de asistencia para caminar.',
    question_type: 'single_choice',
    order_index: 7,
    options: [
      { option_value: 0, option_label: 'Andador (con asistencia)' },
      { option_value: 1, option_label: 'Andador (independiente)' },
      { option_value: 2, option_label: 'Muletas, bastones, otros' },
      { option_value: 3, option_label: 'Ninguno, independiente en distancias funcionales' }
    ]
  }
];

export const ogsScale: CreateScaleRequest = {
  name: 'Observational Gait Scale',
  acronym: 'OGS',
  description: 'Herramienta clínica cualitativa para valorar parámetros de la marcha, especialmente útil en población pediátrica con parálisis cerebral.',
  category: 'Funcional',
  specialty: 'Medicina Física y Rehabilitación',
  body_system: 'Sistema Musculoesquelético',
  tags: ['rehabilitación', 'marcha', 'parálisis cerebral', 'funcionalidad', 'gait'],
  time_to_complete: '15 minutos',
  instructions: 'Evalúe los parámetros de la marcha a partir de grabaciones de video de las extremidades inferiores. Puntúe cada ítem para la pierna izquierda y la derecha de forma independiente. Se recomienda la grabación de video para una puntuación precisa.',
  version: '1.0',
  language: 'es',
  cross_references: [],
  license: 'CC BY-NC 4.0',
  questions: ogsQuestions,
  scoring: {
    scoring_method: 'sum',
    min_score: 0,
    max_score: 22,
    ranges: [
      { min_value: 0, max_value: 5, interpretation_level: 'Grave', interpretation_text: 'Deficiencia severa en la marcha.', color_code: '#ef4444', order_index: 1 },
      { min_value: 6, max_value: 10, interpretation_level: 'Moderada', interpretation_text: 'Deficiencia moderada en la marcha.', color_code: '#f59e0b', order_index: 2 },
      { min_value: 11, max_value: 16, interpretation_level: 'Leve', interpretation_text: 'Deficiencia leve en la marcha.', color_code: '#f97316', order_index: 3 },
      { min_value: 17, max_value: 22, interpretation_level: 'Normal / Mínima', interpretation_text: 'Marcha con alteraciones mínimas.', color_code: '#22c55e', order_index: 4 },
    ],
  },
  references: [
    { title: 'The Observational Gait Scale Can Help Determine the GMFCS Level in Children With Cerebral Palsy', authors: ['Shabani S, et al.'], year: 2021, doi: '10.1097/JPO.0000000000003011', is_primary: true, reference_type: 'validation' },
    { title: 'Reliability and validity of the Observational Gait Scale in children with spastic diplegia', authors: ['Boyd RN, Graham HK'], year: 1999, journal: 'J Pediatr Orthop', volume: '19', pages: '97-101', is_primary: true, reference_type: 'original' },
  ],
};
