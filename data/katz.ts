// data/katz.ts
// Índice de Katz de Independencia en Actividades de la Vida Diaria

export interface KatzQuestion {
  id: string;
  question: string;
  description: string;
  category: string;
  options: {
    value: number;
    label: string;
    description: string;
  }[];
}

export const katzCategories = {
  bathing: 'Baño',
  dressing: 'Vestirse',
  toileting: 'Uso del inodoro',
  transferring: 'Movilidad/Transferencia',
  continence: 'Continencia',
  feeding: 'Alimentación',
};

export const questions: KatzQuestion[] = [
  {
    id: 'bathing',
    question: 'Baño',
    description: 'Capacidad para bañarse completamente',
    category: 'Autocuidado',
    options: [
      {
        value: 1,
        label: 'Independiente',
        description: 'Se baña completamente sin ayuda (tina, ducha o esponja)',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita ayuda para bañar más de una parte del cuerpo, entrar o salir de la tina, o no se baña solo',
      },
    ],
  },
  {
    id: 'dressing',
    question: 'Vestirse',
    description: 'Capacidad para vestirse y desvestirse',
    category: 'Autocuidado',
    options: [
      {
        value: 1,
        label: 'Independiente',
        description: 'Toma la ropa y se viste completamente sin ayuda (incluyendo abrochar botones, cremalleras, etc.)',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'No se viste solo o permanece parcialmente vestido',
      },
    ],
  },
  {
    id: 'toileting',
    question: 'Uso del inodoro',
    description: 'Capacidad para usar el inodoro',
    category: 'Autocuidado',
    options: [
      {
        value: 1,
        label: 'Independiente',
        description: 'Va al inodoro, se limpia y se arregla la ropa sin ayuda (puede usar bastón, andador o silla de ruedas y puede usar orinal de noche, vaciándolo por la mañana)',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'No va solo al inodoro para orinar o defecar',
      },
    ],
  },
  {
    id: 'transferring',
    question: 'Movilidad / Transferencia',
    description: 'Capacidad para moverse dentro y fuera de la cama o silla',
    category: 'Movilidad',
    options: [
      {
        value: 1,
        label: 'Independiente',
        description: 'Se acuesta y se levanta de la cama o silla sin ayuda (puede usar un objeto de soporte como bastón o andador)',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita ayuda para acostarse o levantarse de la cama o silla; no realiza uno o más traslados',
      },
    ],
  },
  {
    id: 'continence',
    question: 'Continencia',
    description: 'Control de esfínteres',
    category: 'Control corporal',
    options: [
      {
        value: 1,
        label: 'Continente',
        description: 'Control completo de micción y defecación',
      },
      {
        value: 0,
        label: 'Incontinente',
        description: 'Incontinencia parcial o total de micción o defecación; control parcial o total por enemas, catéteres o uso regulado de orinales',
      },
    ],
  },
  {
    id: 'feeding',
    question: 'Alimentación',
    description: 'Capacidad para alimentarse',
    category: 'Autocuidado',
    options: [
      {
        value: 1,
        label: 'Independiente',
        description: 'Lleva la comida del plato (o su equivalente) a la boca (se excluye la preparación de alimentos o cortar la carne)',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita ayuda para llevar la comida del plato a la boca o no come solo',
      },
    ],
  },
];

export const scoreInterpretation = [
  {
    score: 6,
    level: 'A',
    description: 'Independiente en todas las funciones',
    interpretation: 'Independiente en alimentación, continencia, transferencia, uso del inodoro, vestirse y bañarse',
    color: '#10B981',
  },
  {
    score: 5,
    level: 'B',
    description: 'Independiente en todas menos una función',
    interpretation: 'Independiente en todas excepto una de las funciones',
    color: '#34D399',
  },
  {
    score: 4,
    level: 'C',
    description: 'Independiente en todas menos baño y una función adicional',
    interpretation: 'Independiente en todas excepto bañarse y una función adicional',
    color: '#84CC16',
  },
  {
    score: 3,
    level: 'D',
    description: 'Independiente en todas menos baño, vestirse y una función adicional',
    interpretation: 'Independiente en todas excepto bañarse, vestirse y una función adicional',
    color: '#FBBF24',
  },
  {
    score: 2,
    level: 'E',
    description: 'Dependiente en baño, vestirse, uso del inodoro y una función adicional',
    interpretation: 'Dependiente en bañarse, vestirse, ir al inodoro y una función adicional',
    color: '#F97316',
  },
  {
    score: 1,
    level: 'F',
    description: 'Dependiente en baño, vestirse, uso del inodoro, transferencia y una función adicional',
    interpretation: 'Dependiente en bañarse, vestirse, ir al inodoro, moverse y una función adicional',
    color: '#EF4444',
  },
  {
    score: 0,
    level: 'G',
    description: 'Dependiente en las seis funciones',
    interpretation: 'Dependiente en todas las funciones (alimentación, continencia, transferencia, uso del inodoro, vestirse y bañarse)',
    color: '#DC2626',
  },
];

export const katzScale = {
  id: 'katz',
  name: 'Índice de Katz de Independencia en AVD',
  acronym: 'Katz',
  shortName: 'Katz Index',
  description: 'Evaluación de la independencia funcional en actividades básicas de la vida diaria.',
  category: 'ADL',
  specialty: 'Geriatría',
  bodySystem: 'Funcional',
  timeToComplete: '5-10 min',
  version: '1.0',
  questions,
  scoreInterpretation,
  scoring: {
    method: 'sum',
    min: 0,
    max: 6,
    unit: 'puntos',
  },
  tags: ['katz', 'AVD', 'ABVD', 'independencia', 'funcional', 'geriatría', 'adulto mayor', 'autocuidado'],
  imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center',
  information: `
# Índice de Katz de Independencia en Actividades de la Vida Diaria

## Descripción
El Índice de Katz es una de las escalas más antiguas y ampliamente utilizadas para evaluar la capacidad funcional en actividades básicas de la vida diaria (AVD). Fue desarrollado en 1963 por Sidney Katz y sus colaboradores.

## Objetivo
Evaluar la independencia funcional en seis actividades básicas esenciales para el autocuidado: bañarse, vestirse, usar el inodoro, trasladarse, continencia y alimentación.

## Características
- **6 categorías** de actividades básicas de la vida diaria
- **Sistema binario**: Independiente (1) o Dependiente (0)
- **Puntuación total**: 0-6 puntos
- **Clasificación alfabética**: A (totalmente independiente) a G (totalmente dependiente)

## Instrucciones de Aplicación
1. Evalúe cada actividad de forma independiente
2. Considere el desempeño habitual del paciente, no su capacidad potencial
3. "Independiente" significa sin supervisión, dirección o asistencia personal activa
4. El uso de dispositivos de ayuda (bastón, andador) se considera independiente
5. Si hay duda, clasifique como dependiente

## Jerarquía de las AVD según Katz
Las actividades siguen un orden jerárquico de pérdida (de primero a último perdido):
1. Bañarse
2. Vestirse
3. Ir al inodoro
4. Trasladarse
5. Continencia
6. Alimentación

La recuperación típicamente sigue el orden inverso.

## Interpretación

### Clasificación Alfabética
- **Grupo A (6 puntos)**: Independiente en todas las funciones
- **Grupo B (5 puntos)**: Independiente en todas menos una
- **Grupo C (4 puntos)**: Independiente en todas excepto bañarse y otra función
- **Grupo D (3 puntos)**: Independiente en todas excepto bañarse, vestirse y otra función
- **Grupo E (2 puntos)**: Dependiente en bañarse, vestirse, ir al inodoro y otra función
- **Grupo F (1 punto)**: Dependiente en bañarse, vestirse, ir al inodoro, trasladarse y otra función
- **Grupo G (0 puntos)**: Dependiente en las seis funciones

### Interpretación Clínica
- **6 puntos**: Independencia completa - Autocuidado sin asistencia
- **4-5 puntos**: Dependencia leve - Puede vivir en comunidad con apoyo mínimo
- **2-3 puntos**: Dependencia moderada - Requiere asistencia diaria considerable
- **0-1 puntos**: Dependencia severa - Requiere cuidados institucionales o asistencia constante

## Aplicaciones Clínicas
- **Geriatría**: Evaluación funcional de adultos mayores
- **Planificación de cuidados**: Determinación de nivel de asistencia requerida
- **Seguimiento longitudinal**: Monitoreo de cambios funcionales
- **Investigación**: Medida estándar de capacidad funcional
- **Decisiones de institucionalización**: Ayuda a determinar nivel de cuidado apropiado

## Validez y Confiabilidad
- **Confiabilidad inter-evaluador**: 0.95
- **Validez de constructo**: Alta correlación con otras escalas funcionales
- **Sensibilidad al cambio**: Adecuada para detectar cambios clínicamente significativos
- **Ampliamente validado**: En múltiples poblaciones y contextos culturales

## Ventajas
- Rápida aplicación (5-10 minutos)
- Fácil de administrar y puntuar
- No requiere entrenamiento extenso
- Bien establecida y ampliamente reconocida
- Útil para comunicación entre profesionales

## Limitaciones
- Sistema binario (independiente/dependiente) puede no capturar matices
- No evalúa actividades instrumentales de la vida diaria (AIVD)
- Puede tener efecto techo en poblaciones relativamente sanas
- No considera aspectos cognitivos o sociales

## Relación con Otras Escalas
- Más simple que el **Índice de Barthel** (10 ítems con escala de 5 puntos)
- Complementario a escalas de **AIVD** (Lawton y Brody)
- Puede usarse junto con evaluaciones cognitivas (MMSE)

## Población Objetivo
- Adultos mayores en cualquier entorno (domicilio, hospital, residencia)
- Pacientes con enfermedades crónicas
- Personas en proceso de rehabilitación
- Evaluación geriátrica integral

## Referencias
1. Katz S, Ford AB, Moskowitz RW, Jackson BA, Jaffe MW. Studies of illness in the aged. The Index of ADL: A standardized measure of biological and psychosocial function. JAMA. 1963;185:914-919.

2. Katz S, Downs TD, Cash HR, Grotz RC. Progress in development of the index of ADL. Gerontologist. 1970;10(1):20-30.

3. Wallace M, Shelkey M. Katz Index of Independence in Activities of Daily Living (ADL). Try This: Best Practices in Nursing Care to Older Adults. Hartford Institute for Geriatric Nursing. 2007;2.

## Notas Importantes
- Se debe evaluar lo que el paciente **hace habitualmente**, no lo que podría hacer
- La **independencia** incluye el uso de dispositivos de asistencia
- La evaluación debe basarse en observación y/o información confiable del cuidador
- Documentar observaciones específicas que justifiquen la puntuación
  `,
  references: [
    {
      title: 'Studies of illness in the aged. The Index of ADL: A standardized measure of biological and psychosocial function',
      authors: ['Katz S', 'Ford AB', 'Moskowitz RW', 'Jackson BA', 'Jaffe MW'],
      year: 1963
    },
    {
      title: 'Progress in development of the index of ADL',
      authors: ['Katz S', 'Downs TD', 'Cash HR', 'Grotz RC'],
      year: 1970
    }
  ],
  lastUpdated: new Date().toISOString(),
};