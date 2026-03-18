import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { ArrowRight, Clock } from 'lucide-react-native';
import { functionalCategories } from '@/data/functional-categories';
import { scalesById } from '@/data/_scales';

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
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const navigateToScale = useCallback((id: string) => {
    router.push(`/scales/${id}`);
  }, []);

  // Componente ScaleCard memoizado
  const ScaleCard = memo(({ scale, sectionTitle }: any) => (
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
            <Clock size={16} color={colors.mutedText} />
            <Text style={styles.timeText}>{scale.timeToComplete}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {scale.id === 'weefim' && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nuevo</Text>
              </View>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{sectionTitle}</Text>
            </View>
          </View>
        </View>
      </View>
      <ArrowRight size={20} color={colors.mutedText} />
    </TouchableOpacity>
  ));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/')}> 
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Inicio</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / </Text>
              <TouchableOpacity onPress={() => router.push('/scales')}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Escalas</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / Por función</Text>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} ref={scrollRef}>
          <View style={styles.searchContainer}>
            <SearchWidget
              onSearch={handleSearch}
              placeholder="Buscar escalas funcionales..."
            />
          </View>

          {/* Índice de categorías */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {Object.entries(functionalCategories).map(([key, section]) => (
              <TouchableOpacity
                key={key}
                style={styles.chip}
                onPress={() => {
                  const y = sectionPositions[key];
                  if (y !== undefined) {
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`Ir a ${section.title}`}
              >
                <Text style={styles.chipText}>{section.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {Object.entries(functionalCategories).map(([key, section]) => {
            const q = searchQuery.trim().toLowerCase();
            const allScales = section.scales.map(id => scalesById[id]).filter(Boolean);
            const categoryMatches = q && (section.title.toLowerCase().includes(q) || section.description.toLowerCase().includes(q));
            const filteredScales = (q.length === 0 || categoryMatches)
              ? allScales
              : allScales.filter(scale => (
                  scale.name.toLowerCase().includes(q) ||
                  (scale.description || '').toLowerCase().includes(q)
                ));
            filteredScales.sort((a, b) => a.name.localeCompare(b.name));

            if (filteredScales.length === 0) {
              return null;
            }

            return (
              <View
                key={key}
                style={styles.section}
                onLayout={(e) => setSectionPositions(prev => ({ ...prev, [key]: e.nativeEvent.layout.y }))}
              >
                <View style={styles.sectionHeader}>
                  <ImageWithFallback
                    uri={section.image}
                    style={styles.sectionImage}
                  />
                  <View style={styles.sectionOverlay}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>
                      {section.description}
                    </Text>
                    <Text style={[styles.sectionDescription, { marginTop: 4 }]}>
                      {filteredScales.length} escala{filteredScales.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>

                <View style={styles.scalesList}>
                  {filteredScales.map(scale => (
                    <ScaleCard key={scale.id} scale={scale} sectionTitle={section.title} />
                  ))}
                </View>
              </View>
            );
          })}

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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipsRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  chip: {
    backgroundColor: colors.sectionBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
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
    color: colors.card,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.border,
  },
  scalesList: {
    paddingHorizontal: 16,
  },
  scaleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
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
    color: colors.text,
    marginBottom: 4,
  },
  scaleDescription: {
    fontSize: 14,
    color: colors.mutedText,
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
    color: colors.mutedText,
  },
  newBadge: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTag: {
    backgroundColor: colors.tagBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  lastUpdate: {
    padding: 16,
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: colors.mutedText,
  },
});
