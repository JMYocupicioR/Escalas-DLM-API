import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useGuestStore } from '@/store/guestStore';
import { LogIn, X } from 'lucide-react-native';

export function GuestBanner() {
  const { isDark } = useThemedStyles();
  const isGuest = useGuestStore((s) => s.isGuest);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (!isGuest || dismissed) return null;

  const textColor = isDark ? '#e0f2fe' : '#0c4a6e';
  const subtitleColor = isDark ? '#bae6fd' : '#0369a1';
  const btnColor = isDark ? '#0284c7' : '#0369a1';

  return (
    <LinearGradient
      colors={isDark ? ['#1e3a5f', '#0c4a6e'] : ['#e0f2fe', '#bae6fd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Single compact row */}
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: textColor }]}>
            Modo Invitado
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={2}>
            Sin cuenta. Inicia sesión para guardar y acceder a pacientes.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: btnColor }]}
          onPress={() => {
            useGuestStore.getState().exitGuestMode();
            router.replace('/login');
          }}
          activeOpacity={0.8}
        >
          <LogIn size={14} color="#ffffff" />
          <Text style={styles.loginText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={14} color={subtitleColor} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexShrink: 0,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
