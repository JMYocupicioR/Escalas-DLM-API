import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScalesListScreen() {
  const { category } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Lista de escalas {category ? `de la categoría ${category}` : ''}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
});