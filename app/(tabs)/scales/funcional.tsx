import React, { useState, useCallback, memo, useMemo } from 'react';
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
            <Clock size={16} color={colors.mutedText} />
            <Text style={styles.timeText}>{scale.timeToComplete}</Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{scale.category}</Text>
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

          {Object.entries(functionalCategories).map(([key, section]) => {
            const filteredScales = section.scales
              .map(id => scalesById[id])
              .filter(
                scale =>
                  scale &&
                  (scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scale.description.toLowerCase().includes(searchQuery.toLowerCase()))
              );

            if (filteredScales.length === 0) {
              return null;
            }

            return (
              <View key={key} style={styles.section}>
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
                  </View>
                </View>

                <View style={styles.scalesList}>
                  {filteredScales.map(scale => (
                    <ScaleCard key={scale.id} scale={scale} />
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