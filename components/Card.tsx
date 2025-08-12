import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface CardProps extends PressableProps {
  title: string;
  subtitle?: string;
  count?: number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  countStyle?: StyleProp<TextStyle>;
  textColor?: string;
  icon?: React.ReactNode;
}

const Card = memo(
  React.forwardRef<View, CardProps>(({ 
    title, 
    subtitle, 
    count, 
    style, 
    titleStyle, 
    subtitleStyle, 
    countStyle,
    textColor,
    icon,
    ...props 
  }, ref) => {
    const { colors } = useThemedStyles();

    const dynamicStyles = useMemo(() => StyleSheet.create({
      card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 140,
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
      },
      title: {
        fontSize: 16,
        fontWeight: '600',
        color: textColor || colors.text,
        marginBottom: 4,
      },
      subtitle: {
        fontSize: 14,
        color: textColor || colors.mutedText,
      },
      count: {
        fontSize: 14,
        color: textColor || colors.mutedText,
        marginTop: 8,
      },
    }), [colors, textColor]);

    return (
      <Pressable 
        {...props}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
      >
        <View ref={ref} style={[dynamicStyles.card, style]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={[
              dynamicStyles.title, 
              titleStyle
            ]}>
              {title}
            </Text>
            
            {subtitle && (
              <Text style={[
                dynamicStyles.subtitle, 
                subtitleStyle
              ]}>
                {subtitle}
              </Text>
            )}
            
            {count !== undefined && (
              <Text style={[
                dynamicStyles.count, 
                countStyle
              ]}>
                {count} escalas
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  })
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});

export { Card };