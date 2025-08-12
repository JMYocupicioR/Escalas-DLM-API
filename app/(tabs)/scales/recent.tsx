import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useScalesStore } from '@/store/scales';

export default function RecentScalesScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});