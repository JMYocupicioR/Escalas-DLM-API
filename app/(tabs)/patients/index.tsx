import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { listPatients, type PatientRow } from '@/api/patients';
import { HeaderLogo } from '@/components/AppLogo';
import { UserPlus, ChevronRight, UserCircle } from 'lucide-react-native';
import { getProfile, type ProfileRow } from '@/api/profile';

export default function PatientsScreen() {
  const { colors } = useThemedStyles();
  const { session } = useAuthSession();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const router = useRouter();
  
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    console.log('[PatientsScreen] Mounting and fetching patients...');
    
    listPatients().then(({ data, error: err }) => {
      if (cancelled) return;
      setLoading(false);
      if (err) {
        console.error('[PatientsScreen] Error fetching patients:', err);
        setError(err.message);
        setPatients([]);
      } else {
        console.log(`[PatientsScreen] Successfully loaded ${data?.length ?? 0} patients`);
        setError(null);
        setPatients(data ?? []);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    getProfile(userId).then(({ data }) => {
      if (!cancelled) setProfile(data ?? null);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.trim().toLowerCase();
    return patients.filter((p) => (p.full_name ?? '').toLowerCase().includes(q));
  }, [patients, search]);

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
        doctorCard: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        doctorName: { fontSize: 16, fontWeight: '700', color: colors.text },
        doctorMeta: { fontSize: 13, color: colors.mutedText },
        profileBtn: {
          alignSelf: 'flex-start',
          marginTop: 8,
          backgroundColor: colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
        },
        profileBtnText: { color: '#fff', fontWeight: '600' },
        searchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
        },
        searchInput: {
          flex: 1,
          backgroundColor: colors.inputBackground ?? colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.text,
        },
        addBtn: {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
        list: { flex: 1, paddingHorizontal: 16 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginTop: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        rowLeft: { flex: 1 },
        name: { fontSize: 17, fontWeight: '600', color: colors.text },
        meta: { fontSize: 14, color: colors.mutedText, marginTop: 4 },
        empty: { padding: 24, alignItems: 'center' },
        emptyText: { fontSize: 16, color: colors.mutedText },
        loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        errText: { color: colors.error, padding: 16, textAlign: 'center' },
      }),
    [colors]
  );

  const handleNewPatient = () => {
    router.push('/patients/new');
  };

  const handlePatientPress = (id: string) => {
    router.push(`/patients/${id}`);
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Inicia sesión para ver pacientes.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pacientes' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
          {profile && (
            <View style={[styles.doctorCard, { marginTop: 8 }]}>
              <View style={styles.doctorRow}>
                <UserCircle size={28} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{profile.full_name ?? 'Médico sin nombre'}</Text>
                  <Text style={styles.doctorMeta}>
                    {profile.email ?? 'Sin correo'}{profile.role ? ` · ${profile.role}` : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/patients/profile')}>
                <Text style={styles.profileBtnText}>Ver perfil</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.searchRow, { marginTop: profile ? 12 : 16 }]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o NHC..."
              placeholderTextColor={colors.mutedText}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleNewPatient}>
              <UserPlus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errText}>{error}</Text>
        ) : (
          <FlatList
            style={styles.list}
            data={filtered}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {patients.length === 0
                    ? 'No hay pacientes. Pulsa Nuevo para agregar uno.'
                    : 'No hay resultados para la búsqueda.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handlePatientPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.name}>{item.full_name || 'Sin nombre'}</Text>
                  <Text style={styles.meta}>
                    {(item.gender ?? 'No especificado')}
                    {item.birth_date ? ` · Nacido: ${item.birth_date}` : ''}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.mutedText} />
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
}
