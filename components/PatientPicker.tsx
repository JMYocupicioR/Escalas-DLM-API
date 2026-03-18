import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { listPatients, createPatient, type PatientRow } from '@/api/patients';

export interface PickedPatient {
  id: string;
  full_name?: string | null;
  age?: number | null;
  gender?: string | null;
  notes?: string | null;
  birth_date?: string | null;
}

interface Props {
  onSelected?: (patient: PickedPatient) => void;
}

export const PatientPicker: React.FC<Props> = ({ onSelected }) => {
  const { colors } = useThemedStyles();
  useAuthSession();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PatientPicker] Mounting and fetching patients...');
    setLoading(true);
    setError(null);
    listPatients()
      .then(({ data, error: err }) => {
        if (err) {
          console.error('[PatientPicker] Fetch failed:', err);
          setError(err.message);
        } else {
          console.log(`[PatientPicker] Loaded ${data?.length ?? 0} patients`);
          setPatients(data ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.trim().toLowerCase();
    return patients.filter((p) => (p.full_name ?? '').toLowerCase().includes(q));
  }, [patients, query]);

  const displayName = (p: PatientRow) =>
    (p.full_name && p.full_name.trim()) || 'Paciente sin nombre';

  const displayMeta = (p: PatientRow) => {
    const gender = (p.gender && p.gender.trim()) || 'No especificado';
    const birth = p.birth_date ? `· Nacido: ${p.birth_date}` : '';
    return `${gender} ${birth}`.trim();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: 8 },
        title: { fontSize: 16, fontWeight: '600', color: colors.text },
        searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 8, gap: 8, backgroundColor: colors.tagBackground },
        input: { flex: 1, fontSize: 16, color: colors.text },
        createBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: colors.buttonPrimary },
        createBtnText: { color: '#fff', fontWeight: '600' },
        createBtnDisabled: { opacity: 0.6 },
        row: {
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        rowContent: { gap: 2 },
        name: { fontSize: 16, fontWeight: '600', color: colors.text },
        meta: { fontSize: 13, color: colors.mutedText },
        empty: { textAlign: 'center', marginTop: 12, color: colors.mutedText },
        loading: { paddingVertical: 16, alignItems: 'center' },
        err: { color: colors.error, fontSize: 13, marginTop: 4, textAlign: 'center' },
      }),
    [colors]
  );

  const handleCreate = async () => {
    const name = query.trim() || 'Paciente Anónimo';
    setCreating(true);
    setError(null);
    const { data, error: err } = await createPatient('', { full_name: name });
    setCreating(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      setPatients((prev) => [data, ...prev]);
      onSelected?.({
        id: data.id,
        full_name: data.full_name,
        gender: data.gender,
        birth_date: data.birth_date,
      });
    }
  };

  const handleSelect = (patient: PatientRow) => {
    onSelected?.({
      id: patient.id,
      full_name: patient.full_name,
      gender: patient.gender,
      birth_date: patient.birth_date,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar paciente</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Buscar o escribir nombre para crear..."
          placeholderTextColor={colors.mutedText}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={[styles.createBtn, creating && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          <Text style={styles.createBtnText}>{creating ? '…' : 'Crear'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <View style={styles.rowContent}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName(item)}
                </Text>

                <Text style={styles.meta} numberOfLines={1}>
                  {displayMeta(item)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {patients.length === 0
                ? 'No hay pacientes en la base de datos. Usa "Crear" para agregar uno.'
                : 'No hay resultados para la búsqueda.'}
            </Text>
          }
          style={{ marginTop: 8, maxHeight: 220 }}
        />
      )}
    </View>
  );
};

export default PatientPicker;
