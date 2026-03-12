import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useGuestStore } from '@/store/guestStore';
import { Info, LogIn, X } from 'lucide-react-native';
import { useState } from 'react';

export function GuestBanner() {
  const { isDark } = useThemedStyles();
  const isGuest = useGuestStore((s) => s.isGuest);
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <LinearGradient
      colors={isDark ? ['#1e3a5f', '#0c4a6e'] : ['#e0f2fe', '#bae6fd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Info size={20} color={isDark ? '#7dd3fc' : '#0284c7'} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? '#e0f2fe' : '#0c4a6e' }]}>
            Modo Invitado
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#bae6fd' : '#0369a1' }]}>
            Puedes explorar y usar escalas. Inicia sesión para guardar evaluaciones y acceder a pacientes.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={isDark ? '#7dd3fc' : '#0284c7'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, {
          backgroundColor: isDark ? '#0284c7' : '#0369a1',
        }]}
        onPress={() => {
          useGuestStore.getState().exitGuestMode();
          router.replace('/login');
        }}
        activeOpacity={0.8}
      >
        <LogIn size={16} color="#ffffff" />
        <Text style={styles.loginText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 14,
    padding: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  dismissButton: {
    padding: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
