import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useDenverAssessment } from '@/hooks/useDenverAssessment';
import { DenverGuide, DenverInfoButton, DenverQuickTips } from '@/components/DenverGuide';
import { ResultsActions } from '@/components/ResultsActions';
import { denverItems } from '@/data/denver';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';


export default function Denver2Screen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showGuide, setShowGuide] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const webDateInputRef = useRef<any>(null);
  
  const {
    currentStep,
    patientData,
    setPatientData,
    answers,
    startEvaluation,
    relevantQuestions,
    handleAnswer,
    nextStep,
    prevStep,
    calculateResults,
    progress,
    ageForEval: hookAgeForEval
  } = useDenverAssessment();

  const handleInputChange = (field: keyof typeof patientData) => (value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
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

  if (currentStep === 'results') {
    const results = calculateResults();
    const { overallInterpretation: interpretation, recommendation, ageInfo, counts } = results || {};
    const ageForEval = ageInfo?.adjustedAgeMonths || hookAgeForEval || 0;
    const delays = counts?.delays || 0;
    const cautions = counts?.cautions || 0;
    const answerLabelMap: Record<string, string> = { P: 'Pasó', F: 'Falló', R: 'Rehusó', NO: 'Sin oportunidad' } as any;
    const answersArray = Object.entries(answers).map(([id, value]) => {
      const q = denverItems.find(item => item.id === id);
      return {
        id,
        question: q ? `${q.domain}: ${q.text}` : id,
        label: (answerLabelMap as any)[value] ?? String(value),
        value: String(value),
      };
    });
    const responseCounts = { P: 0, F: 0, R: 0, NO: 0 } as Record<string, number>;
    Object.values(answers).forEach(v => { if (responseCounts[v as string] !== undefined) responseCounts[v as string]++; });
    const flagged = {
      delays: results.areaResults ? Object.values(results.areaResults).flatMap(area => area.delays) : [],
      cautions: results.areaResults ? Object.values(results.areaResults).flatMap(area => area.cautions) : []
    };
    const chronologicalMonths = ageInfo?.chronologicalAgeMonths || 0;
    const correctedApplied = ageInfo?.wasPremature || false;
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Resultados Denver II' }} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Resultados de la Evaluación</Text>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Interpretación: {interpretation}</Text>
            <Text style={styles.resultsText}>Edad de Evaluación: {ageForEval ? ageForEval.toFixed(1) : '0.0'} meses</Text>
            <Text style={styles.resultsText}>Retrasos: {delays}</Text>
            <Text style={styles.resultsText}>Precauciones: {cautions}</Text>
            <Text style={styles.recommendation}>{recommendation}</Text>
          </View>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Resumen del Caso</Text>
            {!!patientData.name && (<Text style={styles.resultsText}>Paciente: {patientData.name}</Text>)}
            {!!patientData.examiner && (<Text style={styles.resultsText}>Examinador: {patientData.examiner}</Text>)}
            {!!patientData.birthDate && (<Text style={styles.resultsText}>Fecha de nacimiento: {patientData.birthDate}</Text>)}
            {!!patientData.gestationalWeeks && (<Text style={styles.resultsText}>Semanas de gestación: {patientData.gestationalWeeks}</Text>)}
            {chronologicalMonths > 0 && (
              <Text style={styles.resultsText}>
                Edad cronológica: {chronologicalMonths ? chronologicalMonths.toFixed(1) : '0.0'} meses {correctedApplied ? '(se aplicó corrección por prematuridad)' : ''}
              </Text>
            )}
          </View>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Distribución de Respuestas</Text>
            <Text style={styles.resultsText}>P: {responseCounts.P}  |  F: {responseCounts.F}  |  R: {responseCounts.R}  |  NO: {responseCounts.NO}</Text>
            <Text style={styles.recommendation}>
              "Retraso" = fallo/rehuso en ítems &gt; p90 para la edad. "Precaución" = ítems &gt; p75.
            </Text>
          </View>
          {(flagged.delays.length > 0 || flagged.cautions.length > 0) && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Hallazgos Clave</Text>
              {flagged.delays.length > 0 && (
                <Text style={styles.resultsText}>
                  Retrasos: {flagged.delays.slice(0, 6).map(q => `${q.domain} - ${q.text}`).join('; ')}{flagged.delays.length > 6 ? '…' : ''}
                </Text>
              )}
              {flagged.cautions.length > 0 && (
                <Text style={styles.resultsText}>
                  Precauciones: {flagged.cautions.slice(0, 6).map(q => `${q.domain} - ${q.text}`).join('; ')}{flagged.cautions.length > 6 ? '…' : ''}
                </Text>
              )}
            </View>
          )}
          <ResultsActions
            assessment={{
              patientData: {
                name: patientData.name,
                doctorName: patientData.examiner,
                age: `${ageForEval ? ageForEval.toFixed(1) : '0.0'} meses (${correctedApplied ? 'ajustada' : 'cronológica'})`,
              },
              score: `Retrasos: ${delays} | Precauciones: ${cautions}`,
              interpretation,
              answers: answersArray,
            }}
            scale={{ id: 'denver2', name: 'Denver II' } as any}
            containerStyle={{ marginTop: 12 }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: currentStep === 'form' ? 'Denver II - Datos del Paciente' : `Denver II - ${currentStep}`,
          headerRight: () => (
            <DenverInfoButton onPress={() => setShowGuide(true)} />
          )
        }} 
      />
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {currentStep === 'form' ? 'Datos del paciente' : 
           currentStep === 'results' ? 'Resultados' : 
           `Evaluando: ${currentStep}`}
        </Text>
      </View>
      
      {/* Quick Tips for current step */}
      {currentStep !== 'results' && (
        <DenverQuickTips step={currentStep} />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {currentStep === 'form' ? (
          <View>
            <Text style={styles.title}>Datos de Identificación</Text>
            <TextInput placeholder="Nombre del Paciente" style={styles.input} value={patientData.name} onChangeText={handleInputChange('name')} />
            <TextInput placeholder="Nombre del Examinador" style={styles.input} value={patientData.examiner} onChangeText={handleInputChange('examiner')} />
            {(Platform.OS !== 'web' && !CommunityDateTimePicker) ? (
              <TextInput placeholder="Fecha de Nacimiento (YYYY-MM-DD)" style={styles.input} value={patientData.birthDate} onChangeText={handleInputChange('birthDate')} />
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
            <TextInput placeholder="Semanas de Gestación" style={styles.input} keyboardType="numeric" value={patientData.gestationalWeeks} onChangeText={handleInputChange('gestationalWeeks')} />
          </View>
        ) : (
          <View>
            <Text style={styles.title}>{`Área: ${currentStep}`}</Text>
            {relevantQuestions.map(q => (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.questionText}>{q.text}</Text>
                <View style={styles.optionsContainer}>
                  {['P', 'F', 'R', 'NO'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionButton, answers[q.id] === option && styles.optionSelected]}
                      onPress={() => handleAnswer(q.id, option as any)}
                      disabled={option === 'NO' && !q.reportable}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={prevStep} disabled={currentStep === 'form'} style={styles.navButton}>
          <ArrowLeft color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={currentStep === 'form' ? startEvaluation : nextStep} style={styles.navButton}>
          <ArrowRight color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Denver Guide Modal */}
      <DenverGuide 
        visible={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    fontSize: 16
  },
  inputLikeButton: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  inputLikeText: {
    color: colors.text,
    fontSize: 16,
  },
  progressBarContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 4,
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  navButton: {
    padding: 12,
  },
  resultsCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modalActions: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});
