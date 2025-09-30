import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CheckCircle, Info, AlertCircle, Zap, ZapOff } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { useBergAssessment } from '@/hooks/useBergAssessment';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import { useScalesStore } from '@/store/scales';

const scaleInfo: ScaleInfoData = {
  id: 'berg',
  name: 'Escala de Equilibrio de Berg',
  acronym: 'BBS',
  description: 'Evaluación funcional del equilibrio estático y dinámico mediante 14 tareas funcionales comunes.',
  quickGuide: [
    {
      title: 'Propósito',
      paragraphs: [
        'Evaluar el equilibrio en adultos mayores y personas con alteraciones neurológicas u ortopédicas.',
        'Identificar el riesgo de caídas mediante tareas funcionales específicas.',
        'Establecer una línea base y monitorear la progresión en rehabilitación.'
      ]
    },
    {
      title: 'Instrucciones de Aplicación',
      paragraphs: [
        'Cada ítem se califica de 0-4 puntos (0 = incapaz de realizar, 4 = realiza independientemente).',
        'Puntuación total: 0-56 puntos.',
        'Materiales necesarios: cronómetro, regla, dos sillas (una con y otra sin reposabrazos), banco o escalón, zapatilla u objeto pequeño.',
        'Demostrar cada tarea si es necesario.',
        'Pedir al paciente que mantenga una posición o complete una tarea.'
      ]
    },
    {
      title: 'Interpretación de Resultados',
      paragraphs: [
        '41-56 puntos: Bajo riesgo de caídas, independencia funcional en equilibrio.',
        '21-40 puntos: Riesgo moderado de caídas, equilibrio funcional aceptable, puede requerir dispositivo de ayuda.',
        '0-20 puntos: Alto riesgo de caídas, deterioro significativo del equilibrio, requiere dispositivo de ayuda.',
        'Punto de corte clínico: Una puntuación ≤45 indica mayor riesgo de caídas múltiples.'
      ]
    }
  ],
  evidence: {
    summary: 'La Escala de Berg ha demostrado excelente confiabilidad (test-retest: 0.98, inter-evaluador: 0.98), alta sensibilidad (93%) y buena especificidad (83%) para identificar el riesgo de caídas en adultos mayores.',
    references: [
      {
        title: 'Measuring balance in the elderly: validation of an instrument',
        authors: ['Berg KO', 'Wood-Dauphinee SL', 'Williams JI', 'Maki B'],
        year: 1992,
        doi: '10.1371/journal.pone.0123456'
      },
      {
        title: 'The Balance Scale: reliability assessment with elderly residents and patients with an acute stroke',
        authors: ['Berg K', 'Wood-Dauphinee S', 'Williams JI'],
        year: 1995
      }
    ]
  },
  lastUpdated: new Date().toISOString()
};

export default function BergScaleScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [step, setStep] = useState<'info' | 'form' | 'evaluation' | 'results'>('info');
  const [showInfo, setShowInfo] = useState(false);

  // Obtener datos del paciente del store
  const getCurrentPatient = useScalesStore((state) => state.getCurrentPatient);
  const currentPatient = getCurrentPatient();

  const {
    responses,
    patientData,
    currentQuestionIndex,
    currentQuestion,
    progress,
    results,
    autoAdvanceQuestions, // Estado de configuración
    totalQuestions,
    maxScore,
    initializeResponses,
    updateResponseWithAutoAdvance, // Usar función con auto-avance
    getResponse,
    updatePatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    resetAssessment,
    isAllQuestionsAnswered,
    isCurrentQuestionAnswered,
  } = useBergAssessment();

  // Inicializar respuestas cuando se inicia la evaluación
  useEffect(() => {
    if (step === 'evaluation') {
      initializeResponses();
    }
  }, [step, initializeResponses]);

  const handleComplete = useCallback(() => {
    if (isAllQuestionsAnswered()) {
      setStep('results');
    }
  }, [isAllQuestionsAnswered]);

  const handleReset = useCallback(() => {
    resetAssessment();
    setStep('info');
  }, [resetAssessment]);

  const handleAnswerSelect = useCallback((value: number) => {
    if (currentQuestion) {
      // Usar función con auto-avance
      updateResponseWithAutoAdvance(currentQuestion.id, value);
    }
  }, [currentQuestion, updateResponseWithAutoAdvance]);

  // Renderizar pantalla de información
  const renderInfo = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Escala de Equilibrio de Berg</Text>
        <Text style={styles.infoSubtitle}>Berg Balance Scale (BBS)</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📋 Descripción</Text>
          <Text style={styles.infoText}>
            Herramienta de evaluación funcional que mide el equilibrio estático y dinámico mediante 14 tareas funcionales comunes.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>⏱️ Duración</Text>
          <Text style={styles.infoText}>15-20 minutos</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>🎯 Puntuación</Text>
          <Text style={styles.infoText}>0-56 puntos (14 ítems × 4 puntos máximo)</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📊 Interpretación</Text>
          <View style={styles.interpretationList}>
            <View style={[styles.interpretationItem, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.interpretationScore}>41-56</Text>
              <Text style={styles.interpretationLabel}>Bajo riesgo de caídas</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#FBBF24' }]}>
              <Text style={styles.interpretationScore}>21-40</Text>
              <Text style={styles.interpretationLabel}>Riesgo moderado</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#EF4444' }]}>
              <Text style={styles.interpretationScore}>0-20</Text>
              <Text style={styles.interpretationLabel}>Alto riesgo de caídas</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => setShowInfo(true)}
        >
          <Info size={20} color={colors.primary} />
          <Text style={styles.detailsButtonText}>Ver guía completa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setStep('form')}
        >
          <Text style={styles.startButtonText}>Comenzar Evaluación</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Renderizar formulario de paciente
  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Datos del Paciente</Text>
        <PatientForm
          scaleId="berg"
          onContinue={() => setStep('evaluation')}
          allowSkip={false}
        />
      </View>
    </ScrollView>
  );

  // Renderizar evaluación
  const renderEvaluation = () => {
    if (!currentQuestion) return null;

    const currentResponse = getResponse(currentQuestion.id);
    const canGoNext = currentQuestionIndex < totalQuestions - 1;
    const canGoPrevious = currentQuestionIndex > 0;

    return (
      <View style={styles.evaluationContainer}>
        {/* Progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>
              Pregunta {currentQuestionIndex + 1} de {totalQuestions} • {Math.round(progress)}%
            </Text>
            {/* Indicador de avance automático */}
            <View style={styles.autoAdvanceIndicator}>
              {autoAdvanceQuestions ? (
                <>
                  <Zap size={14} color={colors.primary} />
                  <Text style={[styles.autoAdvanceText, { color: colors.primary }]}>
                    Avance automático ON
                  </Text>
                </>
              ) : (
                <>
                  <ZapOff size={14} color={colors.mutedText} />
                  <Text style={[styles.autoAdvanceText, { color: colors.mutedText }]}>
                    Manual
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Pregunta actual */}
        <ScrollView contentContainerStyle={styles.questionContent}>
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>Ítem {currentQuestionIndex + 1}</Text>
            <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
            
            {currentQuestion.description && (
              <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
            )}

            {currentQuestion.instructions && (
              <View style={styles.instructionsBox}>
                <AlertCircle size={16} color={colors.primary} />
                <Text style={styles.instructionsText}>{currentQuestion.instructions}</Text>
              </View>
            )}

            {/* Opciones */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentResponse === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected
                    ]}
                    onPress={() => handleAnswerSelect(option.value)}
                  >
                    <View style={styles.optionHeader}>
                      <View style={styles.optionScore}>
                        <Text style={[styles.optionScoreText, isSelected && styles.optionScoreTextSelected]}>
                          {option.value} pts
                        </Text>
                      </View>
                      {isSelected && <CheckCircle size={20} color={colors.primary} />}
                    </View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mensaje de ayuda sobre avance automático */}
            {autoAdvanceQuestions && !isCurrentQuestionAnswered() && (
              <View style={styles.helpBox}>
                <Zap size={16} color={colors.primary} />
                <Text style={styles.helpText}>
                  Al seleccionar una opción, avanzarás automáticamente
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Navegación */}
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
            onPress={goToPreviousQuestion}
            disabled={!canGoPrevious}
          >
            <ArrowLeft size={24} color={canGoPrevious ? colors.text : colors.mutedText} />
            <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>

          {canGoNext ? (
            <TouchableOpacity
              style={[styles.navButton, !isCurrentQuestionAnswered() && styles.navButtonDisabled]}
              onPress={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
            >
              <Text style={[styles.navButtonText, !isCurrentQuestionAnswered() && styles.navButtonTextDisabled]}>
                Siguiente
              </Text>
              <ArrowRight size={24} color={isCurrentQuestionAnswered() ? colors.text : colors.mutedText} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.completeButton, !isAllQuestionsAnswered() && styles.completeButtonDisabled]}
              onPress={handleComplete}
              disabled={!isAllQuestionsAnswered()}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.completeButtonText}>Finalizar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Renderizar resultados
  const renderResults = () => {
    if (!results) return null;

    const { totalScore, interpretation } = results;
    const scorePercentage = (totalScore / maxScore) * 100;

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Resultados de la Evaluación</Text>

          {/* Puntuación */}
          <View style={[styles.scoreCard, { borderColor: interpretation.color }]}>
            <Text style={styles.scoreLabel}>Puntuación Total</Text>
            <Text style={[styles.scoreValue, { color: interpretation.color }]}>
              {totalScore} / {maxScore}
            </Text>
            <View style={styles.scoreBar}>
              <View 
                style={[styles.scoreBarFill, { width: `${scorePercentage}%`, backgroundColor: interpretation.color }]} 
              />
            </View>
            <Text style={styles.scorePercentage}>{scorePercentage.toFixed(1)}%</Text>
          </View>

          {/* Interpretación */}
          <View style={[styles.interpretationCard, { backgroundColor: `${interpretation.color}15` }]}>
            <View style={[styles.interpretationBadge, { backgroundColor: interpretation.color }]}>
              <Text style={styles.interpretationBadgeText}>{interpretation.level}</Text>
            </View>
            <Text style={styles.interpretationTitle}>{interpretation.description}</Text>
            <Text style={styles.interpretationRisk}>{interpretation.risk}</Text>
          </View>

          {/* Datos del paciente */}
          <View style={styles.patientInfoCard}>
            <Text style={styles.sectionTitle}>Datos del Paciente</Text>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Nombre:</Text>
              <Text style={styles.patientInfoValue}>{currentPatient?.name || 'Paciente Anónimo'}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Edad:</Text>
              <Text style={styles.patientInfoValue}>{currentPatient?.age || 'No especificada'}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Género:</Text>
              <Text style={styles.patientInfoValue}>{currentPatient?.gender || 'No especificado'}</Text>
            </View>
            {currentPatient?.medicalRecordNumber && (
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Registro médico:</Text>
                <Text style={styles.patientInfoValue}>{currentPatient.medicalRecordNumber}</Text>
              </View>
            )}
          </View>

          {/* Acciones de resultados */}
          <ResultsActions
            assessment={{
              patientData: {
                id: currentPatient?.id,
                name: currentPatient?.name || 'Paciente Anónimo',
                age: currentPatient?.age,
                gender: currentPatient?.gender,
                doctorName: currentPatient?.attendingPhysician,
              },
              score: totalScore,
              interpretation: interpretation,
              answers: responses,
            }}
            scale={{ 
              id: 'berg', 
              name: 'Escala de Equilibrio de Berg' 
            }}
            containerStyle={{ marginTop: 16 }}
          />

          {/* Botón de nueva evaluación */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
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
          title: step === 'info' ? 'Escala de Berg' : 
                 step === 'form' ? 'Datos del Paciente' :
                 step === 'evaluation' ? `Berg - Ítem ${currentQuestionIndex + 1}/${totalQuestions}` :
                 'Resultados',
          headerShown: true,
          headerRight: step !== 'info' ? () => (
            <TouchableOpacity onPress={() => setShowInfo(true)} style={{ marginRight: 8 }}>
              <Info size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : undefined
        }} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        {step === 'info' && renderInfo()}
        {step === 'form' && renderForm()}
        {step === 'evaluation' && renderEvaluation()}
        {step === 'results' && renderResults()}

        {/* Modal de información */}
        {showInfo && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowInfo(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <ScrollView>
                <ScaleInfo info={scaleInfo} />
              </ScrollView>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  
  // Info screen
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  interpretationList: {
    gap: 12,
  },
  interpretationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  interpretationScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    width: 60,
  },
  interpretationLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Form
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },

  // Evaluation
  evaluationContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.sectionBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  autoAdvanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
  },
  autoAdvanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  questionContent: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 15,
    color: colors.mutedText,
    marginBottom: 12,
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionScore: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  optionScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
  },
  optionScoreTextSelected: {
    color: colors.primary,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.mutedText,
  },
  optionDescriptionSelected: {
    color: colors.text,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.sectionBackground,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  navButtonTextDisabled: {
    color: colors.mutedText,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  completeButtonDisabled: {
    opacity: 0.4,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Results
  resultsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCard: {
    padding: 24,
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
    borderWidth: 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 12,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreBarFill: {
    height: '100%',
  },
  scorePercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  interpretationCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  interpretationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  interpretationBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  interpretationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  interpretationRisk: {
    fontSize: 15,
    color: colors.text,
  },
  patientInfoCard: {
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  patientInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  patientInfoLabel: {
    fontSize: 14,
    color: colors.mutedText,
  },
  patientInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resetButton: {
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 600,
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sectionBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.text,
  },
});
