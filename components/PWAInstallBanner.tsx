/**
 * @file components/PWAInstallBanner.tsx
 * @description Banner prompting users to install the app as a PWA
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Ionicons } from '@expo/vector-icons';

export function PWAInstallBanner() {
  const { canInstall, canPromptNative, showIOSInstructions, promptInstall, dismiss } =
    usePWAInstall();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (canInstall) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [canInstall, fadeAnim]);

  if (Platform.OS !== 'web' || !canInstall) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="download-outline" size={24} color="#06b6d4" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Instalar Escalas DLM</Text>
          {canPromptNative ? (
            <Text style={styles.subtitle}>
              Acceso rápido desde tu pantalla de inicio, funciona sin conexión
            </Text>
          ) : showIOSInstructions ? (
            <Text style={styles.subtitle}>
              Toca{' '}
              <Ionicons name="share-outline" size={14} color="#94a3b8" />
              {' '}y luego "Agregar a pantalla de inicio"
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          {canPromptNative && (
            <TouchableOpacity style={styles.installButton} onPress={promptInstall}>
              <Text style={styles.installButtonText}>Instalar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 12,
    right: 12,
    zIndex: 9999,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 -4px 24px rgba(0,0,0,0.4)' } as any)
      : {}),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  installButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
});
