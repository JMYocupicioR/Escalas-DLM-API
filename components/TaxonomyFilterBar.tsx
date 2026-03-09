/**
 * @file components/TaxonomyFilterBar.tsx
 * @description Barra de filtros de taxonomía médica para la pantalla de búsqueda de escalas.
 * Presenta chips horizontales scrollables para Categoría, Especialidad y Tipo de Escala.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  TaxonomyItem,
  TaxonomyFilterState,
  TaxonomyData,
} from '@/hooks/useTaxonomyFilters';

interface TaxonomyFilterBarProps {
  filters: TaxonomyFilterState;
  onFilterChange: (filters: TaxonomyFilterState) => void;
  taxonomyData: TaxonomyData;
}

interface DimensionConfig {
  key: keyof TaxonomyFilterState;
  label: string;
  data: TaxonomyItem[];
  accentColor: string;
}

export function TaxonomyFilterBar({
  filters,
  onFilterChange,
  taxonomyData,
}: TaxonomyFilterBarProps) {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const dimensions: DimensionConfig[] = useMemo(
    () => [
      {
        key: 'categoryId',
        label: 'Categoría',
        data: taxonomyData.categories,
        accentColor: '#0891b2',
      },
      {
        key: 'specialtyId',
        label: 'Especialidad',
        data: taxonomyData.specialties,
        accentColor: '#8b5cf6',
      },
      {
        key: 'scaleTypeId',
        label: 'Tipo',
        data: taxonomyData.scaleTypes,
        accentColor: '#10b981',
      },
    ],
    [taxonomyData]
  );

  const handleSelect = useCallback(
    (dimensionKey: keyof TaxonomyFilterState, itemId: string) => {
      const isAlreadySelected = filters[dimensionKey] === itemId;
      onFilterChange({
        ...filters,
        [dimensionKey]: isAlreadySelected ? null : itemId,
      });
    },
    [filters, onFilterChange]
  );

  const handleClearAll = useCallback(() => {
    onFilterChange({
      categoryId: null,
      specialtyId: null,
      scaleTypeId: null,
      populationId: null,
      bodySystemId: null,
    });
  }, [onFilterChange]);

  if (taxonomyData.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>
          Cargando filtros...
        </Text>
      </View>
    );
  }

  if (taxonomyData.error) {
    // Silently degrade - don't show error to users, just hide the bar
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header row: "Filtros" title + clear button */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerLabel, { color: colors.text }]}>
          Filtros de taxonomía
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={handleClearAll}
            accessibilityLabel="Limpiar todos los filtros"
            accessibilityRole="button"
          >
            <X size={12} color={colors.mutedText} />
            <Text style={[styles.clearText, { color: colors.mutedText }]}>
              Limpiar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips for each dimension */}
      {dimensions.map((dim) => {
        if (!dim.data.length) return null;
        const selectedId = filters[dim.key];

        return (
          <View key={dim.key} style={styles.dimensionRow}>
            <Text style={[styles.dimensionLabel, { color: colors.mutedText }]}>
              {dim.label}
            </Text>
            <FlatList
              data={dim.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chipList}
              renderItem={({ item }) => {
                const isSelected = selectedId === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      { borderColor: dim.accentColor },
                      isSelected && { backgroundColor: dim.accentColor, borderColor: dim.accentColor },
                    ]}
                    onPress={() => handleSelect(dim.key, item.id)}
                    accessibilityLabel={`Filtrar por ${item.name_es}`}
                    accessibilityState={{ selected: isSelected }}
                    accessibilityRole="button"
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#ffffff' : dim.accentColor },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name_es}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    loadingText: {
      fontSize: 13,
    },
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Platform.select({
        web: {
          paddingHorizontal: 20,
        },
      }),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLabel: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    clearText: {
      fontSize: 12,
      fontWeight: '500',
    },
    dimensionRow: {
      gap: 6,
    },
    dimensionLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipList: {
      gap: 8,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: 'transparent',
      minHeight: 34,
      justifyContent: 'center',
      ...Platform.select({
        web: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.15s ease',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });
