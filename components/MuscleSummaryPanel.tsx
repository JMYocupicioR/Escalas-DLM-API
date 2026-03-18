import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react-native';

interface MuscleSummaryPanelProps {
  muscleStrengths: { [muscle: string]: number };
  onMusclePress?: (muscle: string) => void;
  compact?: boolean;
}

export function MuscleSummaryPanel({ 
  muscleStrengths, 
  onMusclePress, 
  compact = false 
}: MuscleSummaryPanelProps) {
  const { colors } = useThemedStyles();
  const styles = createStyles(colors);

  const affectedMuscles = Object.entries(muscleStrengths)
    .filter(([, mrc]) => mrc < 5)
    .sort(([, a], [, b]) => a - b); // Ordenar por severidad

  const normalMuscles = Object.entries(muscleStrengths)
    .filter(([, mrc]) => mrc === 5);

  const getMRCColor = (mrc: number) => {
    if (mrc === 5) return colors.success;
    if (mrc >= 4) return colors.warning;
    if (mrc >= 2) return colors.error;
    return colors.errorDark || colors.error;
  };

  const getMRCIcon = (mrc: number) => {
    if (mrc === 5) return CheckCircle;
    if (mrc >= 3) return AlertTriangle;
    return Activity;
  };

  const getPatternSuggestion = () => {
    if (affectedMuscles.length === 0) return null;
    
    const muscleNames = affectedMuscles.map(([name]) => name);
    
    // Detectar patrones comunes
    if (muscleNames.includes('Deltoides') && muscleNames.includes('Bíceps Braquial')) {
      return '🎯 Patrón sugiere lesión de tronco superior (C5-C6)';
    }
    
    if (muscleNames.includes('Interóseos Dorsales') && muscleNames.includes('Abductor del Meñique')) {
      return '🎯 Patrón sugiere lesión de tronco inferior (C8-T1)';
    }
    
    if (muscleNames.includes('Tríceps Braquial') && muscleNames.includes('Extensor de los Dedos')) {
      return '🎯 Patrón sugiere lesión de raíz C7 o nervio radial';
    }
    
    if (affectedMuscles.length === 1) {
      return '🔍 Considere evaluar músculos relacionados para confirmar patrón';
    }
    
    return null;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Resumen</Text>
          <View style={styles.compactStats}>
            <Text style={styles.compactStatText}>
              {affectedMuscles.length} afectados
            </Text>
            <Text style={styles.compactStatText}>
              {normalMuscles.length} normales
            </Text>
          </View>
        </View>
        
        {affectedMuscles.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.compactMuscleList}>
              {affectedMuscles.slice(0, 5).map(([muscle, mrc]) => {
                const IconComponent = getMRCIcon(mrc);
                return (
                  <TouchableOpacity
                    key={muscle}
                    style={styles.compactMuscleItem}
                    onPress={() => onMusclePress?.(muscle)}
                  >
                    <IconComponent size={12} color={getMRCColor(mrc)} />
                    <Text style={styles.compactMuscleName} numberOfLines={1}>
                      {muscle.split(' ')[0]}
                    </Text>
                    <Text style={styles.compactMuscleScore}>{mrc}</Text>
                  </TouchableOpacity>
                );
              })}
              {affectedMuscles.length > 5 && (
                <Text style={styles.compactMoreText}>+{affectedMuscles.length - 5}</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Activity size={20} color={colors.primary} />
        <Text style={styles.title}>Resumen Muscular</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{affectedMuscles.length}</Text>
          <Text style={styles.statLabel}>Afectados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{normalMuscles.length}</Text>
          <Text style={styles.statLabel}>Normales</Text>
        </View>
      </View>

      {affectedMuscles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Músculos Afectados:</Text>
          <ScrollView style={styles.muscleList} showsVerticalScrollIndicator={false}>
            {affectedMuscles.map(([muscle, mrc]) => {
              const IconComponent = getMRCIcon(mrc);
              return (
                <TouchableOpacity
                  key={muscle}
                  style={styles.muscleItem}
                  onPress={() => onMusclePress?.(muscle)}
                >
                  <IconComponent size={16} color={getMRCColor(mrc)} />
                  <View style={styles.muscleInfo}>
                    <Text style={styles.muscleName}>{muscle}</Text>
                    <Text style={styles.muscleScore}>MRC {mrc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {getPatternSuggestion() && (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionText}>{getPatternSuggestion()}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 300,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedText,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    muscleList: {
      maxHeight: 120,
    },
    muscleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginBottom: 4,
      backgroundColor: colors.surface,
      borderRadius: 6,
      gap: 8,
    },
    muscleInfo: {
      flex: 1,
    },
    muscleName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    muscleScore: {
      fontSize: 11,
      color: colors.mutedText,
    },
    suggestionContainer: {
      marginTop: 12,
      padding: 8,
      backgroundColor: colors.primaryLight || colors.surface,
      borderRadius: 6,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    suggestionText: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 16,
    },
    // Compact styles
    compactContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    compactHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    compactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    compactStats: {
      flexDirection: 'row',
      gap: 12,
    },
    compactStatText: {
      fontSize: 11,
      color: colors.mutedText,
    },
    compactMuscleList: {
      flexDirection: 'row',
      gap: 8,
    },
    compactMuscleItem: {
      alignItems: 'center',
      padding: 6,
      backgroundColor: colors.surface,
      borderRadius: 6,
      minWidth: 50,
    },
    compactMuscleName: {
      fontSize: 10,
      color: colors.text,
      marginTop: 2,
    },
    compactMuscleScore: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 1,
    },
    compactMoreText: {
      fontSize: 10,
      color: colors.mutedText,
      alignSelf: 'center',
      paddingHorizontal: 8,
    },
  });
