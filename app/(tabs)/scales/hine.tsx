// app/(tabs)/scales/hine.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput, Platform, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Eye } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { ResultsActions } from '@/components/ResultsActions';
import { hineScale, hineQuestionsData, hineMotorMilestones, hineBehaviorItems } from '@/data/hine';
import { useHineAssessment } from '@/hooks/useHineAssessment';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';

const scaleInfo: ScaleInfoData = {
  id: 'hine',
  name: hineScale.name,
  acronym: hineScale.acronym,
  description: hineScale.description,
  quickGuide: [
    {
      title: 'Paso 1: Datos del Paciente',
      paragraphs: [
        'Complete los datos del paciente incluyendo edad gestacional si es prematuro.',
        'La edad corregida se calculará automáticamente para prematuros.',
        'El perímetro cefálico es importante para la evaluación neurológica.'
      ]
    },
    {
      title: 'Paso 2: Evaluación Neurológica (26 preguntas)',
      paragraphs: [
        'La evaluación se divide en 5 secciones: Pares Craneales, Postura, Movimientos, Tono Muscular, y Reflejos.',
        'Cada pregunta se puntúa de 0-3 puntos según la normalidad del hallazgo.',
        'Algunas preguntas evalúan asimetría - importante para detectar lesiones unilaterales.'
      ]
    },
    {
      title: 'Paso 3: Hitos Motores',
      paragraphs: [
        'Registre los hitos motores alcanzados por el niño.',
        'Marque como "Observado" si lo vio durante el examen, "Referido" si los padres lo reportan.',
        'Compare con las edades normales de desarrollo.'
      ]
    },
    {
      title: 'Paso 4: Observaciones de Conducta',
      paragraphs: [
        'Registre el comportamiento del niño durante el examen.',
        'Incluya observaciones sobre alerta, contacto visual, consolabilidad e irritabilidad.',
        'Agregue comentarios adicionales del examinador.'
      ]
    },
    {
      title: 'Paso 5: Interpretación',
      paragraphs: [
        'Puntuación total: 73-78 = Óptimo, 60-72 = Normal, 40-59 = Vigilancia, 0-39 = Riesgo Alto.',
        '≥3 hallazgos asimétricos sugieren patrón clínicamente significativo.',
        'Compare con edad corregida en prematuros.'
      ]
    }
  ],
  evidence: {
    summary: 'HINE es una herramienta validada para evaluación neurológica de lactantes de 2-24 meses, especialmente útil para detectar parálisis cerebral temprana y alteraciones del desarrollo neuromotor.',
    references: hineScale.references?.map(ref => ({
      title: ref.title,
      authors: ref.authors,
      year: ref.year,
      doi: ref.doi
    })) || []
  },
  lastUpdated: new Date().toISOString()
};

export default function HineScaleScreen() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [step, setStep] = useState<'info' | 'form' | 'evaluation' | 'milestones' | 'behavior' | 'results'>('info');
  const [showAsymmetryDialog, setShowAsymmetryDialog] = useState(false);
  const [currentAsymmetryQuestion, setCurrentAsymmetryQuestion] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const webDateInputRef = useRef<any>(null);

  const {
    comments,
    patientData,
    currentQuestionIndex,
    currentSection,
    currentQuestion,
    currentSectionData,
    sections,
    progress,
    results,
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
    completeAssessment
  } = useHineAssessment();

  // Inicializar respuestas al cargar la evaluación
  useEffect(() => {
    if (step === 'evaluation') {
      initializeResponses();
    }
  }, [step, initializeResponses]);

  // Funciones de manejo de fecha siguiendo patrón Denver II
  const handleInputChange = (field: string) => (value: string) => {
    updatePatientData({ [field]: value });
  };

  const parseBirthDate = () => {
    if (!patientData.birthDate) return new Date();
    const d = new Date(patientData.birthDate + 'T00:00:00');
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Lazy-require community DateTimePicker if available (native)
  let CommunityDateTimePicker: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    CommunityDateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    CommunityDateTimePicker = null;
  }

  const openDateSelector = () => {
    if (Platform.OS === 'web') {
      const doc: any = (globalThis as any)?.document;
      if (!doc) return;
      if (!webDateInputRef.current) {
        const input = doc.createElement('input');
        input.type = 'date';
        input.max = formatDate(new Date());
        input.value = patientData.birthDate || '';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.onchange = (ev: any) => {
          const value = ev.target?.value;
          if (value) handleInputChange('birthDate')(value);
        };
        doc.body.appendChild(input);
        webDateInputRef.current = input;
      }
      // @ts-ignore - not all browsers expose showPicker
      webDateInputRef.current?.showPicker?.();
      webDateInputRef.current?.click();
      return;
    }

    if (CommunityDateTimePicker) {
      setShowDatePicker(true);
    }
  };

  const startEvaluation = useCallback(() => {
    if (!patientData.name || !patientData.examiner || !patientData.birthDate || !patientData.gestationalAge) {
      Alert.alert(
        'Datos incompletos',
        'Por favor complete todos los campos requeridos antes de continuar.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setStep('evaluation');
  }, [patientData]);

  const handleScoreSelect = useCallback((questionId: string, score: number) => {
    const question = hineQuestionsData.find(q => q.question_id === questionId);

    if (question?.has_asymmetry) {
      setCurrentAsymmetryQuestion(questionId);
      setShowAsymmetryDialog(true);
      // Temporalmente guardamos la puntuación
      updateResponse(questionId, score, false);
    } else {
      updateResponse(questionId, score, false);
    }
  }, [updateResponse]);

  const handleAsymmetryConfirm = useCallback((hasAsymmetry: boolean) => {
    const currentResponse = getResponse(currentAsymmetryQuestion);
    updateResponse(currentAsymmetryQuestion, currentResponse.score, hasAsymmetry);
    setShowAsymmetryDialog(false);
    setCurrentAsymmetryQuestion('');
  }, [currentAsymmetryQuestion, getResponse, updateResponse]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < hineQuestionsData.length - 1) {
      goToNextQuestion();
    } else {
      setStep('milestones');
    }
  }, [currentQuestionIndex, goToNextQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      goToPreviousQuestion();
    }
  }, [currentQuestionIndex, goToPreviousQuestion]);

  const handleComplete = useCallback(() => {
    const assessmentResults = completeAssessment();
    if (assessmentResults) {
      setStep('results');
      return;
    }

    const pendingQuestions = hineQuestionsData.filter(question => getResponse(question.question_id).score === null);
    const firstPending = pendingQuestions[0];
    const message = pendingQuestions.length
      ? `Faltan ${pendingQuestions.length} pregunta(s) por puntuar. Te llevo a la primera pendiente.`
      : 'Por favor, complete todas las preguntas antes de finalizar.';

    const alertButtons = pendingQuestions.length
      ? [
          {
            text: 'Ir ahora',
            onPress: () => {
              setStep('evaluation');
              if (firstPending) {
                const questionIndex = hineQuestionsData.findIndex(question => question.question_id === firstPending.question_id);
                if (questionIndex >= 0) {
                  goToQuestion(questionIndex);
                }
              }
            }
          },
          { text: 'Cancelar', style: 'cancel' as const }
        ]
      : [{ text: 'Continuar', style: 'default' as const }];

    Alert.alert('Evaluación Incompleta', message, alertButtons);
  }, [completeAssessment, getResponse, goToQuestion]);


  const renderInfo = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <ScaleInfo
        info={scaleInfo}
      />
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => setStep('form')}
      >
        <Text style={styles.startButtonText}>Comenzar Evaluación</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Datos del Paciente - HINE</Text>
      <Text style={styles.subtitle}>Evaluación neurológica para lactantes (2-24 meses)</Text>

      <TextInput
        placeholder="Nombre del Paciente"
        style={styles.input}
        value={patientData.name}
        onChangeText={handleInputChange('name')}
      />

      <TextInput
        placeholder="Nombre del Examinador"
        style={styles.input}
        value={patientData.examiner}
        onChangeText={handleInputChange('examiner')}
      />

      {(Platform.OS !== 'web' && !CommunityDateTimePicker) ? (
        <TextInput
          placeholder="Fecha de Nacimiento (YYYY-MM-DD)"
          style={styles.input}
          value={patientData.birthDate}
          onChangeText={handleInputChange('birthDate')}
        />
      ) : (
        <>
          <TouchableOpacity onPress={openDateSelector} activeOpacity={0.8}>
            <View style={styles.inputLikeButton}>
              <Text style={styles.inputLikeText}>
                {patientData.birthDate ? patientData.birthDate : 'Seleccionar fecha de nacimiento'}
              </Text>
            </View>
          </TouchableOpacity>
          {Platform.OS !== 'web' && CommunityDateTimePicker && (
            <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Selecciona la fecha de nacimiento</Text>
                  <CommunityDateTimePicker
                    value={parseBirthDate()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    maximumDate={new Date()}
                    onChange={(event: any, date?: Date) => {
                      if (Platform.OS === 'android') {
                        if (event.type === 'set' && date) {
                          handleInputChange('birthDate')(formatDate(date));
                        }
                        setShowDatePicker(false);
                      } else if (date) {
                        handleInputChange('birthDate')(formatDate(date));
                      }
                    }}
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalButton} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalButtonText}>Hecho</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </>
      )}

      <TextInput
        placeholder="Semanas de Gestación"
        style={styles.input}
        keyboardType="numeric"
        value={patientData.gestationalAge}
        onChangeText={handleInputChange('gestationalAge')}
      />

      <TextInput
        placeholder="Perímetro Cefálico (cm)"
        style={styles.input}
        keyboardType="numeric"
        value={patientData.headCircumference}
        onChangeText={handleInputChange('headCircumference')}
      />

      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => setStep('info')} style={styles.navButton}>
          <ArrowLeft color={colors.text} />
          <Text style={styles.navButtonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={startEvaluation} style={styles.navButton}>
          <Text style={styles.navButtonText}>Iniciar Evaluación</Text>
          <ArrowRight color={colors.text} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSectionNavigation = () => (
    <View style={styles.sectionNavigation}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={section.name}
            style={[
              styles.sectionTab,
              index === currentSection && styles.sectionTabActive
            ]}
            onPress={() => goToSection(index)}
          >
            <Text style={[
              styles.sectionTabText,
              index === currentSection && styles.sectionTabTextActive
            ]}>
              {section.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentResponse = getResponse(currentQuestion.question_id);

    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
        </View>

        <View style={styles.questionHeader}>
          <Text style={styles.sectionTitle}>{currentSectionData?.name}</Text>
          <Text style={styles.questionNumber}>
            Pregunta {currentQuestionIndex + 1} de {hineQuestionsData.length}
          </Text>
          <Text style={styles.questionTitle}>{currentQuestion.question_text}</Text>
          <Text style={styles.questionDescription}>{currentQuestion.description}</Text>

          {currentQuestion.has_asymmetry && (
            <View style={styles.asymmetryNotice}>
              <Eye color={colors.warning} size={16} />
              <Text style={styles.asymmetryText}>Esta pregunta evalúa asimetría</Text>
            </View>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option) => (
            <TouchableOpacity
              key={option.order_index}
              style={[
                styles.optionButton,
                currentResponse.score === option.option_value && styles.optionButtonSelected
              ]}
              onPress={() => handleScoreSelect(currentQuestion.question_id, option.option_value)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.scoreCircle,
                    currentResponse.score === option.option_value && styles.scoreCircleSelected
                  ]}>
                    <Text style={[
                      styles.scoreText,
                      currentResponse.score === option.option_value && styles.scoreTextSelected
                    ]}>
                      {option.option_value}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    currentResponse.score === option.option_value && styles.optionTextSelected
                  ]}>
                    {option.option_label}
                  </Text>
                </View>
                {currentResponse.score === option.option_value && (
                  <CheckCircle color={colors.primary} size={24} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {currentResponse.hasAsymmetry && (
          <View style={styles.asymmetryIndicator}>
            <Text style={styles.asymmetryIndicatorText}>⚠️ Asimetría detectada</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMilestones = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Hitos Motores</Text>
          <Text style={styles.subtitle}>Marque los hitos que el niño ha alcanzado</Text>
        </View>

        {hineMotorMilestones.map((milestone) => {
          const milestoneData = getMotorMilestone(milestone.id);
          return (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneText}>{milestone.name}</Text>
                <Text style={styles.milestoneAge}>{milestone.normalAge}</Text>
              </View>
              <View style={styles.milestoneOptions}>
                {['no_presente', 'observado', 'referido'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.milestoneButton,
                      milestoneData.status === status && styles.milestoneButtonSelected
                    ]}
                    onPress={() => updateMotorMilestone(milestone.id, status as any)}
                  >
                    <Text style={[
                      styles.milestoneButtonText,
                      milestoneData.status === status && styles.milestoneButtonTextSelected
                    ]}>
                      {status === 'no_presente' ? 'No' : status === 'observado' ? 'Observado' : 'Referido'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('evaluation')}
          >
            <ArrowLeft color={colors.text} size={20} />
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('behavior')}
          >
            <Text style={styles.primaryButtonText}>Siguiente</Text>
            <ArrowRight color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderBehavior = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Observaciones de Conducta</Text>
          <Text style={styles.subtitle}>Marque las conductas observadas durante el examen</Text>
        </View>

        {hineBehaviorItems.map((behavior) => {
          const behaviorData = getBehavior(behavior.id);
          return (
            <TouchableOpacity
              key={behavior.id}
              style={[
                styles.behaviorItem,
                behaviorData.present && styles.behaviorItemSelected
              ]}
              onPress={() => updateBehavior(behavior.id, !behaviorData.present)}
            >
              <View style={styles.behaviorContent}>
                <Text style={[
                  styles.behaviorText,
                  behaviorData.present && styles.behaviorTextSelected
                ]}>
                  {behavior.name}
                </Text>
                {behaviorData.present ? (
                  <CheckCircle color={colors.primary} size={24} />
                ) : (
                  <Circle color={colors.border} size={24} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>Comentarios adicionales</Text>
          <TextInput
            style={styles.commentsInput}
            multiline
            numberOfLines={4}
            placeholder="Observaciones adicionales del examinador..."
            value={comments}
            onChangeText={setComments}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('milestones')}
          >
            <ArrowLeft color={colors.text} size={20} />
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleComplete}
          >
            <Text style={styles.primaryButtonText}>Finalizar</Text>
            <CheckCircle color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderAsymmetryDialog = () => (
    showAsymmetryDialog && (
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>Evaluación de Asimetría</Text>
          <Text style={styles.dialogText}>
            ¿Se observó asimetría en esta evaluación?
          </Text>
          <View style={styles.dialogButtons}>
            <TouchableOpacity
              style={styles.dialogButton}
              onPress={() => handleAsymmetryConfirm(false)}
            >
              <Text style={styles.dialogButtonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogButtonPrimary]}
              onPress={() => handleAsymmetryConfirm(true)}
            >
              <Text style={[styles.dialogButtonText, styles.dialogButtonTextPrimary]}>Sí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  );

  const renderResults = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Resultados HINE</Text>
          <Text style={styles.subtitle}>{patientData.name}</Text>
        </View>

        <View style={[styles.scoreCard, { backgroundColor: results.interpretation.color_code + '20' }]}>
          <Text style={styles.totalScoreLabel}>Puntuación Total</Text>
          <Text style={styles.totalScore}>{results.totalScore}</Text>
          <Text style={styles.totalScoreMax}>de {hineScale.scoring?.max_score || 78} puntos</Text>
        </View>

        <View style={[styles.interpretationCard, { borderLeftColor: results.interpretation.color_code }]}>
          <Text style={styles.interpretationLevel}>{results.interpretation.interpretation_level}</Text>
          <Text style={styles.interpretationText}>{results.interpretation.interpretation_text}</Text>
        </View>

        <View style={styles.sectionsGrid}>
          <Text style={styles.sectionGridTitle}>Puntuaciones por Sección</Text>
          <View style={styles.sectionsRow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Pares Craneales</Text>
              <Text style={styles.sectionCardScore}>{results.sectionScores.craneales}/15</Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Postura</Text>
              <Text style={styles.sectionCardScore}>{results.sectionScores.postura}/18</Text>
            </View>
          </View>
          <View style={styles.sectionsRow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Movimientos</Text>
              <Text style={styles.sectionCardScore}>{results.sectionScores.movimientos}/6</Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Tono</Text>
              <Text style={styles.sectionCardScore}>{results.sectionScores.tono}/24</Text>
            </View>
          </View>
          <View style={styles.sectionsRow}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>Reflejos</Text>
              <Text style={styles.sectionCardScore}>{results.sectionScores.reflejos}/15</Text>
            </View>
          </View>
        </View>

        <View style={[
          styles.asymmetryCard,
          { backgroundColor: results.asymmetryInterpretation.isSignificant ? '#FEF3C7' : '#ECFDF5' }
        ]}>
          <Text style={styles.asymmetryTitle}>Evaluación de Asimetría</Text>
          <Text style={styles.asymmetryCount}>
            {results.asymmetryInterpretation.count} hallazgos asimétricos
          </Text>
          <Text style={styles.asymmetryText}>
            {results.asymmetryInterpretation.text}
          </Text>
        </View>

        <ResultsActions
          assessment={{
            patientData: results.patientData,
            score: results.totalScore,
            interpretation: `${results.interpretation.interpretation_level}: ${results.interpretation.interpretation_text}`
          }}
          scale={{ id: 'hine', name: hineScale.name } as any}
        />
      </View>
    </ScrollView>
  );

  const renderEvaluation = () => (
    <View style={styles.evaluationContainer}>
      {renderSectionNavigation()}
      <ScrollView contentContainerStyle={styles.content}>
        {renderQuestion()}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, currentQuestionIndex === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft color={currentQuestionIndex === 0 ? colors.mutedText : colors.text} size={20} />
            <Text style={[styles.secondaryButtonText, currentQuestionIndex === 0 && styles.disabledButtonText]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentQuestionIndex === hineQuestionsData.length - 1 ? 'Continuar' : 'Siguiente'}
            </Text>
            <ArrowRight color="white" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'HINE',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          )
        }}
      />

      {step === 'info' && renderInfo()}
      {step === 'form' && renderForm()}
      {step === 'evaluation' && renderEvaluation()}
      {step === 'milestones' && renderMilestones()}
      {step === 'behavior' && renderBehavior()}
      {step === 'results' && renderResults()}
      {renderAsymmetryDialog()}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  inputLikeButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputLikeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.text,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  evaluationContainer: {
    flex: 1,
  },
  sectionNavigation: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  sectionTabActive: {
    backgroundColor: colors.primary,
  },
  sectionTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionTabTextActive: {
    color: 'white',
  },
  questionContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  questionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  asymmetryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  asymmetryText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scoreCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scoreCircleSelected: {
    backgroundColor: colors.primary,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoreTextSelected: {
    color: 'white',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  asymmetryIndicator: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    alignItems: 'center',
  },
  asymmetryIndicatorText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  milestoneItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  milestoneContent: {
    marginBottom: 12,
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  milestoneAge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  milestoneOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  milestoneButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  milestoneButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  milestoneButtonTextSelected: {
    color: 'white',
  },
  behaviorItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  behaviorItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  behaviorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  behaviorText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  behaviorTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 100,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: colors.mutedText,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 300,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dialogButtonTextPrimary: {
    color: 'white',
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalScoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalScoreMax: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  interpretationCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  interpretationLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionsGrid: {
    marginBottom: 20,
  },
  sectionGridTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sectionCardTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionCardScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  asymmetryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  asymmetryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  asymmetryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});