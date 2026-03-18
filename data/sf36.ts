export interface SF36Question {
  id: string;
  question: string;
  description: string;
  dimension: string;
  options: {
    value: number;
    label: string;
    description?: string;
  }[];
}

export const sf36Dimensions = {
  salud_general: 'Salud General',
  funcion_fisica: 'Función Física',
  rol_fisico: 'Rol Físico',
  rol_emocional: 'Rol Emocional',
  funcion_social: 'Función Social',
  salud_mental: 'Salud Mental',
  dolor_corporal: 'Dolor Corporal',
  vitalidad: 'Vitalidad',
};

export const questions: SF36Question[] = [
  // Salud General
  {
    id: 'salud_general_1',
    question: 'En general, usted diría que su salud es:',
    description: 'Percepción general de salud',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Excelente' },
      { value: 4, label: 'Muy buena' },
      { value: 3, label: 'Buena' },
      { value: 2, label: 'Regular' },
      { value: 1, label: 'Mala' },
    ],
  },
  {
    id: 'salud_general_2',
    question: '¿Cómo diría que es su salud actual, comparada con la de hace un año?',
    description: 'Cambio en salud respecto al año anterior',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Mucho mejor ahora que hace un año' },
      { value: 4, label: 'Algo mejor ahora que hace un año' },
      { value: 3, label: 'Más o menos igual que hace un año' },
      { value: 2, label: 'Algo peor ahora que hace un año' },
      { value: 1, label: 'Mucho peor ahora que hace un año' },
    ],
  },

  // Función Física (10 preguntas)
  {
    id: 'funcion_fisica_1',
    question: 'Su salud actual, ¿le limita para hacer esfuerzos intensos (como correr, levantar objetos pesados)?',
    description: 'Limitación en actividades vigorosas',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_2',
    question: 'Su salud actual, ¿le limita para hacer esfuerzos moderados (como mover una mesa o caminar más de una hora)?',
    description: 'Limitación en actividades moderadas',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_3',
    question: 'Su salud actual, ¿le limita para coger o llevar la bolsa de la compra?',
    description: 'Limitación en cargar objetos',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_4',
    question: 'Su salud actual, ¿le limita para subir varios pisos por la escalera?',
    description: 'Limitación en subir varios pisos',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_5',
    question: 'Su salud actual, ¿le limita para subir un solo piso por la escalera?',
    description: 'Limitación en subir un piso',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_6',
    question: 'Su salud actual, ¿le limita para agacharse o arrodillarse?',
    description: 'Limitación en agacharse',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_7',
    question: 'Su salud actual, ¿le limita para caminar un kilómetro o más?',
    description: 'Limitación en caminar distancias largas',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_8',
    question: 'Su salud actual, ¿le limita para caminar varias manzanas?',
    description: 'Limitación en caminar varias cuadras',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_9',
    question: 'Su salud actual, ¿le limita para caminar una sola manzana?',
    description: 'Limitación en caminar una cuadra',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },
  {
    id: 'funcion_fisica_10',
    question: 'Su salud actual, ¿le limita para bañarse o vestirse por sí mismo?',
    description: 'Limitación en autocuidado',
    dimension: 'Función Física',
    options: [
      { value: 1, label: 'Sí, me limita mucho' },
      { value: 2, label: 'Sí, me limita un poco' },
      { value: 3, label: 'No, no me limita nada' },
    ],
  },

  // Rol Físico (4 preguntas)
  {
    id: 'rol_fisico_1',
    question: 'Durante las últimas 4 semanas, ¿tuvo que reducir el tiempo dedicado al trabajo o a sus actividades cotidianas a causa de su salud física?',
    description: 'Reducción de tiempo por salud física',
    dimension: 'Rol Físico',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },
  {
    id: 'rol_fisico_2',
    question: 'Durante las últimas 4 semanas, ¿hizo menos de lo que hubiera querido hacer a causa de su salud física?',
    description: 'Limitación en logros por salud física',
    dimension: 'Rol Físico',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },
  {
    id: 'rol_fisico_3',
    question: 'Durante las últimas 4 semanas, ¿tuvo que dejar de hacer algunas tareas en su trabajo o en sus actividades cotidianas, a causa de su salud física?',
    description: 'Abandono de tareas por salud física',
    dimension: 'Rol Físico',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },
  {
    id: 'rol_fisico_4',
    question: 'Durante las últimas 4 semanas, ¿tuvo dificultad para hacer su trabajo o sus actividades cotidianas (por ejemplo, le costó más de lo normal), a causa de su salud física?',
    description: 'Dificultad en trabajo por salud física',
    dimension: 'Rol Físico',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },

  // Rol Emocional (3 preguntas)
  {
    id: 'rol_emocional_1',
    question: 'Durante las últimas 4 semanas, ¿tuvo que reducir el tiempo dedicado al trabajo o a sus actividades cotidianas a causa de algún problema emocional (como estar triste, deprimido o nervioso)?',
    description: 'Reducción de tiempo por problemas emocionales',
    dimension: 'Rol Emocional',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },
  {
    id: 'rol_emocional_2',
    question: 'Durante las últimas 4 semanas, ¿hizo menos de lo que hubiera querido hacer a causa de algún problema emocional (como estar triste, deprimido o nervioso)?',
    description: 'Limitación en logros por problemas emocionales',
    dimension: 'Rol Emocional',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },
  {
    id: 'rol_emocional_3',
    question: 'Durante las últimas 4 semanas, ¿no hizo su trabajo o sus actividades cotidianas tan cuidadosamente como de costumbre, a causa de algún problema emocional (como estar triste, deprimido o nervioso)?',
    description: 'Descuido en trabajo por problemas emocionales',
    dimension: 'Rol Emocional',
    options: [
      { value: 1, label: 'Sí' },
      { value: 2, label: 'No' },
    ],
  },

  // Función Social
  {
    id: 'funcion_social_1',
    question: 'Durante las últimas 4 semanas, ¿hasta qué punto su salud física o los problemas emocionales han dificultado sus actividades sociales habituales con la familia, los amigos, los vecinos u otras personas?',
    description: 'Interferencia en actividades sociales',
    dimension: 'Función Social',
    options: [
      { value: 1, label: 'Nada' },
      { value: 2, label: 'Un poco' },
      { value: 3, label: 'Regular' },
      { value: 4, label: 'Bastante' },
      { value: 5, label: 'Mucho' },
    ],
  },

  // Dolor Corporal
  {
    id: 'dolor_corporal_1',
    question: '¿Tuvo dolor en alguna parte del cuerpo durante las últimas 4 semanas?',
    description: 'Intensidad del dolor',
    dimension: 'Dolor Corporal',
    options: [
      { value: 6, label: 'No, ninguno' },
      { value: 5, label: 'Sí, muy poco' },
      { value: 4, label: 'Sí, un poco' },
      { value: 3, label: 'Sí, moderado' },
      { value: 2, label: 'Sí, mucho' },
      { value: 1, label: 'Sí, muchísimo' },
    ],
  },
  {
    id: 'dolor_corporal_2',
    question: 'Durante las últimas 4 semanas, ¿hasta qué punto el dolor le ha dificultado su trabajo habitual (incluido el trabajo fuera de casa y las tareas domésticas)?',
    description: 'Interferencia del dolor',
    dimension: 'Dolor Corporal',
    options: [
      { value: 5, label: 'Nada' },
      { value: 4, label: 'Un poco' },
      { value: 3, label: 'Regular' },
      { value: 2, label: 'Bastante' },
      { value: 1, label: 'Mucho' },
    ],
  },

  // Vitalidad (4 preguntas)
  {
    id: 'vitalidad_1',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido lleno de vitalidad?',
    description: 'Sensación de vitalidad',
    dimension: 'Vitalidad',
    options: [
      { value: 6, label: 'Siempre' },
      { value: 5, label: 'Casi siempre' },
      { value: 4, label: 'Muchas veces' },
      { value: 3, label: 'Algunas veces' },
      { value: 2, label: 'Solo alguna vez' },
      { value: 1, label: 'Nunca' },
    ],
  },
  {
    id: 'vitalidad_2',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo ha tenido mucha energía?',
    description: 'Nivel de energía',
    dimension: 'Vitalidad',
    options: [
      { value: 6, label: 'Siempre' },
      { value: 5, label: 'Casi siempre' },
      { value: 4, label: 'Muchas veces' },
      { value: 3, label: 'Algunas veces' },
      { value: 2, label: 'Solo alguna vez' },
      { value: 1, label: 'Nunca' },
    ],
  },
  {
    id: 'vitalidad_3',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido agotado?',
    description: 'Sensación de agotamiento (invertido)',
    dimension: 'Vitalidad',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },
  {
    id: 'vitalidad_4',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido cansado?',
    description: 'Sensación de cansancio (invertido)',
    dimension: 'Vitalidad',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },

  // Salud Mental (5 preguntas)
  {
    id: 'salud_mental_1',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo ha estado muy nervioso?',
    description: 'Nivel de nerviosismo (invertido)',
    dimension: 'Salud Mental',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },
  {
    id: 'salud_mental_2',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido tan bajo de moral que nada podía animarle?',
    description: 'Estado de ánimo bajo (invertido)',
    dimension: 'Salud Mental',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },
  {
    id: 'salud_mental_3',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido calmado y tranquilo?',
    description: 'Sensación de calma',
    dimension: 'Salud Mental',
    options: [
      { value: 6, label: 'Siempre' },
      { value: 5, label: 'Casi siempre' },
      { value: 4, label: 'Muchas veces' },
      { value: 3, label: 'Algunas veces' },
      { value: 2, label: 'Solo alguna vez' },
      { value: 1, label: 'Nunca' },
    ],
  },
  {
    id: 'salud_mental_4',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido desanimado y triste?',
    description: 'Sensación de tristeza (invertido)',
    dimension: 'Salud Mental',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },
  {
    id: 'salud_mental_5',
    question: 'Durante las últimas 4 semanas, ¿cuánto tiempo se ha sentido feliz?',
    description: 'Sensación de felicidad',
    dimension: 'Salud Mental',
    options: [
      { value: 6, label: 'Siempre' },
      { value: 5, label: 'Casi siempre' },
      { value: 4, label: 'Muchas veces' },
      { value: 3, label: 'Algunas veces' },
      { value: 2, label: 'Solo alguna vez' },
      { value: 1, label: 'Nunca' },
    ],
  },

  // Función Social (segunda pregunta)
  {
    id: 'funcion_social_2',
    question: 'Durante las últimas 4 semanas, ¿con qué frecuencia la salud física o los problemas emocionales le han dificultado sus actividades sociales (como visitar a amigos o familiares)?',
    description: 'Frecuencia de dificultad social',
    dimension: 'Función Social',
    options: [
      { value: 1, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 3, label: 'Muchas veces' },
      { value: 4, label: 'Algunas veces' },
      { value: 5, label: 'Solo alguna vez' },
      { value: 6, label: 'Nunca' },
    ],
  },

  // Salud General (4 preguntas finales)
  {
    id: 'salud_general_3',
    question: 'Creo que me pongo enfermo más fácilmente que otras personas',
    description: 'Percepción de vulnerabilidad (invertido)',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Totalmente cierto' },
      { value: 4, label: 'Bastante cierto' },
      { value: 3, label: 'No lo sé' },
      { value: 2, label: 'Bastante falso' },
      { value: 1, label: 'Totalmente falso' },
    ],
  },
  {
    id: 'salud_general_4',
    question: 'Estoy tan sano como cualquiera',
    description: 'Percepción de salud comparativa',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Totalmente cierto' },
      { value: 4, label: 'Bastante cierto' },
      { value: 3, label: 'No lo sé' },
      { value: 2, label: 'Bastante falso' },
      { value: 1, label: 'Totalmente falso' },
    ],
  },
  {
    id: 'salud_general_5',
    question: 'Creo que mi salud va a empeorar',
    description: 'Expectativas de salud futura (invertido)',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Totalmente cierto' },
      { value: 4, label: 'Bastante cierto' },
      { value: 3, label: 'No lo sé' },
      { value: 2, label: 'Bastante falso' },
      { value: 1, label: 'Totalmente falso' },
    ],
  },
  {
    id: 'salud_general_6',
    question: 'Mi salud es excelente',
    description: 'Percepción de excelente salud',
    dimension: 'Salud General',
    options: [
      { value: 5, label: 'Totalmente cierto' },
      { value: 4, label: 'Bastante cierto' },
      { value: 3, label: 'No lo sé' },
      { value: 2, label: 'Bastante falso' },
      { value: 1, label: 'Totalmente falso' },
    ],
  },
];

// Interpretación por dimensión (0-100 cada una)
export const scoreInterpretation = [
  {
    min: 75,
    max: 100,
    level: 'Excelente',
    description: 'Calidad de vida muy alta',
    color: '#10B981',
  },
  {
    min: 50,
    max: 74,
    level: 'Buena',
    description: 'Calidad de vida adecuada',
    color: '#34D399',
  },
  {
    min: 25,
    max: 49,
    level: 'Regular',
    description: 'Calidad de vida comprometida',
    color: '#FBBF24',
  },
  {
    min: 0,
    max: 24,
    level: 'Pobre',
    description: 'Calidad de vida severamente afectada',
    color: '#EF4444',
  },
];

export const sf36Scale = {
  id: 'sf36',
  name: 'Cuestionario de Salud SF-36',
  acronym: 'SF-36',
  shortName: '36-Item Short Form Health Survey',
  description: 'Cuestionario de calidad de vida relacionada con la salud que evalúa 8 dimensiones del estado de salud físico y mental.',
  category: 'Calidad de Vida',
  specialty: 'Medicina General',
  bodySystem: 'Multisistémico',
  timeToComplete: '10-15 min',
  version: '1.0',
  questions,
  scoreInterpretation,
  scoring: {
    method: 'complex',
    min: 0,
    max: 100,
    unit: 'puntos (por dimensión)',
    description: 'Cada dimensión se puntúa de 0-100. Mayor puntuación indica mejor calidad de vida.',
  },
  tags: ['sf-36', 'sf36', 'calidad de vida', 'CVRS', 'salud general', 'función física', 'salud mental', 'dolor', 'vitalidad', 'función social'],
  imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop&crop=center',
  information: `
# Cuestionario de Salud SF-36

## Descripción
El SF-36 (36-Item Short Form Health Survey) es un cuestionario genérico de salud relacionada con la calidad de vida ampliamente utilizado en investigación clínica y práctica médica. Evalúa 8 dimensiones del estado de salud físico y mental.

## Dimensiones Evaluadas

### Salud Física
1. **Función Física (FF)**: Limitaciones en actividades físicas debido a problemas de salud
2. **Rol Físico (RF)**: Limitaciones en trabajo u otras actividades debido a problemas de salud física
3. **Dolor Corporal (DC)**: Intensidad del dolor y su efecto en el trabajo habitual
4. **Salud General (SG)**: Valoración personal del estado de salud

### Salud Mental
5. **Vitalidad (VT)**: Sensación de energía y vitalidad versus cansancio y agotamiento
6. **Función Social (FS)**: Interferencia de problemas de salud en actividades sociales
7. **Rol Emocional (RE)**: Limitaciones en trabajo u otras actividades debido a problemas emocionales
8. **Salud Mental (SM)**: Salud mental general, incluyendo depresión, ansiedad, control emocional y bienestar

## Puntuación

Cada dimensión se transforma a una escala de 0-100:
- **100**: Mejor estado de salud posible
- **0**: Peor estado de salud posible

### Método de Cálculo
Para cada dimensión:
1. Sumar los valores de los ítems de la dimensión
2. Transformar a escala 0-100 usando la fórmula: [(Puntuación obtenida - Puntuación mínima) / Rango] × 100

### Ítems con Puntuación Invertida
Algunos ítems requieren inversión de puntuación antes del cálculo:
- Salud General: ítems 33, 35
- Vitalidad: ítems 29, 31
- Salud Mental: ítems 24, 25, 28
- Función Social: ítems 20, 32

## Interpretación General
- **75-100**: Calidad de vida excelente
- **50-74**: Calidad de vida buena
- **25-49**: Calidad de vida regular/comprometida
- **0-24**: Calidad de vida pobre/severamente afectada

## Instrucciones de Aplicación
1. El cuestionario puede ser autoadministrado o aplicado por entrevista
2. Se refiere a las últimas 4 semanas
3. No hay respuestas correctas o incorrectas
4. Contestar todas las preguntas
5. Tiempo aproximado: 10-15 minutos

## Validez y Confiabilidad
- Alta consistencia interna (α de Cronbach > 0.70 en todas las dimensiones)
- Validez convergente y discriminante demostrada
- Sensible al cambio clínico
- Ampliamente validado en población española e hispanohablante

## Aplicaciones Clínicas
- Evaluación de resultados en salud
- Comparación de la carga de diferentes enfermedades
- Detección de beneficios de tratamientos
- Seguimiento de poblaciones generales y específicas
- Investigación en servicios de salud

## Ventajas
✓ Validado en múltiples poblaciones y culturas
✓ Amplio uso internacional
✓ Aplicable a diversas condiciones de salud
✓ Corto tiempo de aplicación
✓ Valores de referencia poblacionales disponibles

## Referencias
1. Ware JE Jr, Sherbourne CD. The MOS 36-item short-form health survey (SF-36). I. Conceptual framework and item selection. Med Care. 1992;30(6):473-483.
2. Alonso J, Prieto L, Antó JM. La versión española del SF-36 Health Survey (Cuestionario de Salud SF-36): un instrumento para la medida de los resultados clínicos. Med Clin (Barc). 1995;104(20):771-776.
3. Vilagut G, Ferrer M, Rajmil L, et al. El Cuestionario de Salud SF-36 español: una década de experiencia y nuevos desarrollos. Gac Sanit. 2005;19(2):135-150.
  `,
  references: [
    {
      title: 'The MOS 36-item short-form health survey (SF-36). I. Conceptual framework and item selection',
      authors: ['Ware JE Jr', 'Sherbourne CD'],
      year: 1992,
      journal: 'Medical Care',
      volume: '30',
      issue: '6',
      pages: '473-483',
      doi: '10.1097/00005650-199206000-00002'
    },
    {
      title: 'La versión española del SF-36 Health Survey (Cuestionario de Salud SF-36): un instrumento para la medida de los resultados clínicos',
      authors: ['Alonso J', 'Prieto L', 'Antó JM'],
      year: 1995,
      journal: 'Medicina Clínica',
      volume: '104',
      issue: '20',
      pages: '771-776'
    },
    {
      title: 'El Cuestionario de Salud SF-36 español: una década de experiencia y nuevos desarrollos',
      authors: ['Vilagut G', 'Ferrer M', 'Rajmil L', 'Rebollo P', 'Permanyer-Miralda G', 'Quintana JM', 'Santed R', 'Valderas JM', 'Ribera A', 'Domingo-Salvany A', 'Alonso J'],
      year: 2005,
      journal: 'Gaceta Sanitaria',
      volume: '19',
      issue: '2',
      pages: '135-150',
      doi: '10.1157/13074369'
    }
  ],
  lastUpdated: new Date().toISOString(),
};
