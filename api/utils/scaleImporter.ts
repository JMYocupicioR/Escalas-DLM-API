/**
 * @file api/utils/scaleImporter.ts
 * @description Utility for importing medical scales from various formats
 * Supports JSON, CSV, and direct object imports
 */

import { supabase } from '../config/supabase';
import { CreateScaleRequest } from '../scales/types';

export interface ImportResult {
  success: boolean;
  scaleId?: string;
  errors: string[];
  warnings: string[];
}

export interface BulkImportResult {
  totalScales: number;
  successfulImports: number;
  failedImports: number;
  results: ImportResult[];
}

/**
 * Import a single scale to the database
 */
export async function importScale(scaleData: CreateScaleRequest): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    errors: [],
    warnings: []
  };

  try {
    // Validate required fields
    if (!scaleData.name || !scaleData.description || !scaleData.category) {
      result.errors.push('Missing required fields: name, description, or category');
      return result;
    }

    if (!scaleData.questions || scaleData.questions.length === 0) {
      result.errors.push('Scale must have at least one question');
      return result;
    }

    // Insert main scale record
    const { data: scale, error: scaleError } = await supabase
      .from('medical_scales')
      .insert({
        name: scaleData.name,
        acronym: scaleData.acronym,
        description: scaleData.description,
        category: scaleData.category,
        specialty: scaleData.specialty,
        body_system: scaleData.body_system,
        tags: scaleData.tags || [],
        time_to_complete: scaleData.time_to_complete,
        instructions: scaleData.instructions,
        version: scaleData.version || '1.0',
        language: scaleData.language || 'es',
        cross_references: scaleData.cross_references || [],
        doi: scaleData.doi,
        copyright_info: scaleData.copyright_info,
        license: scaleData.license || 'CC BY-NC 4.0',
        popularity: 0,
        popular: false,
        status: 'active'
      })
      .select()
      .single();

    if (scaleError) {
      result.errors.push(`Error creating scale: ${scaleError.message}`);
      return result;
    }

    const scaleId = scale.id;
    result.scaleId = scaleId;

    // Insert questions and options
    for (const [questionIndex, question] of scaleData.questions.entries()) {
      if (!question.question_text || !question.options || question.options.length === 0) {
        result.warnings.push(`Question ${questionIndex + 1} is missing text or options`);
        continue;
      }

      const { data: questionData, error: questionError } = await supabase
        .from('scale_questions')
        .insert({
          scale_id: scaleId,
          question_id: question.question_id,
          question_text: question.question_text,
          description: question.description,
          question_type: question.question_type || 'single_choice',
          order_index: question.order_index,
          is_required: question.is_required !== false, // Default to true
          category: question.category,
          instructions: question.instructions
        })
        .select()
        .single();

      if (questionError) {
        result.errors.push(`Error creating question ${question.question_id}: ${questionError.message}`);
        continue;
      }

      // Insert options for this question
      for (const option of question.options) {
        const { error: optionError } = await supabase
          .from('question_options')
          .insert({
            question_id: questionData.id,
            option_value: option.option_value,
            option_label: option.option_label,
            option_description: option.option_description,
            order_index: option.order_index,
            is_default: option.is_default || false
          });

        if (optionError) {
          result.warnings.push(`Error creating option for question ${question.question_id}: ${optionError.message}`);
        }
      }
    }

    // Insert scoring information if provided
    if (scaleData.scoring) {
      const { data: scoring, error: scoringError } = await supabase
        .from('scale_scoring')
        .insert({
          scale_id: scaleId,
          scoring_method: scaleData.scoring.scoring_method,
          min_score: scaleData.scoring.min_score,
          max_score: scaleData.scoring.max_score
        })
        .select()
        .single();

      if (scoringError) {
        result.warnings.push(`Error creating scoring: ${scoringError.message}`);
      } else if (scaleData.scoring.ranges) {
        // Insert scoring ranges
        for (const range of scaleData.scoring.ranges) {
          const { error: rangeError } = await supabase
            .from('scoring_ranges')
            .insert({
              scoring_id: scoring.id,
              min_value: range.min_value,
              max_value: range.max_value,
              interpretation_level: range.interpretation_level,
              interpretation_text: range.interpretation_text,
              recommendations: range.recommendations,
              color_code: range.color_code,
              order_index: range.order_index
            });

          if (rangeError) {
            result.warnings.push(`Error creating scoring range: ${rangeError.message}`);
          }
        }
      }
    }

    // Insert references if provided
    if (scaleData.references) {
      for (const ref of scaleData.references) {
        const { error: refError } = await supabase
          .from('scale_references')
          .insert({
            scale_id: scaleId,
            title: ref.title,
            authors: ref.authors,
            journal: ref.journal,
            year: ref.year,
            volume: ref.volume,
            pages: ref.pages,
            doi: ref.doi,
            pmid: ref.pmid,
            url: ref.url,
            reference_type: ref.reference_type || 'original',
            is_primary: ref.is_primary || false
          });

        if (refError) {
          result.warnings.push(`Error creating reference: ${refError.message}`);
        }
      }
    }

    result.success = true;
    return result;

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Import multiple scales from an array
 */
export async function bulkImportScales(scales: CreateScaleRequest[]): Promise<BulkImportResult> {
  const results: ImportResult[] = [];
  let successfulImports = 0;
  let failedImports = 0;

  for (const [index, scale] of scales.entries()) {
    console.log(`Importing scale ${index + 1}/${scales.length}: ${scale.name}`);
    
    const result = await importScale(scale);
    results.push(result);
    
    if (result.success) {
      successfulImports++;
      console.log(`✅ Successfully imported: ${scale.name}`);
    } else {
      failedImports++;
      console.log(`❌ Failed to import: ${scale.name}`);
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }

    // Add small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    totalScales: scales.length,
    successfulImports,
    failedImports,
    results
  };
}

/**
 * Import scales from JSON string
 */
export async function importFromJSON(jsonString: string): Promise<BulkImportResult> {
  try {
    const data = JSON.parse(jsonString);
    const scales = Array.isArray(data) ? data : [data];
    return await bulkImportScales(scales);
  } catch (error) {
    return {
      totalScales: 0,
      successfulImports: 0,
      failedImports: 1,
      results: [{
        success: false,
        errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      }]
    };
  }
}

/**
 * Generate scale template for easy creation
 */
export function generateScaleTemplate(): CreateScaleRequest {
  return {
    name: 'Nombre de la Escala',
    acronym: 'NE',
    description: 'Descripción detallada de qué evalúa esta escala médica',
    category: 'Categoría (ej: Funcional, Neurológica, Psiquiátrica)',
    specialty: 'Especialidad médica principal',
    body_system: 'Sistema corporal evaluado',
    tags: ['etiqueta1', 'etiqueta2', 'etiqueta3'],
    time_to_complete: '5-10 minutos',
    instructions: 'Instrucciones para completar la escala',
    version: '1.0',
    language: 'es',
    cross_references: [],
    license: 'CC BY-NC 4.0',
    questions: [
      {
        question_id: 'pregunta_1',
        question_text: '¿Texto de la primera pregunta?',
        description: 'Descripción adicional si es necesaria',
        question_type: 'single_choice',
        order_index: 1,
        is_required: true,
        options: [
          {
            option_value: 0,
            option_label: 'Opción A',
            option_description: 'Descripción de la opción A',
            order_index: 1,
            is_default: false
          },
          {
            option_value: 1,
            option_label: 'Opción B',
            option_description: 'Descripción de la opción B',
            order_index: 2,
            is_default: false
          }
        ]
      }
    ],
    scoring: {
      scoring_method: 'sum',
      min_score: 0,
      max_score: 10,
      ranges: [
        {
          min_value: 0,
          max_value: 3,
          interpretation_level: 'Bajo',
          interpretation_text: 'Puntuación baja',
          recommendations: 'Recomendaciones para puntuación baja',
          color_code: '#44CC44',
          order_index: 1
        },
        {
          min_value: 4,
          max_value: 7,
          interpretation_level: 'Moderado',
          interpretation_text: 'Puntuación moderada',
          recommendations: 'Recomendaciones para puntuación moderada',
          color_code: '#FFAA00',
          order_index: 2
        },
        {
          min_value: 8,
          max_value: 10,
          interpretation_level: 'Alto',
          interpretation_text: 'Puntuación alta',
          recommendations: 'Recomendaciones para puntuación alta',
          color_code: '#FF4444',
          order_index: 3
        }
      ]
    },
    references: [
      {
        title: 'Título del artículo original',
        authors: ['Autor 1', 'Autor 2'],
        journal: 'Nombre de la revista',
        year: 2023,
        volume: '10',
        pages: '123-145',
        doi: '10.1000/ejemplo',
        reference_type: 'original',
        is_primary: true
      }
    ]
  };
}

/**
 * Validate scale data before import
 */
export function validateScaleData(scaleData: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!scaleData.name || typeof scaleData.name !== 'string') {
    errors.push('Scale name is required and must be a string');
  }

  if (!scaleData.description || typeof scaleData.description !== 'string') {
    errors.push('Scale description is required and must be a string');
  }

  if (!scaleData.category || typeof scaleData.category !== 'string') {
    errors.push('Scale category is required and must be a string');
  }

  if (!scaleData.questions || !Array.isArray(scaleData.questions) || scaleData.questions.length === 0) {
    errors.push('Scale must have at least one question');
  } else {
    // Validate questions
    scaleData.questions.forEach((question: any, index: number) => {
      if (!question.question_text) {
        errors.push(`Question ${index + 1} is missing question_text`);
      }

      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        errors.push(`Question ${index + 1} must have at least one option`);
      } else {
        // Validate options
        question.options.forEach((option: any, optIndex: number) => {
          if (option.option_value === undefined || option.option_value === null) {
            errors.push(`Question ${index + 1}, Option ${optIndex + 1} is missing option_value`);
          }
          if (!option.option_label) {
            errors.push(`Question ${index + 1}, Option ${optIndex + 1} is missing option_label`);
          }
        });
      }
    });
  }

  // Optional field warnings
  if (!scaleData.specialty) {
    warnings.push('No specialty specified - consider adding for better categorization');
  }

  if (!scaleData.tags || scaleData.tags.length === 0) {
    warnings.push('No tags specified - consider adding for better searchability');
  }

  if (!scaleData.references || scaleData.references.length === 0) {
    warnings.push('No references provided - consider adding for credibility');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 