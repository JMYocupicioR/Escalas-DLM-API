import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getCardDimensions } from '@/utils/responsiveGrid';
import { Star, Users, Clock } from 'lucide-react-native';

export interface ScaleCardData {
  id: string;
  name: string;
  description: string;
  category?: string;
  categoryColor?: string;
  icon?: React.ComponentType<any>;
  uses?: number;
  rating?: number;
  timeToComplete?: string;
  tags?: string[];
}

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

interface ScaleCardProps extends Omit<PressableProps, 'children'> {
  scale: ScaleCardData;
  layout?: 'list' | 'grid';
  style?: StyleProp<ViewStyle>;
  showStats?: boolean;
  showCategory?: boolean;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  rightElement?: React.ReactNode;
}

/**
 * Enhanced Scale Card with professional medical styling
 * Supports adaptive layouts (list/grid), prominent icons, stats, and categories
 */
export const ScaleCard = memo<ScaleCardProps>(({ 
  scale,
  layout = 'grid',
  style,
  showStats = true,
  showCategory = true,
  onFavoritePress,
  isFavorite = false,
  rightElement,
  ...props 
}) => {
  const { colors } = useThemedStyles();
  const { isDesktop, isTablet, width } = useResponsiveLayout();
  const dimensions = getCardDimensions(width, isDesktop);

  const IconComponent = scale.icon;
  const iconColor = scale.categoryColor || colors.primary;

  const dynamicStyles = useMemo(() => {
    const isListLayout = layout === 'list';
    
    return StyleSheet.create({
      container: {
        backgroundColor: colors.card,
        borderRadius: dimensions.borderRadius,
        padding: dimensions.padding,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
          web: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          },
        }),
      },
      containerPressed: {
        ...Platform.select({
          web: {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
          default: {
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          },
        }),
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isListLayout ? 8 : 12,
      },
      iconContainer: {
        width: dimensions.iconSize,
        height: dimensions.iconSize,
        borderRadius: dimensions.iconBorderRadius,
        backgroundColor: `${iconColor}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: isListLayout ? 12 : 0,
      },
      content: {
        flex: 1,
      },
      title: {
        fontSize: dimensions.titleSize,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
        lineHeight: dimensions.titleSize * 1.3,
      },
      description: {
        fontSize: dimensions.descSize,
        color: colors.mutedText,
        lineHeight: dimensions.descSize * 1.5,
        marginBottom: showStats || showCategory ? 12 : 0,
      },
      footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      statsContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
      },
      statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      statText: {
        fontSize: dimensions.statsSize,
        color: colors.mutedText,
        fontWeight: '500',
      },
      categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: `${iconColor}10`,
      },
      categoryText: {
        fontSize: dimensions.tagSize,
        fontWeight: '600',
        color: iconColor,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
      },
      tag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: colors.sectionBackground,
        borderWidth: 1,
        borderColor: colors.border,
      },
      tagText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
      },
    });
  }, [colors, dimensions, layout, iconColor, showStats, showCategory]);

  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      {...props}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Escala: ${scale.name}`}
      accessibilityHint={scale.description}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={({ pressed: isPressedState }) => [
        dynamicStyles.container,
        isPressedState && dynamicStyles.containerPressed,
        style,
      ]}
    >
      {layout === 'list' ? (
        // List Layout (horizontal)
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={dynamicStyles.iconContainer}>
            {IconComponent && <IconComponent size={dimensions.iconSize * 0.5} color={iconColor} />}
          </View>
          <View style={dynamicStyles.content}>
            <View style={dynamicStyles.header}>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.title} numberOfLines={1}>
                  {scale.name}
                </Text>
                <Text style={dynamicStyles.description} numberOfLines={isDesktop ? 2 : 1}>
                  {scale.description}
                </Text>
              </View>
              {rightElement}
            </View>
            
            {(showStats || showCategory) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {showStats && scale.timeToComplete && (
                  <View style={dynamicStyles.statItem}>
                    <Clock size={12} color={colors.mutedText} />
                    <Text style={dynamicStyles.statText}>{scale.timeToComplete}</Text>
                  </View>
                )}
                
                {showStats && scale.rating && (
                  <View style={dynamicStyles.statItem}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text style={dynamicStyles.statText}>{scale.rating}</Text>
                  </View>
                )}
                
                {showCategory && scale.category && (
                  <View style={dynamicStyles.categoryBadge}>
                    <Text style={dynamicStyles.categoryText}>{scale.category}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      ) : (
        // Grid Layout (vertical)
        <>
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.iconContainer}>
              {IconComponent && <IconComponent size={dimensions.iconSize * 0.5} color={iconColor} />}
            </View>
            {rightElement}
          </View>
          
          <Text style={dynamicStyles.title} numberOfLines={2}>
            {scale.name}
          </Text>
          
          <Text style={dynamicStyles.description} numberOfLines={2}>
            {scale.description}
          </Text>
          
          {(showStats || showCategory) && (
            <View style={dynamicStyles.footer}>
              {showStats && (
                <View style={dynamicStyles.statsContainer}>
                  {scale.uses && (
                    <View style={dynamicStyles.statItem}>
                      <Users size={10} color={colors.mutedText} />
                      <Text style={dynamicStyles.statText}>
                        {scale.uses > 1000 ? `${(scale.uses / 1000).toFixed(1)}k` : scale.uses}
                      </Text>
                    </View>
                  )}
                  
                  {scale.rating && (
                    <View style={dynamicStyles.statItem}>
                      <Star size={10} color="#f59e0b" fill="#f59e0b" />
                      <Text style={dynamicStyles.statText}>{scale.rating}</Text>
                    </View>
                  )}
                </View>
              )}
              
              {showCategory && scale.category && (
                <View style={dynamicStyles.categoryBadge}>
                  <Text style={dynamicStyles.categoryText}>{scale.category}</Text>
                </View>
              )}
            </View>
          )}
          
          {scale.timeToComplete && (
            <View style={[dynamicStyles.statItem, { marginTop: 8 }]}>
              <Clock size={12} color={colors.mutedText} />
              <Text style={dynamicStyles.statText}>{scale.timeToComplete}</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
});

ScaleCard.displayName = 'ScaleCard';

/**
 * Legacy Card component - maintained for backward compatibility
 */
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