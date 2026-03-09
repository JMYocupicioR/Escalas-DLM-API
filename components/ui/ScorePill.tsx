import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DomainResult {
  id: string;
  label: string;
  score: number;
  interpretation?: {
    label?: string;
    interpretation?: string;
    interpretation_text?: string;
    color?: string;
    color_code?: string;
  } | null;
}

interface ScorePillProps {
  totalScore: number;
  globalInterpretation?: {
    label?: string;
    interpretation?: string;
    interpretation_text?: string;
    color?: string;
    color_code?: string;
  } | null;
  domains: DomainResult[];
  colors: any;
  fontSizeMultiplier?: number;
  alwaysExpanded?: boolean;
}

export const ScorePill: React.FC<ScorePillProps> = ({
  totalScore,
  globalInterpretation,
  domains,
  colors,
  fontSizeMultiplier = 1,
  alwaysExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(alwaysExpanded);

  const toggleExpanded = () => {
    if (alwaysExpanded) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const interpColor = globalInterpretation?.color || globalInterpretation?.color_code || colors.primary;
  const hasDomains = domains.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Collapsed pill header */}
      <TouchableOpacity
        style={styles.pillHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        disabled={alwaysExpanded}
      >
        <View style={styles.pillLeft}>
          <Text style={[styles.pillLabel, { color: colors.mutedText, fontSize: 12 * fontSizeMultiplier }]}>
            Total
          </Text>
          <Text style={[styles.pillScore, { color: colors.text, fontSize: 20 * fontSizeMultiplier }]}>
            {totalScore}
          </Text>
        </View>

        {globalInterpretation?.label && (
          <View style={[styles.interpBadge, { backgroundColor: interpColor + '20' }]}>
            <Text style={[styles.interpBadgeText, { color: interpColor, fontSize: 11 * fontSizeMultiplier }]}>
              {globalInterpretation.label}
            </Text>
          </View>
        )}

        {!alwaysExpanded && hasDomains && (
          <View style={styles.chevronWrap}>
            {expanded ? (
              <ChevronDown size={18} color={colors.mutedText} />
            ) : (
              <ChevronUp size={18} color={colors.mutedText} />
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Expanded domains */}
      {expanded && hasDomains && (
        <View style={[styles.domainsContainer, { borderTopColor: colors.border }]}>
          {domains.map((d) => {
            const dColor = d.interpretation?.color || d.interpretation?.color_code || colors.mutedText;
            return (
              <View key={d.id} style={styles.domainRow}>
                <Text style={[styles.domainLabel, { color: colors.text, fontSize: 13 * fontSizeMultiplier }]}>
                  {d.label}
                </Text>
                <View style={styles.domainRight}>
                  <Text style={[styles.domainScore, { color: colors.text, fontSize: 15 * fontSizeMultiplier }]}>
                    {d.score}
                  </Text>
                  {d.interpretation?.label && (
                    <View style={[styles.domainBadge, { backgroundColor: dColor + '20' }]}>
                      <Text style={[styles.domainBadgeText, { color: dColor, fontSize: 10 * fontSizeMultiplier }]}>
                        {d.interpretation.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  pillLabel: {
    fontWeight: '500',
  },
  pillScore: {
    fontWeight: '700',
  },
  interpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  interpBadgeText: {
    fontWeight: '600',
  },
  chevronWrap: {
    marginLeft: 4,
  },
  domainsContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  domainLabel: {
    fontWeight: '500',
    flex: 1,
  },
  domainRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainScore: {
    fontWeight: '700',
  },
  domainBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  domainBadgeText: {
    fontWeight: '600',
  },
});
