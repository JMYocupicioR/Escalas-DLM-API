export const fimCategories = {
  autocuidado: 'Autocuidado',
  esfinteres: 'Control de esfínteres',
  movilidad: 'Movilidad / Transferencias',
  locomocion: 'Locomoción',
  comunicacion: 'Comunicación',
  cognicion: 'Cognición social',
};

export const questions = [
  // Autocuidado
  {
    id: 'alimentacion',
    category: 'autocuidado',
    question: 'Alimentación',
    description: 'Uso de utensilios, masticar y tragar.',
  },
  {
    id: 'arreglo',
    category: 'autocuidado',
    question: 'Arreglo personal',
    description: 'Lavarse cara y manos, peinarse, maquillarse, afeitarse.',
  },
  {
    id: 'bano',
    category: 'autocuidado',
    question: 'Baño',
    description: 'Lavado de cuerpo desde el cuello hacia abajo.',
  },
  {
    id: 'vestido_superior',
    category: 'autocuidado',
    question: 'Vestido hemicuerpo superior',
    description: 'Ponerse y quitarse ropa de la cintura para arriba.',
  },
  {
    id: 'vestido_inferior',
    category: 'autocuidado',
    question: 'Vestido hemicuerpo inferior',
    description: 'Ponerse y quitarse ropa de la cintura para abajo.',
  },
  {
    id: 'aseo_perineal',
    category: 'autocuidado',
    question: 'Aseo perineal',
    description: 'Higiene después de la micción o defecación.',
  },
  // Control de esfínteres
  {
    id: 'miccion',
    category: 'esfinteres',
    question: 'Manejo de la micción',
    description: 'Control intencional de la vejiga.',
  },
  {
    id: 'defecacion',
    category: 'esfinteres',
    question: 'Manejo de la defecación',
    description: 'Control intencional de los intestinos.',
  },
  // Movilidad / Transferencias
  {
    id: 'traslado_cama',
    category: 'movilidad',
    question: 'Traslado: Cama, silla, silla de ruedas',
    description: 'Moverse de la cama a una silla y viceversa.',
  },
  {
    id: 'traslado_bano',
    category: 'movilidad',
    question: 'Traslado: Baño',
    description: 'Entrar y salir del inodoro de forma segura.',
  },
  {
    id: 'traslado_ducha',
    category: 'movilidad',
    question: 'Traslado: Ducha o bañera',
    description: 'Entrar y salir de la ducha o bañera.',
  },
  // Locomoción
  {
    id: 'marcha',
    category: 'locomocion',
    question: 'Marcha / Silla de ruedas',
    description: 'Capacidad para caminar o usar silla de ruedas en superficies planas.',
  },
  {
    id: 'escaleras',
    category: 'locomocion',
    question: 'Escaleras',
    description: 'Subir y bajar un tramo de escaleras.',
  },
  // Comunicación
  {
    id: 'comprension',
    category: 'comunicacion',
    question: 'Comprensión',
    description: 'Entender lenguaje auditivo o visual.',
  },
  {
    id: 'expresion',
    category: 'comunicacion',
    question: 'Expresión',
    description: 'Expresar ideas de forma clara.',
  },
  // Cognición social
  {
    id: 'interaccion',
    category: 'cognicion',
    question: 'Interacción social',
    description: 'Relacionarse con otros de manera apropiada.',
  },
  {
    id: 'resolucion',
    category: 'cognicion',
    question: 'Resolución de problemas',
    description: 'Resolver problemas de la vida diaria.',
  },
  {
    id: 'memoria',
    category: 'cognicion',
    question: 'Memoria',
    description: 'Recordar y reconocer información.',
  },
];

export const options = [
    { value: 7, label: 'Independencia Completa', description: 'Realiza la actividad de forma segura, sin ayuda, sin dispositivos y en un tiempo razonable.' },
    { value: 6, label: 'Independencia Modificada', description: 'Requiere algún dispositivo de ayuda, pero no asistencia de otra persona.' },
    { value: 5, label: 'Supervisión o Preparación', description: 'Requiere supervisión (pistas verbales, ánimo) o preparación (colocar objetos).' },
    { value: 4, label: 'Asistencia Mínima', description: 'El paciente realiza el 75% o más del esfuerzo.' },
    { value: 3, label: 'Asistencia Moderada', description: 'El paciente realiza entre el 50% y el 74% del esfuerzo.' },
    { value: 2, label: 'Asistencia Máxima', description: 'El paciente realiza entre el 25% y el 49% del esfuerzo.' },
    { value: 1, label: 'Asistencia Total', description: 'El paciente realiza menos del 25% del esfuerzo.' },
];
