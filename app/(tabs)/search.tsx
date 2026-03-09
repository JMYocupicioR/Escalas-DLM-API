import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, TouchableOpacity, Platform, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Search as SearchIcon, SlidersHorizontal, X, ChevronRight, Activity, Brain, Heart, TrendingUp, Zap } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ScaleCard, ScaleCardData } from '@/components/Card';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ScaleGridSkeleton, EmptyState } from '@/components/LoadingStates';
import { GetScalesParams } from '@/api/scales/types';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useScalesStore } from '@/store/scalesStore';
import { calculateGridConfig, shouldUseListView } from '@/utils/responsiveGrid';
import type { Scale } from '@/types/scale';
import { useTaxonomyFilters, TaxonomyFilterState } from '@/hooks/useTaxonomyFilters';
import { TaxonomyFilterBar } from '@/components/TaxonomyFilterBar';

// Interfaces para mejorar el tipado
interface CategoryOption {
  id: string;
  name: string;
}

interface SortOption {
  id: string;
  name: string;
}

// Category icons and colors mapping
const CATEGORY_STYLES: Record<string, { icon: React.ComponentType<any>, color: string }> = {
  'Funcional': { icon: Activity, color: '#10b981' },
  'Neurológica': { icon: Brain, color: '#8b5cf6' },
  'Cognitiva': { icon: Brain, color: '#f59e0b' },
  'Dolor': { icon: Heart, color: '#ef4444' },
  'Cardiovascular': { icon: Heart, color: '#dc2626' },
  'Respiratoria': { icon: Activity, color: '#06b6d4' },
  'Geriátrica': { icon: TrendingUp, color: '#6366f1' },
  'Pediátrica': { icon: Activity, color: '#f59e0b' },
  'Rehab': { icon: TrendingUp, color: '#10b981' },
  'Rehabilitación': { icon: TrendingUp, color: '#10b981' },
  'ADL': { icon: Activity, color: '#10b981' },
  'Balance': { icon: TrendingUp, color: '#06b6d4' },
  'Cognitive': { icon: Brain, color: '#f59e0b' },
  'Risk': { icon: Activity, color: '#ef4444' },
  'Pain': { icon: Heart, color: '#ef4444' },
  'Neurology': { icon: Brain, color: '#8b5cf6' },
  'default': { icon: Activity, color: '#0891b2' },
};

// Animated Card Wrapper for stagger effect
interface AnimatedCardWrapperProps {
  children: React.ReactNode;
  delay: number;
  style?: any;
}

function AnimatedCardWrapper({ children, delay, style }: AnimatedCardWrapperProps) {
  const fadeAnim = React.useRef(new RNAnimated.Value(0)).current;
  const slideAnim = React.useRef(new RNAnimated.Value(20)).current;

  React.useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      RNAnimated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <RNAnimated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </RNAnimated.View>
  );
}

// We'll get scales from the store instead of hardcoded data

const CATEGORIES: CategoryOption[] = [
  { id: 'all', name: 'Todas las Escalas' },
  { id: 'ADL', name: 'Actividades Diarias' },
  { id: 'Rehab', name: 'Rehabilitación' },
  { id: 'Balance', name: 'Equilibrio' },
  { id: 'Cognitive', name: 'Cognitiva' },
  { id: 'Risk', name: 'Evaluación de Riesgo' },
  { id: 'Pain', name: 'Dolor' },
  { id: 'Neurology', name: 'Neurología' },
  { id: 'Orthopedics', name: 'Ortopedia' },
  { id: 'Cardiopulmonary', name: 'Cardiopulmonar' }
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'alphabetical', name: 'A-Z' },
  { id: 'popularity', name: 'Most Popular' },
  { id: 'recent', name: 'Recently Updated' }
];

export default function SearchScreen() {
  const { colors, isDark } = useThemedStyles();
  const { isTablet, isDesktop, width, isLandscape } = useResponsiveLayout();
  const router = useRouter();
  
  // Get scales from store
  const allScales = useScalesStore((state) => state.scales);
  
  // Obtener parámetros de la URL
  const params = useLocalSearchParams();
  const initialQuery = typeof params.q === 'string' ? params.q : '';
  const initialFilter = params.filter === 'true';
  const initialCategory = typeof params.category === 'string' ? params.category : '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(initialFilter);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scales, setScales] = useState(allScales);
  const [taxonomyFilters, setTaxonomyFilters] = useState<TaxonomyFilterState>({
    categoryId: null,
    specialtyId: null,
    scaleTypeId: null,
    populationId: null,
    bodySystemId: null,
  });

  // Load real taxonomy data from Supabase
  const taxonomyData = useTaxonomyFilters();

  // Enhanced grid configuration
  const gridConfig = useMemo(() => calculateGridConfig({
    screenWidth: width,
    isPhone: !isTablet && !isDesktop,
    isTablet,
    isDesktop,
    isLandscape,
  }), [width, isTablet, isDesktop, isLandscape]);

  const columns = gridConfig.columns;
  const useListView = shouldUseListView(width);

  // Update scales when store changes
  useEffect(() => {
    setScales(allScales);
  }, [allScales]);

  // Manejar cambios en la búsqueda
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Manejar cambios en la categoría
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // Manejar cambios en la ordenación
  const handleSortChange = useCallback((sortId: string) => {
    setSortBy(sortId);
  }, []);

  // Alternar mostrar/ocultar filtros
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Borrar la consulta de búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Manejar búsqueda avanzada
  const handleAdvancedSearch = useCallback(async (params: GetScalesParams) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await searchScales(params);
      // setScales(response.data || []);
      
      // Mock search with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply filters to actual scales data
      let filteredResults = [...allScales];

      if (params.query) {
        const query = params.query.toLowerCase();
        filteredResults = filteredResults.filter(scale =>
          scale.name.toLowerCase().includes(query) ||
          scale.description.toLowerCase().includes(query) ||
          scale.category.toLowerCase().includes(query) ||
          (scale.acronym && scale.acronym.toLowerCase().includes(query)) ||
          (scale.specialty && scale.specialty.toLowerCase().includes(query)) ||
          (scale.tags && scale.tags.some(tag => tag.toLowerCase().includes(query))) ||
          (scale.searchTerms && scale.searchTerms.some(term => term.toLowerCase().includes(query)))
        );
      }

      if (params.category && params.category !== 'all') {
        filteredResults = filteredResults.filter(scale => 
          scale.category.toLowerCase() === params.category!.toLowerCase()
        );
      }

      // Apply sorting
      filteredResults.sort((a, b) => {
        switch (params.sortBy) {
          case 'name':
            return params.sortOrder === 'desc' 
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name);
          case 'popularity':
            return params.sortOrder === 'desc' 
              ? (b.popularity || 0) - (a.popularity || 0)
              : (a.popularity || 0) - (b.popularity || 0);
          default:
            return 0;
        }
      });

      setScales(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Alternar modo de búsqueda
  const toggleSearchMode = useCallback(() => {
    setUseAdvancedSearch(prev => !prev);
  }, []);

  // Memoizar los resultados filtrados para evitar recálculos innecesarios
  const filteredScales = useMemo(() => {
    if (useAdvancedSearch) {
      return scales; // Advanced search handles its own filtering
    }

    // Resolve taxonomy category name for string-based matching
    const activeTaxCategory = taxonomyFilters.categoryId
      ? taxonomyData.categories.find(c => c.id === taxonomyFilters.categoryId)
      : null;
    const activeTaxSpecialty = taxonomyFilters.specialtyId
      ? taxonomyData.specialties.find(s => s.id === taxonomyFilters.specialtyId)
      : null;

    return scales.filter(scale => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        scale.name.toLowerCase().includes(query) ||
        scale.description.toLowerCase().includes(query) ||
        scale.category.toLowerCase().includes(query) ||
        (scale.acronym && scale.acronym.toLowerCase().includes(query)) ||
        (scale.specialty && scale.specialty.toLowerCase().includes(query)) ||
        (scale.tags && scale.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (scale.searchTerms && scale.searchTerms.some(term => term.toLowerCase().includes(query)));

      const matchesCategory = selectedCategory === 'all' ||
        scale.category.toLowerCase() === selectedCategory.toLowerCase();

      // Taxonomy filter: match against the category name (es or en)
      const matchesTaxCategory = !activeTaxCategory || (
        scale.category.toLowerCase().includes(activeTaxCategory.name_es.toLowerCase()) ||
        scale.category.toLowerCase().includes(activeTaxCategory.name_en.toLowerCase()) ||
        (scale.specialty && scale.specialty.toLowerCase().includes(activeTaxCategory.name_es.toLowerCase()))
      );

      // Taxonomy filter: match by specialty field
      const matchesTaxSpecialty = !activeTaxSpecialty || (
        (scale.specialty && (
          scale.specialty.toLowerCase().includes(activeTaxSpecialty.name_es.toLowerCase()) ||
          scale.specialty.toLowerCase().includes(activeTaxSpecialty.name_en.toLowerCase())
        )) ||
        scale.category.toLowerCase().includes(activeTaxSpecialty.name_es.toLowerCase())
      );

      return matchesSearch && matchesCategory && matchesTaxCategory && matchesTaxSpecialty;
    }).sort((a, b) => {
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy, scales, useAdvancedSearch, taxonomyFilters, taxonomyData]);

  // Convert scale to ScaleCardData format
  const convertToCardData = useCallback((scale: Scale): ScaleCardData => {
    const categoryStyle = CATEGORY_STYLES[scale.category] || CATEGORY_STYLES.default;
    return {
      id: scale.id,
      name: scale.name,
      description: scale.description,
      category: scale.category,
      categoryColor: categoryStyle.color,
      icon: categoryStyle.icon,
      uses: scale.popularity,
      rating: scale.rating,
      timeToComplete: scale.timeToComplete,
    };
  }, []);

  // Componente para renderizar cada escala con animación
  const renderScaleItem = useCallback(({ item, index }: { item: Scale; index: number }) => {
    const scaleData = convertToCardData(item);
    
    return (
      <AnimatedCardWrapper
        delay={index * 60}
        style={[
          styles.cardWrapper,
          useListView ? styles.cardWrapperFull : styles.cardWrapperGrid(columns)
        ]}
      >
        <ScaleCard
          scale={scaleData}
          layout={useListView ? 'list' : 'grid'}
          onPress={() => router.push(`/new-scales/${item.id}` as any)}
          showStats={true}
          showCategory={true}
          rightElement={
            <FavoriteButton scaleId={item.id} size={18} />
          }
        />
      </AnimatedCardWrapper>
    );
  }, [convertToCardData, useListView, columns, router]);

  // Componente para mostrar cuando no hay resultados - usando el nuevo EmptyState
  const EmptyResultsComponent = useCallback(() => (
    <EmptyState
      title="No se encontraron resultados"
      description="Intenta con otra búsqueda o cambia los filtros aplicados"
      icon={<SearchIcon size={40} color={colors.mutedText} />}
    />
  ), [colors]);

  if (useAdvancedSearch) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {/* Header with mode toggle */}
        <ResponsiveContainer>
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
                onPress={toggleSearchMode}
                style={[styles.modeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.modeToggleText, { color: colors.primary }]}>
                  ← Búsqueda Simple
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ResponsiveContainer>
        
        <ResponsiveContainer>
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            isLoading={isLoading}
            initialQuery={initialQuery}
          />
        </ResponsiveContainer>
        
        {/* Results */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.resultsGrid}>
              <ScaleGridSkeleton 
                count={6} 
                layout={useListView ? 'list' : 'grid'} 
                columns={columns} 
              />
            </View>
          ) : (
            <FlatList
              data={filteredScales}
              renderItem={renderScaleItem}
              keyExtractor={item => item.id}
              contentContainerStyle={[
                styles.resultsGrid,
                !useListView && styles.resultsGridColumns
              ]}
              ListEmptyComponent={EmptyResultsComponent}
              initialNumToRender={8}
              maxToRenderPerBatch={4}
              windowSize={8}
              showsVerticalScrollIndicator={true}
              numColumns={useListView ? 1 : undefined}
              key={useListView ? 'list' : `grid-${columns}`}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveContainer>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <SearchIcon size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search medical scales..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              accessibilityLabel="Buscar escalas médicas"
              accessibilityRole="search"
            />
            {searchQuery ? (
              <Pressable 
                onPress={clearSearch}
                accessibilityLabel="Borrar búsqueda"
                accessibilityRole="button"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        
        <TouchableOpacity
          onPress={toggleSearchMode}
          style={[styles.advancedButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
        >
          <Text style={[styles.advancedButtonText, { color: colors.primary }]}> 
            Avanzada
          </Text>
        </TouchableOpacity>
        
        <Pressable 
          style={[styles.filterButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} 
          onPress={toggleFilters}
          accessible={true}
          accessibilityLabel={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          accessibilityRole="button"
        >
          <SlidersHorizontal size={20} color={colors.textSecondary} />
        </Pressable>
        </View>
      </ResponsiveContainer>

      {showFilters && (
        <ResponsiveContainer>
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            layout={Layout}
            style={[styles.filtersContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          >
            {/* Taxonomy filter bar with real Supabase data */}
            <TaxonomyFilterBar
              filters={taxonomyFilters}
              onFilterChange={setTaxonomyFilters}
              taxonomyData={taxonomyData}
            />

            <View style={{ padding: 16 }}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Categorías</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                data={CATEGORIES}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.categoryChip,
                      selectedCategory === item.id && styles.categoryChipSelected
                    ]}
                    onPress={() => handleCategoryChange(item.id)}
                    accessible={true}
                    accessibilityLabel={`Categoría ${item.name}`}
                    accessibilityState={{ selected: selectedCategory === item.id }}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === item.id && styles.categoryChipTextSelected
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />

              <Text style={[styles.filterTitle, { color: colors.text }]}>Ordenar</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(option => (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.sortChip,
                      sortBy === option.id && styles.sortChipSelected
                    ]}
                    onPress={() => handleSortChange(option.id)}
                    accessible={true}
                    accessibilityLabel={`Ordenar por ${option.name}`}
                    accessibilityState={{ selected: sortBy === option.id }}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.sortChipText,
                        sortBy === option.id && styles.sortChipTextSelected
                      ]}
                    >
                      {option.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        </ResponsiveContainer>
      )}

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.resultsGrid}>
            <ScaleGridSkeleton 
              count={6} 
              layout={useListView ? 'list' : 'grid'} 
              columns={columns} 
            />
          </View>
        ) : (
          <FlatList
            data={filteredScales}
            renderItem={renderScaleItem}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.resultsGrid,
              !useListView && styles.resultsGridColumns
            ]}
            ListEmptyComponent={EmptyResultsComponent}
            initialNumToRender={8}
            maxToRenderPerBatch={4}
            windowSize={8}
            showsVerticalScrollIndicator={true}
            numColumns={useListView ? 1 : undefined}
            key={useListView ? 'list' : `grid-${columns}`}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    zIndex: 100,
    position: 'relative',
  },
  modeToggleContainer: {
    flex: 1,
  },
  modeToggle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  advancedButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 44,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  advancedButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 10,
    marginRight: 10,
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 50,
    position: 'relative',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  categoryChipSelected: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(8, 145, 178, 0.3)',
      },
      default: {
        shadowColor: '#0891b2',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  sortChipSelected: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(8, 145, 178, 0.3)',
      },
      default: {
        shadowColor: '#0891b2',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  sortChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  sortChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  resultsGrid: {
    padding: 16,
    flexGrow: 1,
  },
  resultsGridColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardWrapperFull: {
    width: '100%',
  },
  cardWrapperGrid: (columns: number) => ({
    width: columns === 3 ? 'calc(33.333% - 12px)' : columns === 2 ? 'calc(50% - 12px)' : '100%',
    ...Platform.select({
      default: {
        width: columns === 3 ? '31%' : columns === 2 ? '47%' : '100%',
      },
    }),
  }),
});