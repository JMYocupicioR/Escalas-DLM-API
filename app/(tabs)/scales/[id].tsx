import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScaleDetailsScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalles de Escala',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text>Detalles de la escala {id}</Text>
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