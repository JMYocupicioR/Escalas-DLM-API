import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getProfile, getClinicsForUser, type ProfileRow, type ClinicRelationshipRow } from '@/api/profile';
import { HeaderLogo } from '@/components/AppLogo';

export default function ProfileScreen() {
  const { colors } = useThemedStyles();
  const { session } = useAuthSession();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [clinics, setClinics] = useState<ClinicRelationshipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProfile(userId), getClinicsForUser(userId)])
      .then(([pRes, cRes]) => {
        if (cancelled) return;
        if (pRes.error) setError(pRes.error.message);
        else setProfile(pRes.data);
        if (!cRes.error && cRes.data) setClinics(cRes.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        section: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
        label: { fontSize: 13, color: colors.mutedText },
        value: { fontSize: 15, color: colors.text, marginBottom: 4 },
        pill: {
          alignSelf: 'flex-start',
          backgroundColor: colors.tagBackground,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          marginTop: 6,
        },
        pillText: { color: colors.text, fontWeight: '600' },
        clinicRow: {
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        clinicName: { fontSize: 15, fontWeight: '600', color: colors.text },
        clinicMeta: { fontSize: 13, color: colors.mutedText },
        empty: { fontSize: 14, color: colors.mutedText, marginTop: 6 },
        err: { color: colors.error, padding: 16, textAlign: 'center' },
        loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
      }),
    [colors]
  );

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <Text style={styles.err}>Inicia sesión para ver tu perfil.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <Text style={styles.err}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil del médico' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View style={styles.section}>
            <Text style={styles.title}>Datos del médico</Text>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{profile?.full_name ?? '—'}</Text>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{profile?.email ?? '—'}</Text>
            <Text style={styles.label}>Rol</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{profile?.role ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Clínicas asociadas</Text>
            {clinics.length === 0 ? (
              <Text style={styles.empty}>Sin clínicas asociadas.</Text>
            ) : (
              clinics.map((rel, idx) => (
                <View
                  key={rel.id}
                  style={[
                    styles.clinicRow,
                    idx === clinics.length - 1 ? { borderBottomWidth: 0 } : null,
                  ]}
                >
                  <Text style={styles.clinicName}>{rel.clinic?.name ?? 'Clínica'}</Text>
                  <Text style={styles.clinicMeta}>
                    {rel.role_in_clinic ?? 'Sin rol'} · {rel.status ?? '—'}
                    {rel.clinic?.address ? ` · ${rel.clinic.address}` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

