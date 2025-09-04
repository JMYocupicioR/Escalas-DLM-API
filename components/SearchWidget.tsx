import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Platform,
  Keyboard,
  Vibration
} from 'react-native';
import { Search, X, Clock, Filter, Mic, Star, TrendingUp, Zap } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useScalesStore } from '@/store/scales';
import { useAutoUpdatingScales } from '@/hooks/useAutoUpdatingScales';
import { DEV_CONFIG } from '@/config/development';

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
  showVoiceSearch?: boolean;
  showQuickFilters?: boolean;
  initialValue?: string;
}

export function SearchWidget({
  placeholder = "Buscar escalas médicas...",
  onSearch,
  onFocus,
  onBlur,
  showFilters = false,
  showVoiceSearch = false,
  showQuickFilters = true,
  initialValue = ""
}: SearchWidgetProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const recentlyViewed = useScalesStore((state) => state.recentlyViewed);
  const navigation = useNavigation();
  
  // Use advanced auto-updating scales hook
  const { 
    scales: realScales, 
    forceUpdate, 
    searchScales: hookSearchScales
  } = useAutoUpdatingScales({
    updateInterval: DEV_CONFIG.SCALES.AUTO_UPDATE_INTERVAL,
    enableAutoUpdate: true,
    enableLogging: DEV_CONFIG.SCALES.ENABLE_LOGGING
  });
  
  // Animation values
  const focusScale = useSharedValue(1);
  const borderColor = useSharedValue('#e2e8f0');
  const spinnerRotation = useSharedValue(0);


  const categories = [
    'Funcional', 'Neurológica', 'Cognitiva', 'Dolor', 'Cardiovascular', 
    'Respiratoria', 'Psiquiátrica', 'Geriátrica', 'Rehab', 'Rehabilitación',
    'Medicina Física', 'Traumatología', 'Neurología', 'Geriatría', 'Osteoartritis', 'Rodilla'
  ];

  const quickFilters = [
    { id: 'popular', label: 'Populares', icon: TrendingUp, color: '#f59e0b' },
    { id: 'recent', label: 'Recientes', icon: Clock, color: '#10b981' },
    { id: 'favorites', label: 'Favoritos', icon: Star, color: '#ef4444' },
    { id: 'neurological', label: 'Neurológica', icon: Zap, color: '#8b5cf6' },
    { id: 'functional', label: 'Funcional', icon: TrendingUp, color: '#0891b2' },
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
    // Don't immediately hide suggestions to allow tap
    const timer = setTimeout(() => {
      setIsFocused(false);
      focusScale.value = withSpring(1);
      borderColor.value = '#e2e8f0';
      onBlur?.();
      setSuggestions([]);
    }, 150);
    
    // Store timer for potential cleanup
    return () => clearTimeout(timer);
  }, [onBlur, focusScale, borderColor]);

  // Generate recent search suggestions
  const generateRecentSuggestions = useCallback(() => {
    if (!realScales || realScales.length === 0) {
      setSuggestions([]);
      return;
    }

    const recentSuggestions: SearchSuggestion[] = recentlyViewed
      .slice(0, 3)
      .map(id => {
        const scale = realScales.find(s => s.id === id);
        return scale ? {
          id: scale.id,
          type: 'recent' as const,
          title: scale.name,
          subtitle: scale.description,
        } : null;
      })
      .filter(Boolean) as SearchSuggestion[];

    setSuggestions(recentSuggestions);
  }, [recentlyViewed, realScales]);

  // Generate search suggestions using the advanced hook
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      generateRecentSuggestions();
      return;
    }

    if (!realScales || realScales.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay with cleanup
    const timer = setTimeout(() => {
      try {
        // Use the advanced search function from the hook
        const scaleSuggestions: SearchSuggestion[] = hookSearchScales(searchQuery)
          .slice(0, 4)
          .map(scale => ({
            id: scale.id,
            type: 'scale' as const,
            title: scale.name,
            subtitle: scale.description,
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

        const allSuggestions = [...scaleSuggestions, ...categorySuggestions];
        setSuggestions(allSuggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    // Return cleanup function
    return () => clearTimeout(timer);
  }, [generateRecentSuggestions, realScales, categories, hookSearchScales]);

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
    (navigation as any).navigate('search', { q: query });
    
    setIsFocused(false);
    setSuggestions([]);
  }, [query, onSearch]);

  // Handle suggestion tap
  const handleSuggestionTap = useCallback((suggestion: SearchSuggestion) => {
    // Immediately hide keyboard and suggestions
    Keyboard.dismiss();
    setIsFocused(false);
    setSuggestions([]);
    inputRef.current?.blur();
    
    // Navigate based on suggestion type
    try {
      if (suggestion.type === 'scale') {
        (navigation as any).navigate('scales', { screen: suggestion.id });
      } else if (suggestion.type === 'category') {
        (navigation as any).navigate('search', { category: suggestion.id });
      } else if (suggestion.type === 'recent') {
        (navigation as any).navigate('scales', { screen: suggestion.id });
      }
    } catch (error) {
      console.error('Error handling suggestion tap:', error);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelectedQuickFilter(null);
    inputRef.current?.focus();
    generateRecentSuggestions();
  }, [generateRecentSuggestions]);

  // Handle quick filter selection
  const handleQuickFilter = useCallback((filterId: string) => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    
    setSelectedQuickFilter(filterId);
    const filter = quickFilters.find(f => f.id === filterId);
    
    if (filter) {
      // Use navigation.navigate for React Navigation compatibility
      (navigation as any).navigate('search', { 
        filter: filterId, 
        category: filter.label.toLowerCase() 
      });
    }
  }, [quickFilters]);

  // Handle voice search (placeholder - would need speech recognition library)
  const handleVoiceSearch = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }
    
    setIsVoiceSearching(true);
    // Placeholder for voice search implementation
    setTimeout(() => {
      setIsVoiceSearching(false);
      // Would implement actual voice recognition here
    }, 2000);
  }, []);

  // Render suggestion item
  const renderSuggestion = useCallback(({ item }: { item: SearchSuggestion }) => {
    if (!item || !item.id || !item.title) {
      return null;
    }

    const getIconColor = () => {
      switch (item.type) {
        case 'recent': return '#10b981';
        case 'category': return '#8b5cf6';
        default: return '#0891b2';
      }
    };

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionTap(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.suggestionIcon, { backgroundColor: `${getIconColor()}15` }]}>
          {item.type === 'recent' ? (
            <Clock size={16} color={getIconColor()} />
          ) : item.type === 'category' ? (
            <Filter size={16} color={getIconColor()} />
          ) : (
            <Search size={16} color={getIconColor()} />
          )}
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.suggestionSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleSuggestionTap]);

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
          accessibilityRole="search"
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

        {showVoiceSearch && (
          <Pressable
            style={[styles.filterButton, isVoiceSearching && styles.voiceSearchActive]}
            onPress={handleVoiceSearch}
            accessibilityLabel="Búsqueda por voz"
            accessibilityRole="button"
          >
            <Mic size={18} color={isVoiceSearching ? "#ef4444" : "#64748b"} />
          </Pressable>
        )}

        {showFilters && (
          <Pressable
            style={styles.filterButton}
            onPress={() => (navigation as any).navigate('search', { filter: 'true' })}
            accessibilityLabel="Mostrar filtros"
            accessibilityRole="button"
          >
            <Filter size={18} color="#64748b" />
          </Pressable>
        )}

        {/* Manual refresh button */}
        <Pressable
          style={[styles.filterButton, { marginLeft: 8 }]}
          onPress={forceUpdate}
          accessibilityLabel="Actualizar escalas"
          accessibilityRole="button"
        >
          <Text style={{ color: '#10b981', fontSize: 12 }}>↻</Text>
        </Pressable>
      </Animated.View>

      {/* Quick Filters */}
      {showQuickFilters && (
        <Animated.View 
          entering={FadeIn.delay(200)} 
          style={styles.quickFiltersContainer}
        >
          <FlatList
            data={quickFilters}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.quickFiltersList}
            renderItem={({ item }) => {
              const IconComponent = item.icon;
              const isSelected = selectedQuickFilter === item.id;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.quickFilterChip,
                    isSelected && styles.quickFilterChipSelected,
                    { borderColor: item.color }
                  ]}
                  onPress={() => handleQuickFilter(item.id)}
                  activeOpacity={0.7}
                >
                  <IconComponent 
                    size={14} 
                    color={isSelected ? '#ffffff' : item.color} 
                  />
                  <Text style={[
                    styles.quickFilterText,
                    isSelected && styles.quickFilterTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      )}

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
            keyboardShouldPersistTaps="always"
            maxToRenderPerBatch={6}
            windowSize={10}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        </Animated.View>
      )}

      {/* Enhanced Loading indicator */}
      {isLoading && (
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Animated.View 
              style={[
                styles.loadingSpinner,
                {
                  transform: [{ 
                    rotate: spinnerRotation.value + 'deg' 
                  }]
                }
              ]}
            >
              <Search size={16} color="#0891b2" />
            </Animated.View>
            <Text style={styles.loadingText}>Buscando escalas...</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
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
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
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
  voiceSearchActive: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  quickFiltersContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  quickFiltersList: {
    paddingVertical: 8,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginRight: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  quickFilterChipSelected: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: '#374151',
  },
  quickFilterTextSelected: {
    color: '#ffffff',
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
    ...Platform.select({
      web: {
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
      },
    }),
    zIndex: 10000,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
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
    ...Platform.select({
      web: {
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
      },
    }),
    zIndex: 10000,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingSpinner: {
    padding: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
