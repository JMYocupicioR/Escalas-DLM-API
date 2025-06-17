import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  {
    id: 'functional',
    name: 'Escalas Funcionales',
    description: 'Evaluación de capacidades y actividades diarias',
    image: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=800&auto=format&fit=crop&q=60',
    count: 15
  },
  {
    id: 'cognitive',
    name: 'Escalas Cognitivas',
    description: 'Evaluación de funciones mentales y comportamiento',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60',
    count: 12
  },
  {
    id: 'geriatric',
    name: 'Escalas Geriátricas',
    description: 'Evaluación integral del adulto mayor',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=60',
    count: 8
  },
  {
    id: 'pediatric',
    name: 'Escalas Pediátricas',
    description: 'Evaluación del desarrollo infantil',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=60',
    count: 10
  }
];

export default function CategoriesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Categorías',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={CATEGORIES}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push(`/scales?category=${item.id}`)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.categoryImage}
              />
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>{item.description}</Text>
                <Text style={styles.categoryCount}>{item.count} escalas</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
  list: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 200,
  },
  categoryContent: {
    padding: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: '#0891b2',
    fontWeight: '500',
  },
});