import React, { useMemo } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const calculators = [
  {
    id: 'botulinum',
    title: 'Toxina Botulínica',
    description: 'Cálculo de unidades por músculo, volumen y dilución',
  },
  {
    id: 'plexo-braquial',
    title: 'Diagnóstico Plexo Braquial',
    description: 'Calculadora diagnóstica topográfica del plexo braquial',
  },
];

export default function CalculatorsIndex() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {calculators.map(calc => (
            <TouchableOpacity
              key={calc.id}
              style={styles.card}
              onPress={() => router.push(`/calculators/${calc.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Calculadora ${calc.title}`}
            >
              <Text style={styles.cardTitle}>{calc.title}</Text>
              <Text style={styles.cardDescription}>{calc.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.mutedText,
  },
});


