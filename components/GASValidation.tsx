import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { validateSMARTGoal, suggestGoalImprovement } from '@/utils/gasValidation';
import type { GASCategory, GASLevelKey } from '@/types/gas';

export interface GASValidationProps {
  value: string;
  category?: GASCategory;
  levels?: Record<GASLevelKey, string>;
  showConsistency?: boolean;
  compact?: boolean;
  onImprove?: (newText: string) => void;
}

export const GASValidation: React.FC<GASValidationProps> = ({
  value,
  category,
  levels,
  showConsistency = true,
  compact = false,
  onImprove,
}) => {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);

  const validation = useMemo(() => validateSMARTGoal({ title: '', levels: { '-2': '', '-1': '', '0': value || '', '1': '', '2': '', ...(levels || {}) }, category }), [value, category, levels]);

  const pct = Math.round(validation.score * 100);
  const barColor = pct >= 90 ? '#16a34a' : pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const Chip = ({ label, ok }: { label: string; ok: boolean }) => (
    <View accessibilityRole="text" style={[styles.chip, { borderColor: ok ? '#16a34a' : colors.border, backgroundColor: ok ? colors.tagBackground : 'transparent' }]}>
      <Text style={{ color: ok ? '#16a34a' : colors.mutedText }}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de puntuación */}
      <View style={styles.barWrap}>
        <View style={[styles.barBg, { backgroundColor: colors.tagBackground }]} />
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.barLegend}>
        <Text style={[styles.legendText, { color: colors.mutedText }]}>SMART: {pct}% · {validation.rating}</Text>
        {onImprove ? (
          <TouchableOpacity onPress={() => { const s = suggestGoalImprovement(value, category); onImprove(s.improved); }} accessibilityRole="button" accessibilityLabel="Mejorar objetivo automáticamente">
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Mejorar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chips de criterios */}
      <View style={styles.chipsRow}>
        <Chip label="Específica" ok={validation.isSpecific} />
        <Chip label="Medible" ok={validation.isMeasurable} />
        <Chip label="Alcanzable" ok={validation.isAchievable} />
        <Chip label="Relevante" ok={validation.isRelevant} />
        <Chip label="Con plazo" ok={validation.isTimebound} />
      </View>

      {!compact && (
        <>
          {showConsistency && validation.levelsConsistency && !validation.levelsConsistency.ok ? (
            <Text style={[styles.noteText, { color: colors.mutedText }]}>Revisa niveles: {validation.levelsConsistency.issues[0]}</Text>
          ) : null}

          {(validation.suggestions.length > 0 || validation.warnings.length > 0) && (
            <View style={{ marginTop: 6 }}>
              <TouchableOpacity onPress={() => setExpanded(e => !e)} accessibilityRole="button" accessibilityLabel="Ver sugerencias y advertencias de SMART">
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{expanded ? 'Ocultar' : 'Ver'} sugerencias</Text>
              </TouchableOpacity>
              {expanded && (
                <View style={{ marginTop: 6, gap: 4 }}>
                  {validation.warnings.map((w, i) => (
                    <Text key={`w-${i}`} style={[styles.noteText, { color: '#dc2626' }]}>• {w}</Text>
                  ))}
                  {validation.suggestions.map((s, i) => (
                    <Text key={`s-${i}`} style={[styles.noteText, { color: colors.mutedText }]}>• {s}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barWrap: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  barBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  barFill: {
    height: 8,
    borderRadius: 8,
  },
  barLegend: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noteText: {
    fontSize: 12,
  },
});

export default GASValidation;

