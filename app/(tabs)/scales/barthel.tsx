import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleAlert as AlertCircle, ArrowLeft, ArrowRight, FileText, User } from 'lucide-react-native';
import { useScalesStore } from '@/store/scales';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { OptionRow } from '@/components/OptionRow';

// Importar las preguntas desde un archivo separado
import { questions } from '@/data/barthel';

// Hook personalizado para manejar la evaluación de Barthel
function useBarthelAssessment() {
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    doctorName: '',
  });
  const [currentStep, setCurrentStep] = useState<'form' | 'questions' | 'results'>('form');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const addRecentlyViewed = useScalesStore(state => state.addRecentlyViewed);

  const handlePatientDataChange = useCallback((field: keyof typeof patientData) => (value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  }, []);

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

  const validateForm = useCallback(() => {
    return Object.values(patientData).every(value => value.trim() !== '');
  }, [patientData]);

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

  const resetAssessment = useCallback(() => {
    setPatientData({ name: '', age: '', gender: '', doctorName: '' });
    setAnswers({});
    setCurrentQuestion(0);
    setCurrentStep('form');
  }, []);

  return {
    patientData,
    currentStep,
    currentQuestion,
    answers,
    handlePatientDataChange,
    handleAnswer,
    calculateTotal,
    getInterpretation,
    validateForm,
    nextQuestion,
    prevQuestion,
    setCurrentStep,
    resetAssessment
  };
}

export default function BarthelScale() {
  const router = useRouter();
  const { colors, getScoreColor } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    patientData,
    currentStep,
    currentQuestion,
    answers,
    handlePatientDataChange,
    handleAnswer,
    calculateTotal,
    getInterpretation,
    validateForm,
    nextQuestion,
    prevQuestion,
    setCurrentStep,
    resetAssessment
  } = useBarthelAssessment();


  // Crear estilos dinámicos
  const dynamicStyles = useMemo(() => StyleSheet.create({
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
      shadowColor: colors.shadowColor,
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
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    button: {
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSecondaryText: {
      color: colors.buttonSecondaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    resultSection: {
      backgroundColor: colors.sectionBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
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
    },
  }), [colors]);

  // Memoizar el componente de resultados para evitar renderizados innecesarios
  const ResultsContent = useMemo(() => {
    const total = calculateTotal();
    const interpretation = getInterpretation(total);
    
    return (
      <View style={dynamicStyles.container}>
          <Text style={[dynamicStyles.title, { color: colors.text }]}>Resultados Escala de Barthel</Text>
        <View style={dynamicStyles.resultSection}>
          <Text style={dynamicStyles.sectionTitle}>Datos del Paciente</Text>
          <Text style={dynamicStyles.resultText}>
            <Text style={dynamicStyles.bold}>Nombre:</Text> {patientData.name}
          </Text>
          <Text style={dynamicStyles.resultText}>
            <Text style={dynamicStyles.bold}>Edad:</Text> {patientData.age}
          </Text>
          <Text style={dynamicStyles.resultText}>
            <Text style={dynamicStyles.bold}>Género:</Text> {patientData.gender}
          </Text>
          <Text style={dynamicStyles.resultText}>
            <Text style={dynamicStyles.bold}>Médico:</Text> {patientData.doctorName}
          </Text>
        </View>
        <View style={dynamicStyles.resultSection}>
          <Text style={[dynamicStyles.sectionTitle, { color: colors.text }]}>Puntuación</Text>
          <Text style={[dynamicStyles.resultText, { color: colors.text }] }>
            <Text style={dynamicStyles.bold}>Total:</Text> {total}/100
          </Text>
          <Text style={[styles.interpretationText, { color: colors[interpretation.colorKey] }]}>
            {interpretation.result}
          </Text>
          <Text style={[dynamicStyles.resultText, { color: colors.mutedText }]}>{interpretation.explanation}</Text>
        </View>
        <View style={dynamicStyles.resultSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Detalle de Respuestas</Text>
          {questions.map(q => {
            const answer = answers[q.id];
            if (answer !== undefined) {
              const selectedOption = q.options.find(opt => opt.value === answer);
              return (
                <View key={q.id} style={styles.detailItem}>
                  <Text style={[styles.bold, { color: colors.text }]}>{q.question}</Text>
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
  }, [answers, calculateTotal, getInterpretation, handleExport, patientData, resetAssessment]);

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
          <ScrollView contentContainerStyle={dynamicStyles.content}>
            <View style={dynamicStyles.formContainer}>
              <Text style={dynamicStyles.title}>Datos del Paciente</Text>
              <PatientForm
                scaleId="barthel"
                allowSkip
                onContinue={() => setCurrentStep('questions')}
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
    fontSize: 16,
    marginHorizontal: 5,
  },
  progressText: {
    marginTop: 15,
    textAlign: 'center',
    color: colors.mutedText,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  detailItem: {
    marginBottom: 10,
  },
});