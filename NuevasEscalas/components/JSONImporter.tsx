import { useState } from 'react'
import { MedicalScaleSchema, MedicalScale } from '../medical-scale.schema'
import { ScaleService } from '../services/ScaleService'
import { ScaleRunner } from './ScaleRunner'
import { Upload, CheckCircle, XCircle, AlertCircle, FileJson, Eye, Download, Info, Clock, BookOpen, Shield, TrendingUp } from 'lucide-react'

interface ValidationResult {
  valid: boolean
  data?: MedicalScale
  errors?: any
  message: string
}

export const JSONImporter = () => {
  const [jsonInput, setJsonInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [importAsPublished, setImportAsPublished] = useState(false)

  const handleValidate = () => {
    console.log('\n📋 [JSON_VALIDATOR] === VALIDANDO JSON ===');
    
    try {
      console.log('🔍 [JSON_VALIDATOR] Parseando JSON...');
      const parsed = JSON.parse(jsonInput);
      console.log('✅ [JSON_VALIDATOR] JSON parseado correctamente');
      console.log('📦 [JSON_VALIDATOR] Datos parseados:', JSON.stringify(parsed, null, 2));
      
      console.log('🔍 [JSON_VALIDATOR] Validando con Zod schema...');
      const result = MedicalScaleSchema.safeParse(parsed);
      
      if (result.success) {
        console.log('✅ [JSON_VALIDATOR] Validación exitosa!');
        console.log('👍 [JSON_VALIDATOR] Datos validados:', result.data.name);
        console.log('📊 [JSON_VALIDATOR] Preguntas:', result.data.current_version?.questions.length);
        console.log('📊 [JSON_VALIDATOR] Opciones por pregunta:', result.data.current_version?.questions.map((q, i) => `Q${i+1}: ${q.options?.length || 0} opciones`));
        
        setValidationResult({ 
          valid: true, 
          data: result.data, 
          errors: [], 
          message: '✅ JSON válido y listo para importar' 
        });
        setShowPreview(true);
      } else {
        console.error('❌ [JSON_VALIDATOR] Errores de validación:');
        const formattedErrors = formatZodErrors(result.error.format());
        formattedErrors.forEach(err => console.error(`   • ${err}`));
        setValidationResult({ 
          valid: false, 
          errors: formattedErrors, 
          data: undefined, 
          message: '❌ Errores de validación encontrados' 
        });
        setShowPreview(false);
      }
    } catch (e: any) {
      console.error('❌ [JSON_VALIDATOR] Error al parsear JSON:', e);
      setValidationResult({
        valid: false,
        message: '❌ JSON inválido: ' + e.message
      })
      setShowPreview(false)
    }
  }

  const formatZodErrors = (errors: any): string[] => {
    const messages: string[] = []
    
    const traverse = (obj: any, path: string = '') => {
      if (obj._errors && obj._errors.length > 0) {
        messages.push(`${path}: ${obj._errors.join(', ')}`)
      }
      
      Object.keys(obj).forEach(key => {
        if (key !== '_errors' && typeof obj[key] === 'object') {
          traverse(obj[key], path ? `${path}.${key}` : key)
        }
      })
    }
    
    traverse(errors)
    return messages
  }

  const handleImport = async () => {
    if (!validationResult?.valid || !validationResult.data) return
    
    console.log('\n🚀 [IMPORT] === INICIANDO IMPORTACIÓN ===');
    setImporting(true)
    try {
      // Set status based on user preference
      const scaleToImport = { ...validationResult.data }
      if (scaleToImport.current_version) {
        scaleToImport.current_version.status = importAsPublished ? 'active' : 'draft'
      }
      
      console.log('📦 [IMPORT] Datos a importar:', scaleToImport.name);
      console.log('📊 [IMPORT] Preguntas:', scaleToImport.current_version?.questions.length);
      console.log('📊 [IMPORT] Opciones totales:', scaleToImport.current_version?.questions.reduce((acc, q) => acc + (q.options?.length || 0), 0));
      console.log('📊 [IMPORT] Scoring engine:', scaleToImport.current_version?.scoring?.engine);
      console.log('📊 [IMPORT] Scoring ranges:', scaleToImport.current_version?.scoring?.ranges?.length || 0);
      console.log('📊 [IMPORT] Scoring ranges detail:', JSON.stringify(scaleToImport.current_version?.scoring?.ranges, null, 2));
      
      const scaleId = await ScaleService.publishScale(scaleToImport)
      
      console.log('✅ [IMPORT] Importación completada exitosamente!');
      console.log('🆔 [IMPORT] Scale ID:', scaleId);
      alert('✅ Escala importada correctamente a Supabase')
      
      // Reset
      setJsonInput('')
      setValidationResult(null)
      setShowPreview(false)
      setImporting(false)
    } catch (error) {
      console.error('❌ [IMPORT] Error durante la importación:', error);
      alert('❌ Error: ' + (error as Error).message)
      setImporting(false)
    }
  }

  const loadExample = () => {
    const example: MedicalScale = {
      name: "Mini-Mental State Examination",
      acronym: "MMSE",
      description: "Evaluación cognitiva breve para detectar deterioro cognitivo",
      categories: ["Neurología", "Geriatría"],
      current_version: {
        version_number: "1.0",
        status: "draft",
        config: {
          instructions: "Realizar en ambiente tranquilo, sin interrupciones. Tiempo aproximado: 10 minutos.",
          estimated_time: 10,
          original_author: "Marshall J. Folstein",
          language: "es",
          tags: ["Cognición", "Detección"],
          validation_info: "Validada en población mexicana (Reyes et al., 2004)",
          bibliography: [
            {
              title: "Mini-mental state: a practical method for grading the cognitive state of patients for the clinician",
              authors: ["Folstein MF", "Folstein SE", "McHugh PR"],
              year: 1975,
              journal: "Journal of Psychiatric Research",
              doi: "10.1016/0022-3956(75)90026-6",
              pmid: "1202031",
              reference_type: "original",
              is_primary: true
            }
          ]
        },
        questions: [
          {
            id: "orientacion_temporal",
            text: "¿En qué año estamos?",
            type: "single_choice",
            order_index: 1,
            description: "Orientación temporal",
            options: [
              { value: 0, label: "Incorrecto", score: 0, order_index: 0 },
              { value: 1, label: "Correcto", score: 1, order_index: 1 }
            ]
          },
          {
            id: "memoria_inmediata",
            text: "Repetir 3 palabras: CASA, ÁRBOL, AVIÓN",
            type: "number",
            order_index: 2,
            description: "Número de palabras recordadas correctamente",
            validation: {
              min: 0,
              max: 3,
              required: true
            },
            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Unofficial_JavaScript_logo_2.svg/1200px-Unofficial_JavaScript_logo_2.svg.png"
          },
          {
            id: "atencion_calculo",
            text: "Restar 7 desde 100 (5 veces)",
            type: "slider",
            order_index: 3,
            description: "Número de restas correctas",
            validation: {
              min: 0,
              max: 5,
              required: true
            }
          }
        ],
        scoring: {
          engine: "sum",
          ranges: [
            {
              min: 0,
              max: 9,
              label: "Deterioro Severo",
              interpretation: "Deterioro cognitivo severo. Requiere evaluación completa.",
              alert_level: "critical",
              color: "#dc2626"
            },
            {
              min: 10,
              max: 20,
              label: "Deterioro Moderado",
              interpretation: "Deterioro cognitivo moderado. Valorar intervención.",
              alert_level: "high",
              color: "#ea580c"
            },
            {
              min: 21,
              max: 24,
              label: "Deterioro Leve",
              interpretation: "Deterioro cognitivo leve. Seguimiento recomendado.",
              alert_level: "medium",
              color: "#f59e0b"
            },
            {
              min: 25,
              max: 27,
              label: "Límite Normal",
              interpretation: "Puntuación en límite normal. Considerar factores educativos.",
              alert_level: "low",
              color: "#84cc16"
            },
            {
              min: 28,
              max: 30,
              label: "Normal",
              interpretation: "Función cognitiva normal.",
              alert_level: "none",
              color: "#22c55e"
            }
          ]
        }
      }
    }
    setJsonInput(JSON.stringify(example, null, 2))
  }

  const downloadTemplate = () => {
    const template = {
      name: "NOMBRE_DE_LA_ESCALA (Requerido)",
      acronym: "SIGLAS (Opcional)",
      description: "Descripción detallada del propósito, población objetivo y utilidad clínica de la escala.",
      categories: ["Categoría 1", "Categoría 2"],
      current_version: {
        version_number: "1.0",
        status: "draft",
        config: {
          language: "es",
          original_author: "Nombre del Autor Original",
          estimated_time: 10,
          instructions: "Instrucciones claras para el evaluador sobre cómo administrar la prueba.",
          validation_info: "Información sobre validación (ej: Validada en población X en el año Y).",
          tags: ["Tag1", "Tag2"],
          bibliography: [
            {
              title: "Título del Artículo Principal",
              authors: ["Autor A", "Autor B"],
              year: 2023,
              journal: "Nombre de la Revista",
              url: "https://doi.org/ejemplo",
              reference_type: "original",
              is_primary: true
            }
          ]
        },
        questions: [
          {
            id: "p1_ejemplo_seleccion_unica",
            type: "single_choice",
            order_index: 1,
            text: "¿Pregunta de selección única?",
            description: "Descripción adicional o instrucción para esta pregunta.",
            options: [
              { "value": 0, "label": "Opción A (0 puntos)", "score": 0, "order_index": 0 },
              { "value": 1, "label": "Opción B (1 punto)", "score": 1, "order_index": 1 }
            ],
            validation: { "required": true }
          },
          {
            id: "p2_ejemplo_numerico",
            type: "number",
            order_index: 2,
            text: "¿Pregunta numérica (ej: Edad)?",
            validation: { "required": true, "min": 0, "max": 100 }
          },
          {
            id: "p3_ejemplo_condicional",
            type: "text",
            order_index: 3,
            text: "Esta pregunta solo aparece si P1 es Opción B (score 1)",
            logic: [
              {
                "action": "SHOW",
                "target_question_id": "p3_ejemplo_condicional",
                "condition": { "==": [{ "var": "p1_ejemplo_seleccion_unica" }, 1] }
              }
            ]
          }
        ],
        scoring: {
          engine: "sum",
          ranges: [
            {
              min: 0,
              max: 5,
              label: "Rango Bajo / Normal",
              interpretation: "Interpretación para puntaje bajo.",
              alert_level: "none",
              color: "#22c55e"
            },
            {
              min: 6,
              max: 10,
              label: "Rango Alto / Patológico",
              interpretation: "Interpretación para puntaje alto.",
              alert_level: "high",
              color: "#dc2626"
            }
          ]
        }
      }
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'escala-template.json'
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileJson size={32} className="text-blue-600" />
            Importador de Escalas JSON
          </h1>
          <p className="text-gray-600 mt-2">
            Importa escalas médicas desde archivos JSON validados con el esquema Zod.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Download size={18} />
          Descargar Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Upload size={20} />
              JSON de Entrada
            </h2>
            <button
              onClick={loadExample}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
            >
              Cargar Ejemplo (MMSE)
            </button>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder='Pega aquí tu JSON o haz clic en "Cargar Ejemplo"...'
          />

          {/* Opción de publicación directa */}
          {validationResult?.valid && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="checkbox"
                id="importAsActive"
                checked={importAsPublished}
                onChange={(e) => setImportAsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="importAsActive" className="text-sm font-medium text-blue-900 cursor-pointer flex-1">
                Publicar inmediatamente (visible en el catálogo público)
              </label>
              <Shield size={16} className="text-blue-500 opacity-70" />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleValidate}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Validar JSON
            </button>
            <button
              onClick={handleImport}
              disabled={!validationResult?.valid || importing}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {importing ? 'Importando...' : 'Importar a Supabase'}
            </button>
          </div>
        </div>

        {/* Validation Results Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {validationResult?.valid ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : validationResult ? (
              <XCircle size={20} className="text-red-600" />
            ) : (
              <AlertCircle size={20} className="text-gray-400" />
            )}
            Resultado de Validación
          </h2>
          
          {!validationResult ? (
            <div className="text-center text-gray-400 py-12">
              <FileJson size={48} className="mx-auto mb-3 opacity-50" />
              <p>Pega un JSON y haz clic en "Validar JSON"</p>
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-lg mb-4 ${
                validationResult.valid 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <p className={`font-medium flex items-center gap-2 ${
                  validationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.valid ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  {validationResult.message}
                </p>
              </div>

              {validationResult.valid && validationResult.data && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border">
                    <span className="font-medium text-sm text-gray-600">Nombre:</span>
                    <p className="text-gray-900 mt-1">{validationResult.data.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="font-medium text-sm text-gray-600">Acrónimo:</span>
                      <p className="text-gray-900 mt-1">{validationResult.data.acronym || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="font-medium text-sm text-gray-600">Versión:</span>
                      <p className="text-gray-900 mt-1">{validationResult.data.current_version?.version_number}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border">
                    <span className="font-medium text-sm text-gray-600">Preguntas:</span>
                    <p className="text-gray-900 mt-1">
                      {validationResult.data.current_version?.questions.length || 0} preguntas configuradas
                    </p>
                    {validationResult.data.current_version?.questions && validationResult.data.current_version.questions.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {validationResult.data.current_version.questions.slice(0, 5).map((q: any, i: number) => (
                                <div key={i} className="text-xs text-gray-600 truncate bg-white p-1 rounded border border-gray-100 flex gap-2">
                                    <span className="font-bold text-gray-400">{i + 1}.</span>
                                    <span>{q.text}</span>
                                </div>
                            ))}
                            {validationResult.data.current_version.questions.length > 5 && (
                                <p className="text-xs text-blue-500 italic pl-1">
                                    ... y {validationResult.data.current_version.questions.length - 5} más
                                </p>
                            )}
                        </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 rounded border col-span-2">
                    <span className="font-medium text-sm text-gray-600 block mb-1">Descripción:</span>
                    <p className="text-gray-900 text-sm">{validationResult.data.description || 'Sin descripción'}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded border col-span-2">
                    <span className="font-medium text-sm text-gray-600 block mb-1">Configuración:</span>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>{validationResult.data.current_version?.config.estimated_time || '?'} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-gray-400" />
                            <span>{validationResult.data.current_version?.config.original_author || 'Autor desconocido'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info size={16} className="text-gray-400" />
                            <span>{validationResult.data.current_version?.config.language === 'es' ? 'Español' : 'Otro'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                             {validationResult.data.current_version?.config.tags?.join(', ') || 'Sin tags'}
                           </span>
                        </div>
                    </div>
                    {validationResult.data.current_version?.config.instructions && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                             <p className="text-gray-600 italic text-xs">"{validationResult.data.current_version.config.instructions}"</p>
                        </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded border col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-blue-600" />
                        <span className="font-medium text-sm text-gray-600">Rangos de Puntuación:</span>
                    </div>
                    <div className="space-y-2">
                        {validationResult.data.current_version?.scoring.ranges?.map((range: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs border-l-2 pl-2" style={{ borderColor: range.color }}>
                                <span>{range.label} ({range.min}-{range.max})</span>
                                <span className="text-gray-500 truncate max-w-[150px]" title={range.interpretation}>{range.interpretation}</span>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border col-span-2">
                     <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-purple-600" />
                        <span className="font-medium text-sm text-gray-600">Bibliografía:</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                        {validationResult.data.current_version?.config.bibliography?.map((ref: any, idx: number) => (
                            <li key={idx} className="truncate" title={ref.title}>
                                {ref.title} ({ref.year})
                            </li>
                        ))}
                        {!validationResult.data.current_version?.config.bibliography?.length && <li>Sin referencias</li>}
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <span className="font-medium text-sm text-gray-600">Categorías:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {validationResult.data.categories.map((cat: string) => (
                        <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye size={18} />
                    {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
                  </button>
                </div>
              )}

              {!validationResult.valid && validationResult.errors && (
                <div className="mt-4">
                  <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Errores de Validación:
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-64 overflow-auto">
                    <ul className="space-y-1 text-sm text-red-800">
                      {validationResult.errors.map((error: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">•</span>
                          <span className="font-mono">{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && validationResult?.valid && validationResult.data && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Eye size={24} />
            Vista Previa Interactiva
          </h2>
          <div className="border-t pt-4">
            <ScaleRunner 
              scaleData={validationResult.data}
              onSubmit={(data) => console.log('Preview submit:', data)}
              readOnly={false}
            />
          </div>
        </div>
      )}

      {/* Schema Documentation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
          📚 Referencia del Esquema
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Tipos de Pregunta Soportados:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">single_choice</code> - Opción única</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">multi_choice</code> - Opción múltiple</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">slider</code> - Escala deslizable</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">number</code> - Número</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">text</code> - Texto libre</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">date</code> - Fecha</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Motores de Scoring:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">sum</code> - Suma de puntos</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">average</code> - Promedio</li>
              <li>• <code className="bg-blue-100 px-2 py-0.5 rounded">json-logic</code> - Lógica personalizada</li>
            </ul>
          </div>
        </div>
        <p className="text-blue-800 mt-4">
          📖 Consulta <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">medical-scale.schema.ts</code> para la estructura completa del esquema.
        </p>
      </div>
    </div>
  )
}
