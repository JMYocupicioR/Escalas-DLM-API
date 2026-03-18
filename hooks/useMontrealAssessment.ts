import { useState, useCallback, useMemo } from 'react';
import { mocaQuestions } from '@/data/moca';
import { useSettingsStore } from '@/store/settingsStore';

interface PatientData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  doctorName: string;
  educationYears?: number; // Años de educación formal para ajuste
}

interface MontrealResults {
  rawScore: number; // Puntuación sin ajuste
  adjustedScore: number; // Puntuación con ajuste educativo
  educationAdjustment: number; // 0 o 1
  interpretation: {
    level: string;
    description: string;
    recommendations: string;
    color: string;
  };
  responses: Record<string, number>;
  domainScores: {
    visoespacialEjecutiva: number;
    identificacion: number;
    atencion: number;
    lenguaje: number;
    abstraccion: number;
    recuerdoDiferido: number;
    orientacion: number;
  };
}

// Interpretación de resultados según puntuación ajustada
const getScoreInterpretation = (score: number) => {
  if (score >= 26) {
    return {
      level: 'Normal',
      description: 'Puntuación dentro del rango de normalidad cognitiva. No sugiere deterioro cognitivo significativo.',
      recommendations: 'Mantener actividad cognitiva regular. Control de factores de riesgo cardiovascular. Reevaluación si aparecen síntomas o quejas cognitivas. Considerar reevaluación en 1-2 años si hay factores de riesgo.',
      color: '#22c55e',
    };
  } else if (score >= 18) {
    return {
      level: 'Deterioro Cognitivo Leve / Demencia Leve',
      description: 'Puntuación sugestiva de Deterioro Cognitivo Leve (DCL) o demencia en fase inicial. Requiere evaluación exhaustiva.',
      recommendations: 'Derivación a especialista (neurólogo/neuropsicólogo/geriatra). Evaluación neuropsicológica formal. Analítica completa (función tiroidea, B12, ácido fólico). Neuroimagen (RM/TAC cerebral). Evaluación de factores de riesgo vascular. Seguimiento cada 3-6 meses.',
      color: '#f59e0b',
    };
  } else {
    return {
      level: 'Demencia Severa a Moderada',
      description: 'Deterioro cognitivo severo compatible con demencia establecida. Afectación significativa en múltiples dominios cognitivos.',
      recommendations: 'Evaluación neurológica urgente. Neuroimagen cerebral. Evaluación neuropsicológica completa. Considerar inicio de tratamiento farmacológico y valoración de capacidad de autonomía.',
      color: '#ef4444',
    };
  }
};

export const useMontrealAssessment = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    doctorName: '',
    educationYears: undefined,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Obtener configuración de avance automático desde settings
  const autoAdvanceQuestions = useSettingsStore((state) => state.autoAdvanceQuestions);

  // Inicializar respuestas
  const initializeResponses = useCallback(() => {
    const initialResponses: Record<string, number> = {};
    mocaQuestions.forEach((q) => {
      initialResponses[q.id] = -1; // -1 indica sin responder
    });
    setResponses(initialResponses);
  }, []);

  // Actualizar respuesta de una pregunta
  const updateResponse = useCallback((questionId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  // Actualizar respuesta y auto-avanzar si está habilitado
  const updateResponseWithAutoAdvance = useCallback((questionId: string, value: number) => {
    updateResponse(questionId, value);
    
    // Auto-avanzar si está habilitado y no es la última pregunta
    if (autoAdvanceQuestions && currentQuestionIndex < mocaQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 300);
    }
  }, [updateResponse, autoAdvanceQuestions, currentQuestionIndex]);

  // Obtener respuesta de una pregunta
  const getResponse = useCallback((questionId: string): number | undefined => {
    const response = responses[questionId];
    return response === -1 ? undefined : response;
  }, [responses]);

  // Actualizar datos del paciente
  const updatePatientData = useCallback((data: Partial<PatientData>) => {
    setPatientData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Calcular puntuación por dominio cognitivo
  const calculateDomainScores = useCallback(() => {
    const getScore = (questionIds: string[]) => {
      return questionIds.reduce((sum, id) => {
        const val = responses[id];
        return val !== undefined && val !== -1 ? sum + val : sum;
      }, 0);
    };

    return {
      visoespacialEjecutiva: getScore([
        'alternancia-conceptual',
        'copia-cubo',
        'reloj-contorno',
        'reloj-numeros',
        'reloj-manecillas',
      ]),
      identificacion: getScore([
        'nominacion-leon',
        'nominacion-rinoceronte',
        'nominacion-camello',
      ]),
      atencion: getScore([
        'digitos-directo',
        'digitos-inverso',
        'vigilancia',
        'serial-7-puntos',
      ]),
      lenguaje: getScore([
        'repeticion-frase-1',
        'repeticion-frase-2',
        'fluidez-verbal',
      ]),
      abstraccion: getScore([
        'abstraccion-1',
        'abstraccion-2',
      ]),
      recuerdoDiferido: getScore([
        'recuerdo-diferido-rostro',
        'recuerdo-diferido-seda',
        'recuerdo-diferido-iglesia',
        'recuerdo-diferido-clavel',
        'recuerdo-diferido-rojo',
      ]),
      orientacion: getScore([
        'orientacion-fecha',
        'orientacion-mes',
        'orientacion-año',
        'orientacion-dia',
        'orientacion-lugar',
        'orientacion-ciudad',
      ]),
    };
  }, [responses]);

  // Calcular puntuación total sin ajuste
  const calculateRawScore = useCallback(() => {
    return Object.entries(responses).reduce((sum, [key, val]) => {
      // No contar las preguntas de memoria registro (no puntúan)
      if (key === 'memoria-registro-1' || key === 'memoria-registro-2') {
        return sum;
      }
      return val !== -1 ? sum + val : sum;
    }, 0);
  }, [responses]);

  // Calcular ajuste por educación
  const calculateEducationAdjustment = useCallback(() => {
    // Si tiene 12 años o menos de educación, añadir 1 punto
    if (patientData.educationYears !== undefined && patientData.educationYears <= 12) {
      return 1;
    }
    return 0;
  }, [patientData.educationYears]);

  // Calcular puntuación ajustada
  const calculateAdjustedScore = useCallback(() => {
    const raw = calculateRawScore();
    const adjustment = calculateEducationAdjustment();
    return Math.min(30, raw + adjustment); // Máximo 30 puntos
  }, [calculateRawScore, calculateEducationAdjustment]);

  // Verificar si todas las preguntas están respondidas
  const isAllQuestionsAnswered = useCallback(() => {
    return mocaQuestions.every((q) => {
      const response = responses[q.id];
      return response !== undefined && response !== -1;
    });
  }, [responses]);

  // Verificar si la pregunta actual está respondida
  const isCurrentQuestionAnswered = useCallback(() => {
    const currentQuestion = mocaQuestions[currentQuestionIndex];
    if (!currentQuestion) return false;
    const response = responses[currentQuestion.id];
    return response !== undefined && response !== -1;
  }, [currentQuestionIndex, responses]);

  // Navegar a la siguiente pregunta
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < mocaQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex]);

  // Navegar a la pregunta anterior
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Ir a una pregunta específica
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < mocaQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  }, []);

  // Completar la evaluación y calcular resultados
  const completeAssessment = useCallback((): MontrealResults => {
    const rawScore = calculateRawScore();
    const educationAdjustment = calculateEducationAdjustment();
    const adjustedScore = calculateAdjustedScore();
    const interpretation = getScoreInterpretation(adjustedScore);
    const domainScores = calculateDomainScores();

    return {
      rawScore,
      adjustedScore,
      educationAdjustment,
      interpretation,
      responses,
      domainScores,
    };
  }, [calculateRawScore, calculateEducationAdjustment, calculateAdjustedScore, calculateDomainScores, responses]);

  // Resetear la evaluación
  const resetAssessment = useCallback(() => {
    setResponses({});
    setCurrentQuestionIndex(0);
    setPatientData({
      name: '',
      age: '',
      gender: '',
      doctorName: '',
      educationYears: undefined,
    });
  }, []);

  // Calcular progreso
  const progress = useMemo(() => {
    const answeredCount = Object.values(responses).filter((val) => val !== -1).length;
    return (answeredCount / mocaQuestions.length) * 100;
  }, [responses]);

  // Pregunta actual
  const currentQuestion = useMemo(() => {
    return mocaQuestions[currentQuestionIndex] || null;
  }, [currentQuestionIndex]);

  // Resultados
  const results = useMemo(() => {
    if (!isAllQuestionsAnswered()) return null;
    return completeAssessment();
  }, [isAllQuestionsAnswered, completeAssessment]);

  return {
    // Estado
    responses,
    patientData,
    currentQuestionIndex,
    currentQuestion,
    progress,
    results,
    autoAdvanceQuestions,
    
    // Acciones
    initializeResponses,
    updateResponse,
    updateResponseWithAutoAdvance,
    getResponse,
    updatePatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    completeAssessment,
    resetAssessment,
    
    // Validaciones
    isAllQuestionsAnswered,
    isCurrentQuestionAnswered,
    
    // Helpers
    calculateRawScore,
    calculateAdjustedScore,
    calculateEducationAdjustment,
    calculateDomainScores,
    
    // Datos de la escala
    questions: mocaQuestions,
    totalQuestions: mocaQuestions.length,
    maxScore: 30,
  };
};

