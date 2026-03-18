// data/lawton.ts
// Escala de Lawton y Brody - Actividades Instrumentales de la Vida Diaria (AIVD)

export interface LawtonQuestion {
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

export const lawtonCategories = {
  telefono: 'Uso del teléfono',
  compras: 'Hacer compras',
  comida: 'Preparación de la comida',
  casa: 'Cuidado de la casa',
  lavado: 'Lavado de la ropa',
  transporte: 'Uso de medios de transporte',
  medicacion: 'Responsabilidad respecto a la medicación',
  economicos: 'Manejo de asuntos económicos',
};

export const questions: LawtonQuestion[] = [
  {
    id: 'telefono',
    question: 'Capacidad para usar el teléfono',
    description: 'Evaluar la capacidad de usar el teléfono de forma independiente',
    category: 'Comunicación',
    options: [
      {
        value: 1,
        label: 'Utiliza el teléfono por iniciativa propia',
        description: 'Busca y marca números por sí mismo',
      },
      {
        value: 1,
        label: 'Puede marcar algunos números familiares',
        description: 'Marca números conocidos sin ayuda',
      },
      {
        value: 1,
        label: 'Solo puede contestar, pero no marcar',
        description: 'Contesta llamadas pero no puede marcar',
      },
      {
        value: 0,
        label: 'No es capaz de usar el teléfono',
        description: 'Incapaz de usar el teléfono',
      },
    ],
  },
  {
    id: 'compras',
    question: 'Hacer compras',
    description: 'Capacidad para realizar compras de forma independiente',
    category: 'Actividades comunitarias',
    options: [
      {
        value: 1,
        label: 'Realiza todas las compras necesarias independientemente',
        description: 'Puede hacer todas las compras solo',
      },
      {
        value: 0,
        label: 'Realiza pequeñas compras independientemente',
        description: 'Solo puede hacer compras menores',
      },
      {
        value: 0,
        label: 'Necesita compañía para hacer cualquier compra',
        description: 'Requiere acompañamiento para comprar',
      },
      {
        value: 0,
        label: 'Incapaz de comprar',
        description: 'Completamente incapaz de hacer compras',
      },
    ],
  },
  {
    id: 'comida',
    question: 'Preparación de la comida',
    description: 'Capacidad para planificar y preparar comidas adecuadas',
    category: 'Tareas domésticas',
    options: [
      {
        value: 1,
        label: 'Organiza, prepara y sirve adecuadamente',
        description: 'Planifica y prepara comidas completas de forma independiente',
      },
      {
        value: 0,
        label: 'Prepara comidas si se le proporcionan los ingredientes',
        description: 'Puede cocinar si le dan los ingredientes',
      },
      {
        value: 0,
        label: 'Prepara, calienta y sirve comidas, pero no sigue una dieta adecuada',
        description: 'Puede calentar comida pero no planifica nutrición',
      },
      {
        value: 0,
        label: 'Necesita que le preparen y sirvan las comidas',
        description: 'Completamente dependiente para la preparación de comidas',
      },
    ],
  },
  {
    id: 'casa',
    question: 'Cuidado de la casa',
    description: 'Capacidad para mantener el hogar limpio y ordenado',
    category: 'Tareas domésticas',
    options: [
      {
        value: 1,
        label: 'Mantiene la casa solo o con ayuda ocasional',
        description: 'Mantiene limpieza adecuada de forma independiente',
      },
      {
        value: 1,
        label: 'Realiza tareas ligeras como lavar platos o hacer camas',
        description: 'Puede hacer tareas domésticas ligeras',
      },
      {
        value: 0,
        label: 'No puede mantener un nivel adecuado de limpieza',
        description: 'Realiza tareas pero la limpieza es inadecuada',
      },
      {
        value: 0,
        label: 'Necesita ayuda en todas las labores del hogar / No participa',
        description: 'Completamente dependiente para el cuidado del hogar',
      },
    ],
  },
  {
    id: 'lavado',
    question: 'Lavado de la ropa',
    description: 'Capacidad para lavar su propia ropa',
    category: 'Tareas domésticas',
    options: [
      {
        value: 1,
        label: 'Lava toda su ropa',
        description: 'Lava toda su ropa de forma independiente',
      },
      {
        value: 1,
        label: 'Lava pequeñas prendas',
        description: 'Puede lavar ropa ligera (ropa interior, medias)',
      },
      {
        value: 0,
        label: 'Todo el lavado es realizado por otros',
        description: 'Completamente dependiente para el lavado de ropa',
      },
    ],
  },
  {
    id: 'transporte',
    question: 'Uso de medios de transporte',
    description: 'Capacidad para desplazarse utilizando transporte',
    category: 'Movilidad comunitaria',
    options: [
      {
        value: 1,
        label: 'Viaja solo en transporte público o conduce',
        description: 'Usa transporte público o conduce de forma independiente',
      },
      {
        value: 1,
        label: 'Usa taxi, pero no otro transporte',
        description: 'Puede tomar taxi pero no usa transporte público',
      },
      {
        value: 1,
        label: 'Viaja en transporte público acompañado',
        description: 'Puede usar transporte público con acompañante',
      },
      {
        value: 0,
        label: 'Solo usa transporte con ayuda / No viaja',
        description: 'Completamente dependiente o no viaja',
      },
    ],
  },
  {
    id: 'medicacion',
    question: 'Responsabilidad respecto a la medicación',
    description: 'Capacidad para tomar medicación de forma correcta',
    category: 'Cuidado de la salud',
    options: [
      {
        value: 1,
        label: 'Toma la medicación correctamente',
        description: 'Toma la medicación en dosis y horarios correctos',
      },
      {
        value: 0,
        label: 'Toma medicación preparada previamente',
        description: 'Puede tomar medicación si alguien la prepara',
      },
      {
        value: 0,
        label: 'No es capaz de tomar medicación por sí mismo',
        description: 'Completamente dependiente para la medicación',
      },
    ],
  },
  {
    id: 'economicos',
    question: 'Manejo de asuntos económicos',
    description: 'Capacidad para manejar dinero y asuntos financieros',
    category: 'Gestión financiera',
    options: [
      {
        value: 1,
        label: 'Se encarga de sus asuntos económicos',
        description: 'Maneja sus finanzas de forma independiente',
      },
      {
        value: 1,
        label: 'Realiza compras, pero necesita ayuda con asuntos mayores',
        description: 'Puede hacer compras diarias pero necesita ayuda con bancos',
      },
      {
        value: 0,
        label: 'Incapaz de manejar dinero',
        description: 'Completamente dependiente para manejar dinero',
      },
    ],
  },
];

// Interpretaciones detalladas por área específica
export const areaInterpretations: Record<string, { independent: string; dependent: string; intervention: string }> = {
  telefono: {
    independent: 'Puede comunicarse de forma autónoma. Mantiene contacto social activo.',
    dependent: 'Requiere asistencia para comunicación. Riesgo de aislamiento social.',
    intervention: 'Teléfonos adaptados con botones grandes, sistema de llamada de emergencia, entrenamiento en uso de dispositivos.',
  },
  compras: {
    independent: 'Autónomo para adquisición de bienes necesarios. Maneja dinero apropiadamente.',
    dependent: 'Necesita ayuda para obtener alimentos y artículos esenciales.',
    intervention: 'Servicio de compras a domicilio, acompañamiento para compras, listas simplificadas.',
  },
  comida: {
    independent: 'Puede planificar y preparar alimentación adecuada. Nutrición independiente.',
    dependent: 'Riesgo nutricional. Requiere supervisión o preparación de alimentos.',
    intervention: 'Servicio de comidas a domicilio, comidas preparadas, terapia ocupacional en cocina.',
  },
  casa: {
    independent: 'Mantiene entorno limpio y seguro. Vida doméstica organizada.',
    dependent: 'Hogar puede no ser seguro. Riesgo de accidentes domésticos.',
    intervention: 'Servicio de limpieza doméstica, adaptaciones del hogar, apoyo con tareas pesadas.',
  },
  lavado: {
    independent: 'Mantiene higiene personal de ropa. Autocuidado adecuado.',
    dependent: 'Necesita asistencia con higiene de vestimenta.',
    intervention: 'Servicio de lavandería, lavadora adaptada, apoyo familiar programado.',
  },
  transporte: {
    independent: 'Puede desplazarse en la comunidad. Acceso a servicios y socialización.',
    dependent: 'Movilidad limitada. Riesgo de aislamiento y dificultad para citas médicas.',
    intervention: 'Transporte adaptado, taxi para adultos mayores, acompañamiento programado.',
  },
  medicacion: {
    independent: 'Gestiona tratamiento correctamente. Buen apego terapéutico.',
    dependent: 'Riesgo de errores de medicación. Puede comprometer tratamiento.',
    intervention: 'Organizadores de pastillas, alarmas recordatorias, supervisión de enfermería.',
  },
  economicos: {
    independent: 'Maneja finanzas apropiadamente. Independencia económica.',
    dependent: 'Vulnerable a explotación financiera. Necesita protección económica.',
    intervention: 'Tutor financiero, pago automático de cuentas, apoyo familiar en gestiones.',
  },
};

export const scoreInterpretation = [
  {
    min: 8,
    max: 8,
    level: 'Independencia Total',
    description: 'Independiente en todas las actividades instrumentales',
    interpretation: 'El paciente puede vivir de forma completamente independiente en la comunidad. No requiere asistencia para actividades instrumentales de la vida diaria.',
    recommendations: 'Mantener estilo de vida activo y autonomía. Evaluación periódica anual.',
    color: '#10B981',
  },
  {
    min: 5,
    max: 7,
    level: 'Dependencia Leve',
    description: 'Requiere asistencia mínima en 1 a 3 áreas',
    interpretation: 'El paciente presenta limitaciones en pocas actividades instrumentales. Puede vivir en la comunidad con apoyos específicos y seguimiento.',
    recommendations: 'Identificar áreas de dificultad y organizar apoyos focalizados (familiares, servicios comunitarios). Terapia ocupacional puede mejorar desempeño. Evaluación semestral.',
    color: '#84CC16',
  },
  {
    min: 2,
    max: 4,
    level: 'Dependencia Moderada',
    description: 'Necesita ayuda en varias actividades instrumentales',
    interpretation: 'El paciente requiere asistencia en múltiples áreas. La vida independiente requiere soporte estructurado y regular. Seguridad en el hogar es una prioridad.',
    recommendations: 'Plan de cuidados formal necesario. Considerar centro de día o cuidador a tiempo parcial. Evaluación de seguridad en el hogar. Seguimiento trimestral.',
    color: '#FBBF24',
  },
  {
    min: 0,
    max: 1,
    level: 'Dependencia Severa',
    description: 'Dependiente en casi todas o todas las actividades',
    interpretation: 'El paciente requiere asistencia constante en la mayoría de áreas. No puede vivir de forma segura sin cuidador tiempo completo. Alto predictor de institucionalización.',
    recommendations: 'Requiere cuidador permanente o institucionalización. Evaluación geriátrica integral urgente. Considerar residencia asistida o cuidados domiciliarios 24/7. Evaluación mensual.',
    color: '#EF4444',
  },
];

export const lawtonScale = {
  id: 'lawton-brody',
  name: 'Escala de Lawton y Brody',
  acronym: 'Lawton-Brody',
  shortName: 'Lawton & Brody',
  description: 'Evaluación de la independencia funcional en actividades instrumentales de la vida diaria (AIVD) en adultos mayores.',
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
    max: 8,
    unit: 'puntos',
  },
  tags: ['lawton', 'brody', 'AIVD', 'actividades instrumentales', 'AVD instrumentales', 'IADL', 'independencia funcional', 'geriatría', 'adulto mayor'],
  imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=300&fit=crop&crop=center',
  information: `
# Escala de Lawton y Brody - Actividades Instrumentales de la Vida Diaria (AIVD)

## Descripción
La Escala de Lawton y Brody es una herramienta ampliamente utilizada para evaluar la capacidad funcional de los adultos mayores en la realización de Actividades Instrumentales de la Vida Diaria (AIVD). Fue desarrollada en 1969 por M. Powell Lawton y Elaine M. Brody.

## Objetivo
Evaluar la autonomía funcional en actividades más complejas que las actividades básicas de la vida diaria (ABVD), necesarias para vivir de forma independiente en la comunidad.

## Características
- **8 dominios** de actividades instrumentales de la vida diaria
- **Sistema de puntuación**: 0-8 puntos (mayor puntuación = mayor independencia)
- **Tiempo de aplicación**: 5-10 minutos
- **Población**: Adultos mayores viviendo en la comunidad

## Dominios Evaluados

### 1. Capacidad para usar el teléfono
Evalúa la habilidad para utilizar el teléfono de forma independiente, buscar números y realizar llamadas.

### 2. Hacer compras
Capacidad para realizar compras de forma independiente, seleccionar artículos apropiados y manejar dinero.

### 3. Preparación de la comida
Habilidad para planificar, preparar y servir comidas adecuadas de forma independiente.

### 4. Cuidado de la casa
Capacidad para mantener el hogar limpio y ordenado, realizar tareas domésticas ligeras y pesadas.

### 5. Lavado de la ropa
Habilidad para lavar la ropa propia de forma independiente o con mínima asistencia.

### 6. Uso de medios de transporte
Capacidad para desplazarse utilizando transporte público, taxi, o conduciendo.

### 7. Responsabilidad respecto a la medicación
Habilidad para tomar medicación en la dosis correcta y en el horario apropiado.

### 8. Manejo de asuntos económicos
Capacidad para manejar dinero, pagar cuentas, ir al banco y gestionar asuntos financieros.

## Instrucciones de Aplicación

1. **Forma de evaluación**: Puede realizarse mediante:
   - Entrevista directa con el paciente
   - Entrevista con el cuidador principal
   - Observación directa
   - Combinación de las anteriores

2. **Criterios de puntuación**:
   - Evaluar el desempeño **habitual** del paciente, no su capacidad potencial
   - Considerar lo que el paciente **hace**, no lo que podría hacer
   - Si hay duda entre dos opciones, seleccionar la de menor puntuación

3. **Consideraciones especiales**:
   - Algunas actividades pueden ser más relevantes para mujeres (preparación de comida, lavado) debido a roles tradicionales
   - En hombres, considerar participación histórica en estas actividades
   - El contexto cultural y social es importante

## Sistema de Puntuación

### Puntuación Total
- **Rango**: 0-8 puntos
- **Método**: Suma de puntos de las 8 actividades
- Cada actividad puntúa 0 (dependiente) o 1 (independiente)

### Interpretación

#### 8 puntos - Independencia Total
- Autónomo en todas las AIVD
- Puede vivir solo sin asistencia
- Bajo riesgo de institucionalización

#### 1-7 puntos - Dependencia Moderada
- Requiere ayuda en una o más actividades
- Puede vivir en comunidad con apoyo
- El nivel de asistencia varía según áreas afectadas
- Mayor riesgo de deterioro funcional

#### 0 puntos - Máxima Dependencia
- Dependiente en todas las AIVD
- Requiere cuidados constantes
- Alto riesgo de institucionalización

## Diferencia entre ABVD y AIVD

### Actividades Básicas (ABVD) - Katz, Barthel
- Autocuidado fundamental
- Necesarias para supervivencia inmediata
- Ejemplos: comer, bañarse, vestirse

### Actividades Instrumentales (AIVD) - Lawton y Brody
- Funciones más complejas
- Necesarias para vida independiente en comunidad
- Ejemplos: compras, manejo de dinero, uso de transporte

## Aplicaciones Clínicas

### Evaluación Geriátrica Integral
- Componente esencial de evaluación funcional
- Complementa evaluación de ABVD (Katz, Barthel)
- Ayuda a determinar nivel de cuidados necesario

### Planificación de Servicios
- Identificar áreas específicas donde se requiere apoyo
- Planificar intervenciones de terapia ocupacional
- Determinar servicios de apoyo domiciliario necesarios

### Seguimiento Longitudinal
- Detectar cambios en capacidad funcional
- Evaluar efectividad de intervenciones
- Monitorear progresión de enfermedades

### Investigación
- Medida estándar de función instrumental
- Predictor de institucionalización
- Indicador de calidad de vida

## Validez y Confiabilidad

### Propiedades Psicométricas
- **Confiabilidad test-retest**: 0.85-0.96
- **Consistencia interna**: α de Cronbach 0.73-0.85
- **Validez de constructo**: Alta correlación con otras medidas funcionales
- **Sensibilidad al cambio**: Adecuada para detectar cambios clínicamente significativos

### Validaciones
- Validada en múltiples idiomas y culturas
- Ampliamente utilizada en investigación gerontológica
- Estándar de referencia para evaluación de AIVD

## Ventajas

- **Rápida aplicación**: 5-10 minutos
- **Fácil administración**: No requiere equipo especial
- **Bien establecida**: Más de 50 años de uso
- **Ampliamente reconocida**: Estándar internacional
- **Sensible a cambios**: Detecta deterioro temprano
- **Complementaria**: Se usa junto con escalas de ABVD

## Limitaciones

- **Sesgos de género**: Algunas actividades tradicionalmente femeninas
- **Contexto cultural**: Algunas actividades pueden no ser relevantes en todas culturas
- **Dicotómica**: Sistema binario (0/1) puede no capturar matices
- **Subjetividad**: Depende de información del paciente/cuidador
- **No evalúa cognición**: Aunque las AIVD requieren función cognitiva

## Relación con Otras Escalas

### Complementarias
- **Índice de Katz**: ABVD básicas
- **Índice de Barthel**: ABVD con más detalle
- **MMSE/MoCA**: Evaluación cognitiva

### Jerarquía Funcional
1. AIVD (Lawton) - Se pierden primero
2. ABVD (Katz, Barthel) - Se pierden después
3. Funciones básicas - Últimas en perderse

La pérdida típicamente sigue este patrón en deterioro cognitivo y envejecimiento.

## Población Objetivo

### Ideal para:
- Adultos mayores viviendo en comunidad
- Pacientes geriátricos ambulatorios
- Evaluación pre-institucionalización
- Seguimiento de rehabilitación

### Menos apropiada para:
- Pacientes hospitalizados agudos
- Personas institucionalizadas
- Población joven

## Interpretación Clínica Detallada

### Puntuación 8 (Independencia Total)
- **Pronóstico**: Excelente
- **Manejo**: Seguimiento anual, promoción de envejecimiento activo
- **Riesgo de institucionalización**: Muy bajo

### Puntuación 5-7 (Dependencia Leve)
- **Pronóstico**: Bueno con apoyo
- **Manejo**: Servicios de apoyo específicos, terapia ocupacional
- **Riesgo de institucionalización**: Bajo-moderado
- **Puede vivir solo**: Con apoyo parcial

### Puntuación 2-4 (Dependencia Moderada)
- **Pronóstico**: Requiere supervisión
- **Manejo**: Cuidador regular, servicios múltiples, centro de día
- **Riesgo de institucionalización**: Moderado-alto
- **Puede vivir solo**: Difícil sin apoyo sustancial

### Puntuación 0-1 (Dependencia Severa)
- **Pronóstico**: Requiere cuidados extensos
- **Manejo**: Cuidador tiempo completo o institucionalización
- **Riesgo de institucionalización**: Muy alto
- **Puede vivir solo**: No recomendado

## Intervenciones según Resultados

### Para Dependencia en Actividades Específicas

#### Teléfono
- Teléfonos adaptados con botones grandes
- Sistemas de llamada de emergencia
- Entrenamiento en uso de tecnología

#### Compras
- Servicio de compras a domicilio
- Acompañamiento para compras
- Listas de compras simplificadas

#### Preparación de comida
- Servicio de comidas a domicilio
- Comidas congeladas preparadas
- Terapia ocupacional en cocina

#### Cuidado de casa
- Servicio de limpieza doméstica
- Adaptaciones del hogar
- Distribución de tareas

#### Lavado de ropa
- Servicio de lavandería
- Lavadora adaptada
- Apoyo familiar programado

#### Transporte
- Servicios de transporte adaptado
- Taxi para adultos mayores
- Acompañamiento en transporte público

#### Medicación
- Organizadores de pastillas
- Alarmas recordatorias
- Supervisión de enfermería

#### Asuntos económicos
- Tutor financiero
- Pago automático de cuentas
- Apoyo familiar en gestiones

## Notas Importantes para el Evaluador

1. **Objetividad**: Evaluar capacidad real, no teórica
2. **Contexto**: Considerar entorno y recursos disponibles
3. **Género**: Adaptar interpretación según roles históricos
4. **Cultura**: Considerar relevancia cultural de actividades
5. **Seguridad**: Identificar situaciones de riesgo
6. **Documentación**: Registrar observaciones específicas

## Referencias Científicas

1. Lawton MP, Brody EM. Assessment of older people: self-maintaining and instrumental activities of daily living. Gerontologist. 1969;9(3):179-186.

2. Graf C. The Lawton instrumental activities of daily living scale. Am J Nurs. 2008;108(4):52-62.

3. Vergara I, Bilbao A, Orive M, et al. Validation of the Spanish version of the Lawton IADL Scale for its application in elderly people. Health Qual Life Outcomes. 2012;10:130.

## Combinación con Otras Evaluaciones

Se recomienda usar junto con:
- **Escalas de ABVD**: Katz o Barthel
- **Evaluación cognitiva**: MMSE o MoCA
- **Evaluación de movilidad**: Tinetti o Berg
- **Evaluación nutricional**: MNA
- **Evaluación de depresión**: GDS

Esta combinación proporciona una evaluación geriátrica integral completa.
  `,
  references: [
    {
      title: 'Assessment of older people: self-maintaining and instrumental activities of daily living',
      authors: ['Lawton MP', 'Brody EM'],
      year: 1969,
      journal: 'Gerontologist',
      volume: '9',
      issue: '3',
      pages: '179-186',
    },
    {
      title: 'The Lawton instrumental activities of daily living scale',
      authors: ['Graf C'],
      year: 2008,
      journal: 'Am J Nurs',
      volume: '108',
      issue: '4',
      pages: '52-62',
    },
    {
      title: 'Validation of the Spanish version of the Lawton IADL Scale for its application in elderly people',
      authors: ['Vergara I', 'Bilbao A', 'Orive M', 'et al'],
      year: 2012,
      journal: 'Health Qual Life Outcomes',
      volume: '10',
      pages: '130',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

