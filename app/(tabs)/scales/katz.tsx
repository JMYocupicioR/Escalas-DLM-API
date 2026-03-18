import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CheckCircle, Info, AlertCircle, Zap, ZapOff } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { useKatzAssessment } from '@/hooks/useKatzAssessment';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import { useScalesStore } from '@/store/scales';
import { useAuthSession } from '@/hooks/useAuthSession';
import { createAssessment } from '@/api/assessments';

const scaleInfo: ScaleInfoData = {
  id: 'katz',
  name: 'Índice de Katz de Independencia en AVD',
  acronym: 'Katz Index',
  description: 'Evaluación de la independencia funcional en actividades básicas de la vida diaria mediante 6 categorías esenciales.',
  quickGuide: [
    {
      title: 'Propósito',
      paragraphs: [
        'Evaluar la independencia funcional en seis actividades básicas esenciales para el autocuidado.',
        'Identificar el nivel de asistencia requerida para el cuidado diario.',
        'Monitorear cambios funcionales a lo largo del tiempo.',
        'Ayudar en decisiones de planificación de cuidados e institucionalización.'
      ]
    },
    {
      title: 'Instrucciones de Aplicación',
      paragraphs: [
        'Sistema binario: Independiente (1 punto) o Dependiente (0 puntos).',
        'Puntuación total: 0-6 puntos.',
        'Evalúe lo que el paciente HACE habitualmente, no su capacidad potencial.',
        'Independiente significa sin supervisión, dirección o asistencia personal activa.',
        'El uso de dispositivos de ayuda (bastón, andador) se considera independiente.',
        'Si hay duda, clasifique como dependiente.',
        'Tiempo de aplicación: 5-10 minutos.'
      ]
    },
    {
      title: 'Jerarquía de las AVD',
      paragraphs: [
        'Las actividades siguen un orden jerárquico de pérdida típica:',
        '1. Bañarse → 2. Vestirse → 3. Ir al inodoro → 4. Trasladarse → 5. Continencia → 6. Alimentación',
        'La recuperación típicamente sigue el orden inverso.',
        'Este patrón es importante para la planificación de intervenciones.'
      ]
    },
    {
      title: 'Interpretación de Resultados',
      paragraphs: [
        'Grupo A (6 puntos): Independiente en todas las funciones.',
        'Grupo B (5 puntos): Independiente en todas menos una función.',
        'Grupo C (4 puntos): Independiente en todas excepto bañarse y otra función.',
        'Grupo D (3 puntos): Independiente en todas excepto bañarse, vestirse y otra función.',
        'Grupo E (2 puntos): Dependiente en bañarse, vestirse, ir al inodoro y otra función.',
        'Grupo F (1 punto): Dependiente en bañarse, vestirse, ir al inodoro, trasladarse y otra función.',
        'Grupo G (0 puntos): Dependiente en las seis funciones.'
      ]
    }
  ],
  evidence: {
    summary: 'El Índice de Katz es una de las escalas más antiguas y validadas para evaluar AVD. Ha demostrado alta confiabilidad inter-evaluador (0.95) y validez de constructo con alta correlación con otras escalas funcionales.',
    references: [
      {
        title: 'Studies of illness in the aged. The Index of ADL: A standardized measure of biological and psychosocial function',
        authors: ['Katz S', 'Ford AB', 'Moskowitz RW', 'Jackson BA', 'Jaffe MW'],
        year: 1963
      },
      {
        title: 'Progress in development of the index of ADL',
        authors: ['Katz S', 'Downs TD', 'Cash HR', 'Grotz RC'],
        year: 1970
      }
    ]
  },
  lastUpdated: new Date().toISOString()
};

export default function KatzScaleScreen() {
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
    resetAssessment: resetKatzAssessment,
    isAllQuestionsAnswered,
    isCurrentQuestionAnswered,
    questions,
  } = useKatzAssessment();

  const { session } = useAuthSession();
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar datos del paciente cuando se selecciona uno del store
  useEffect(() => {
    if (currentPatient) {
      updatePatientData({
        id: currentPatient.id,
        name: currentPatient.name,
        age: currentPatient.age ? currentPatient.age.toString() : '',
        gender: currentPatient.gender,
        doctorName: currentPatient.attendingPhysician
      });
    }
  }, [currentPatient, updatePatientData]);

  const handleSave = useCallback(async () => {
    if (!patientData.id || !session?.user.id || !results) return;
    
    setIsSaving(true);
    try {
      const { error } = await createAssessment(session.user.id, {
        patient_id: patientData.id,
        scale_slug: 'katz',
        scale_id: undefined,
        responses: results.responses as Record<string, number | string>,
        total_score: results.totalScore,
        interpretation: results.interpretation.description,
        clinical_notes: null,
        assessor_name: patientData.doctorName,
      });

      if (error) throw error;
      Alert.alert('Éxito', 'Evaluación guardada correctamente en el historial.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo guardar la evaluación.');
    } finally {
      setIsSaving(false);
    }
  }, [patientData, session, results]);

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
    resetKatzAssessment();
    setStep('info');
  }, [resetKatzAssessment]);

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
        <Text style={styles.infoTitle}>Índice de Katz</Text>
        <Text style={styles.infoSubtitle}>Evaluación de Independencia en AVD</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📋 Descripción</Text>
          <Text style={styles.infoText}>
            Escala clásica que evalúa la independencia funcional en 6 actividades básicas de la vida diaria (AVD).
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>⏱️ Duración</Text>
          <Text style={styles.infoText}>5-10 minutos</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>🎯 Puntuación</Text>
          <Text style={styles.infoText}>0-6 puntos (6 actividades × 1 punto cada una)</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📊 Clasificación</Text>
          <View style={styles.interpretationList}>
            <View style={[styles.interpretationItem, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.interpretationScore}>A (6)</Text>
              <Text style={styles.interpretationLabel}>Independiente total</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#34D399' }]}>
              <Text style={styles.interpretationScore}>B (5)</Text>
              <Text style={styles.interpretationLabel}>1 dependencia</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#84CC16' }]}>
              <Text style={styles.interpretationScore}>C (4)</Text>
              <Text style={styles.interpretationLabel}>2 dependencias</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#FBBF24' }]}>
              <Text style={styles.interpretationScore}>D (3)</Text>
              <Text style={styles.interpretationLabel}>3 dependencias</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#F97316' }]}>
              <Text style={styles.interpretationScore}>E-G (0-2)</Text>
              <Text style={styles.interpretationLabel}>Dependencia severa</Text>
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
          scaleId="katz"
          onContinue={(data) => {
            if (data) {
                updatePatientData({
                    id: data.id,
                    name: data.name || '',
                    age: data.age?.toString() || '',
                    gender: data.gender || '',
                    doctorName: data.doctorName || ''
                });
            }
            setStep('evaluation');
          }}
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
            <View style={styles.questionHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{currentQuestion.category}</Text>
              </View>
              <Text style={styles.questionNumber}>
                {currentQuestionIndex + 1}/{totalQuestions}
              </Text>
            </View>
            
            <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
            
            {currentQuestion.description && (
              <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
            )}

            {/* Información sobre el sistema binario */}
            <View style={styles.infoBox}>
              <AlertCircle size={16} color={colors.primary} />
              <Text style={styles.infoBoxText}>
                Selecciona si el paciente es independiente o dependiente en esta actividad
              </Text>
            </View>

            {/* Opciones */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentResponse === option.value;
                const isIndependent = option.value === 1;
                
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                      isIndependent && styles.optionButtonIndependent,
                      !isIndependent && styles.optionButtonDependent,
                    ]}
                    onPress={() => handleAnswerSelect(option.value)}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLeft}>
                        <View style={[
                          styles.optionCheck,
                          isSelected && styles.optionCheckSelected,
                          isIndependent && { backgroundColor: colors.success },
                          !isIndependent && { backgroundColor: colors.warning },
                        ]}>
                          {isSelected && <CheckCircle size={20} color="#fff" />}
                        </View>
                        <View style={styles.optionTextContainer}>
                          <Text style={[
                            styles.optionLabel, 
                            isSelected && styles.optionLabelSelected
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={[
                            styles.optionValue,
                            isSelected && styles.optionValueSelected
                          ]}>
                            {option.value} punto{option.value !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[
                      styles.optionDescription, 
                      isSelected && styles.optionDescriptionSelected
                    ]}>
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
            <Text style={styles.scorePercentage}>{scorePercentage.toFixed(0)}%</Text>
          </View>

          {/* Interpretación */}
          <View style={[styles.interpretationCard, { backgroundColor: `${interpretation.color}15` }]}>
            <View style={[styles.interpretationBadge, { backgroundColor: interpretation.color }]}>
              <Text style={styles.interpretationBadgeText}>Grupo {interpretation.level}</Text>
            </View>
            <Text style={styles.interpretationTitle}>{interpretation.description}</Text>
            <Text style={styles.interpretationText}>{interpretation.interpretation}</Text>
          </View>

          {/* Desglose de respuestas */}
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Desglose por Actividad</Text>
            {Object.entries(responses).map(([questionId, score]) => {
              const question = questions.find(q => q.id === questionId);
              
              if (!question) return null;
              
              return (
                <View key={questionId} style={styles.breakdownItem}>
                  <Text style={styles.breakdownQuestion}>{question.question}</Text>
                  <View style={[
                    styles.breakdownBadge,
                    { backgroundColor: score === 1 ? '#10B98120' : '#EF444420' }
                  ]}>
                    <Text style={[
                      styles.breakdownScore,
                      { color: score === 1 ? '#10B981' : '#EF4444' }
                    ]}>
                      {score === 1 ? 'Independiente' : 'Dependiente'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Datos del paciente */}
          <View style={styles.patientInfoCard}>
            <Text style={styles.sectionTitle}>Datos del Paciente</Text>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Nombre:</Text>
              <Text style={styles.patientInfoValue}>{patientData.name || 'Paciente Anónimo'}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Edad:</Text>
              <Text style={styles.patientInfoValue}>{patientData.age || 'No especificada'}</Text>
            </View>
            <View style={styles.patientInfoRow}>
              <Text style={styles.patientInfoLabel}>Género:</Text>
              <Text style={styles.patientInfoValue}>{patientData.gender || 'No especificado'}</Text>
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
                id: patientData.id,
                name: patientData.name || 'Paciente Anónimo',
                age: Number(patientData.age),
                gender: patientData.gender,
                doctorName: patientData.doctorName,
              },
              score: totalScore,
              interpretation: interpretation.description,
              answers: Object.entries(responses).map(([id, value]) => {
                 const q = questions.find(q => q.id === id);
                 const opt = q?.options.find(o => o.value === value);
                 return {
                     id,
                     question: q?.question || '',
                     value,
                     label: opt?.label,
                     points: value
                 };
              }),
            }}
            scale={{ 
              id: 'katz', 
              name: 'Índice de Katz de Independencia en AVD' 
            }}
            containerStyle={{ marginTop: 16 }}
            onSave={handleSave}
            canSave={!!patientData.id}
            saving={isSaving}
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
          title: step === 'info' ? 'Índice de Katz' : 
                 step === 'form' ? 'Datos del Paciente' :
                 step === 'evaluation' ? `Katz - ${currentQuestionIndex + 1}/${totalQuestions}` :
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 15,
    color: colors.mutedText,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionButtonIndependent: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  optionButtonDependent: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  optionContent: {
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCheck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCheckSelected: {
    backgroundColor: colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
  },
  optionValueSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
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
  interpretationText: {
    fontSize: 15,
    color: colors.text,
  },
  breakdownCard: {
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
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownQuestion: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  breakdownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  breakdownScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  patientInfoCard: {
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 8,
    marginBottom: 20,
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
