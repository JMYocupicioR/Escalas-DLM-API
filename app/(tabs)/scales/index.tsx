import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';

export default function ScalesListScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { category } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Lista de escalas {category ? `de la categoría ${category}` : ''}</Text>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
});