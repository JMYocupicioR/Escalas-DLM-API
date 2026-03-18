import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface OptionItem {
  label: string;
  value: number | string;
  description?: string;
  score?: number;
  id?: string;
}

interface OptionsGridProps {
  options: OptionItem[];
  selectedValue?: number | string | null;
  onSelect: (value: number | string) => void;
  disabled?: boolean;
  colors: any;
  fontSizeMultiplier?: number;
  forceVertical?: boolean;
}

/**
 * Adaptive options grid.
 * - Horizontal layout for <= 5 options with short labels (numeric scales like 0-3, 0-7)
 * - Vertical card layout for options with longer text descriptions
 */
export const OptionsGrid: React.FC<OptionsGridProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
  colors,
  fontSizeMultiplier = 1,
  forceVertical = false,
}) => {
  const useHorizontal = useMemo(() => {
    if (forceVertical) return false;
    return options.length <= 6 && options.every(o => o.label.length < 35);
  }, [options, forceVertical]);

  const handlePress = (value: number | string) => {
    if (disabled) return;
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(value);
  };

  // Severity gradient colors for horizontal buttons
  const getGradientTint = (index: number, total: number) => {
    if (total <= 1) return colors.surface;
    const ratio = index / (total - 1);
    // From neutral gray to green tint
    if (ratio <= 0.33) return colors.errorBackground || '#FEF2F2';
    if (ratio <= 0.66) return colors.warningBackground || '#FFFBEB';
    return colors.successBackground || '#ECFDF5';
  };

  if (useHorizontal) {
    return (
      <View style={styles.horizontalContainer}>
        {options.map((opt, idx) => {
          const isSelected = selectedValue != null && String(selectedValue) === String(opt.value);
          const tint = isSelected ? colors.primary + '15' : getGradientTint(idx, options.length);

          return (
            <TouchableOpacity
              key={String(opt.value) + (opt.id || idx)}
              style={[
                styles.horizontalButton,
                {
                  backgroundColor: tint,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: disabled ? 0.5 : 1,
                  flex: 1,
                },
              ]}
              onPress={() => handlePress(opt.value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              {/* Score number */}
              <Text
                style={[
                  styles.horizontalValue,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontSize: 22 * fontSizeMultiplier,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {opt.value}
              </Text>

              {/* Short label below */}
              <Text
                style={[
                  styles.horizontalLabel,
                  {
                    color: isSelected ? colors.primary : colors.mutedText,
                    fontSize: 11 * fontSizeMultiplier,
                  },
                ]}
                numberOfLines={2}
              >
                {opt.label}
              </Text>

              {/* Selected check */}
              {isSelected && (
                <View style={[styles.horizontalCheck, { backgroundColor: colors.primary }]}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Vertical card layout
  return (
    <View style={styles.verticalContainer}>
      {options.map((opt, idx) => {
        const isSelected = selectedValue != null && String(selectedValue) === String(opt.value);

        return (
          <TouchableOpacity
            key={String(opt.value) + (opt.id || idx)}
            style={[
              styles.verticalCard,
              {
                backgroundColor: isSelected ? colors.primary + '10' : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
                borderWidth: isSelected ? 2 : 1,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
            onPress={() => handlePress(opt.value)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            {/* Value circle on the left */}
            <View
              style={[
                styles.valueCircle,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.valueCircleText,
                  {
                    color: isSelected ? '#fff' : colors.text,
                    fontSize: 14 * fontSizeMultiplier,
                  },
                ]}
              >
                {opt.value}
              </Text>
            </View>

            {/* Text content */}
            <View style={styles.verticalTextContainer}>
              <Text
                style={[
                  styles.verticalLabel,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontSize: 15 * fontSizeMultiplier,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
              {opt.description && (
                <Text
                  style={[
                    styles.verticalDescription,
                    {
                      color: colors.mutedText,
                      fontSize: 13 * fontSizeMultiplier,
                    },
                  ]}
                >
                  {opt.description}
                </Text>
              )}
            </View>

            {/* Check indicator */}
            {isSelected && (
              <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                <Check size={14} color="#fff" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // -- Horizontal layout --
  horizontalContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  horizontalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    minHeight: 68,
    minWidth: 48,
    position: 'relative',
  },
  horizontalValue: {
    marginBottom: 3,
  },
  horizontalLabel: {
    textAlign: 'center',
    lineHeight: 13,
  },
  horizontalCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // -- Vertical layout --
  verticalContainer: {
    gap: 8,
    marginTop: 6,
  },
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  valueCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  valueCircleText: {
    fontWeight: '700',
  },
  verticalTextContainer: {
    flex: 1,
  },
  verticalLabel: {
    lineHeight: 19,
  },
  verticalDescription: {
    marginTop: 2,
    lineHeight: 17,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
