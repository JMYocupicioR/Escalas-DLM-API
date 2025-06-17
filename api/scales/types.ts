import { Scale } from '@/types/scale';

// Base interfaces for parameters
export interface GetScalesParams {
  category?: string;
  specialty?: string;
  query?: string;
  tags?: string[];
  language?: string;
  limit?: number;
  page?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'draft' | 'deprecated';
}

// Response interfaces
export interface ScalesResponse {
  data: Scale[] | null;
  count: number | null;
  error: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ScaleResponse {
  data: ScaleWithDetails | null;
  error: boolean;
  message?: string;
}

// Extended scale interface with full details
export interface ScaleWithDetails {
  id: string;
  name: string;
  acronym?: string;
  description: string;
  category: string;
  specialty?: string;
  body_system?: string;
  tags?: string[];
  time_to_complete?: string;
  popularity?: number;
  popular?: boolean;
  image_url?: string;
  instructions?: string;
  version?: string;
  language?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  validated_by?: string;
  validation_date?: string;
  cross_references?: string[];
  doi?: string;
  copyright_info?: string;
  license?: string;
  questions: ScaleQuestion[];
  scoring: ScaleScoring | null;
  references: ScaleReference[];
  translations?: ScaleTranslation[];
}

// Database entity interfaces
export interface ScaleQuestion {
  id: string;
  scale_id: string;
  question_id: string;
  question_text: string;
  description?: string;
  question_type: 'single_choice' | 'multiple_choice' | 'numeric' | 'text';
  order_index: number;
  is_required: boolean;
  category?: string;
  instructions?: string;
  options: QuestionOption[];
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_value: number;
  option_label: string;
  option_description?: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
}

export interface ScaleScoring {
  id: string;
  scale_id: string;
  scoring_method: 'sum' | 'average' | 'weighted' | 'complex';
  min_score?: number;
  max_score?: number;
  ranges: ScoringRange[];
  created_at: string;
}

export interface ScoringRange {
  id: string;
  scoring_id: string;
  min_value: number;
  max_value: number;
  interpretation_level: string;
  interpretation_text: string;
  recommendations?: string;
  color_code?: string;
  order_index: number;
  created_at: string;
}

export interface ScaleReference {
  id: string;
  scale_id: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  volume?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  reference_type: 'original' | 'validation' | 'review' | 'meta-analysis';
  is_primary: boolean;
  created_at: string;
}

export interface ScaleTranslation {
  id: string;
  scale_id?: string;
  question_id?: string;
  option_id?: string;
  field_name: string;
  original_text: string;
  translated_text: string;
  language: string;
  translator_id?: string;
  validated_by?: string;
  validation_date?: string;
  created_at: string;
}

// Assessment interfaces
export interface ScaleAssessmentRequest {
  scale_id: string;
  patient_id?: string;
  responses: Record<string, number | string>;
  session_id?: string;
  device_info?: Record<string, any>;
  ip_address?: string;
}

export interface ScaleAssessmentResponse {
  data: ScaleAssessment | null;
  error: boolean;
  message?: string;
}

export interface ScaleAssessment {
  id: string;
  scale_id: string;
  user_id: string;
  patient_id?: string;
  responses: Record<string, any>;
  total_score?: number;
  interpretation?: string;
  completed_at: string;
  session_id?: string;
  device_info?: Record<string, any>;
  ip_address?: string;
}

// Management interfaces (for admins/practitioners)
export interface CreateScaleRequest {
  name: string;
  acronym?: string;
  description: string;
  category: string;
  specialty?: string;
  body_system?: string;
  tags?: string[];
  time_to_complete?: string;
  image_url?: string;
  instructions?: string;
  version?: string;
  language?: string;
  cross_references?: string[];
  doi?: string;
  copyright_info?: string;
  license?: string;
  questions: CreateQuestionRequest[];
  scoring?: CreateScoringRequest;
  references?: CreateReferenceRequest[];
}

export interface CreateQuestionRequest {
  question_id: string;
  question_text: string;
  description?: string;
  question_type?: 'single_choice' | 'multiple_choice' | 'numeric' | 'text';
  order_index: number;
  is_required?: boolean;
  category?: string;
  instructions?: string;
  options: CreateOptionRequest[];
}

export interface CreateOptionRequest {
  option_value: number;
  option_label: string;
  option_description?: string;
  order_index: number;
  is_default?: boolean;
}

export interface CreateScoringRequest {
  scoring_method: 'sum' | 'average' | 'weighted' | 'complex';
  min_score?: number;
  max_score?: number;
  ranges: CreateRangeRequest[];
}

export interface CreateRangeRequest {
  min_value: number;
  max_value: number;
  interpretation_level: string;
  interpretation_text: string;
  recommendations?: string;
  color_code?: string;
  order_index: number;
}

export interface CreateReferenceRequest {
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  volume?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  reference_type?: 'original' | 'validation' | 'review' | 'meta-analysis';
  is_primary?: boolean;
}

export interface UpdateScaleRequest extends Partial<CreateScaleRequest> {
  id: string;
}

// Statistics and analytics
export interface ScaleStatistics {
  scale_name: string;
  total_views: number;
  total_assessments: number;
  unique_users: number;
  popularity_score: number;
  created_at: string;
  last_30_days_metrics: UsageMetric[];
}

export interface UsageMetric {
  id: string;
  scale_id: string;
  date: string;
  views: number;
  assessments_completed: number;
  unique_users: number;
  avg_completion_time?: string;
  created_at: string;
}

// API endpoints for external consumption
export interface APIEndpoints {
  // Public endpoints
  'GET /api/scales': GetScalesParams;
  'GET /api/scales/:id': { id: string; language?: string };
  'GET /api/scales/categories': {};
  'GET /api/scales/specialties': {};
  'GET /api/scales/popular': { limit?: number };
  
  // Authenticated endpoints
  'POST /api/assessments': ScaleAssessmentRequest;
  'GET /api/assessments': { scale_id?: string; patient_id?: string };
  'POST /api/favorites/:scale_id': {};
  'DELETE /api/favorites/:scale_id': {};
  'GET /api/favorites': {};
  
  // Admin endpoints
  'POST /api/scales': CreateScaleRequest;
  'PUT /api/scales/:id': UpdateScaleRequest;
  'DELETE /api/scales/:id': { id: string };
  'GET /api/scales/:id/statistics': { id: string };
}