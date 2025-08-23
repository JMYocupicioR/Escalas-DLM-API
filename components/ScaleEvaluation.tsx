import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ScaleWithDetails, ScaleAssessmentRequest } from '@/api/scales/types';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import LoadingState from '@/components/errors/LoadingState';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { ScoringRange } from '@/api/scales/types';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';

interface ScaleEvaluationProps {
  scale: ScaleWithDetails;
  onCancel: () => void;
  patientRequired?: boolean;
}

type Interpretation = {
  level: string;
  text: string;
  recommendations?: string;
  colorCode?: string;
};

interface EvaluationState {
  currentStep: 'patient' | 'evaluation' | 'results';
  currentQuestionIndex: number;
  responses: Record<string, number | string>;
  startTime: Date;
  endTime?: Date;
  totalScore?: number;
  interpretation?: Interpretation | null;
}

export const ScaleEvaluation: React.FC<ScaleEvaluationProps> = ({
  scale,
  onCancel,
  patientRequired = false,
}) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const { isDesktop, isTablet } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors, isDesktop || isTablet, fontSizeMultiplier), [colors, isDesktop, isTablet, fontSizeMultiplier]);
  
  const [state, setState] = useState<EvaluationState>({
    currentStep: patientRequired ? 'patient' : 'evaluation',
    currentQuestionIndex: 0,
    responses: {},
    startTime: new Date(),
  });

  const [animatedValue] = useState(new Animated.Value(0));
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedQuestions = useMemo(() => {
    return [...scale.questions].sort((a, b) => a.order_index - b.order_index);
  }, [scale.questions]);

  const currentQuestion = sortedQuestions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / sortedQuestions.length) * 100;

  // Progress animation
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleAnswerSelect = useCallback((value: number | string) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestion.question_id]: value,
      },
    }));
  }, [currentQuestion?.question_id]);

  const handleNext = useCallback(() => {
    if (state.currentQuestionIndex < sortedQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      // Calculate final score and show results
      calculateResults();
    }
  }, [state.currentQuestionIndex, sortedQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  const calculateResults = useCallback(() => {
    if (!scale.scoring) {
      Alert.alert('Error', 'Esta escala no tiene sistema de puntuación configurado');
      return;
    }

    let totalScore = 0;
    const scoring = scale.scoring;

    // Calculate based on scoring method
    switch (scoring.scoring_method) {
      case 'sum':
        totalScore = Object.values(state.responses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
        break;
        
      case 'average':
        const numericValues = Object.values(state.responses)
          .filter((value): value is number => typeof value === 'number');
        totalScore = numericValues.length > 0 
          ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
          : 0;
        break;
        
      case 'weighted':
        // Si no hay pesos definidos en el modelo, utilizar suma como fallback
        totalScore = Object.values(state.responses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
        break;
        
      default:
        totalScore = Object.values(state.responses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
    }

    // Find interpretation based on scoring ranges
    const interpretation = findInterpretation(totalScore, scoring.ranges);

    setState(prev => ({
      ...prev,
      currentStep: 'results',
      endTime: new Date(),
      totalScore,
      interpretation,
    }));
  }, [scale.scoring, state.responses]);

  const findInterpretation = (score: number, ranges: ScoringRange[]) => {
    const matchingRange = ranges.find(range => 
      score >= range.min_value && score <= range.max_value
    );
    
    return matchingRange ? ({
      level: matchingRange.interpretation_level,
      text: matchingRange.interpretation_text,
      recommendations: matchingRange.recommendations,
      colorCode: matchingRange.color_code,
    } as Interpretation) : null;
  };

  // En esta pantalla no se envía aún al backend de evaluaciones; se puede implementar según API

  const renderPatientStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información del Paciente</Text>
      <PatientForm
        scaleId={scale.id}
        onContinue={() => setState(prev => ({ ...prev, currentStep: 'evaluation' }))}
        allowSkip={!patientRequired}
      />
    </View>
  );

  const renderEvaluationStep = () => {
    if (!currentQuestion) {
      return <LoadingState message="Cargando pregunta..." />;
    }

    const selectedValue = state.responses[currentQuestion.question_id];
    const sortedOptions = [...currentQuestion.options].sort((a, b) => a.order_index - b.order_index);

    return (
      <View style={styles.stepContainer}>
        {/* Progress Bar & Question Title for Mobile */}
        {!isDesktop && !isTablet && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { 
                      width: animatedValue.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      })
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {state.currentQuestionIndex + 1} de {sortedQuestions.length}
              </Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.questionTitle}>{currentQuestion.question_text}</Text>
            </View>
          </>
        )}
        
        <View style={styles.evaluationGrid}>
          {/* Question (Left Column on Desktop/Tablet) */}
          {(isDesktop || isTablet) && (
            <View style={styles.questionPanel}>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Pregunta {state.currentQuestionIndex + 1} de {sortedQuestions.length}
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View 
                    style={[
                      styles.progressBar,
                      { 
                        width: animatedValue.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        })
                      }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.questionTitle}>{currentQuestion.question_text}</Text>
              {currentQuestion.description && (
                <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
              )}
              {currentQuestion.instructions && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsLabel}>Instrucciones:</Text>
                  <Text style={styles.instructionsText}>{currentQuestion.instructions}</Text>
                </View>
              )}
            </View>
          )}

          {/* Options (Right Column on Desktop/Tablet) */}
          <ScrollView style={styles.optionsPanel} showsVerticalScrollIndicator={false}>
            {sortedOptions.map((option) => {
              const isSelected = selectedValue === option.option_value;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(option.option_value)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionIndicator,
                      isSelected && styles.optionIndicatorSelected,
                    ]}>
                      {isSelected && <View style={styles.optionIndicatorDot} />}
                    </View>
                    
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}>
                        {option.option_label}
                      </Text>
                      {option.option_description && !isDesktop && (
                        <Text style={[
                          styles.optionDescription,
                          isSelected && styles.optionDescriptionSelected,
                        ]}>
                          {option.option_description}
                        </Text>
                      )}
                    </View>
                    
                    <Text style={[
                      styles.optionValue,
                      isSelected && styles.optionValueSelected,
                    ]}>
                      {option.option_value}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonSecondary,
              state.currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={state.currentQuestionIndex === 0}
          >
            <ArrowLeft size={18} color={state.currentQuestionIndex === 0 ? colors.mutedText : colors.buttonSecondaryText} />
            <Text style={[
              styles.navButtonText,
              styles.navButtonTextSecondary,
              state.currentQuestionIndex === 0 && { color: colors.mutedText },
            ]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              !selectedValue && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedValue}
          >
            <Text style={[
              styles.navButtonText,
              styles.navButtonTextPrimary,
              !selectedValue && { color: colors.mutedText },
            ]}>
              {state.currentQuestionIndex === sortedQuestions.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Text>
            <ArrowRight size={18} color={!selectedValue ? colors.mutedText : colors.buttonPrimaryText} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResultsStep = () => (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.resultsHeader}
        >
          <Text style={styles.resultsTitle}>Evaluación Completada</Text>
          <Text style={styles.scaleName}>{scale.name}</Text>
        </LinearGradient>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Puntuación Total</Text>
          <Text style={styles.scoreValue}>{state.totalScore}</Text>
          {scale.scoring && (
            <Text style={styles.scoreRange}>
              Rango: {scale.scoring.min_score} - {scale.scoring.max_score}
            </Text>
          )}
        </View>

        {/* Interpretation */}
        {state.interpretation && (
          <View style={[
            styles.interpretationContainer,
            { borderLeftColor: state.interpretation.colorCode || colors.primary }
          ]}>
            <Text style={styles.interpretationLevel}>
              {state.interpretation.level}
            </Text>
            <Text style={styles.interpretationText}>
              {state.interpretation.text}
            </Text>
            {state.interpretation.recommendations && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsLabel}>Recomendaciones:</Text>
                <Text style={styles.recommendationsText}>
                  {state.interpretation.recommendations}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen de la Evaluación</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Preguntas respondidas:</Text>
            <Text style={styles.summaryValue}>{Object.keys(state.responses).length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiempo empleado:</Text>
            <Text style={styles.summaryValue}>
              {state.endTime && state.startTime 
                ? `${Math.round((state.endTime.getTime() - state.startTime.getTime()) / 1000 / 60)} min`
                : 'N/A'
              }
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha:</Text>
            <Text style={styles.summaryValue}>
              {new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <ResultsActions
          assessment={{
            patientData: {},
            score: state.totalScore!,
            interpretation: state.interpretation?.text || '',
            answers: Object.entries(state.responses).map(([id, value]) => ({ id, value }))
          }}
          scale={{ id: scale.id, name: scale.name } as any}
          containerStyle={{ marginTop: 12 }}
        />
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {state.currentStep === 'patient' ? 'Datos del Paciente' :
           state.currentStep === 'evaluation' ? scale.name :
           'Resultados'}
        </Text>
      </View>

      {/* Content */}
      {state.currentStep === 'patient' && renderPatientStep()}
      {state.currentStep === 'evaluation' && renderEvaluationStep()}
      {state.currentStep === 'results' && renderResultsStep()}
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isLargeScreen: boolean, fontMultiplier: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.headerBackground,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: isLargeScreen ? 24 : 16,
    justifyContent: 'space-between',
  },
  evaluationGrid: {
    flex: 1,
    flexDirection: isLargeScreen ? 'row' : 'column',
    gap: isLargeScreen ? 24 : 0,
  },
  questionPanel: {
    flex: 1,
    paddingRight: isLargeScreen ? 24 : 0,
    borderRightWidth: isLargeScreen ? 1 : 0,
    borderRightColor: colors.border,
  },
  optionsPanel: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28 * fontMultiplier,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    marginTop: 8,
    textAlign: 'right',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 24 * fontMultiplier,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32 * fontMultiplier,
    marginBottom: 12,
  },
  questionDescription: {
    fontSize: 16 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 24 * fontMultiplier,
    marginBottom: 16,
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionsLabel: {
    fontSize: 14 * fontMultiplier,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 20 * fontMultiplier,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '1A', // 10% opacity
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.card,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18 * fontMultiplier,
    fontWeight: '500',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 20 * fontMultiplier,
    marginTop: 4,
  },
  optionDescriptionSelected: {
    color: colors.mutedText,
  },
  optionValue: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '600',
    color: colors.mutedText,
    marginLeft: 8,
  },
  optionValueSelected: {
    color: colors.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
  },
  navButtonSecondary: {
    backgroundColor: colors.surface,
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    color: colors.buttonPrimaryText,
  },
  navButtonTextSecondary: {
    color: colors.buttonSecondaryText,
  },
  resultsHeader: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  scaleName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreRange: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  interpretationContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  interpretationLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recommendationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  summaryContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});