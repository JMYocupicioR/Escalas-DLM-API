import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import Slider from '@react-native-community/slider';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { vasScale, vasQuestions, scoreInterpretation } from '@/data/vas';

export default function VASScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [painLevel, setPainLevel] = useState(0);

  const currentInterpretation = useMemo(() => {
    return scoreInterpretation.find(
      (interp) => painLevel >= interp.min && painLevel <= interp.max
    );
  }, [painLevel]);

  return (
    <>
      <Stack.Screen options={{ title: vasScale.shortName, headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{vasScale.name}</Text>
            <Text style={styles.subtitle}>{vasScale.description}</Text>
          </View>

          {/* Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{vasScale.information}</Text>
          </View>

          {/* Pain Scale */}
          <View style={styles.scaleCard}>
            <Text style={styles.questionText}>{vasQuestions[0].question}</Text>
            <Text style={styles.descriptionText}>{vasQuestions[0].description}</Text>

            <View style={styles.sliderContainer}>
              <Text style={[styles.scoreDisplay, { color: currentInterpretation?.color || colors.primary }]}>
                {painLevel}
              </Text>

              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={painLevel}
                onValueChange={setPainLevel}
                minimumTrackTintColor={currentInterpretation?.color || colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={currentInterpretation?.color || colors.primary}
              />

              <View style={styles.labelsContainer}>
                <Text style={styles.labelText}>0{'\n'}Sin dolor</Text>
                <Text style={styles.labelText}>5{'\n'}Moderado</Text>
                <Text style={styles.labelText}>10{'\n'}Máximo</Text>
              </View>
            </View>

            {/* Current interpretation */}
            {currentInterpretation && (
              <View style={[styles.interpretationCard, { backgroundColor: `${currentInterpretation.color}15` }]}>
                <Text style={[styles.interpretationLevel, { color: currentInterpretation.color }]}>
                  {currentInterpretation.level}
                </Text>
                <Text style={styles.interpretationDescription}>
                  {currentInterpretation.description}
                </Text>
              </View>
            )}
          </View>

          {/* All interpretations reference */}
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Escala de Referencia:</Text>
            {scoreInterpretation.map((interp, index) => (
              <View key={index} style={styles.referenceItem}>
                <View style={[styles.colorDot, { backgroundColor: interp.color }]} />
                <Text style={styles.referenceText}>
                  <Text style={styles.referenceRange}>
                    {interp.min === interp.max ? interp.min : `${interp.min}-${interp.max}`}:
                  </Text>
                  {' '}{interp.level}
                </Text>
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
  scaleCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 24,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  scoreDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },
  interpretationCard: {
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  interpretationLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  interpretationDescription: {
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
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  referenceText: {
    fontSize: 14,
    color: colors.text,
  },
  referenceRange: {
    fontWeight: '600',
  },
});
