
import { useState, useCallback, useMemo } from 'react';
import { useScalesStore } from '@/store/scales';
import { questions } from '@/data/fim';

interface PatientData {
  id?: string;
  name: string;
  age: string;
  gender: string;
  doctorName: string;
}

export function useFimAssessment() {
  const [currentStep, setCurrentStep] = useState<'form' | 'questions' | 'results'>('form');
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    doctorName: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const addRecentlyViewed = useScalesStore(state => state.addRecentlyViewed);

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('results');
      addRecentlyViewed('fim');
    }
  }, [currentQuestion, addRecentlyViewed]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const { totalScore, motorScore, cognitiveScore } = useMemo(() => {
    const motorItems = ['alimentacion', 'arreglo', 'bano', 'vestido_superior', 'vestido_inferior', 'aseo_perineal', 'miccion', 'defecacion', 'traslado_cama', 'traslado_bano', 'traslado_ducha', 'marcha', 'escaleras'];
    
    let motor = 0;
    let cognitive = 0;

    for (const q of questions) {
        const score = answers[q.id] || 0;
        if (motorItems.includes(q.id)) {
            motor += score;
        } else {
            cognitive += score;
        }
    }
    return { totalScore: motor + cognitive, motorScore: motor, cognitiveScore: cognitive };
  }, [answers]);

  const getInterpretation = useCallback((score?: number) => {
    const finalScore = score ?? totalScore;
    if (finalScore >= 108) return { level: 'Independencia completa o modificada', colorKey: 'scoreOptimal' };
    if (finalScore >= 72) return { level: 'Dependencia moderada', colorKey: 'scoreGood' };
    if (finalScore >= 36) return { level: 'Dependencia severa', colorKey: 'scoreMedium' };
    return { level: 'Dependencia completa', colorKey: 'scoreLow' };
  }, [totalScore]);

  const resetAssessment = useCallback(() => {
    setAnswers({});
    setCurrentQuestion(0);
    setCurrentStep('form');
    setPatientData({
        id: undefined,
        name: '',
        age: '',
        gender: '',
        doctorName: ''
    });
  }, []);

  return { 
    currentStep, 
    setCurrentStep, 
    patientData, 
    setPatientData, 
    currentQuestion, 
    answers, 
    handleAnswer, 
    nextQuestion, 
    prevQuestion, 
    totalScore, 
    motorScore, 
    cognitiveScore, 
    getInterpretation, 
    resetAssessment 
  };
}
