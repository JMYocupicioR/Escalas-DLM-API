/**
 * @file api/admin/createScale.ts
 * @description Admin endpoint for creating new medical scales
 * Only available in development mode
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

export interface ImportScale {
  id: string;
  name: string;
  acronym?: string;
  description: string;
  category: string;
  tags?: string[];
  timeToComplete?: string;
  instructions?: string;
  questions: Array<{
    id: string;
    question_text: string;
    description?: string;
    question_type: 'single_choice' | 'multiple_choice' | 'numeric' | 'boolean';
    options: Array<{
      option_value: number | boolean;
      option_label: string;
      option_description?: string;
    }>;
  }>;
  scoring?: {
    min_score: number;
    max_score: number;
    method: 'sum' | 'weighted' | 'complex' | 'average';
    ranges: Array<{
      min_value: number;
      max_value: number;
      interpretation_level: string;
      interpretation_text: string;
    }>;
  };
}

interface CreateScaleResponse {
  success: boolean;
  error?: string;
  scale?: ImportScale;
  formattedScale?: any;
}

export async function createScale(scale: ImportScale, onSuccess?: (scale: ImportScale) => void): Promise<CreateScaleResponse> {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return {
      success: false,
      error: 'Scale creation is only available in development mode'
    };
  }

  try {
    // Validate required fields
    const validation = validateScale(scale);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Check if scale ID already exists
    const existingScale = await checkScaleExists(scale.id);
    if (existingScale) {
      return {
        success: false,
        error: `Scale with ID '${scale.id}' already exists`
      };
    }

    // Convert ImportScale to Scale format
    const formattedScale = convertImportScaleToScale(scale);

    // Update _scales.ts file
    await updateScalesFile(scale);

    // Create detailed scale data file
    await createScaleDataFile(scale);

    // Call success callback for store updates
    if (onSuccess) {
      onSuccess(scale);
    }

    return {
      success: true,
      scale,
      formattedScale
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to create scale: ${error.message}`
    };
  }
}

function validateScale(scale: ImportScale): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!scale.id || scale.id.trim() === '') {
    errors.push('Scale ID is required');
  }

  if (!scale.name || scale.name.trim() === '') {
    errors.push('Scale name is required');
  }

  if (!scale.description || scale.description.trim() === '') {
    errors.push('Scale description is required');
  }

  if (!scale.category || scale.category.trim() === '') {
    errors.push('Scale category is required');
  }

  if (!scale.questions || scale.questions.length === 0) {
    errors.push('At least one question is required');
  }

  // Validate questions
  scale.questions?.forEach((question, index) => {
    if (!question.id || question.id.trim() === '') {
      errors.push(`Question ${index + 1}: ID is required`);
    }

    if (!question.question_text || question.question_text.trim() === '') {
      errors.push(`Question ${index + 1}: Text is required`);
    }

    if (!question.options || question.options.length === 0) {
      errors.push(`Question ${index + 1}: At least one option is required`);
    }

    question.options?.forEach((option, optIndex) => {
      if (option.option_value === undefined || option.option_value === null) {
        errors.push(`Question ${index + 1}, Option ${optIndex + 1}: Value is required`);
      }

      if (!option.option_label || option.option_label.trim() === '') {
        errors.push(`Question ${index + 1}, Option ${optIndex + 1}: Label is required`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

async function checkScaleExists(scaleId: string): Promise<boolean> {
  try {
    const scalesFilePath = path.join(process.cwd(), 'data', '_scales.ts');
    const content = await fs.readFile(scalesFilePath, 'utf-8');
    return content.includes(`id: '${scaleId}'`);
  } catch (error) {
    return false;
  }
}

async function updateScalesFile(scale: ImportScale): Promise<void> {
  const scalesFilePath = path.join(process.cwd(), 'data', '_scales.ts');
  
  try {
    let content = await fs.readFile(scalesFilePath, 'utf-8');
    
    // Create new scale entry
    const newScaleEntry = `  {
    id: '${scale.id}',
    name: '${scale.name}',${scale.acronym ? `\n    acronym: '${scale.acronym}',` : ''}
    description: '${scale.description}',
    timeToComplete: '${scale.timeToComplete || '5-10 min'}',
    category: '${scale.category}',${scale.tags ? `\n    tags: ${JSON.stringify(scale.tags)},` : ''}
  },`;

    // Find the position to insert (before the closing ];)
    const insertPosition = content.lastIndexOf('];');
    if (insertPosition === -1) {
      throw new Error('Could not find scales array in _scales.ts');
    }

    // Insert the new scale
    const beforeInsert = content.substring(0, insertPosition);
    const afterInsert = content.substring(insertPosition);
    
    const updatedContent = beforeInsert + newScaleEntry + '\n' + afterInsert;
    
    await fs.writeFile(scalesFilePath, updatedContent, 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to update _scales.ts: ${error.message}`);
  }
}

async function createScaleDataFile(scale: ImportScale): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  const scaleFilePath = path.join(dataDir, `${scale.id}.ts`);
  
  try {
    const fileContent = generateScaleDataFile(scale);
    await fs.writeFile(scaleFilePath, fileContent, 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to create scale data file: ${error.message}`);
  }
}

function generateScaleDataFile(scale: ImportScale): string {
  const interfaceName = toPascalCase(scale.id) + 'Question';
  
  return `export interface ${interfaceName} {
  id: string;
  question: string;
  description: string;
  options: Array<{
    value: ${scale.questions[0]?.options[0]?.option_value === true || scale.questions[0]?.options[0]?.option_value === false ? 'boolean' : 'number'};
    label: string;
    description: string;
  }>;
}

export const questions: ${interfaceName}[] = [
${scale.questions.map(q => `  {
    id: '${q.id}',
    question: '${q.question_text}',
    description: '${q.description || ''}',
    options: [
${q.options.map(opt => `      {
        value: ${typeof opt.option_value === 'boolean' ? opt.option_value : opt.option_value},
        label: '${opt.option_label}',
        description: '${opt.option_description || ''}',
      }`).join(',\n')}
    ],
  }`).join(',\n')}
];

${scale.scoring ? `
export const scoring = {
  min_score: ${scale.scoring.min_score},
  max_score: ${scale.scoring.max_score},
  method: '${scale.scoring.method}' as const,
  ranges: [
${scale.scoring.ranges.map(range => `    {
      min_value: ${range.min_value},
      max_value: ${range.max_value},
      interpretation_level: '${range.interpretation_level}',
      interpretation_text: '${range.interpretation_text}',
    }`).join(',\n')}
  ],
};` : ''}
`;
}

function convertImportScaleToScale(importScale: ImportScale): any {
  return {
    id: importScale.id,
    name: importScale.name,
    acronym: importScale.acronym,
    description: importScale.description,
    category: importScale.category,
    tags: importScale.tags || [],
    timeToComplete: importScale.timeToComplete || '5-10 min',
    specialty: importScale.specialty,
    popular: false,
    popularity: 0,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    instructions: importScale.instructions,
    scoring: importScale.scoring ? {
      method: importScale.scoring.method,
      ranges: importScale.scoring.ranges.map(range => ({
        min: range.min_value,
        max: range.max_value,
        interpretation: range.interpretation_text,
      })),
    } : undefined,
  };
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export default createScale;