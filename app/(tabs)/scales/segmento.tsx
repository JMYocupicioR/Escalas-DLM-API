import React, { useState, useCallback, memo, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { SearchWidget } from '@/components/SearchWidget';
import { ArrowRight, Clock } from 'lucide-react-native';
import { bodySegmentCategories } from '@/data/body-segment-categories';
import { scalesById } from '@/data/_scales';

const ImageWithFallback: React.FC<{
  uri: string;
  style: any;
  [key: string]: any;
}> = ({ uri, style, ...props }) => {
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
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const navigateToScale = useCallback((id: string) => {
    router.push(`/scales/${id}`);
  }, []);

  const ScaleCard = memo<{ scale: any }>(({ scale }) => (
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
      <ArrowRight size={20} color={colors.mutedText} />
    </TouchableOpacity>
  ));

  const SubsectionComponent = memo<{
    subsection: any;
    searchQuery: string;
  }>(({ subsection, searchQuery }) => {
    const filteredScales = subsection.scales
      .map(id => scalesById[id])
      .filter(
        scale =>
          scale &&
          (scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scale.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const SegmentComponent = memo<{
    segment: any;
    searchKey: string;
    searchQuery: string;
  }>(({ segment, searchKey, searchQuery }) => {
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

  const segmentsArray = Object.entries(bodySegmentCategories).map(
    ([key, segment]) => ({
      key,
      segment,
    })
  );

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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.card,
  },
  subsection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  scaleDescription: {
    fontSize: 14,
    color: colors.mutedText,
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
    color: colors.mutedText,
  },
  crossReferences: {
    flexDirection: 'row',
    gap: 8,
  },
  crossRefTag: {
    backgroundColor: colors.tagBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  crossRefText: {
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