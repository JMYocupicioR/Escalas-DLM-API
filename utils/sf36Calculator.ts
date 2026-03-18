/**
 * Calculadora del SF-36
 *
 * El SF-36 calcula 8 dimensiones por separado, cada una transformada a escala 0-100.
 * A mayor puntuación, mejor estado de salud.
 */

export interface SF36Scores {
  saludGeneral: number;
  funcionFisica: number;
  rolFisico: number;
  rolEmocional: number;
  funcionSocial: number;
  dolorCorporal: number;
  vitalidad: number;
  saludMental: number;
  promedioTotal: number;
}

/**
 * Mapa de preguntas por dimensión con sus rangos de puntuación
 */
const dimensionConfig = {
  saludGeneral: {
    items: ['salud_general_1', 'salud_general_2', 'salud_general_3', 'salud_general_4', 'salud_general_5', 'salud_general_6'],
    min: 6,  // Suma mínima posible
    max: 30, // Suma máxima posible (5+5+5+5+5+5)
    // Items invertidos (menor valor = mejor salud, necesitan recodificación)
    invertedItems: ['salud_general_3', 'salud_general_5'],
  },
  funcionFisica: {
    items: [
      'funcion_fisica_1', 'funcion_fisica_2', 'funcion_fisica_3', 'funcion_fisica_4', 'funcion_fisica_5',
      'funcion_fisica_6', 'funcion_fisica_7', 'funcion_fisica_8', 'funcion_fisica_9', 'funcion_fisica_10'
    ],
    min: 10,  // 10 items × 1
    max: 30,  // 10 items × 3
    invertedItems: [],
  },
  rolFisico: {
    items: ['rol_fisico_1', 'rol_fisico_2', 'rol_fisico_3', 'rol_fisico_4'],
    min: 4,   // 4 items × 1
    max: 8,   // 4 items × 2
    invertedItems: [],
  },
  rolEmocional: {
    items: ['rol_emocional_1', 'rol_emocional_2', 'rol_emocional_3'],
    min: 3,   // 3 items × 1
    max: 6,   // 3 items × 2
    invertedItems: [],
  },
  funcionSocial: {
    items: ['funcion_social_1', 'funcion_social_2'],
    min: 2,   // Item 1: 1-5, Item 2: 1-6 → min = 2
    max: 11,  // Item 1: 5, Item 2: 6 → max = 11
    invertedItems: ['funcion_social_1'], // Menor valor = mejor
  },
  dolorCorporal: {
    items: ['dolor_corporal_1', 'dolor_corporal_2'],
    min: 2,   // 1 + 1
    max: 11,  // 6 + 5
    invertedItems: [],
  },
  vitalidad: {
    items: ['vitalidad_1', 'vitalidad_2', 'vitalidad_3', 'vitalidad_4'],
    min: 4,   // 4 items × 1
    max: 24,  // 4 items × 6
    invertedItems: ['vitalidad_3', 'vitalidad_4'], // Agotamiento y cansancio están invertidos
  },
  saludMental: {
    items: ['salud_mental_1', 'salud_mental_2', 'salud_mental_3', 'salud_mental_4', 'salud_mental_5'],
    min: 5,   // 5 items × 1
    max: 30,  // 5 items × 6
    invertedItems: ['salud_mental_1', 'salud_mental_2', 'salud_mental_4'], // Nervioso, bajo de moral, desanimado
  },
};

/**
 * Transforma una puntuación cruda a escala 0-100
 */
function transformToScale(rawScore: number, min: number, max: number): number {
  if (max === min) return 100;
  const range = max - min;
  return Math.round(((rawScore - min) / range) * 100);
}

/**
 * Calcula las 8 dimensiones del SF-36
 */
export function calculateSF36(responses: Record<string, number | string>): SF36Scores {
  const scores: Partial<SF36Scores> = {};

  // Calcular cada dimensión
  for (const [dimension, config] of Object.entries(dimensionConfig)) {
    let rawScore = 0;
    let itemCount = 0;

    for (const itemId of config.items) {
      const value = responses[itemId];
      if (typeof value === 'number') {
        rawScore += value;
        itemCount++;
      }
    }

    // Si no se respondieron todas las preguntas de la dimensión, puntuar 0
    if (itemCount !== config.items.length) {
      scores[dimension as keyof SF36Scores] = 0;
    } else {
      // Transformar a escala 0-100
      const scaledScore = transformToScale(rawScore, config.min, config.max);
      scores[dimension as keyof SF36Scores] = scaledScore;
    }
  }

  // Calcular promedio total (opcional, algunos usan componentes físico/mental por separado)
  const dimensionScores = Object.values(scores).filter((s): s is number => typeof s === 'number');
  const promedioTotal = dimensionScores.length > 0
    ? Math.round(dimensionScores.reduce((sum, score) => sum + score, 0) / dimensionScores.length)
    : 0;

  return {
    saludGeneral: scores.saludGeneral || 0,
    funcionFisica: scores.funcionFisica || 0,
    rolFisico: scores.rolFisico || 0,
    rolEmocional: scores.rolEmocional || 0,
    funcionSocial: scores.funcionSocial || 0,
    dolorCorporal: scores.dolorCorporal || 0,
    vitalidad: scores.vitalidad || 0,
    saludMental: scores.saludMental || 0,
    promedioTotal,
  };
}

/**
 * Obtiene interpretación textual basada en el promedio
 */
export function getSF36Interpretation(promedioTotal: number): {
  level: string;
  text: string;
  colorCode: string;
} {
  if (promedioTotal >= 75) {
    return {
      level: 'Excelente',
      text: 'Calidad de vida muy alta',
      colorCode: '#10B981',
    };
  } else if (promedioTotal >= 50) {
    return {
      level: 'Buena',
      text: 'Calidad de vida adecuada',
      colorCode: '#34D399',
    };
  } else if (promedioTotal >= 25) {
    return {
      level: 'Regular',
      text: 'Calidad de vida comprometida',
      colorCode: '#FBBF24',
    };
  } else {
    return {
      level: 'Pobre',
      text: 'Calidad de vida severamente afectada',
      colorCode: '#EF4444',
    };
  }
}

/**
 * Genera texto detallado de resultados por dimensión
 */
export function getSF36DetailedResults(scores: SF36Scores): string {
  const dimensionNames = {
    saludGeneral: 'Salud General',
    funcionFisica: 'Función Física',
    rolFisico: 'Rol Físico',
    rolEmocional: 'Rol Emocional',
    funcionSocial: 'Función Social',
    dolorCorporal: 'Dolor Corporal',
    vitalidad: 'Vitalidad',
    saludMental: 'Salud Mental',
  };

  const results: string[] = [];

  for (const [key, name] of Object.entries(dimensionNames)) {
    const score = scores[key as keyof Omit<SF36Scores, 'promedioTotal'>];
    results.push(`${name}: ${score}/100`);
  }

  return results.join('\n');
}
