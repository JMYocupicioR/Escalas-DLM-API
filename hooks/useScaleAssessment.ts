// hooks/useScaleAssessment.ts
import { useState } from 'react';
import { Assessment } from '@/types/question';
import { Scale } from '@/types/scale';
import { saveLocalAssessment, generateAndSharePDF } from '@/api';

export const useScaleAssessment = (scale: Scale) => {
  const [assessment, setAssessment] = useState<Partial<Assessment>>({
    scaleId: scale.id,
    patientData: {
      name: '',
      age: '',
      gender: '',
      doctorName: ''
    },
    answers: {},
  });
  
  const [step, setStep] = useState<'form' | 'questions' | 'results'>('form');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const updatePatientData = (field: string, value: string) => {
    setAssessment(prev => ({
      ...prev,
      patientData: {
        ...prev.patientData!,
        [field]: value
      }
    }));
  };
  
  const recordAnswer = (questionId: string, value: number) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers!,
        [questionId]: value
      }
    }));
  };
  
  const calculateResult = () => {
    // Lógica para calcular el puntaje total e interpretación
    const score = Object.values(assessment.answers || {}).reduce((sum, val) => sum + val, 0);
    let interpretation = '';
    
    // Lógica para determinar interpretación según el tipo de escala
    if (scale.id === 'barthel') {
      if (score < 45) interpretation = 'Incapacidad funcional Severa';
      else if (score < 60) interpretation = 'Incapacidad funcional Grave';
      else if (score < 80) interpretation = 'Incapacidad funcional Moderada';
      else if (score < 100) interpretation = 'Incapacidad funcional Ligera';
      else interpretation = 'Independencia completa';
    }
    // Añadir más lógica para otras escalas
    
    // Actualizar assessment con resultados
    setAssessment(prev => ({
      ...prev,
      score,
      interpretation
    }));
    
    return { score, interpretation };
  };
  
  const finishAssessment = async () => {
    const { score, interpretation } = calculateResult();
    
    // Completar la información del assessment
    const completeAssessment: Assessment = {
      ...(assessment as Assessment),
      id: '',  // Se generará en saveLocalAssessment
      score,
      interpretation,
      date: new Date()
    };
    
    // Guardar localmente
    await saveLocalAssessment(completeAssessment);
    
    // Avanzar a pantalla de resultados
    setStep('results');
  };
  
  const exportResults = async () => {
    if (!assessment.score || !assessment.interpretation) {
      calculateResult();
    }
    
    return generateAndSharePDF(assessment as Assessment, scale);
  };
  
  const resetAssessment = () => {
    setAssessment({
      scaleId: scale.id,
      patientData: {
        name: '',
        age: '',
        gender: '',
        doctorName: ''
      },
      answers: {},
    });
    setStep('form');
    setCurrentQuestion(0);
  };
  
  return {
    assessment,
    step,
    currentQuestion,
    updatePatientData,
    recordAnswer,
    calculateResult,
    finishAssessment,
    exportResults,
    resetAssessment,
    setStep,
    setCurrentQuestion
  };
};