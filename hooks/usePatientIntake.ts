import { useCallback, useMemo, useState } from 'react';
import { useScalesStore, Patient } from '@/store/scales';

export type PatientIntake = Pick<Patient, 'name' | 'age' | 'gender' | 'notes'> & {
  doctorName?: string;
};

const defaultIntake: PatientIntake = {
  name: '',
  age: 0,
  gender: 'No especificado',
  notes: undefined,
  doctorName: '',
};

export function usePatientIntake(scaleId?: string) {
  const {
    addPatient,
    updatePatient,
    getCurrentPatient,
    setCurrentPatient,
    rememberPatientForScale,
    getPatientForScale,
    ensureDefaultPatient,
  } = useScalesStore();

  const [intake, setIntake] = useState<PatientIntake>(defaultIntake);

  const prefillFromRemembered = useCallback(() => {
    const p = (scaleId && getPatientForScale(scaleId)) || getCurrentPatient();
    if (p) {
      setIntake((prev) => ({
        ...prev,
        name: p.name ?? '',
        age: p.age ?? 0,
        gender: p.gender ?? 'No especificado',
        notes: p.notes,
      }));
    }
  }, [getCurrentPatient, getPatientForScale, scaleId]);

  const setField = useCallback(<K extends keyof PatientIntake>(key: K, value: PatientIntake[K]) => {
    setIntake((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveAsCurrentPatient = useCallback(() => {
    // Crear o actualizar paciente y recordarlo
    const now = Date.now();
    const current = getCurrentPatient();
    if (current) {
      updatePatient(current.id, {
        name: intake.name || current.name,
        age: typeof intake.age === 'number' ? intake.age : Number(intake.age) || 0,
        gender: intake.gender || current.gender,
        notes: intake.notes,
        updatedAt: now,
      });
      if (scaleId) rememberPatientForScale(scaleId, current.id);
      return current;
    }
    const newPatient: Patient = {
      id: '',
      name: intake.name || 'Paciente Anónimo',
      age: typeof intake.age === 'number' ? intake.age : Number(intake.age) || 0,
      gender: intake.gender || 'No especificado',
      notes: intake.notes,
      createdAt: now,
      updatedAt: now,
    };
    addPatient(newPatient);
    // Recibir ID real desde el store no es inmediato; recuperamos por nombre/fecha
    const ensured = ensureDefaultPatient();
    setCurrentPatient(ensured.id);
    if (scaleId) rememberPatientForScale(scaleId, ensured.id);
    return ensured;
  }, [addPatient, ensureDefaultPatient, getCurrentPatient, intake.age, intake.gender, intake.name, intake.notes, rememberPatientForScale, scaleId, setCurrentPatient, updatePatient]);

  const ensureAnonymousIfMissing = useCallback(() => {
    const current = getCurrentPatient();
    if (!current) {
      const anon = ensureDefaultPatient();
      setCurrentPatient(anon.id);
      if (scaleId) rememberPatientForScale(scaleId, anon.id);
      return anon;
    }
    return current;
  }, [ensureDefaultPatient, getCurrentPatient, rememberPatientForScale, scaleId, setCurrentPatient]);

  return {
    intake,
    setField,
    prefillFromRemembered,
    saveAsCurrentPatient,
    ensureAnonymousIfMissing,
  };
}


