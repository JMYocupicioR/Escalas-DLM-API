/**
 * @file scripts/massScaleImporter.ts
 * @description Mass importer for medical scales with validation and error handling
 * Supports importing from JSON, CSV, and Excel files with comprehensive validation
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { CreateScaleRequest } from '../api/scales/types';
import { validateScaleData, importScale, BulkImportResult } from '../api/utils/scaleImporter';

// Environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ImportOptions {
  sourceFile: string;
  outputDir?: string;
  validateOnly?: boolean;
  skipExisting?: boolean;
  batchSize?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

interface ImportStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  validationErrors: number;
  duplicates: number;
  executionTime: number;
  errors: Array<{ scale: string; error: string; line?: number }>;
}

class MassScaleImporter {
  private options: ImportOptions;
  private stats: ImportStats;
  private startTime: number;
  
  constructor(options: ImportOptions) {
    this.options = {
      outputDir: './import-results',
      validateOnly: false,
      skipExisting: true,
      batchSize: 10,
      logLevel: 'info',
      ...options,
    };
    
    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      validationErrors: 0,
      duplicates: 0,
      executionTime: 0,
      errors: [],
    };
    
    this.startTime = Date.now();
  }

  /**
   * Main import method
   */
  async import(): Promise<ImportStats> {
    this.log('info', `Starting mass import from: ${this.options.sourceFile}`);
    
    try {
      // Ensure output directory exists
      if (this.options.outputDir && !fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }

      // Load scales data
      const scales = await this.loadScales();
      this.stats.totalProcessed = scales.length;
      
      this.log('info', `Loaded ${scales.length} scales for processing`);

      // Process scales in batches
      await this.processInBatches(scales);

      // Calculate execution time
      this.stats.executionTime = Date.now() - this.startTime;

      // Generate report
      await this.generateReport();

      this.log('info', 'Import completed successfully');
      return this.stats;

    } catch (error) {
      this.log('error', `Import failed: ${error}`);
      throw error;
    }
  }

  /**
   * Load scales from various file formats
   */
  private async loadScales(): Promise<CreateScaleRequest[]> {
    const ext = path.extname(this.options.sourceFile).toLowerCase();
    
    switch (ext) {
      case '.json':
        return this.loadFromJSON();
      case '.csv':
        return this.loadFromCSV();
      case '.xlsx':
      case '.xls':
        return this.loadFromExcel();
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  /**
   * Load scales from JSON file
   */
  private async loadFromJSON(): Promise<CreateScaleRequest[]> {
    const content = fs.readFileSync(this.options.sourceFile, 'utf-8');
    const data = JSON.parse(content);
    
    // Support both single object and array of objects
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Load scales from CSV file
   */
  private async loadFromCSV(): Promise<CreateScaleRequest[]> {
    return new Promise((resolve, reject) => {
      const scales: CreateScaleRequest[] = [];
      const stream = fs.createReadStream(this.options.sourceFile)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const scale = this.parseCSVRow(row);
            if (scale) {
              scales.push(scale);
            }
          } catch (error) {
            this.log('warn', `Error parsing CSV row: ${error}`);
          }
        })
        .on('end', () => {
          resolve(scales);
        })
        .on('error', reject);
    });
  }

  /**
   * Load scales from Excel file
   */
  private async loadFromExcel(): Promise<CreateScaleRequest[]> {
    // Note: Would need to install xlsx package
    // const XLSX = require('xlsx');
    // const workbook = XLSX.readFile(this.options.sourceFile);
    // Implementation would go here
    throw new Error('Excel import not implemented yet. Please convert to JSON or CSV format.');
  }

  /**
   * Parse CSV row into scale data structure
   */
  private parseCSVRow(row: any): CreateScaleRequest | null {
    if (!row.name || !row.description || !row.category) {
      return null;
    }

    // Parse questions from CSV (JSON string in questions column)
    let questions = [];
    if (row.questions) {
      try {
        questions = JSON.parse(row.questions);
      } catch (error) {
        this.log('warn', `Invalid questions JSON for scale ${row.name}`);
        return null;
      }
    }

    // Parse tags
    const tags = row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [];

    // Parse references
    let references = [];
    if (row.references) {
      try {
        references = JSON.parse(row.references);
      } catch (error) {
        this.log('debug', `No valid references for scale ${row.name}`);
      }
    }

    // Parse scoring
    let scoring = undefined;
    if (row.scoring) {
      try {
        scoring = JSON.parse(row.scoring);
      } catch (error) {
        this.log('debug', `No valid scoring for scale ${row.name}`);
      }
    }

    return {
      name: row.name,
      acronym: row.acronym,
      description: row.description,
      category: row.category,
      specialty: row.specialty,
      body_system: row.body_system,
      tags,
      time_to_complete: row.time_to_complete,
      instructions: row.instructions,
      version: row.version || '1.0',
      language: row.language || 'es',
      cross_references: row.cross_references ? row.cross_references.split(',') : [],
      doi: row.doi,
      copyright_info: row.copyright_info,
      license: row.license || 'CC BY-NC 4.0',
      questions,
      scoring,
      references,
    };
  }

  /**
   * Process scales in batches to avoid overwhelming the database
   */
  private async processInBatches(scales: CreateScaleRequest[]): Promise<void> {
    const batchSize = this.options.batchSize!;
    
    for (let i = 0; i < scales.length; i += batchSize) {
      const batch = scales.slice(i, i + batchSize);
      this.log('info', `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scales.length / batchSize)}`);
      
      await Promise.all(
        batch.map((scale, index) => this.processScale(scale, i + index + 1))
      );
      
      // Small delay between batches to be nice to the database
      if (i + batchSize < scales.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Process a single scale
   */
  private async processScale(scale: CreateScaleRequest, lineNumber: number): Promise<void> {
    try {
      // Validate scale data
      const validation = validateScaleData(scale);
      if (!validation.isValid) {
        this.stats.validationErrors++;
        this.stats.errors.push({
          scale: scale.name,
          error: `Validation errors: ${validation.errors.join(', ')}`,
          line: lineNumber,
        });
        return;
      }

      // Log warnings
      if (validation.warnings.length > 0) {
        this.log('warn', `Scale ${scale.name}: ${validation.warnings.join(', ')}`);
      }

      // Check for duplicates if skipExisting is enabled
      if (this.options.skipExisting) {
        const isDuplicate = await this.checkDuplicate(scale);
        if (isDuplicate) {
          this.stats.duplicates++;
          this.stats.skipped++;
          this.log('debug', `Skipped duplicate scale: ${scale.name}`);
          return;
        }
      }

      // If validateOnly mode, don't actually import
      if (this.options.validateOnly) {
        this.stats.successful++;
        this.log('debug', `Validated scale: ${scale.name}`);
        return;
      }

      // Import the scale
      const result = await importScale(scale);
      
      if (result.success) {
        this.stats.successful++;
        this.log('debug', `Successfully imported: ${scale.name}`);
        
        // Log any warnings from import
        if (result.warnings.length > 0) {
          this.log('warn', `Import warnings for ${scale.name}: ${result.warnings.join(', ')}`);
        }
      } else {
        this.stats.failed++;
        this.stats.errors.push({
          scale: scale.name,
          error: result.errors.join(', '),
          line: lineNumber,
        });
        this.log('error', `Failed to import ${scale.name}: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push({
        scale: scale.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        line: lineNumber,
      });
      this.log('error', `Error processing ${scale.name}: ${error}`);
    }
  }

  /**
   * Check if scale already exists in database
   */
  private async checkDuplicate(scale: CreateScaleRequest): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('medical_scales')
        .select('id, name')
        .or(`name.eq.${scale.name},acronym.eq.${scale.acronym}`)
        .limit(1);

      if (error) {
        this.log('warn', `Error checking for duplicates: ${error.message}`);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      this.log('warn', `Error checking for duplicates: ${error}`);
      return false;
    }
  }

  /**
   * Generate comprehensive import report
   */
  private async generateReport(): Promise<void> {
    const report = {
      summary: {
        totalProcessed: this.stats.totalProcessed,
        successful: this.stats.successful,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        validationErrors: this.stats.validationErrors,
        duplicates: this.stats.duplicates,
        successRate: this.stats.totalProcessed > 0 
          ? ((this.stats.successful / this.stats.totalProcessed) * 100).toFixed(2) + '%'
          : '0%',
        executionTime: `${(this.stats.executionTime / 1000).toFixed(2)} seconds`,
      },
      errors: this.stats.errors,
      timestamp: new Date().toISOString(),
      options: this.options,
    };

    // Write report to file
    const reportPath = path.join(this.options.outputDir!, `import-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Write CSV error report if there are errors
    if (this.stats.errors.length > 0) {
      const csvPath = path.join(this.options.outputDir!, `import-errors-${Date.now()}.csv`);
      const csvContent = [
        'Line,Scale Name,Error',
        ...this.stats.errors.map(err => `${err.line || 'N/A'},"${err.scale}","${err.error}"`)
      ].join('\n');
      
      fs.writeFileSync(csvPath, csvContent);
    }

    this.log('info', `Report generated: ${reportPath}`);
  }

  /**
   * Logging utility
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.options.logLevel!];
    const messageLevel = levels[level];
    
    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }
}

/**
 * Example scale template for CSV format
 */
export const generateCSVTemplate = (): string => {
  const headers = [
    'name',
    'acronym',
    'description', 
    'category',
    'specialty',
    'body_system',
    'tags',
    'time_to_complete',
    'instructions',
    'version',
    'language',
    'cross_references',
    'doi',
    'copyright_info',
    'license',
    'questions',
    'scoring',
    'references'
  ];

  const exampleRow = [
    'Escala de Ejemplo',
    'EE',
    'Descripción de la escala de ejemplo',
    'Funcional',
    'Medicina General',
    'Sistema Musculoesquelético',
    'ejemplo,template,demo',
    '5-10 minutos',
    'Instrucciones para administrar la escala',
    '1.0',
    'es',
    '',
    '10.1000/ejemplo',
    'Copyright info aquí',
    'CC BY-NC 4.0',
    '[{"question_id":"q1","question_text":"¿Pregunta ejemplo?","question_type":"single_choice","order_index":1,"is_required":true,"options":[{"option_value":0,"option_label":"No","order_index":1},{"option_value":1,"option_label":"Sí","order_index":2}]}]',
    '{"scoring_method":"sum","min_score":0,"max_score":10,"ranges":[{"min_value":0,"max_value":5,"interpretation_level":"Bajo","interpretation_text":"Puntuación baja","order_index":1}]}',
    '[{"title":"Artículo de ejemplo","authors":["Autor 1","Autor 2"],"year":2023,"reference_type":"original","is_primary":true}]'
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
};

/**
 * CLI interface for mass import
 */
async function runImport() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: npm run import:scales -- <source-file> [options]

Options:
  --validate-only    Only validate, don't import
  --skip-existing    Skip existing scales (default: true)
  --batch-size <n>   Batch size for processing (default: 10)
  --output-dir <dir> Output directory for reports (default: ./import-results)
  --log-level <lvl>  Log level: debug, info, warn, error (default: info)

Examples:
  npm run import:scales -- scales.json
  npm run import:scales -- scales.csv --validate-only
  npm run import:scales -- scales.json --batch-size 5 --log-level debug

Generate CSV template:
  npm run import:template
`);
    process.exit(1);
  }

  try {
    const sourceFile = args[0];
    const options: ImportOptions = {
      sourceFile,
      validateOnly: args.includes('--validate-only'),
      skipExisting: !args.includes('--no-skip-existing'),
      batchSize: parseInt(args[args.indexOf('--batch-size') + 1] || '10'),
      outputDir: args[args.indexOf('--output-dir') + 1] || './import-results',
      logLevel: (args[args.indexOf('--log-level') + 1] as any) || 'info',
    };

    const importer = new MassScaleImporter(options);
    const stats = await importer.import();

    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Total processed: ${stats.totalProcessed}`);
    console.log(`Successful: ${stats.successful}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Validation errors: ${stats.validationErrors}`);
    console.log(`Duplicates: ${stats.duplicates}`);
    console.log(`Success rate: ${stats.totalProcessed > 0 ? ((stats.successful / stats.totalProcessed) * 100).toFixed(2) : 0}%`);
    console.log(`Execution time: ${(stats.executionTime / 1000).toFixed(2)} seconds`);

    if (stats.errors.length > 0) {
      console.log(`\nErrors: ${stats.errors.length} (see report for details)`);
    }

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Generate CSV template
async function generateTemplate() {
  const template = generateCSVTemplate();
  const templatePath = './scales-template.csv';
  
  fs.writeFileSync(templatePath, template);
  console.log(`CSV template generated: ${templatePath}`);
  
  console.log(`
Instructions:
1. Fill in the CSV with your scale data
2. For complex fields (questions, scoring, references), use JSON format
3. Run: npm run import:scales -- scales.csv

Example questions format:
[{"question_id":"q1","question_text":"Question?","question_type":"single_choice","order_index":1,"is_required":true,"options":[{"option_value":0,"option_label":"No","order_index":1}]}]
`);
}

// Handle CLI commands
if (process.argv[2] === 'template') {
  generateTemplate();
} else if (process.argv.length > 2) {
  runImport();
}

export { MassScaleImporter, ImportOptions, ImportStats };