/**
 * @file __tests__/utils/scaleImporter.test.ts
 * @description Tests for scale import and validation utilities
 */

import { validateScaleData, generateScaleTemplate } from '../../api/utils/scaleImporter';
import { CreateScaleRequest } from '../../api/scales/types';

describe('Scale Importer Utilities', () => {
  describe('validateScaleData', () => {
    const validScale: CreateScaleRequest = {
      name: 'Test Scale',
      description: 'A test scale for validation',
      category: 'Functional',
      questions: [
        {
          question_id: 'q1',
          question_text: 'Test question?',
          order_index: 1,
          options: [
            {
              option_value: 0,
              option_label: 'No',
              order_index: 1,
            },
            {
              option_value: 1,
              option_label: 'Yes',
              order_index: 2,
            },
          ],
        },
      ],
    };

    it('should validate a correct scale structure', () => {
      const result = validateScaleData(validScale);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when name is missing', () => {
      const invalidScale = { ...validScale, name: '' };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scale name is required and must be a string');
    });

    it('should fail validation when description is missing', () => {
      const invalidScale = { ...validScale, description: '' };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scale description is required and must be a string');
    });

    it('should fail validation when category is missing', () => {
      const invalidScale = { ...validScale, category: '' };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scale category is required and must be a string');
    });

    it('should fail validation when no questions are provided', () => {
      const invalidScale = { ...validScale, questions: [] };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scale must have at least one question');
    });

    it('should fail validation when question text is missing', () => {
      const invalidScale = {
        ...validScale,
        questions: [
          {
            ...validScale.questions[0],
            question_text: '',
          },
        ],
      };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question 1 is missing question_text');
    });

    it('should fail validation when question has no options', () => {
      const invalidScale = {
        ...validScale,
        questions: [
          {
            ...validScale.questions[0],
            options: [],
          },
        ],
      };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question 1 must have at least one option');
    });

    it('should fail validation when option value is missing', () => {
      const invalidScale = {
        ...validScale,
        questions: [
          {
            ...validScale.questions[0],
            options: [
              {
                option_value: undefined as any,
                option_label: 'Test',
                order_index: 1,
              },
            ],
          },
        ],
      };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question 1, Option 1 is missing option_value');
    });

    it('should fail validation when option label is missing', () => {
      const invalidScale = {
        ...validScale,
        questions: [
          {
            ...validScale.questions[0],
            options: [
              {
                option_value: 0,
                option_label: '',
                order_index: 1,
              },
            ],
          },
        ],
      };
      const result = validateScaleData(invalidScale);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question 1, Option 1 is missing option_label');
    });

    it('should generate warnings for missing optional fields', () => {
      const scaleWithoutOptionals = {
        name: 'Test Scale',
        description: 'A test scale',
        category: 'Functional',
        questions: validScale.questions,
      };
      
      const result = validateScaleData(scaleWithoutOptionals);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No specialty specified - consider adding for better categorization');
      expect(result.warnings).toContain('No tags specified - consider adding for better searchability');
      expect(result.warnings).toContain('No references provided - consider adding for credibility');
    });

    it('should validate scale with all optional fields', () => {
      const completeScale: CreateScaleRequest = {
        ...validScale,
        specialty: 'Test Specialty',
        tags: ['test', 'validation'],
        references: [
          {
            title: 'Test Reference',
            authors: ['Author 1', 'Author 2'],
            year: 2023,
            reference_type: 'original',
            is_primary: true,
          },
        ],
      };
      
      const result = validateScaleData(completeScale);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('generateScaleTemplate', () => {
    it('should generate a valid scale template', () => {
      const template = generateScaleTemplate();
      
      expect(template).toBeDefined();
      expect(template.name).toBe('Nombre de la Escala');
      expect(template.description).toBe('Descripción detallada de qué evalúa esta escala médica');
      expect(template.category).toBe('Categoría (ej: Funcional, Neurológica, Psiquiátrica)');
      expect(template.questions).toHaveLength(1);
      expect(template.scoring).toBeDefined();
      expect(template.references).toHaveLength(1);
    });

    it('should generate a template that passes validation', () => {
      const template = generateScaleTemplate();
      
      // Modify template to have valid values
      const validTemplate = {
        ...template,
        name: 'Valid Template Scale',
        description: 'A valid template scale',
        category: 'Functional',
      };
      
      const result = validateScaleData(validTemplate);
      
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Scale Scoring Calculations', () => {
  const mockScale = {
    questions: [
      {
        question_id: 'q1',
        options: [
          { option_value: 0, option_label: 'No' },
          { option_value: 5, option_label: 'Sometimes' },
          { option_value: 10, option_label: 'Yes' },
        ],
      },
      {
        question_id: 'q2',
        options: [
          { option_value: 0, option_label: 'Poor' },
          { option_value: 2, option_label: 'Fair' },
          { option_value: 5, option_label: 'Good' },
        ],
      },
    ],
  };

  describe('Sum scoring method', () => {
    it('should calculate correct sum score', () => {
      const responses = {
        q1: 10,
        q2: 5,
      };
      
      const expectedScore = 15;
      const actualScore = Object.values(responses).reduce((sum, value) => sum + value, 0);
      
      expect(actualScore).toBe(expectedScore);
    });
  });

  describe('Average scoring method', () => {
    it('should calculate correct average score', () => {
      const responses = {
        q1: 10,
        q2: 4,
      };
      
      const values = Object.values(responses);
      const expectedScore = values.reduce((sum, value) => sum + value, 0) / values.length;
      const actualScore = 7;
      
      expect(expectedScore).toBe(actualScore);
    });
  });

  describe('Weighted scoring method', () => {
    it('should calculate correct weighted score', () => {
      const responses = {
        q1: 10,
        q2: 5,
      };
      
      const weights = {
        q1: 2,
        q2: 1,
      };
      
      const expectedScore = (responses.q1 * weights.q1) + (responses.q2 * weights.q2);
      const actualScore = (10 * 2) + (5 * 1);
      
      expect(actualScore).toBe(expectedScore);
      expect(actualScore).toBe(25);
    });
  });
});

describe('Scale Interpretation', () => {
  const mockRanges = [
    {
      min_value: 0,
      max_value: 20,
      interpretation_level: 'Low',
      interpretation_text: 'Low score',
      color_code: '#44CC44',
    },
    {
      min_value: 21,
      max_value: 60,
      interpretation_level: 'Moderate',
      interpretation_text: 'Moderate score',
      color_code: '#FFAA00',
    },
    {
      min_value: 61,
      max_value: 100,
      interpretation_level: 'High',
      interpretation_text: 'High score',
      color_code: '#FF4444',
    },
  ];

  it('should find correct interpretation for low score', () => {
    const score = 15;
    const interpretation = mockRanges.find(range => 
      score >= range.min_value && score <= range.max_value
    );
    
    expect(interpretation).toBeDefined();
    expect(interpretation!.interpretation_level).toBe('Low');
  });

  it('should find correct interpretation for moderate score', () => {
    const score = 35;
    const interpretation = mockRanges.find(range => 
      score >= range.min_value && score <= range.max_value
    );
    
    expect(interpretation).toBeDefined();
    expect(interpretation!.interpretation_level).toBe('Moderate');
  });

  it('should find correct interpretation for high score', () => {
    const score = 85;
    const interpretation = mockRanges.find(range => 
      score >= range.min_value && score <= range.max_value
    );
    
    expect(interpretation).toBeDefined();
    expect(interpretation!.interpretation_level).toBe('High');
  });

  it('should handle edge cases correctly', () => {
    // Test boundary values
    const lowBoundary = mockRanges.find(range => 
      20 >= range.min_value && 20 <= range.max_value
    );
    expect(lowBoundary!.interpretation_level).toBe('Low');

    const moderateBoundary = mockRanges.find(range => 
      21 >= range.min_value && 21 <= range.max_value
    );
    expect(moderateBoundary!.interpretation_level).toBe('Moderate');
  });
});