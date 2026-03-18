export interface SixMWTData {
  // Datos del paciente
  age: number;
  gender: 'male' | 'female';
  height_cm: number;
  weight_kg: number;

  // Signos vitales pre-test
  pre_hr: number; // Frecuencia cardíaca
  pre_bp_systolic: number;
  pre_bp_diastolic: number;
  pre_spo2: number; // Saturación de oxígeno
  pre_dyspnea_borg: number; // Disnea escala Borg 0-10
  pre_fatigue_borg: number; // Fatiga escala Borg 0-10

  // Resultados del test
  distance_meters: number;

  // Signos vitales post-test
  post_hr: number;
  post_bp_systolic: number;
  post_bp_diastolic: number;
  post_spo2: number;
  post_dyspnea_borg: number;
  post_fatigue_borg: number;

  // Paradas durante el test
  stops_count: number;
  total_rest_time_seconds: number;

  // Uso de oxígeno
  oxygen_use: boolean;
  oxygen_flow?: number; // L/min

  // Dispositivo de ayuda
  assistive_device?: 'none' | 'cane' | 'walker' | 'crutches';

  // Observaciones
  observations?: string;
}

export const sixMWTQuestions = [
  {
    id: 'patient_info',
    title: 'Información del Paciente',
    fields: [
      {
        id: 'age',
        label: 'Edad',
        type: 'number',
        unit: 'años',
        required: true,
      },
      {
        id: 'gender',
        label: 'Sexo',
        type: 'select',
        options: [
          { value: 'male', label: 'Masculino' },
          { value: 'female', label: 'Femenino' },
        ],
        required: true,
      },
      {
        id: 'height_cm',
        label: 'Estatura',
        type: 'number',
        unit: 'cm',
        required: true,
      },
      {
        id: 'weight_kg',
        label: 'Peso',
        type: 'number',
        unit: 'kg',
        required: true,
      },
    ],
  },
  {
    id: 'pre_test',
    title: 'Mediciones Pre-Test',
    description: 'Medir después de 10 minutos de reposo',
    fields: [
      {
        id: 'pre_hr',
        label: 'Frecuencia cardíaca',
        type: 'number',
        unit: 'lpm',
        required: true,
      },
      {
        id: 'pre_bp_systolic',
        label: 'Presión arterial sistólica',
        type: 'number',
        unit: 'mmHg',
        required: true,
      },
      {
        id: 'pre_bp_diastolic',
        label: 'Presión arterial diastólica',
        type: 'number',
        unit: 'mmHg',
        required: true,
      },
      {
        id: 'pre_spo2',
        label: 'Saturación de oxígeno',
        type: 'number',
        unit: '%',
        required: true,
      },
      {
        id: 'pre_dyspnea_borg',
        label: 'Disnea (Escala de Borg)',
        type: 'number',
        unit: '0-10',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'pre_fatigue_borg',
        label: 'Fatiga (Escala de Borg)',
        type: 'number',
        unit: '0-10',
        min: 0,
        max: 10,
        required: true,
      },
    ],
  },
  {
    id: 'test_execution',
    title: 'Ejecución del Test',
    description: 'Registrar la distancia recorrida en 6 minutos',
    fields: [
      {
        id: 'distance_meters',
        label: 'Distancia recorrida',
        type: 'number',
        unit: 'metros',
        required: true,
      },
      {
        id: 'stops_count',
        label: 'Número de paradas',
        type: 'number',
        unit: 'paradas',
        required: true,
        default: 0,
      },
      {
        id: 'total_rest_time_seconds',
        label: 'Tiempo total de descanso',
        type: 'number',
        unit: 'segundos',
        required: true,
        default: 0,
      },
      {
        id: 'oxygen_use',
        label: '¿Uso de oxígeno suplementario?',
        type: 'boolean',
        required: true,
        default: false,
      },
      {
        id: 'oxygen_flow',
        label: 'Flujo de oxígeno (si aplica)',
        type: 'number',
        unit: 'L/min',
        required: false,
        conditional: 'oxygen_use',
      },
      {
        id: 'assistive_device',
        label: 'Dispositivo de ayuda',
        type: 'select',
        options: [
          { value: 'none', label: 'Ninguno' },
          { value: 'cane', label: 'Bastón' },
          { value: 'walker', label: 'Andador' },
          { value: 'crutches', label: 'Muletas' },
        ],
        required: true,
        default: 'none',
      },
    ],
  },
  {
    id: 'post_test',
    title: 'Mediciones Post-Test',
    description: 'Medir inmediatamente después de terminar el test',
    fields: [
      {
        id: 'post_hr',
        label: 'Frecuencia cardíaca',
        type: 'number',
        unit: 'lpm',
        required: true,
      },
      {
        id: 'post_bp_systolic',
        label: 'Presión arterial sistólica',
        type: 'number',
        unit: 'mmHg',
        required: true,
      },
      {
        id: 'post_bp_diastolic',
        label: 'Presión arterial diastólica',
        type: 'number',
        unit: 'mmHg',
        required: true,
      },
      {
        id: 'post_spo2',
        label: 'Saturación de oxígeno',
        type: 'number',
        unit: '%',
        required: true,
      },
      {
        id: 'post_dyspnea_borg',
        label: 'Disnea (Escala de Borg)',
        type: 'number',
        unit: '0-10',
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: 'post_fatigue_borg',
        label: 'Fatiga (Escala de Borg)',
        type: 'number',
        unit: '0-10',
        min: 0,
        max: 10,
        required: true,
      },
    ],
  },
  {
    id: 'observations',
    title: 'Observaciones',
    fields: [
      {
        id: 'observations',
        label: 'Observaciones adicionales',
        type: 'textarea',
        required: false,
        placeholder: 'Eventos adversos, limitaciones observadas, comentarios...',
      },
    ],
  },
];

// Fórmulas para calcular distancia predicha
export const calculatePredictedDistance = (
  age: number,
  height_cm: number,
  weight_kg: number,
  gender: 'male' | 'female'
): number => {
  // Fórmula de Enright y Sherrill (1998)
  if (gender === 'male') {
    return (7.57 * height_cm) - (5.02 * age) - (1.76 * weight_kg) - 309;
  } else {
    return (2.11 * height_cm) - (2.29 * weight_kg) - (5.78 * age) + 667;
  }
};

// Calcular porcentaje de la distancia predicha
export const calculatePercentPredicted = (
  actualDistance: number,
  predictedDistance: number
): number => {
  return (actualDistance / predictedDistance) * 100;
};

// Calcular IMC
export const calculateBMI = (weight_kg: number, height_cm: number): number => {
  const height_m = height_cm / 100;
  return weight_kg / (height_m * height_m);
};

// Interpretación de resultados
export const interpretDistance = (
  actualDistance: number,
  predictedDistance: number,
  percentPredicted: number
) => {
  const difference = actualDistance - predictedDistance;

  let interpretation = '';
  let severity = '';
  let color = '';

  if (percentPredicted >= 82) {
    severity = 'Normal';
    interpretation = 'Capacidad funcional normal';
    color = '#10B981';
  } else if (percentPredicted >= 70) {
    severity = 'Leve';
    interpretation = 'Limitación funcional leve';
    color = '#FBBF24';
  } else if (percentPredicted >= 50) {
    severity = 'Moderada';
    interpretation = 'Limitación funcional moderada';
    color = '#F97316';
  } else {
    severity = 'Severa';
    interpretation = 'Limitación funcional severa';
    color = '#EF4444';
  }

  return {
    severity,
    interpretation,
    color,
    difference,
    percentPredicted: percentPredicted.toFixed(1),
  };
};

// Interpretación de cambios clínicamente significativos
export const interpretChange = (baselineDistance: number, followUpDistance: number) => {
  const change = followUpDistance - baselineDistance;
  const percentChange = (change / baselineDistance) * 100;

  // Diferencia mínima clínicamente importante (MCID) = 30-50 metros
  const MCID = 30;

  let significance = '';
  let clinical_meaning = '';

  if (Math.abs(change) < MCID) {
    significance = 'No significativo';
    clinical_meaning = 'El cambio no alcanza el umbral de significancia clínica';
  } else if (change >= MCID) {
    significance = 'Mejoría significativa';
    clinical_meaning = 'Mejoría clínicamente significativa en la capacidad funcional';
  } else {
    significance = 'Deterioro significativo';
    clinical_meaning = 'Deterioro clínicamente significativo en la capacidad funcional';
  }

  return {
    change,
    percentChange: percentChange.toFixed(1),
    significance,
    clinical_meaning,
    MCID,
  };
};

// Valores de referencia por edad y sexo (promedios reportados en literatura)
export const referenceValues = {
  male: {
    '20-30': { mean: 760, sd: 80 },
    '31-40': { mean: 720, sd: 75 },
    '41-50': { mean: 680, sd: 70 },
    '51-60': { mean: 640, sd: 70 },
    '61-70': { mean: 600, sd: 65 },
    '71-80': { mean: 540, sd: 60 },
    '81+': { mean: 470, sd: 60 },
  },
  female: {
    '20-30': { mean: 700, sd: 75 },
    '31-40': { mean: 670, sd: 70 },
    '41-50': { mean: 630, sd: 65 },
    '51-60': { mean: 590, sd: 65 },
    '61-70': { mean: 550, sd: 60 },
    '71-80': { mean: 500, sd: 55 },
    '81+': { mean: 440, sd: 55 },
  },
};

export const borgScale = [
  { value: 0, label: '0 - Nada en absoluto' },
  { value: 0.5, label: '0.5 - Muy, muy leve (apenas perceptible)' },
  { value: 1, label: '1 - Muy leve' },
  { value: 2, label: '2 - Leve' },
  { value: 3, label: '3 - Moderada' },
  { value: 4, label: '4 - Algo severa' },
  { value: 5, label: '5 - Severa' },
  { value: 6, label: '6' },
  { value: 7, label: '7 - Muy severa' },
  { value: 8, label: '8' },
  { value: 9, label: '9 - Muy, muy severa (casi máxima)' },
  { value: 10, label: '10 - Máxima' },
];

export const sixMWT = {
  id: '6mwt',
  name: 'Test de Marcha de 6 Minutos',
  shortName: '6MWT',
  description: 'Evaluación de la capacidad funcional y tolerancia al ejercicio mediante la distancia máxima recorrida en 6 minutos.',
  category: 'Cardiopulmonary',
  specialty: 'Medicina Física y Rehabilitación',
  timeToComplete: '15-20 min',
  questions: sixMWTQuestions,
  calculatePredictedDistance,
  calculatePercentPredicted,
  calculateBMI,
  interpretDistance,
  interpretChange,
  referenceValues,
  borgScale,
  information: `
# Test de Marcha de 6 Minutos (6-Minute Walk Test - 6MWT)

## Descripción
El Test de Marcha de 6 Minutos es una prueba de ejercicio submáximo que evalúa la capacidad funcional aeróbica. Es ampliamente utilizado para medir la respuesta al tratamiento en enfermedades cardíacas, pulmonares y musculoesqueléticas.

## Objetivo
Evaluar la distancia máxima que un individuo puede caminar en 6 minutos en una superficie plana.

## Indicaciones
- Evaluación funcional pre y post-intervención (cirugía, rehabilitación, tratamiento médico)
- Pronóstico en enfermedades cardiopulmonares (EPOC, hipertensión pulmonar, insuficiencia cardíaca)
- Evaluación de capacidad funcional en adultos mayores
- Evaluación de discapacidad
- Determinación de tolerancia al ejercicio

## Contraindicaciones Absolutas
- Angina inestable durante el mes previo
- Infarto agudo de miocardio durante el mes previo
- Arritmias no controladas
- Estenosis aórtica severa sintomática
- Insuficiencia cardíaca descompensada
- Embolia pulmonar o trombosis venosa profunda reciente
- Miocarditis o pericarditis aguda

## Contraindicaciones Relativas
- FC en reposo >120 lpm
- PAS >180 mmHg o PAD >100 mmHg
- Estenosis aórtica moderada
- Taquiarritmias o bradiarritmias
- Bloqueo AV de alto grado

## Materiales Necesarios
- Pasillo o corredor de 30 metros de longitud (mínimo 20 metros)
- Conos para marcar las vueltas
- Cronómetro
- Pulsioxímetro
- Tensiómetro
- Silla para descansos
- Teléfono o equipo de emergencia cercano
- Escala de Borg para disnea y fatiga

## Protocolo de Aplicación

### Preparación
1. Explicar el procedimiento al paciente
2. Usar ropa y calzado cómodo
3. No realizar ejercicio vigoroso 2 horas antes
4. Medicación habitual según prescripción
5. Reposo sentado de 10 minutos antes de iniciar

### Mediciones Basales (Pre-Test)
- Presión arterial
- Frecuencia cardíaca
- Saturación de oxígeno
- Disnea (escala de Borg)
- Fatiga (escala de Borg)

### Instrucciones Estándar al Paciente
"El objetivo de esta prueba es caminar lo más rápido posible durante 6 minutos, pero sin correr ni trotar. Caminará de un extremo al otro del pasillo. Seis minutos es mucho tiempo para caminar, por lo que es probable que se canse. Puede aminorar la marcha, detenerse y descansar si es necesario. Puede apoyarse en la pared si lo necesita, pero continúe caminando tan pronto como sea capaz. Caminará dando vueltas alrededor de los conos. Ahora voy a mostrarle. Observe cómo giro sin vacilar alrededor del cono y continúo con buen ritmo. ¿Tiene alguna pregunta?"

### Durante el Test
- Iniciar el cronómetro cuando el paciente comience a caminar
- No caminar junto al paciente
- Dar indicaciones estandarizadas cada minuto:
  - Minuto 1: "Lo está haciendo bien, le quedan 5 minutos"
  - Minuto 2: "Siga así, le quedan 4 minutos"
  - Minuto 3: "Lo está haciendo bien, ya va por la mitad"
  - Minuto 4: "Siga así, le quedan 2 minutos"
  - Minuto 5: "Lo está haciendo bien, le queda 1 minuto"
  - 15 segundos finales: "En un momento voy a decirle que se detenga. Cuando lo haga, quédese donde está y yo iré hacia usted"
  - Minuto 6: "Pare"
- Registrar si el paciente se detiene, cuántas veces y por cuánto tiempo
- Si el paciente necesita detenerse: "Puede apoyarse en la pared si lo necesita, continúe cuando se sienta capaz"

### Criterios de Detención
- Dolor torácico
- Disnea intolerable
- Calambres en piernas
- Tambaleo
- Diaforesis excesiva
- Palidez o aspecto de enfermedad
- SpO2 ≤85%

### Mediciones Finales (Post-Test)
Inmediatamente al terminar medir:
- Distancia recorrida (metros)
- Presión arterial
- Frecuencia cardíaca
- Saturación de oxígeno
- Disnea (escala de Borg)
- Fatiga (escala de Borg)
- Número de paradas y tiempo total de descanso

## Cálculo de Distancia Predicha
Fórmula de Enright y Sherrill (1998):

**Hombres:**
6MWD (m) = (7.57 × altura_cm) - (5.02 × edad) - (1.76 × peso_kg) - 309

**Mujeres:**
6MWD (m) = (2.11 × altura_cm) - (2.29 × peso_kg) - (5.78 × edad) + 667

## Interpretación

### Porcentaje de Distancia Predicha
- **≥82%**: Capacidad funcional normal
- **70-81%**: Limitación funcional leve
- **50-69%**: Limitación funcional moderada
- **<50%**: Limitación funcional severa

### Diferencia Mínima Clínicamente Importante (MCID)
- **EPOC**: 25-35 metros
- **Insuficiencia cardíaca**: 30-40 metros
- **Hipertensión pulmonar**: 41 metros
- **Fibrosis pulmonar**: 30 metros
- **General**: 30-50 metros

### Valor Pronóstico
- **EPOC**: <350m asociado con mayor mortalidad
- **Insuficiencia cardíaca**: Cada 50m adicionales reduce mortalidad ~8%
- **Hipertensión pulmonar**: <332m predictor de mortalidad

## Consideraciones Especiales
- Realizar test de práctica si es la primera vez (especialmente en estudios de investigación)
- El segundo test generalmente resulta en mayor distancia (efecto aprendizaje)
- Documentar uso de oxígeno suplementario (afecta interpretación)
- Documentar dispositivos de ayuda (bastón, andador, etc.)
- El test debe realizarse en interiores, en superficie plana y dura
- Temperatura ambiente controlada

## Seguridad
- Tener disponible equipo de emergencia
- Silla para descansos
- Oxígeno de emergencia
- Protocolo de actuación ante eventos adversos

## Referencias
1. ATS Committee on Proficiency Standards for Clinical Pulmonary Function Laboratories. ATS statement: guidelines for the six-minute walk test. Am J Respir Crit Care Med. 2002;166(1):111-117.
2. Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med. 1998;158(5):1384-1387.
3. Holland AE, Spruit MA, Troosters T, et al. An official European Respiratory Society/American Thoracic Society technical standard: field walking tests in chronic respiratory disease. Eur Respir J. 2014;44(6):1428-1446.
  `,
};