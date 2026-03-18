import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Vibration } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useToastStore } from '@/components/Toast';

interface FavoriteButtonProps {
  scaleId: string;
  size?: number;
  style?: any;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ 
  scaleId, 
  size = 20, 
  style, 
  onToggle 
}: FavoriteButtonProps) {
  const { colors } = useThemedStyles();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { showToast } = useToastStore();
  const scale = useSharedValue(1);
  const favorite = isFavorite(scaleId);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    // Animate
    scale.value = withSequence(
      withSpring(1.3, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    // Toggle favorite
    const wasFavorite = favorite;
    toggleFavorite(scaleId);
    
    // Show toast feedback
    showToast({
      type: wasFavorite ? 'info' : 'success',
      title: wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      duration: 2000
    });
    
    onToggle?.(!wasFavorite);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      accessibilityRole="button"
    >
      <Animated.View style={animatedStyle}>
        <Heart 
          size={size} 
          color={favorite ? '#ef4444' : colors.mutedText}
          fill={favorite ? '#ef4444' : 'transparent'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  button: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
});
