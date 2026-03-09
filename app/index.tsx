import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as ExpoRouter from 'expo-router';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const FALLBACK_BG = '#F9FAFB';
const FALLBACK_PRIMARY = '#0EA5E9';
const FALLBACK_MUTED = '#6B7280';

export default function App() {
  let router: { replace: (href: string) => void } | null = null;
  try {
    router = (ExpoRouter as { useRouter: () => { replace: (href: string) => void } }).useRouter();
  } catch {
    // useRouter puede no estar disponible
  }
  const { session, loading } = useAuthSession();
  const { colors } = useThemedStyles();
  const bg = colors?.background ?? FALLBACK_BG;
  const primary = colors?.primary ?? FALLBACK_PRIMARY;
  const muted = colors?.mutedText ?? FALLBACK_MUTED;

  useEffect(() => {
    if (loading || !router) return;
    try {
      if (!session) {
        router.replace('/login');
      } else {
        router.replace('/(tabs)');
      }
    } catch (_) {
      // fallback silencioso
    }
  }, [loading, session, router]);

  return (
    <View style={[styles.center, { backgroundColor: bg }]}>
      <ActivityIndicator size="large" color={primary} />
      <Text style={[styles.hint, { color: muted }]}>
        {loading ? 'Cargando…' : 'Redirigiendo…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
  },
});
