import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';

export default function ScaleDetailsScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams();

  // Placeholder info; en el futuro traer desde API/BD según id
  const info: ScaleInfoData = useMemo(() => ({
    id: String(id),
    name: String(id).toUpperCase(),
    description: 'Descripción e información científica de la escala.',
    quickGuide: [
      { title: 'Cómo usarla', paragraphs: ['Pasos resumidos para administración y puntuación.'] },
    ],
    evidence: {
      summary: 'Resumen de evidencia: validez, confiabilidad, sensibilidad al cambio.',
      references: [],
    },
    lastUpdated: new Date().toISOString(),
  }), [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalles de Escala',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <ScaleInfo info={info} />
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
});