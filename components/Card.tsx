import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle, TextStyle } from 'react-native';

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
    return (
      <Pressable 
        {...props}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
      >
        <View ref={ref} style={[styles.card, style]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={[
              styles.title, 
              textColor ? { color: textColor } : null,
              titleStyle
            ]}>
              {title}
            </Text>
            
            {subtitle && (
              <Text style={[
                styles.subtitle, 
                textColor ? { color: textColor } : null,
                subtitleStyle
              ]}>
                {subtitle}
              </Text>
            )}
            
            {count !== undefined && (
              <Text style={[
                styles.count, 
                textColor ? { color: textColor } : null,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  count: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});

export { Card };