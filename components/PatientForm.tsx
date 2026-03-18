import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePatientIntake } from '@/hooks/usePatientIntake';
import { PatientPicker } from '@/components/PatientPicker';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getProfile } from '@/api/profile';

export interface PatientFormData {
  id?: string;
  name: string;
  age: number;
  gender: string;
  doctorName: string;
  notes: string;
}

interface PatientFormProps {
  scaleId?: string;
  onContinue: (data?: PatientFormData) => void;
  allowSkip?: boolean;
  onPatientSelected?: (patient: { id: string; name?: string | null; gender?: string | null; birth_date?: string | null }) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ scaleId, onContinue, allowSkip = true, onPatientSelected }) => {
  const { colors } = useThemedStyles();
  const { intake, setField, prefillFromRemembered, saveAsCurrentPatient, ensureAnonymousIfMissing } = usePatientIntake(scaleId);
  const [showPicker, setShowPicker] = useState(false);
  const { session } = useAuthSession();

  useEffect(() => {
    prefillFromRemembered();
  }, [prefillFromRemembered]);

  // Prefill doctor/evaluator with current user's full name (profile) once
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || intake.doctorName) return;
    getProfile(userId).then(({ data }) => {
      if (data?.full_name) {
        setField('doctorName', data.full_name);
      }
    }).catch(() => {});
  }, [session?.user?.id, intake.doctorName, setField]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]} testID="patientFormTitle">Datos del Paciente</Text>

      <TouchableOpacity onPress={() => setShowPicker(v => !v)} style={[styles.toggle, { backgroundColor: colors.tagBackground }]}> 
        <Text style={[styles.toggleText, { color: colors.text }]}>{showPicker ? 'Ocultar lista de pacientes' : 'Seleccionar paciente existente'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <PatientPicker
            onSelected={(patient) => {
              setField('name', patient.name ?? '');
              if (patient.birth_date) {
                const age = Math.max(
                  0,
                  Math.floor(
                    (Date.now() - new Date(patient.birth_date).getTime()) /
                      (1000 * 60 * 60 * 24 * 365.25)
                  )
                );
                setField('age', age);
              } else {
                setField('age', patient.age ?? 0);
              }
              setField('gender', patient.gender ?? 'No especificado');
              setField('notes', patient.notes ?? '');
              if (patient.id) setField('id', patient.id);
              if (patient.id) {
                onPatientSelected?.({
                  id: patient.id,
                  name: patient.name,
                  gender: patient.gender,
                  birth_date: patient.birth_date,
                });
              }
              setShowPicker(false);
            }}
          />
        </View>
      )}

      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Nombre"
          value={intake.name}
          onChangeText={(v) => setField('name', v)}
        />
      </View>
      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Edad"
          keyboardType="numeric"
          value={String(intake.age ?? '')}
          onChangeText={(v) => setField('age', Number(v) || 0)}
        />
      </View>
      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Género"
          value={intake.gender}
          onChangeText={(v) => setField('gender', v)}
        />
      </View>
      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Médico/Evaluador"
          value={intake.doctorName ?? ''}
          onChangeText={(v) => setField('doctorName', v)}
        />
      </View>
      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Notas"
          value={intake.notes ?? ''}
          onChangeText={(v) => setField('notes', v)}
        />
      </View>

      <View style={styles.actions}>
        {allowSkip && (
          <TouchableOpacity
            onPress={() => {
              ensureAnonymousIfMissing();
              onContinue();
            }}
            style={[styles.button, { backgroundColor: colors.buttonSecondary }]}
          >
            <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Omitir</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            console.log('PatientForm Continuar clicked, intake:', intake);
            saveAsCurrentPatient();
            const formData = {
              id: intake.id,
              name: intake.name ?? '',
              age: typeof intake.age === 'number' ? intake.age : Number(intake.age) || 0,
              gender: intake.gender ?? '',
              doctorName: intake.doctorName ?? '',
              notes: intake.notes ?? '',
            };
            console.log('PatientForm sending formData:', formData);
            onContinue(formData);
          }}
          style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputGroup: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


