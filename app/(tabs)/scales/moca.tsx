import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CheckCircle, Info, AlertCircle, Zap, ZapOff, GraduationCap } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { useMontrealAssessment } from '@/hooks/useMontrealAssessment';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import { useScalesStore } from '@/store/scales';

const scaleInfo: ScaleInfoData = {
  id: 'moca',
  name: 'Evaluación Cognitiva de Montreal',
  acronym: 'MoCA',
  description: 'Herramienta de cribado cognitivo diseñada para detectar Deterioro Cognitivo Leve (DCL). Superior al MMSE en funciones ejecutivas.',
  quickGuide: [
    {
      title: 'Propósito',
      paragraphs: [
        'Detectar Deterioro Cognitivo Leve (DCL) con alta sensibilidad (90%).',
        'Evaluar 8 dominios cognitivos: funciones ejecutivas, visoespacial, memoria, atención, lenguaje, abstracción y orientación.',
        'Identificar déficits cognitivos sutiles que otras pruebas (como el MMSE) pueden pasar por alto.',
        'Monitorear progresión cognitiva en enfermedades neurodegenerativas.'
      ]
    },
    {
      title: 'Instrucciones de Aplicación',
      paragraphs: [
        'Ambiente tranquilo, bien iluminado, sin distracciones.',
        'Administración: 10-15 minutos.',
        'Seguir instrucciones estandarizadas al pie de la letra.',
        'No parafrasear ni dar pistas adicionales no autorizadas.',
        'Orden de aplicación: Visoespacial → Nominación → Memoria (registro) → Atención → Lenguaje → Abstracción → Recuerdo Diferido → Orientación.',
        'IMPORTANTE: Las palabras de memoria se leen al principio pero se evalúan al final (tras 5 minutos de tareas de interferencia).'
      ]
    },
    {
      title: 'Ajuste Educativo CRÍTICO',
      paragraphs: [
        'Añadir 1 PUNTO si el paciente tiene ≤12 años de educación formal.',
        'Este ajuste reduce falsos positivos en población con menor escolaridad.',
        'La puntuación máxima sigue siendo 30 puntos.'
      ]
    },
    {
      title: 'Interpretación de Resultados',
      paragraphs: [
        '≥26 puntos: NORMAL - Cognición dentro de límites normales.',
        '18-25 puntos: DETERIORO COGNITIVO LEVE / DEMENCIA LEVE - Requiere evaluación neurológica completa.',
        '0-17 puntos: DEMENCIA MODERADA-SEVERA - Evaluación neurológica urgente.',
        'IMPORTANTE: MoCA es herramienta de cribado, NO diagnóstica. Un resultado anormal indica necesidad de evaluación completa.'
      ]
    }
  ],
  evidence: {
    summary: 'El MoCA ha demostrado sensibilidad del 90% y especificidad del 87% para detectar DCL. Es superior al MMSE especialmente en la detección de disfunción ejecutiva y déficits cognitivos sutiles. Validado en más de 100 idiomas y poblaciones.',
    references: [
      {
        title: 'The Montreal Cognitive Assessment, MoCA: A Brief Screening Tool For Mild Cognitive Impairment',
        authors: ['Nasreddine ZS', 'Phillips NA', 'Bédirian V', 'et al.'],
        year: 2005,
        doi: '10.1111/j.1532-5415.2005.53221.x'
      },
      {
        title: 'Validity and reliability of the Spanish Version of the Montreal Cognitive Assessment (MoCA) for the detection of cognitive impairment in Mexico',
        authors: ['Aguilar-Navarro SG', 'Mimenza-Alvarado AJ', 'et al.'],
        year: 2018
      }
    ]
  },
  lastUpdated: new Date().toISOString()
};

export default function MocaScaleScreen() {
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
    autoAdvanceQuestions,
    totalQuestions,
    maxScore,
    initializeResponses,
    updateResponseWithAutoAdvance,
    getResponse,
    updatePatientData,
    goToNextQuestion,
    goToPreviousQuestion,
    resetAssessment,
    isAllQuestionsAnswered,
    isCurrentQuestionAnswered,
    calculateDomainScores,
  } = useMontrealAssessment();

  // Inicializar respuestas cuando se inicia la evaluación
  useEffect(() => {
    if (step === 'evaluation') {
      initializeResponses();
    }
  }, [step, initializeResponses]);

  const handleComplete = useCallback(() => {
    console.log('handleComplete llamado');
    console.log('Todas las preguntas respondidas:', isAllQuestionsAnswered());
    console.log('Años de educación:', patientData.educationYears);
    
    if (!isAllQuestionsAnswered()) {
      console.log('Mostrando alerta: evaluación incompleta');
      Alert.alert(
        'Evaluación Incompleta',
        'Por favor responda todas las preguntas antes de completar.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Verificar años de educación (advertencia pero permite continuar)
    if (patientData.educationYears === undefined) {
      console.log('Mostrando alerta: años de educación no ingresados');
      Alert.alert(
        'Años de Educación No Ingresados',
        'No se ha ingresado el nivel educativo. Se continuará sin ajuste educativo. ¿Desea continuar de todas formas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar sin ajuste', 
            onPress: () => {
              console.log('Usuario eligió continuar sin ajuste');
              setStep('results');
            }
          }
        ]
      );
      return;
    }

    console.log('Cambiando a step results');
    setStep('results');
  }, [isAllQuestionsAnswered, patientData.educationYears]);

  const handleReset = useCallback(() => {
    resetAssessment();
    setStep('info');
  }, [resetAssessment]);

  const handleAnswerSelect = useCallback((value: number) => {
    if (currentQuestion) {
      updateResponseWithAutoAdvance(currentQuestion.id, value);
    }
  }, [currentQuestion, updateResponseWithAutoAdvance]);

  // Renderizar pantalla de información
  const renderInfo = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Evaluación Cognitiva de Montreal</Text>
        <Text style={styles.infoSubtitle}>Montreal Cognitive Assessment (MoCA)</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📋 Descripción</Text>
          <Text style={styles.infoText}>
            Herramienta de cribado cognitivo de alta sensibilidad diseñada específicamente para detectar Deterioro Cognitivo Leve (DCL). 
            Evalúa funciones ejecutivas, visoespaciales, memoria, atención, lenguaje, abstracción y orientación.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>⏱️ Duración</Text>
          <Text style={styles.infoText}>10-15 minutos</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>🎯 Puntuación</Text>
          <Text style={styles.infoText}>0-30 puntos con ajuste educativo</Text>
        </View>

        <View style={styles.alertBox}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={styles.alertText}>
            <Text style={{ fontWeight: '700' }}>IMPORTANTE:</Text> Se debe añadir 1 punto si el paciente tiene ≤12 años de educación formal.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>📊 Interpretación</Text>
          <View style={styles.interpretationList}>
            <View style={[styles.interpretationItem, { borderLeftColor: '#22c55e' }]}>
              <Text style={styles.interpretationScore}>≥26 puntos</Text>
              <Text style={styles.interpretationLabel}>Normal</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#f59e0b' }]}>
              <Text style={styles.interpretationScore}>18-25 puntos</Text>
              <Text style={styles.interpretationLabel}>DCL / Demencia Leve</Text>
            </View>
            <View style={[styles.interpretationItem, { borderLeftColor: '#ef4444' }]}>
              <Text style={styles.interpretationScore}>0-17 puntos</Text>
              <Text style={styles.interpretationLabel}>Demencia Moderada-Severa</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>🔬 Dominios Evaluados</Text>
          <View style={styles.domainsList}>
            <Text style={styles.domainItem}>• Funciones Visoespaciales y Ejecutivas (5 pts)</Text>
            <Text style={styles.domainItem}>• Identificación/Nominación (3 pts)</Text>
            <Text style={styles.domainItem}>• Atención (6 pts)</Text>
            <Text style={styles.domainItem}>• Lenguaje (3 pts)</Text>
            <Text style={styles.domainItem}>• Abstracción (2 pts)</Text>
            <Text style={styles.domainItem}>• Recuerdo Diferido (5 pts)</Text>
            <Text style={styles.domainItem}>• Orientación (6 pts)</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setStep('form')}
        >
          <Text style={styles.primaryButtonText}>Comenzar Evaluación</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setShowInfo(true)}
        >
          <Info size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Ver Guía Completa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Renderizar formulario de paciente
  const renderForm = () => {
    const handleContinue = () => {
      // Validar que se hayan ingresado años de educación
      if (patientData.educationYears === undefined) {
        Alert.alert(
          'Años de Educación Requeridos',
          'Por favor ingrese los años de educación formal del paciente antes de continuar.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Sincronizar datos del paciente desde el store al hook
      if (currentPatient) {
        updatePatientData({
          id: currentPatient.id,
          name: currentPatient.name || '',
          age: currentPatient.age?.toString() || '',
          gender: currentPatient.gender || '',
          doctorName: currentPatient.doctorName || '',
        });
      }
      
      setStep('evaluation');
    };

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del Paciente</Text>
          
          <PatientForm
            scaleId="moca"
            onContinue={handleContinue}
            allowSkip={false}
          />

        {/* Campo especial para años de educación */}
        <View style={styles.educationSection}>
          <View style={styles.educationHeader}>
            <GraduationCap size={20} color={colors.primary} />
            <Text style={styles.educationTitle}>Años de Educación Formal</Text>
          </View>
          <Text style={styles.educationSubtitle}>
            Requerido para el ajuste educativo del MoCA
          </Text>
          <TextInput
            style={styles.educationInput}
            placeholder="Ej: 12"
            keyboardType="numeric"
            value={patientData.educationYears?.toString() || ''}
            onChangeText={(text) => {
              const years = parseInt(text) || undefined;
              updatePatientData({ educationYears: years });
            }}
          />
          <Text style={styles.educationNote}>
            {patientData.educationYears !== undefined && patientData.educationYears <= 12 
              ? '✓ Se añadirá 1 punto de ajuste educativo' 
              : patientData.educationYears !== undefined 
                ? '• No se aplicará ajuste educativo'
                : '• Ingrese los años de educación formal'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep('info')}
        >
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    );
  };

  // Renderizar evaluación
  const renderEvaluation = () => {
    if (!currentQuestion) return null;

    const categoryColors: Record<string, string> = {
      'Visoespacial/Ejecutiva': '#8b5cf6',
      'Identificación': '#3b82f6',
      'Memoria': '#10b981',
      'Atención': '#f59e0b',
      'Lenguaje': '#ec4899',
      'Abstracción': '#6366f1',
      'Orientación': '#14b8a6',
    };

    const categoryColor = categoryColors[currentQuestion.category || ''] || colors.primary;

    return (
      <View style={styles.evaluationContainer}>
        {/* Header con progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Categoría */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {currentQuestion.category}
          </Text>
        </View>

        <ScrollView 
          style={styles.questionScroll}
          contentContainerStyle={styles.questionScrollContent}
        >
          {/* Pregunta */}
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
            {currentQuestion.description && (
              <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
            )}
            {currentQuestion.instructions && (
              <View style={styles.instructionsBox}>
                <Info size={16} color={colors.primary} />
                <Text style={styles.instructionsText}>{currentQuestion.instructions}</Text>
              </View>
            )}
          </View>

          {/* Opciones de respuesta */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = getResponse(currentQuestion.id) === option.option_value;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(option.option_value)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionRadio,
                      isSelected && styles.optionRadioSelected,
                    ]}>
                      {isSelected && <View style={styles.optionRadioInner} />}
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}>
                        {option.option_label}
                      </Text>
                      {option.option_description && (
                        <Text style={styles.optionDescription}>
                          {option.option_description}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.optionScore,
                      isSelected && styles.optionScoreSelected,
                    ]}>
                      <Text style={[
                        styles.optionScoreText,
                        isSelected && styles.optionScoreTextSelected,
                      ]}>
                        {option.option_value}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Navegación */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft size={20} color={currentQuestionIndex === 0 ? colors.textMuted : colors.primary} />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <TouchableOpacity
              style={[styles.completeButton, !isAllQuestionsAnswered() && styles.disabledButton]}
              onPress={handleComplete}
              disabled={!isAllQuestionsAnswered()}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.completeButtonText}>Completar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, !isCurrentQuestionAnswered() && styles.navButtonDisabled]}
              onPress={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
            >
              <Text style={[styles.navButtonText, !isCurrentQuestionAnswered() && styles.navButtonTextDisabled]}>
                Siguiente
              </Text>
              <ArrowRight size={20} color={!isCurrentQuestionAnswered() ? colors.textMuted : colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Indicador de auto-avance */}
        <View style={styles.autoAdvanceIndicator}>
          {autoAdvanceQuestions ? (
            <>
              <Zap size={14} color={colors.primary} />
              <Text style={styles.autoAdvanceText}>Avance automático activado</Text>
            </>
          ) : (
            <>
              <ZapOff size={14} color={colors.textMuted} />
              <Text style={[styles.autoAdvanceText, { color: colors.textMuted }]}>
                Avance automático desactivado
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  // Renderizar resultados
  const renderResults = () => {
    if (!results) return null;

    const domainScores = calculateDomainScores();

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Resultados MoCA</Text>
          
          {/* Paciente */}
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientData.name}</Text>
            {patientData.age && <Text style={styles.patientDetail}>Edad: {patientData.age} años</Text>}
            {patientData.educationYears !== undefined && (
              <Text style={styles.patientDetail}>
                Educación: {patientData.educationYears} años {results.educationAdjustment > 0 && '(+1 ajuste)'}
              </Text>
            )}
          </View>

          {/* Puntuación Principal */}
          <View style={[styles.scoreBox, { backgroundColor: results.interpretation.color + '15', borderColor: results.interpretation.color }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreColumn}>
                <Text style={styles.scoreLabel}>Puntuación Bruta</Text>
                <Text style={styles.scoreValue}>{results.rawScore}/{maxScore}</Text>
              </View>
              {results.educationAdjustment > 0 && (
                <View style={styles.scoreColumn}>
                  <Text style={styles.scoreLabel}>Ajuste Educativo</Text>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>+{results.educationAdjustment}</Text>
                </View>
              )}
              <View style={styles.scoreColumn}>
                <Text style={styles.scoreLabel}>Puntuación Final</Text>
                <Text style={[styles.scoreValue, { fontSize: 36, color: results.interpretation.color }]}>
                  {results.adjustedScore}/{maxScore}
                </Text>
              </View>
            </View>
          </View>

          {/* Interpretación */}
          <View style={styles.interpretationCard}>
            <Text style={[styles.interpretationLevel, { color: results.interpretation.color }]}>
              {results.interpretation.level}
            </Text>
            <Text style={styles.interpretationDescription}>
              {results.interpretation.description}
            </Text>
          </View>

          {/* Puntuación por Dominios */}
          <View style={styles.domainsCard}>
            <Text style={styles.domainsTitle}>Puntuación por Dominios Cognitivos</Text>
            <View style={styles.domainsList}>
              <DomainScore label="Visoespacial/Ejecutiva" score={domainScores.visoespacialEjecutiva} max={5} color="#8b5cf6" />
              <DomainScore label="Identificación" score={domainScores.identificacion} max={3} color="#3b82f6" />
              <DomainScore label="Atención" score={domainScores.atencion} max={6} color="#f59e0b" />
              <DomainScore label="Lenguaje" score={domainScores.lenguaje} max={3} color="#ec4899" />
              <DomainScore label="Abstracción" score={domainScores.abstraccion} max={2} color="#6366f1" />
              <DomainScore label="Recuerdo Diferido" score={domainScores.recuerdoDiferido} max={5} color="#10b981" />
              <DomainScore label="Orientación" score={domainScores.orientacion} max={6} color="#14b8a6" />
            </View>
          </View>

          {/* Recomendaciones */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>Recomendaciones</Text>
            <Text style={styles.recommendationsText}>
              {results.interpretation.recommendations}
            </Text>
          </View>

          {/* Acciones */}
          <ResultsActions
            scaleId="moca"
            scaleName="MoCA"
            scaleAcronym="MoCA"
            results={results}
            patientData={patientData}
            responses={responses}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReset}
          >
            <Text style={styles.secondaryButtonText}>Nueva Evaluación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: 'MoCA',
          headerShown: true,
        }}
      />

      {step === 'info' && renderInfo()}
      {step === 'form' && renderForm()}
      {step === 'evaluation' && renderEvaluation()}
      {step === 'results' && renderResults()}

      {showInfo && (
        <ScaleInfo
          scaleInfo={scaleInfo}
          visible={showInfo}
          onClose={() => setShowInfo(false)}
        />
      )}
    </SafeAreaView>
  );
}

// Componente auxiliar para mostrar puntuación por dominio
function DomainScore({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const percentage = (score / max) * 100;
  
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '600' }}>
          {score}/{max}
        </Text>
      </View>
      <View style={{ 
        height: 8, 
        backgroundColor: '#f3f4f6', 
        borderRadius: 4, 
        overflow: 'hidden' 
      }}>
        <View style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          backgroundColor: color,
          borderRadius: 4 
        }} />
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    ...colors.shadow,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    ...colors.shadow,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    marginLeft: 8,
    lineHeight: 18,
  },
  interpretationList: {
    marginTop: 8,
  },
  interpretationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  interpretationScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  interpretationLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 2,
  },
  domainsList: {
    marginTop: 8,
  },
  domainItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingLeft: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  educationSection: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  educationSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 4,
  },
  educationInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  educationNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  evaluationContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 16,
    marginBottom: 0,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionScroll: {
    flex: 1,
  },
  questionScrollContent: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...colors.shadow,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  questionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight || colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    ...colors.shadow,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || colors.surface,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  optionScore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  optionScoreSelected: {
    backgroundColor: colors.primary,
  },
  optionScoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionScoreTextSelected: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  autoAdvanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.background,
  },
  autoAdvanceText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
  },
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    ...colors.shadow,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  patientInfo: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreColumn: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  interpretationCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  interpretationLevel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  interpretationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  domainsCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  domainsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  recommendationsCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});

