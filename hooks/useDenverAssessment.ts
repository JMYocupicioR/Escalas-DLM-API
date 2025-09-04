import { useState, useMemo, useCallback } from 'react';
import { denverItems } from '@/data/denver';

// Definición de tipos para mayor claridad y seguridad
type DenverStep = 'form' | 'Motor Grueso' | 'Motor Fino-Adaptativo' | 'Personal-Social' | 'Lenguaje' | 'results';
type DenverAnswer = 'P' | 'F' | 'R' | 'NO';

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
      const [p25, _, __, p90] = q.percentiles;
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
   * Calcula los resultados finales basándose en las respuestas.
   * `useCallback` memoriza la función para optimizar el rendimiento.
   */
  const calculateResults = useCallback(() => {
    let cautions = 0;
    let delays = 0;
    let refusalOnDelayItem = 0;
    let refusalOnCautionItem = 0;

    denverItems.forEach(q => {
      const answer = answers[q.id];
      // Ignorar ítems no respondidos, pasados o sin oportunidad
      if (!answer || answer === 'P' || answer === 'NO') return;

      const [_, __, p75, p90] = q.percentiles;

      // Clasificar Fallos (F) y Rehusos (R)
      if (answer === 'F') {
        if (ageForEval > p90) delays++;
        else if (ageForEval > p75) cautions++;
      } else if (answer === 'R') {
        if (ageForEval > p90) refusalOnDelayItem++;
        else if (ageForEval > p75) refusalOnCautionItem++;
      }
    });
    
    // Los rehusos en ítems clave se cuentan como fallos para la interpretación final
    const totalDelays = delays + refusalOnDelayItem;
    const totalCautions = cautions + refusalOnCautionItem;
    
    let interpretation: string;
    let recommendation: string;

    // --- CORRECCIÓN CLÍNICA 2: Lógica de Interpretación Unificada ---
    // Se definen las condiciones exactas para cada resultado según las guías clínicas.
    // La categoría "Sospechoso" ahora incluye todas las reglas en una sola condición.
    const isUntestable = refusalOnDelayItem >= 1 || refusalOnCautionItem >= 2;
    const isSuspicious = (totalDelays >= 2) || (totalDelays >= 1 && totalCautions >= 2) || (totalCautions >= 3);

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
    
    return { delays: totalDelays, cautions: totalCautions, interpretation, recommendation, ageForEval };
  }, [answers, ageForEval]);

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
