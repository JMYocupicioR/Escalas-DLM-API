import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  showCounter?: boolean;
  animated?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showPercentage = false,
  showCounter = true,
  animated = true,
  height = 6,
  color,
  backgroundColor,
}) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const progressColor = color || colors.primary;
  const bgColor = backgroundColor || colors.border;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {(showCounter || showPercentage) && (
        <View style={styles.labelContainer}>
          {showCounter && (
            <Text
              style={[
                styles.counter,
                { color: colors.text, fontSize: 14 * fontSizeMultiplier },
              ]}
            >
              {current} / {total}
            </Text>
          )}
          {showPercentage && (
            <Text
              style={[
                styles.percentage,
                { color: colors.mutedText, fontSize: 14 * fontSizeMultiplier },
              ]}
            >
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: bgColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: progressColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counter: {
    fontWeight: '600',
  },
  percentage: {
    fontWeight: '500',
  },
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
