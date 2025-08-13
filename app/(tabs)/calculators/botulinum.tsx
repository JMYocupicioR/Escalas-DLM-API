import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function BotulinumCalculator() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [dilutionMl, setDilutionMl] = useState('2.5'); // mL usados para reconstituir
  const [vialUnits, setVialUnits] = useState('100'); // U por vial, p.ej. 100 U
  const [targetUnits, setTargetUnits] = useState('25'); // U a administrar en total

  const unitsPerMl = useMemo(() => {
    const u = parseFloat(vialUnits) || 0;
    const m = parseFloat(dilutionMl) || 1;
    return u / m; // U/mL
  }, [vialUnits, dilutionMl]);

  const volumeToInjectMl = useMemo(() => {
    const target = parseFloat(targetUnits) || 0;
    const upm = unitsPerMl || 1;
    return target / upm; // mL necesarios
  }, [targetUnits, unitsPerMl]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Toxina Botulínica</Text>
          <Text style={styles.subtitle}>Calcula el volumen a inyectar según la dilución y las unidades objetivo.</Text>

          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Unidades por vial</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={vialUnits}
                onChangeText={setVialUnits}
                placeholder="p.ej. 100"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>mL de dilución</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dilutionMl}
                onChangeText={setDilutionMl}
                placeholder="p.ej. 2.5"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Unidades objetivo</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={targetUnits}
                onChangeText={setTargetUnits}
                placeholder="p.ej. 25"
              />
            </View>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Concentración</Text>
            <Text style={styles.resultValue}>{unitsPerMl.toFixed(2)} U/mL</Text>
            <Text style={styles.resultLabel}>Volumen a inyectar</Text>
            <Text style={styles.resultValue}>{volumeToInjectMl.toFixed(2)} mL</Text>
          </View>

          <Text style={styles.disclaimer}>
            Esta herramienta es orientativa. Ajusta según la guía clínica y el juicio médico.
          </Text>
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
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  input: {
    width: 120,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: colors.text,
    backgroundColor: colors.sectionBackground,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  resultCard: {
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: colors.mutedText,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },
});


