import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleAlert as AlertCircle, ArrowLeft, ArrowRight, FileText, User } from 'lucide-react-native';
import { useScalesStore } from '@/store/scales';

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
    if (total < 45)
      return {
        result: 'Incapacidad funcional Severa',
        explanation: 'El paciente presenta una dependencia importante para las actividades básicas de la vida diaria.',
        color: '#ef4444',
      };
    if (total < 60)
      return {
        result: 'Incapacidad funcional Grave',
        explanation: 'El paciente requiere asistencia regular para varias actividades básicas.',
        color: '#f97316',
      };
    if (total < 80)
      return {
        result: 'Incapacidad funcional Moderada',
        explanation: 'El paciente necesita asistencia en algunas áreas específicas.',
        color: '#eab308',
      };
    if (total < 100)
      return {
        result: 'Incapacidad funcional Ligera',
        explanation: 'El paciente es mayormente independiente con mínima asistencia.',
        color: '#22c55e',
      };
    return {
      result: 'Independencia completa',
      explanation: 'El paciente puede realizar todas las actividades básicas sin asistencia.',
      color: '#15803d',
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

  const generatePDFContent = useCallback((total: number, interpretation: ReturnType<typeof getInterpretation>) => {
    let detailHTML = '';
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const selectedOption = q.options.find(opt => opt.value === answer);
        if (selectedOption) {
          detailHTML += `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
              <h4>${q.question}</h4>
              <p><strong>${selectedOption.label}</strong> (${selectedOption.value} puntos)</p>
              <p>${selectedOption.description}</p>
            </div>
          `;
        }
      }
    });

    const today = new Date().toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Resultados Escala de Barthel</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; padding: 15px; border-radius: 8px; background: #f8fafc; }
            .result { font-size: 24px; color: ${interpretation.color}; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Resultados Escala de Barthel</h1>
              <p>${today}</p>
            </div>
            <div class="section">
              <h2>Datos del Paciente</h2>
              <p><strong>Nombre:</strong> ${patientData.name}</p>
              <p><strong>Edad:</strong> ${patientData.age}</p>
              <p><strong>Género:</strong> ${patientData.gender}</p>
              <p><strong>Médico/Evaluador:</strong> ${patientData.doctorName}</p>
            </div>
            <div class="section">
              <h2>Puntuación Total: ${total}/100</h2>
              <p class="result">${interpretation.result}</p>
              <p>${interpretation.explanation}</p>
            </div>
            <div class="section">
              <h2>Detalle de Respuestas</h2>
              ${detailHTML}
            </div>
          </div>
        </body>
      </html>
    `;
  }, [answers, patientData]);

  const handleExport = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Exportación Web', 'La exportación a PDF no está disponible en la versión web por el momento.');
      return;
    }
    
    try {
      const total = calculateTotal();
      const interpretation = getInterpretation(total);
      const htmlContent = generatePDFContent(total, interpretation);

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar Resultados',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert(
        'Error de Exportación',
        'Ha ocurrido un error al generar el PDF. Por favor intente nuevamente.'
      );
    }
  }, [calculateTotal, getInterpretation, generatePDFContent]);

  // Memoizar el componente de resultados para evitar renderizados innecesarios
  const ResultsContent = useMemo(() => {
    const total = calculateTotal();
    const interpretation = getInterpretation(total);
    
    return (
      <View style={styles.resultsContainer}>
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
          <Text style={[styles.resultText, { color: interpretation.color }]}>
            {interpretation.result}
          </Text>
          <Text style={styles.resultText}>{interpretation.explanation}</Text>
        </View>
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Detalle de Respuestas</Text>
          {questions.map(q => {
            const answer = answers[q.id];
            if (answer !== undefined) {
              const selectedOption = q.options.find(opt => opt.value === answer);
              return (
                <View key={q.id} style={styles.detailItem}>
                  <Text style={styles.bold}>{q.question}</Text>
                  {selectedOption && (
                    <Text>
                      {selectedOption.label} ({selectedOption.value} puntos)
                    </Text>
                  )}
                </View>
              );
            }
            return null;
          })}
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleExport}
          accessible={true}
          accessibilityLabel="Exportar resultados como PDF"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Imprimir/Exportar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#ef4444' }]} 
          onPress={resetAssessment}
          accessible={true}
          accessibilityLabel="Reiniciar cuestionario"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Reiniciar Cuestionario</Text>
        </TouchableOpacity>
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
              <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        {currentStep === 'form' && (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Datos del Paciente</Text>
              <View style={styles.inputGroup}>
                <User size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del Paciente"
                  value={patientData.name}
                  onChangeText={handlePatientDataChange('name')}
                  accessibilityLabel="Nombre del paciente"
                />
              </View>
              <View style={styles.inputGroup}>
                <AlertCircle size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Edad"
                  keyboardType="numeric"
                  value={patientData.age}
                  onChangeText={handlePatientDataChange('age')}
                  accessibilityLabel="Edad del paciente"
                />
              </View>
              {/* Campo para seleccionar el género */}
              <View style={[styles.inputGroup, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={{ marginBottom: 8, fontSize: 16, color: '#0f172a' }}>Género:</Text>
                <RadioButton.Group
                  onValueChange={handlePatientDataChange('gender')}
                  value={patientData.gender}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RadioButton value="Masculino" />
                    <Text style={{ fontSize: 16, color: '#0f172a' }}>Masculino</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                    <RadioButton value="Femenino" />
                    <Text style={{ fontSize: 16, color: '#0f172a' }}>Femenino</Text>
                  </View>
                </RadioButton.Group>
              </View>
              <View style={styles.inputGroup}>
                <FileText size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del Médico/Evaluador"
                  value={patientData.doctorName}
                  onChangeText={handlePatientDataChange('doctorName')}
                  accessibilityLabel="Nombre del médico o evaluador"
                />
              </View>
              <TouchableOpacity
                style={[styles.button, !validateForm() && styles.buttonDisabled]}
                disabled={!validateForm()}
                onPress={() => setCurrentStep('questions')}
                accessible={true}
                accessibilityLabel="Comenzar evaluación"
                accessibilityRole="button"
                accessibilityState={{ disabled: !validateForm() }}
              >
                <Text style={styles.buttonText}>Comenzar Evaluación</Text>
              </TouchableOpacity>
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
                  onValueChange={(value) =>
                    handleAnswer(questions[currentQuestion].id, parseInt(value, 10))
                  }
                  value={answers[questions[currentQuestion].id]?.toString()}
                >
                  {questions[currentQuestion].options.map(option => (
                    <View key={option.value} style={styles.optionContainer}>
                      <RadioButton value={option.value.toString()} />
                      <View style={styles.optionTextContainer}>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                    </View>
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
                  <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={nextQuestion}
                    accessible={true}
                    accessibilityLabel={currentQuestion === questions.length - 1 ? "Finalizar evaluación" : "Siguiente pregunta"}
                    accessibilityRole="button"
                  >
                    <Text style={styles.navButtonText}>
                      {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </Text>
                    <ArrowRight color="#fff" size={20} />
                  </TouchableOpacity>
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
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#0891b2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
    marginBottom: 10,
  },
  questionDescription: {
    fontSize: 16,
    color: '#475569',
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
    color: '#0f172a',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    backgroundColor: '#0891b2',
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
    color: '#64748b',
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  detailItem: {
    marginBottom: 10,
  },
});