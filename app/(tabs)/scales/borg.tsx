import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { borgScale, borgQuestions, scoreInterpretation } from '@/data/borg';

export default function BorgScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const currentInterpretation = useMemo(() => {
    if (selectedValue === null) return null;
    return scoreInterpretation.find(
      (interp) => selectedValue >= interp.min && selectedValue <= interp.max
    );
  }, [selectedValue]);

  return (
    <>
      <Stack.Screen options={{ title: borgScale.shortName, headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{borgScale.name}</Text>
            <Text style={styles.subtitle}>{borgScale.description}</Text>
          </View>

          {/* Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{borgScale.information}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{borgQuestions[0].question}</Text>
            <Text style={styles.descriptionText}>{borgQuestions[0].description}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {borgQuestions[0].options.map((option) => {
              const isSelected = selectedValue === option.value;
              const optionColor = scoreInterpretation.find(
                (interp) => option.value >= interp.min && option.value <= interp.max
              )?.color || colors.primary;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    isSelected && {
                      backgroundColor: `${optionColor}20`,
                      borderColor: optionColor,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedValue(option.value)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && { color: optionColor, fontWeight: '700' }]}>
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text style={[styles.optionDescription, isSelected && { color: colors.text }]}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: optionColor }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Result */}
          {currentInterpretation && (
            <View style={[styles.resultCard, { backgroundColor: `${currentInterpretation.color}15` }]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultScore, { color: currentInterpretation.color }]}>
                  {selectedValue}
                </Text>
                <Text style={[styles.resultLevel, { color: currentInterpretation.color }]}>
                  {currentInterpretation.level}
                </Text>
              </View>
              <Text style={styles.resultDescription}>
                {currentInterpretation.description}
              </Text>
              {currentInterpretation.recommendation && (
                <View style={[styles.recommendationBox, { borderLeftColor: currentInterpretation.color }]}>
                  <Text style={styles.recommendationLabel}>Recomendación:</Text>
                  <Text style={styles.recommendationText}>
                    {currentInterpretation.recommendation}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Reference Guide */}
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Guía de Interpretación:</Text>
            {scoreInterpretation.map((interp, index) => (
              <View key={index} style={styles.referenceItem}>
                <View style={[styles.colorBar, { backgroundColor: interp.color }]} />
                <View style={styles.referenceContent}>
                  <Text style={styles.referenceRange}>
                    {interp.min === interp.max ? interp.min : `${interp.min}-${interp.max}`}
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
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.mutedText,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 12,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 12,
  },
  resultLevel: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
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
    marginBottom: 8,
  },
  colorBar: {
    width: 4,
    height: 32,
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
  },
});
