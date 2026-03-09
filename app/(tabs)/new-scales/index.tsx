import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { getScales } from '@/api/scales';
import { Scale } from '@/types/scale';
import { SearchBar } from '@/components/SearchBar';
import { ScaleCard } from '@/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScalesListScreen() {
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const insets = useSafeAreaInsets();
  
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLogs(prev => [msg, ...prev].slice(0, 20));
  };

  const fetchScales = React.useCallback(async () => {
    try {
      addLog('[UI] fetchScales started');
      setError(null);
      const startTime = Date.now();
      const response = await getScales({ 
        query: searchQuery,
        limit: 50 
      });
      addLog(`[UI] getScales response: error=${response.error} count=${response.count}`);
      
      // Artificial delay for smooth UX if too fast
      const elapsed = Date.now() - startTime;
      if (elapsed < 300) await new Promise(r => setTimeout(r, 300 - elapsed));
      
      if (response.error) {
        addLog(`[UI] Error loading scales: ${response.message}`);
        setError(response.message || 'Error al cargar las escalas');
      } else {
        addLog(`[UI] Scales loaded: ${response.data?.length}`);
        setScales(response.data || []);
      }
    } catch (err) {
      addLog(`[UI] Catch error in fetchScales: ${JSON.stringify(err)}`);
      setError('Error de conexión');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchScales();
  }, [fetchScales]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScales();
  };

  const renderScaleItem = ({ item }: { item: Scale }) => {
    // Debug log to verify item structure if needed
    // console.log('ScaleItem:', item); 
    return (
      <ScaleCard 
        scale={item}
        layout="list"
        onPress={() => {
            if (!item.id) {
                console.warn('Scale item missing ID:', item);
                alert('Error: Escala sin ID');
                return;
            }
            router.push(`/new-scales/${item.id}`);
        }}
        style={styles.scaleCard}
      />
    );
  };

  const styles = createStyles(fontSizeMultiplier, insets);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Escalas Médicas</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Herramientas de evaluación aprobadas
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar escala..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Cargando escalas...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchScales}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scales}
          renderItem={renderScaleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No se encontraron escalas
              </Text>
            </View>
          }
        />
      )}
      <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
        <Text style={{ fontWeight: 'bold' }}>Debug Logs:</Text>
        {debugLogs.map((log, index) => (
          <Text key={index} style={{ fontSize: 10, fontFamily: 'monospace' }}>{log}</Text>
        ))}
      </View>
    </View>
  );
}

const createStyles = (fontSizeMultiplier: number, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: insets.top,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28 * fontSizeMultiplier,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16 * fontSizeMultiplier,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  scaleCard: {
    marginBottom: 12,
    padding: 0, // ScaleCard handles its own padding usually, or we let it inherit? 
    // ScaleCard container has padding.
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  }
});
