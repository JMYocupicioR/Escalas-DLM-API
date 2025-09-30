import { useState, useCallback, useMemo, useEffect } from 'react';
import { questions, scoreInterpretation } from '@/data/katz';
import { useSettingsStore } from '@/store/settingsStore';

interface PatientData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  doctorName: string;
}

interface KatzResults {
  totalScore: number;
  interpretation: {
    score: number;
    level: string;
    description: string;
    interpretation: string;
    color: string;
  };
  responses: Record<string, number>;
}

export const useKatzAssessment = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    doctorName: '',
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Obtener configuración de avance automático desde settings
  const autoAdvanceQuestions = useSettingsStore((state) => state.autoAdvanceQuestions);

  // Inicializar respuestas con undefined para todas las preguntas
  const initializeResponses = useCallback(() => {
    const initialResponses: Record<string, number> = {};
    questions.forEach((q) => {
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
    if (autoAdvanceQuestions && currentQuestionIndex < questions.length - 1) {
      // Pequeño delay para que el usuario vea la selección antes de avanzar
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

  // Calcular puntuación total
  const calculateScore = useCallback(() => {
    return Object.values(responses).reduce((sum, val) => {
      return val !== -1 ? sum + val : sum;
    }, 0);
  }, [responses]);

  // Obtener interpretación basada en el puntaje
  const getInterpretation = useCallback((score: number) => {
    const interpretation = scoreInterpretation.find((interp) => interp.score === score);
    return interpretation || scoreInterpretation[scoreInterpretation.length - 1];
  }, []);

  // Verificar si todas las preguntas están respondidas
  const isAllQuestionsAnswered = useCallback(() => {
    return questions.every((q) => responses[q.id] !== undefined && responses[q.id] !== -1);
  }, [responses]);

  // Verificar si la pregunta actual está respondida
  const isCurrentQuestionAnswered = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    const response = responses[currentQuestion.id];
    return response !== undefined && response !== -1;
  }, [currentQuestionIndex, responses]);

  // Navegar a la siguiente pregunta
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
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
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, []);

  // Completar la evaluación y calcular resultados
  const completeAssessment = useCallback((): KatzResults => {
    const totalScore = calculateScore();
    const interpretation = getInterpretation(totalScore);

    return {
      totalScore,
      interpretation,
      responses,
    };
  }, [calculateScore, getInterpretation, responses]);

  // Resetear la evaluación
  const resetAssessment = useCallback(() => {
    setResponses({});
    setCurrentQuestionIndex(0);
    setPatientData({
      name: '',
      age: '',
      gender: '',
      doctorName: '',
    });
  }, []);

  // Calcular progreso
  const progress = useMemo(() => {
    const answeredCount = Object.values(responses).filter((val) => val !== -1).length;
    return (answeredCount / questions.length) * 100;
  }, [responses]);

  // Pregunta actual
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
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
    autoAdvanceQuestions, // Exponer estado de configuración
    
    // Acciones
    initializeResponses,
    updateResponse,
    updateResponseWithAutoAdvance, // Función con auto-avance
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
    calculateScore,
    getInterpretation,
    
    // Datos de la escala
    questions,
    totalQuestions: questions.length,
    maxScore: 6,
  };
};
