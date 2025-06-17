/**
 * @file api/index.ts
 * @description Main API entry point for the Medical Scales Repository
 * Provides a comprehensive REST API for medical scales management
 * 
 * @version 2.0.0
 * @author DeepLuxMed Team
 * @license CC BY-NC 4.0
 */

import { 
  getScales, 
  getScaleById, 
  getScaleCategories, 
  getScaleSpecialties, 
  getPopularScales,
  createScaleAssessment,
  getScaleStatistics,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
} from './scales';

import { 
  GetScalesParams, 
  ScalesResponse, 
  ScaleResponse, 
  ScaleAssessmentRequest,
  ScaleAssessmentResponse 
} from './scales/types';

// Export all scale-related functions and types
export {
  // Scale Management Functions
  getScales,
  getScaleById,
  getScaleCategories,
  getScaleSpecialties,
  getPopularScales,
  
  // Assessment Functions
  createScaleAssessment,
  getScaleStatistics,
  
  // User Interaction Functions
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  
  // Type Definitions
  GetScalesParams,
  ScalesResponse,
  ScaleResponse,
  ScaleAssessmentRequest,
  ScaleAssessmentResponse
};

/**
 * Medical Scales Repository API
 * 
 * This API provides comprehensive access to a repository of medical assessment scales.
 * It supports searching, filtering, detailed retrieval, assessment creation, and analytics.
 * 
 * ## Features:
 * 
 * ### 🔍 Advanced Search & Filtering
 * - Full-text search across scale names, descriptions, and tags
 * - Filter by category, specialty, body system
 * - Tag-based filtering for precise results
 * - Multi-language support (Spanish/English)
 * - Pagination and sorting options
 * 
 * ### 📊 Comprehensive Scale Data
 * - Complete scale definitions with questions and scoring
 * - Standardized response options and interpretations
 * - Evidence-based references and citations
 * - Multi-language translations support
 * - Version control and update tracking
 * 
 * ### 🧮 Assessment & Scoring
 * - Create and store scale assessments
 * - Automatic score calculation and interpretation
 * - Support for multiple scoring methods
 * - Patient data association (with privacy controls)
 * - Session and device tracking for analytics
 * 
 * ### 📈 Analytics & Insights
 * - Usage statistics and popularity metrics
 * - Assessment completion rates
 * - User engagement analytics
 * - Performance monitoring
 * 
 * ### 🔐 Security & Compliance
 * - HIPAA-compliant data handling
 * - Role-based access control
 * - Audit logging for all operations
 * - Secure authentication and authorization
 * - Data encryption at rest and in transit
 * 
 * ## API Endpoints:
 * 
 * ### Public Endpoints (No Authentication Required):
 * 
 * #### GET /api/scales
 * Search and retrieve medical scales with filtering options
 * 
 * **Parameters:**
 * - `query?`: string - Search term for full-text search
 * - `category?`: string - Filter by scale category
 * - `specialty?`: string - Filter by medical specialty
 * - `tags?`: string[] - Filter by tags
 * - `language?`: string - Language preference (default: 'es')
 * - `limit?`: number - Number of results per page (default: 20)
 * - `page?`: number - Page number for pagination (default: 1)
 * - `sortBy?`: 'name' | 'popularity' | 'created_at' | 'updated_at'
 * - `sortOrder?`: 'asc' | 'desc'
 * 
 * **Response:**
 * ```typescript
 * {
 *   data: Scale[],
 *   count: number,
 *   error: boolean,
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     totalPages: number,
 *     totalItems: number
 *   }
 * }
 * ```
 * 
 * #### GET /api/scales/:id
 * Retrieve complete details for a specific scale
 * 
 * **Parameters:**
 * - `id`: string - Scale ID
 * - `language?`: string - Language for translations
 * 
 * **Response:**
 * ```typescript
 * {
 *   data: ScaleWithDetails,
 *   error: boolean
 * }
 * ```
 * 
 * #### GET /api/scales/categories
 * Get all available scale categories with counts
 * 
 * **Response:**
 * ```typescript
 * {
 *   data: Array<{ category: string, count: number }>,
 *   error: boolean
 * }
 * ```
 * 
 * #### GET /api/scales/specialties
 * Get all medical specialties with scale counts
 * 
 * **Response:**
 * ```typescript
 * {
 *   data: Array<{ specialty: string, count: number }>,
 *   error: boolean
 * }
 * ```
 * 
 * #### GET /api/scales/popular
 * Get popular/trending scales
 * 
 * **Parameters:**
 * - `limit?`: number - Number of scales to return (default: 10)
 * 
 * ### Authenticated Endpoints (Require User Authentication):
 * 
 * #### POST /api/assessments
 * Create a new scale assessment
 * 
 * **Body:**
 * ```typescript
 * {
 *   scale_id: string,
 *   patient_id?: string,
 *   responses: Record<string, number | string>,
 *   session_id?: string,
 *   device_info?: object,
 *   ip_address?: string
 * }
 * ```
 * 
 * #### POST /api/favorites/:scale_id
 * Add scale to user favorites
 * 
 * #### DELETE /api/favorites/:scale_id
 * Remove scale from user favorites
 * 
 * #### GET /api/favorites
 * Get user's favorite scales
 * 
 * ### Admin Endpoints (Require Admin/Practitioner Role):
 * 
 * #### POST /api/scales
 * Create a new medical scale
 * 
 * #### PUT /api/scales/:id
 * Update an existing scale
 * 
 * #### DELETE /api/scales/:id
 * Delete a scale (soft delete, sets status to 'deprecated')
 * 
 * #### GET /api/scales/:id/statistics
 * Get detailed analytics for a scale
 * 
 * ## Usage Examples:
 * 
 * ### Search for Neurological Scales:
 * ```typescript
 * const scales = await getScales({
 *   category: 'Neurológica',
 *   limit: 10,
 *   sortBy: 'popularity'
 * });
 * ```
 * 
 * ### Get Scale Details:
 * ```typescript
 * const scale = await getScaleById('scale-id', 'es');
 * ```
 * 
 * ### Create Assessment:
 * ```typescript
 * const assessment = await createScaleAssessment({
 *   scale_id: 'barthel-scale-id',
 *   responses: {
 *     'comida': 10,
 *     'lavado': 5,
 *     'vestido': 10
 *   }
 * });
 * ```
 * 
 * ## Error Handling:
 * 
 * All API functions return a consistent error format:
 * ```typescript
 * {
 *   error: true,
 *   message: string,
 *   code?: string,
 *   status?: number
 * }
 * ```
 * 
 * ## Rate Limiting:
 * 
 * - Public endpoints: 100 requests per minute per IP
 * - Authenticated endpoints: 500 requests per minute per user
 * - Admin endpoints: 1000 requests per minute per admin
 * 
 * ## Data Sources & Updates:
 * 
 * The repository includes scales from:
 * - Validated clinical assessment tools
 * - Peer-reviewed medical literature
 * - Professional medical organizations
 * - Standardized health assessment protocols
 * 
 * Updates are performed:
 * - Automatically from trusted sources
 * - Through professional medical review
 * - Via community contributions (with validation)
 * - Following evidence-based medicine principles
 * 
 * @example
 * ```typescript
 * import { getScales, getScaleById } from '@/api';
 * 
 * // Search for functional assessment scales
 * const functionalScales = await getScales({
 *   category: 'Funcional',
 *   tags: ['rehabilitación', 'independencia'],
 *   limit: 20
 * });
 * 
 * // Get detailed information for a specific scale
 * const barthelScale = await getScaleById('barthel-index-id');
 * 
 * if (!barthelScale.error && barthelScale.data) {
 *   console.log(`Scale: ${barthelScale.data.name}`);
 *   console.log(`Questions: ${barthelScale.data.questions.length}`);
 *   console.log(`Scoring: ${barthelScale.data.scoring?.scoring_method}`);
 * }
 * ```
 */

/**
 * API Configuration and Constants
 */
export const API_CONFIG = {
  VERSION: '2.0.0',
  BASE_URL: '/api',
  SUPPORTED_LANGUAGES: ['es', 'en'],
  DEFAULT_LANGUAGE: 'es',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMITS: {
    PUBLIC: 100,      // requests per minute
    AUTHENTICATED: 500,
    ADMIN: 1000
  }
} as const;

/**
 * Scale Categories Available in the Repository
 */
export const SCALE_CATEGORIES = [
  'Funcional',
  'Neurológica',
  'Psiquiátrica',
  'Cardiovascular',
  'Respiratoria',
  'Dolor',
  'Calidad de Vida',
  'Cognitiva',
  'Geriátrica',
  'Pediátrica',
  'Rehabilitación',
  'Oncológica'
] as const;

/**
 * Medical Specialties Covered
 */
export const MEDICAL_SPECIALTIES = [
  'Medicina Física y Rehabilitación',
  'Neurología',
  'Psiquiatría',
  'Cardiología',
  'Neumología',
  'Geriatría',
  'Pediatría',
  'Oncología',
  'Medicina Interna',
  'Medicina Familiar',
  'Terapia Ocupacional',
  'Fisioterapia',
  'Psicología Clínica'
] as const;

/**
 * Supported Question Types
 */
export const QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'numeric',
  'text',
  'boolean',
  'scale',
  'matrix'
] as const;

/**
 * Scoring Methods Available
 */
export const SCORING_METHODS = [
  'sum',          // Simple sum of all responses
  'average',      // Average of all responses
  'weighted',     // Weighted sum based on question importance
  'complex',      // Custom scoring algorithm
  'categorical',  // Category-based interpretation
  'percentile'    // Percentile-based scoring
] as const;

export default {
  // Core Functions
  getScales,
  getScaleById,
  getScaleCategories,
  getScaleSpecialties,
  getPopularScales,
  createScaleAssessment,
  getScaleStatistics,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  
  // Configuration
  API_CONFIG,
  SCALE_CATEGORIES,
  MEDICAL_SPECIALTIES,
  QUESTION_TYPES,
  SCORING_METHODS
};