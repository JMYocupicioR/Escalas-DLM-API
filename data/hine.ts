import { CreateScaleRequest, CreateQuestionRequest, CreateOptionRequest } from '@/api/scales/types';

// Interfaz extendida para preguntas HINE con propiedades adicionales
interface HineQuestionData extends CreateQuestionRequest {
  section: string;
  section_order: number;
  scoring_weight?: number;
  has_asymmetry?: boolean;
}
type OptionInput = Omit<CreateOptionRequest, 'order_index'>;

const withOrderIndex = (options: OptionInput[]): CreateOptionRequest[] =>
  options.map((option, index) => ({
    ...option,
    order_index: index + 1
  }));



// Secciones principales de HINE
export const hineQuestionsData: HineQuestionData[] = [
  // Sección 1: Pares Craneales
  {
    question_id: 'apariencia_facial',
    question_text: 'Apariencia facial',
    section: 'Pares Craneales',
    section_order: 1,
    description: 'Evalúa la expresividad facial y reacción a estímulos.',
    question_type: 'single_choice' as const,
    order_index: 1,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Sonríe y/o reacciona a los estímulos...' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Cierra los ojos, pero no completamente. Pobre expresividad facial' },
      { option_value: 0, option_label: 'Facies inexpresiva. No reacciona a los estímulos' }
    ])
  },
  {
    question_id: 'apariencia_ocular',
    question_text: 'Apariencia ocular',
    section: 'Pares Craneales',
    section_order: 1,
    description: 'Evalúa movimientos oculares y coordinación.',
    question_type: 'single_choice' as const,
    order_index: 2,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Movimientos oculares conjugados normales' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Desviación intermitente de los ojos o nistagmo' },
      { option_value: 0, option_label: 'Desviación fija o nistagmo persistente' }
    ])
  },
  {
    question_id: 'respuesta_auditiva',
    question_text: 'Respuesta auditiva',
    section: 'Pares Craneales',
    section_order: 1,
    description: 'Evalúa la respuesta a estímulos auditivos.',
    question_type: 'single_choice' as const,
    order_index: 3,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Respuesta normal en ambos lados' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Respuesta asimétrica' },
      { option_value: 0, option_label: 'Sin respuesta' }
    ])
  },
  {
    question_id: 'succion_deglucion',
    question_text: 'Succión y deglución',
    section: 'Pares Craneales',
    section_order: 1,
    description: 'Evalúa la función de succión y deglución.',
    question_type: 'single_choice' as const,
    order_index: 4,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Succión fuerte y rítmica' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Succión débil o no rítmica' },
      { option_value: 0, option_label: 'Ausente' }
    ])
  },
  {
    question_id: 'vocalizacion_llanto',
    question_text: 'Vocalización y llanto',
    section: 'Pares Craneales',
    section_order: 1,
    description: 'Evalúa la calidad del llanto y vocalización.',
    question_type: 'single_choice' as const,
    order_index: 5,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Llanto fuerte y variado, vocalización adecuada para la edad' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Llanto agudo, ronco o débil' },
      { option_value: 0, option_label: 'Sin llanto o vocalización' }
    ])
  },

  // Sección 2: Postura
  {
    question_id: 'postura_reposo',
    question_text: 'Postura en reposo',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la postura general del lactante en reposo.',
    question_type: 'single_choice' as const,
    order_index: 6,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Postura relajada en flexión o extensión, adecuada para la edad' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Postura anormal persistente (ej. opistótonos)' },
      { option_value: 0, option_label: 'Postura anormal fija' }
    ])
  },
  {
    question_id: 'postura_brazos',
    question_text: 'Brazos',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la posición y movimientos de los brazos.',
    question_type: 'single_choice' as const,
    order_index: 7,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Posición variable, movimientos fluidos' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Postura distónica o puños cerrados persistentemente' },
      { option_value: 0, option_label: 'Postura anormal fija' }
    ])
  },
  {
    question_id: 'postura_piernas',
    question_text: 'Piernas',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la posición y movimientos de las piernas.',
    question_type: 'single_choice' as const,
    order_index: 8,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Posición variable, pataleo alternante' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Extensión o flexión persistente' },
      { option_value: 0, option_label: 'Postura anormal fija (ej. en tijera)' }
    ])
  },
  {
    question_id: 'postura_tronco',
    question_text: 'Tronco',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la posición del tronco.',
    question_type: 'single_choice' as const,
    order_index: 9,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Tronco alineado' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Opistótonos intermitente o tendencia a arquearse' },
      { option_value: 0, option_label: 'Opistótonos persistente' }
    ])
  },
  {
    question_id: 'postura_cabeza',
    question_text: 'Cabeza',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la posición de la cabeza.',
    question_type: 'single_choice' as const,
    order_index: 10,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Predominantemente en la línea media' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Giro preferencial persistente de la cabeza' },
      { option_value: 0, option_label: 'Retracción persistente o cabeza caída' }
    ])
  },
  {
    question_id: 'suspension_ventral',
    question_text: 'Suspensión ventral',
    section: 'Postura',
    section_order: 2,
    description: 'Evalúa la postura en suspensión ventral.',
    question_type: 'single_choice' as const,
    order_index: 11,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Cabeza y tronco en línea horizontal' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Cabeza por debajo de la horizontal' },
      { option_value: 0, option_label: 'Cabeza y extremidades cuelgan flácidas' }
    ])
  },

  // Sección 3: Movimientos
  {
    question_id: 'mov_cantidad',
    question_text: 'Cantidad',
    section: 'Movimientos',
    section_order: 3,
    description: 'Evalúa la cantidad de movimientos espontáneos.',
    question_type: 'single_choice' as const,
    order_index: 12,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Movimientos continuos y fluidos cuando está despierto' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Movimientos escasos' },
      { option_value: 0, option_label: 'Ausencia de movimientos espontáneos' }
    ])
  },
  {
    question_id: 'mov_calidad',
    question_text: 'Calidad',
    section: 'Movimientos',
    section_order: 3,
    description: 'Evalúa la calidad de los movimientos.',
    question_type: 'single_choice' as const,
    order_index: 13,
    scoring_weight: 3,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Movimientos fluidos y complejos' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Movimientos bruscos, clónicos, distónicos o atetósicos' },
      { option_value: 0, option_label: 'Movimientos predominantemente anormales' }
    ])
  },

  // Sección 4: Tono Muscular
  {
    question_id: 'tono_axial',
    question_text: 'Tono axial',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa el tono del tronco y eje axial.',
    question_type: 'single_choice' as const,
    order_index: 14,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Tono apropiado, permite movimientos activos' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Hipertonía o hipotonía leve a moderada' },
      { option_value: 0, option_label: 'Hipertonía o hipotonía grave' }
    ])
  },
  {
    question_id: 'tono_brazos',
    question_text: 'Tono de extremidades (Brazos)',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa el tono de las extremidades superiores.',
    question_type: 'single_choice' as const,
    order_index: 15,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Resistencia leve y elástica a la movilización pasiva' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Hipertonía o hipotonía leve a moderada' },
      { option_value: 0, option_label: 'Hipertonía o hipotonía grave' }
    ])
  },
  {
    question_id: 'tono_piernas',
    question_text: 'Tono de extremidades (Piernas)',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa el tono de las extremidades inferiores.',
    question_type: 'single_choice' as const,
    order_index: 16,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Resistencia leve y elástica a la movilización pasiva' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Hipertonía o hipotonía leve a moderada' },
      { option_value: 0, option_label: 'Hipertonía o hipotonía grave' }
    ])
  },
  {
    question_id: 'signo_bufanda',
    question_text: 'Signo de la bufanda',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa la flexibilidad del brazo cruzando sobre el pecho.',
    question_type: 'single_choice' as const,
    order_index: 17,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'El codo no sobrepasa la línea media' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'El codo sobrepasa la línea media' },
      { option_value: 0, option_label: 'El codo alcanza el hombro opuesto' }
    ])
  },
  {
    question_id: 'angulo_popliteo',
    question_text: 'Ángulo poplíteo',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa la flexibilidad de la rodilla.',
    question_type: 'single_choice' as const,
    order_index: 18,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Ángulo entre 100° y 150°' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Ángulo ~90° o >170°' },
      { option_value: 0, option_label: 'Ángulo < 80° (hipertonía severa)' }
    ])
  },
  {
    question_id: 'angulo_aductor',
    question_text: 'Ángulo aductor',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa la flexibilidad de los aductores de cadera.',
    question_type: 'single_choice' as const,
    order_index: 19,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Ángulo entre 80° y 150°' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Ángulo > 170° o entre 150°-160°' },
      { option_value: 0, option_label: 'Ángulo < 80° (hipertonía severa)' }
    ])
  },
  {
    question_id: 'dorsiflexion_pie',
    question_text: 'Dorsiflexión del pie',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa la flexibilidad del tobillo.',
    question_type: 'single_choice' as const,
    order_index: 20,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Ángulo entre 30° y 85°' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Ángulo < 20° o de 90°' },
      { option_value: 0, option_label: 'Ángulo > 90° (pie en punta) o clonus' }
    ])
  },
  {
    question_id: 'traccion_sedestacion',
    question_text: 'Tracción a la sedestación',
    section: 'Tono Muscular',
    section_order: 4,
    description: 'Evalúa la respuesta al traccionado hacia la sedestación.',
    question_type: 'single_choice' as const,
    order_index: 21,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'La cabeza acompaña al tronco o con un ligero retraso' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Retraso cefálico significativo' },
      { option_value: 0, option_label: 'Retraso cefálico completo' }
    ])
  },

  // Sección 5: Reflejos y Reacciones
  {
    question_id: 'reflejos_tendinosos',
    question_text: 'Reflejos tendinosos (Bíceps, rodilla)',
    section: 'Reflejos y Reacciones',
    section_order: 5,
    description: 'Evalúa los reflejos tendinosos.',
    question_type: 'single_choice' as const,
    order_index: 22,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Respuestas vivas y simétricas' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Hiperreflexia, hiporreflexia o asimetría' },
      { option_value: 0, option_label: 'Arreflexia o clonus persistente' }
    ])
  },
  {
    question_id: 'apoyo_plantar',
    question_text: 'Reacción de apoyo plantar',
    section: 'Reflejos y Reacciones',
    section_order: 5,
    description: 'Evalúa la reacción de apoyo en los pies.',
    question_type: 'single_choice' as const,
    order_index: 23,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([ // CORREGIDO para mayor precisión
      { option_value: 3, option_label: 'Apoya el talón (o planta completa si es >6m)' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Apoyo en puntillas o ausencia de apoyo' },
      { option_value: 0, option_label: 'Extensión tónica o en tijera' }
    ])
  },
  {
    question_id: 'apoyo_palmar',
    question_text: 'Reacción de apoyo palmar',
    section: 'Reflejos y Reacciones',
    section_order: 5,
    description: 'Evalúa la reacción de apoyo en las manos.',
    question_type: 'single_choice' as const,
    order_index: 24,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Soporta peso con manos abiertas' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'No soporta peso o lo hace con puños cerrados' },
      { option_value: 0, option_label: 'Retracción de brazos' }
    ])
  },
  {
    question_id: 'enderezamiento_cabeza',
    question_text: 'Reacciones de enderezamiento de la cabeza',
    section: 'Reflejos y Reacciones',
    section_order: 5,
    description: 'Evalúa las reacciones de enderezamiento cefálico.',
    question_type: 'single_choice' as const,
    order_index: 25,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Cabeza se alinea con el cuerpo en todas las direcciones' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Respuesta inconsistente o ausente en una dirección' },
      { option_value: 0, option_label: 'Ausente en todas las direcciones' }
    ])
  },
  {
    question_id: 'paracaidas_lateral',
    question_text: 'Paracaídas lateral',
    section: 'Reflejos y Reacciones',
    section_order: 5,
    description: 'Evalúa el reflejo paracaídas lateral.',
    question_type: 'single_choice' as const,
    order_index: 26,
    scoring_weight: 3,
    has_asymmetry: true,
    options: withOrderIndex([
      { option_value: 3, option_label: 'Presente y simétrico (si > 6-8m)' },
      { option_value: 2, option_label: 'Respuesta subóptima' },
      { option_value: 1, option_label: 'Respuesta asimétrica o ausente' },
      { option_value: 0, option_label: 'Ausente bilateralmente (si corresponde por edad)' }
    ])
  }
];

// Hitos motores
export const hineMotorMilestones = [
  { id: 'hito_cabeza', name: 'Control de cabeza (sostenida en sedestación)', normalAge: 'Normal a los 3-4 meses' },
  { id: 'hito_rodar', name: 'Rueda de supino a prono y viceversa', normalAge: 'Normal a los 6-7 meses' },
  { id: 'hito_sedestacion', name: 'Sedestación sin apoyo', normalAge: 'Normal a los 7-8 meses' },
  { id: 'hito_arrastre', name: 'Se arrastra sobre el abdomen', normalAge: 'Normal a los 7-8 meses' },
  { id: 'hito_gateo', name: 'Gatea sobre manos y rodillas', normalAge: 'Normal a los 9-10 meses' },
  { id: 'hito_bipedestacion_apoyo', name: 'Se pone de pie agarrándose', normalAge: 'Normal a los 9-10 meses' },
  { id: 'hito_camina_apoyo', name: 'Camina con apoyo', normalAge: 'Normal a los 10-11 meses' },
  { id: 'hito_bipedestacion_solo', name: 'Se mantiene de pie sin apoyo', normalAge: 'Normal a los 11-12 meses' },
  { id: 'hito_camina_solo', name: 'Camina sin apoyo', normalAge: 'Normal a los 12-15 meses' }
];

// Aspectos de conducta
export const hineBehaviorItems = [
  { id: 'conducta_alerta', name: 'Estado de alerta apropiado' },
  { id: 'conducta_visual', name: 'Contacto visual y seguimiento' },
  { id: 'conducta_consolable', name: 'Consolable' },
  { id: 'conducta_irritable', name: 'Irritable o letárgico' }
];

// Convertir las preguntas HINE al formato base requerido
const hineQuestionsForScale: CreateQuestionRequest[] = hineQuestionsData.map(
  ({ question_id, question_text, description, question_type, order_index, section, options }) => ({
    question_id,
    question_text,
    description,
    question_type,
    order_index,
    is_required: true,
    category: section,
    options
  })
);

export const hineScale: CreateScaleRequest = {
  name: 'Hammersmith Infant Neurological Examination',
  acronym: 'HINE',
  description: 'Evaluación neurológica estructurada para lactantes de 2 a 24 meses que valora pares craneales, postura, movimientos, tono y reflejos.',
  category: 'Neurología',
  specialty: 'Neurología Pediátrica',
  body_system: 'Sistema Nervioso',
  tags: ['neurología', 'lactantes', 'parálisis cerebral', 'desarrollo', 'evaluación neurológica'],
  time_to_complete: '30-45 minutos',
  instructions: 'Evaluación neurológica estructurada que incluye examen de pares craneales, postura, movimientos, tono muscular, reflejos y reacciones. Registre también hitos motores alcanzados y observaciones de conducta. La evaluación de asimetría es importante para detectar lesiones unilaterales.',
  version: '1.0',
  language: 'es',
  cross_references: [],
  license: 'CC BY-NC 4.0',
  questions: hineQuestionsForScale,
  scoring: {
    scoring_method: 'sum',
    min_score: 0,
    max_score: 78,
    ranges: [
      { min_value: 0, max_value: 39, interpretation_level: 'Riesgo Alto', interpretation_text: 'Puntuación que indica alto riesgo de alteraciones neurológicas significativas. Se requiere evaluación especializada urgente.', color_code: '#dc2626', order_index: 1 },
      { min_value: 40, max_value: 59, interpretation_level: 'Vigilancia', interpretation_text: 'Puntuación que sugiere la necesidad de vigilancia y seguimiento especializado. Posibles alteraciones neurológicas menores.', color_code: '#f59e0b', order_index: 2 },
      { min_value: 60, max_value: 72, interpretation_level: 'Normal', interpretation_text: 'Puntuación dentro del rango normal para la edad. Desarrollo neurológico apropiado.', color_code: '#16a34a', order_index: 3 },
      { min_value: 73, max_value: 78, interpretation_level: 'Óptimo', interpretation_text: 'Puntuación óptima que indica desarrollo neurológico excelente para la edad.', color_code: '#059669', order_index: 4 },
    ],
  },
  references: [
    {
      title: 'The Hammersmith Infant Neurological Examination: a study of its diagnostic value',
      authors: ['Haataja L', 'Mercuri E', 'Regev R', 'et al.'],
      year: 1999,
      journal: 'Brain',
      volume: '122',
      pages: '1723-39',
      doi: '10.1093/brain/122.9.1723',
      is_primary: true,
      reference_type: 'original'
    },
    {
      title: 'Optimality scores for the neurological examination of the infant at 12 and 18 months of age',
      authors: ['Mercuri E', 'Ricci D', 'Cowan FM', 'et al.'],
      year: 2006,
      journal: 'J Pediatr',
      volume: '149',
      pages: '178-83',
      doi: '10.1016/j.jpeds.2006.03.052',
      is_primary: true,
      reference_type: 'validation'
    }
  ],
};

