// components/GASWizard.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Search, X, Lightbulb, Clock, Target, Info } from 'lucide-react-native';
import { 
  getGASSuggestions, 
  getGASSuggestionsMultiPathology,
  GASGoalSuggestion, 
  GASCategory, 
  PathologyType,
  CATEGORY_LABELS,
  PATHOLOGY_LABELS 
} from '@/data/gasSuggestions';

interface GASWizardProps {
  visible: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: GASGoalSuggestion, category: GASCategory) => void;
  colors: any;
}

export const GASWizard: React.FC<GASWizardProps> = ({
  visible,
  onClose,
  onSelectSuggestion,
  colors
}) => {
  const [selectedPathology, setSelectedPathology] = useState<PathologyType>('general');
  const [selectedCategory, setSelectedCategory] = useState<GASCategory>('funcion_activa');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Obtener sugerencias filtradas
  const suggestions = useMemo(() => {
    if (searchTerm.length > 2) {
      // Búsqueda global en todas las patologías
      return getGASSuggestionsMultiPathology(
        ['general', selectedPathology], 
        undefined, 
        10
      ).filter(suggestion =>
        suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.level0.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.tip?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Filtrar por patología y categoría seleccionadas
      return getGASSuggestions(selectedPathology, selectedCategory);
    }
  }, [selectedPathology, selectedCategory, searchTerm]);

  const handleSelectSuggestion = (suggestion: GASGoalSuggestion) => {
    onSelectSuggestion(suggestion, selectedCategory);
    onClose();
  };

  const renderSuggestionCard = (suggestion: GASGoalSuggestion, index: number) => (
    <View key={index} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionTitleRow}>
          <Target size={16} color={colors.primary} />
          <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        </View>
        <View style={styles.suggestionMeta}>
          {suggestion.weight && (
            <View style={[styles.weightBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.weightText, { color: colors.primary }]}>
                Peso: {suggestion.weight}
              </Text>
            </View>
          )}
          {suggestion.timeframe && (
            <View style={styles.timeframeBadge}>
              <Clock size={12} color={colors.mutedText} />
              <Text style={styles.timeframeText}>{suggestion.timeframe}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.suggestionContent}>
        <Text style={styles.levelLabel}>Meta SMART (Nivel 0):</Text>
        <Text style={styles.levelText}>{suggestion.level0}</Text>
        
        {suggestion.tip && (
          <View style={styles.tipContainer}>
            <Lightbulb size={14} color={colors.warning || '#f59e0b'} />
            <Text style={styles.tipText}>{suggestion.tip}</Text>
          </View>
        )}

        {suggestion.measurability && (
          <View style={styles.measurabilityContainer}>
            <Text style={styles.measurabilityLabel}>Criterios de medición:</Text>
            <Text style={styles.measurabilityText}>{suggestion.measurability}</Text>
          </View>
        )}
      </View>

      <View style={styles.suggestionActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setShowDetails(showDetails === `${index}` ? null : `${index}`)}
        >
          <Info size={16} color={colors.mutedText} />
          <Text style={[styles.detailsButtonText, { color: colors.mutedText }]}>
            {showDetails === `${index}` ? 'Ocultar' : 'Ver'} niveles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.useButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSelectSuggestion(suggestion)}
        >
          <Text style={styles.useButtonText}>Usar este objetivo</Text>
        </TouchableOpacity>
      </View>

      {showDetails === `${index}` && (
        <View style={styles.levelsDetail}>
          <Text style={styles.levelsTitle}>Niveles completos:</Text>
          
          {suggestion.level2 && (
            <View style={styles.levelRow}>
              <Text style={[styles.levelBadge, { backgroundColor: '#10b981' }]}>+2</Text>
              <Text style={styles.levelDetailText}>{suggestion.level2}</Text>
            </View>
          )}
          
          {suggestion.level1 && (
            <View style={styles.levelRow}>
              <Text style={[styles.levelBadge, { backgroundColor: '#3b82f6' }]}>+1</Text>
              <Text style={styles.levelDetailText}>{suggestion.level1}</Text>
            </View>
          )}
          
          <View style={styles.levelRow}>
            <Text style={[styles.levelBadge, { backgroundColor: colors.primary }]}>0</Text>
            <Text style={styles.levelDetailText}>{suggestion.level0}</Text>
          </View>
          
          {suggestion.levelMinus1 && (
            <View style={styles.levelRow}>
              <Text style={[styles.levelBadge, { backgroundColor: '#f59e0b' }]}>-1</Text>
              <Text style={styles.levelDetailText}>{suggestion.levelMinus1}</Text>
            </View>
          )}
          
          {suggestion.levelMinus2 && (
            <View style={styles.levelRow}>
              <Text style={[styles.levelBadge, { backgroundColor: '#ef4444' }]}>-2</Text>
              <Text style={styles.levelDetailText}>{suggestion.levelMinus2}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Lightbulb size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Asistente de Objetivos SMART</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.mutedText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar objetivos por palabras clave..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={colors.mutedText}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <X size={16} color={colors.mutedText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        {searchTerm.length <= 2 && (
          <View style={styles.filtersSection}>
            <Text style={styles.filterTitle}>Tipo de paciente:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {Object.entries(PATHOLOGY_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterChip,
                    selectedPathology === key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedPathology(key as PathologyType)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedPathology === key ? '#fff' : colors.text }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Categoría funcional:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterChip,
                    selectedCategory === key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(key as GASCategory)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedCategory === key ? '#fff' : colors.text }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results */}
        <ScrollView style={styles.resultsSection} showsVerticalScrollIndicator={false}>
          {suggestions.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {suggestions.length} objetivo{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
                </Text>
                {searchTerm.length <= 2 && (
                  <Text style={styles.resultsContext}>
                    {PATHOLOGY_LABELS[selectedPathology]} • {CATEGORY_LABELS[selectedCategory]}
                  </Text>
                )}
              </View>
              
              {suggestions.map((suggestion, index) => renderSuggestionCard(suggestion, index))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Lightbulb size={48} color={colors.mutedText} />
              <Text style={styles.emptyTitle}>No se encontraron objetivos</Text>
              <Text style={styles.emptyText}>
                {searchTerm.length > 2
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Selecciona una combinación diferente de patología y categoría'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Info size={16} color={colors.mutedText} />
            <Text style={styles.footerText}>
              Los objetivos son sugerencias basadas en evidencia. Adapta según necesidades específicas del paciente.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  searchSection: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  filtersSection: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sectionBackground,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsSection: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultsContext: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 4,
  },
  suggestionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    marginBottom: 12,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeframeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeframeText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  suggestionContent: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: `#f59e0b20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    fontStyle: 'italic',
  },
  measurabilityContainer: {
    backgroundColor: colors.sectionBackground,
    padding: 12,
    borderRadius: 8,
  },
  measurabilityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  measurabilityText: {
    fontSize: 13,
    color: colors.mutedText,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  useButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  levelsDetail: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  levelsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  levelBadge: {
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  levelDetailText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16,
  },
});
