import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { createPatient } from '@/api/patients';
import { HeaderLogo } from '@/components/AppLogo';

export default function NewPatientScreen() {
  const { returnScaleId } = useLocalSearchParams<{ returnScaleId?: string }>();
  const { colors } = useThemedStyles();
  const { session } = useAuthSession();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id ?? null;

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
        scroll: { flex: 1 },
        inner: { padding: 16 },
        label: { fontSize: 14, fontWeight: '600', color: colors.mutedText, marginBottom: 6 },
        input: {
          backgroundColor: colors.inputBackground ?? colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.text,
          marginBottom: 16,
        },
        btn: {
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 8,
        },
        btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
        err: { color: colors.error, marginBottom: 12, textAlign: 'center' },
      }),
    [colors]
  );

  const handleSave = async () => {
    if (!userId) return;
    setError(null);
    setSaving(true);
    const { data, error: err } = await createPatient(userId, {
      name: name.trim() || null,
      age: age.trim() ? parseInt(age, 10) : null,
      gender: gender.trim() || null,
      institution_id: institutionId.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.id) {
      if (returnScaleId) router.replace(`/scales/${returnScaleId}?patientId=${data.id}`);
      else router.replace(`/patients/${data.id}`);
    }
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><HeaderLogo size="small" /></View>
        <Text style={styles.err}>Inicia sesión para crear pacientes.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo paciente' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <HeaderLogo size="small" />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del paciente"
            placeholderTextColor={colors.mutedText}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>Edad</Text>
          <TextInput
            style={styles.input}
            placeholder="Edad"
            placeholderTextColor={colors.mutedText}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <Text style={styles.label}>Género</Text>
          <TextInput
            style={styles.input}
            placeholder="Género"
            placeholderTextColor={colors.mutedText}
            value={gender}
            onChangeText={setGender}
          />
          <Text style={styles.label}>Clínica / Institución</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la clínica o institución"
            placeholderTextColor={colors.mutedText}
            value={institutionId}
            onChangeText={setInstitutionId}
          />
          <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={saving}>
            <Text style={styles.btnText}>{saving ? 'Guardando…' : 'Crear paciente'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
