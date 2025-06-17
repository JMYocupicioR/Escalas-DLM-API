import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScalesStore } from '@/store/scales';

export default function RecentScalesScreen() {
  const recentlyViewed = useScalesStore((state) => state.recentlyViewed);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Escalas Recientes',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={recentlyViewed}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item}</Text>
            </View>
          )}
          keyExtractor={(item) => item}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
});