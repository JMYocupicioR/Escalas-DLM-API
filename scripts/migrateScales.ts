/**
 * @file scripts/migrateScales.ts
 * @description Migration script to convert existing scales to new database format
 * Run with: npx ts-node scripts/migrateScales.ts
 */

import { supabase } from '../api/config/supabase';
import { questions as barthelQuestions } from '../data/barthel';
import { 
  symptomSeverityQuestions, 
  functionalStatusQuestions, 
  scoreInterpretation 
} from '../data/boston';
import { CreateScaleRequest } from '../api/scales/types';

// Define scale definitions to migrate
const scalesToMigrate = [
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    acronym: 'BI',
    description: 'Escala de evaluación de actividades básicas de la vida diaria en pacientes con trastornos neuromusculares y musculoesqueléticos',
    category: 'Funcional',
    specialty: 'Medicina Física y Rehabilitación',
    bodySystem: 'Sistema Musculoesquelético',
    tags: ['rehabilitación', 'actividades vida diaria', 'independencia funcional', 'discapacidad'],
    timeToComplete: '5-10 minutos',
    instructions: 'Evalúe la capacidad del paciente para realizar cada actividad de forma independiente. Seleccione la puntuación que mejor describa el nivel actual de funcionamiento.',
    version: '1.0',
    scoring: {
      method: 'sum',
      minScore: 0,
      maxScore: 100,
      ranges: [
        {
          min: 0,
          max: 20,
          level: 'Dependencia Total',
          interpretation: 'El paciente requiere asistencia total para todas las actividades de la vida diaria.',
          recommendations: 'Necesita cuidados de enfermería completos y supervisión constante.',
          colorCode: '#FF4444'
        },
        {
          min: 21,
          max: 60,
          level: 'Dependencia Severa',
          interpretation: 'El paciente requiere asistencia significativa para la mayoría de actividades.',
          recommendations: 'Requiere ayuda sustancial y supervisión frecuente. Considerar programa de rehabilitación intensivo.',
          colorCode: '#FF8800'
        },
        {
          min: 61,
          max: 90,
          level: 'Dependencia Moderada',
          interpretation: 'El paciente puede realizar algunas actividades de forma independiente.',
          recommendations: 'Beneficiaría de terapia ocupacional y programa de rehabilitación funcional.',
          colorCode: '#FFAA00'
        },
        {
          min: 91,
          max: 99,
          level: 'Dependencia Leve',
          interpretation: 'El paciente es en gran medida independiente con mínima asistencia.',
          recommendations: 'Mantener actividad actual y considerar programas de prevención de caídas.',
          colorCode: '#88CC00'
        },
        {
          min: 100,
          max: 100,
          level: 'Independencia Completa',
          interpretation: 'El paciente es completamente independiente para todas las actividades evaluadas.',
          recommendations: 'Mantener nivel de actividad actual y seguimiento periódico.',
          colorCode: '#44CC44'
        }
      ]
    },
    references: [
      {
        title: 'Functional evaluation: the Barthel Index',
        authors: ['Mahoney FI', 'Barthel DW'],
        journal: 'Maryland State Medical Journal',
        year: 1965,
        volume: '14',
        pages: '61-65',
        isPrimary: true,
        referenceType: 'original'
      },
      {
        title: 'The Barthel ADL Index: a reliability study',
        authors: ['Collin C', 'Wade DT', 'Davies S', 'Horne V'],
        journal: 'International Disability Studies',
        year: 1988,
        volume: '10',
        pages: '61-63',
        referenceType: 'validation'
      }
    ],
    questions: barthelQuestions
  },
  {
    id: 'boston',
    name: 'Cuestionario de Boston',
    acronym: 'BCTQ',
    description: 'Cuestionario específico para evaluar la severidad de síntomas y el estado funcional en pacientes con síndrome del túnel carpiano',
    category: 'Neurológica',
    specialty: 'Neurología',
    bodySystem: 'Sistema Nervioso Periférico',
    tags: ['túnel carpiano', 'neuropatía', 'mano', 'síntomas neurológicos'],
    timeToComplete: '5-8 minutos',
    instructions: 'Complete ambas secciones del cuestionario: severidad de síntomas y estado funcional. Responda basándose en su experiencia durante las últimas 2 semanas.',
    version: '1.0',
    scoring: {
      method: 'average',
      minScore: 1.0,
      maxScore: 5.0,
      ranges: scoreInterpretation.symptomSeverity.concat(scoreInterpretation.functionalStatus)
    },
    references: [
      {
        title: 'A self-administered questionnaire for the assessment of severity of symptoms and functional status in carpal tunnel syndrome',
        authors: ['Levine DW', 'Simmons BP', 'Koris MJ', 'Daltroy LH', 'Hohl GG', 'Fossel AH', 'Katz JN'],
        journal: 'The Journal of Bone and Joint Surgery',
        year: 1993,
        volume: '75',
        pages: '1585-1592',
        isPrimary: true,
        referenceType: 'original'
      }
    ],
    questions: [...symptomSeverityQuestions, ...functionalStatusQuestions]
  }
];

/**
 * Convert legacy question format to new format
 */
function convertQuestions(legacyQuestions: any[], scaleId: string) {
  return legacyQuestions.map((q, index) => ({
    question_id: q.id,
    question_text: q.question,
    description: q.description,
    question_type: 'single_choice' as const,
    order_index: index + 1,
    is_required: true,
    options: q.options.map((opt: any, optIndex: number) => ({
      option_value: opt.value,
      option_label: opt.label,
      option_description: opt.description,
      order_index: optIndex + 1,
      is_default: false
    }))
  }));
}

/**
 * Migrate a single scale to the new format
 */
async function migrateScale(scaleData: any): Promise<boolean> {
  try {
    console.log(`🔄 Migrating scale: ${scaleData.name}`);

    // Insert main scale record
    const { data: scale, error: scaleError } = await supabase
      .from('medical_scales')
      .insert({
        name: scaleData.name,
        acronym: scaleData.acronym,
        description: scaleData.description,
        category: scaleData.category,
        specialty: scaleData.specialty,
        body_system: scaleData.bodySystem,
        tags: scaleData.tags,
        time_to_complete: scaleData.timeToComplete,
        instructions: scaleData.instructions,
        version: scaleData.version,
        popularity: 0,
        popular: false,
        status: 'active'
      })
      .select()
      .single();

    if (scaleError) {
      console.error(`❌ Error inserting scale ${scaleData.name}:`, scaleError);
      return false;
    }

    const scaleId = scale.id;
    console.log(`✅ Scale inserted with ID: ${scaleId}`);

    // Insert questions and options
    for (const question of convertQuestions(scaleData.questions, scaleId)) {
      const { data: questionData, error: questionError } = await supabase
        .from('scale_questions')
        .insert({
          scale_id: scaleId,
          question_id: question.question_id,
          question_text: question.question_text,
          description: question.description,
          question_type: question.question_type,
          order_index: question.order_index,
          is_required: question.is_required
        })
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Error inserting question ${question.question_id}:`, questionError);
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
            is_default: option.is_default
          });

        if (optionError) {
          console.error(`❌ Error inserting option for ${question.question_id}:`, optionError);
        }
      }
    }

    console.log(`✅ Questions and options inserted for ${scaleData.name}`);

    // Insert scoring information
    if (scaleData.scoring) {
      const { data: scoring, error: scoringError } = await supabase
        .from('scale_scoring')
        .insert({
          scale_id: scaleId,
          scoring_method: scaleData.scoring.method,
          min_score: scaleData.scoring.minScore,
          max_score: scaleData.scoring.maxScore
        })
        .select()
        .single();

      if (scoringError) {
        console.error(`❌ Error inserting scoring for ${scaleData.name}:`, scoringError);
      } else {
        // Insert scoring ranges
        for (const [index, range] of scaleData.scoring.ranges.entries()) {
          const { error: rangeError } = await supabase
            .from('scoring_ranges')
            .insert({
              scoring_id: scoring.id,
              min_value: range.min,
              max_value: range.max,
              interpretation_level: range.level,
              interpretation_text: range.interpretation,
              recommendations: range.recommendations,
              color_code: range.colorCode,
              order_index: index + 1
            });

          if (rangeError) {
            console.error(`❌ Error inserting range for ${scaleData.name}:`, rangeError);
          }
        }
        console.log(`✅ Scoring and ranges inserted for ${scaleData.name}`);
      }
    }

    // Insert references
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
            reference_type: ref.referenceType || 'original',
            is_primary: ref.isPrimary || false
          });

        if (refError) {
          console.error(`❌ Error inserting reference for ${scaleData.name}:`, refError);
        }
      }
      console.log(`✅ References inserted for ${scaleData.name}`);
    }

    return true;

  } catch (error) {
    console.error(`❌ Unexpected error migrating ${scaleData.name}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting scales migration...');
  console.log(`📊 Found ${scalesToMigrate.length} scales to migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const scale of scalesToMigrate) {
    const success = await migrateScale(scale);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Add delay between migrations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📈 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount} scales`);
  console.log(`❌ Failed to migrate: ${errorCount} scales`);

  if (errorCount === 0) {
    console.log('🎉 All scales migrated successfully!');
  } else {
    console.log('⚠️  Some scales failed to migrate. Check logs above for details.');
  }
}

/**
 * Check if migration has already been run
 */
async function checkMigrationStatus() {
  const { data, error } = await supabase
    .from('medical_scales')
    .select('id, name')
    .limit(1);

  if (error) {
    console.error('❌ Error checking migration status:', error);
    return false;
  }

  if (data && data.length > 0) {
    console.log('⚠️  Scales already exist in database. Migration may have already been run.');
    console.log('Continue anyway? (y/N)');
    
    // In a real script, you'd handle user input here
    // For now, we'll just log and continue
    return true;
  }

  return true;
}

// Run migration if this file is executed directly
if (require.main === module) {
  checkMigrationStatus().then((shouldContinue) => {
    if (shouldContinue) {
      runMigration().catch(console.error);
    }
  });
}

export { runMigration, migrateScale }; 