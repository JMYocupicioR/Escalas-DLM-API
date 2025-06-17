import { useState, useCallback } from 'react';
import { Assessment } from '@/types/question';
import { scoreInterpretation } from '@/data/boston';

interface BostonAssessmentHook {
  patientData: Assessment['patientData'];
  currentStep: 'form' | 'symptoms' | 'function' | 'results';
  currentQuestion: number;
  symptomsAnswers: Record<string, number>;
  functionAnswers: Record<string, number>;
  handlePatientDataChange: (field: keyof Assessment['patientData']) => (value: string) => void;
  handleSymptomAnswer: (questionId: string, value: number) => void;
  handleFunctionAnswer: (questionId: string, value: number) => void;
  calculateScores: () => { symptom: number; functional: number };
  getInterpretations: () => { symptom: string; functional: string };
  validateForm: () => boolean;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setCurrentStep: (step: 'form' | 'symptoms' | 'function' | 'results') => void;
  resetAssessment: () => void;
}

export function useBostonAssessment(): BostonAssessmentHook {
  const [patientData, setPatientData] = useState<Assessment['patientData']>({
    name: '',
    age: '',
    gender: '',
    dominantHand: '',
    affectedHand: '',
    duration: '',
    doctorName: '',
  });

  const [currentStep, setCurrentStep] = useState<'form' | 'symptoms' | 'function' | 'results'>('form');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [symptomsAnswers, setSymptomsAnswers] = useState<Record<string, number>>({});
  const [functionAnswers, setFunctionAnswers] = useState<Record<string, number>>({});

  const handlePatientDataChange = useCallback((field: keyof Assessment['patientData']) => (value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSymptomAnswer = useCallback((questionId: string, value: number) => {
    setSymptomsAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleFunctionAnswer = useCallback((questionId: string, value: number) => {
    setFunctionAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const calculateScores = useCallback(() => {
    const symptomScore = Object.values(symptomsAnswers).reduce((sum, val) => sum + val, 0) / 
                        Object.values(symptomsAnswers).length;
    
    const functionScore = Object.values(functionAnswers).reduce((sum, val) => sum + val, 0) / 
                         Object.values(functionAnswers).length;

    return {
      symptom: Number(symptomScore.toFixed(2)),
      functional: Number(functionScore.toFixed(2))
    };
  }, [symptomsAnswers, functionAnswers]);

  const getInterpretations = useCallback(() => {
    const scores = calculateScores();

    const getInterpretation = (score: number, type: 'symptomSeverity' | 'functionalStatus') => {
      const interpretation = scoreInterpretation[type].find(
        range => score >= range.min && score <= range.max
      );
      return interpretation?.level || 'No determinado';
    };

    return {
      symptom: getInterpretation(scores.symptom, 'symptomSeverity'),
      functional: getInterpretation(scores.functional, 'functionalStatus')
    };
  }, [calculateScores]);

  const validateForm = useCallback(() => {
    const requiredFields: (keyof Assessment['patientData'])[] = [
      'name', 'age', 'gender', 'affectedHand', 'doctorName'
    ];
    return requiredFields.every(field => patientData[field].trim() !== '');
  }, [patientData]);

  const nextQuestion = useCallback(() => {
    if (currentStep === 'symptoms') {
      if (currentQuestion < symptomSeverityQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCurrentStep('function');
        setCurrentQuestion(0);
      }
    } else if (currentStep === 'function') {
      if (currentQuestion < functionalStatusQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCurrentStep('results');
      }
    }
  }, [currentStep, currentQuestion]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentStep === 'function') {
      setCurrentStep('symptoms');
      setCurrentQuestion(symptomSeverityQuestions.length - 1);
    }
  }, [currentStep, currentQuestion]);

  const resetAssessment = useCallback(() => {
    setPatientData({
      name: '',
      age: '',
      gender: '',
      dominantHand: '',
      affectedHand: '',
      duration: '',
      doctorName: '',
    });
    setSymptomsAnswers({});
    setFunctionAnswers({});
    setCurrentQuestion(0);
    setCurrentStep('form');
  }, []);

  return {
    patientData,
    currentStep,
    currentQuestion,
    symptomsAnswers,
    functionAnswers,
    handlePatientDataChange,
    handleSymptomAnswer,
    handleFunctionAnswer,
    calculateScores,
    getInterpretations,
    validateForm,
    nextQuestion,
    prevQuestion,
    setCurrentStep,
    resetAssessment,
  };
}