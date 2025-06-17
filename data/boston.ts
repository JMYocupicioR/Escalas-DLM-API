import { BostonQuestion } from '@/types/question';

export const symptomSeverityQuestions: BostonQuestion[] = [
  {
    id: 'pain_severity',
    type: 'symptom',
    question: 'Severidad del dolor nocturno',
    description: '¿Cómo calificaría el dolor en la mano o muñeca que tiene por la noche?',
    options: [
      {
        value: 1,
        label: 'No tengo dolor',
        description: 'No experimento dolor durante la noche',
      },
      {
        value: 2,
        label: 'Dolor leve',
        description: 'Dolor ocasional y leve',
      },
      {
        value: 3,
        label: 'Dolor moderado',
        description: 'Dolor que ocasionalmente me despierta',
      },
      {
        value: 4,
        label: 'Dolor intenso',
        description: 'Dolor que frecuentemente me despierta',
      },
      {
        value: 5,
        label: 'Dolor severo',
        description: 'Dolor intenso que me impide dormir',
      },
    ],
  },
  // Add remaining symptom questions...
];

export const functionalStatusQuestions: BostonQuestion[] = [
  {
    id: 'writing',
    type: 'functional',
    question: 'Escritura',
    description: '¿Tiene dificultad para escribir a mano o usar un teclado debido a sus síntomas?',
    options: [
      {
        value: 1,
        label: 'Sin dificultad',
        description: 'Puedo realizar esta actividad sin dificultad',
      },
      {
        value: 2,
        label: 'Dificultad leve',
        description: 'Puedo realizar esta actividad con poca dificultad',
      },
      {
        value: 3,
        label: 'Dificultad moderada',
        description: 'Tengo dificultad moderada para realizar esta actividad',
      },
      {
        value: 4,
        label: 'Dificultad severa',
        description: 'Tengo mucha dificultad para realizar esta actividad',
      },
      {
        value: 5,
        label: 'No puedo realizar',
        description: 'No puedo realizar esta actividad en absoluto debido a los síntomas',
      },
    ],
  },
  // Add remaining functional questions...
];

export const scoreInterpretation = {
  symptomSeverity: [
    { 
      min: 1.0, 
      max: 2.0, 
      level: 'Leve', 
      description: 'Síntomas mínimos que no interfieren significativamente con las actividades diarias.' 
    },
    { 
      min: 2.1, 
      max: 3.0, 
      level: 'Moderado', 
      description: 'Síntomas que causan algunas limitaciones en actividades diarias.' 
    },
    { 
      min: 3.1, 
      max: 5.0, 
      level: 'Severo', 
      description: 'Síntomas que interfieren notablemente con las actividades diarias. Se recomienda evaluación médica urgente.' 
    }
  ],
  functionalStatus: [
    { 
      min: 1.0, 
      max: 2.0, 
      level: 'Funcionalidad normal', 
      description: 'Capacidad funcional preservada para la mayoría de actividades.' 
    },
    { 
      min: 2.1, 
      max: 3.0, 
      level: 'Limitación funcional moderada', 
      description: 'Dificultades para realizar algunas actividades cotidianas.' 
    },
    { 
      min: 3.1, 
      max: 5.0, 
      level: 'Limitación funcional severa', 
      description: 'Dificultad significativa para realizar actividades básicas. Se recomienda intervención.' 
    }
  ]
};