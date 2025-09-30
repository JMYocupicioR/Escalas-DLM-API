// data/ogs.ts
import { CreateScaleRequest } from '@/api/scales/types';

export const ogsQuestions = [
  {
    id: 'rodilla-fase-media-apoyo',
    question: 'Rodilla en parte media de fase de apoyo',
    description: 'Evalúa la posición de la rodilla durante la fase media de apoyo. Seleccione UNA opción que mejor describa la posición observada.',
    question_type: 'single_choice',
    order_index: 1,
    instructions: 'La rodilla puede estar en flexión (doblada), neutral (posición normal 0-5°), o recurvatum (hiperextendida). Seleccione la opción que corresponda.',
    options: [
      { option_value: 0, option_label: 'Flexión severa > 30°', option_description: '⬇️ FLEXIÓN SEVERA: Rodilla muy doblada durante apoyo (> 30°)' },
      { option_value: 1, option_label: 'Flexión moderada 16–30°', option_description: '⬇️ FLEXIÓN MODERADA: Rodilla moderadamente doblada (16-30°)' },
      { option_value: 2, option_label: 'Flexión leve 6-15°', option_description: '⬇️ FLEXIÓN LEVE: Rodilla ligeramente doblada (6-15°)' },
      { option_value: 3, option_label: '✓ Neutral (0-5° flexión)', option_description: '✓ POSICIÓN IDEAL: Rodilla en posición neutral o casi extendida (0-5°)' },
      { option_value: 2, option_label: 'Recurvatum leve 6-10°', option_description: '⬆️ RECURVATUM LEVE: Rodilla ligeramente hiperextendida (6-10°)' },
      { option_value: 1, option_label: 'Recurvatum moderado 11-15°', option_description: '⬆️ RECURVATUM MODERADO: Rodilla moderadamente hiperextendida (11-15°)' },
      { option_value: 0, option_label: 'Recurvatum severo > 15°', option_description: '⬆️ RECURVATUM SEVERO: Rodilla muy hiperextendida (> 15°)' }
    ]
  },
  {
    id: 'contacto-inicial-pie',
    question: 'Contacto inicial del pie',
    description: 'Evalúa la forma en que el pie hace contacto con el suelo.',
    question_type: 'single_choice',
    order_index: 2,
    options: [
      { option_value: 0, option_label: 'Punta (cabeza metatarsianos–falanges)', option_description: 'Contacto inicial con la punta del pie' },
      { option_value: 1, option_label: 'Pie anterior (arco medio–cabeza metatarsiano)', option_description: 'Contacto con la parte delantera del pie' },
      { option_value: 2, option_label: 'Pie plano', option_description: 'Contacto simultáneo de toda la planta del pie' },
      { option_value: 3, option_label: 'Talón', option_description: 'Contacto inicial correcto con el talón' }
    ]
  },
  {
    id: 'pie-fase-media-apoyo',
    question: 'Pie en parte media de fase de apoyo',
    description: 'Evalúa la posición del pie durante la fase media de apoyo.',
    question_type: 'single_choice',
    order_index: 3,
    options: [
      { option_value: 0, option_label: 'Pie en mecedora', option_description: 'Solo apoyo en la parte media del pie, sin talón ni dedos' },
      { option_value: 1, option_label: 'Equino', option_description: 'Pie en punta durante toda la fase de apoyo' },
      { option_value: 2, option_label: 'Contacto ocasional y/o elevación temprana del talón (< 50% tiempo)', option_description: 'Apoyo intermitente o elevación prematura del talón' },
      { option_value: 3, option_label: 'Pie plano', option_description: 'Apoyo completo y correcto del pie durante la fase de apoyo' }
    ]
  },
  {
    id: 'pie-posterior-fase-media-apoyo',
    question: 'Pie posterior en parte media de fase de apoyo',
    description: 'Evalúa la posición del talón.',
    question_type: 'single_choice',
    order_index: 4,
    options: [
      { option_value: 0, option_label: 'Talón en varo', option_description: 'Talón inclinado hacia adentro (supinación)' },
      { option_value: 1, option_label: 'Talón en valgo', option_description: 'Talón inclinado hacia afuera (pronación)' },
      { option_value: 2, option_label: 'Ocasionalmente neutral (< 50% tiempo)', option_description: 'Posición neutral intermitente' },
      { option_value: 3, option_label: 'Neutral', option_description: 'Alineación correcta del talón durante toda la fase' }
    ]
  },
  {
    id: 'velocidad-marcha',
    question: 'Velocidad de marcha',
    description: 'Evalúa la capacidad de variar la velocidad al caminar.',
    question_type: 'single_choice',
    order_index: 5,
    options: [
      { option_value: 0, option_label: 'Una sola velocidad', option_description: 'No puede modificar la velocidad de la marcha' },
      { option_value: 1, option_label: 'Velocidad variable con dificultad', option_description: 'Puede cambiar velocidad pero con esfuerzo' },
      { option_value: 2, option_label: 'Velocidad variable (por solicitud)', option_description: 'Cambia velocidad fácilmente cuando se le solicita' },
      { option_value: 3, option_label: 'Control completo de velocidad', option_description: 'Varía la velocidad naturalmente según necesidad' }
    ]
  },
  {
    id: 'base-sustentacion',
    question: 'Base de sustentación',
    description: 'Evalúa la anchura de la base de apoyo al caminar.',
    question_type: 'single_choice',
    order_index: 6,
    options: [
      { option_value: 0, option_label: 'Posición en tijera franca (pie cruza línea media)', option_description: 'Los pies se cruzan durante la marcha' },
      { option_value: 1, option_label: 'Base angosta y/o rodillas pegadas', option_description: 'Base de sustentación muy estrecha' },
      { option_value: 2, option_label: 'Base amplia', option_description: 'Base de sustentación muy ancha para mantener equilibrio' },
      { option_value: 3, option_label: 'Normal (ancho de los hombros)', option_description: 'Base de sustentación apropiada' }
    ]
  },
  {
    id: 'aparatos-asistencia',
    question: 'Aparatos de asistencia',
    description: 'Evalúa el uso de dispositivos de asistencia para caminar.',
    question_type: 'single_choice',
    order_index: 7,
    options: [
      { option_value: 0, option_label: 'Andador (con asistencia)', option_description: 'Requiere andador y asistencia de otra persona' },
      { option_value: 1, option_label: 'Andador (independiente)', option_description: 'Usa andador de forma independiente' },
      { option_value: 2, option_label: 'Muletas, bastones, otros', option_description: 'Utiliza dispositivos de asistencia ligeros' },
      { option_value: 3, option_label: 'Ninguno, independiente en distancias funcionales', option_description: 'No requiere dispositivos de asistencia' }
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
  instructions: `## Instrucciones de Aplicación

### Preparación
- Se recomienda grabación de video desde vista frontal y lateral
- Observar al menos 3-5 ciclos completos de marcha
- Evaluar cada extremidad por separado

### Puntuación
- Puntúe cada uno de los 7 ítems para **cada extremidad** (izquierda y derecha)
- Puntuación por ítem: 0-3 (0 = mayor deficiencia, 3 = normal)
- Puntuación total por extremidad: 0-21 puntos
- **Puntuación total bilateral: 0-42 puntos**

### Nota Importante sobre Pregunta 1 (Rodilla)
La pregunta de la rodilla presenta 7 opciones en un **espectro continuo**:
- **Flexión** (3 niveles): Rodilla doblada hacia adelante
- **Neutral** (1 nivel): Posición ideal (0-5°)
- **Recurvatum** (3 niveles): Rodilla hiperextendida hacia atrás

Solo puede seleccionar **UNA opción**. Los valores duplicados (ej: flexión leve y recurvatum leve ambos = 2 puntos) reflejan que ambas desviaciones tienen el mismo impacto negativo en la marcha, independientemente de la dirección.

### Consideraciones
- En niños con parálisis cerebral, es común encontrar asimetrías
- Documente la extremidad más afectada
- La velocidad de marcha debe evaluarse en terreno llano y libre de obstáculos
- Si hay duda entre dos opciones, elija la más conservadora (menor puntuación)`,
  version: '1.0',
  language: 'es',
  cross_references: [],
  license: 'CC BY-NC 4.0',
  questions: ogsQuestions,
  scoring: {
    scoring_method: 'sum',
    min_score: 0,
    max_score: 42,
    ranges: [
      { min_value: 0, max_value: 10, interpretation_level: 'Severa', interpretation_text: 'Deficiencia severa en la marcha. Requiere asistencia significativa y/o dispositivos de apoyo.', color_code: '#ef4444', order_index: 1, recommendations: 'Considerar ortesis, fisioterapia intensiva y evaluación para cirugía ortopédica.' },
      { min_value: 11, max_value: 21, interpretation_level: 'Moderada', interpretation_text: 'Deficiencia moderada en la marcha. Puede requerir dispositivos de asistencia.', color_code: '#f59e0b', order_index: 2, recommendations: 'Fisioterapia regular, evaluación de ortesis y entrenamiento de marcha funcional.' },
      { min_value: 22, max_value: 32, interpretation_level: 'Leve', interpretation_text: 'Deficiencia leve en la marcha. Alteraciones menores que pueden compensarse.', color_code: '#f97316', order_index: 3, recommendations: 'Programa de ejercicios en casa, seguimiento periódico y optimización de calzado.' },
      { min_value: 33, max_value: 42, interpretation_level: 'Normal / Mínima', interpretation_text: 'Patrón de marcha cercano a lo normal con alteraciones mínimas o ausentes.', color_code: '#22c55e', order_index: 4, recommendations: 'Mantenimiento con actividad física regular y seguimiento anual.' },
    ],
  },
  references: [
    { title: 'The Observational Gait Scale Can Help Determine the GMFCS Level in Children With Cerebral Palsy', authors: ['Shabani S, et al.'], year: 2021, doi: '10.1097/JPO.0000000000003011', is_primary: true, reference_type: 'validation' },
    { title: 'Reliability and validity of the Observational Gait Scale in children with spastic diplegia', authors: ['Boyd RN, Graham HK'], year: 1999, journal: 'J Pediatr Orthop', volume: '19', pages: '97-101', is_primary: true, reference_type: 'original' },
  ],
};
