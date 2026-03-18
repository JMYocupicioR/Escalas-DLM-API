import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { listPatients, type PatientRow } from '@/api/patients';
import { HeaderLogo } from '@/components/AppLogo';
import { UserPlus, ChevronRight } from 'lucide-react-native';

export default function PickPatientForScaleScreen() {
  const { scaleId } = useLocalSearchParams<{ scaleId: string }>();
  const { colors } = useThemedStyles();
  const { session } = useAuthSession();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    listPatients(userId).then(({ data }) => {
      setPatients(data ?? []);
      setLoading(false);
    });
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
        list: { flex: 1, padding: 16 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        name: { fontSize: 17, fontWeight: '600', color: colors.text },
        meta: { fontSize: 14, color: colors.mutedText, marginTop: 4 },
        newBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
        },
        newBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
        empty: { padding: 24, alignItems: 'center' },
        emptyText: { fontSize: 16, color: colors.mutedText },
      }),
    [colors]
  );

  const handleSelect = (patientId: string) => {
    if (scaleId) router.replace(`/scales/${scaleId}?patientId=${patientId}`);
    else router.back();
  };

  const handleNewPatient = () => {
    if (scaleId) router.push(`/patients/new?returnScaleId=${scaleId}`);
    else router.push('/patients/new');
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><HeaderLogo size="small" /></View>
        <Text style={styles.emptyText}>Inicia sesión para seleccionar un paciente.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Seleccionar paciente' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <View style={styles.list}>
          <TouchableOpacity style={styles.newBtn} onPress={handleNewPatient}>
            <UserPlus size={22} color="#fff" />
            <Text style={styles.newBtnText}>Crear paciente nuevo</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={patients}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No hay pacientes. Crea uno nuevo arriba.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.row} onPress={() => handleSelect(item.id)} activeOpacity={0.7}>
                  <View>
                    <Text style={styles.name}>{item.name ?? 'Sin nombre'}</Text>
                    <Text style={styles.meta}>
                      {item.age != null ? `${item.age} años` : ''}
                      {item.institution_id ? ` · ${item.institution_id}` : ''}
                    </Text>
                  </View>
                  <ChevronRight size={22} color={colors.mutedText} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
