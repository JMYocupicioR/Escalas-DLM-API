// app/(tabs)/scales/ogs.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, User, Calendar, Stethoscope } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { ogsScale, ogsQuestions } from '@/data/ogs';
import { useOgsAssessment } from '@/hooks/useOgsAssessment';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';

export default function OgsScaleScreen() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [step, setStep] = useState<'form' | 'evaluation' | 'results'>('form');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('left');

  const {
    responses,
    patientData,
    currentQuestionIndex,
    isComplete,
    currentQuestion,
    progress,
    results,
    initializeResponses,
    updateResponse,
    getResponse,
    setPatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    completeAssessment,
    resetAssessment,
    isAllQuestionsAnswered
  } = useOgsAssessment();

  // Inicializar respuestas al cargar la evaluación
  useEffect(() => {
    if (step === 'evaluation') {
      initializeResponses();
    }
  }, [step, initializeResponses]);

  const handlePatientFormSubmit = useCallback((data: any) => {
    setPatientData(data);
    setStep('evaluation');
  }, [setPatientData]);

  const handleComplete = useCallback(() => {
    if (isAllQuestionsAnswered) {
      const assessmentResults = completeAssessment();
      if (assessmentResults) {
        setStep('results');
      }
    } else {
      Alert.alert(
        'Evaluación Incompleta',
        'Por favor, complete todas las preguntas para ambas extremidades antes de finalizar.',
        [{ text: 'Continuar', style: 'default' }]
      );
    }
  }, [isAllQuestionsAnswered, completeAssessment]);

  const handleReset = useCallback(() => {
    resetAssessment();
    setStep('form');
  }, [resetAssessment]);

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Datos del Paciente - OGS</Text>
        <PatientForm 
          scaleId="ogs" 
          onContinue={handlePatientFormSubmit}
          initialData={patientData}
        />
      </View>
    </ScrollView>
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentResponse = getResponse(currentQuestion.id);
    const selectedScore = selectedSide === 'left' ? currentResponse.leftScore : currentResponse.rightScore;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Pregunta {currentQuestionIndex + 1} de {ogsQuestions.length}
          </Text>
          <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
          <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
        </View>

        <View style={styles.sideSelector}>
          <TouchableOpacity
            style={[styles.sideButton, selectedSide === 'left' && styles.sideButtonSelected]}
            onPress={() => setSelectedSide('left')}
          >
            <Text style={[styles.sideButtonText, selectedSide === 'left' && styles.sideButtonTextSelected]}>
              Pierna Izquierda
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideButton, selectedSide === 'right' && styles.sideButtonSelected]}
            onPress={() => setSelectedSide('right')}
          >
            <Text style={[styles.sideButtonText, selectedSide === 'right' && styles.sideButtonTextSelected]}>
              Pierna Derecha
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedScore === option.option_value && styles.optionButtonSelected
              ]}
              onPress={() => updateResponse(currentQuestion.id, selectedSide, option.option_value)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIndicator}>
                  {selectedScore === option.option_value ? (
                    <CheckCircle size={20} color={colors.primary} />
                  ) : (
                    <Circle size={20} color={colors.border} />
                  )}
                </View>
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    selectedScore === option.option_value && styles.optionLabelSelected
                  ]}>
                    {option.option_label}
                  </Text>
                  <Text style={styles.optionScore}>
                    Puntuación: {option.option_value}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progreso: {progress.answeredQuestions} de {progress.total} preguntas completadas
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress.percentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderEvaluation = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.evaluationHeader}>
          <Text style={styles.title}>Evaluación OGS</Text>
          <Text style={styles.subtitle}>
            Evalúe cada parámetro para ambas extremidades
          </Text>
        </View>

        {renderQuestion()}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft size={20} color={currentQuestionIndex === 0 ? colors.mutedText : colors.primary} />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <View style={styles.questionDots}>
            {ogsQuestions.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentQuestionIndex && styles.dotActive,
                  getResponse(ogsQuestions[index].id).leftScore > 0 && 
                  getResponse(ogsQuestions[index].id).rightScore > 0 && styles.dotCompleted
                ]}
                onPress={() => goToQuestion(index)}
              />
            ))}
          </View>

          {currentQuestionIndex === ogsQuestions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.completeButton, !isAllQuestionsAnswered && styles.navButtonDisabled]}
              onPress={handleComplete}
              disabled={!isAllQuestionsAnswered}
            >
              <Text style={[styles.navButtonText, !isAllQuestionsAnswered && styles.navButtonTextDisabled]}>
                Finalizar
              </Text>
              <CheckCircle size={20} color={isAllQuestionsAnswered ? colors.primary : colors.mutedText} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextQuestion}
            >
              <Text style={styles.navButtonText}>Siguiente</Text>
              <ArrowRight size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderResults = () => {
    if (!results?.rightInterpretation || !results?.leftInterpretation) {
      return null;
    }

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Resultados OGS</Text>

          <View style={styles.patientInfo}>
            <View style={styles.patientInfoRow}>
              <User size={16} color={colors.primary} />
              <Text style={styles.patientInfoText}>{patientData.name}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Calendar size={16} color={colors.primary} />
              <Text style={styles.patientInfoText}>{patientData.date}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Stethoscope size={16} color={colors.primary} />
              <Text style={styles.patientInfoText}>{patientData.evaluator}</Text>
            </View>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Pierna Derecha</Text>
              <Text style={styles.resultScore}>
                {results.rightTotalScore} / 21
              </Text>
              <View style={[styles.resultBadge, { backgroundColor: results.rightInterpretation.color_code }]}>
                <Text style={styles.resultBadgeText}>
                  {results.rightInterpretation.interpretation_level}
                </Text>
              </View>
              <Text style={styles.resultDescription}>
                {results.rightInterpretation.interpretation_text}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Pierna Izquierda</Text>
              <Text style={styles.resultScore}>
                {results.leftTotalScore} / 21
              </Text>
              <View style={[styles.resultBadge, { backgroundColor: results.leftInterpretation.color_code }]}>
                <Text style={styles.resultBadgeText}>
                  {results.leftInterpretation.interpretation_level}
                </Text>
              </View>
              <Text style={styles.resultDescription}>
                {results.leftInterpretation.interpretation_text}
              </Text>
            </View>
          </View>

        <View style={styles.detailedResults}>
          <Text style={styles.detailedTitle}>Puntuación Detallada por Ítem</Text>
          {ogsQuestions.map((question, index) => {
            const response = getResponse(question.id);
            return (
              <View key={question.id} style={styles.detailedItem}>
                <Text style={styles.detailedQuestion}>{question.question}</Text>
                <View style={styles.detailedScores}>
                  <Text style={styles.detailedScore}>
                    D: {response.rightScore} | I: {response.leftScore}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.interpretationNote}>
          <Text style={styles.interpretationText}>
            <Text style={styles.interpretationBold}>Nota:</Text> La interpretación clínica debe centrarse en el perfil de puntuaciones de cada ítem, no solo en el total. Analice los patrones específicos de alteración para cada extremidad.
          </Text>
        </View>

        <ResultsActions
          assessment={{ 
            patientData: results.patientData, 
            score: `${results.rightTotalScore}/${results.leftTotalScore}`, 
            interpretation: `Derecha: ${results.rightInterpretation.interpretation_level} | Izquierda: ${results.leftInterpretation.interpretation_level}` 
          }}
          scale={{ id: 'ogs', name: ogsScale.name } as any}
        />

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Nueva Evaluación</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: ogsScale.name, 
          headerShown: true, 
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container}>
        {step === 'form' && renderForm()}
        {step === 'evaluation' && renderEvaluation()}
        {step === 'results' && renderResults()}
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
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 20,
  },
  evaluationHeader: {
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    color: colors.mutedText,
    lineHeight: 20,
  },
  sideSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  sideButtonSelected: {
    backgroundColor: colors.primary,
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sideButtonTextSelected: {
    color: colors.buttonPrimaryText,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  optionScore: {
    fontSize: 14,
    color: colors.mutedText,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  navButtonDisabled: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonPrimaryText,
  },
  navButtonTextDisabled: {
    color: colors.mutedText,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  questionDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  patientInfo: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientInfoText: {
    fontSize: 14,
    color: colors.text,
  },
  resultsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  resultDescription: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },
  detailedResults: {
    marginBottom: 20,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailedQuestion: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  detailedScores: {
    marginLeft: 12,
  },
  detailedScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  interpretationNote: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  interpretationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  interpretationBold: {
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
