/**
 * API for user profile and clinics.
 */
import { supabase } from './config/supabase';

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  clinic_id: string | null;
  additional_info: Record<string, any> | null;
  google_calendar_config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicRow {
  id: string;
  name: string | null;
  address: string | null;
  type: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicRelationshipRow {
  id: string;
  clinic_id: string;
  user_id: string;
  role_in_clinic: string | null;
  status: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  clinic?: ClinicRow;
}

export async function getProfile(userId: string): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as ProfileRow | null, error: error ? new Error(error.message) : null };
}

export async function getClinicsForUser(
  userId: string
): Promise<{ data: ClinicRelationshipRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('clinic_user_relationships')
    .select('*, clinic:clinics(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as ClinicRelationshipRow[] | null, error: error ? new Error(error.message) : null };
}

