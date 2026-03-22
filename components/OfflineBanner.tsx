/**
 * @file components/OfflineBanner.tsx
 * @description Subtle banner shown when the user loses internet connection
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -50 : 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isOnline, slideAnim]);

  if (Platform.OS !== 'web') return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>📡</Text>
        <Text style={styles.text}>Sin conexión — Usando datos guardados</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#92400e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  emoji: {
    fontSize: 14,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fef3c7',
  },
});
