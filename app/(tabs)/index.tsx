import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Card } from '@/components/Card';
import { SearchWidget } from '@/components/SearchWidget';
import { ListStart, Clock, ArrowRight, Star } from 'lucide-react-native';
import { useScalesStore } from '@/store/scales';

export default function ScalesIndexScreen() {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const addRecentlyViewed = useScalesStore((state) => state.addRecentlyViewed);

  // Categorías de escalas médicas
  const categories = useMemo(() => [
    {
      id: 'alphabetical',
      title: 'Por Nombre',
      icon: <ListStart size={24} color="#0891b2" />,
      route: '/scales/alfabetico',
      description: 'Ordenadas alfabéticamente'
    },
    {
      id: 'functional',
      title: 'Por Función',
      icon: <Star size={24} color="#0d9488" />,
      route: '/scales/funcional',
      description: 'Agrupadas por funcionalidad'
    },
    {
      id: 'specialty',
      title: 'Por Especialidad',
      icon: <Clock size={24} color="#6366f1" />,
      route: '/scales/especialidad',
      description: 'Clasificadas por especialidad médica'
    },
    {
      id: 'segment',
      title: 'Por Segmento Corporal',
      icon: <ArrowRight size={24} color="#f59e0b" />,
      route: '/scales/segmento',
      description: 'Ordenadas por zona del cuerpo'
    }
  ], []);

  // Escalas recientes
  const recentScales = useMemo(() => [
    {
      id: 'barthel',
      name: 'Índice de Barthel',
      acronym: 'IB',
      description: 'Evaluación de actividades básicas de la vida diaria',
      popular: true,
      timeToComplete: '5-10 min',
    },
    {
      id: 'glasgow',
      name: 'Escala de Coma de Glasgow',
      acronym: 'GCS',
      description: 'Evaluación del nivel de consciencia',
      popular: true,
      timeToComplete: '2 min',
    },
    {
      id: 'mmse',
      name: 'Mini-Mental State Examination',
      acronym: 'MMSE',
      description: 'Evaluación del estado cognitivo',
      popular: true,
      timeToComplete: '10 min',
    }
  ], []);

  // Escalas populares
  const popularScales = useMemo(() => [
    {
      id: 'vas',
      name: 'Escala Visual Analógica',
      acronym: 'EVA',
      description: 'Evaluación subjetiva del dolor',
      timeToComplete: '1 min',
      category: 'Dolor'
    },
    {
      id: 'tinetti',
      name: 'Escala de Tinetti',
      acronym: 'ET',
      description: 'Evaluación del equilibrio y la marcha',
      timeToComplete: '10 min',
      category: 'Movilidad'
    },
    {
      id: 'katz',
      name: 'Índice de Katz',
      acronym: 'IK',
      description: 'Evaluación de independencia funcional',
      timeToComplete: '5 min',
      category: 'Funcional'
    }
  ], []);

  // Handler para iniciar una evaluación con la escala de Barthel
  const handleStartBarthelEvaluation = useCallback(async () => {
    setIsButtonLoading(true);
    
    try {
      // Registrar que se ha visto la escala Barthel
      addRecentlyViewed('barthel');
      
      // Simular una pequeña carga antes de navegar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navegar a la pantalla de Barthel
      router.push('/scales/barthel');
    } catch (error) {
      console.error('Error al iniciar evaluación:', error);
    } finally {
      setIsButtonLoading(false);
    }
  }, [addRecentlyViewed]);

  // Sección de escala destacada
  const renderFeaturedScaleSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Escala Destacada</Text>
      <TouchableOpacity 
        style={styles.featuredSection}
        onPress={handleStartBarthelEvaluation}
        activeOpacity={0.8}
      >
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>Escala de Barthel</Text>
          <Text style={styles.featuredDescription}>
            Evaluación estandarizada del nivel de independencia en actividades básicas de la vida diaria.
          </Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <ListStart size={16} color="#64748b" />
              <Text style={styles.featuredMetaText}>10 items</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#64748b" />
              <Text style={styles.featuredMetaText}>5-15 min</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[
              styles.featuredButton,
              isButtonLoading && styles.featuredButtonLoading
            ]}
            onPress={handleStartBarthelEvaluation}
            disabled={isButtonLoading}
            accessibilityLabel="Iniciar evaluación con la escala de Barthel"
            accessibilityRole="button"
            accessibilityState={{ 
              disabled: isButtonLoading,
              busy: isButtonLoading 
            }}
            accessibilityHint="Comienza una nueva evaluación usando la escala de Barthel"
          >
            <Text style={styles.featuredButtonText}>
              {isButtonLoading ? 'Iniciando...' : 'Iniciar Evaluación'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Escalas Médicas',
          headerShown: true,
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.searchContainer}>
          <SearchWidget
            placeholder="Buscar escalas médicas..."
            onSearch={() => {}}
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Categorías de navegación */}
          <View style={styles.gridContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => router.push(category.route)}
                accessibilityLabel={`Categoría ${category.title}`}
                accessibilityHint={category.description}
                accessibilityRole="button"
              >
                <View style={styles.categoryIconContainer}>
                  {category.icon}
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription} numberOfLines={1}>
                  {category.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sección de escalas recientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Escalas Recientes</Text>
              <TouchableOpacity 
                onPress={() => router.push('/scales/recent')}
                accessibilityLabel="Ver todas las escalas recientes"
                accessibilityRole="button"
              >
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {recentScales.map(scale => (
                <TouchableOpacity
                  key={scale.id}
                  style={styles.scaleCard}
                  onPress={() => {
                    addRecentlyViewed(scale.id);
                    router.push(`/scales/${scale.id}`);
                  }}
                  accessibilityLabel={`Escala ${scale.name}`}
                  accessibilityHint={scale.description}
                  accessibilityRole="button"
                >
                  <View style={styles.scaleCardContent}>
                    <View style={styles.scaleHeader}>
                      <Text style={styles.scaleTitle}>{scale.name}</Text>
                      {scale.popular && (
                        <View style={styles.popularBadge}>
                          <Star size={12} color="#ffffff" fill="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.scaleAcronym}>{scale.acronym}</Text>
                    <Text style={styles.scaleDescription} numberOfLines={2}>
                      {scale.description}
                    </Text>
                    <View style={styles.scaleFooter}>
                      <View style={styles.timeInfo}>
                        <Clock size={12} color="#64748b" />
                        <Text style={styles.timeText}>{scale.timeToComplete}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sección destacada - Barthel */}
          {renderFeaturedScaleSection()}

          {/* Sección de escalas populares */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Escalas Populares</Text>
              <TouchableOpacity onPress={() => router.push('/scales/alfabetico')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            
            {popularScales.map(scale => (
              <TouchableOpacity
                key={scale.id}
                style={styles.popularScaleCard}
                onPress={() => {
                  addRecentlyViewed(scale.id);
                  router.push(`/scales/${scale.id}`);
                }}
              >
                <View style={styles.popularScaleContent}>
                  <View>
                    <Text style={styles.popularScaleTitle}>{scale.name}</Text>
                    <Text style={styles.popularScaleDescription}>{scale.description}</Text>
                  </View>
                  <View style={styles.popularScaleFooter}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{scale.category}</Text>
                    </View>
                    <View style={styles.timeInfo}>
                      <Clock size={12} color="#64748b" />
                      <Text style={styles.timeText}>{scale.timeToComplete}</Text>
                    </View>
                  </View>
                </View>
                <ArrowRight size={20} color="#64748b" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0891b2',
    fontWeight: '500',
  },
  recentScrollContent: {
    paddingRight: 16,
  },
  scaleCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scaleCardContent: {
    padding: 16,
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scaleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
    flex: 1,
    marginRight: 8,
  },
  scaleAcronym: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  scaleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  popularBadge: {
    backgroundColor: '#eab308',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  featuredSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 8,
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 14,
    color: '#64748b',
  },
  featuredButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredButtonLoading: {
    backgroundColor: '#0891b2aa',
  },
  featuredButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  popularScaleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  popularScaleContent: {
    flex: 1,
    marginRight: 12,
  },
  popularScaleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  popularScaleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  popularScaleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '500',
  }
});