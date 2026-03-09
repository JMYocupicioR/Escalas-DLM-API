import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { questions, options, fimCategories } from '@/data/fim';
import { useScalesStore } from '@/store/scales';
import { useAuthSession } from '@/hooks/useAuthSession';
import { createAssessment } from '@/api/assessments';
import { ResultsActions } from '@/components/ResultsActions';
import { useFimAssessment } from '@/hooks/useFimAssessment';

export default function FimScaleScreen() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Obtener datos del paciente del store si existe
  const getCurrentPatient = useScalesStore((state) => state.getCurrentPatient);
  const currentPatient = getCurrentPatient();

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
    motorScore,
    cognitiveScore,
    getInterpretation,
    // resetAssessment, // Unused
  } = useFimAssessment();

  const { session } = useAuthSession();
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar datos del paciente
  React.useEffect(() => {
    if (currentPatient) {
      setPatientData({
        id: currentPatient.id,
        name: currentPatient.name,
        age: currentPatient.age ? currentPatient.age.toString() : '',
        gender: currentPatient.gender,
        doctorName: currentPatient.attendingPhysician || ''
      });
    }
  }, [currentPatient, setPatientData]);

  const handleSave = useCallback(async () => {
    if (!patientData.id || !session?.user.id) return;
    setIsSaving(true);
    try {
      const interpretation = getInterpretation();
      const { error } = await createAssessment(session.user.id, {
        patient_id: patientData.id,
        scale_slug: 'fim',
        scale_id: undefined,
        responses: answers,
        total_score: totalScore,
        interpretation: interpretation.level,
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
  }, [patientData, session, answers, totalScore, getInterpretation]);

  const goToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Datos del Paciente</Text>
        <PatientForm
          scaleId="fim"
          onContinue={(data) => {
            if (data) {
                setPatientData({
                    id: data.id,
                    name: data.name || '',
                    age: data.age?.toString() || '',
                    gender: data.gender || '',
                    doctorName: data.doctorName || ''
                });
            }
            setCurrentStep('questions');
          }}
          allowSkip={false}
        />
      </View>
    </ScrollView>
  );

  const renderQuestions = () => {
    const question = questions[currentQuestion];
    const categoryName = fimCategories[question.category as keyof typeof fimCategories];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionContainer}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <Text style={styles.questionTitle}>{question.question}</Text>
            <Text style={styles.questionDescription}>{question.description}</Text>

            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Pregunta {currentQuestion + 1} de {questions.length}</Text>
            
            <View style={styles.optionsContainer}>
                {options.map(opt => (
                    <TouchableOpacity 
                        key={opt.value} 
                        style={styles.optionRow}
                        onPress={() => {
                            handleAnswer(question.id, opt.value);
                            setTimeout(() => nextQuestion(), 100);
                        }}
                    >
                        <View style={[styles.scoreDot, {
                            backgroundColor: answers[question.id] === opt.value ? colors.primary : colors.border
                        }]}/>
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionLabel}>{opt.value} - {opt.label}</Text>
                            <Text style={styles.optionDescription}>{opt.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.navigation}>
                {currentQuestion > 0 && (
                <TouchableOpacity style={styles.navButton} onPress={prevQuestion}>
                    <ArrowLeft color={colors.primary} size={20} />
                    <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>
                )}
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
          <Text style={styles.title}>Resultados de la Escala FIM</Text>

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
            {patientData.doctorName ? (
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Médico:</Text>
                <Text style={styles.patientInfoValue}>{patientData.doctorName}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Puntuación General</Text>
            <Text style={[styles.scoreText, { color: (colors[interpretation.colorKey as keyof typeof colors] as string) || colors.text }]}>
              {totalScore} / 126
            </Text>
            <Text style={styles.interpretationText}>{interpretation.level}</Text>
          </View>
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Desglose de Puntuación</Text>
            <View style={styles.scoreBreakdown}>
                <Text style={styles.resultText}>Motor:</Text>
                <Text style={styles.resultTextBold}>{motorScore} / 91</Text>
            </View>
            <View style={styles.scoreBreakdown}>
                <Text style={styles.resultText}>Cognitivo:</Text>
                <Text style={styles.resultTextBold}>{cognitiveScore} / 35</Text>
            </View>
          </View>
        </View>
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
              interpretation: interpretation.level,
              answers: Object.entries(answers).map(([id, value]) => {
                 const q = questions.find(q => q.id === id);
                 const opt = options.find(o => o.value === value);
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
              id: 'fim', 
              name: 'Indice FIM' 
            }}
            containerStyle={{ marginTop: 16 }}
            onSave={handleSave}
            canSave={!!patientData.id}
            saving={isSaving}
          />
          
          <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton]}
            onPress={goToHome}
            accessibilityLabel="Regresar al inicio"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, { color: colors.card }]}>
              Regresar al Inicio
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };


  return (
    <>
      <Stack.Screen
        options={{
          title: 'Escala FIM',
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedText,
        textAlign: 'center',
    },
    scoreButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      marginHorizontal: 4,
    },
    scoreButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Add new styles here
    formContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    questionContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.mutedText,
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    questionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    questionDescription: {
        fontSize: 16,
        color: colors.mutedText,
        textAlign: 'center',
        marginBottom: 24,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        fontSize: 12,
        color: colors.mutedText,
        textAlign: 'center',
        marginBottom: 24,
    },
    optionsContainer: {
        marginBottom: 24,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    scoreDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    optionDescription: {
        fontSize: 14,
        color: colors.mutedText,
        marginTop: 4,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    navButtonText: {
        color: colors.primary,
        fontSize: 16,
        marginLeft: 8,
    },
    resultsContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
    },
    resultSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.mutedText,
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    interpretationText: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.text,
    },
    scoreBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        paddingVertical: 8,
    },
    resultText: {
        fontSize: 16,
        color: colors.text,
    },
    resultTextBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    actionsContainer: {
        marginTop: 24,
        gap: 12,
    },
    actionButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        backgroundColor: colors.border,
        borderWidth: 1,
        borderColor: colors.border,
    },
    exportButton: {
        backgroundColor: colors.primary,
    },
    homeButton: {
        backgroundColor: colors.mutedText,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    patientInfoCard: {
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
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
  });
