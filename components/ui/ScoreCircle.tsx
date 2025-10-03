import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface ScoreCircleProps {
  score: number;
  maxScore: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  maxScore,
  size = 200,
  strokeWidth = 12,
  color,
  animated = true,
  showLabel = true,
  label = 'Puntuación',
}) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const percentage = (score / maxScore) * 100;

  // Determinar color según score si no se proporciona
  const circleColor = color || getScoreColor(percentage, colors);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: score,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [score, animated]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text
          style={[
            styles.score,
            { color: colors.text, fontSize: 48 * fontSizeMultiplier },
          ]}
        >
          {Math.round(score)}
        </Text>
        <Text
          style={[
            styles.maxScore,
            { color: colors.mutedText, fontSize: 18 * fontSizeMultiplier },
          ]}
        >
          / {maxScore}
        </Text>
        {showLabel && (
          <Text
            style={[
              styles.label,
              { color: colors.mutedText, fontSize: 14 * fontSizeMultiplier },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const getScoreColor = (percentage: number, colors: any): string => {
  if (percentage >= 90) return colors.scoreOptimal;
  if (percentage >= 75) return colors.scoreExcellent;
  if (percentage >= 60) return colors.scoreGood;
  if (percentage >= 40) return colors.scoreModerate;
  if (percentage >= 25) return colors.scoreMedium;
  return colors.scoreLow;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
    lineHeight: 56,
  },
  maxScore: {
    fontWeight: '500',
    marginTop: -8,
  },
  label: {
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
