/**
 * @file api/scales/index.ts
 * @description Comprehensive API for medical scales repository
 * Provides robust endpoints for searching, fetching, and managing medical scales
 */

import { supabase, handleApiError, withRetry } from '../config/supabase';
import { 
  GetScalesParams, 
  ScalesResponse, 
  ScaleResponse,
  ScaleWithDetails,
  CreateScaleRequest,
  UpdateScaleRequest,
  ScaleAssessmentRequest,
  ScaleAssessmentResponse,
  ScaleStatistics
} from './types';
import { logSecurityEvent } from '../config/supabase';

/**
 * Search and filter medical scales with advanced options
 * @param params Search and filter parameters
 * @returns Promise resolving to scales response
 */
export const getScales = async (params?: GetScalesParams): Promise<ScalesResponse> => {
  try {
    const {
      category,
      specialty,
      query,
      tags,
      language = 'es',
      limit = 20,
      page = 1,
      sortBy = 'popularity',
      sortOrder = 'desc',
      status = 'active'
    } = params || {};

    let supabaseQuery = supabase
      .from('medical_scales')
      .select(`
        id,
        name,
        acronym,
        description,
        category,
        specialty,
        body_system,
        tags,
        time_to_complete,
        popularity,
        popular,
        image_url,
        instructions,
        version,
        language,
        status,
        created_at,
        updated_at,
        cross_references,
        doi,
        license
      `)
      .eq('status', status);

    // Apply filters
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    if (specialty) {
      supabaseQuery = supabaseQuery.eq('specialty', specialty);
    }

    if (language) {
      supabaseQuery = supabaseQuery.eq('language', language);
    }

    if (tags && tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', tags);
    }

    // Text search using PostgreSQL full-text search
    if (query) {
      const searchResult = await withRetry(async () => {
        return await supabase.rpc('search_scales', {
          search_term: query,
          lang: language === 'es' ? 'spanish' : 'english'
        });
      });

      if (searchResult.error) {
        return handleApiError(searchResult.error, 'Error searching scales');
      }

      const scaleIds = searchResult.data?.map(s => s.id) || [];
      if (scaleIds.length === 0) {
        return {
          data: [],
          count: 0,
          error: false,
          pagination: {
            page,
            limit,
            totalPages: 0,
            totalItems: 0
          }
        };
      }

      supabaseQuery = supabaseQuery.in('id', scaleIds);
    }

    // Count total results
    const countQuery = supabaseQuery;
    const { count } = await countQuery;

    // Apply sorting
    const sortField = sortBy === 'name' ? 'name' : 
                     sortBy === 'created_at' ? 'created_at' : 
                     sortBy === 'updated_at' ? 'updated_at' :
                     'popularity';
    
    supabaseQuery = supabaseQuery.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const result = await withRetry(async () => {
      return await supabaseQuery;
    });

    if (result.error) {
      return handleApiError(result.error, 'Error fetching scales');
    }

    // Log successful search for analytics
    if (query) {
      await logSecurityEvent('data_access', {
        action: 'search_scales',
        query: query.substring(0, 100), // Limit query length for privacy
        results_count: result.data?.length || 0
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: result.data || [],
      count: count || 0,
      error: false,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: count || 0
      }
    };

  } catch (error) {
    console.error('Unexpected error in getScales:', error);
    return handleApiError(error, 'Unexpected error occurred while fetching scales');
  }
};

/**
 * Get a complete scale with all details including questions, options, and scoring
 * @param id Scale ID
 * @param language Optional language for translations
 * @returns Promise resolving to detailed scale response
 */
export const getScaleById = async (id: string, language = 'es'): Promise<ScaleResponse> => {
  try {
    // Get scale basic info
    const scaleResult = await withRetry(async () => {
      return await supabase
        .from('medical_scales')
        .select('*')
        .eq('id', id)
        .single();
    });

    if (scaleResult.error) {
      return handleApiError(scaleResult.error, 'Scale not found');
    }

    // Get questions with options
    const questionsResult = await withRetry(async () => {
      return await supabase
        .from('scale_questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('scale_id', id)
        .order('order_index');
    });

    if (questionsResult.error) {
      return handleApiError(questionsResult.error, 'Error fetching scale questions');
    }

    // Get scoring information
    const scoringResult = await withRetry(async () => {
      return await supabase
        .from('scale_scoring')
        .select(`
          *,
          scoring_ranges (*)
        `)
        .eq('scale_id', id);
    });

    // Get references
    const referencesResult = await withRetry(async () => {
      return await supabase
        .from('scale_references')
        .select('*')
        .eq('scale_id', id)
        .order('is_primary', { ascending: false });
    });

    // Get translations if language is not default
    let translations = null;
    if (language !== 'es') {
      const translationsResult = await withRetry(async () => {
        return await supabase
          .from('scale_translations')
          .select('*')
          .eq('scale_id', id)
          .eq('language', language);
      });

      translations = translationsResult.data || [];
    }

    // Construct complete scale object
    const scale: ScaleWithDetails = {
      ...scaleResult.data,
      questions: questionsResult.data?.map(q => ({
        ...q,
        options: q.question_options?.sort((a, b) => a.order_index - b.order_index) || []
      })).sort((a, b) => a.order_index - b.order_index) || [],
      scoring: scoringResult.data?.[0] ? {
        ...scoringResult.data[0],
        ranges: scoringResult.data[0].scoring_ranges?.sort((a, b) => a.order_index - b.order_index) || []
      } : null,
      references: referencesResult.data || [],
      translations: translations || []
    };

    // Update view metrics
    await updateScaleMetrics(id, 'view');

    // Log access for audit
    await logSecurityEvent('data_access', {
      action: 'get_scale_details',
      scale_id: id,
      scale_name: scale.name
    });

    return {
      data: scale,
      error: false
    };

  } catch (error) {
    console.error('Unexpected error in getScaleById:', error);
    return handleApiError(error, 'Unexpected error occurred while fetching scale details');
  }
};

/**
 * Get scale categories with counts
 * @returns Promise resolving to categories with scale counts
 */
export const getScaleCategories = async (): Promise<{ data: Array<{ category: string; count: number }> | null; error: boolean; message?: string }> => {
  try {
    const result = await withRetry(async () => {
      return await supabase
        .from('medical_scales')
        .select('category')
        .eq('status', 'active');
    });

    if (result.error) {
      return handleApiError(result.error, 'Error fetching categories');
    }

    // Count categories
    const categoryCounts = (result.data || []).reduce((acc, scale) => {
      acc[scale.category] = (acc[scale.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      data: categories,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Unexpected error occurred while fetching categories');
  }
};

/**
 * Get scale specialties with counts
 * @returns Promise resolving to specialties with scale counts
 */
export const getScaleSpecialties = async (): Promise<{ data: Array<{ specialty: string; count: number }> | null; error: boolean; message?: string }> => {
  try {
    const result = await withRetry(async () => {
      return await supabase
        .from('medical_scales')
        .select('specialty')
        .eq('status', 'active')
        .not('specialty', 'is', null);
    });

    if (result.error) {
      return handleApiError(result.error, 'Error fetching specialties');
    }

    // Count specialties
    const specialtyCounts = (result.data || []).reduce((acc, scale) => {
      if (scale.specialty) {
        acc[scale.specialty] = (acc[scale.specialty] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const specialties = Object.entries(specialtyCounts)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count);

    return {
      data: specialties,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Unexpected error occurred while fetching specialties');
  }
};

/**
 * Get popular/trending scales
 * @param limit Number of scales to return
 * @returns Promise resolving to popular scales
 */
export const getPopularScales = async (limit = 10): Promise<ScalesResponse> => {
  try {
    const result = await withRetry(async () => {
      return await supabase
        .from('medical_scales')
        .select(`
          id,
          name,
          acronym,
          description,
          category,
          specialty,
          tags,
          popularity,
          popular,
          image_url
        `)
        .eq('status', 'active')
        .order('popularity', { ascending: false })
        .limit(limit);
    });

    if (result.error) {
      return handleApiError(result.error, 'Error fetching popular scales');
    }

    return {
      data: result.data || [],
      count: result.data?.length || 0,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Unexpected error occurred while fetching popular scales');
  }
};

/**
 * Create a new scale assessment/evaluation
 * @param assessment Assessment data
 * @returns Promise resolving to assessment response
 */
export const createScaleAssessment = async (assessment: ScaleAssessmentRequest): Promise<ScaleAssessmentResponse> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return handleApiError(new Error('Authentication required'), 'Authentication required for assessments');
    }

    // Calculate total score based on responses
    const totalScore = Object.values(assessment.responses).reduce((sum, value) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    // Get scale details for interpretation
    const scaleResult = await getScaleById(assessment.scale_id);
    if (scaleResult.error || !scaleResult.data) {
      return handleApiError(new Error('Scale not found'), 'Cannot assess unknown scale');
    }

    // Determine interpretation based on scoring ranges
    let interpretation = '';
    if (scaleResult.data.scoring?.ranges) {
      const range = scaleResult.data.scoring.ranges.find(r => 
        totalScore >= r.min_value && totalScore <= r.max_value
      );
      interpretation = range?.interpretation_text || '';
    }

    const assessmentData = {
      scale_id: assessment.scale_id,
      user_id: user.user.id,
      patient_id: assessment.patient_id,
      responses: assessment.responses,
      total_score: totalScore,
      interpretation,
      session_id: assessment.session_id,
      device_info: assessment.device_info,
      ip_address: assessment.ip_address
    };

    const result = await withRetry(async () => {
      return await supabase
        .from('scale_assessments')
        .insert(assessmentData)
        .select()
        .single();
    });

    if (result.error) {
      return handleApiError(result.error, 'Error creating assessment');
    }

    // Update scale metrics
    await updateScaleMetrics(assessment.scale_id, 'assessment');

    // Log assessment creation
    await logSecurityEvent('data_modification', {
      action: 'create_assessment',
      scale_id: assessment.scale_id,
      assessment_id: result.data.id
    });

    return {
      data: result.data,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Unexpected error occurred while creating assessment');
  }
};

/**
 * Get scale statistics and analytics
 * @param scale_id Scale ID
 * @returns Promise resolving to scale statistics
 */
export const getScaleStatistics = async (scale_id: string): Promise<{ data: ScaleStatistics | null; error: boolean; message?: string }> => {
  try {
    // Get basic scale info
    const scaleResult = await supabase
      .from('medical_scales')
      .select('name, created_at, popularity')
      .eq('id', scale_id)
      .single();

    if (scaleResult.error) {
      return handleApiError(scaleResult.error, 'Scale not found');
    }

    // Get usage metrics for last 30 days
    const metricsResult = await supabase
      .from('scale_usage_metrics')
      .select('*')
      .eq('scale_id', scale_id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get total assessments count
    const assessmentsResult = await supabase
      .from('scale_assessments')
      .select('id', { count: 'exact' })
      .eq('scale_id', scale_id);

    const statistics: ScaleStatistics = {
      scale_name: scaleResult.data.name,
      total_views: metricsResult.data?.reduce((sum, m) => sum + (m.views || 0), 0) || 0,
      total_assessments: assessmentsResult.count || 0,
      unique_users: metricsResult.data?.reduce((sum, m) => sum + (m.unique_users || 0), 0) || 0,
      popularity_score: scaleResult.data.popularity || 0,
      created_at: scaleResult.data.created_at,
      last_30_days_metrics: metricsResult.data || []
    };

    return {
      data: statistics,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Error fetching scale statistics');
  }
};

/**
 * Update scale usage metrics
 * @param scale_id Scale ID
 * @param action Type of action (view, assessment)
 */
async function updateScaleMetrics(scale_id: string, action: 'view' | 'assessment') {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('scale_usage_metrics')
      .select('*')
      .eq('scale_id', scale_id)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing record
      const updates: any = {};
      if (action === 'view') {
        updates.views = (existing.views || 0) + 1;
      } else if (action === 'assessment') {
        updates.assessments_completed = (existing.assessments_completed || 0) + 1;
      }

      await supabase
        .from('scale_usage_metrics')
        .update(updates)
        .eq('id', existing.id);
    } else {
      // Create new record
      const newRecord: any = {
        scale_id,
        date: today,
        views: action === 'view' ? 1 : 0,
        assessments_completed: action === 'assessment' ? 1 : 0,
        unique_users: 1
      };

      await supabase
        .from('scale_usage_metrics')
        .insert(newRecord);
    }

    // Update popularity score in main table
    if (action === 'assessment') {
      await supabase.rpc('increment_scale_popularity', { scale_id });
    }

  } catch (error) {
    console.error('Error updating scale metrics:', error);
    // Don't throw error as this is not critical for the main operation
  }
}

/**
 * Add scale to user favorites
 * @param scale_id Scale ID
 * @returns Promise resolving to success/error
 */
export const addToFavorites = async (scale_id: string): Promise<{ error: boolean; message?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return handleApiError(new Error('Authentication required'), 'Authentication required for favorites');
    }

    const result = await withRetry(async () => {
      return await supabase
        .from('user_scale_favorites')
        .insert({
          user_id: user.user.id,
          scale_id
        });
    });

    if (result.error) {
      if (result.error.code === '23505') { // Unique constraint violation
        return { error: false, message: 'Scale already in favorites' };
      }
      return handleApiError(result.error, 'Error adding to favorites');
    }

    return { error: false };

  } catch (error) {
    return handleApiError(error, 'Unexpected error adding to favorites');
  }
};

/**
 * Remove scale from user favorites
 * @param scale_id Scale ID
 * @returns Promise resolving to success/error
 */
export const removeFromFavorites = async (scale_id: string): Promise<{ error: boolean; message?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return handleApiError(new Error('Authentication required'), 'Authentication required for favorites');
    }

    const result = await withRetry(async () => {
      return await supabase
        .from('user_scale_favorites')
        .delete()
        .eq('user_id', user.user.id)
        .eq('scale_id', scale_id);
    });

    if (result.error) {
      return handleApiError(result.error, 'Error removing from favorites');
    }

    return { error: false };

  } catch (error) {
    return handleApiError(error, 'Unexpected error removing from favorites');
  }
};

/**
 * Get user's favorite scales
 * @returns Promise resolving to favorite scales
 */
export const getUserFavorites = async (): Promise<ScalesResponse> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return handleApiError(new Error('Authentication required'), 'Authentication required for favorites');
    }

    const result = await withRetry(async () => {
      return await supabase
        .from('user_scale_favorites')
        .select(`
          created_at,
          medical_scales (
            id,
            name,
            acronym,
            description,
            category,
            specialty,
            tags,
            popularity,
            popular,
            image_url
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
    });

    if (result.error) {
      return handleApiError(result.error, 'Error fetching favorites');
    }

    const scales = result.data?.map(f => f.medical_scales).filter(Boolean) || [];

    return {
      data: scales,
      count: scales.length,
      error: false
    };

  } catch (error) {
    return handleApiError(error, 'Unexpected error fetching favorites');
  }
};