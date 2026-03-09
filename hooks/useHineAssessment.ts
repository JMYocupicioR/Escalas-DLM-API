// hooks/useHineAssessment.ts
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { hineQuestionsData, hineMotorMilestones, hineBehaviorItems } from '@/data/hine';

export interface HineResponse {
  questionId: string;
  score: number | null;
  hasAsymmetry?: boolean;
}

export interface HineMotorMilestone {
  milestoneId: string;
  status: 'no_presente' | 'observado' | 'referido';
}

export interface HineBehavior {
  behaviorId: string;
  present: boolean;
}

export interface HineAssessmentData {
  responses: HineResponse[];
  motorMilestones: HineMotorMilestone[];
  behaviors: HineBehavior[];
  comments: string;
  totalScore: number;
  asymmetryCount: number;
  sectionScores: {
    craneales: number;
    postura: number;
    movimientos: number;
    tono: number;
    reflejos: number;
  };
  interpretation: {
    interpretation_level: string;
    interpretation_text: string;
    color_code: string;
  };
  asymmetryInterpretation: {
    count: number;
    isSignificant: boolean;
    text: string;
  };
  patientData: {
    name: string;
    birthDate: string;
    gestationalAge: string;
    examDate: string;
    headCircumference: string;
    examiner: string;
    chronologicalAge: string;
    correctedAge: string;
    correctedAgeMonths: number | null;
  };
}

export function useHineAssessment() {
  const [responses, setResponses] = useState<HineResponse[]>([]);
  const [motorMilestones, setMotorMilestones] = useState<HineMotorMilestone[]>([]);
  const [behaviors, setBehaviors] = useState<HineBehavior[]>([]);
  const [comments, setComments] = useState('');
  const [patientData, setPatientData] = useState<{
    name: string;
    birthDate: string;
    gestationalAge: string;
    examDate: string;
    headCircumference: string;
    examiner: string;
    chronologicalAge: string;
    correctedAge: string;
    correctedAgeMonths: number | null;
  }>({
    name: '',
    birthDate: '',
    gestationalAge: '',
    examDate: new Date().toISOString().split('T')[0],
    headCircumference: '',
    examiner: '',
    chronologicalAge: '',
    correctedAge: '',
    correctedAgeMonths: null
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const lastUpdatedQuestionIdRef = useRef<string | null>(null);

  // Secciones organizadas
  const sections = useMemo(() => {
    const sectionMap = new Map();
    hineQuestionsData.forEach(question => {
      if (!sectionMap.has(question.section)) {
        sectionMap.set(question.section, {
          name: question.section,
          order: question.section_order,
          questions: []
        });
      }
      sectionMap.get(question.section).questions.push(question);
    });
    return Array.from(sectionMap.values()).sort((a, b) => a.order - b.order);
  }, []);

  // Inicializar respuestas vacías
  const initializeResponses = useCallback(() => {
    const initialResponses: HineResponse[] = hineQuestionsData.map(question => ({
      questionId: question.question_id,
      score: null,
      hasAsymmetry: false
    }));
    setResponses(initialResponses);

    const initialMilestones: HineMotorMilestone[] = hineMotorMilestones.map(milestone => ({
      milestoneId: milestone.id,
      status: 'no_presente'
    }));
    setMotorMilestones(initialMilestones);

    const initialBehaviors: HineBehavior[] = hineBehaviorItems.map(behavior => ({
      behaviorId: behavior.id,
      present: false
    }));
    setBehaviors(initialBehaviors);
    lastUpdatedQuestionIdRef.current = null;
  }, []);

  // Actualizar respuesta para una pregunta específica
  const updateResponse = useCallback((questionId: string, score: number | null, hasAsymmetry?: boolean) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          score,
          hasAsymmetry: hasAsymmetry || false
        };
        return updated;
      } else {
        return [...prev, { questionId, score, hasAsymmetry: hasAsymmetry || false }];
      }
    });
    lastUpdatedQuestionIdRef.current = questionId;
  }, []);

  // Actualizar hito motor
  const updateMotorMilestone = useCallback((milestoneId: string, status: 'no_presente' | 'observado' | 'referido') => {
    setMotorMilestones(prev => {
      const existingIndex = prev.findIndex(m => m.milestoneId === milestoneId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      } else {
        return [...prev, { milestoneId, status }];
      }
    });
  }, []);

  // Actualizar comportamiento
  const updateBehavior = useCallback((behaviorId: string, present: boolean) => {
    setBehaviors(prev => {
      const existingIndex = prev.findIndex(b => b.behaviorId === behaviorId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], present };
        return updated;
      } else {
        return [...prev, { behaviorId, present }];
      }
    });
  }, []);

  // Obtener respuesta actual para una pregunta
  const getResponse = useCallback((questionId: string) => {
    return responses.find(r => r.questionId === questionId) || { questionId, score: null, hasAsymmetry: false };
  }, [responses]);

  // Obtener estado de hito motor
  const getMotorMilestone = useCallback((milestoneId: string) => {
    return motorMilestones.find(m => m.milestoneId === milestoneId) || { milestoneId, status: 'no_presente' as const };
  }, [motorMilestones]);

  // Obtener estado de comportamiento
  const getBehavior = useCallback((behaviorId: string) => {
    return behaviors.find(b => b.behaviorId === behaviorId) || { behaviorId, present: false };
  }, [behaviors]);

  // Calcular puntuacion total
  const calculateTotalScore = useCallback(() => {
    return responses.reduce((total, response) => total + (response.score ?? 0), 0);
  }, [responses]);

  // Calcular puntuaciones por seccion
  const calculateSectionScores = useCallback(() => {
    const sectionScores = {
      craneales: 0,
      postura: 0,
      movimientos: 0,
      tono: 0,
      reflejos: 0
    };

    responses.forEach(response => {
      const question = hineQuestionsData.find(q => q.question_id === response.questionId);
      if (!question) {
        return;
      }

      const value = response.score ?? 0;

      switch (question.section) {
        case 'Pares Craneales':
          sectionScores.craneales += value;
          break;
        case 'Postura':
          sectionScores.postura += value;
          break;
        case 'Movimientos':
          sectionScores.movimientos += value;
          break;
        case 'Tono Muscular':
          sectionScores.tono += value;
          break;
        case 'Reflejos y Reacciones':
          sectionScores.reflejos += value;
          break;
        default:
          break;
      }
    });

    return sectionScores;
  }, [responses]);

  // Calcular numero de asimetrias
  const calculateAsymmetryCount = useCallback(() => {
    return responses.filter(response => response.hasAsymmetry).length;
  }, [responses]);


  // Dynamic interpretation based on age and score
  const getDynamicInterpretation = useCallback((score: number, correctedAgeMonths: number | null) => {
    // Clinically validated cutoffs for cerebral palsy risk
    const cutoffs = { 3: 47, 6: 51, 9: 64, 12: 70 };

    // Assign a reference age group for interpretation
    let ageReference: 3 | 6 | 9 | 12 | null = null;
    if (correctedAgeMonths !== null) {
      if (correctedAgeMonths <= 4.5) ageReference = 3;
      else if (correctedAgeMonths <= 7.5) ageReference = 6;
      else if (correctedAgeMonths <= 10.5) ageReference = 9;
      else if (correctedAgeMonths <= 18) ageReference = 12;
    }

    // Hierarchical interpretation logic
    if (score < 40) {
      return {
        interpretation_level: 'Riesgo Muy Alto',
        interpretation_text: 'Puntuacion muy baja (<40). Fuerte indicador de alteraciones motoras significativas. Requiere intervencion y manejo especializado inmediato.',
        color_code: '#ef4444'
      };
    }

    if (ageReference && score < cutoffs[ageReference]) {
      return {
        interpretation_level: 'Riesgo Elevado (por Edad)',
        interpretation_text: 'La puntuacion (' + score + ') esta por debajo del umbral de riesgo (' + cutoffs[ageReference] + ') para la edad corregida del paciente (' + ageReference + ' meses). Alta probabilidad de PC. Se recomienda derivacion urgente.',
        color_code: '#ef4444'
      };
    }

    if (score < 60) {
      return {
        interpretation_level: 'Zona de Vigilancia',
        interpretation_text: 'Puntuacion suboptima. Indica una necesidad de seguimiento neurologico cercano y reevaluacion periodica para monitorizar la trayectoria del desarrollo.',
        color_code: '#f59e0b'
      };
    }

    if (score <= 72) {
      return {
        interpretation_level: 'Desarrollo Normal',
        interpretation_text: 'La puntuacion se encuentra dentro del rango esperado. Continuar con la vigilancia del desarrollo estandar.',
        color_code: '#22c55e'
      };
    }

    // Default if the score is greater than 72
    return {
      interpretation_level: 'Optimo',
      interpretation_text: 'Desarrollo neurologico excelente para la edad. Se recomienda seguimiento de rutina.',
      color_code: '#16a34a'
    };
  }, []);




  // Interpretacion de asimetria basada en el conteo
  const getAsymmetryInterpretation = useCallback((count: number) => {
    const isSignificant = count >= 3;
    return {
      count,
      isSignificant,
      text: isSignificant
        ? 'Se observaron ' + count + ' hallazgos. Un patron de 3 asimetrias es clinicamente significativo y requiere especial atencion.'
        : 'Se observaron ' + count + ' hallazgos asimetricos. No se considera un patron clinicamente significativo.'
    };
  }, []);




  // Calcular edades
  const calculateAges = useCallback((birthDate: string, gestationalAge: string, examDate: string) => {
    const birth = new Date(birthDate);
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const chronologicalAge = `${Math.floor(diffDays / 7)} semanas y ${diffDays % 7} días`;

    const prematureDays = (40 - parseInt(gestationalAge)) * 7;
    const correctedTotalDays = diffDays - prematureDays;
    const correctedWeeks = Math.floor(correctedTotalDays / 7);
    const correctedAge = correctedWeeks >= 0
      ? `${correctedWeeks} semanas y ${correctedTotalDays % 7} días`
      : 'No aplica';
    const correctedAgeMonths = correctedWeeks >= 0 ? correctedTotalDays / 30.44 : null;

    return {
      chronologicalAge,
      correctedAge,
      correctedAgeMonths
    };
  }, []);

  // Calcular resultados completos
  const results = useMemo(() => {
    const totalScore = responses.reduce((acc, curr) => acc + (curr.score ?? 0), 0);
    const asymmetryCount = responses.filter(r => r.hasAsymmetry).length;
    const sectionScores = calculateSectionScores();
    const interpretation = getDynamicInterpretation(totalScore, patientData.correctedAgeMonths);
    const asymmetryInterpretation = getAsymmetryInterpretation(asymmetryCount);

    return {
      responses,
      motorMilestones,
      behaviors,
      comments,
      totalScore,
      asymmetryCount,
      sectionScores,
      interpretation,
      asymmetryInterpretation,
      patientData
    };
  }, [
    responses,
    motorMilestones,
    behaviors,
    comments,
    calculateSectionScores,
    getDynamicInterpretation,
    getAsymmetryInterpretation,
    patientData
  ]);

  // Verificar si todas las preguntas están respondidas
  const isAllQuestionsAnswered = useMemo(() => {
    return hineQuestionsData.every(question => {
      const response = getResponse(question.question_id);
      return response.score !== null;
    });
  }, [responses, getResponse]);

  // Navegación entre preguntas
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < hineQuestionsData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);

      // Actualizar sección si es necesario
      const nextQuestion = hineQuestionsData[currentQuestionIndex + 1];
      const nextSectionIndex = sections.findIndex(s => s.name === nextQuestion.section);
      if (nextSectionIndex !== currentSection) {
        setCurrentSection(nextSectionIndex);
      }
    }
  }, [currentQuestionIndex, sections, currentSection]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);

      // Actualizar sección si es necesario
      const prevQuestion = hineQuestionsData[currentQuestionIndex - 1];
      const prevSectionIndex = sections.findIndex(s => s.name === prevQuestion.section);
      if (prevSectionIndex !== currentSection) {
        setCurrentSection(prevSectionIndex);
      }
    }
  }, [currentQuestionIndex, sections, currentSection]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < hineQuestionsData.length) {
      setCurrentQuestionIndex(index);

      // Actualizar sección
      const question = hineQuestionsData[index];
      const sectionIndex = sections.findIndex(s => s.name === question.section);
      setCurrentSection(sectionIndex);
    }
  }, [sections]);

  const goToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
      setCurrentSection(sectionIndex);

      // Ir a la primera pregunta de la sección
      const section = sections[sectionIndex];
      const firstQuestionIndex = hineQuestionsData.findIndex(q => q.section === section.name);
      if (firstQuestionIndex >= 0) {
        setCurrentQuestionIndex(firstQuestionIndex);
      }
    }
  }, [sections]);

  useEffect(() => {
    const lastUpdatedQuestionId = lastUpdatedQuestionIdRef.current;
    if (!lastUpdatedQuestionId) {
      return;
    }

    const currentQuestion = hineQuestionsData[currentQuestionIndex];
    if (!currentQuestion || currentQuestion.question_id !== lastUpdatedQuestionId) {
      return;
    }

    const response = responses.find(r => r.questionId === lastUpdatedQuestionId);
    if (response && response.score !== null) {
      goToNextQuestion();
      lastUpdatedQuestionIdRef.current = null;
    }
  }, [responses, currentQuestionIndex, goToNextQuestion, hineQuestionsData]);

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
    setMotorMilestones([]);
    setBehaviors([]);
    setComments('');
    setCurrentQuestionIndex(0);
    lastUpdatedQuestionIdRef.current = null;
    setCurrentSection(0);
    setIsComplete(false);
    setPatientData({
      name: '',
      birthDate: '',
      gestationalAge: '',
      examDate: new Date().toISOString().split('T')[0],
      headCircumference: '',
      examiner: '',
      chronologicalAge: '',
      correctedAge: '',
      correctedAgeMonths: null
    });
  }, []);

  // Actualizar datos del paciente con cálculo de edades
  const updatePatientData = useCallback((data: Partial<typeof patientData>) => {
    setPatientData(prev => {
      const updated = { ...prev, ...data };

      // Si se actualizaron fecha de nacimiento, edad gestacional o fecha de examen, recalcular edades
      if (data.birthDate || data.gestationalAge || data.examDate) {
        if (updated.birthDate && updated.gestationalAge && updated.examDate) {
          const ages = calculateAges(updated.birthDate, updated.gestationalAge, updated.examDate);
          updated.chronologicalAge = ages.chronologicalAge;
          updated.correctedAge = ages.correctedAge;
          updated.correctedAgeMonths = ages.correctedAgeMonths;
        }
      }

      return updated;
    });
  }, [calculateAges]);

  // Obtener progreso
  const progress = useMemo(() => {
    const answeredQuestions = responses.filter(r => r.score !== null).length;
    return {
      current: currentQuestionIndex + 1,
      total: hineQuestionsData.length,
      percentage: (answeredQuestions / hineQuestionsData.length) * 100,
      answeredQuestions,
      currentSection: currentSection + 1,
      totalSections: sections.length,
      sectionPercentage: ((currentSection + 1) / sections.length) * 100
    };
  }, [currentQuestionIndex, currentSection, responses, sections.length]);

  // Obtener pregunta y sección actual
  const currentQuestion = hineQuestionsData[currentQuestionIndex];
  const currentSectionData = sections[currentSection];

  return {
    // Estado
    responses,
    motorMilestones,
    behaviors,
    comments,
    patientData,
    currentQuestionIndex,
    currentSection,
    isComplete,
    currentQuestion,
    currentSectionData,
    sections,
    progress,
    results,

    // Acciones
    initializeResponses,
    updateResponse,
    updateMotorMilestone,
    updateBehavior,
    setComments,
    getResponse,
    getMotorMilestone,
    getBehavior,
    updatePatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    goToSection,
    completeAssessment,
    resetAssessment,

    // Utilidades
    isAllQuestionsAnswered,
    calculateTotalScore,
    calculateSectionScores,
    calculateAsymmetryCount,
    getDynamicInterpretation,
    getAsymmetryInterpretation,
    calculateAges
  };
}