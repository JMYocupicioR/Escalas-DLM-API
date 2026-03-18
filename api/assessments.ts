/**
 * Scale assessments API - list by patient and create (save to history).
 * Uses scale_slug when scale_id is not linked to medical_scales.
 */
import { supabase } from './config/supabase';


export interface ScaleAssessmentRow {
  id: string;
  scale_id: string | null; // Can be null for local scales
  scale_slug: string | null; // For local scales identification
  user_id: string;
  patient_id: string | null;
  responses: Record<string, unknown>;
  total_score: number | null;
  subscale_scores: Record<string, any> | null;
  interpretation: string | null;
  clinical_notes: string | null;
  assessor_name: string | null;
  status: string | null;
  assessment_date: string | null;
  created_at: string;
  updated_at: string;
  medical_scales?: {
    name: string;
  } | null;
}

export interface CreateAssessmentInput {
  patient_id: string;
  scale_slug?: string; // For local scales (barthel, katz, etc.)
  scale_id?: string | null; // For database scales, now optional
  responses: Record<string, number | string>;
  total_score?: number | null;
  interpretation?: string | null;
  clinical_notes?: string | null;
  assessor_name?: string | null;
  subscale_scores?: Record<string, any> | null; // Added for subscale scores
}

export async function listAssessmentsByPatient(
  patientId: string
): Promise<{ data: ScaleAssessmentRow[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('scale_assessments')
    .select('*, medical_scales (name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return { data: data as ScaleAssessmentRow[] | null, error: error ? new Error(error.message) : null };
}

export async function createAssessment(
  userId: string,
  input: CreateAssessmentInput
): Promise<{ data: ScaleAssessmentRow | null; error: Error | null }> {
  // Must have either scale_id or scale_slug
  if (!input.scale_id && !input.scale_slug) {
     return { data: null, error: new Error("Either scale_id or scale_slug is required") };
  }

  const { data, error } = await supabase
    .from('scale_assessments')
    .insert({
      user_id: userId,
      patient_id: input.patient_id,
      scale_id: input.scale_id ?? null, // Can be null for local scales
      scale_slug: input.scale_slug ?? null, // For local scales
      responses: input.responses as object,
      total_score: input.total_score ?? null,
      subscale_scores: input.subscale_scores ?? null, // Added subscale_scores
      interpretation: input.interpretation ?? null,
      clinical_notes: input.clinical_notes ?? null,       
      assessor_name: input.assessor_name ?? null,
      assessment_date: new Date().toISOString(),
      status: 'completed'
    })
    .select()
    .single();

  if (error) {
     return { data: null, error: new Error(error.message) };
  }

  return { data: data as any as ScaleAssessmentRow, error: null };
}

export async function getAssessment(
  assessmentId: string
): Promise<{ data: ScaleAssessmentRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('scale_assessments')
    .select('*, medical_scales (name)')
    .eq('id', assessmentId)
    .single();
  return { data: data as ScaleAssessmentRow | null, error: error ? new Error(error.message) : null };
}

