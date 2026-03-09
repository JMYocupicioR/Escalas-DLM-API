/**
 * Patients API - CRUD for patients table in Supabase.
 * RLS: user only sees/creates/updates own patients (created_by = auth.uid()).
 */
import { supabase } from './config/supabase';

export interface PatientRow {
  id: string;
  full_name: string | null; // Changed from name
  age?: number | null;
  birth_date: string | null;
  gender: string | null;
  email: string | null;
  institution_id?: string | null;
  created_by: string; // Added for RLS
  created_at?: string;
  updated_at?: string;
}

export interface CreatePatientInput {
  full_name?: string | null; // Changed from name
  age?: number | null;
  birth_date?: string | null;
  gender?: string | null;
  email?: string | null;
  institution_id?: string | null;
}

export interface UpdatePatientInput {
  full_name?: string | null; // Changed from name
  age?: number | null;
  birth_date?: string | null;
  gender?: string | null;
  email?: string | null;
  institution_id?: string | null;
}

export async function listPatients(): Promise<{ data: PatientRow[] | null; error: Error | null }> {
  console.log('[API] listPatients started');
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('full_name', { ascending: true }); // Changed from name
  
  if (error) {
    console.error('[API] listPatients error:', error);
    return { data: null, error: new Error(error.message) };
  }

  console.log(`[API] listPatients success. Found ${data?.length || 0} patients`);
  return { data: data as PatientRow[] | null, error: null };
}

export async function getPatient(patientId: string): Promise<{ data: PatientRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();
  return { data: data as PatientRow | null, error: error ? new Error(error.message) : null };
}

export async function createPatient(
  userId: string,
  input: CreatePatientInput
): Promise<{ data: PatientRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: input.full_name ?? null, // Changed from name
      age: input.age ?? null,
      birth_date: input.birth_date ?? null,
      gender: input.gender ?? null,
      email: input.email ?? null,
      institution_id: input.institution_id ?? null,
      created_by: userId, // Add created_by for RLS
    })
    .select()
    .single();
  return { data: data as PatientRow | null, error: error ? new Error(error.message) : null };
}

export async function updatePatient(
  patientId: string,
  input: UpdatePatientInput
): Promise<{ data: PatientRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('patients')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId)
    .select()
    .single();
  return { data: data as PatientRow | null, error: error ? new Error(error.message) : null };
}
