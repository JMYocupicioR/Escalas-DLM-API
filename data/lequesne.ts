export const lequesneQuestions = [
  {
    id: 'nuit',
    question: 'Durante el descanso nocturno, ¿presenta dolor o molestia en la rodilla?',
    description: 'Dolor nocturno',
    options: [
      { value: 0, label: 'No', description: '' },
      { value: 1, label: 'Solo al moverse o en ciertas posiciones', description: '' },
      { value: 2, label: 'Sin moverse', description: '' }
    ]
  },
  {
    id: 'matin',
    question: 'Rigidez matutina',
    description: 'Duración de la rigidez al despertar',
    options: [
      { value: 0, label: '< 1 minuto', description: '' },
      { value: 1, label: '1 - 15 minutos', description: '' },
      { value: 2, label: '> 15 minutos', description: '' }
    ]
  },
  {
    id: 'pietinement',
    question: 'Al estar de pie o inmóvil durante ~30 minutos, ¿presenta dolor o molestia?',
    description: 'Dolor en bipedestación prolongada',
    options: [
      { value: 0, label: 'No', description: '' },
      { value: 1, label: 'Sí', description: '' }
    ]
  },
  {
    id: 'marche',
    question: 'Al caminar, ¿presenta dolor o molestia?',
    description: 'Dolor durante la marcha',
    options: [
      { value: 0, label: 'No', description: '' },
      { value: 1, label: 'Después de cierta distancia', description: '' },
      { value: 2, label: 'Muy rápido (aumento de velocidad)', description: '' }
    ]
  },
  {
    id: 'relever',
    question: '¿Dolor al levantarse de una silla sin usar apoyabrazos?',
    description: 'Dolor al ponerse de pie desde sedestación',
    options: [
      { value: 0, label: 'No', description: '' },
      { value: 1, label: 'Sí', description: '' }
    ]
  },
  {
    id: 'autonomie',
    question: 'Distancia máxima que puede caminar (incluyendo cuando hay dolor)',
    description: 'Autonomía de marcha',
    options: [
      { value: 0, label: 'Sin limitación', description: '' },
      { value: 1, label: 'Limitado pero > 1 km', description: '' },
      { value: 2, label: '~1 km', description: '' },
      { value: 3, label: '500 - 900 m', description: '' },
      { value: 4, label: '300 - 500 m', description: '' },
      { value: 5, label: '100 - 300 m', description: '' },
      { value: 6, label: '< 100 m', description: '' },
      { value: 7, label: 'Imposible', description: '' }
    ]
  },
  {
    id: 'bequilles',
    question: 'Necesidad de ayuda para caminar',
    description: 'Apoyos técnicos durante la marcha',
    options: [
      { value: 0, label: 'Ninguna', description: '' },
      { value: 1, label: 'Con un bastón (o muleta)', description: '' },
      { value: 2, label: 'Con dos bastones (o muletas)', description: '' },
      { value: 3, label: 'Muletas / Otro apoyo', description: '' }
    ]
  },
  {
    id: 'monter_etage',
    question: 'Subir escaleras',
    description: 'Dificultad funcional al subir',
    options: [
      { value: 0, label: 'Ninguna', description: '' },
      { value: 0.5, label: 'Leve', description: '' },
      { value: 1, label: 'Moderada', description: '' },
      { value: 1.5, label: 'Significativa', description: '' },
      { value: 2, label: 'Imposible', description: '' }
    ]
  },
  {
    id: 'descendre_etage',
    question: 'Bajar escaleras',
    description: 'Dificultad funcional al bajar',
    options: [
      { value: 0, label: 'Ninguna', description: '' },
      { value: 0.5, label: 'Leve', description: '' },
      { value: 1, label: 'Moderada', description: '' },
      { value: 1.5, label: 'Significativa', description: '' },
      { value: 2, label: 'Imposible', description: '' }
    ]
  },
  {
    id: 'accroupi',
    question: 'Ponerse en cuclillas completamente',
    description: 'Dificultad para realizar una cuclilla completa',
    options: [
      { value: 0, label: 'Ninguna', description: '' },
      { value: 0.5, label: 'Leve', description: '' },
      { value: 1, label: 'Moderada', description: '' },
      { value: 1.5, label: 'Significativa', description: '' },
      { value: 2, label: 'Imposible', description: '' }
    ]
  },
  {
    id: 'plat',
    question: 'Caminar en terreno desigual',
    description: 'Dificultad para caminar en terreno irregular',
    options: [
      { value: 0, label: 'Ninguna', description: '' },
      { value: 0.5, label: 'Leve', description: '' },
      { value: 1, label: 'Moderada', description: '' },
      { value: 1.5, label: 'Significativa', description: '' },
      { value: 2, label: 'Imposible', description: '' }
    ]
  }
];

export const getLequesneInterpretation = (totalScore: number) => {
  if (totalScore <= 7) {
    return {
      level: 'Leve',
      colorKey: 'success',
      explanation: 'Impacto limitado en la vida diaria.',
      recommendation: 'Mantener actividad física moderada y control médico periódico.'
    };
  } else if (totalScore <= 13) {
    return {
      level: 'Moderada',
      colorKey: 'warning',
      explanation: 'Impacto significativo en la calidad de vida.',
      recommendation: 'Considerar fisioterapia, analgésicos y evaluación ortopédica.'
    };
  } else {
    return {
      level: 'Severa',
      colorKey: 'danger',
      explanation: 'Pronóstico malo para la función.',
      recommendation: 'Evaluación ortopédica urgente, considerar opciones quirúrgicas.'
    };
  }
};
