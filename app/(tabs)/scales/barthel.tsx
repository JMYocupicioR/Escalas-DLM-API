import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { RadioButton } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';
import { useScalesStore } from '@/store/scales';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { OptionRow } from '@/components/OptionRow';

// Importar las preguntas desde un archivo separado
import { questions } from '@/data/barthel';
import { useAuthSession } from '@/hooks/useAuthSession';
import { createAssessment } from '@/api/assessments';

// Hook personalizado para manejar la evaluación de Barthel
function useBarthelAssessment() {
  const [patientData, setPatientData] = useState({
    id: undefined as string | undefined, // Add ID field
    name: '',
    age: '',
    gender: '',
    doctorName: '',
  });
  const [currentStep, setCurrentStep] = useState<'form' | 'questions' | 'results'>('form');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const addRecentlyViewed = useScalesStore(state => state.addRecentlyViewed);



  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const calculateTotal = useCallback(() => {
    if (Object.keys(answers).length === 0) return 0;
    return Object.values(answers).reduce((sum, value) => {
      // Validación para asegurar que value es un número
      const numValue = typeof value === 'number' ? value : parseInt(value, 10);
      return isNaN(numValue) ? sum : sum + numValue;
    }, 0);
  }, [answers]);

  const getInterpretation = useCallback((total: number) => {
    // Usamos colores estáticos aquí ya que este hook no tiene acceso directo a useThemedStyles
    // Los colores se pasarán desde el componente principal
    if (total < 45)
      return {
        result: 'Incapacidad funcional Severa',
        explanation: 'El paciente presenta una dependencia importante para las actividades básicas de la vida diaria.',
        colorKey: 'scoreLow',
      };
    if (total < 60)
      return {
        result: 'Incapacidad funcional Grave',
        explanation: 'El paciente requiere asistencia regular para varias actividades básicas.',
        colorKey: 'scoreMedium',
      };
    if (total < 80)
      return {
        result: 'Incapacidad funcional Moderada',
        explanation: 'El paciente necesita asistencia en algunas áreas específicas.',
        colorKey: 'scoreGood',
      };
    if (total < 100)
      return {
        result: 'Incapacidad funcional Ligera',
        explanation: 'El paciente es mayormente independiente con mínima asistencia.',
        colorKey: 'scoreExcellent',
      };
    return {
      result: 'Independencia completa',
      explanation: 'El paciente puede realizar todas las actividades básicas sin asistencia.',
      colorKey: 'scoreOptimal',
    };
  }, []);



  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('results');
      addRecentlyViewed('barthel');
    }
  }, [currentQuestion, addRecentlyViewed]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);



  return {
    patientData,
    currentStep,
    currentQuestion,
    answers,
    handleAnswer,
    setPatientData,
    calculateTotal,
    getInterpretation,
    nextQuestion,
    prevQuestion,
    setCurrentStep
  };
}

export default function BarthelScale() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    patientData,
    currentStep,
    currentQuestion,
    answers,
    handleAnswer,
    calculateTotal,
    setPatientData,
    getInterpretation,
    nextQuestion,
    prevQuestion,
    setCurrentStep,
  } = useBarthelAssessment();



  const { session } = useAuthSession();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!patientData.id || !session?.user.id) return;
    setIsSaving(true);
    try {
      const total = calculateTotal();
      const interpretation = getInterpretation(total);
      
      const { error } = await createAssessment(session.user.id, {
        patient_id: patientData.id,
        scale_slug: 'barthel',
        scale_id: undefined, // scale_id is optional/null if not linked to medical_scales table yet
        responses: answers,
        total_score: total,
        interpretation: interpretation.result,
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
  };


  // Memoizar el componente de resultados para evitar renderizados innecesarios
  const ResultsContent = useMemo(() => {
    const total = calculateTotal();
    const interpretation = getInterpretation(total);
    
    return (
      <View style={styles.container}>
          <Text style={styles.title}>Resultados Escala de Barthel</Text>
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Datos del Paciente</Text>
          <Text style={styles.resultText}>
            <Text style={styles.bold}>Nombre:</Text> {patientData.name}
          </Text>
          <Text style={styles.resultText}>
            <Text style={styles.bold}>Edad:</Text> {patientData.age}
          </Text>
          <Text style={styles.resultText}>
            <Text style={styles.bold}>Género:</Text> {patientData.gender}
          </Text>
          <Text style={styles.resultText}>
            <Text style={styles.bold}>Médico:</Text> {patientData.doctorName}
          </Text>
        </View>
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Puntuación</Text>
          <Text style={styles.resultText}>
            <Text style={styles.bold}>Total:</Text> {total}/100
          </Text>
          <Text style={[styles.interpretationText, { color: (colors[interpretation.colorKey as keyof typeof colors] as string) || colors.text }]}>
            {interpretation.result}
          </Text>
          <Text style={[styles.resultText, { color: colors.mutedText }]}>{interpretation.explanation}</Text>
        </View>
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Detalle de Respuestas</Text>
          {questions.map(q => {
            const answer = answers[q.id];
            if (answer !== undefined) {
              const selectedOption = q.options.find(opt => opt.value === answer);
              return (
                <View key={q.id} style={styles.detailItem}>
                  <Text style={[styles.bold, { marginBottom: 4 }]}>{q.question}</Text>
                  {selectedOption && (
                    <Text style={{ color: colors.mutedText }}>
                      {selectedOption.label} ({selectedOption.value} puntos)
                    </Text>
                  )}
                </View>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  }, [answers, calculateTotal, getInterpretation, patientData, colors, styles]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Escala de Barthel',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              accessible={true}
              accessibilityLabel="Volver atrás"
              accessibilityRole="button"
            >
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {currentStep === 'form' && (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Datos del Paciente</Text>
              <PatientForm
                scaleId="barthel"
                allowSkip
                onContinue={(data) => {
                  if (data) {
                    setPatientData(prev => ({
                      ...prev,
                      id: data.id,
                      name: data.name || prev.name,
                      age: data.age?.toString() || prev.age,
                      gender: data.gender || prev.gender,
                      doctorName: data.doctorName || prev.doctorName,
                    }));
                  }
                  setCurrentStep('questions');
                }}
              />
            </View>
          </ScrollView>
        )}

        {currentStep === 'questions' && (
          <ScrollView contentContainerStyle={styles.content}>
            {questions[currentQuestion] && (
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>
                  {questions[currentQuestion].question}
                </Text>
                <Text style={styles.questionDescription}>
                  {questions[currentQuestion].description}
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => {
                    handleAnswer(questions[currentQuestion].id, parseInt(value, 10));
                    setTimeout(() => nextQuestion(), 0);
                  }}
                  value={answers[questions[currentQuestion].id]?.toString()}
                >
                  {questions[currentQuestion].options.map(option => (
                    <OptionRow
                      key={option.value}
                      value={option.value.toString()}
                      selectedValue={answers[questions[currentQuestion].id]?.toString()}
                      label={option.label}
                      description={option.description}
                      onSelect={(value) => {
                        handleAnswer(questions[currentQuestion].id, parseInt(value, 10));
                        setTimeout(() => nextQuestion(), 0);
                      }}
                      containerStyle={styles.optionContainer}
                      labelStyle={styles.optionLabel}
                      descriptionStyle={styles.optionDescription}
                    />
                  ))}
                </RadioButton.Group>
                <View style={styles.navigation}>
                  {currentQuestion > 0 && (
                    <TouchableOpacity 
                      style={styles.navButton} 
                      onPress={prevQuestion}
                      accessible={true}
                      accessibilityLabel="Pregunta anterior"
                      accessibilityRole="button"
                    >
                      <ArrowLeft color="#fff" size={20} />
                      <Text style={styles.navButtonText}>Anterior</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.progressText}>
                  Pregunta {currentQuestion + 1} de {questions.length}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {currentStep === 'results' && (
          <ScrollView contentContainerStyle={styles.content}>
            {ResultsContent}
            <ResultsActions
              assessment={{
                patientData: {
                  name: patientData.name,
                  age: patientData.age,
                  gender: patientData.gender,
                  doctorName: patientData.doctorName,
                },
                score: calculateTotal(),
                interpretation: getInterpretation(calculateTotal()).result,
                answers: questions
                  .filter(q => answers[q.id] !== undefined)
                  .map(q => {
                    const val = answers[q.id];
                    const sel = q.options.find(o => o.value === val);
                    return {
                      id: q.id,
                      question: q.question,
                      label: sel?.label,
                      value: val,
                      points: sel?.value,
                    };
                  }),
              }}
              scale={{ id: 'barthel', name: 'Escala de Barthel' } as any}
              containerStyle={{ marginTop: 12 }}
              onSave={handleSave}
              canSave={!!patientData.id}
              saving={isSaving}
            />
          </ScrollView>
        )}
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
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tagBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: colors.mutedText,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  questionDescription: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
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
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  progressText: {
    marginTop: 15,
    textAlign: 'center',
    color: colors.mutedText,
    fontSize: 16,
  },
  interpretationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  resultsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultSection: {
    backgroundColor: colors.sectionBackground || colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border || '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
  detailItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#eee',
  },
});