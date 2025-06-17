import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Platform,
  Keyboard
} from 'react-native';
import { Search, X, Clock, Filter } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useScalesStore } from '@/store/scales';

interface SearchSuggestion {
  id: string;
  type: 'scale' | 'category' | 'recent';
  title: string;
  subtitle?: string;
  icon?: string;
}

interface SearchWidgetProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showFilters?: boolean;
  initialValue?: string;
}

export function SearchWidget({
  placeholder = "Buscar escalas médicas...",
  onSearch,
  onFocus,
  onBlur,
  showFilters = false,
  initialValue = ""
}: SearchWidgetProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const recentlyViewed = useScalesStore((state) => state.recentlyViewed);
  
  // Animation values
  const focusScale = useSharedValue(1);
  const borderColor = useSharedValue('#e2e8f0');

  // Mock data - replace with real API calls
  const mockScales = [
    { id: 'barthel', name: 'Índice de Barthel', category: 'Funcional' },
    { id: 'glasgow', name: 'Escala de Glasgow', category: 'Neurológica' },
    { id: 'mmse', name: 'Mini-Mental', category: 'Cognitiva' },
    { id: 'vas', name: 'Escala Visual Analógica', category: 'Dolor' },
    { id: 'tinetti', name: 'Escala de Tinetti', category: 'Movilidad' },
  ];

  const categories = [
    'Funcional', 'Neurológica', 'Cognitiva', 'Dolor', 'Cardiovascular', 
    'Respiratoria', 'Psiquiátrica', 'Geriátrica'
  ];

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
    borderColor: borderColor.value,
  }));

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusScale.value = withSpring(1.02);
    borderColor.value = '#0891b2';
    onFocus?.();
    
    // Show recent searches if no query
    if (!query.trim()) {
      generateRecentSuggestions();
    }
  }, [query, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
    borderColor.value = '#e2e8f0';
    onBlur?.();
    
    // Hide suggestions after a delay to allow tap
    setTimeout(() => setSuggestions([]), 200);
  }, [onBlur]);

  // Generate recent search suggestions
  const generateRecentSuggestions = useCallback(() => {
    const recentSuggestions: SearchSuggestion[] = recentlyViewed
      .slice(0, 3)
      .map(id => {
        const scale = mockScales.find(s => s.id === id);
        return scale ? {
          id: scale.id,
          type: 'recent' as const,
          title: scale.name,
          subtitle: scale.category,
        } : null;
      })
      .filter(Boolean) as SearchSuggestion[];

    setSuggestions(recentSuggestions);
  }, [recentlyViewed]);

  // Generate search suggestions
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      generateRecentSuggestions();
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const scaleSuggestions: SearchSuggestion[] = mockScales
        .filter(scale => 
          scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scale.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
        .map(scale => ({
          id: scale.id,
          type: 'scale' as const,
          title: scale.name,
          subtitle: scale.category,
        }));

      const categorySuggestions: SearchSuggestion[] = categories
        .filter(cat => 
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 2)
        .map(category => ({
          id: category.toLowerCase(),
          type: 'category' as const,
          title: category,
          subtitle: 'Categoría',
        }));

      setSuggestions([...scaleSuggestions, ...categorySuggestions]);
      setIsLoading(false);
    }, 300);
  }, [generateRecentSuggestions]);

  // Handle text change with debouncing
  const handleTextChange = useCallback((text: string) => {
    setQuery(text);
    generateSuggestions(text);
  }, [generateSuggestions]);

  // Handle search submission
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    onSearch?.(query);
    
    // Navigate to search results
    router.push({
      pathname: '/search',
      params: { q: query }
    });
    
    setIsFocused(false);
    setSuggestions([]);
  }, [query, onSearch]);

  // Handle suggestion tap
  const handleSuggestionTap = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'scale') {
      router.push(`/scales/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      router.push({
        pathname: '/search',
        params: { category: suggestion.id }
      });
    } else if (suggestion.type === 'recent') {
      router.push(`/scales/${suggestion.id}`);
    }
    
    setIsFocused(false);
    setSuggestions([]);
    inputRef.current?.blur();
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
    generateRecentSuggestions();
  }, [generateRecentSuggestions]);

  // Render suggestion item
  const renderSuggestion = useCallback(({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionTap(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionIcon}>
        {item.type === 'recent' ? (
          <Clock size={16} color="#64748b" />
        ) : item.type === 'category' ? (
          <Filter size={16} color="#64748b" />
        ) : (
          <Search size={16} color="#64748b" />
        )}
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.suggestionSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ), [handleSuggestionTap]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, containerStyle]}>
        <Search size={20} color={isFocused ? "#0891b2" : "#64748b"} />
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus
          clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          accessibilityLabel="Campo de búsqueda de escalas médicas"
          accessibilityRole="searchbox"
        />

        {query.length > 0 && Platform.OS === 'android' && (
          <Pressable
            onPress={clearSearch}
            style={styles.clearButton}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <X size={18} color="#64748b" />
          </Pressable>
        )}

        {showFilters && (
          <Pressable
            style={styles.filterButton}
            onPress={() => router.push('/search?filter=true')}
            accessibilityLabel="Mostrar filtros"
            accessibilityRole="button"
          >
            <Filter size={18} color="#64748b" />
          </Pressable>
        )}
      </Animated.View>

      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <Animated.View
          entering={SlideInDown.duration(200)}
          exiting={SlideOutUp.duration(150)}
          style={styles.suggestionsContainer}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={8}
          />
        </Animated.View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Buscando...</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 12,
    marginRight: 8,
    paddingVertical: 0, // Remove default padding on Android
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  loadingContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
});