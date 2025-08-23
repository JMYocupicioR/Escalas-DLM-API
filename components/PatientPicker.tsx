import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useScalesStore, Patient } from '@/store/scales';

interface Props {
  onSelected?: (patient: Patient) => void;
}

export const PatientPicker: React.FC<Props> = ({ onSelected }) => {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const patientsMap = useScalesStore(s => s.patients);
  const addPatient = useScalesStore(s => s.addPatient);
  const setCurrentPatient = useScalesStore(s => s.setCurrentPatient);
  const [query, setQuery] = useState('');

  const patients = Object.values(patientsMap).sort((a, b) => b.updatedAt - a.updatedAt);
  const filtered = patients.filter(p =>
    (p.name || '').toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = () => {
    const name = query.trim() || 'Paciente Anónimo';
    const now = Date.now();
    const newPatient: Patient = {
      id: '',
      name,
      age: 0,
      gender: 'No especificado',
      createdAt: now,
      updatedAt: now,
    } as Patient;
    addPatient(newPatient);
  };

  const handleSelect = (patient: Patient) => {
    setCurrentPatient(patient.id);
    onSelected?.(patient);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar paciente</Text>
      <View style={[styles.searchBar, { backgroundColor: colors.tagBackground }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Buscar o escribir nombre para crear..."
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.buttonPrimary }]} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Crear</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => handleSelect(item)}>
            <View style={styles.rowContent}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedText }]}>
                {item.age} años · {item.gender}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.mutedText }]}>Sin pacientes. Crea uno nuevo arriba.</Text>}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { gap: 8 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 8, gap: 8 },
  input: { flex: 1, fontSize: 16 },
  createBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  createBtnText: { color: '#fff', fontWeight: '600' },
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  rowContent: {},
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 12 },
});

export default PatientPicker;


