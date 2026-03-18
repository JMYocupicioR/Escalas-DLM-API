// data/gasSuggestions.ts
export type GASCategory = 'funcion_pasiva' | 'funcion_activa' | 'dolor' | 'movilidad' | 'participacion' | 'habilidad';
export type PathologyType = 'general' | 'evc' | 'tce' | 'lesion_medular' | 'parkinson' | 'esclerosis_multiple' | 'artritis' | 'amputacion' | 'pediatrico' | 'geriatrico';

export interface GASGoalSuggestion {
  title: string;
  level0: string; // Meta SMART principal
  level1?: string; // Mejor que esperado
  level2?: string; // Mucho mejor que esperado
  levelMinus1?: string; // Progreso parcial
  levelMinus2?: string; // Peor que esperado
  weight?: number; // Peso sugerido
  tip?: string; // Consejo clínico
  timeframe?: string; // Marco temporal sugerido
  measurability?: string; // Criterios de medición
}

export const CATEGORY_LABELS: Record<GASCategory, string> = {
  funcion_pasiva: 'Función Pasiva',
  funcion_activa: 'Función Activa',
  dolor: 'Manejo del Dolor',
  movilidad: 'Movilidad',
  participacion: 'Participación',
  habilidad: 'Habilidad Específica',
};

export const PATHOLOGY_LABELS: Record<PathologyType, string> = {
  general: 'General',
  evc: 'EVC/Ictus',
  tce: 'TCE',
  lesion_medular: 'Lesión Medular',
  parkinson: 'Parkinson',
  esclerosis_multiple: 'Esclerosis Múltiple',
  artritis: 'Artritis/Reumatológico',
  amputacion: 'Amputación',
  pediatrico: 'Pediátrico',
  geriatrico: 'Geriátrico',
};

// Sugerencias por categoría y patología
export const GAS_SUGGESTIONS: Record<PathologyType, Record<GASCategory, GASGoalSuggestion[]>> = {
  general: {
    funcion_pasiva: [
      {
        title: 'Higiene palmar sin resistencia',
        level0: 'El cuidador realiza higiene palmar completa sin encontrar resistencia espástica en 100% de los intentos diarios.',
        level1: 'Higiene palmar sin resistencia y con relajación visible de la musculatura en 100% de intentos.',
        level2: 'Higiene palmar sin resistencia, con relajación muscular y cooperación activa del paciente.',
        levelMinus1: 'Higiene palmar con resistencia leve en menos del 50% de los intentos.',
        levelMinus2: 'Higiene palmar con resistencia significativa que requiere dos personas o técnicas especiales.',
        weight: 2,
        tip: 'Útil para manejo de espasticidad y prevención de maceración.',
        timeframe: '2-4 semanas',
        measurability: 'Porcentaje de intentos exitosos, nivel de resistencia (escala 0-3)'
      },
      {
        title: 'Posicionamiento en sedestación',
        level0: 'Mantiene posicionamiento correcto en sedestación con soporte durante 30 minutos sin deslizamiento o inclinación.',
        level1: 'Mantiene posicionamiento correcto durante 45 minutos con mínimos ajustes.',
        level2: 'Mantiene posicionamiento correcto durante 60 minutos de forma independiente.',
        levelMinus1: 'Mantiene posicionamiento durante 15 minutos con ajustes frecuentes.',
        levelMinus2: 'Requiere reposicionamiento continuo cada 5-10 minutos.',
        weight: 2,
        tip: 'Fundamental para prevenir deformidades y úlceras por presión.',
        timeframe: '1-3 semanas',
        measurability: 'Tiempo de mantenimiento, número de ajustes necesarios'
      }
    ],
    funcion_activa: [
      {
        title: 'Alcance y agarre funcional',
        level0: 'Alcanza y agarra una taza de 200ml situada a 30cm de distancia, manteniéndola 10 segundos sin derramar.',
        level1: 'Alcanza y agarra objetos variados (200-500g) a diferentes distancias (20-40cm) durante 15 segundos.',
        level2: 'Alcanza, agarra y transporta objetos de diferentes pesos y formas de manera fluida y coordinada.',
        levelMinus1: 'Alcanza objetos ligeros (100g) a 20cm con movimiento compensatorio pero exitoso.',
        levelMinus2: 'Intento de alcance con movimiento mínimo pero sin lograr agarre funcional.',
        weight: 3,
        tip: 'Objetivo fundamental para recuperación de función de miembro superior.',
        timeframe: '4-8 semanas',
        measurability: 'Distancia alcanzada, peso sostenido, tiempo de mantenimiento'
      },
      {
        title: 'Prensión de pinza fina',
        level0: 'Realiza prensión de pinza fina para recoger 10 monedas de 1€ y colocarlas en un recipiente en menos de 60 segundos.',
        level1: 'Recoge 15 monedas en menos de 45 segundos con movimientos coordinados.',
        level2: 'Recoge 20 monedas en menos de 30 segundos con destreza normal.',
        levelMinus1: 'Recoge 5 monedas en 60 segundos con esfuerzo considerable.',
        levelMinus2: 'Intenta prensión de pinza pero no logra recoger objetos pequeños de forma consistente.',
        weight: 3,
        tip: 'Esencial para actividades de vida diaria finas como botones, escritura.',
        timeframe: '6-12 semanas',
        measurability: 'Número de objetos, tiempo empleado, calidad del movimiento'
      }
    ],
    dolor: [
      {
        title: 'Dolor en reposo controlado',
        level0: 'Reporta dolor en reposo ≤3/10 en escala numérica durante al menos 6 de 7 días de la semana.',
        level1: 'Dolor en reposo ≤2/10 durante toda la semana.',
        level2: 'Sin dolor en reposo (0/10) durante toda la semana.',
        levelMinus1: 'Dolor en reposo ≤5/10 durante 4-5 días de la semana.',
        levelMinus2: 'Dolor en reposo >5/10 la mayoría de los días.',
        weight: 2,
        tip: 'Base para otros objetivos funcionales. Evaluar patrones y desencadenantes.',
        timeframe: '2-4 semanas',
        measurability: 'Escala numérica 0-10, frecuencia semanal, registro diario'
      },
      {
        title: 'Dolor durante actividad funcional',
        level0: 'Dolor ≤4/10 durante actividades de autocuidado (vestirse, asearse) completadas en tiempo habitual.',
        level1: 'Dolor ≤3/10 durante actividades de autocuidado con tiempo normal.',
        level2: 'Dolor ≤2/10 durante todas las actividades sin limitación temporal.',
        levelMinus1: 'Dolor ≤6/10 durante actividades básicas con tiempo aumentado 50%.',
        levelMinus2: 'Dolor >6/10 que impide completar actividades básicas.',
        weight: 3,
        tip: 'Objetivo funcional que permite progresión a metas más complejas.',
        timeframe: '3-6 semanas',
        measurability: 'Escala numérica, tiempo de completación, actividades logradas'
      }
    ],
    movilidad: [
      {
        title: 'Transferencia cama-silla supervisada',
        level0: 'Realiza transferencia de cama a silla con supervisión verbal únicamente, sin ayuda física, en 3 intentos consecutivos.',
        level1: 'Transferencia independiente con supervisión a distancia por seguridad.',
        level2: 'Transferencia completamente independiente sin supervisión.',
        levelMinus1: 'Transferencia con asistencia mínima (contacto ligero) en 2 de 3 intentos.',
        levelMinus2: 'Requiere asistencia moderada o máxima para la transferencia.',
        weight: 3,
        tip: 'Objetivo clave para independencia básica. Evaluar seguridad y técnica.',
        timeframe: '2-6 semanas',
        measurability: 'Nivel de asistencia, número de intentos exitosos, seguridad'
      },
      {
        title: 'Deambulación con ayuda técnica',
        level0: 'Deambula 50 metros en superficie plana con bastón de un punto y supervisión, sin pérdidas de equilibrio.',
        level1: 'Deambula 100 metros con bastón de forma independiente.',
        level2: 'Deambula 200 metros sin ayuda técnica con supervisión.',
        levelMinus1: 'Deambula 25 metros con bastón y asistencia mínima.',
        levelMinus2: 'Deambula menos de 10 metros con andador y asistencia.',
        weight: 3,
        tip: 'Progresión gradual en distancia y reducción de ayudas.',
        timeframe: '4-12 semanas',
        measurability: 'Distancia recorrida, tipo de ayuda técnica, nivel de supervisión'
      }
    ],
    participacion: [
      {
        title: 'Vestido independiente parte superior',
        level0: 'Se viste la parte superior del cuerpo de forma independiente en menos de 8 minutos usando técnicas compensatorias.',
        level1: 'Vestido superior independiente en menos de 5 minutos.',
        level2: 'Vestido superior con técnica normal en menos de 3 minutos.',
        levelMinus1: 'Vestido superior con asistencia mínima en menos de 10 minutos.',
        levelMinus2: 'Requiere asistencia moderada para vestido superior.',
        weight: 2,
        tip: 'Actividad básica de vida diaria fundamental para autoestima.',
        timeframe: '3-8 semanas',
        measurability: 'Tiempo empleado, nivel de independencia, técnica utilizada'
      },
      {
        title: 'Preparación de comida sencilla',
        level0: 'Prepara un desayuno sencillo (tostada, café, fruta) de forma segura e independiente en menos de 15 minutos.',
        level1: 'Prepara desayuno completo con variedad en menos de 12 minutos.',
        level2: 'Prepara comidas sencillas (ensalada, sándwich) de forma eficiente.',
        levelMinus1: 'Prepara desayuno sencillo con supervisión por seguridad.',
        levelMinus2: 'Requiere asistencia para preparar cualquier comida.',
        weight: 2,
        tip: 'Importante para independencia en el hogar y nutrición adecuada.',
        timeframe: '4-10 semanas',
        measurability: 'Complejidad de la comida, tiempo, seguridad, independencia'
      }
    ],
    habilidad: [
      {
        title: 'Escritura funcional legible',
        level0: 'Escribe su nombre, apellidos y fecha de forma legible en 4 de 5 intentos en menos de 2 minutos.',
        level1: 'Escribe información personal completa (nombre, dirección, teléfono) de forma legible.',
        level2: 'Escribe frases cortas y listas de compras de forma fluida y legible.',
        levelMinus1: 'Escribe su nombre de forma parcialmente legible en 2 de 5 intentos.',
        levelMinus2: 'Intenta escribir pero el resultado es ilegible o incompleto.',
        weight: 2,
        tip: 'Habilidad importante para documentos, comunicación escrita.',
        timeframe: '4-12 semanas',
        measurability: 'Legibilidad (escala 1-5), velocidad, contenido completado'
      }
    ]
  },

  evc: {
    funcion_pasiva: [
      {
        title: 'Reducción de espasticidad en flexores',
        level0: 'Permite extensión pasiva completa del codo afectado sin resistencia significativa en 100% de las movilizaciones.',
        level1: 'Extensión pasiva con relajación muscular visible y mantenimiento de 30 segundos.',
        level2: 'Extensión pasiva con relajación completa y cooperación activa del paciente.',
        levelMinus1: 'Extensión pasiva con resistencia leve que cede gradualmente.',
        levelMinus2: 'Resistencia significativa que limita la extensión a menos de 90°.',
        weight: 3,
        tip: 'Fundamental para prevenir contracturas post-EVC.',
        timeframe: '2-8 semanas',
        measurability: 'Grados de extensión logrados, resistencia (escala Ashworth), tiempo de mantenimiento'
      },
      {
        title: 'Posicionamiento anti-espástico',
        level0: 'Mantiene posicionamiento del miembro superior en patrón anti-espástico durante 2 horas continuas sin molestias.',
        level1: 'Mantiene posicionamiento durante 4 horas con comodidad.',
        level2: 'Tolera posicionamiento durante toda la noche (8 horas).',
        levelMinus1: 'Mantiene posicionamiento durante 1 hora con ajustes menores.',
        levelMinus2: 'Rechaza o no tolera el posicionamiento más de 30 minutos.',
        weight: 2,
        tip: 'Previene deformidades y mejora circulación.',
        timeframe: '1-4 semanas',
        measurability: 'Tiempo de tolerancia, comodidad reportada, adherencia'
      }
    ],
    funcion_activa: [
      {
        title: 'Activación selectiva de extensores',
        level0: 'Realiza extensión activa de muñeca del miembro afectado ≥20° mantenida durante 5 segundos, 5 repeticiones consecutivas.',
        level1: 'Extensión de muñeca ≥30° mantenida 10 segundos, 8 repeticiones.',
        level2: 'Extensión de muñeca ≥40° con control fino y 15 repeticiones.',
        levelMinus1: 'Extensión de muñeca ≥10° mantenida 3 segundos, 3 repeticiones.',
        levelMinus2: 'Intento de extensión visible pero sin lograr posición neutra.',
        weight: 3,
        tip: 'Base para recuperación de función de mano post-EVC.',
        timeframe: '4-12 semanas',
        measurability: 'Grados de extensión, tiempo de mantenimiento, repeticiones'
      },
      {
        title: 'Disociación de movimientos',
        level0: 'Realiza flexión de hombro hasta 90° sin activación de sinergias patológicas en el miembro afectado.',
        level1: 'Flexión de hombro hasta 120° con mínimas sinergias.',
        level2: 'Movimiento de hombro en todos los planos sin sinergias patológicas.',
        levelMinus1: 'Flexión de hombro hasta 60° con sinergias leves controlables.',
        levelMinus2: 'Movimiento de hombro solo en patrón sinérgico completo.',
        weight: 3,
        tip: 'Indicador de recuperación neurológica y control motor selectivo.',
        timeframe: '6-16 semanas',
        measurability: 'Grados de movimiento, presencia/ausencia de sinergias, calidad del movimiento'
      }
    ],
    dolor: [
      {
        title: 'Dolor de hombro hemipléjico',
        level0: 'Dolor de hombro del lado afectado ≤3/10 durante movilizaciones pasivas y actividades de autocuidado.',
        level1: 'Dolor ≤2/10 durante todas las actividades funcionales.',
        level2: 'Sin dolor (0/10) durante actividades y movilizaciones.',
        levelMinus1: 'Dolor ≤5/10 durante actividades básicas con modificaciones.',
        levelMinus2: 'Dolor >5/10 que limita significativamente las actividades.',
        weight: 3,
        tip: 'Complicación frecuente post-EVC que limita rehabilitación.',
        timeframe: '2-8 semanas',
        measurability: 'Escala numérica, actividades toleradas, uso de analgésicos'
      }
    ],
    movilidad: [
      {
        title: 'Marcha hemipléjica funcional',
        level0: 'Deambula 100 metros con bastón de un punto, patrón de marcha estable y velocidad ≥0.4 m/s.',
        level1: 'Deambula 200 metros con bastón, velocidad ≥0.6 m/s.',
        level2: 'Deambula 300 metros sin ayuda técnica, velocidad ≥0.8 m/s.',
        levelMinus1: 'Deambula 50 metros con bastón y supervisión cercana.',
        levelMinus2: 'Deambula menos de 25 metros con andador y asistencia.',
        weight: 3,
        tip: 'Objetivo principal para independencia comunitaria post-EVC.',
        timeframe: '4-16 semanas',
        measurability: 'Distancia, velocidad, ayuda técnica necesaria, seguridad'
      },
      {
        title: 'Equilibrio en bipedestación',
        level0: 'Mantiene equilibrio en bipedestación sin apoyo durante 60 segundos con ojos abiertos y cerrados.',
        level1: 'Equilibrio durante 90 segundos con perturbaciones leves.',
        level2: 'Equilibrio dinámico con desplazamientos de peso y giros.',
        levelMinus1: 'Equilibrio durante 30 segundos con supervisión.',
        levelMinus2: 'Requiere apoyo continuo para mantener bipedestación.',
        weight: 2,
        tip: 'Prerequisito para marcha segura y transferencias.',
        timeframe: '2-8 semanas',
        measurability: 'Tiempo de mantenimiento, condiciones (ojos abiertos/cerrados), estabilidad'
      }
    ],
    participacion: [
      {
        title: 'Conducir vehículo adaptado',
        level0: 'Conduce vehículo con adaptaciones durante 30 minutos en trayectos conocidos de forma segura.',
        level1: 'Conduce 60 minutos en diferentes tipos de vías con confianza.',
        level2: 'Conduce de forma independiente sin restricciones de tiempo o ruta.',
        levelMinus1: 'Conduce 15 minutos en área controlada con instructor.',
        levelMinus2: 'No puede manejar los controles del vehículo de forma segura.',
        weight: 2,
        tip: 'Importante para independencia comunitaria y laboral.',
        timeframe: '8-20 semanas',
        measurability: 'Tiempo de conducción, tipos de vías, evaluación de seguridad'
      }
    ],
    habilidad: [
      {
        title: 'Uso de dispositivos tecnológicos',
        level0: 'Utiliza tablet o smartphone para comunicación básica (llamadas, mensajes) con adaptaciones si necesario.',
        level1: 'Usa dispositivos para actividades complejas (email, navegación web).',
        level2: 'Domina múltiples aplicaciones y funciones avanzadas.',
        levelMinus1: 'Usa dispositivos para funciones muy básicas con asistencia.',
        levelMinus2: 'No puede utilizar dispositivos tecnológicos de forma funcional.',
        weight: 1,
        tip: 'Importante para comunicación y participación social moderna.',
        timeframe: '4-12 semanas',
        measurability: 'Funciones dominadas, velocidad de uso, independencia'
      }
    ]
  },

  tce: {
    funcion_pasiva: [
      {
        title: 'Tolerancia a estímulos sensoriales',
        level0: 'Tolera ambiente con ruido moderado (conversación normal) durante 30 minutos sin signos de agitación.',
        level1: 'Tolera ambientes con múltiples estímulos durante 45 minutos.',
        level2: 'Tolera ambientes estimulantes complejos durante 60 minutos.',
        levelMinus1: 'Tolera ambientes tranquilos durante 15 minutos.',
        levelMinus2: 'Requiere ambiente con estímulos mínimos para evitar agitación.',
        weight: 2,
        tip: 'Fundamental para progresión en rehabilitación post-TCE.',
        timeframe: '2-6 semanas',
        measurability: 'Tiempo de tolerancia, nivel de estímulos, signos de agitación'
      }
    ],
    funcion_activa: [
      {
        title: 'Atención sostenida en tarea',
        level0: 'Mantiene atención en tarea estructurada durante 15 minutos con máximo 2 redirecciones.',
        level1: 'Atención sostenida durante 30 minutos con 1 redirección.',
        level2: 'Atención sostenida durante 45 minutos sin redirecciones.',
        levelMinus1: 'Atención durante 10 minutos con 3-4 redirecciones.',
        levelMinus2: 'Atención fragmentada, requiere redirección constante.',
        weight: 3,
        tip: 'Base para todas las actividades de rehabilitación cognitiva.',
        timeframe: '3-8 semanas',
        measurability: 'Tiempo de atención, número de redirecciones, tipo de tarea'
      }
    ],
    dolor: [
      {
        title: 'Cefalea post-traumática controlada',
        level0: 'Reporta cefalea ≤4/10 que no interfiere con actividades de rehabilitación diarias.',
        level1: 'Cefalea ≤3/10 con participación completa en todas las actividades.',
        level2: 'Cefalea ≤2/10 o ausente la mayoría de los días.',
        levelMinus1: 'Cefalea ≤6/10 que limita algunas actividades.',
        levelMinus2: 'Cefalea >6/10 que impide participación en rehabilitación.',
        weight: 2,
        tip: 'Síntoma común post-TCE que afecta participación en terapias.',
        timeframe: '2-8 semanas',
        measurability: 'Intensidad del dolor, interferencia con actividades, frecuencia'
      }
    ],
    movilidad: [
      {
        title: 'Navegación espacial básica',
        level0: 'Navega independientemente en espacios familiares (habitación, baño) sin perderse.',
        level1: 'Navega en espacios semi-familiares (planta del hospital) con orientación inicial.',
        level2: 'Navega en espacios nuevos utilizando señales y mapas.',
        levelMinus1: 'Navega en espacios muy familiares con recordatorios ocasionales.',
        levelMinus2: 'Se desorienta incluso en espacios muy conocidos.',
        weight: 2,
        tip: 'Importante para seguridad e independencia básica.',
        timeframe: '4-12 semanas',
        measurability: 'Complejidad del espacio, nivel de orientación requerida, errores de navegación'
      }
    ],
    participacion: [
      {
        title: 'Manejo de dinero básico',
        level0: 'Realiza compras sencillas (menos de 20€) calculando cambio correctamente en 4 de 5 intentos.',
        level1: 'Maneja transacciones hasta 50€ con cálculos precisos.',
        level2: 'Maneja presupuestos semanales y planifica gastos.',
        levelMinus1: 'Realiza compras muy sencillas (menos de 10€) con supervisión.',
        levelMinus2: 'No puede manejar dinero de forma funcional.',
        weight: 2,
        tip: 'Habilidad práctica esencial para independencia comunitaria.',
        timeframe: '6-16 semanas',
        measurability: 'Cantidad manejada, precisión en cálculos, complejidad de transacciones'
      }
    ],
    habilidad: [
      {
        title: 'Uso de agenda y recordatorios',
        level0: 'Utiliza agenda física o digital para recordar 3 citas/tareas semanales con 90% de efectividad.',
        level1: 'Maneja agenda compleja con múltiples recordatorios y alarmas.',
        level2: 'Planifica y organiza horarios semanales de forma independiente.',
        levelMinus1: 'Usa recordatorios simples para 1-2 tareas con asistencia.',
        levelMinus2: 'No puede utilizar sistemas de recordatorio de forma efectiva.',
        weight: 3,
        tip: 'Compensación crucial para déficits de memoria post-TCE.',
        timeframe: '4-12 semanas',
        measurability: 'Número de tareas recordadas, efectividad del sistema, independencia'
      }
    ]
  },

  lesion_medular: {
    funcion_pasiva: [
      {
        title: 'Prevención de úlceras por presión',
        level0: 'Mantiene integridad cutánea en zonas de riesgo durante 4 semanas con protocolo de cambios posturales.',
        level1: 'Integridad cutánea durante 8 semanas con adherencia completa al protocolo.',
        level2: 'Integridad cutánea durante 12 semanas con autogestión de prevención.',
        levelMinus1: 'Eritema grado I ocasional que resuelve en 24 horas.',
        levelMinus2: 'Desarrollo de úlceras grado II o mayor.',
        weight: 3,
        tip: 'Prevención crítica en lesión medular para evitar complicaciones graves.',
        timeframe: '4-12 semanas',
        measurability: 'Estado de la piel (escala Braden), adherencia al protocolo, tiempo sin lesiones'
      }
    ],
    funcion_activa: [
      {
        title: 'Transferencia independiente silla-cama',
        level0: 'Realiza transferencia de silla de ruedas a cama de forma independiente y segura en 3 intentos consecutivos.',
        level1: 'Transferencia independiente en diferentes alturas y superficies.',
        level2: 'Transferencia independiente en espacios reducidos y situaciones complejas.',
        levelMinus1: 'Transferencia con supervisión por seguridad.',
        levelMinus2: 'Requiere asistencia física para la transferencia.',
        weight: 3,
        tip: 'Fundamental para independencia básica en lesión medular.',
        timeframe: '4-12 semanas',
        measurability: 'Independencia, seguridad, variedad de situaciones'
      }
    ],
    dolor: [
      {
        title: 'Dolor neuropático controlado',
        level0: 'Dolor neuropático ≤4/10 que permite participación completa en actividades de rehabilitación.',
        level1: 'Dolor ≤3/10 con mínima interferencia en el sueño y actividades.',
        level2: 'Dolor ≤2/10 con calidad de vida normalizada.',
        levelMinus1: 'Dolor ≤6/10 que limita algunas actividades específicas.',
        levelMinus2: 'Dolor >6/10 que impide participación efectiva en rehabilitación.',
        weight: 2,
        tip: 'Dolor neuropático común en lesión medular que afecta calidad de vida.',
        timeframe: '4-12 semanas',
        measurability: 'Intensidad del dolor, interferencia funcional, calidad del sueño'
      }
    ],
    movilidad: [
      {
        title: 'Propulsión en silla de ruedas',
        level0: 'Se desplaza 500 metros en silla de ruedas manual en superficie plana sin fatiga excesiva.',
        level1: 'Desplazamiento de 1000 metros incluyendo pendientes leves.',
        level2: 'Desplazamiento de 2000 metros en terrenos variados con eficiencia.',
        levelMinus1: 'Desplazamiento de 200 metros con descansos.',
        levelMinus2: 'Requiere silla eléctrica o asistencia para desplazamientos.',
        weight: 3,
        tip: 'Movilidad básica esencial para independencia comunitaria.',
        timeframe: '6-16 semanas',
        measurability: 'Distancia recorrida, tipo de terreno, nivel de fatiga'
      }
    ],
    participacion: [
      {
        title: 'Conducción con adaptaciones',
        level0: 'Conduce vehículo adaptado en trayectos urbanos durante 45 minutos de forma segura.',
        level1: 'Conduce en autopistas y trayectos largos (2 horas) con confianza.',
        level2: 'Conduce de forma independiente sin restricciones de ruta o tiempo.',
        levelMinus1: 'Conduce en área controlada durante 20 minutos con instructor.',
        levelMinus2: 'No puede operar los controles adaptados de forma segura.',
        weight: 2,
        tip: 'Crucial para independencia laboral y social.',
        timeframe: '8-20 semanas',
        measurability: 'Tiempo de conducción, complejidad de rutas, evaluación de seguridad'
      }
    ],
    habilidad: [
      {
        title: 'Manejo de catéter vesical',
        level0: 'Realiza autocateterismo vesical limpio de forma independiente y segura 4 veces al día.',
        level1: 'Autocateterismo con técnica perfecta y sin infecciones durante 4 semanas.',
        level2: 'Manejo completo incluyendo resolución de problemas menores.',
        levelMinus1: 'Autocateterismo con supervisión ocasional.',
        levelMinus2: 'Requiere asistencia para el cateterismo.',
        weight: 3,
        tip: 'Habilidad esencial para manejo de vejiga neurógena.',
        timeframe: '2-6 semanas',
        measurability: 'Independencia, técnica, ausencia de infecciones'
      }
    ]
  },

  parkinson: {
    funcion_pasiva: [
      {
        title: 'Reducción de rigidez matutina',
        level0: 'Rigidez matutina se resuelve en menos de 30 minutos tras levantarse con rutina de movilización.',
        level1: 'Rigidez se resuelve en menos de 15 minutos.',
        level2: 'Mínima rigidez matutina que se resuelve en menos de 5 minutos.',
        levelMinus1: 'Rigidez se resuelve en 45 minutos con rutina completa.',
        levelMinus2: 'Rigidez persiste más de 60 minutos limitando actividades matutinas.',
        weight: 2,
        tip: 'Síntoma común en Parkinson que afecta inicio de actividades diarias.',
        timeframe: '2-6 semanas',
        measurability: 'Tiempo de resolución, intensidad de rigidez, actividades afectadas'
      }
    ],
    funcion_activa: [
      {
        title: 'Escritura legible mantenida',
        level0: 'Escribe 3 líneas de texto de forma legible sin micrografía progresiva.',
        level1: 'Escribe párrafo completo (8-10 líneas) manteniendo legibilidad.',
        level2: 'Escribe textos largos sin deterioro de la caligrafía.',
        levelMinus1: 'Escribe 1-2 líneas legibles antes de deterioro.',
        levelMinus2: 'Escritura ilegible desde el inicio.',
        weight: 2,
        tip: 'La micrografía es síntoma característico que afecta comunicación escrita.',
        timeframe: '4-8 semanas',
        measurability: 'Número de líneas legibles, progresión de micrografía, velocidad'
      }
    ],
    dolor: [
      {
        title: 'Dolor musculoesquelético secundario',
        level0: 'Dolor relacionado con rigidez y posturas anómalas ≤4/10 durante actividades diarias.',
        level1: 'Dolor ≤3/10 con participación completa en actividades.',
        level2: 'Dolor ≤2/10 o ausente con mejora postural.',
        levelMinus1: 'Dolor ≤6/10 que requiere modificaciones en actividades.',
        levelMinus2: 'Dolor >6/10 que limita significativamente la movilidad.',
        weight: 2,
        tip: 'Dolor secundario a rigidez y posturas compensatorias.',
        timeframe: '3-8 semanas',
        measurability: 'Intensidad del dolor, actividades afectadas, postura'
      }
    ],
    movilidad: [
      {
        title: 'Marcha con patrón regular',
        level0: 'Camina 200 metros con patrón de marcha regular, sin episodios de congelación (freezing).',
        level1: 'Camina 500 metros con patrón fluido y velocidad normal.',
        level2: 'Camina distancias largas (1km) sin alteraciones del patrón.',
        levelMinus1: 'Camina 100 metros con 1-2 episodios leves de congelación.',
        levelMinus2: 'Episodios frecuentes de congelación que impiden marcha funcional.',
        weight: 3,
        tip: 'El freezing es síntoma incapacitante en Parkinson avanzado.',
        timeframe: '4-12 semanas',
        measurability: 'Distancia, episodios de congelación, velocidad de marcha'
      }
    ],
    participacion: [
      {
        title: 'Comunicación verbal efectiva',
        level0: 'Mantiene conversaciones de 10 minutos con volumen e inteligibilidad adecuados.',
        level1: 'Conversaciones de 20 minutos sin fatiga vocal significativa.',
        level2: 'Comunicación verbal normal en todas las situaciones sociales.',
        levelMinus1: 'Conversaciones de 5 minutos requiriendo repeticiones ocasionales.',
        levelMinus2: 'Comunicación verbal muy limitada por hipofonía severa.',
        weight: 2,
        tip: 'La hipofonía afecta significativamente la comunicación social.',
        timeframe: '6-12 semanas',
        measurability: 'Duración de conversación, inteligibilidad, volumen vocal'
      }
    ],
    habilidad: [
      {
        title: 'Destreza manual fina',
        level0: 'Abotona 5 botones de camisa en menos de 2 minutos sin temblor incapacitante.',
        level1: 'Abotona camisa completa (8 botones) en menos de 3 minutos.',
        level2: 'Realiza tareas finas (coser, escribir) sin limitación por temblor.',
        levelMinus1: 'Abotona 3 botones con esfuerzo considerable en 3 minutos.',
        levelMinus2: 'No puede realizar tareas de motricidad fina por temblor severo.',
        weight: 2,
        tip: 'El temblor de reposo afecta actividades de vida diaria.',
        timeframe: '4-8 semanas',
        measurability: 'Número de botones, tiempo empleado, calidad del movimiento'
      }
    ]
  },

  esclerosis_multiple: {
    funcion_pasiva: [
      {
        title: 'Tolerancia al calor',
        level0: 'Tolera temperaturas ambientales hasta 25°C durante 30 minutos sin empeoramiento de síntomas.',
        level1: 'Tolera hasta 27°C durante 45 minutos.',
        level2: 'Tolera temperaturas normales (hasta 30°C) sin limitaciones.',
        levelMinus1: 'Tolera hasta 23°C durante 15 minutos.',
        levelMinus2: 'Síntomas se exacerban con temperaturas superiores a 20°C.',
        weight: 2,
        tip: 'El fenómeno de Uhthoff es común en esclerosis múltiple.',
        timeframe: '4-8 semanas',
        measurability: 'Temperatura tolerada, duración, síntomas reportados'
      }
    ],
    funcion_activa: [
      {
        title: 'Coordinación óculo-manual',
        level0: 'Completa prueba de coordinación (tocar nariz-dedo del examinador) 10 veces sin dismetría significativa.',
        level1: 'Coordinación precisa en 15 repeticiones con velocidad normal.',
        level2: 'Coordinación perfecta en tareas complejas de velocidad variable.',
        levelMinus1: 'Completa 5 repeticiones con dismetría leve.',
        levelMinus2: 'Dismetría severa que impide completar la tarea.',
        weight: 2,
        tip: 'La ataxia cerebelosa es síntoma común en EM.',
        timeframe: '3-8 semanas',
        measurability: 'Número de repeticiones precisas, velocidad, grado de dismetría'
      }
    ],
    dolor: [
      {
        title: 'Dolor neuropático trigeminal',
        level0: 'Dolor facial neuropático ≤3/10 que no interfiere con alimentación o habla.',
        level1: 'Dolor ≤2/10 con mínima interferencia en actividades.',
        level2: 'Ausencia de dolor o episodios muy esporádicos.',
        levelMinus1: 'Dolor ≤5/10 que requiere modificaciones en alimentación.',
        levelMinus2: 'Dolor >5/10 que impide alimentación normal o habla.',
        weight: 2,
        tip: 'Neuralgia del trigémino puede ser síntoma de EM.',
        timeframe: '2-6 semanas',
        measurability: 'Intensidad del dolor, interferencia funcional, frecuencia'
      }
    ],
    movilidad: [
      {
        title: 'Marcha con fatiga controlada',
        level0: 'Camina 400 metros sin fatiga incapacitante que requiera descanso prolongado.',
        level1: 'Camina 800 metros con fatiga leve manejable.',
        level2: 'Camina 1200 metros sin fatiga significativa.',
        levelMinus1: 'Camina 200 metros antes de requerir descanso.',
        levelMinus2: 'Fatiga severa que limita la marcha a menos de 100 metros.',
        weight: 3,
        tip: 'La fatiga es síntoma muy limitante en EM.',
        timeframe: '4-12 semanas',
        measurability: 'Distancia antes de fatiga, tiempo de recuperación, escalas de fatiga'
      }
    ],
    participacion: [
      {
        title: 'Manejo de síntomas cognitivos',
        level0: 'Utiliza estrategias compensatorias para mantener rendimiento laboral/académico al 80% del nivel previo.',
        level1: 'Rendimiento al 90% del nivel previo con adaptaciones mínimas.',
        level2: 'Rendimiento normal sin necesidad de adaptaciones.',
        levelMinus1: 'Rendimiento al 60% requiriendo adaptaciones significativas.',
        levelMinus2: 'Deterioro cognitivo que impide actividades laborales/académicas.',
        weight: 3,
        tip: 'Los síntomas cognitivos afectan significativamente la participación social.',
        timeframe: '6-16 semanas',
        measurability: 'Porcentaje de rendimiento, adaptaciones necesarias, evaluación cognitiva'
      }
    ],
    habilidad: [
      {
        title: 'Manejo de medicación compleja',
        level0: 'Administra medicación según prescripción (incluyendo inyectables) con 95% de adherencia.',
        level1: 'Adherencia del 100% con autogestión completa.',
        level2: 'Autogestión incluyendo ajustes menores y manejo de efectos secundarios.',
        levelMinus1: 'Adherencia del 80% con recordatorios externos.',
        levelMinus2: 'Requiere supervisión constante para medicación.',
        weight: 3,
        tip: 'Los tratamientos de EM suelen ser complejos y requieren adherencia estricta.',
        timeframe: '2-8 semanas',
        measurability: 'Porcentaje de adherencia, independencia en administración, manejo de efectos'
      }
    ]
  },

  artritis: {
    funcion_pasiva: [
      {
        title: 'Rigidez matutina reducida',
        level0: 'Rigidez matutina se resuelve en menos de 45 minutos con rutina de movilización suave.',
        level1: 'Rigidez se resuelve en menos de 30 minutos.',
        level2: 'Rigidez mínima que se resuelve en menos de 15 minutos.',
        levelMinus1: 'Rigidez se resuelve en 60 minutos con rutina completa.',
        levelMinus2: 'Rigidez persiste más de 90 minutos limitando actividades matutinas.',
        weight: 2,
        tip: 'La rigidez matutina es indicador de actividad inflamatoria.',
        timeframe: '2-6 semanas',
        measurability: 'Duración de rigidez, actividades afectadas, intensidad'
      }
    ],
    funcion_activa: [
      {
        title: 'Apertura de recipientes',
        level0: 'Abre 5 tipos diferentes de recipientes (frascos, latas, botellas) sin ayudas técnicas.',
        level1: 'Abre recipientes variados incluyendo los de cierre hermético.',
        level2: 'Abre cualquier tipo de recipiente sin limitaciones.',
        levelMinus1: 'Abre recipientes sencillos, requiere ayuda para los herméticos.',
        levelMinus2: 'Requiere ayudas técnicas o asistencia para todos los recipientes.',
        weight: 2,
        tip: 'Actividad funcional importante que se ve afectada por artritis en manos.',
        timeframe: '3-8 semanas',
        measurability: 'Tipos de recipientes abiertos, necesidad de ayudas, dolor asociado'
      }
    ],
    dolor: [
      {
        title: 'Dolor articular controlado',
        level0: 'Dolor articular ≤4/10 durante actividades de vida diaria sin limitación funcional significativa.',
        level1: 'Dolor ≤3/10 con participación completa en todas las actividades.',
        level2: 'Dolor ≤2/10 o ausente con actividad normal.',
        levelMinus1: 'Dolor ≤6/10 que requiere modificaciones en algunas actividades.',
        levelMinus2: 'Dolor >6/10 que limita significativamente las actividades diarias.',
        weight: 3,
        tip: 'El control del dolor es fundamental para mantener función articular.',
        timeframe: '2-8 semanas',
        measurability: 'Intensidad del dolor, actividades limitadas, uso de analgésicos'
      }
    ],
    movilidad: [
      {
        title: 'Subir escaleras sin limitación',
        level0: 'Sube 2 tramos de escaleras (20 escalones) sin dolor articular significativo ni fatiga excesiva.',
        level1: 'Sube 3 tramos con mínimas molestias.',
        level2: 'Sube escaleras sin limitaciones ni molestias.',
        levelMinus1: 'Sube 1 tramo con molestias tolerables.',
        levelMinus2: 'Evita escaleras por dolor o limitación articular.',
        weight: 2,
        tip: 'Actividad que pone a prueba articulaciones de carga.',
        timeframe: '4-10 semanas',
        measurability: 'Número de escalones, dolor asociado, uso de barandilla'
      }
    ],
    participacion: [
      {
        title: 'Actividades domésticas completas',
        level0: 'Realiza tareas domésticas básicas (cocinar, limpiar, lavar) durante 2 horas con descansos programados.',
        level1: 'Realiza tareas domésticas durante 3 horas con mínimos descansos.',
        level2: 'Realiza todas las tareas domésticas sin limitaciones temporales.',
        levelMinus1: 'Realiza tareas básicas durante 1 hora con descansos frecuentes.',
        levelMinus2: 'Requiere asistencia para la mayoría de tareas domésticas.',
        weight: 2,
        tip: 'Las tareas domésticas evalúan función articular global.',
        timeframe: '4-12 semanas',
        measurability: 'Duración de actividad, tipos de tareas, necesidad de descansos'
      }
    ],
    habilidad: [
      {
        title: 'Manejo de medicación antiinflamatoria',
        level0: 'Autogestiona medicación antiinflamatoria con adherencia >90% y monitoreo de efectos secundarios.',
        level1: 'Adherencia del 100% con autoajustes apropiados según síntomas.',
        level2: 'Manejo experto incluyendo interacciones y optimización de dosis.',
        levelMinus1: 'Adherencia del 70% con recordatorios y supervisión ocasional.',
        levelMinus2: 'Requiere supervisión constante para manejo de medicación.',
        weight: 2,
        tip: 'El manejo adecuado de medicación es crucial en artritis inflamatoria.',
        timeframe: '2-6 semanas',
        measurability: 'Adherencia, conocimiento de efectos secundarios, autogestión'
      }
    ]
  },

  amputacion: {
    funcion_pasiva: [
      {
        title: 'Tolerancia a prótesis',
        level0: 'Usa prótesis durante 4 horas continuas sin dolor, irritación o edema significativo.',
        level1: 'Usa prótesis durante 6 horas con comodidad.',
        level2: 'Usa prótesis durante 8-10 horas (jornada completa) sin molestias.',
        levelMinus1: 'Usa prótesis durante 2 horas con molestias menores.',
        levelMinus2: 'No tolera prótesis más de 1 hora por dolor o irritación.',
        weight: 3,
        tip: 'La tolerancia protésica es fundamental para rehabilitación funcional.',
        timeframe: '2-8 semanas',
        measurability: 'Tiempo de uso, dolor/irritación, estado de la piel'
      }
    ],
    funcion_activa: [
      {
        title: 'Control protésico básico',
        level0: 'Controla apertura/cierre de prótesis de mano o flexión/extensión de rodilla protésica en 8 de 10 intentos.',
        level1: 'Control preciso en 9 de 10 intentos con velocidad adecuada.',
        level2: 'Control automático y fluido en todas las situaciones.',
        levelMinus1: 'Control básico en 6 de 10 intentos con concentración.',
        levelMinus2: 'Control inconsistente o ausente de la prótesis.',
        weight: 3,
        tip: 'El control protésico determina la funcionalidad del dispositivo.',
        timeframe: '4-12 semanas',
        measurability: 'Precisión del control, velocidad, consistencia'
      }
    ],
    dolor: [
      {
        title: 'Dolor de muñón controlado',
        level0: 'Dolor del muñón ≤3/10 que no interfiere con uso de prótesis ni actividades diarias.',
        level1: 'Dolor ≤2/10 con comodidad durante todas las actividades.',
        level2: 'Ausencia de dolor o molestias mínimas esporádicas.',
        levelMinus1: 'Dolor ≤5/10 que requiere analgesia ocasional.',
        levelMinus2: 'Dolor >5/10 que impide uso de prótesis.',
        weight: 2,
        tip: 'El dolor de muñón puede limitar significativamente la rehabilitación.',
        timeframe: '2-8 semanas',
        measurability: 'Intensidad del dolor, interferencia funcional, uso de analgésicos'
      }
    ],
    movilidad: [
      {
        title: 'Marcha protésica funcional',
        level0: 'Camina 200 metros con prótesis, patrón de marcha estable y velocidad ≥0.8 m/s.',
        level1: 'Camina 500 metros con patrón fluido y velocidad normal.',
        level2: 'Camina distancias largas sin limitaciones de velocidad o terreno.',
        levelMinus1: 'Camina 100 metros con patrón compensatorio pero funcional.',
        levelMinus2: 'Marcha muy limitada o requiere ayudas técnicas adicionales.',
        weight: 3,
        tip: 'La marcha protésica es el objetivo principal en amputación de MMII.',
        timeframe: '6-16 semanas',
        measurability: 'Distancia, velocidad, calidad del patrón, terreno'
      }
    ],
    participacion: [
      {
        title: 'Actividades laborales adaptadas',
        level0: 'Realiza tareas laborales principales con adaptaciones protésicas durante 4 horas productivas.',
        level1: 'Jornada laboral de 6 horas con productividad al 80% del nivel previo.',
        level2: 'Jornada completa con productividad normal y mínimas adaptaciones.',
        levelMinus1: 'Realiza tareas laborales básicas durante 2 horas con supervisión.',
        levelMinus2: 'No puede realizar tareas laborales significativas.',
        weight: 2,
        tip: 'La reintegración laboral es objetivo importante en amputación.',
        timeframe: '8-20 semanas',
        measurability: 'Horas productivas, tipos de tareas, nivel de productividad'
      }
    ],
    habilidad: [
      {
        title: 'Cuidado y mantenimiento protésico',
        level0: 'Realiza limpieza diaria, inspección y mantenimiento básico de prótesis de forma independiente.',
        level1: 'Mantenimiento completo incluyendo ajustes menores y detección de problemas.',
        level2: 'Cuidado experto con resolución independiente de problemas comunes.',
        levelMinus1: 'Cuidado básico con supervisión semanal.',
        levelMinus2: 'Requiere asistencia para cuidado y mantenimiento protésico.',
        weight: 2,
        tip: 'El cuidado protésico adecuado asegura durabilidad y función.',
        timeframe: '2-6 semanas',
        measurability: 'Independencia en cuidado, conocimiento técnico, resolución de problemas'
      }
    ]
  },

  pediatrico: {
    funcion_pasiva: [
      {
        title: 'Tolerancia a posicionamiento terapéutico',
        level0: 'Tolera dispositivos de posicionamiento (férulas, cuñas) durante 2 horas sin llanto persistente.',
        level1: 'Tolera posicionamiento durante 3 horas con comodidad.',
        level2: 'Acepta y coopera activamente con el posicionamiento.',
        levelMinus1: 'Tolera posicionamiento durante 1 hora con distracción.',
        levelMinus2: 'Rechaza posicionamiento causando estrés significativo.',
        weight: 2,
        tip: 'En pediatría la cooperación y tolerancia son fundamentales.',
        timeframe: '1-4 semanas',
        measurability: 'Tiempo de tolerancia, nivel de cooperación, signos de estrés'
      }
    ],
    funcion_activa: [
      {
        title: 'Hitos motores apropiados para edad',
        level0: 'Alcanza hito motor específico apropiado para edad cronológica o edad corregida.',
        level1: 'Alcanza hito con 1 mes de adelanto respecto a expectativa.',
        level2: 'Alcanza múltiples hitos con desarrollo motor acelerado.',
        levelMinus1: 'Progresa hacia hito con 1-2 meses de retraso aceptable.',
        levelMinus2: 'Retraso significativo >3 meses en hitos motores.',
        weight: 3,
        tip: 'Los hitos motores deben adaptarse a edad cronológica vs corregida.',
        timeframe: '4-12 semanas',
        measurability: 'Hitos específicos logrados, tiempo de logro, calidad del movimiento'
      }
    ],
    dolor: [
      {
        title: 'Manejo del dolor en procedimientos',
        level0: 'Tolera procedimientos de fisioterapia con técnicas de distracción, llanto <50% del tiempo.',
        level1: 'Tolera procedimientos con mínimo llanto <25% del tiempo.',
        level2: 'Coopera activamente en procedimientos sin signos de dolor.',
        levelMinus1: 'Tolera procedimientos con llanto >75% pero permite completarlos.',
        levelMinus2: 'Rechazo completo de procedimientos por dolor/miedo.',
        weight: 2,
        tip: 'En pediatría el dolor se evalúa por comportamiento y escalas específicas.',
        timeframe: '2-6 semanas',
        measurability: 'Escalas de dolor pediátricas, comportamiento, cooperación'
      }
    ],
    movilidad: [
      {
        title: 'Desplazamiento independiente apropiado',
        level0: 'Se desplaza 50 metros de forma independiente usando método apropiado para su condición (marcha, silla, gateo).',
        level1: 'Desplazamiento de 100 metros con confianza y seguridad.',
        level2: 'Desplazamiento libre sin limitaciones de distancia en espacios seguros.',
        levelMinus1: 'Desplazamiento de 25 metros con supervisión cercana.',
        levelMinus2: 'Requiere asistencia constante para cualquier desplazamiento.',
        weight: 3,
        tip: 'El método de desplazamiento debe adaptarse a capacidades individuales.',
        timeframe: '4-16 semanas',
        measurability: 'Distancia, independencia, método de desplazamiento, seguridad'
      }
    ],
    participacion: [
      {
        title: 'Participación en juego adaptado',
        level0: 'Participa en actividades de juego adaptadas durante 20 minutos con atención sostenida.',
        level1: 'Juego durante 30 minutos con interacción social apropiada.',
        level2: 'Juego espontáneo y creativo durante 45 minutos.',
        levelMinus1: 'Juego durante 10 minutos con redirección frecuente.',
        levelMinus2: 'Participación mínima en actividades de juego.',
        weight: 2,
        tip: 'El juego es el medio principal de aprendizaje y desarrollo en pediatría.',
        timeframe: '2-8 semanas',
        measurability: 'Duración del juego, calidad de interacción, tipos de juego'
      }
    ],
    habilidad: [
      {
        title: 'Uso de tecnología de asistencia',
        level0: 'Utiliza dispositivo de comunicación aumentativa o ayuda técnica durante 30 minutos productivos.',
        level1: 'Uso durante 60 minutos con propósito comunicativo claro.',
        level2: 'Uso espontáneo y creativo del dispositivo en múltiples contextos.',
        levelMinus1: 'Uso durante 15 minutos con asistencia constante.',
        levelMinus2: 'Rechazo o uso mínimo del dispositivo.',
        weight: 2,
        tip: 'La tecnología de asistencia debe introducirse gradualmente y ser motivante.',
        timeframe: '4-12 semanas',
        measurability: 'Tiempo de uso, propósito comunicativo, independencia'
      }
    ]
  },

  geriatrico: {
    funcion_pasiva: [
      {
        title: 'Prevención de síndrome de inmovilización',
        level0: 'Mantiene rangos articulares pasivos completos en todas las articulaciones durante 4 semanas.',
        level1: 'Mantiene rangos durante 8 semanas con programa de movilización.',
        level2: 'Rangos articulares normales con movilización independiente.',
        levelMinus1: 'Pérdida <10° en rangos articulares principales.',
        levelMinus2: 'Desarrollo de contracturas >10° que limitan función.',
        weight: 3,
        tip: 'La inmovilización en geriatría puede llevar rápidamente a pérdida funcional.',
        timeframe: '2-8 semanas',
        measurability: 'Rangos articulares, desarrollo de contracturas, función preservada'
      }
    ],
    funcion_activa: [
      {
        title: 'Fuerza funcional para transferencias',
        level0: 'Realiza transferencias silla-cama con asistencia mínima, sin pérdida de fuerza durante 4 semanas.',
        level1: 'Transferencias con supervisión únicamente.',
        level2: 'Transferencias completamente independientes.',
        levelMinus1: 'Transferencias con asistencia moderada pero participación activa.',
        levelMinus2: 'Requiere asistencia máxima o dispositivos mecánicos.',
        weight: 3,
        tip: 'La fuerza funcional es crucial para mantener independencia en geriatría.',
        timeframe: '3-8 semanas',
        measurability: 'Nivel de asistencia, fuerza muscular, seguridad'
      }
    ],
    dolor: [
      {
        title: 'Dolor crónico manejable',
        level0: 'Dolor crónico ≤5/10 que permite participación en actividades de rehabilitación y sociales.',
        level1: 'Dolor ≤4/10 con mínima interferencia en actividades preferidas.',
        level2: 'Dolor ≤3/10 con calidad de vida satisfactoria.',
        levelMinus1: 'Dolor ≤7/10 que requiere modificaciones significativas en actividades.',
        levelMinus2: 'Dolor >7/10 que impide participación en rehabilitación.',
        weight: 2,
        tip: 'En geriatría el objetivo es manejo más que eliminación completa del dolor.',
        timeframe: '2-8 semanas',
        measurability: 'Intensidad del dolor, interferencia funcional, calidad de vida'
      }
    ],
    movilidad: [
      {
        title: 'Prevención de caídas',
        level0: 'Camina en espacios familiares sin caídas durante 4 semanas, usando ayudas técnicas apropiadas.',
        level1: 'Sin caídas durante 8 semanas con confianza en la marcha.',
        level2: 'Sin caídas durante 12 semanas con actividades variadas.',
        levelMinus1: 'Una caída sin lesiones con aprendizaje de estrategias preventivas.',
        levelMinus2: 'Múltiples caídas o caída con lesión.',
        weight: 3,
        tip: 'La prevención de caídas es prioritaria en geriatría por las consecuencias.',
        timeframe: '4-12 semanas',
        measurability: 'Número de caídas, uso de ayudas técnicas, confianza en movilidad'
      }
    ],
    participacion: [
      {
        title: 'Mantenimiento de roles sociales',
        level0: 'Participa en 2 actividades sociales significativas por semana (familia, comunidad, aficiones).',
        level1: 'Participación en 3-4 actividades sociales semanales.',
        level2: 'Participación social plena similar a nivel previo.',
        levelMinus1: 'Participación en 1 actividad social semanal.',
        levelMinus2: 'Aislamiento social significativo, sin actividades regulares.',
        weight: 2,
        tip: 'El mantenimiento de roles sociales es crucial para bienestar en geriatría.',
        timeframe: '4-12 semanas',
        measurability: 'Número de actividades, calidad de participación, satisfacción social'
      }
    ],
    habilidad: [
      {
        title: 'Manejo de polifarmacia',
        level0: 'Administra correctamente 5+ medicamentos según prescripción con adherencia >90%.',
        level1: 'Adherencia del 95% con autogestión completa.',
        level2: 'Manejo experto incluyendo reconocimiento de efectos secundarios.',
        levelMinus1: 'Adherencia del 80% con sistema de recordatorios.',
        levelMinus2: 'Requiere supervisión diaria para medicación.',
        weight: 2,
        tip: 'La polifarmacia es común en geriatría y requiere manejo cuidadoso.',
        timeframe: '2-6 semanas',
        measurability: 'Adherencia medicamentosa, independencia, conocimiento de efectos'
      }
    ]
  }
};

// Función para obtener sugerencias filtradas
export const getGASSuggestions = (
  pathology: PathologyType = 'general',
  category?: GASCategory,
  searchTerm?: string
): GASGoalSuggestion[] => {
  let suggestions: GASGoalSuggestion[] = [];
  
  if (category) {
    suggestions = GAS_SUGGESTIONS[pathology]?.[category] || [];
  } else {
    // Obtener todas las sugerencias de la patología
    Object.values(GAS_SUGGESTIONS[pathology] || {}).forEach(categorySuggestions => {
      suggestions.push(...categorySuggestions);
    });
  }
  
  // Filtrar por término de búsqueda si se proporciona
  if (searchTerm && searchTerm.length > 2) {
    const term = searchTerm.toLowerCase();
    suggestions = suggestions.filter(suggestion =>
      suggestion.title.toLowerCase().includes(term) ||
      suggestion.level0.toLowerCase().includes(term) ||
      suggestion.tip?.toLowerCase().includes(term)
    );
  }
  
  return suggestions;
};

// Función para obtener sugerencias por múltiples patologías
export const getGASSuggestionsMultiPathology = (
  pathologies: PathologyType[],
  category?: GASCategory,
  limit?: number
): GASGoalSuggestion[] => {
  let allSuggestions: GASGoalSuggestion[] = [];
  
  pathologies.forEach(pathology => {
    const suggestions = getGASSuggestions(pathology, category);
    allSuggestions.push(...suggestions);
  });
  
  // Eliminar duplicados basados en el título
  const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.title === suggestion.title)
  );
  
  // Limitar resultados si se especifica
  return limit ? uniqueSuggestions.slice(0, limit) : uniqueSuggestions;
};
