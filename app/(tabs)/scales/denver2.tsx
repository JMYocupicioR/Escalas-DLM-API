import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useDenverAssessment } from '@/hooks/useDenverAssessment';
import { denver2 as denverScale, denverItems } from '@/data/denver';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const DOMAINS = ['Motor Grueso', 'Motor Fino-Adaptativo', 'Personal-Social', 'Lenguaje'];

export default function Denver2Screen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
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
    progress
  } = useDenverAssessment();

  const handleInputChange = (field: keyof typeof patientData) => (value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  if (currentStep === 'results') {
    const { delays, cautions, interpretation, recommendation, ageForEval } = calculateResults();
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Resultados Denver II' }} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Resultados de la Evaluación</Text>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Interpretación: {interpretation}</Text>
            <Text style={styles.resultsText}>Edad de Evaluación: {ageForEval.toFixed(2)} meses</Text>
            <Text style={styles.resultsText}>Retrasos: {delays}</Text>
            <Text style={styles.resultsText}>Precauciones: {cautions}</Text>
            <Text style={styles.recommendation}>{recommendation}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: currentStep === 'form' ? 'Datos del Paciente' : `Área: ${currentStep}` }} />
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {currentStep === 'form' ? (
          <View>
            <Text style={styles.title}>Datos de Identificación</Text>
            <TextInput placeholder="Nombre del Paciente" style={styles.input} value={patientData.name} onChangeText={handleInputChange('name')} />
            <TextInput placeholder="Nombre del Examinador" style={styles.input} value={patientData.examiner} onChangeText={handleInputChange('examiner')} />
            <TextInput placeholder="Fecha de Nacimiento (YYYY-MM-DD)" style={styles.input} value={patientData.birthDate} onChangeText={handleInputChange('birthDate')} />
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
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
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
  }
});
