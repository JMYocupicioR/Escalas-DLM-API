import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useMemo } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const CATEGORIES = [
  {
    id: 'functional',
    name: 'Funcionales',
    description: 'Capacidades y actividades diarias',
    image: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=800&auto=format&fit=crop&q=60',
    count: 15
  },
  {
    id: 'cognitive',
    name: 'Cognitivas',
    description: 'Funciones mentales y comportamiento',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60',
    count: 12
  },
  {
    id: 'geriatric',
    name: 'Geriátricas',
    description: 'Evaluación integral del adulto mayor',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=60',
    count: 8
  },
  {
    id: 'pediatric',
    name: 'Pediátricas',
    description: 'Evaluación del desarrollo infantil',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=60',
    count: 10
  }
];

export default function CategoriesScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isDesktop, isTablet, isMobile } = useResponsiveLayout();

  const numColumns = useMemo(() => {
    if (isDesktop) return 4;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);

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
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.categoryImage}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryDescription}>{item.description}</Text>
                  <Text style={styles.categoryCount}>{item.count} escalas</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          numColumns={numColumns}
          key={numColumns} // Forzar re-renderizado al cambiar el número de columnas
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
  list: {
    padding: 16,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  categoryContent: {
    padding: 16,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#f0f0f0',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});