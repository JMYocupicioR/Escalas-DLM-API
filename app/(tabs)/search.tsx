import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Search as SearchIcon, SlidersHorizontal, X, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { GetScalesParams } from '@/api/scales/types';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useScalesStore } from '@/store/scalesStore';
import type { Scale } from '@/types/scale';
import { useEffect } from 'react';

// Interfaces para mejorar el tipado
interface CategoryOption {
  id: string;
  name: string;
}

interface SortOption {
  id: string;
  name: string;
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
          (scale.specialty && scale.specialty.toLowerCase().includes(query)) ||
          (scale.tags && scale.tags.some(tag => tag.toLowerCase().includes(query)))
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
    
    return scales.filter(scale => {
      const matchesSearch = 
        searchQuery === '' || 
        scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scale.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scale.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (scale.specialty && scale.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (scale.tags && scale.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || 
        scale.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      // Para 'recent', podríamos usar una fecha de actualización si estuviera disponible
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy, scales, useAdvancedSearch]);

  // Componente para renderizar cada escala
  const renderScaleItem = useCallback(({ item }: { item: Scale }) => (
    <Link href={`/scales/${item.id}`} asChild>
      <Pressable 
        style={styles.scaleCard}
        accessible={true}
        accessibilityLabel={`Escala ${item.name}`}
        accessibilityHint={item.description}
        accessibilityRole="button"
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.scaleName}>{item.name}</Text>
          <Text style={styles.scaleDescription} numberOfLines={2}>
            {item.description}
          </Text>
          {item.timeToComplete && (
            <Text style={styles.timeText}>⏱️ {item.timeToComplete}</Text>
          )}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.slice(0, 2).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <ChevronRight size={16} color="#64748b" />
          </View>
        </View>
      </Pressable>
    </Link>
  ), []);

  // Componente para mostrar cuando no hay resultados
  const EmptyResultsComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
      <Text style={styles.emptyText}>
        Intenta con otra búsqueda o cambia los filtros aplicados
      </Text>
    </View>
  ), []);

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
          <FlatList
            data={filteredScales}
            renderItem={renderScaleItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.resultsGrid}
            ListEmptyComponent={EmptyResultsComponent}
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            windowSize={5}
            showsVerticalScrollIndicator={true}
          />
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
            <Text style={[styles.filterTitle, { color: colors.text }]}>Categories</Text>
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

          <Text style={[styles.filterTitle, { color: colors.text }]}>Sort By</Text>
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
          </Animated.View>
        </ResponsiveContainer>
      )}

      <View style={styles.listContainer}>
        <FlatList
          data={filteredScales}
          renderItem={renderScaleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsGrid}
          ListEmptyComponent={EmptyResultsComponent}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
          showsVerticalScrollIndicator={true}
        />
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
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  advancedButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 8,
    marginRight: 8,
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#0891b2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  sortChipSelected: {
    backgroundColor: '#0891b2',
  },
  sortChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  sortChipTextSelected: {
    color: '#ffffff',
  },
  listContainer: {
    flex: 1,
  },
  resultsGrid: {
    padding: 16,
    gap: 16,
    flexGrow: 1, // Asegurar que la lista ocupe todo el espacio disponible
  },
  scaleCard: {
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
  imageContainer: {
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  cardContent: {
    padding: 16,
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
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 14,
    color: '#0891b2',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 200,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});