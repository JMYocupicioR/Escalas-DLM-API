import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Search as SearchIcon, ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { debounce } from 'lodash';

// Definición de tipos para mejorar el tipado
interface SearchResult {
  id: string;
  name: string;
  category: string;
}

interface SearchWidgetProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  debounceMs?: number;
}

// Datos temporales - reemplazar con llamada a API
const QUICK_RESULTS: SearchResult[] = [
  { id: 'barthel', name: 'Escala de Barthel', category: 'Functional' },
  { id: 'mmse', name: 'Mini-Mental State Examination', category: 'Cognitive' },
  { id: 'borg', name: 'Escala de Borg', category: 'Respiratory' },
];

export function SearchWidget({ 
  onSearch, 
  placeholder = 'Search medical scales...', 
  initialQuery = '',
  debounceMs = 300
}: SearchWidgetProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Crear la función debounce fuera del render pero dentro de useCallback
  // para preservar su referencia mientras las dependencias no cambien
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch?.(text);
    }, debounceMs),
    [onSearch, debounceMs]
  );
  
  // Limpiar el timer de debounce cuando el componente se desmonte
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleResultPress = useCallback((scaleId: string) => {
    router.push(`/scales/${scaleId}`);
    // Opcionalmente, limpiar el input después de seleccionar
    setQuery('');
    // Quitar el foco del input
    inputRef.current?.blur();
  }, []);

  const handleViewAll = useCallback(() => {
    router.push({
      pathname: '/search',
      params: { q: query }
    });
    // Opcionalmente, quitar el foco del input
    inputRef.current?.blur();
  }, [query]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Usar setTimeout para evitar que el panel de resultados 
    // desaparezca antes de que se pueda hacer clic en un resultado
    setTimeout(() => setIsFocused(false), 200);
  }, []);

  // Filtrar resultados basados en la consulta actual
  const filteredResults = query.length > 0
    ? QUICK_RESULTS.filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_RESULTS;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#64748b" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          accessibilityLabel={placeholder}
          accessibilityRole="search"
          accessibilityHint="Buscar escalas médicas"
        />
        {query.length > 0 && (
          <Pressable 
            onPress={() => handleSearch('')}
            accessibilityLabel="Borrar búsqueda"
            accessibilityRole="button"
          >
            <View style={styles.clearButton}>
              <Text style={styles.clearButtonText}>×</Text>
            </View>
          </Pressable>
        )}
      </View>

      {isFocused && query.length > 0 && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout}
          style={styles.resultsContainer}
        >
          {filteredResults.length > 0 ? (
            <>
              {filteredResults.map(result => (
                <Pressable
                  key={result.id}
                  style={({ pressed }) => [
                    styles.resultItem,
                    pressed && styles.resultItemPressed
                  ]}
                  onPress={() => handleResultPress(result.id)}
                  accessible={true}
                  accessibilityLabel={`Escala ${result.name}, categoría ${result.category}`}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultCategory}>{result.category}</Text>
                  </View>
                  <ArrowRight size={16} color="#64748b" />
                </Pressable>
              ))}
              
              <Pressable 
                style={({ pressed }) => [
                  styles.viewAllButton,
                  pressed && styles.viewAllButtonPressed
                ]}
                onPress={handleViewAll}
                accessible={true}
                accessibilityLabel="Ver todos los resultados"
                accessibilityRole="button"
              >
                <Text style={styles.viewAllText}>Ver todos los resultados</Text>
                <ArrowRight size={16} color="#0891b2" />
              </Pressable>
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No se encontraron resultados para "{query}"</Text>
              <Pressable 
                style={styles.viewAllButton}
                onPress={handleViewAll}
                accessible={true}
                accessibilityLabel="Buscar en todas las escalas"
                accessibilityRole="button"
              >
                <Text style={styles.viewAllText}>Buscar en todas las escalas</Text>
                <ArrowRight size={16} color="#0891b2" />
              </Pressable>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000, // Asegurar que el dropdown aparezca sobre otros elementos
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#0f172a',
    height: '100%', // Asegurar que el input tenga la altura completa
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300, // Limitar la altura para evitar que ocupe toda la pantalla
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  resultItemPressed: {
    backgroundColor: '#f1f5f9',
  },
  resultName: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 4,
  },
  viewAllButtonPressed: {
    backgroundColor: '#f1f5f9',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0891b2',
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
});