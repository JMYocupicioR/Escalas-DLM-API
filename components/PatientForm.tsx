import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePatientIntake } from '@/hooks/usePatientIntake';
import { PatientPicker } from '@/components/PatientPicker';

interface PatientFormProps {
  scaleId?: string;
  onContinue: () => void;
  allowSkip?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ scaleId, onContinue, allowSkip = true }) => {
  const { colors } = useThemedStyles();
  const { intake, setField, prefillFromRemembered, saveAsCurrentPatient, ensureAnonymousIfMissing } = usePatientIntake(scaleId);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    prefillFromRemembered();
  }, [prefillFromRemembered]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]} testID="patientFormTitle">Datos del Paciente</Text>

      <TouchableOpacity onPress={() => setShowPicker(v => !v)} style={[styles.toggle, { backgroundColor: colors.tagBackground }]}> 
        <Text style={[styles.toggleText, { color: colors.text }]}>{showPicker ? 'Ocultar lista de pacientes' : 'Seleccionar paciente existente'}</Text>
      </TouchableOpacity>
      {showPicker && (
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <PatientPicker onSelected={() => setShowPicker(false)} />
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
          value={intake.doctorName}
          onChangeText={(v) => setField('doctorName', v)}
        />
      </View>
      <View style={[styles.inputGroup, { backgroundColor: colors.tagBackground }]}> 
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Notas"
          value={intake.notes}
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
            saveAsCurrentPatient();
            onContinue();
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


