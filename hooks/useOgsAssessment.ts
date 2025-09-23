// hooks/useOgsAssessment.ts
import { useState, useMemo, useCallback } from 'react';
import { ogsQuestions, ogsScale } from '@/data/ogs';

export interface OgsResponse {
  questionId: string;
  leftScore: number;
  rightScore: number;
}

export interface OgsAssessmentData {
  responses: OgsResponse[];
  leftTotalScore: number;
  rightTotalScore: number;
  leftInterpretation: {
    interpretation_level: string;
    interpretation_text: string;
    color_code: string;
  };
  rightInterpretation: {
    interpretation_level: string;
    interpretation_text: string;
    color_code: string;
  };
  patientData: {
    name: string;
    age: string;
    gender: string;
    diagnosis: string;
    evaluator: string;
    date: string;
  };
}

export function useOgsAssessment() {
  const [responses, setResponses] = useState<OgsResponse[]>([]);
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    diagnosis: '',
    evaluator: '',
    date: new Date().toLocaleDateString('es-ES')
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Inicializar respuestas vacías para todas las preguntas
  const initializeResponses = useCallback(() => {
    const initialResponses: OgsResponse[] = ogsQuestions.map(question => ({
      questionId: question.id,
      leftScore: 0,
      rightScore: 0
    }));
    setResponses(initialResponses);
  }, []);

  // Actualizar respuesta para una pregunta específica
  const updateResponse = useCallback((questionId: string, side: 'left' | 'right', score: number) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [side === 'left' ? 'leftScore' : 'rightScore']: score
        };
        return updated;
      } else {
        return [...prev, { questionId, leftScore: side === 'left' ? score : 0, rightScore: side === 'right' ? score : 0 }];
      }
    });
  }, []);

  // Obtener respuesta actual para una pregunta
  const getResponse = useCallback((questionId: string) => {
    return responses.find(r => r.questionId === questionId) || { questionId, leftScore: 0, rightScore: 0 };
  }, [responses]);

  // Calcular puntuación total para un lado
  const calculateTotalScore = useCallback((side: 'left' | 'right') => {
    return responses.reduce((total, response) => {
      return total + (side === 'left' ? response.leftScore : response.rightScore);
    }, 0);
  }, [responses]);

  // Obtener interpretación basada en puntuación
  const getInterpretation = useCallback((score: number) => {
    const range = ogsScale.scoring.ranges.find(r => score >= r.min_value && score <= r.max_value);
    return range || ogsScale.scoring.ranges[ogsScale.scoring.ranges.length - 1];
  }, []);

  // Calcular resultados completos
  const results = useMemo(() => {
    const leftTotalScore = calculateTotalScore('left');
    const rightTotalScore = calculateTotalScore('right');
    
    return {
      leftTotalScore,
      rightTotalScore,
      leftInterpretation: getInterpretation(leftTotalScore),
      rightInterpretation: getInterpretation(rightTotalScore),
      responses,
      patientData
    };
  }, [responses, calculateTotalScore, getInterpretation, patientData]);

  // Verificar si todas las preguntas están respondidas
  const isAllQuestionsAnswered = useMemo(() => {
    return ogsQuestions.every(question => {
      const response = getResponse(question.id);
      return response.leftScore > 0 && response.rightScore > 0;
    });
  }, [responses, getResponse]);

  // Navegación entre preguntas
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < ogsQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < ogsQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  }, []);

  // Completar evaluación
  const completeAssessment = useCallback(() => {
    if (isAllQuestionsAnswered) {
      setIsComplete(true);
      return results;
    }
    return null;
  }, [isAllQuestionsAnswered, results]);

  // Reiniciar evaluación
  const resetAssessment = useCallback(() => {
    setResponses([]);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
    setPatientData({
      name: '',
      age: '',
      gender: '',
      diagnosis: '',
      evaluator: '',
      date: new Date().toLocaleDateString('es-ES')
    });
  }, []);

  // Obtener progreso
  const progress = useMemo(() => {
    const answeredQuestions = responses.filter(r => r.leftScore > 0 && r.rightScore > 0).length;
    return {
      current: currentQuestionIndex + 1,
      total: ogsQuestions.length,
      percentage: (answeredQuestions / ogsQuestions.length) * 100,
      answeredQuestions
    };
  }, [currentQuestionIndex, responses]);

  // Obtener pregunta actual
  const currentQuestion = ogsQuestions[currentQuestionIndex];

  return {
    // Estado
    responses,
    patientData,
    currentQuestionIndex,
    isComplete,
    currentQuestion,
    progress,
    results,
    
    // Acciones
    initializeResponses,
    updateResponse,
    getResponse,
    setPatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    completeAssessment,
    resetAssessment,
    
    // Utilidades
    isAllQuestionsAnswered,
    calculateTotalScore,
    getInterpretation
  };
}
