import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Scale } from '@/types/scale';
import { GetScalesParams } from '@/api/scales/types';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface AdvancedSearchProps {
  onSearch: (params: GetScalesParams) => void;
  isLoading?: boolean;
  initialQuery?: string;
  availableCategories?: FilterOption[];
  availableSpecialties?: FilterOption[];
  availableTags?: FilterOption[];
}

interface SearchState {
  query: string;
  category: string;
  specialty: string;
  tags: string[];
  sortBy: 'name' | 'popularity' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  language: string;
  showFilters: boolean;
}

const DEFAULT_CATEGORIES: FilterOption[] = [
  { id: 'all', label: 'Todas las categorías', value: '' },
  { id: 'funcional', label: 'Funcional', value: 'Funcional', count: 15 },
  { id: 'neurologica', label: 'Neurológica', value: 'Neurológica', count: 23 },
  { id: 'psiquiatrica', label: 'Psiquiátrica', value: 'Psiquiátrica', count: 18 },
  { id: 'cardiovascular', label: 'Cardiovascular', value: 'Cardiovascular', count: 12 },
  { id: 'respiratoria', label: 'Respiratoria', value: 'Respiratoria', count: 8 },
  { id: 'dolor', label: 'Dolor', value: 'Dolor', count: 14 },
  { id: 'calidad_vida', label: 'Calidad de Vida', value: 'Calidad de Vida', count: 11 },
  { id: 'geriatrica', label: 'Geriátrica', value: 'Geriátrica', count: 9 },
  { id: 'pediatrica', label: 'Pediátrica', value: 'Pediátrica', count: 7 },
];

const DEFAULT_SPECIALTIES: FilterOption[] = [
  { id: 'all', label: 'Todas las especialidades', value: '' },
  { id: 'medicina_fisica', label: 'Medicina Física y Rehabilitación', value: 'Medicina Física y Rehabilitación' },
  { id: 'neurologia', label: 'Neurología', value: 'Neurología' },
  { id: 'psiquiatria', label: 'Psiquiatría', value: 'Psiquiatría' },
  { id: 'cardiologia', label: 'Cardiología', value: 'Cardiología' },
  { id: 'neumologia', label: 'Neumología', value: 'Neumología' },
  { id: 'geriatria', label: 'Geriatría', value: 'Geriatría' },
  { id: 'pediatria', label: 'Pediatría', value: 'Pediatría' },
  { id: 'medicina_interna', label: 'Medicina Interna', value: 'Medicina Interna' },
  { id: 'terapia_ocupacional', label: 'Terapia Ocupacional', value: 'Terapia Ocupacional' },
  { id: 'fisioterapia', label: 'Fisioterapia', value: 'Fisioterapia' },
];

const POPULAR_TAGS: FilterOption[] = [
  { id: 'actividades_vida_diaria', label: 'Actividades de la vida diaria', value: 'actividades_vida_diaria' },
  { id: 'cognicion', label: 'Cognición', value: 'cognicion' },
  { id: 'movilidad', label: 'Movilidad', value: 'movilidad' },
  { id: 'depresion', label: 'Depresión', value: 'depresion' },
  { id: 'ansiedad', label: 'Ansiedad', value: 'ansiedad' },
  { id: 'equilibrio', label: 'Equilibrio', value: 'equilibrio' },
  { id: 'marcha', label: 'Marcha', value: 'marcha' },
  { id: 'fatiga', label: 'Fatiga', value: 'fatiga' },
  { id: 'calidad_sueno', label: 'Calidad del sueño', value: 'calidad_sueno' },
  { id: 'dolor_cronico', label: 'Dolor crónico', value: 'dolor_cronico' },
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  isLoading = false,
  initialQuery = '',
  availableCategories = DEFAULT_CATEGORIES,
  availableSpecialties = DEFAULT_SPECIALTIES,
  availableTags = POPULAR_TAGS,
}) => {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [state, setState] = useState<SearchState>({
    query: initialQuery,
    category: '',
    specialty: '',
    tags: [],
    sortBy: 'popularity',
    sortOrder: 'desc',
    language: 'es',
    showFilters: false,
  });

  const [animatedHeight] = useState(new Animated.Value(0));
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  const debouncedSearch = useCallback((searchState: SearchState) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      const params: GetScalesParams = {
        query: searchState.query || undefined,
        category: searchState.category || undefined,
        specialty: searchState.specialty || undefined,
        tags: searchState.tags.length > 0 ? searchState.tags : undefined,
        sortBy: searchState.sortBy,
        sortOrder: searchState.sortOrder,
        language: searchState.language,
        limit: 50, // Default limit
      };

      onSearch(params);
    }, 300);

    setSearchTimeout(timeout);
  }, [onSearch, searchTimeout]);

  // Trigger search when state changes
  useEffect(() => {
    debouncedSearch(state);
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [state, debouncedSearch]);

  // Toggle filters animation
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: state.showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [state.showFilters]);

  const handleQueryChange = (query: string) => {
    setState(prev => ({ ...prev, query }));
  };

  const handleCategoryChange = (category: string) => {
    setState(prev => ({ ...prev, category }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setState(prev => ({ ...prev, specialty }));
  };

  const handleTagToggle = (tag: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSortChange = (sortBy: typeof state.sortBy, sortOrder: typeof state.sortOrder) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      category: '',
      specialty: '',
      tags: [],
      sortBy: 'popularity',
      sortOrder: 'desc',
    }));
  };

  const toggleFilters = () => {
    setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  };

  const hasActiveFilters = state.category || state.specialty || state.tags.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar escalas médicas..."
            placeholderTextColor={colors.textSecondary}
            value={state.query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
          />
          {state.query.length > 0 && (
            <TouchableOpacity
              onPress={() => handleQueryChange('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={toggleFilters}
          style={[
            styles.filterToggle,
            hasActiveFilters && styles.filterToggleActive,
          ]}
        >
          <Text style={[
            styles.filterToggleText,
            hasActiveFilters && styles.filterToggleTextActive,
          ]}>
            Filtros
          </Text>
          {hasActiveFilters && (
            <View style={styles.activeFiltersIndicator}>
              <Text style={styles.activeFiltersCount}>
                {(state.category ? 1 : 0) + 
                 (state.specialty ? 1 : 0) + 
                 state.tags.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      <Animated.View
        style={[
          styles.filtersContainer,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 800],
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              onPress={clearFilters}
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              disabled={!hasActiveFilters}
            >
              <Text style={[
                styles.quickActionText,
                !hasActiveFilters && styles.quickActionTextDisabled,
              ]}>
                Limpiar filtros
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Ordenar por</Text>
            <View style={styles.sortContainer}>
              {[
                { key: 'popularity', label: 'Popularidad', order: 'desc' },
                { key: 'name', label: 'Nombre', order: 'asc' },
                { key: 'created_at', label: 'Más recientes', order: 'desc' },
                { key: 'updated_at', label: 'Actualizadas', order: 'desc' },
              ].map(sort => (
                <TouchableOpacity
                  key={sort.key}
                  onPress={() => handleSortChange(sort.key as any, sort.order as any)}
                  style={[
                    styles.sortOption,
                    state.sortBy === sort.key && styles.sortOptionSelected,
                  ]}
                >
                  <Text style={[
                    styles.sortOptionText,
                    state.sortBy === sort.key && styles.sortOptionTextSelected,
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categoría</Text>
            <View style={styles.filterGrid}>
              {availableCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryChange(category.value)}
                  style={[
                    styles.filterChip,
                    state.category === category.value && styles.filterChipSelected,
                  ]}
                >
                  <Text style={[
                    styles.filterChipText,
                    state.category === category.value && styles.filterChipTextSelected,
                  ]}>
                    {category.label}
                  </Text>
                  {category.count !== undefined && (
                    <Text style={[
                      styles.filterChipCount,
                      state.category === category.value && styles.filterChipCountSelected,
                    ]}>
                      {category.count}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Specialties */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Especialidad</Text>
            <View style={styles.filterGrid}>
              {availableSpecialties.map(specialty => (
                <TouchableOpacity
                  key={specialty.id}
                  onPress={() => handleSpecialtyChange(specialty.value)}
                  style={[
                    styles.filterChip,
                    state.specialty === specialty.value && styles.filterChipSelected,
                  ]}
                >
                  <Text style={[
                    styles.filterChipText,
                    state.specialty === specialty.value && styles.filterChipTextSelected,
                  ]}>
                    {specialty.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Etiquetas</Text>
            <View style={styles.filterGrid}>
              {availableTags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => handleTagToggle(tag.value)}
                  style={[
                    styles.filterChip,
                    styles.tagChip,
                    state.tags.includes(tag.value) && styles.filterChipSelected,
                  ]}
                >
                  <Text style={[
                    styles.filterChipText,
                    state.tags.includes(tag.value) && styles.filterChipTextSelected,
                  ]}>
                    {tag.label}
                  </Text>
                  {state.tags.includes(tag.value) && (
                    <Text style={styles.tagRemoveIcon}>×</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {state.category && (
              <TouchableOpacity
                onPress={() => handleCategoryChange('')}
                style={styles.activeFilterPill}
              >
                <Text style={styles.activeFilterText}>
                  {availableCategories.find(c => c.value === state.category)?.label}
                </Text>
                <Text style={styles.activeFilterRemove}>×</Text>
              </TouchableOpacity>
            )}
            {state.specialty && (
              <TouchableOpacity
                onPress={() => handleSpecialtyChange('')}
                style={styles.activeFilterPill}
              >
                <Text style={styles.activeFilterText}>
                  {availableSpecialties.find(s => s.value === state.specialty)?.label}
                </Text>
                <Text style={styles.activeFilterRemove}>×</Text>
              </TouchableOpacity>
            )}
            {state.tags.map(tag => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTagToggle(tag)}
                style={styles.activeFilterPill}
              >
                <Text style={styles.activeFilterText}>
                  {availableTags.find(t => t.value === tag)?.label}
                </Text>
                <Text style={styles.activeFilterRemove}>×</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  filterToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
  filterToggleActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    borderWidth: 2,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterToggleTextActive: {
    color: colors.primary,
  },
  activeFiltersIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFiltersCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  filtersContainer: {
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },
  quickAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text,
  },
  quickActionTextDisabled: {
    color: colors.textSecondary,
  },
  filterSection: {
    padding: 16,
    paddingTop: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  sortOptionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    minHeight: 40,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.15s ease',
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
  filterChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    borderWidth: 2,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(8, 145, 178, 0.2)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterChipCount: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  filterChipCountSelected: {
    color: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  tagChip: {
    // Additional styling for tag chips if needed
  },
  tagRemoveIcon: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    minHeight: 36,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(8, 145, 178, 0.15)',
        transition: 'all 0.15s ease',
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  activeFilterText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  activeFilterRemove: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});