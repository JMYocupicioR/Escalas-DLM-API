/**
 * Escala de Tinetti (POMA - Performance Oriented Mobility Assessment)
 *
 * Evaluación del equilibrio y la marcha en adultos mayores
 * para determinar el riesgo de caídas.
 *
 * Consta de 2 secciones:
 * 1. Equilibrio (9 ítems, 16 puntos máximo)
 * 2. Marcha (7 ítems, 12 puntos máximo)
 *
 * Puntuación total: 0-28 puntos
 */

export const tinettiScale = {
  name: 'Escala de Tinetti',
  shortName: 'POMA',
  description: 'Evaluación del equilibrio y la marcha para determinar riesgo de caídas',
  category: 'Balance',
  specialty: 'Geriatría',
  timeToComplete: '10-15 min',
  information: `La Escala de Tinetti o POMA (Performance Oriented Mobility Assessment) es una herramienta validada para evaluar el equilibrio y la marcha en adultos mayores, con el objetivo de identificar el riesgo de caídas.

**Instrucciones generales:**
- Realizar la evaluación en un ambiente seguro
- El paciente debe usar su calzado habitual
- Permitir el uso de ayudas técnicas si las utiliza habitualmente
- Observar y puntuar cada ítem según el desempeño del paciente

**Secciones:**
1. **Equilibrio** (9 ítems): Evalúa estabilidad sentado, levantarse, intentos de levantarse, equilibrio de pie inmediato y prolongado, resistencia al empujón, ojos cerrados, giro de 360°, y sentarse
2. **Marcha** (7 ítems): Evalúa inicio de la marcha, longitud y altura del paso, simetría, continuidad, trayectoria, tronco y distancia entre los pies`,
};

export const tinettiQuestions = [
  // SECCIÓN 1: EQUILIBRIO (9 ítems)
  {
    id: 'eq_sentado',
    question: 'Equilibrio sentado',
    description: 'Observar al paciente sentado en una silla sin brazos',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Se inclina o se desliza de la silla', description: '' },
      { value: 1, label: 'Estable, seguro', description: '' }
    ]
  },
  {
    id: 'eq_levantarse',
    question: 'Levantarse de la silla',
    description: 'Paciente se levanta de la silla',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Incapaz sin ayuda', description: '' },
      { value: 1, label: 'Capaz pero usa los brazos para ayudarse', description: '' },
      { value: 2, label: 'Capaz sin usar los brazos', description: '' }
    ]
  },
  {
    id: 'eq_intentos',
    question: 'Intentos de levantarse',
    description: 'Número de intentos necesarios',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Incapaz sin ayuda', description: '' },
      { value: 1, label: 'Capaz pero necesita más de un intento', description: '' },
      { value: 2, label: 'Capaz al primer intento', description: '' }
    ]
  },
  {
    id: 'eq_pie_inmediato',
    question: 'Equilibrio de pie inmediato (primeros 5 segundos)',
    description: 'Equilibrio al ponerse de pie',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Inestable (se tambalea, mueve los pies, oscilación marcada del tronco)', description: '' },
      { value: 1, label: 'Estable pero usa andador, bastón u otro soporte', description: '' },
      { value: 2, label: 'Estable sin ningún soporte', description: '' }
    ]
  },
  {
    id: 'eq_pie_prolongado',
    question: 'Equilibrio de pie prolongado',
    description: 'Equilibrio mantenido de pie',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Inestable', description: '' },
      { value: 1, label: 'Estable con aumento del área de sustentación (pies separados >10 cm) o usa bastón/andador', description: '' },
      { value: 2, label: 'Estable con base de sustentación estrecha sin soporte', description: '' }
    ]
  },
  {
    id: 'eq_romberg',
    question: 'Romberg sensibilizado (de pie con los pies juntos, ojos cerrados)',
    description: 'Prueba de Romberg',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Inestable', description: '' },
      { value: 1, label: 'Estable', description: '' }
    ]
  },
  {
    id: 'eq_empujon',
    question: 'Prueba del empujón (paciente de pie con los pies juntos, el examinador empuja suavemente el esternón con la palma de la mano 3 veces)',
    description: 'Resistencia al empujón esternal',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Empieza a caer', description: '' },
      { value: 1, label: 'Se tambalea, se agarra, pero se mantiene solo', description: '' },
      { value: 2, label: 'Estable', description: '' }
    ]
  },
  {
    id: 'eq_giro',
    question: 'Giro de 360 grados',
    description: 'Dar una vuelta completa',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Pasos discontinuos', description: '' },
      { value: 1, label: 'Pasos continuos', description: '' }
    ]
  },
  {
    id: 'eq_giro_inestable',
    question: 'Giro de 360 grados - Estabilidad',
    description: 'Estabilidad durante el giro',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Inestable (se tambalea, se agarra)', description: '' },
      { value: 1, label: 'Estable', description: '' }
    ]
  },
  {
    id: 'eq_sentarse',
    question: 'Sentarse',
    description: 'Acción de sentarse',
    section: 'equilibrio',
    options: [
      { value: 0, label: 'Inseguro (calcula mal la distancia, cae en la silla)', description: '' },
      { value: 1, label: 'Usa los brazos o movimiento brusco', description: '' },
      { value: 2, label: 'Seguro, movimiento suave', description: '' }
    ]
  },

  // SECCIÓN 2: MARCHA (7 ítems)
  {
    id: 'ma_inicio',
    question: 'Inicio de la marcha (inmediatamente después de decir "camine")',
    description: 'Iniciación de la marcha',
    section: 'marcha',
    options: [
      { value: 0, label: 'Vacila o múltiples intentos para comenzar', description: '' },
      { value: 1, label: 'No vacila', description: '' }
    ]
  },
  {
    id: 'ma_longitud_paso',
    question: 'Longitud y altura del paso',
    description: 'Pie derecho (swing)',
    section: 'marcha',
    options: [
      { value: 0, label: 'No sobrepasa al pie izquierdo en apoyo', description: '' },
      { value: 1, label: 'Sobrepasa al pie izquierdo', description: '' }
    ]
  },
  {
    id: 'ma_altura_paso',
    question: 'Altura del paso',
    description: 'Pie derecho (swing)',
    section: 'marcha',
    options: [
      { value: 0, label: 'No se levanta completamente del suelo (arrastra, levanta poco)', description: '' },
      { value: 1, label: 'Se levanta completamente', description: '' }
    ]
  },
  {
    id: 'ma_longitud_izq',
    question: 'Longitud del paso',
    description: 'Pie izquierdo (swing)',
    section: 'marcha',
    options: [
      { value: 0, label: 'No sobrepasa al pie derecho en apoyo', description: '' },
      { value: 1, label: 'Sobrepasa al pie derecho', description: '' }
    ]
  },
  {
    id: 'ma_altura_izq',
    question: 'Altura del paso',
    description: 'Pie izquierdo (swing)',
    section: 'marcha',
    options: [
      { value: 0, label: 'No se levanta completamente del suelo', description: '' },
      { value: 1, label: 'Se levanta completamente', description: '' }
    ]
  },
  {
    id: 'ma_simetria',
    question: 'Simetría del paso',
    description: 'Longitud de los pasos',
    section: 'marcha',
    options: [
      { value: 0, label: 'Longitud desigual entre pasos derecho e izquierdo', description: '' },
      { value: 1, label: 'Pasos parecen iguales', description: '' }
    ]
  },
  {
    id: 'ma_continuidad',
    question: 'Continuidad de los pasos',
    description: 'Fluidez de la marcha',
    section: 'marcha',
    options: [
      { value: 0, label: 'Paradas o discontinuidad entre pasos', description: '' },
      { value: 1, label: 'Pasos continuos', description: '' }
    ]
  },
  {
    id: 'ma_trayectoria',
    question: 'Trayectoria (observar el trazado que realiza uno de los pies durante 3 metros)',
    description: 'Desviación de la marcha',
    section: 'marcha',
    options: [
      { value: 0, label: 'Desviación marcada', description: '' },
      { value: 1, label: 'Desviación leve o moderada o usa ayuda', description: '' },
      { value: 2, label: 'Recto sin ayuda', description: '' }
    ]
  },
  {
    id: 'ma_tronco',
    question: 'Tronco',
    description: 'Posición del tronco durante la marcha',
    section: 'marcha',
    options: [
      { value: 0, label: 'Oscilación marcada o usa ayuda', description: '' },
      { value: 1, label: 'No oscila pero flexiona rodillas o espalda o separa brazos al caminar', description: '' },
      { value: 2, label: 'No oscila, no flexiona, no usa brazos ni ayuda', description: '' }
    ]
  },
  {
    id: 'ma_distancia_pies',
    question: 'Distancia entre los pies al caminar',
    description: 'Base de sustentación',
    section: 'marcha',
    options: [
      { value: 0, label: 'Talones separados', description: '' },
      { value: 1, label: 'Talones casi se tocan al caminar', description: '' }
    ]
  }
];

export const scoreInterpretation = [
  {
    min: 25,
    max: 28,
    level: 'Riesgo Bajo',
    description: 'Bajo riesgo de caídas',
    risk: 'El paciente presenta buena movilidad y equilibrio',
    color: '#10B981',
  },
  {
    min: 19,
    max: 24,
    level: 'Riesgo Moderado',
    description: 'Riesgo moderado de caídas',
    risk: 'Se recomienda intervención preventiva',
    color: '#F59E0B',
  },
  {
    min: 0,
    max: 18,
    level: 'Riesgo Alto',
    description: 'Alto riesgo de caídas',
    risk: 'Requiere intervención urgente y seguimiento estrecho',
    color: '#EF4444',
  },
];

/**
 * Calcula el puntaje total de Tinetti
 */
export const calculateTinettiScore = (answers: Record<string, number>) => {
  const equilibrioQuestions = tinettiQuestions.filter(q => q.section === 'equilibrio');
  const marchaQuestions = tinettiQuestions.filter(q => q.section === 'marcha');

  const equilibrioScore = equilibrioQuestions.reduce((sum, q) => {
    return sum + (answers[q.id] || 0);
  }, 0);

  const marchaScore = marchaQuestions.reduce((sum, q) => {
    return sum + (answers[q.id] || 0);
  }, 0);

  const totalScore = equilibrioScore + marchaScore;

  const interpretation = scoreInterpretation.find(
    range => totalScore >= range.min && totalScore <= range.max
  );

  return {
    equilibrioScore,
    marchaScore,
    totalScore,
    maxScore: 28,
    interpretation,
  };
};
