import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { questions, options, fimCategories } from '@/data/fim';
import { useScalesStore } from '@/store/scales';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

function useFimAssessment() {
  const [currentStep, setCurrentStep] = useState<'form' | 'questions' | 'results'>('form');
  const [patientData, setPatientData] = useState({ name: '', age: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const addRecentlyViewed = useScalesStore(state => state.addRecentlyViewed);

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('results');
      addRecentlyViewed('fim');
    }
  }, [currentQuestion, addRecentlyViewed]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const { totalScore, motorScore, cognitiveScore } = useMemo(() => {
    const motorItems = ['alimentacion', 'arreglo', 'bano', 'vestido_superior', 'vestido_inferior', 'aseo_perineal', 'miccion', 'defecacion', 'traslado_cama', 'traslado_bano', 'traslado_ducha', 'marcha', 'escaleras'];
    
    let motor = 0;
    let cognitive = 0;

    for (const q of questions) {
        const score = answers[q.id] || 0;
        if (motorItems.includes(q.id)) {
            motor += score;
        } else {
            cognitive += score;
        }
    }
    return { totalScore: motor + cognitive, motorScore: motor, cognitiveScore: cognitive };
  }, [answers]);

  const getInterpretation = useCallback(() => {
    if (totalScore >= 108) return { level: 'Independencia completa o modificada', colorKey: 'scoreOptimal' };
    if (totalScore >= 72) return { level: 'Dependencia moderada', colorKey: 'scoreGood' };
    if (totalScore >= 36) return { level: 'Dependencia severa', colorKey: 'scoreMedium' };
    return { level: 'Dependencia completa', colorKey: 'scoreLow' };
  }, [totalScore]);

  const resetAssessment = useCallback(() => {
    setAnswers({});
    setCurrentQuestion(0);
    setCurrentStep('form');
  }, []);

  return { currentStep, setCurrentStep, patientData, setPatientData, currentQuestion, answers, handleAnswer, nextQuestion, prevQuestion, totalScore, motorScore, cognitiveScore, getInterpretation, resetAssessment };
}


// Componente para los botones de puntuación
const ScoreButton = ({ score, selectedScore, onSelect, colors }: any) => {
  const isSelected = score.value === selectedScore;
  
  const getButtonColor = () => {
    if (!isSelected) return colors.card;
    if (score.value <= 2) return colors.scoreLow;
    if (score.value <= 4) return colors.scoreMedium;
    if (score.value <= 6) return colors.scoreGood;
    return colors.scoreOptimal;
  };

  const getTextColor = () => {
      if (!isSelected) return colors.text;
      return colors.card;
  }

  return (
    <TouchableOpacity
      style={[
        styles.scoreButton,
        { 
          backgroundColor: getButtonColor(),
          borderColor: isSelected ? getButtonColor() : colors.border 
        },
      ]}
      onPress={() => onSelect(score.value)}
    >
      <Text style={[styles.scoreButtonText, { color: getTextColor() }]}>
        {score.value}
      </Text>
    </TouchableOpacity>
  );
};


export default function FimScaleScreen() {
  const router = useRouter();
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    resetAssessment,
  } = useFimAssessment();

  const handleExport = async () => {
    Alert.alert(
      'Función en desarrollo', 
      'La exportación PDF para esta escala está siendo actualizada. Estará disponible pronto.'
    );
  };
  
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
            setPatientData(data);
            setCurrentStep('questions');
          }}
          allowSkip
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
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Puntuación General</Text>
            <Text style={[styles.scoreText, { color: colors[interpretation.colorKey] }]}>
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
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={resetAssessment}
            accessibilityLabel="Reiniciar cuestionario"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Reiniciar Cuestionario
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExport}
            accessibilityLabel="Exportar PDF"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, { color: colors.card }]}>
              Exportar PDF
            </Text>
          </TouchableOpacity>
          
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
  });
