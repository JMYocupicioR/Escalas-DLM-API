import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getCardDimensions } from '@/utils/responsiveGrid';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useThemedStyles();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.sectionBackground,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface ScaleCardSkeletonProps {
  layout?: 'list' | 'grid';
}

/**
 * Scale Card Loading Skeleton
 */
export function ScaleCardSkeleton({ layout = 'grid' }: ScaleCardSkeletonProps) {
  const { colors } = useThemedStyles();
  const { isDesktop, width: screenWidth } = useResponsiveLayout();
  const dimensions = getCardDimensions(screenWidth, isDesktop);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: dimensions.borderRadius,
      padding: dimensions.padding,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        web: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: layout === 'list' ? 8 : 12,
    },
    listLayout: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    listContent: {
      flex: 1,
      marginLeft: 12,
    },
  });

  if (layout === 'list') {
    return (
      <View style={[styles.container, styles.listLayout]}>
        {/* Icon */}
        <Skeleton
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          borderRadius={dimensions.iconBorderRadius}
        />
        
        {/* Content */}
        <View style={styles.listContent}>
          {/* Title */}
          <Skeleton width="80%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
          
          {/* Description */}
          <Skeleton width="100%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
          
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton width={60} height={14} borderRadius={4} />
            <Skeleton width={40} height={14} borderRadius={4} />
            <Skeleton width={70} height={20} borderRadius={10} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with icon */}
      <View style={styles.header}>
        <Skeleton
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          borderRadius={dimensions.iconBorderRadius}
        />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      
      {/* Title */}
      <Skeleton width="90%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={20} borderRadius={6} style={{ marginBottom: 12 }} />
      
      {/* Description */}
      <Skeleton width="100%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
      <Skeleton width="85%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
      
      {/* Footer */}
      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={40} height={14} borderRadius={4} />
          <Skeleton width={40} height={14} borderRadius={4} />
        </View>
        
        {/* Category badge */}
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

interface ScaleGridSkeletonProps {
  count?: number;
  layout?: 'list' | 'grid';
  columns?: number;
}

/**
 * Grid of Scale Card Skeletons
 */
export function ScaleGridSkeleton({ count = 6, layout = 'grid', columns = 3 }: ScaleGridSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <View
      style={{
        flexDirection: layout === 'list' ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: layout === 'list' ? 12 : 16,
      }}
    >
      {skeletons.map((i) => (
        <View
          key={i}
          style={{
            width: layout === 'list' ? '100%' : columns === 3 ? '31%' : columns === 2 ? '47%' : '100%',
          }}
        >
          <ScaleCardSkeleton layout={layout} />
        </View>
      ))}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Empty State Component
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const { colors } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      minHeight: 300,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.sectionBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 320,
      marginBottom: action ? 24 : 0,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      ...Platform.select({
        web: {
          boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
        },
        default: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default {
  Skeleton,
  ScaleCardSkeleton,
  ScaleGridSkeleton,
  EmptyState,
};
