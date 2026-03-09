import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, ListFilter, ChevronRight } from 'lucide-react-native';
import { getScales } from '@/api/scales';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { Scale } from '@/types/scale';

type CategoryBlock = {
  name: string;
  total: number;
  scales: Scale[];
};

function normalizeCategory(category?: string) {
  if (!category || !category.trim()) return 'Sin categoría';
  return category.trim();
}

export default function ScalesCategoriesHome() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScales = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const response = await getScales({ limit: 500 });

    if (response.error || !response.data) {
      setError(response.message || 'No se pudieron cargar las escalas desde Supabase.');
      setScales([]);
    } else {
      setError(null);
      setScales(response.data);
    }

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    loadScales();
  }, [loadScales]);

  const categories = useMemo<CategoryBlock[]>(() => {
    const grouped = scales.reduce<Record<string, Scale[]>>((acc, scale) => {
      const key = normalizeCategory(scale.category);
      if (!acc[key]) acc[key] = [];
      acc[key].push(scale);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, categoryScales]) => ({
        name,
        total: categoryScales.length,
        scales: [...categoryScales].sort((a, b) => a.name.localeCompare(b.name, 'es')),
      }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'));
  }, [scales]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadScales(true)} />}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Layers size={24} color={colors.primary} />
          </View>
          <Text style={styles.title}>Inicio</Text>
          <Text style={styles.subtitle}>
            Escalas agrupadas por categoría usando la lista activa de Supabase.
          </Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/scales')}>
            <ListFilter size={16} color={colors.primary} />
            <Text style={styles.browseButtonText}>Explorar opciones de navegación</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centeredBlock}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.centeredText}>Cargando escalas...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.centeredBlock}>
            <Text style={styles.errorTitle}>Error de carga</Text>
            <Text style={styles.centeredText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadScales()}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && categories.length === 0 ? (
          <View style={styles.centeredBlock}>
            <Text style={styles.centeredText}>No hay escalas activas para mostrar.</Text>
          </View>
        ) : null}

        {!loading && !error && categories.map((category) => (
          <View key={category.name} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.total}</Text>
            </View>

            {category.scales.slice(0, 6).map((scale) => (
              <TouchableOpacity
                key={scale.id}
                style={styles.scaleRow}
                onPress={() => router.push(`/scales/${scale.id}`)}
              >
                <View style={styles.scaleTextBlock}>
                  <Text style={styles.scaleName}>{scale.name}</Text>
                  <Text numberOfLines={1} style={styles.scaleDescription}>
                    {scale.description}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.mutedText} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${colors.primary}10`,
  },
  browseButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  centeredBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  centeredText: {
    color: colors.mutedText,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  categoryCount: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: `${colors.primary}12`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 8,
  },
  scaleTextBlock: {
    flex: 1,
    gap: 2,
  },
  scaleName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  scaleDescription: {
    color: colors.mutedText,
    fontSize: 12,
  },
});
