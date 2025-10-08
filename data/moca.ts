// data/moca.ts
import { CreateScaleRequest } from '@/api/scales/types';

export interface MocaQuestion {
  id: string;
  question: string;
  description: string;
  question_type: 'single_choice' | 'text_input';
  order_index: number;
  category?: string;
  instructions?: string;
  options: {
    option_value: number;
    option_label: string;
    option_description?: string;
  }[];
}

export const mocaQuestions: MocaQuestion[] = [
  {
    id: 'alternancia-conceptual',
    question: 'Alternancia Conceptual (Trail Making B)',
    description: 'Evalúa la flexibilidad cognitiva y funciones ejecutivas mediante el trazado alternado de números y letras.',
    question_type: 'single_choice',
    order_index: 1,
    category: 'Visoespacial/Ejecutiva',
    instructions: 'Pida al paciente que una con una línea: 1-A-2-B-3-C-4-D-5-E en orden ascendente alternando. El paciente debe completar la tarea sin errores y sin que las líneas se crucen.',
    options: [
      { option_value: 0, option_label: 'Errores o líneas cruzadas', option_description: 'No completó la tarea correctamente' },
      { option_value: 1, option_label: 'Completado sin errores', option_description: 'Trazado correcto sin cruces ni errores' }
    ]
  },
  {
    id: 'copia-cubo',
    question: 'Copia del Cubo',
    description: 'Evalúa habilidades visuoconstructivas y percepción espacial.',
    question_type: 'single_choice',
    order_index: 2,
    category: 'Visoespacial/Ejecutiva',
    instructions: 'Pida al paciente que copie el cubo tridimensional. Debe tener todas las líneas, ser 3D, sin líneas extra, con líneas paralelas y proporciones correctas.',
    options: [
      { option_value: 0, option_label: 'Incorrecto', option_description: 'No cumple con los criterios de dibujo 3D' },
      { option_value: 1, option_label: 'Correcto', option_description: 'Cubo 3D con todas las líneas, proporciones y paralelismo correcto' }
    ]
  },
  {
    id: 'reloj-contorno',
    question: 'Reloj - Contorno',
    description: 'Evalúa la capacidad de dibujar el contorno circular del reloj.',
    question_type: 'single_choice',
    order_index: 3,
    category: 'Visoespacial/Ejecutiva',
    instructions: 'Pida al paciente que dibuje un reloj (números y manecillas indicando las 11:10). Evalúe el contorno: debe ser un círculo claro y cerrado.',
    options: [
      { option_value: 0, option_label: 'Contorno incorrecto', option_description: 'No es un círculo reconocible' },
      { option_value: 1, option_label: 'Contorno correcto', option_description: 'Círculo claro y cerrado (imperfecciones menores aceptables)' }
    ]
  },
  {
    id: 'reloj-numeros',
    question: 'Reloj - Números',
    description: 'Evalúa la colocación correcta de los números del reloj.',
    question_type: 'single_choice',
    order_index: 4,
    category: 'Visoespacial/Ejecutiva',
    instructions: 'Evalúe los números del reloj: deben estar todos presentes (1-12), en orden correcto y en los cuadrantes apropiados.',
    options: [
      { option_value: 0, option_label: 'Números incorrectos', option_description: 'Faltan números, orden incorrecto o cuadrantes erróneos' },
      { option_value: 1, option_label: 'Números correctos', option_description: 'Los 12 números presentes, en orden y en cuadrantes correctos' }
    ]
  },
  {
    id: 'reloj-manecillas',
    question: 'Reloj - Manecillas',
    description: 'Evalúa la colocación correcta de las manecillas indicando la hora solicitada.',
    question_type: 'single_choice',
    order_index: 5,
    category: 'Visoespacial/Ejecutiva',
    instructions: 'Evalúe las manecillas: deben ser dos, indicar 11:10, la horaria más corta que la minutera, y unidas cerca del centro.',
    options: [
      { option_value: 0, option_label: 'Manecillas incorrectas', option_description: 'No cumple con los criterios de hora o proporciones' },
      { option_value: 1, option_label: 'Manecillas correctas', option_description: 'Dos manecillas, hora correcta, horaria más corta, unidas al centro' }
    ]
  },
  {
    id: 'nominacion-leon',
    question: 'Nominación - León',
    description: 'Capacidad de nombrar animales de baja frecuencia desde una imagen.',
    question_type: 'single_choice',
    order_index: 6,
    category: 'Identificación',
    instructions: 'Muestre la imagen de un león y pregunte: "¿Qué animal es este?"',
    options: [
      { option_value: 0, option_label: 'No identifica', option_description: 'Respuesta incorrecta o no puede nombrarlo' },
      { option_value: 1, option_label: 'León', option_description: 'Identifica correctamente como león' }
    ]
  },
  {
    id: 'nominacion-rinoceronte',
    question: 'Nominación - Rinoceronte',
    description: 'Capacidad de nombrar animales de baja frecuencia desde una imagen.',
    question_type: 'single_choice',
    order_index: 7,
    category: 'Identificación',
    instructions: 'Muestre la imagen de un rinoceronte y pregunte: "¿Qué animal es este?"',
    options: [
      { option_value: 0, option_label: 'No identifica', option_description: 'Respuesta incorrecta o no puede nombrarlo' },
      { option_value: 1, option_label: 'Rinoceronte', option_description: 'Identifica correctamente como rinoceronte' }
    ]
  },
  {
    id: 'nominacion-camello',
    question: 'Nominación - Camello',
    description: 'Capacidad de nombrar animales de baja frecuencia desde una imagen.',
    question_type: 'single_choice',
    order_index: 8,
    category: 'Identificación',
    instructions: 'Muestre la imagen de un camello y pregunte: "¿Qué animal es este?"',
    options: [
      { option_value: 0, option_label: 'No identifica', option_description: 'Respuesta incorrecta o no puede nombrarlo' },
      { option_value: 1, option_label: 'Camello / Dromedario', option_description: 'Identifica correctamente como camello o dromedario' }
    ]
  },
  {
    id: 'memoria-registro-1',
    question: 'Memoria - Primera Lectura',
    description: 'Registro inicial de 5 palabras (no se puntúa, solo registro para recuerdo diferido posterior).',
    question_type: 'single_choice',
    order_index: 9,
    category: 'Memoria',
    instructions: 'Lea la lista de 5 palabras a razón de una por segundo. Pida al paciente que las repita. PRIMERA LECTURA: ROSTRO, SEDA, IGLESIA, CLAVEL, ROJO. Esta fase NO se puntúa, es solo registro para establecer línea base.',
    options: [
      { option_value: 0, option_label: '✓ Primera lectura completada', option_description: 'Palabras leídas: ROSTRO, SEDA, IGLESIA, CLAVEL, ROJO (no suma puntos)' }
    ]
  },
  {
    id: 'memoria-registro-2',
    question: 'Memoria - Segunda Lectura',
    description: 'Segunda presentación de las 5 palabras para evaluar curva de aprendizaje.',
    question_type: 'single_choice',
    order_index: 10,
    category: 'Memoria',
    instructions: 'Lea nuevamente la lista: ROSTRO, SEDA, IGLESIA, CLAVEL, ROJO. Pida al paciente que las repita. Observe si hay curva de aprendizaje. Esta fase NO se puntúa.',
    options: [
      { option_value: 0, option_label: '✓ Segunda lectura completada', option_description: 'Repetición de palabras registrada (no suma puntos)' }
    ]
  },
  {
    id: 'digitos-directo',
    question: 'Atención - Dígitos en Orden Directo',
    description: 'Evalúa la atención simple y span atencional.',
    question_type: 'single_choice',
    order_index: 11,
    category: 'Atención',
    instructions: 'Lea una secuencia de 5 dígitos a razón de uno por segundo y pida al paciente que los repita en el mismo orden. Ejemplo: 2-1-8-5-4. Puede hacer dos intentos.',
    options: [
      { option_value: 0, option_label: 'Falla en ambos intentos', option_description: 'No logra repetir correctamente la secuencia' },
      { option_value: 1, option_label: 'Éxito en al menos un intento', option_description: 'Repite correctamente la secuencia de 5 dígitos' }
    ]
  },
  {
    id: 'digitos-inverso',
    question: 'Atención - Dígitos en Orden Inverso',
    description: 'Evalúa la memoria de trabajo y manipulación mental de información.',
    question_type: 'single_choice',
    order_index: 12,
    category: 'Atención',
    instructions: 'Lea una secuencia de 3 dígitos y pida al paciente que los repita en orden inverso. Ejemplo: 7-4-2 (respuesta correcta: 2-4-7). Puede hacer dos intentos.',
    options: [
      { option_value: 0, option_label: 'Falla en ambos intentos', option_description: 'No logra invertir correctamente la secuencia' },
      { option_value: 1, option_label: 'Éxito en al menos un intento', option_description: 'Invierte correctamente la secuencia de 3 dígitos' }
    ]
  },
  {
    id: 'vigilancia',
    question: 'Atención - Vigilancia (Tarea de Detección de "A")',
    description: 'Evalúa la atención sostenida y el control inhibitorio.',
    question_type: 'single_choice',
    order_index: 13,
    category: 'Atención',
    instructions: 'Lea la siguiente serie de letras a razón de una por segundo. Pida al paciente que dé un golpe en la mesa cada vez que escuche la letra "A". Serie: F-B-A-C-M-N-A-A-J-K-L-B-A-F-A-K-D-E-A-A-A-J-A-M-O-F-A-A-B. Cuente los errores (omisiones o falsos positivos).',
    options: [
      { option_value: 0, option_label: '2 o más errores', option_description: 'No mantiene atención sostenida adecuada' },
      { option_value: 1, option_label: '0 o 1 error', option_description: 'Atención sostenida adecuada' }
    ]
  },
  {
    id: 'serial-7-puntos',
    question: 'Atención - Serie de 7 (Cálculo)',
    description: 'Evalúa concentración, memoria de trabajo y habilidad de cálculo.',
    question_type: 'single_choice',
    order_index: 14,
    category: 'Atención',
    instructions: 'Pida al paciente que reste 7 desde 100, y continúe restando 7 de cada resultado. Detenga después de 5 restas. Respuestas correctas: 93-86-79-72-65. Cuente el número de restas correctas.',
    options: [
      { option_value: 0, option_label: '0 restas correctas', option_description: 'No puede realizar la tarea' },
      { option_value: 1, option_label: '1 resta correcta', option_description: 'Dificultad severa en cálculo y atención' },
      { option_value: 2, option_label: '2-3 restas correctas', option_description: 'Dificultad moderada en cálculo' },
      { option_value: 3, option_label: '4-5 restas correctas', option_description: 'Cálculo y concentración adecuados' }
    ]
  },
  {
    id: 'repeticion-frase-1',
    question: 'Lenguaje - Repetición de Frase 1',
    description: 'Evalúa la capacidad de repetición de frases sintácticamente complejas.',
    question_type: 'single_choice',
    order_index: 15,
    category: 'Lenguaje',
    instructions: 'Lea la siguiente frase UNA SOLA VEZ y pida al paciente que la repita exactamente: "Solo sé que Juan es el que hoy puede ayudar". Debe ser palabra por palabra, sin errores.',
    options: [
      { option_value: 0, option_label: 'Repetición incorrecta', option_description: 'Errores, omisiones o sustituciones' },
      { option_value: 1, option_label: 'Repetición exacta', option_description: 'Repite la frase palabra por palabra correctamente' }
    ]
  },
  {
    id: 'repeticion-frase-2',
    question: 'Lenguaje - Repetición de Frase 2',
    description: 'Evalúa la capacidad de repetición de frases sintácticamente complejas.',
    question_type: 'single_choice',
    order_index: 16,
    category: 'Lenguaje',
    instructions: 'Lea la siguiente frase UNA SOLA VEZ y pida al paciente que la repita exactamente: "El gato siempre se escondía bajo el sofá cuando los perros estaban en la habitación". Debe ser palabra por palabra.',
    options: [
      { option_value: 0, option_label: 'Repetición incorrecta', option_description: 'Errores, omisiones o sustituciones' },
      { option_value: 1, option_label: 'Repetición exacta', option_description: 'Repite la frase palabra por palabra correctamente' }
    ]
  },
  {
    id: 'fluidez-verbal',
    question: 'Lenguaje - Fluidez Verbal Fonémica',
    description: 'Evalúa funciones ejecutivas, iniciativa verbal y búsqueda léxica estratégica.',
    question_type: 'single_choice',
    order_index: 17,
    category: 'Lenguaje',
    instructions: 'Pida al paciente que diga todas las palabras que pueda que comiencen con la letra "F" en 60 segundos. No valen nombres propios ni derivados de la misma palabra. Cuente el número total.',
    options: [
      { option_value: 0, option_label: 'Menos de 11 palabras', option_description: 'Fluidez verbal reducida, posible disfunción frontal' },
      { option_value: 1, option_label: '11 o más palabras', option_description: 'Fluidez verbal adecuada' }
    ]
  },
  {
    id: 'abstraccion-1',
    question: 'Abstracción - Par 1 (Tren - Bicicleta)',
    description: 'Evalúa razonamiento abstracto y formación de conceptos.',
    question_type: 'single_choice',
    order_index: 18,
    category: 'Abstracción',
    instructions: 'Pregunte: "¿En qué se parecen un tren y una bicicleta?" Respuesta correcta debe ser abstracta (ej: "medios de transporte"), no concreta (ej: "tienen ruedas").',
    options: [
      { option_value: 0, option_label: 'Respuesta concreta o incorrecta', option_description: 'No logra abstracción conceptual' },
      { option_value: 1, option_label: 'Respuesta abstracta correcta', option_description: 'Identifica categoría: medios de transporte, vehículos, etc.' }
    ]
  },
  {
    id: 'abstraccion-2',
    question: 'Abstracción - Par 2 (Reloj - Regla)',
    description: 'Evalúa razonamiento abstracto y formación de conceptos.',
    question_type: 'single_choice',
    order_index: 19,
    category: 'Abstracción',
    instructions: 'Pregunte: "¿En qué se parecen un reloj y una regla?" Respuesta correcta debe ser abstracta (ej: "instrumentos de medición"), no concreta (ej: "tienen números").',
    options: [
      { option_value: 0, option_label: 'Respuesta concreta o incorrecta', option_description: 'No logra abstracción conceptual' },
      { option_value: 1, option_label: 'Respuesta abstracta correcta', option_description: 'Identifica categoría: instrumentos de medición, herramientas, etc.' }
    ]
  },
  {
    id: 'recuerdo-diferido-rostro',
    question: 'Recuerdo Diferido - ROSTRO',
    description: 'Evalúa memoria episódica y consolidación de información tras 5 minutos de tareas de interferencia.',
    question_type: 'single_choice',
    order_index: 20,
    category: 'Memoria',
    instructions: 'Sin dar pistas, pregunte: "¿Recuerda las palabras que le leí al principio?" Anote si recuerda la palabra "ROSTRO" espontáneamente.',
    options: [
      { option_value: 0, option_label: 'No recuerda', option_description: 'No evoca la palabra espontáneamente' },
      { option_value: 1, option_label: 'Recuerda', option_description: 'Evoca "ROSTRO" sin pistas' }
    ]
  },
  {
    id: 'recuerdo-diferido-seda',
    question: 'Recuerdo Diferido - SEDA',
    description: 'Evalúa memoria episódica y consolidación de información.',
    question_type: 'single_choice',
    order_index: 21,
    category: 'Memoria',
    instructions: 'Anote si recuerda la palabra "SEDA" espontáneamente (sin pistas).',
    options: [
      { option_value: 0, option_label: 'No recuerda', option_description: 'No evoca la palabra espontáneamente' },
      { option_value: 1, option_label: 'Recuerda', option_description: 'Evoca "SEDA" sin pistas' }
    ]
  },
  {
    id: 'recuerdo-diferido-iglesia',
    question: 'Recuerdo Diferido - IGLESIA',
    description: 'Evalúa memoria episódica y consolidación de información.',
    question_type: 'single_choice',
    order_index: 22,
    category: 'Memoria',
    instructions: 'Anote si recuerda la palabra "IGLESIA" espontáneamente (sin pistas).',
    options: [
      { option_value: 0, option_label: 'No recuerda', option_description: 'No evoca la palabra espontáneamente' },
      { option_value: 1, option_label: 'Recuerda', option_description: 'Evoca "IGLESIA" sin pistas' }
    ]
  },
  {
    id: 'recuerdo-diferido-clavel',
    question: 'Recuerdo Diferido - CLAVEL',
    description: 'Evalúa memoria episódica y consolidación de información.',
    question_type: 'single_choice',
    order_index: 23,
    category: 'Memoria',
    instructions: 'Anote si recuerda la palabra "CLAVEL" espontáneamente (sin pistas).',
    options: [
      { option_value: 0, option_label: 'No recuerda', option_description: 'No evoca la palabra espontáneamente' },
      { option_value: 1, option_label: 'Recuerda', option_description: 'Evoca "CLAVEL" sin pistas' }
    ]
  },
  {
    id: 'recuerdo-diferido-rojo',
    question: 'Recuerdo Diferido - ROJO',
    description: 'Evalúa memoria episódica y consolidación de información.',
    question_type: 'single_choice',
    order_index: 24,
    category: 'Memoria',
    instructions: 'Anote si recuerda la palabra "ROJO" espontáneamente (sin pistas).',
    options: [
      { option_value: 0, option_label: 'No recuerda', option_description: 'No evoca la palabra espontáneamente' },
      { option_value: 1, option_label: 'Recuerda', option_description: 'Evoca "ROJO" sin pistas' }
    ]
  },
  {
    id: 'orientacion-fecha',
    question: 'Orientación - Fecha',
    description: 'Evalúa orientación temporal.',
    question_type: 'single_choice',
    order_index: 25,
    category: 'Orientación',
    instructions: 'Pregunte: "¿Qué fecha es hoy?" (día del mes). Debe ser exacta.',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'Error en la fecha' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Indica la fecha exacta' }
    ]
  },
  {
    id: 'orientacion-mes',
    question: 'Orientación - Mes',
    description: 'Evalúa orientación temporal.',
    question_type: 'single_choice',
    order_index: 26,
    category: 'Orientación',
    instructions: 'Pregunte: "¿En qué mes estamos?"',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'Error en el mes' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Indica el mes correcto' }
    ]
  },
  {
    id: 'orientacion-año',
    question: 'Orientación - Año',
    description: 'Evalúa orientación temporal.',
    question_type: 'single_choice',
    order_index: 27,
    category: 'Orientación',
    instructions: 'Pregunte: "¿En qué año estamos?"',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'Error en el año' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Indica el año correcto' }
    ]
  },
  {
    id: 'orientacion-dia',
    question: 'Orientación - Día de la Semana',
    description: 'Evalúa orientación temporal.',
    question_type: 'single_choice',
    order_index: 28,
    category: 'Orientación',
    instructions: 'Pregunte: "¿Qué día de la semana es hoy?"',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'Error en el día de la semana' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Indica el día de la semana correcto' }
    ]
  },
  {
    id: 'orientacion-lugar',
    question: 'Orientación - Lugar',
    description: 'Evalúa orientación espacial.',
    question_type: 'single_choice',
    order_index: 29,
    category: 'Orientación',
    instructions: 'Pregunte: "¿En qué lugar estamos?" (nombre del hospital, clínica, consultorio)',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'No identifica el lugar' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Identifica correctamente el lugar' }
    ]
  },
  {
    id: 'orientacion-ciudad',
    question: 'Orientación - Ciudad',
    description: 'Evalúa orientación espacial.',
    question_type: 'single_choice',
    order_index: 30,
    category: 'Orientación',
    instructions: 'Pregunte: "¿En qué ciudad estamos?"',
    options: [
      { option_value: 0, option_label: 'Incorrecta', option_description: 'Error en la ciudad' },
      { option_value: 1, option_label: 'Correcta', option_description: 'Indica la ciudad correcta' }
    ]
  }
];

export const mocaScale: Omit<CreateScaleRequest, 'questions'> & { questions: MocaQuestion[] } = {
  name: 'Montreal Cognitive Assessment',
  acronym: 'MoCA',
  description: 'Herramienta de cribado cognitivo de alta sensibilidad diseñada específicamente para detectar Deterioro Cognitivo Leve (DCL). Superior al MMSE en la evaluación de funciones ejecutivas y memoria.',
  category: 'Cognitiva',
  specialty: 'Neurología',
  body_system: 'Sistema Nervioso Central',
  tags: ['cognición', 'deterioro cognitivo leve', 'demencia', 'alzheimer', 'screening', 'funciones ejecutivas', 'memoria', 'MCI'],
  time_to_complete: '10-15 minutos',
  instructions: `## Instrucciones de Administración del MoCA

### Requisitos Previos
- **Ambiente**: Sala tranquila, bien iluminada, sin distracciones
- **Tiempo**: 10-15 minutos de administración
- **Certificación**: Se recomienda completar la certificación oficial en mocatest.org
- **Materiales**: Lápiz, papel, cronómetro, imágenes de animales (león, rinoceronte, camello)

### Principios Fundamentales
1. **Seguir instrucciones al pie de la letra** - No parafrasear ni dar pistas adicionales
2. **Administración estandarizada** - Usar las palabras exactas del manual
3. **No es diagnóstico** - Es una herramienta de cribado, no diagnóstica

### Orden de Administración

#### 1. Funciones Visoespaciales/Ejecutivas (5 puntos)
- **Alternancia Conceptual**: Trail Making B adaptado (1-A-2-B-3-C-4-D-5-E)
- **Cubo**: Copia de cubo tridimensional
- **Reloj**: Dibujar reloj con números y manecillas (11:10)
  - Contorno (1 pt)
  - Números (1 pt)
  - Manecillas (1 pt)

#### 2. Identificación/Nominación (3 puntos)
- Nombrar: León, Rinoceronte, Camello (1 punto cada uno)

#### 3. Memoria - Registro (0 puntos en esta fase)
- Leer 5 palabras DOS veces: **ROSTRO, SEDA, IGLESIA, CLAVEL, ROJO**
- Pedir recuerdo inmediato después de cada lectura
- Registrar número de palabras, pero NO puntuar todavía

#### 4. Atención (6 puntos)
- **Dígitos directos**: 5 dígitos en orden (ej: 2-1-8-5-4) [1 pt]
- **Dígitos inversos**: 3 dígitos en reversa (ej: 7-4-2 → 2-4-7) [1 pt]
- **Vigilancia**: Detectar letra "A" en serie de letras [1 pt]
- **Serie de 7**: Restar 7 desde 100, cinco veces (100-93-86-79-72-65) [3 pts]

#### 5. Lenguaje (3 puntos)
- **Repetición**: 2 frases sintácticamente complejas [2 pts]
- **Fluidez verbal**: Palabras con letra "F" en 60 segundos (≥11 palabras) [1 pt]

#### 6. Abstracción (2 puntos)
- Similitudes conceptuales abstractas:
  - Tren - Bicicleta (medios de transporte)
  - Reloj - Regla (instrumentos de medición)

#### 7. Recuerdo Diferido (5 puntos)
- Recordar las 5 palabras SIN pistas
- 1 punto por cada palabra recordada espontáneamente
- **Opcional (no puntúa)**: Dar pistas de categoría o reconocimiento si no recuerda

#### 8. Orientación (6 puntos)
- Fecha, Mes, Año, Día de la semana, Lugar, Ciudad

### Ajuste por Educación
**MUY IMPORTANTE**: Añadir **1 punto** al total si el paciente tiene **12 años o menos** de educación formal.

### Interpretación de Resultados

#### Puntuación de Corte
- **≥ 26 puntos**: Normal
- **≤ 25 puntos**: Sugiere DCL o demencia → Requiere evaluación completa

#### Perfiles Clínicos por Patrón de Error

**Perfil Alzheimer**:
- Recuerdo diferido muy bajo (0-2/5)
- No mejora con pistas
- Errores en reloj y orientación
- Funciones ejecutivas relativamente preservadas inicialmente

**Perfil Vascular**:
- Déficit ejecutivo prominente (alternancia, fluidez, abstracción)
- Recuerdo mejora con pistas (problema de evocación, no almacenamiento)
- Velocidad de procesamiento reducida

**Perfil Cuerpos de Lewy**:
- Déficit visoespacial severo (cubo, reloj)
- Déficit atencional marcado
- Fluctuación en el rendimiento

**Perfil Frontotemporal**:
- Disfunción ejecutiva marcada
- Alteraciones del lenguaje
- Memoria y habilidades visoespaciales relativamente intactas

### Consideraciones Importantes
1. **Factores confundentes**: Depresión, ansiedad, fatiga, déficits sensoriales
2. **Educación**: El nivel educativo influye significativamente
3. **Cultura**: Usar normas locales cuando estén disponibles
4. **Seguimiento**: Un resultado bajo requiere evaluación neuropsicológica completa
5. **No es diagnóstico**: Es punto de partida para investigación adicional

### Referencias de Validación
- Puntuación original ≤26: 90% sensibilidad, 87% especificidad para DCL
- México: ≤26 para DCL (80% sens, 75% esp); ≤24 para demencia (98% sens, 93% esp)
- Colombia: <23 para DCL/demencia leve (76-93% sensibilidad)

### Nota sobre Certificación
Para uso clínico formal, se recomienda completar el curso de certificación gratuito de 1 hora en: **www.mocatest.org**`,
  version: '8.1',
  language: 'es',
  cross_references: ['MMSE', 'MOCA-BASIC'],
  license: 'Uso clínico permitido con certificación',
  questions: mocaQuestions,
  scoring: {
    scoring_method: 'sum',
    min_score: 0,
    max_score: 30,
    ranges: [
      { 
        min_value: 0, 
        max_value: 17, 
        interpretation_level: 'Demencia Severa a Moderada', 
        interpretation_text: 'Deterioro cognitivo severo compatible con demencia establecida. Afectación significativa en múltiples dominios cognitivos.', 
        color_code: '#ef4444', 
        order_index: 1, 
        recommendations: 'Evaluación neurológica urgente. Neuroimagen cerebral. Evaluación neuropsicológica completa. Considerar inicio de tratamiento farmacológico y valoración de capacidad de autonomía.' 
      },
      { 
        min_value: 18, 
        max_value: 25, 
        interpretation_level: 'Deterioro Cognitivo Leve / Demencia Leve', 
        interpretation_text: 'Puntuación sugestiva de Deterioro Cognitivo Leve (DCL) o demencia en fase inicial. Requiere evaluación exhaustiva.', 
        color_code: '#f59e0b', 
        order_index: 2, 
        recommendations: 'Derivación a especialista (neurólogo/neuropsicólogo/geriatra). Evaluación neuropsicológica formal. Analítica completa (función tiroidea, B12, ácido fólico). Neuroimagen (RM/TAC cerebral). Evaluación de factores de riesgo vascular. Seguimiento cada 3-6 meses.' 
      },
      { 
        min_value: 26, 
        max_value: 30, 
        interpretation_level: 'Normal', 
        interpretation_text: 'Puntuación dentro del rango de normalidad cognitiva. No sugiere deterioro cognitivo significativo.', 
        color_code: '#22c55e', 
        order_index: 3, 
        recommendations: 'Mantener actividad cognitiva regular. Control de factores de riesgo cardiovascular. Reevaluación si aparecen síntomas o quejas cognitivas. Considerar reevaluación en 1-2 años si hay factores de riesgo.' 
      },
    ],
  },
  references: [
    { 
      title: 'The Montreal Cognitive Assessment, MoCA: A Brief Screening Tool For Mild Cognitive Impairment', 
      authors: ['Nasreddine ZS', 'Phillips NA', 'Bédirian V', 'et al.'], 
      year: 2005, 
      journal: 'J Am Geriatr Soc', 
      volume: '53', 
      pages: '695-699', 
      doi: '10.1111/j.1532-5415.2005.53221.x', 
      is_primary: true, 
      reference_type: 'original' 
    },
    { 
      title: 'Validity and reliability of the Spanish Version of the Montreal Cognitive Assessment (MoCA) for the detection of cognitive impairment in Mexico', 
      authors: ['Aguilar-Navarro SG', 'Mimenza-Alvarado AJ', 'Palacios-García AA', 'et al.'], 
      year: 2018, 
      journal: 'Rev Colomb Psiquiatr', 
      volume: '47', 
      pages: '237-243', 
      is_primary: true, 
      reference_type: 'validation' 
    },
    { 
      title: 'Validation of the Montreal Cognitive Assessment (MoCA) in Spanish as a screening tool for mild cognitive impairment and mild dementia in patients over 65 years old in Bogotá, Colombia', 
      authors: ['Gil L', 'Ruiz de Sánchez C', 'Gil F', 'et al.'], 
      year: 2015, 
      journal: 'Int J Geriatr Psychiatry', 
      volume: '30', 
      pages: '655-662', 
      is_primary: true, 
      reference_type: 'validation' 
    },
  ],
};

