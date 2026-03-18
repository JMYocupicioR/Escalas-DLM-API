import { z } from 'zod';

// --- Core Value Objects ---

// 1. Esquema de Opciones (Para preguntas de selección)
const QuestionOptionSchema = z.object({
  id: z.string().uuid().optional(), // Opcional si es una importación nueva
  label: z.string().min(1, "La etiqueta de la opción es requerida"),
  value: z.union([z.string(), z.number()]), // Valor semántico
  score: z.number().default(0), // Valor numérico para cálculos
  order_index: z.number().int()
});

// 2. Esquema de Validación de Pregunta
const QuestionValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
  required: z.boolean().default(true)
});

// 3. Esquema de Lógica de Ramificación (Branching Logic)
const BranchingLogicSchema = z.object({
  action: z.enum(['SHOW', 'HIDE', 'JUMP_TO']),
  target_question_id: z.string().min(1),
  condition: z.any() // Regla json-logic compleja (ej: { "==": [{ "var": "q1" }, 1] })
});

// 4. Esquema de Pregunta (Item)
export const ScaleQuestionSchema = z.object({
  id: z.string().min(1), // ID interno para referenciar en la lógica (ej: "moca_q1")
  question_id: z.string().optional(), // ID original de la base de datos o sistema externo
  type: z.enum(['single_choice', 'multi_choice', 'slider', 'number', 'text', 'date', 'info']),
  text: z.string().min(1),
  description: z.string().optional(), // Instrucciones específicas para la pregunta
  order_index: z.number().int(),
  options: z.array(QuestionOptionSchema).optional(),
  validation: QuestionValidationSchema.optional(),
  logic: z.array(BranchingLogicSchema).optional(), // Lógica de visualización/salto
  attributes: z.record(z.any()).optional(), // Metadatos extra (ej: "class_name", "icon")
  image_url: z.string().url().optional() // URL de imagen opcional para la pregunta
});

// 5. Esquema de Referencia Bibliográfica
const ReferenceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "El título de la referencia es requerido"),
  authors: z.array(z.string()).min(1, "Al menos un autor es requerido"),
  year: z.number().int().min(1800).max(new Date().getFullYear() + 1),
  journal: z.string().optional(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  url: z.string().url().optional(),
  reference_type: z.enum(['original', 'validation', 'review', 'meta-analysis', 'clinical_trial']).default('original'),
  is_primary: z.boolean().default(false)
});

// 6. Esquema de Lógica de Puntuación e Interpretación
export const ScoringRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  label: z.string(), // ej: "Deterioro Cognitivo Leve"
  color: z.string().optional(), // Para UI: rojo, amarillo, verde (#RRGGBB)
  interpretation: z.string(),
  alert_level: z.enum(['none', 'low', 'medium', 'high', 'critical']).default('none')
});

const ScoringDomainSchema = z.object({
  id: z.string(),
  label: z.string(),
  question_ids: z.array(z.string()), // IDs específicos de preguntas para este dominio
  engine: z.enum(['sum', 'average', 'json-logic']),
  ranges: z.array(ScoringRangeSchema).optional(),
  custom_rules: z.any().optional()
});

const ScoringLogicSchema = z.object({
  engine: z.enum(['sum', 'average', 'json-logic']), // Suma simple o lógica compleja
  custom_rules: z.any().optional(), // Aquí iría el JSON para json-logic si engine='json-logic'
  ranges: z.array(ScoringRangeSchema).optional(),
  domains: z.array(ScoringDomainSchema).optional() // Soporte para múltiples sub-escalas
});

// --- Aggregates ---

// 7. Esquema de Versión (El corazón inmutable del sistema)
export const ScaleVersionSchema = z.object({
  version_number: z.string().regex(/^\d+\.\d+$/, "Formato de versión debe ser X.Y"), // ej: "1.0"
  status: z.enum(['draft', 'published', 'deprecated', 'active']).default('draft'),
  config: z.object({
    bibliography: z.array(ReferenceSchema).optional(),
    instructions: z.string().optional(),
    estimated_time: z.number().optional(), // en minutos
    tags: z.array(z.string()).default([]), // Categorización rápida
    original_author: z.string().optional(),
    language: z.string().default('es'),
    validation_info: z.string().optional(),
  }),
  questions: z.array(ScaleQuestionSchema).min(1, "La escala debe tener al menos una pregunta"),
  scoring: ScoringLogicSchema
});

// 8. Esquema Raíz de la Escala (Datos Maestros)
export const MedicalScaleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  acronym: z.string().optional(),
  description: z.string().optional(),
  categories: z.array(z.string()).min(1, "La escala debe pertenecer al menos a una categoría"), // IDs de categorías
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  
  // Relaciones
  current_version: ScaleVersionSchema.optional() 
});

// --- Types ---
export type MedicalScale = z.infer<typeof MedicalScaleSchema>;
export type ScaleVersion = z.infer<typeof ScaleVersionSchema>;
export type ScaleQuestion = z.infer<typeof ScaleQuestionSchema>;
export type ScoringLogic = z.infer<typeof ScoringLogicSchema>;
export type ScoringRange = z.infer<typeof ScoringRangeSchema>;

