import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Loader, CheckCircle, AlertCircle, RefreshCw, Search, FileText } from 'lucide-react-native';

interface LoadingStateProps {
  type?: 'loading' | 'success' | 'error' | 'searching' | 'generating';
  message?: string;
  subMessage?: string;
  progress?: number;
  showProgress?: boolean;
}

export function LoadingState({ 
  type = 'loading', 
  message, 
  subMessage,
  progress = 0,
  showProgress = false
}: LoadingStateProps) {
  const { colors } = useThemedStyles();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    // Rotation animation for loading spinner
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );

    // Scale animation for pulsing effect
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );

    // Progress animation
    if (showProgress) {
      progressValue.value = withTiming(progress, { duration: 300 });
    }
  }, [rotation, scale, progress, showProgress, progressValue]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressValue.value, [0, 100], [0, 100])}%`,
  }));

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={32} color="#10b981" />;
      case 'error':
        return <AlertCircle size={32} color="#ef4444" />;
      case 'searching':
        return (
          <Animated.View style={scaleStyle}>
            <Search size={32} color={colors.primary} />
          </Animated.View>
        );
      case 'generating':
        return (
          <Animated.View style={rotationStyle}>
            <FileText size={32} color={colors.primary} />
          </Animated.View>
        );
      default:
        return (
          <Animated.View style={rotationStyle}>
            <RefreshCw size={32} color={colors.primary} />
          </Animated.View>
        );
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'success':
        return 'Completado';
      case 'error':
        return 'Error';
      case 'searching':
        return 'Buscando...';
      case 'generating':
        return 'Generando reporte...';
      default:
        return 'Cargando...';
    }
  };

  const styles = createStyles(colors);

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <Text style={styles.message}>
          {message || getDefaultMessage()}
        </Text>
        
        {subMessage && (
          <Text style={styles.subMessage}>
            {subMessage}
          </Text>
        )}
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// Skeleton loading component for cards
export function SkeletonCard() {
  const { colors } = useThemedStyles();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1
    );
  }, [opacity]);

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = createSkeletonStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, skeletonStyle]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.titleSkeleton, skeletonStyle]} />
          <Animated.View style={[styles.subtitleSkeleton, skeletonStyle]} />
        </View>
      </View>
      <Animated.View style={[styles.contentSkeleton, skeletonStyle]} />
      <Animated.View style={[styles.footerSkeleton, skeletonStyle]} />
    </View>
  );
}

// Shimmer loading for lists
export function ShimmerList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: `${colors.primary}10`,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 8,
    fontWeight: '500',
  },
});

const createSkeletonStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  titleSkeleton: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 6,
    width: '70%',
  },
  subtitleSkeleton: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '50%',
  },
  contentSkeleton: {
    height: 60,
    backgroundColor: colors.border,
    borderRadius: 6,
    marginBottom: 12,
  },
  footerSkeleton: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '30%',
  },
});
