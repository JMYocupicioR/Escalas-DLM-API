import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { validateSMARTGoal } from '@/utils/gasValidation';
import type { GASCategory, GASLevelKey } from '@/types/gas';

export interface SMARTValidationIndicatorProps {
  value: string;
  category?: GASCategory;
  levels?: Record<GASLevelKey, string>;
}

const criterionOrder = [
  { key: 'isSpecific', label: 'S' },
  { key: 'isMeasurable', label: 'M' },
  { key: 'isAchievable', label: 'A' },
  { key: 'isRelevant', label: 'R' },
  { key: 'isTimebound', label: 'T' },
] as const;

const SMARTValidationIndicator: React.FC<SMARTValidationIndicatorProps> = ({ value, category, levels }) => {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const validation = useMemo(
    () => validateSMARTGoal({ title: '', levels: { '-2': '', '-1': '', '0': value || '', '1': '', '2': '', ...(levels || {}) }, category }),
    [value, category, levels]
  );

  const pct = Math.round(validation.score * 100);
  const status: 'good' | 'warn' | 'bad' = pct >= 90 ? 'good' : pct >= 70 ? 'warn' : 'bad';

  const iconColor = status === 'good' ? '#16a34a' : status === 'warn' ? '#f59e0b' : '#ef4444';

  const onShowDetails = () => {
    const lines: string[] = [];
    if (validation.warnings.length) {
      lines.push('⚠️ Advertencias:');
      validation.warnings.forEach(w => lines.push(`• ${w}`));
    }
    if (validation.suggestions.length) {
      lines.push('', '💡 Sugerencias:');
      validation.suggestions.forEach(s => lines.push(`• ${s}`));
    }
    if (!lines.length) lines.push('Sin comentarios adicionales.');
    Alert.alert('Detalle de validación SMART', lines.join('\n'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}> 
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {status === 'good' ? (
            <CheckCircle size={16} color={iconColor} />
          ) : status === 'warn' ? (
            <AlertCircle size={16} color={iconColor} />
          ) : (
            <XCircle size={16} color={iconColor} />
          )}
          <Text style={[styles.headerText, { color: colors.text }]}>SMART {pct}% · {validation.rating}</Text>
        </View>
        <TouchableOpacity onPress={onShowDetails} accessibilityRole="button" accessibilityLabel="Ver detalles SMART">
          <Info size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Criteria bubbles */}
      <View style={styles.criteriaRow}>
        {criterionOrder.map(c => {
          const ok = (validation as any)[c.key] as boolean;
          return (
            <View key={c.key} style={styles.criterion} accessibilityRole="text" accessibilityLabel={`${c.label} ${ok ? 'cumple' : 'no cumple'}`}>
              <View style={[styles.bubble, { backgroundColor: ok ? '#16a34a' : '#ef4444' }]}>
                <Text style={styles.bubbleText}>{c.label}</Text>
              </View>
              <Text style={[styles.criterionLabel, { color: colors.mutedText }]}>{c.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Warnings (max 2) */}
      {validation.warnings.slice(0, 2).map((w, i) => (
        <Text key={`w-${i}`} style={[styles.warnText, { color: '#dc2626' }]}>⚠️ {w}</Text>
      ))}

      {/* Suggestions (only if score < 0.7) */}
      {validation.score < 0.7 && validation.suggestions.slice(0, 2).map((s, i) => (
        <Text key={`s-${i}`} style={[styles.suggestionText, { color: colors.primary }]}>💡 {s}</Text>
      ))}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  criterion: {
    alignItems: 'center',
  },
  bubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  criterionLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  warnText: {
    fontSize: 12,
    marginTop: 4,
  },
  suggestionText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default SMARTValidationIndicator;

