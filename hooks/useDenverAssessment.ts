import { useState, useMemo, useCallback } from 'react';
import { denverItems, type DenverItem } from '@/data/denver';

// Definición de tipos para mayor claridad y seguridad
type DenverStep = 'form' | 'Motor Grueso' | 'Motor Fino-Adaptativo' | 'Personal-Social' | 'Lenguaje' | 'results';
type DenverAnswer = 'P' | 'F' | 'R' | 'NO';

// El tipo DenverItem se comparte desde '@/data/denver'

// Estructura mejorada de resultados con información clínica detallada
export interface DenverAreaResult {
  delays: DenverItem[];
  cautions: DenverItem[];
  normalItems: DenverItem[];
  refusals: DenverItem[];
  totalEvaluated: number;
  severityLevel: 'Normal' | 'Leve' | 'Moderado' | 'Severo';
  clinicalRecommendation: string;
}

export interface DenverResults {
  overallInterpretation: 'Normal' | 'Sospechoso' | 'No Evaluable';
  recommendation: string;
  ageInfo: {
    chronologicalAgeMonths: number;
    adjustedAgeMonths: number;
    wasPremature: boolean;
    gestationalWeeks: number;
  };
  counts: {
    delays: number;
    cautions: number;
    refusals: number;
    totalEvaluated: number;
  };
  // ✨ LA MEJORA CLAVE: Resultados detallados por área
  areaResults: {
    [area: string]: DenverAreaResult;
  };
  // Información adicional para el reporte médico
  clinicalContext: {
    riskFactors: string[];
    strengthAreas: string[];
    priorityActions: string[];
    followUpPlan: string;
  };
}

interface DenverPatientData {
 name: string;
 examiner: string;
 birthDate: string;
 gestationalWeeks: string;
}

// Constante para los dominios de la evaluación
const DOMAINS: DenverStep[] = ['Motor Grueso', 'Motor Fino-Adaptativo', 'Personal-Social', 'Lenguaje'];

/**
 * Hook personalizado para gestionar la lógica completa del Test de Denver II.
 */
export function useDenverAssessment() {
 const [currentStep, setCurrentStep] = useState<DenverStep>('form');
 const [patientData, setPatientData] = useState<DenverPatientData>({
 name: '',
   examiner: '',
   birthDate: '',
   gestationalWeeks: '',
  });
  const [answers, setAnswers] = useState<Record<string, DenverAnswer>>({});
  const [ageForEval, setAgeForEval] = useState(0); // Edad para evaluación en meses

 /**
   * Calcula la edad cronológica.
   */
  const calculateAge = (birthDate: Date, testDate: Date = new Date()) => {
    let years = testDate.getFullYear() - birthDate.getFullYear();
    let months = testDate.getMonth() - birthDate.getMonth();
    let days = testDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(testDate.getFullYear(), testDate.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    // Se utiliza 30.44 como el promedio de días en un mes para mayor precisión
    return { years, months, days, totalInMonths: (years * 12) + months + (days / 30.44) };
  };

  /**
   * Inicia la evaluación, calcula la edad corregida y pasa al primer panel.
   */
  const startEvaluation = useCallback(() => {
    const birthDate = new Date(patientData.birthDate + 'T00:00:00');
    const weeksGestation = parseInt(patientData.gestationalWeeks, 10);
    const ageChronological = calculateAge(birthDate);
    let adjustedAgeInMonths = ageChronological.totalInMonths;

    // --- CORRECCIÓN CLÍNICA 1: Cálculo de Edad Ajustada ---
    // La corrección solo se aplica a niños menores de 24 meses.
    // Se calcula la prematuridad en meses y se resta de la edad cronológica.
    if (ageChronological.totalInMonths < 24) {
      const weeksPremature = 40 - weeksGestation;
      if (weeksPremature > 2) {
        const monthsToSubtract = weeksPremature / 4.345; // Promedio de semanas en un mes
        adjustedAgeInMonths = ageChronological.totalInMonths - monthsToSubtract;
      }
    }
    
    setAgeForEval(Math.max(0, adjustedAgeInMonths)); // Asegura que la edad no sea negativa
    setCurrentStep('Motor Grueso');
  }, [patientData]);

  /**
   * Filtra los ítems relevantes para la edad del niño y el panel actual.
   * `useMemo` evita recálculos innecesarios.
   */
  const relevantQuestions = useMemo(() => {
    if (currentStep === 'form' || currentStep === 'results') return [];
    
    const domainItems = denverItems.filter(q => q.domain === currentStep);
    // El filtro de relevancia simula la "línea de edad" de la prueba en papel.
    return domainItems.filter(q => {
      const [p25, , , p90] = q.percentiles;
      return ageForEval >= (p25 - 4) && ageForEval <= (p90 + 4);
    });
  }, [currentStep, ageForEval]);

  /**
   * Almacena la respuesta para un ítem específico.
   */
  const handleAnswer = (questionId: string, answer: DenverAnswer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  /**
   * Navega al siguiente panel de la evaluación.
   */
  const nextStep = () => {
    const currentIndex = DOMAINS.indexOf(currentStep as DenverStep);
    if (currentIndex < DOMAINS.length - 1) {
      setCurrentStep(DOMAINS[currentIndex + 1]);
    } else {
      setCurrentStep('results');
    }
  };
  
  /**
   * Navega al panel anterior.
   */
  const prevStep = () => {
    const currentIndex = DOMAINS.indexOf(currentStep as DenverStep);
    if (currentIndex > 0) {
      setCurrentStep(DOMAINS[currentIndex - 1]);
    } else {
      setCurrentStep('form');
    }
  };

  /**
   * Función auxiliar para determinar la severidad de un área basada en retrasos y precauciones
   */
  const getAreaSeverity = (delays: number, cautions: number): 'Normal' | 'Leve' | 'Moderado' | 'Severo' => {
    if (delays === 0 && cautions === 0) return 'Normal';
    
    if (delays >= 2) return 'Severo';
    if (delays === 1 && cautions >= 2) return 'Moderado';
    if (delays === 1 || cautions >= 3) return 'Moderado';
    if (cautions >= 1) return 'Leve';
    
    return 'Normal';
  };

  /**
   * Función auxiliar para generar recomendaciones clínicas específicas por área
   */
  const getAreaRecommendation = (area: string, severity: string): string => {
    const recommendations: Record<string, Record<string, string>> = {
      'Personal-Social': {
        'Leve': 'Fomentar interacción social, juegos cooperativos y actividades que promuevan la autonomía.',
        'Moderado': 'Evaluación por trabajo social o psicología pediátrica. Considerar programas de estimulación social.',
        'Severo': 'Derivación urgente a especialista en desarrollo infantil. Descartar trastornos del espectro autista.'
      },
      'Lenguaje': {
        'Leve': 'Estimulación del lenguaje en casa, lectura diaria, conversación frecuente.',
        'Moderado': 'Evaluación audiológica y por terapia de lenguaje. Programa de estimulación del lenguaje.',
        'Severo': 'Evaluación integral por equipo multidisciplinario. Descartar problemas de audición y trastornos del lenguaje.'
      },
      'Motor Fino-Adaptativo': {
        'Leve': 'Actividades de motricidad fina: dibujo, rompecabezas, juegos de construcción.',
        'Moderado': 'Evaluación por terapia ocupacional. Programa de estimulación psicomotriz.',
        'Severo': 'Evaluación neurológica y por terapia ocupacional. Descartar alteraciones neuromotoras.'
      },
      'Motor Grueso': {
        'Leve': 'Actividades físicas apropiadas para la edad, juegos al aire libre, deportes adaptados.',
        'Moderado': 'Evaluación por fisioterapia. Programa de estimulación motora gruesa.',
        'Severo': 'Evaluación neurológica y ortopédica. Descartar patologías neuromusculares.'
      }
    };

    return recommendations[area]?.[severity] || 'Monitoreo continuo del desarrollo en esta área.';
  };

  /**
   * Calcula los resultados finales detallados basándose en las respuestas.
   * Versión mejorada que proporciona análisis completo por área de desarrollo.
   */
  const calculateResults = useCallback((): DenverResults => {
    // Inicializar estructura de resultados por área
    const areaResults: DenverResults['areaResults'] = {
      'Personal-Social': { delays: [], cautions: [], normalItems: [], refusals: [], totalEvaluated: 0, severityLevel: 'Normal', clinicalRecommendation: '' },
      'Motor Fino-Adaptativo': { delays: [], cautions: [], normalItems: [], refusals: [], totalEvaluated: 0, severityLevel: 'Normal', clinicalRecommendation: '' },
      'Lenguaje': { delays: [], cautions: [], normalItems: [], refusals: [], totalEvaluated: 0, severityLevel: 'Normal', clinicalRecommendation: '' },
      'Motor Grueso': { delays: [], cautions: [], normalItems: [], refusals: [], totalEvaluated: 0, severityLevel: 'Normal', clinicalRecommendation: '' },
    };

    let totalRefusals = 0;
    let refusalOnDelayItem = 0;
    let refusalOnCautionItem = 0;
    let totalEvaluated = 0;

    // Procesar cada ítem del test
    denverItems.forEach(item => {
      const answer = answers[item.id];
      
      // Si no hay respuesta o es 'NO' (sin oportunidad), no se evalúa
      if (!answer || answer === 'NO') return;
      
      const [ , , p75, p90] = item.percentiles;
      const area = item.domain;
      
      // Incrementar contador de ítems evaluados
      areaResults[area].totalEvaluated++;
      totalEvaluated++;

      if (answer === 'P') {
        // Ítem pasado correctamente
        areaResults[area].normalItems.push(item);
      } else if (answer === 'F') {
        // Ítem fallado - clasificar según edad
        if (ageForEval > p90) {
          areaResults[area].delays.push(item);
        } else if (ageForEval > p75) {
          areaResults[area].cautions.push(item);
        } else {
          areaResults[area].normalItems.push(item);
        }
      } else if (answer === 'R') {
        // Ítem rehusado - clasificar para interpretación
        areaResults[area].refusals.push(item);
        totalRefusals++;
        
        if (ageForEval > p90) {
          refusalOnDelayItem++;
        } else if (ageForEval > p75) {
          refusalOnCautionItem++;
        }
      }
    });

    // Calcular severidad y recomendaciones por área
    Object.keys(areaResults).forEach(area => {
      const areaData = areaResults[area];
      areaData.severityLevel = getAreaSeverity(
        areaData.delays.length,
        areaData.cautions.length
      );
      areaData.clinicalRecommendation = getAreaRecommendation(
        area, 
        areaData.severityLevel
      );
    });

    // Calcular totales generales
    const totalDelays = Object.values(areaResults).reduce((sum, area) => sum + area.delays.length, 0) + refusalOnDelayItem;
    const totalCautions = Object.values(areaResults).reduce((sum, area) => sum + area.cautions.length, 0) + refusalOnCautionItem;

    // Determinar interpretación general
    const isUntestable = refusalOnDelayItem >= 1 || refusalOnCautionItem >= 2;
    const isSuspicious = (totalDelays >= 2) || (totalDelays >= 1 && totalCautions >= 2) || (totalCautions >= 3);

    let interpretation: DenverResults['overallInterpretation'];
    let recommendation: string;

    if (isUntestable) {
      interpretation = "No Evaluable";
      recommendation = "El niño se ha negado a intentar ítems clave. Se recomienda volver a administrar la prueba en 1-2 semanas para obtener un resultado válido.";
    } else if (isSuspicious) {
      interpretation = "Sospechoso";
      recommendation = "El resultado indica una posible preocupación en el desarrollo. Se recomienda reevaluar en 1-2 semanas. Si persiste, derivar para evaluación diagnóstica completa.";
    } else {
      interpretation = "Normal";
      recommendation = "El desarrollo del niño se considera apropiado para la edad. Realizar el tamizaje de rutina en la siguiente visita de control.";
    }

    // Calcular información de edad
    const birthDate = new Date(patientData.birthDate + 'T00:00:00');
    const chronologicalAge = calculateAge(birthDate);
    const weeksGestation = parseInt(patientData.gestationalWeeks, 10);
    const wasPremature = weeksGestation < 37;

    // Generar contexto clínico
    const strengthAreas = Object.keys(areaResults).filter(area => 
      areaResults[area].severityLevel === 'Normal'
    );
    
    const concernAreas = Object.keys(areaResults).filter(area => 
      areaResults[area].severityLevel !== 'Normal'
    );

    const riskFactors = [];
    if (wasPremature) riskFactors.push(`Prematuridad (${weeksGestation} semanas)`);
    if (totalRefusals > 3) riskFactors.push('Múltiples rehusos - considerar factores conductuales');
    
    const priorityActions = concernAreas.map(area => 
      `${area}: ${areaResults[area].clinicalRecommendation}`
    );

    let followUpPlan = '';
    if (interpretation === 'Sospechoso') {
      followUpPlan = 'Re-evaluación en 1-2 semanas. Si persisten las alteraciones, derivar para evaluación especializada.';
    } else if (interpretation === 'Normal') {
      followUpPlan = 'Seguimiento rutinario según cronograma de control de niño sano.';
    } else {
      followUpPlan = 'Nueva aplicación del test en 1-2 semanas en condiciones óptimas.';
    }

    return {
      overallInterpretation: interpretation,
      recommendation,
      ageInfo: {
        chronologicalAgeMonths: chronologicalAge.totalInMonths,
        adjustedAgeMonths: ageForEval,
        wasPremature,
        gestationalWeeks: weeksGestation
      },
      counts: {
        delays: totalDelays,
        cautions: totalCautions,
        refusals: totalRefusals,
        totalEvaluated
      },
      areaResults,
      clinicalContext: {
        riskFactors,
        strengthAreas,
        priorityActions,
        followUpPlan
      }
    };
  }, [answers, ageForEval, patientData]);

  /**
   * Calcula el progreso de la evaluación para la barra de progreso.
   */
  const progress = useMemo(() => {
    const currentIndex = DOMAINS.indexOf(currentStep as DenverStep);
    if (currentIndex === -1) {
        return currentStep === 'results' ? 100 : 0;
    }
    return ((currentIndex + 1) / DOMAINS.length) * 100;
  }, [currentStep]);

  return {
    currentStep,
    patientData,
    setPatientData,
    answers,
    startEvaluation,
    relevantQuestions,
    handleAnswer,
    nextStep,
    prevStep,
    calculateResults,
    progress,
    ageForEval
  };
}
