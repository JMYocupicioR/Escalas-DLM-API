import type { Scale } from '@/types/scale';
import { denver2 } from './denver';
import { boston } from './boston';

export const scales: Scale[] = [
  denver2,
  // From functional.tsx
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    description: 'Evaluación de actividades básicas de la vida diaria',
    timeToComplete: '5-10 min',
    category: 'ADL',
  },
  {
    id: 'gas',
    name: 'Escala GAS',
    description: 'Consecución de objetivos personalizados en rehabilitación',
    timeToComplete: '10-20 min',
    category: 'Rehab',
  },
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    description: 'Evaluación del equilibrio y la marcha',
    timeToComplete: '10-15 min',
    category: 'Balance',
  },
  {
    id: 'mmse',
    name: 'Mini-Mental State Examination',
    description: 'Evaluación del estado cognitivo',
    timeToComplete: '10 min',
    category: 'Cognitive',
    crossReferences: ['geriatria'],
  },
  {
    id: 'norton',
    name: 'Escala de Norton',
    description: 'Valoración del riesgo de úlceras por presión',
    timeToComplete: '5 min',
    category: 'Risk',
  },
  {
    id: 'vas',
    name: 'Escala Visual Analógica',
    description: 'Evaluación del dolor',
    timeToComplete: '1 min',
    category: 'Pain',
  },
  // From segmento.tsx
  {
    id: 'glasgow',
    name: 'Escala de Glasgow',
    description: 'Evaluación del nivel de consciencia',
    timeToComplete: '2 min',
    category: 'Neurology',
    crossReferences: ['trauma'],
  },
  {
    id: 'house-brackmann',
    name: 'House-Brackmann',
    description: 'Evaluación de parálisis facial',
    timeToComplete: '5 min',
    category: 'Neurology',
    crossReferences: ['neurologia'],
  },
  {
    id: 'oswestry',
    name: 'Índice de Discapacidad de Oswestry',
    description: 'Evaluación funcional de columna lumbar',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
  },
  {
    id: 'borg',
    name: 'Escala de Borg',
    description: 'Evaluación de disnea',
    timeToComplete: '2 min',
    category: 'Cardiopulmonary',
    crossReferences: ['neumologia'],
  },
  {
    id: 'constant',
    name: 'Score de Constant',
    description: 'Evaluación funcional del hombro',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
  },
  {
    id: 'harris',
    name: 'Harris Hip Score',
    description: 'Evaluación funcional de cadera',
    timeToComplete: '10 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
  },
  {
    id: 'koos',
    name: 'KOOS',
    description: 'Evaluación de resultados en lesiones de rodilla',
    timeToComplete: '15 min',
    category: 'Orthopedics',
    crossReferences: ['traumatologia'],
  },
  {
    id: 'fim',
    name: 'Escala de Independencia Funcional (FIM)',
    description: 'Evaluación de la discapacidad y la carga de cuidados en rehabilitación.',
    timeToComplete: '20-30 min',
    category: 'Rehab',
    specialty: 'Medicina Física y Rehabilitación',
  },
  {
    id: 'lequesne-rodilla-es-v1',
    name: 'Índice de Lequesne para Osteoartritis de Rodilla',
    description: 'Cuestionario para cuantificar dolor/malestar, distancia máxima de marcha y dificultades en la vida diaria en osteoartritis de rodilla.',
    timeToComplete: '3-5 min',
    category: 'Osteoartritis de rodilla',
    specialty: 'Traumatología',
    scoring: {
      method: 'sum',
      ranges: [
        {
          min: 0,
          max: 7,
          interpretation: 'Leve - Impacto limitado en la vida diaria.'
        },
        {
          min: 7.5,
          max: 13,
          interpretation: 'Moderada - Impacto significativo en la calidad de vida.'
        },
        {
          min: 13.5,
          max: 26,
          interpretation: 'Severa - Pronóstico malo para la función.'
        }
      ]
    }
  },
  {
    id: 'boston',
    name: 'Cuestionario de Boston',
    description: 'Evaluación de síntomas y función en síndrome del túnel carpiano',
    timeToComplete: '5-10 min',
    category: 'Neurology',
    specialty: 'Neurología',
  },
  {
    id: 'botulinum',
    name: 'Calculadora de Toxina Botulínica',
    description: 'Dosificación de toxina botulínica por músculo y puntos motores',
    timeToComplete: '10-15 min',
    category: 'Neurology',
    specialty: 'Neurología',
  },
];

export const scalesById = scales.reduce((acc, scale) => {
  acc[scale.id] = scale;
  return acc;
}, {} as Record<string, Scale>);

const existingBostonIndex = scales.findIndex(s => s.id === 'boston');
if (existingBostonIndex !== -1) {
  scales[existingBostonIndex] = boston;
} else {
  scales.unshift(boston);
}

scalesById['boston'] = boston;
