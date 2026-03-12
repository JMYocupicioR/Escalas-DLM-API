import { supabase } from '../config/supabase';
import {
  GetScalesParams,
  ScalesResponse,
  ScaleWithDetails,
  ScaleResponse,
  ScaleAssessmentRequest,
  ScaleAssessmentResponse,
  ScaleQuestion,
  ScaleScoring
} from './types';
import { Scale } from '@/types/scale';
import { scalesById as localScalesById } from '@/data/_scales';

/**
 * Fetch a list of scales with optional filtering
 */
export async function getScales(params: GetScalesParams = {}): Promise<ScalesResponse> {
  console.log('[API] getScales called with params:', params);
  try {
    let query = supabase
      .from('medical_scales')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('[API] getScales Supabase Error:', error);
        throw error;
    }

    console.log('[API] getScales success. Count:', count, 'Data length:', data?.length);

    // Map to Scale interface
    const scales: Scale[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category || 'General',
      timeToComplete: row.time_to_complete || '5-10 min',
      tags: row.tags || [],
      specialty: row.specialty,
      bodySystem: row.body_system,
      popularity: row.popularity,
      popular: row.popular,
      imageUrl: row.image_url,
      version: row.version,
      instructions: row.instructions,
    }));

    return {
      data: scales,
      count: count,
      error: false
    };
  } catch (error: any) {
    console.error('[API] getScales Execution Error:', error);
    return {
      data: null,
      count: 0,
      error: true,
      message: error.message
    };
  }
}

/**
 * Fetch a single scale by ID with full details (questions, scoring)
 * Retrieves the latest published version.
 * Falls back to local data registry if Supabase doesn't have the scale.
 */
export async function getScaleById(id: string, _language: string = 'es'): Promise<ScaleResponse> {
  try {
    // 1. Fetch Scale Metadata
    const { data: scaleData, error: scaleError } = await supabase
      .from('medical_scales')
      .select('*')
      .eq('id', id)
      .single();

    // If Supabase doesn't have the scale, fall back to local data
    if (scaleError || !scaleData) {
      const localScale = localScalesById[id] as any;
      if (localScale) {
        console.log(`[API] Scale "${id}" not found in Supabase, using local data fallback`);
        // Build a ScaleWithDetails from local scale data
        const now = new Date().toISOString();
        const scaleWithDetails: ScaleWithDetails = {
          id: localScale.id,
          name: localScale.name,
          acronym: localScale.acronym,
          description: localScale.description,
          category: localScale.category || 'General',
          specialty: localScale.specialty,
          body_system: localScale.body_system || localScale.bodySystem,
          tags: localScale.tags || [],
          time_to_complete: localScale.time_to_complete || localScale.timeToComplete,
          image_url: localScale.image_url || localScale.imageUrl,
          created_at: localScale.created_at || now,
          updated_at: localScale.updated_at || now,
          questions: localScale.questions || [],
          scoring: localScale.scoring || null,
          references: localScale.references || [],
          instructions: localScale.instructions,
          version: localScale.version,
          popular: localScale.popular,
          popularity: localScale.popularity,
          language: 'es',
          status: 'active',
        };
        return { data: scaleWithDetails, error: false };
      }

      // Neither Supabase nor local has this scale
      throw scaleError || new Error(`Scale "${id}" not found`);
    }

    // 2. Fetch Latest Published Version
    const { data: versionDataArray, error: versionError } = await supabase
      .from('scale_versions')
      .select('*')
      .eq('scale_id', id)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(1);

    if (versionError && versionError.code !== 'PGRST116') {
        console.warn('Error fetching version:', versionError);
    }
    
    // Extract first item from array (or null if empty)
    const versionData = versionDataArray && versionDataArray.length > 0 ? versionDataArray[0] : null;
    
    let questions: ScaleQuestion[] = [];
    let scoring: ScaleScoring | null = null;

    if (versionData) {
        questions = versionData.questions as ScaleQuestion[];
        scoring = versionData.scoring_logic as unknown as ScaleScoring;
    } else {
        // Fallback: Fetch from scale_questions table directly if no version
        const { data: qData, error: qError } = await supabase
            .from('scale_questions')
            .select(`
                *,
                question_options!question_options_question_id_fkey(*)
            `)
            .eq('scale_id', id)
            .order('order_index');
            
        if (qError) {
             console.warn('Error fetching questions fallback:', qError);
        }

        if (qData) {
            questions = qData.map(q => ({
                ...q,
                options: q.question_options || []
            })) as unknown as ScaleQuestion[];
        }

        // Fallback: Fetch scoring from scale_scoring table
        const { data: sData, error: sError } = await supabase
            .from('scale_scoring')
            .select(`
                *,
                ranges:scoring_ranges(*)
            `)
            .eq('scale_id', id)
            .single();

        if (sError && sError.code !== 'PGRST116') { // Ignore "Row not found"
            console.warn('Error fetching scoring fallback:', sError);
        }

        if (sData) {
            scoring = sData as unknown as ScaleScoring;
        }

        // If Supabase has no questions either, check local data
        if (questions.length === 0) {
          const localScale = localScalesById[id] as any;
          if (localScale?.questions?.length) {
            questions = localScale.questions;
          }
          if (!scoring && localScale?.scoring) {
            scoring = localScale.scoring;
          }
        }
    }

    const scaleWithDetails: ScaleWithDetails = {
      id: scaleData.id,
      name: scaleData.name,
      acronym: scaleData.acronym,
      description: scaleData.description,
      category: scaleData.category || 'General',
      specialty: scaleData.specialty,
      body_system: scaleData.body_system,
      tags: scaleData.tags,
      time_to_complete: scaleData.time_to_complete,
      image_url: scaleData.image_url,
      created_at: scaleData.created_at,
      updated_at: scaleData.updated_at,
      questions: questions,
        scoring: scoring ? {
          id: (scoring as any).id,
          scale_id: (scoring as any).scale_id,
          scoring_method: (scoring as any).scoring_method,
          min_score: (scoring as any).min_score,
          max_score: (scoring as any).max_score,
          ranges: ((scoring as any).ranges || []).map((r: any) => ({
            id: r.id,
            scoring_id: r.scoring_id,
            min: r.min_value,
            max: r.max_value,
            interpretation: r.interpretation_text,
            label: r.interpretation_level,
            recommendations: r.recommendations,
            color: r.color_code,
            order_index: r.order_index,
            created_at: r.created_at,
          })),
          domains: (scoring as any).domains,
          created_at: (scoring as any).created_at,
        } : null,
      references: (versionData?.config as any)?.bibliography?.map((ref: any, index: number) => ({
        id: `ref-${index}`,
        scale_id: id,
        title: ref.title,
        authors: ref.authors,
        journal: ref.journal,
        year: ref.year,
        volume: ref.volume,
        pages: ref.pages,
        doi: ref.doi,
        pmid: ref.pmid,
        url: ref.url,
        reference_type: ref.reference_type,
        is_primary: ref.is_primary,
        created_at: scaleData.created_at
      })) || [],
      instructions: (versionData?.config as any)?.instructions || scaleData.instructions,
      version: versionData?.version_number
    };

    return {
      data: scaleWithDetails,
      error: false
    };

  } catch (error: any) {
     console.error('Error fetching scale details:', error);
    return {
      data: null,
      error: true,
      message: error.message
    };
  }
}

/**
 * Save a completed assessment
 */
export async function createScaleAssessment(request: ScaleAssessmentRequest): Promise<ScaleAssessmentResponse> {
  try {
    // 1. Get current user (REQUIRED)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error('Error saving assessment: User not authenticated', authError);
        return {
            data: null,
            error: true,
            message: 'Usuario no autenticado. No se puede guardar.'
        };
    }

    console.log(`[ScaleService] Saving assessment for user ${user.id} (Scale: ${request.scale_id})`);
    
    // Minimal debug log if needed (commented out or conditional)
    if (__DEV__) {
        // console.log('[ScaleService] Payload summary:', { total: request.total_score, int: request.interpretation });
    }

    const { data, error } = await supabase
      .from('scale_assessments')
      .insert({
        scale_id: request.scale_id,
        patient_id: request.patient_id,
        user_id: user.id, // Explicitly set user_id
        responses: request.responses,
        total_score: request.total_score,
        interpretation: request.interpretation,
        subscale_scores: request.subscale_scores,
        duration_seconds: request.duration_seconds,
        session_id: request.session_id,
        assessor_name: request.assessor_name, // Added this field
        device_info: request.device_info,
        ip_address: request.ip_address
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[ScaleService] Assessment saved successfully. ID: ${data.id}`);

    // Log to Audit Table (Best Effort) - Enhanced with full context
    try {
        console.log('[ScaleService] Creating audit log entry...');
        const auditPayload = {
            user_id: user.id,
            action: 'CREATE',
            entity_type: 'scale_assessment',
            entity_id: data.id,
            new_values: {
                scale_id: request.scale_id,
                patient_id: request.patient_id,
                total_score: request.total_score,
                interpretation: request.interpretation,
                subscale_scores: request.subscale_scores,
                duration_seconds: request.duration_seconds,
                session_id: request.session_id
            },
            ip_address: request.ip_address,
            user_agent: request.device_info?.userAgent || 'Unknown'
        };
        
        const { error: auditError } = await supabase.from('audit_logs').insert(auditPayload);
        
        if (auditError) {
            console.error('[ScaleService] Audit log insert failed:', auditError);
            console.error('[ScaleService] Audit payload was:', JSON.stringify(auditPayload, null, 2));
        } else {
            console.log('[ScaleService] Audit log created successfully');
        }
    } catch (auditError: any) {
        console.error('[ScaleService] Failed to create audit log (exception):', auditError.message);
        console.error('[ScaleService] Full audit error:', JSON.stringify(auditError, null, 2));
        // Do not fail the main request if audit fails
    }

    return {
      data: data as any,
      error: false
    };
  } catch (error: any) {
    console.error('[ScaleService] Error saving assessment:', error.message);
    if (__DEV__) {
         console.error('[ScaleService] Full error details:', JSON.stringify(error, null, 2));
    }
    
    let errorMessage = error.message || 'Error desconocido al guardar';
    if (error.code === '23502') { // NOT NULL violation
        errorMessage = 'Faltan datos obligatorios para guardar (posiblemente usuario o paciente).';
    }

    return {
      data: null,
      error: true,
      message: errorMessage
    };
  }
}
