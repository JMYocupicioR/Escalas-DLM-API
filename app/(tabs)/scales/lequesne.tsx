import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { lequesneQuestions, getLequesneInterpretation } from '@/data/lequesne';
import { useScalesStore } from '@/store/scales';
import { ResultsActions } from '@/components/ResultsActions';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

function useLequesneAssessment() {
  const [currentStep, setCurrentStep] = useState<'form' | 'questions' | 'results'>('form');
  const [patientData, setPatientData] = useState({ name: '', age: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const addRecentlyViewed = useScalesStore(state => state.addRecentlyViewed);
  
  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < lequesneQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCurrentStep('results');
      }
    }, 500);
  }, [currentQuestion]);
  
  const nextQuestion = useCallback(() => {
    if (currentQuestion < lequesneQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion]);
  
  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);
  
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0);
  }, [answers]);
  
  const getInterpretation = useCallback(() => {
    return getLequesneInterpretation(totalScore);
  }, [totalScore]);
  
  const resetAssessment = useCallback(() => {
    setCurrentStep('form');
    setCurrentQuestion(0);
    setAnswers({});
    setPatientData({ name: '', age: '' });
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
    getInterpretation,
    resetAssessment
  };
}

const ScoreButton = ({ score, selectedScore, onSelect, colors }: any) => (
  <TouchableOpacity
    style={[
      styles.scoreButton,
      { borderColor: colors.border },
      selectedScore === score && { backgroundColor: colors.primary, borderColor: colors.primary }
    ]}
    onPress={() => onSelect(score)}
  >
    <Text style={[
      styles.scoreButtonText,
      { color: selectedScore === score ? colors.white : colors.text }
    ]}>
      {score}
    </Text>
  </TouchableOpacity>
);

export default function LequesneScaleScreen() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const {
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
    getInterpretation,
    resetAssessment
  } = useLequesneAssessment();

  const handleExport = async () => {
    Alert.alert(
      'Función en desarrollo', 
      'La exportación PDF para esta escala está siendo actualizada. Estará disponible pronto.'
    );
  };

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Datos del Paciente</Text>
        <PatientForm
          scaleId="lequesne-rodilla-es-v1"
          onContinue={(data) => {
            setPatientData(data);
            setCurrentStep('questions');
          }}
          allowSkip
        />
      </View>
    </ScrollView>
  );

  const renderQuestions = () => {
    const question = lequesneQuestions[currentQuestion];
    const selectedScore = answers[question.id];
    const progress = ((currentQuestion + 1) / lequesneQuestions.length) * 100;
    
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Pregunta {currentQuestion + 1} de {lequesneQuestions.length}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{question.question}</Text>
            {question.description && (
              <Text style={styles.questionDescription}>{question.description}</Text>
            )}
            
            <View style={styles.optionsContainer}>
              {question.options.map((option) => (
                <ScoreButton
                  key={option.value}
                  score={option.value}
                  selectedScore={selectedScore}
                  onSelect={(value: number) => handleAnswer(question.id, value)}
                  colors={colors}
                />
              ))}
            </View>
            
            <Text style={styles.optionLabel}>
              {question.options.find(opt => opt.value === selectedScore)?.label || 'Seleccione una opción'}
            </Text>
          </View>
          
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.border }]}
              onPress={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft color={colors.text} size={20} />
              <Text style={[styles.navButtonText, { color: colors.text }]}>Anterior</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={nextQuestion}
              disabled={currentQuestion === lequesneQuestions.length - 1}
            >
              <Text style={[styles.navButtonText, { color: colors.white }]}>Siguiente</Text>
              <ArrowRight color={colors.white} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderResults = () => {
    const interpretation = getInterpretation();
    
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>Resultados del Índice de Lequesne</Text>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Puntaje Total</Text>
            <Text style={styles.scoreValue}>{totalScore.toFixed(1)} / 26</Text>
            <Text style={styles.scoreInterpretation}>
              {interpretation.level}: {interpretation.explanation}
            </Text>
          </View>
          
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>Recomendación</Text>
            <Text style={styles.recommendationText}>{interpretation.recommendation}</Text>
          </View>
          
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Detalles por Pregunta</Text>
            {lequesneQuestions.map((question) => {
              const answer = answers[question.id];
              const option = question.options.find(opt => opt.value === answer);
              return (
                <View key={question.id} style={styles.detailItem}>
                  <Text style={styles.detailQuestion}>{question.question}</Text>
                  <Text style={styles.detailAnswer}>
                    {option ? `${option.label} (${answer} puntos)` : 'No respondida'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        
        <ResultsActions
          scale={{ id: 'lequesne-rodilla-es-v1', name: 'Índice de Lequesne' } as any}
          assessment={{
            score: totalScore,
            interpretation: interpretation.level,
            answers: Object.entries(answers).map(([key, value]) => ({
              id: key,
              question: lequesneQuestions.find(q => q.id === key)?.question || key,
              value: value,
            })),
            patientData,
          }}
          onRestart={resetAssessment}
          onExport={handleExport}
        />
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Índice de Lequesne', 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container}>
        {currentStep === 'form' && renderForm()}
        {currentStep === 'questions' && renderQuestions()}
        {currentStep === 'results' && renderResults()}
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  questionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  scoreButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  scoreButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  scoreInterpretation: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailQuestion: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
