import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface OptionCardProps {
  label: string;
  description?: string;
  value?: number | string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  showValue?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  description,
  value,
  selected = false,
  onPress,
  disabled = false,
  showValue = false,
}) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();

  const handlePress = () => {
    if (!disabled) {
      // Haptic feedback en mobile
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const borderColor = selected
    ? colors.primary
    : disabled
    ? colors.border
    : colors.border;

  const backgroundColor = selected
    ? `${colors.primary}10`
    : disabled
    ? colors.surfaceVariant
    : colors.card;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth: selected ? 2 : 1,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.label,
              { color: colors.text, fontSize: 16 * fontSizeMultiplier },
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.description,
                {
                  color: colors.mutedText,
                  fontSize: 14 * fontSizeMultiplier,
                },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
        <View style={styles.indicators}>
          {showValue && value !== undefined && (
            <View
              style={[
                styles.valueBadge,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <Text
                style={[
                  styles.valueText,
                  { color: colors.text, fontSize: 12 * fontSizeMultiplier },
                ]}
              >
                {value} pt{typeof value === 'number' && value !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {selected && (
            <View
              style={[
                styles.checkContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    lineHeight: 20,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  valueText: {
    fontWeight: '600',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
