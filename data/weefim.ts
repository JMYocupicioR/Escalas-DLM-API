// WeeFIM (Functional Independence Measure for Children)
// Definición estática de preguntas y opciones para evaluación genérica

export const weeFimCategories = {
  autocuidado: 'Autocuidado',
  esfinteres: 'Control de esfínteres',
  movilidad: 'Movilidad / Transferencias',
  locomocion: 'Locomoción',
  comunicacion: 'Comunicación',
  cognicion: 'Cognición social',
};

// Preguntas (18 ítems). Categorías alineadas con FIM para compatibilidad con plantillas PDF
export const weefimQuestions = [
  // Autocuidado (incluye control de esfínteres para mantener compatibilidad visual con FIM)
  { id: 'alimentacion', category: 'autocuidado', question: 'Alimentación/Comer', description: 'Uso de utensilios, masticar y tragar.' },
  { id: 'arreglo', category: 'autocuidado', question: 'Arreglo personal/Higiene', description: 'Lavar cara/manos, peinarse, higiene básica.' },
  { id: 'bano', category: 'autocuidado', question: 'Baño', description: 'Lavado del cuerpo desde el cuello hacia abajo.' },
  { id: 'vestido_superior', category: 'autocuidado', question: 'Vestido hemicuerpo superior', description: 'Ponerse y quitarse ropa de la cintura hacia arriba.' },
  { id: 'vestido_inferior', category: 'autocuidado', question: 'Vestido hemicuerpo inferior', description: 'Ponerse y quitarse ropa de la cintura hacia abajo.' },
  { id: 'aseo_perineal', category: 'autocuidado', question: 'Ir al baño/Aseo perineal', description: 'Higiene posterior a micción o defecación.' },
  { id: 'miccion', category: 'esfinteres', question: 'Control de vejiga', description: 'Control intencional de la vejiga.' },
  { id: 'defecacion', category: 'esfinteres', question: 'Control de intestino', description: 'Control intencional de los intestinos.' },

  // Movilidad / Transferencias
  { id: 'traslado_cama', category: 'movilidad', question: 'Transferencia: cama/silla/silla de ruedas', description: 'Moverse entre cama y silla de manera segura.' },
  { id: 'traslado_bano', category: 'movilidad', question: 'Transferencia: baño/inodoro', description: 'Entrar y salir del inodoro de forma segura.' },
  { id: 'traslado_ducha', category: 'movilidad', question: 'Transferencia: bañera/ducha', description: 'Entrar y salir de la bañera o ducha.' },

  // Locomoción
  { id: 'marcha', category: 'locomocion', question: 'Locomoción: caminar/silla de ruedas/gatear', description: 'Caminar, desplazarse en silla o gatear.' },
  { id: 'escaleras', category: 'locomocion', question: 'Locomoción: escaleras', description: 'Subir y bajar un tramo de escaleras.' },

  // Comunicación
  { id: 'comprension', category: 'comunicacion', question: 'Comprensión', description: 'Entender lenguaje auditivo o visual apropiado a la edad.' },
  { id: 'expresion', category: 'comunicacion', question: 'Expresión', description: 'Expresar ideas y necesidades de forma adecuada.' },

  // Cognición social
  { id: 'interaccion', category: 'cognicion', question: 'Interacción social', description: 'Relacionarse con otros de manera apropiada.' },
  { id: 'resolucion', category: 'cognicion', question: 'Resolución de problemas', description: 'Resolver problemas de la vida diaria acorde a la edad.' },
  { id: 'memoria', category: 'cognicion', question: 'Memoria', description: 'Recordar y reconocer información relevante.' },
];

// Opciones de respuesta comunes (1-7)
export const weefimOptions = [
  { value: 7, label: 'Independencia completa', description: 'Realiza la actividad de forma segura, sin ayuda ni dispositivos y en tiempo razonable.' },
  { value: 6, label: 'Independencia modificada', description: 'Requiere adaptación, dispositivos de ayuda, más tiempo o consideraciones de seguridad.' },
  { value: 5, label: 'Supervisión', description: 'Supervisión, indicaciones verbales o preparación (e.g., colocar objetos).' },
  { value: 4, label: 'Asistencia mínima', description: 'Realiza ≥75% del esfuerzo.' },
  { value: 3, label: 'Asistencia moderada', description: 'Realiza 50–74% del esfuerzo.' },
  { value: 2, label: 'Asistencia máxima', description: 'Realiza 25–49% del esfuerzo.' },
  { value: 1, label: 'Asistencia total', description: 'Realiza <25% del esfuerzo o no realiza la actividad.' },
];

export const weefimScale = {
  id: 'weefim',
  name: 'WeeFIM (Medida de Independencia Funcional para Niños)',
  acronym: 'WeeFIM',
  description: 'Evalúa 18 ítems de autocuidado, movilidad y cognición en población pediátrica (6 meses a 18 años). Puntaje total 18–126 (1–7 por ítem).',
  category: 'Rehab',
  specialty: 'Pediatría',
  bodySystem: 'Funcional',
  timeToComplete: '15-30 min',
  version: '1.0',
  instructions: 'Asigne 1–7 a cada ítem según el desempeño habitual del niño. Motor: ítems 1–13; Cognitivo: 14–18.',
  questions: weefimQuestions,
};

