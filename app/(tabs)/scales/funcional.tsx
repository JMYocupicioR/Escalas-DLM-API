import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { ArrowRight, Clock } from 'lucide-react-native';

const FUNCTIONAL_SCALES = {
  evaluacion: {
    title: 'Evaluación',
    description: 'Escalas para valoración inicial y seguimiento',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
    scales: [
      {
        id: 'barthel',
        name: 'Índice de Barthel',
        description: 'Evaluación de actividades básicas de la vida diaria',
        timeToComplete: '5-10 min',
        category: 'ADL',
      },
      {
        id: 'tinetti',
        name: 'Escala de Tinetti',
        description: 'Evaluación del equilibrio y la marcha',
        timeToComplete: '10-15 min',
        category: 'Balance',
      },
    ],
  },
  diagnostico: {
    title: 'Diagnóstico',
    description: 'Escalas para apoyo diagnóstico y clasificación',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    scales: [
      {
        id: 'mmse',
        name: 'Mini-Mental State Examination',
        description: 'Evaluación del estado cognitivo',
        timeToComplete: '10 min',
        category: 'Cognitive',
      },
    ],
  },
  pronostico: {
    title: 'Pronóstico',
    description: 'Escalas para predicción y evolución',
    image: 'https://images.unsplash.com/photo-1576091160291-258524ab6322?w=800&auto=format&fit=crop&q=60',
    scales: [
      {
        id: 'norton',
        name: 'Escala de Norton',
        description: 'Valoración del riesgo de úlceras por presión',
        timeToComplete: '5 min',
        category: 'Risk',
      },
    ],
  },
  seguimiento: {
    title: 'Seguimiento',
    description: 'Escalas para monitorización y control',
    image: 'https://images.unsplash.com/photo-1576091160970-3d6d2013e80f?w=800&auto=format&fit=crop&q=60',
    scales: [
      {
        id: 'vas',
        name: 'Escala Visual Analógica',
        description: 'Evaluación del dolor',
        timeToComplete: '1 min',
        category: 'Pain',
      },
    ],
  },
};

// Componente ImageWithFallback para manejo de errores de imagen
const ImageWithFallback = ({ uri, style, ...props }) => {
  const [hasError, setHasError] = useState(false);
  return (
    <Image
      source={hasError ? { uri: 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=800&auto=format&fit=crop&q=60' } : { uri }}
      style={style}
      onError={() => {
        console.warn(`Failed to load image: ${uri}`);
        setHasError(true);
      }}
      {...props}
    />
  );
};

export default function FunctionalScalesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const navigateToScale = useCallback((id: string) => {
    router.push(`/scales/${id}`);
  }, []);

  // Componente ScaleCard memoizado
  const ScaleCard = memo(({ scale }) => (
    <TouchableOpacity
      style={styles.scaleCard}
      onPress={() => navigateToScale(scale.id)}
      accessible={true}
      accessibilityLabel={`Escala ${scale.name}`}
      accessibilityHint={scale.description}
      accessibilityRole="button"
    >
      <View style={styles.scaleContent}>
        <Text style={styles.scaleName}>{scale.name}</Text>
        <Text style={styles.scaleDescription}>{scale.description}</Text>
        <View style={styles.scaleFooter}>
          <View style={styles.timeInfo}>
            <Clock size={16} color="#64748b" />
            <Text style={styles.timeText}>{scale.timeToComplete}</Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{scale.category}</Text>
          </View>
        </View>
      </View>
      <ArrowRight size={20} color="#64748b" />
    </TouchableOpacity>
  ));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content}>
          <View style={styles.searchContainer}>
            <SearchWidget
              onSearch={handleSearch}
              placeholder="Buscar escalas funcionales..."
            />
          </View>

          {Object.entries(FUNCTIONAL_SCALES).map(([key, section]) => (
            <View key={key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <ImageWithFallback
                  uri={section.image}
                  style={styles.sectionImage}
                />
                <View style={styles.sectionOverlay}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                </View>
              </View>

              <View style={styles.scalesList}>
                {section.scales
                  .filter(scale =>
                    scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scale.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(scale => (
                    <ScaleCard key={scale.id} scale={scale} />
                  ))}
              </View>
            </View>
          ))}

          <View style={styles.lastUpdate}>
            <Text style={styles.lastUpdateText}>
              Última actualización: {new Date().toLocaleDateString()}
            </Text>
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
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    position: 'relative',
    height: 200,
    marginBottom: 16,
  },
  sectionImage: {
    width: '100%',
    height: '100%',
  },
  sectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
      },
      default: {
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
    }),
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  scalesList: {
    paddingHorizontal: 16,
  },
  scaleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scaleContent: {
    flex: 1,
    marginRight: 12,
  },
  scaleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  scaleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  scaleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '500',
  },
  lastUpdate: {
    padding: 16,
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});