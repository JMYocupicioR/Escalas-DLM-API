import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { MedicalScale, ScaleQuestion } from '../medical-scale.schema';
import { QuestionRenderer } from './QuestionRenderer';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useSettingsStore } from '@/store/settingsStore';
import { Button, Surface } from 'react-native-paper';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface ScaleRunnerProps {
  scaleData: MedicalScale;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export const ScaleRunner = ({ 
  scaleData, 
  initialData = {}, 
  onSubmit, 
  onCancel,
  readOnly = false 
}: ScaleRunnerProps) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();

  // --- Settings ---
  const autoAdvanceQuestions = useSettingsStore((s) => s.autoAdvanceQuestions);
  const oneQuestionAtATime = useSettingsStore((s) => s.oneQuestionAtATime);

  // --- Stepper state ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
    
  const version = scaleData.current_version;

  const defaultValues = useMemo(() => ({
    ...initialData,
  }), [initialData]);

  const methods = useForm({
    mode: 'onChange',
    defaultValues,
  });

  const { handleSubmit, watch, control } = methods;
  const allAnswers = watch();

  // Sorted questions
  const sortedQuestions = useMemo(() => {
    if (!version) return [];
    return [...version.questions].sort((a, b) => a.order_index - b.order_index);
  }, [version]);

  const totalQuestions = sortedQuestions.length;
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // --- Auto-advance logic ---
  const prevAnswersRef = useRef<any>({});

  useEffect(() => {
    if (!oneQuestionAtATime || !autoAdvanceQuestions || readOnly || !currentQuestion) return;

    const currentAnswer = allAnswers[currentQuestion.id];
    const prevAnswer = prevAnswersRef.current[currentQuestion.id];

    // Only auto-advance for single_choice when the answer changes
    if (
      currentQuestion.type === 'single_choice' &&
      currentAnswer !== undefined &&
      currentAnswer !== null &&
      currentAnswer !== prevAnswer &&
      !isLastQuestion
    ) {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 400);
      
      prevAnswersRef.current = { ...allAnswers };
      return () => clearTimeout(timer);
    }

    prevAnswersRef.current = { ...allAnswers };
  }, [allAnswers, currentQuestion, oneQuestionAtATime, autoAdvanceQuestions, readOnly, isLastQuestion, totalQuestions]);

  // --- Navigation handlers ---
  const goNext = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isLastQuestion]);

  const goPrev = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFirstQuestion]);

  // --- Dynamic Scoring Logic ---
  const calculateScore = (engine: string, questions: ScaleQuestion[], answers: any) => {
      let total = 0;
      let count = 0;

      if (engine === 'sum' || engine === 'average') {
          questions.forEach(q => {
              const answer = answers[q.id];
              if (answer !== undefined && answer !== null) {
                  let value = 0;
                  if (typeof answer === 'object' && 'score' in answer) {
                      value = Number(answer.score) || 0;
                  } else if (q.options) {
                      const selectedOption = q.options.find(opt => opt.value === answer);
                      if (selectedOption) {
                          value = selectedOption.score;
                      }
                  } else if (typeof answer === 'number') {
                       value = answer;
                  }
                  total += value;
                  count++;
              }
          });
          if (engine === 'average' && count > 0) {
              return Number((total / count).toFixed(2));
          }
          return total;
      }
      return 0;
  };

  const getInterpretation = (score: number, ranges?: any[]) => {
      if (!ranges) return null;
      return ranges.find(r => score >= r.min && score <= r.max);
  };

  const results = useMemo(() => {
    if (!version?.scoring) return { total: 0, globalInterpretation: null, domains: [] };

    const globalScore = calculateScore(version.scoring.engine, version.questions, allAnswers);
    const globalInterpretation = getInterpretation(globalScore, version.scoring.ranges);

    const domainResults = (version.scoring.domains || []).map((domain: any) => {
        const domainQuestions = version.questions.filter(q => domain.question_ids?.includes(q.id));
        const score = calculateScore(domain.engine || 'sum', domainQuestions, allAnswers);
        const inter = getInterpretation(score, domain.ranges);
        return { id: domain.id, label: domain.label, score, interpretation: inter };
    });

    return { total: globalScore, globalInterpretation, domains: domainResults };
  }, [allAnswers, version]);

  const handleFormSubmit = (data: any) => {
      const payload = {
          raw_responses: data,
          total_score: results.total,
          interpretation: results.globalInterpretation?.interpretation || 'Sin interpretación disponible',
          globalInterpretation: results.globalInterpretation,
          domain_results: results.domains,
          scale_id: scaleData.name,
          version: version?.version_number,
          completed_at: new Date().toISOString()
      };
      onSubmit(payload);
  };

  if (!version) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle color={colors.error} size={24} />
        <Text style={[styles.errorText, { color: colors.error }]}>Error: No hay versión disponible para esta escala.</Text>
      </View>
    );
  }

  // ==========================================
  // RENDER: One Question at a Time (Stepper)
  // ==========================================
  if (oneQuestionAtATime && currentQuestion) {
    return (
      <FormProvider {...methods}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Collapsible Instructions (only on first question) */}
          {currentQuestionIndex === 0 && version.config?.instructions && (
            <TouchableOpacity
              onPress={() => setInstructionsCollapsed(!instructionsCollapsed)}
              activeOpacity={0.7}
              style={[styles.instructionsToggle, { backgroundColor: colors.infoBackground + '20', borderColor: colors.info }]}
            >
              {instructionsCollapsed ? (
                <Text style={[styles.instructionsCollapsedText, { color: colors.info }]} numberOfLines={1}>
                  ℹ️ Instrucciones (toca para ver)
                </Text>
              ) : (
                <View>
                  <Text style={[styles.instructionsText, { color: colors.text, fontSize: 12 * fontSizeMultiplier }]}>
                    {version.config.instructions}
                  </Text>
                  <Text style={[styles.instructionsHideHint, { color: colors.info }]}>▲ Toca para ocultar</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Single question — maximum scroll area */}
          <ScrollView ref={scrollRef} style={styles.scrollArea} contentContainerStyle={styles.stepperContent}>
            <QuestionRenderer 
              key={currentQuestion.id} 
              question={currentQuestion} 
              control={control}
              readOnly={readOnly}
            />
          </ScrollView>

          {/* Compact Navigation Footer */}
          <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            {/* Nav buttons with inline score */}
            <View style={styles.navButtonsRow}>
              {isFirstQuestion && onCancel ? (
                <TouchableOpacity
                  onPress={onCancel}
                  style={[styles.navButton, styles.navButtonPrev, { borderColor: colors.border }]}
                >
                  <Text style={[styles.navButtonText, { color: colors.mutedText, fontSize: 13 }]}>Cancelar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={goPrev}
                  disabled={isFirstQuestion}
                  style={[
                    styles.navButton,
                    styles.navButtonPrev,
                    { borderColor: colors.border, opacity: isFirstQuestion ? 0.4 : 1 }
                  ]}
                >
                  <ChevronLeft size={18} color={colors.text} />
                  <Text style={[styles.navButtonText, { color: colors.text }]}>Anterior</Text>
                </TouchableOpacity>
              )}

              {/* Inline score badge */}
              <View style={[styles.inlineScoreBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.inlineScoreText, { color: colors.primary }]}>
                  {results.total}
                </Text>
              </View>

              {isLastQuestion ? (
                <TouchableOpacity
                  onPress={handleSubmit(handleFormSubmit)}
                  style={[styles.navButton, styles.navButtonFinish, { backgroundColor: colors.primary }]}
                >
                  <CheckCircle2 size={18} color="#fff" />
                  <Text style={[styles.navButtonText, { color: '#fff', fontWeight: 'bold' }]}>Finalizar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={goNext}
                  style={[styles.navButton, styles.navButtonNext, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.navButtonText, { color: '#fff' }]}>Siguiente</Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </FormProvider>
    );
  }

  // ==========================================
  // RENDER: All Questions (Scroll mode)
  // ==========================================
  return (
    <FormProvider {...methods}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView ref={scrollRef} style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Instructions */}
          {version.config?.instructions && (
             <View style={[styles.instructionsBox, { backgroundColor: colors.infoBackground + '20', borderColor: colors.info }]}>
                 <Text style={[styles.instructionsText, { color: colors.text, fontSize: 13 * fontSizeMultiplier }]}>
                     {version.config.instructions}
                 </Text>
             </View>
          )}

          {/* All Questions */}
          <View style={styles.questionsList}>
            {sortedQuestions.map((question) => (
                <QuestionRenderer 
                  key={question.id} 
                  question={question} 
                  control={control}
                  readOnly={readOnly}
                />
              ))}
          </View>
        </ScrollView>

        {/* Score Footer */}
        <Surface style={[styles.footer, { backgroundColor: colors.card }]} elevation={4}>
            {results.domains.length > 0 ? (
                <View style={styles.domainSummary}>
                    {results.domains.map(d => (
                         <View key={d.id} style={[styles.domainRow, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.domainLabel, { color: colors.text }]}>{d.label}:</Text>
                            <View style={styles.scoreActionRow}>
                                <Text style={[styles.scoreValue, { color: colors.text }]}>{d.score}</Text>
                                {d.interpretation && (
                                    <View style={[styles.badge, { backgroundColor: d.interpretation.color || colors.primary }]}>
                                        <Text style={styles.badgeText}>{d.interpretation.label}</Text>
                                    </View>
                                )}
                            </View>
                         </View>
                    ))}
                </View>
            ) : (
                <View style={styles.singleScoreContainer}>
                    <View style={styles.scoreRow}>
                       <Text style={[styles.scoreLabel, { color: colors.mutedText }]}>Puntaje Actual:</Text>
                       <Text style={[styles.scoreValueBig, { color: colors.text }]}>{results.total}</Text>
                    </View>
                    {results.globalInterpretation && (
                        <View style={[styles.globalBadge, { backgroundColor: results.globalInterpretation.color || colors.primary }]}>
                            <Text style={styles.badgeText}>{results.globalInterpretation.label}</Text>
                        </View>
                    )}
                </View>
            )}

            {!readOnly && (
                <View style={styles.buttonContainer}>
                    {onCancel && (
                        <Button 
                          mode="outlined" 
                          onPress={onCancel} 
                          style={styles.cancelButton}
                          textColor={colors.primary}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button 
                      mode="contained" 
                      onPress={handleSubmit(handleFormSubmit)} 
                      style={styles.submitButton}
                      buttonColor={colors.primary}
                    >
                        Finalizar
                    </Button>
                </View>
            )}
        </Surface>
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  stepperContent: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  instructionsToggle: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  instructionsCollapsedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructionsHideHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  instructionsBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsText: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  questionsList: {
    gap: 16,
  },



  // --- Nav Buttons ---
  navButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  navButtonPrev: {
    borderWidth: 1,
  },
  navButtonNext: {},
  navButtonFinish: {},
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inlineScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  inlineScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  domainSummary: {
    marginBottom: 16,
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  domainLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  scoreActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  singleScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreValueBig: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  globalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
  }
});
