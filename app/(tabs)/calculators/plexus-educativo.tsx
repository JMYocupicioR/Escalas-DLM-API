import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { PlexusBrachialisSVG } from '@/components/PlexusBrachialisSVG';
import { DIAGNOSTIC_SVG_MAPPING } from '@/data/plexoBraquial';

const { width: screenWidth } = Dimensions.get('window');

const DEMO_DIAGNOSTICS = [
  'Lesión de Tronco Superior (C5-C6) - Erb-Duchenne',
  'Lesión de Tronco Inferior (C8-T1) - Klumpke',
  'Lesión de Fascículo Lateral',
  'Lesión de Fascículo Posterior',
  'Lesión de Fascículo Medial',
  'Neuropatía del Nervio Axilar',
  'Neuropatía del Nervio Radial',
  'Neuropatía del Nervio Mediano',
  'Neuropatía del Nervio Ulnar',
];

export default function PlexusEducativoScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string>('Lesión de Tronco Superior (C5-C6) - Erb-Duchenne');
  const affected = DIAGNOSTIC_SVG_MAPPING[selected] || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Plexo Braquial Interactivo' }} />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Explorador Interactivo del Plexo Braquial</Text>

          <View style={styles.svgCard}>
            <PlexusBrachialisSVG
              diagnosis={selected}
              affectedStructures={affected}
              animated
              width={screenWidth - 32}
              height={340}
            />
            <Text style={styles.svgCaption}>
              Las estructuras resaltadas en rojo representan el trayecto afectado para: {selected}
            </Text>
          </View>

          <View style={styles.selectorCard}>
            <Text style={styles.sectionTitle}>Patrones para visualizar</Text>
            <View style={styles.chipsContainer}>
              {DEMO_DIAGNOSTICS.map(name => {
                const isActive = selected === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSelected(name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Mostrar ${name}`}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {name.replace('Lesión de ', '').replace('Neuropatía del ', '')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Uso docente: esta vista es educativa y no genera diagnóstico.
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  svgCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  svgCaption: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 8,
    textAlign: 'center',
  },
  selectorCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.buttonPrimaryText,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: 8,
  },
});


