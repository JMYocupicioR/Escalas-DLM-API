import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { nortonScale, nortonQuestions, scoreInterpretation } from '@/data/norton';

export default function NortonScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [responses, setResponses] = useState<Record<string, number>>({});

  const totalScore = useMemo(() => {
    return Object.values(responses).reduce((sum, val) => sum + val, 0);
  }, [responses]);

  const interpretation = useMemo(() => {
    if (totalScore === 0) return null;
    return scoreInterpretation.find(
      (interp) => totalScore >= interp.min && totalScore <= interp.max
    );
  }, [totalScore]);

  const handleSelect = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const allQuestionsAnswered = nortonQuestions.every((q) => responses[q.id] !== undefined);

  return (
    <>
      <Stack.Screen options={{ title: nortonScale.shortName, headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{nortonScale.name}</Text>
            <Text style={styles.subtitle}>{nortonScale.description}</Text>
          </View>

          {/* Score Display */}
          {totalScore > 0 && (
            <View style={[
              styles.scoreCard,
              interpretation && { backgroundColor: `${interpretation.color}20`, borderColor: interpretation.color }
            ]}>
              <Text style={styles.scoreLabel}>Puntuación Total</Text>
              <Text style={[styles.scoreValue, interpretation && { color: interpretation.color }]}>
                {totalScore}
                <Text style={styles.scoreMax}>/20</Text>
              </Text>
              {interpretation && (
                <>
                  <Text style={[styles.scoreLevelText, { color: interpretation.color }]}>
                    {interpretation.level}
                  </Text>
                  <Text style={styles.scoreDescription}>
                    {interpretation.description}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{nortonScale.information}</Text>
          </View>

          {/* Questions */}
          {nortonQuestions.map((question, qIndex) => {
            const selectedValue = responses[question.id];

            return (
              <View key={question.id} style={styles.questionSection}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumberContainer}>
                    <Text style={styles.questionNumber}>{qIndex + 1}</Text>
                  </View>
                  <View style={styles.questionTitleContainer}>
                    <Text style={styles.questionTitle}>{question.question}</Text>
                    <Text style={styles.questionDescription}>{question.description}</Text>
                  </View>
                  {selectedValue !== undefined && (
                    <View style={[styles.questionScore, { backgroundColor: colors.primary }]}>
                      <Text style={styles.questionScoreText}>{selectedValue}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.optionsContainer}>
                  {question.options.map((option) => {
                    const isSelected = selectedValue === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleSelect(question.id, option.value)}
                      >
                        <View style={styles.optionContent}>
                          <View style={styles.optionMainRow}>
                            <Text style={[styles.optionValue, isSelected && styles.optionValueSelected]}>
                              {option.value}
                            </Text>
                            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                              {option.label}
                            </Text>
                          </View>
                          {option.description && (
                            <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                              {option.description}
                            </Text>
                          )}
                        </View>
                        {isSelected && (
                          <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Result with Recommendations */}
          {allQuestionsAnswered && interpretation && (
            <View style={[styles.resultCard, { backgroundColor: `${interpretation.color}15`, borderColor: interpretation.color }]}>
              <Text style={[styles.resultTitle, { color: interpretation.color }]}>
                {interpretation.level}
              </Text>
              <Text style={styles.resultDescription}>
                {interpretation.description}
              </Text>
              <View style={[styles.recommendationBox, { borderLeftColor: interpretation.color }]}>
                <Text style={styles.recommendationLabel}>📋 Recomendaciones Preventivas:</Text>
                <Text style={styles.recommendationText}>
                  {interpretation.recommendation}
                </Text>
              </View>
            </View>
          )}

          {/* Reference Guide */}
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Escala de Riesgo:</Text>
            {scoreInterpretation.map((interp, index) => (
              <View key={index} style={styles.referenceItem}>
                <View style={[styles.colorBar, { backgroundColor: interp.color }]} />
                <View style={styles.referenceContent}>
                  <Text style={styles.referenceRange}>
                    {interp.min === interp.max ? `${interp.min}` : `${interp.min}-${interp.max}`} puntos
                  </Text>
                  <Text style={styles.referenceLevel}>{interp.level}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoreMax: {
    fontSize: 24,
    color: colors.mutedText,
  },
  scoreLevelText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  questionSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionNumberContainer: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  questionTitleContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  questionDescription: {
    fontSize: 14,
    color: colors.mutedText,
  },
  questionScore: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  questionScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelected: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: `${colors.primary}20`,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 10,
  },
  optionValueSelected: {
    backgroundColor: colors.primary,
    color: '#fff',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 13,
    color: colors.mutedText,
    marginLeft: 38,
  },
  optionDescriptionSelected: {
    color: colors.text,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  recommendationBox: {
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  recommendationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  referenceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  referenceContent: {
    flex: 1,
  },
  referenceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  referenceLevel: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2,
  },
});
