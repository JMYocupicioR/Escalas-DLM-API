import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { ArrowRight, Clock } from 'lucide-react-native';

const BODY_SEGMENTS = {
  cabeza: {
    name: 'Cabeza y Cuello',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60',
    subsections: {
      cerebro: {
        name: 'Cerebro y Sistema Nervioso',
        scales: [
          {
            id: 'glasgow',
            name: 'Escala de Glasgow',
            description: 'Evaluación del nivel de consciencia',
            timeToComplete: '2 min',
            crossReferences: ['trauma'],
          },
          {
            id: 'mmse',
            name: 'Mini-Mental State Examination',
            description: 'Evaluación del estado cognitivo',
            timeToComplete: '10 min',
            crossReferences: ['geriatria'],
          },
        ],
      },
      facial: {
        name: 'Región Facial',
        scales: [
          {
            id: 'house-brackmann',
            name: 'House-Brackmann',
            description: 'Evaluación de parálisis facial',
            timeToComplete: '5 min',
            crossReferences: ['neurologia'],
          },
        ],
      },
    },
  },
  tronco: {
    name: 'Tronco',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
    subsections: {
      columna: {
        name: 'Columna Vertebral',
        scales: [
          {
            id: 'oswestry',
            name: 'Índice de Discapacidad de Oswestry',
            description: 'Evaluación funcional de columna lumbar',
            timeToComplete: '10 min',
            crossReferences: ['traumatologia'],
          },
        ],
      },
      torax: {
        name: 'Tórax',
        scales: [
          {
            id: 'borg',
            name: 'Escala de Borg',
            description: 'Evaluación de disnea',
            timeToComplete: '2 min',
            crossReferences: ['neumologia'],
          },
        ],
      },
    },
  },
  extremidades_superiores: {
    name: 'Extremidades Superiores',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    subsections: {
      hombro: {
        name: 'Hombro',
        scales: [
          {
            id: 'constant',
            name: 'Score de Constant',
            description: 'Evaluación funcional del hombro',
            timeToComplete: '10 min',
            crossReferences: ['traumatologia'],
          },
        ],
      },
    },
  },
  extremidades_inferiores: {
    name: 'Extremidades Inferiores',
    image: 'https://images.unsplash.com/photo-1576091160291-258524ab6322?w=800&auto=format&fit=crop&q=60',
    subsections: {
      cadera: {
        name: 'Cadera',
        scales: [
          {
            id: 'harris',
            name: 'Harris Hip Score',
            description: 'Evaluación funcional de cadera',
            timeToComplete: '10 min',
            crossReferences: ['traumatologia'],
          },
        ],
      },
      rodilla: {
        name: 'Rodilla',
        scales: [
          {
            id: 'koos',
            name: 'KOOS',
            description: 'Evaluación de resultados en lesiones de rodilla',
            timeToComplete: '15 min',
            crossReferences: ['traumatologia'],
          },
        ],
      },
    },
  },
};

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

export default function BodySegmentScalesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const navigateToScale = useCallback((id: string) => {
    router.push(`/scales/${id}`);
  }, []);

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
          {scale.crossReferences?.length > 0 && (
            <View style={styles.crossReferences}>
              {scale.crossReferences.map(ref => (
                <View key={ref} style={styles.crossRefTag}>
                  <Text style={styles.crossRefText}>{ref}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <ArrowRight size={20} color="#64748b" />
    </TouchableOpacity>
  ));

  const SubsectionComponent = memo(({ subsection, searchQuery }) => {
    const filteredScales = subsection.scales.filter(scale =>
      scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scale.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredScales.length === 0) return null;

    return (
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>{subsection.name}</Text>
        {filteredScales.map(scale => (
          <ScaleCard key={scale.id} scale={scale} />
        ))}
      </View>
    );
  });

  const SegmentComponent = memo(({ segment, searchKey, searchQuery }) => {
    return (
      <View key={searchKey} style={styles.segment}>
        <View style={styles.segmentHeader}>
          <ImageWithFallback
            uri={segment.image}
            style={styles.segmentImage}
          />
          <View style={styles.segmentOverlay}>
            <Text style={styles.segmentTitle}>{segment.name}</Text>
          </View>
        </View>

        {Object.entries(segment.subsections).map(([subKey, subsection]) => (
          <SubsectionComponent 
            key={subKey} 
            subsection={subsection} 
            searchQuery={searchQuery} 
          />
        ))}
      </View>
    );
  });

  const segmentsArray = Object.entries(BODY_SEGMENTS).map(([key, segment]) => ({
    key,
    segment
  }));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.searchContainer}>
          <SearchWidget
            onSearch={handleSearch}
            placeholder="Buscar por región corporal..."
          />
        </View>

        <FlatList
          data={segmentsArray}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <SegmentComponent 
              segment={item.segment} 
              searchKey={item.key} 
              searchQuery={searchQuery} 
            />
          )}
          initialNumToRender={2}
          maxToRenderPerBatch={1}
          windowSize={3}
          ListFooterComponent={() => (
            <View style={styles.lastUpdate}>
              <Text style={styles.lastUpdateText}>
                Última actualización: {new Date().toLocaleDateString()}
              </Text>
            </View>
          )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  content: {
    flex: 1,
  },
  segment: {
    marginTop: 24,
  },
  segmentHeader: {
    position: 'relative',
    height: 200,
    marginBottom: 16,
  },
  segmentImage: {
    width: '100%',
    height: '100%',
  },
  segmentOverlay: {
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
  segmentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subsection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  scaleDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
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
  crossReferences: {
    flexDirection: 'row',
    gap: 8,
  },
  crossRefTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  crossRefText: {
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