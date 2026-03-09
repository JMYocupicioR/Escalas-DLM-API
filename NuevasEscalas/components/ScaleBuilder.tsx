import React, { useState } from 'react'
import { MedicalScale, ScaleQuestion, ScoringRange, ScaleScoringDomain } from '../medical-scale.schema'
import { Plus, Trash2, GripVertical, Save, Eye, Settings, BookOpen, X, Shield, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { ScaleService } from '../services/ScaleService'
import { ScaleRunner } from './ScaleRunner'
import { TaxonomySelector } from './TaxonomySelector'
import { TaxonomyService } from '../services/TaxonomyService'

interface ScaleBuilderReference {
  id?: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
  pmid?: string
  url?: string
  reference_type: 'original' | 'validation' | 'review' | 'meta-analysis' | 'clinical_trial'
  is_primary: boolean
}

interface ScaleBuilderState {
  name: string
  acronym: string
  description: string
  categories: string[]
  questions: ScaleQuestion[]
  scoring: {
    engine: 'sum' | 'average' | 'json-logic'
    ranges: ScoringRange[]
    domains: ScaleScoringDomain[]
  }
  config: {
    instructions: string
    estimated_time?: number
    original_author?: string
    language: string
    validation_info?: string
    tags: string[]
    bibliography: ScaleBuilderReference[]
  }
  selectedQuestionId: string | null
  taxonomy: {
    categoryIds: string[]
    specialtyIds: string[]
    bodySystemIds: string[]
    populationIds: string[]
    scaleTypeIds: string[]
  }
}

interface ScaleBuilderProps {
  initialScale?: MedicalScale | null;
  onCancel?: () => void;
  onSave?: () => void;
}

export const ScaleBuilder = ({ initialScale, onCancel, onSave }: ScaleBuilderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [taxonomyLoaded, setTaxonomyLoaded] = useState(false);

  const [scale, setScale] = useState<ScaleBuilderState>(() => {
    if (initialScale && initialScale.current_version) {
      const cv = initialScale.current_version;
      // Map existing data to builder state
      return {
        name: initialScale.name,
        acronym: initialScale.acronym || '',
        description: initialScale.description || '',
        categories: initialScale.categories || [],
        questions: cv.questions || [],
        scoring: {
          engine: cv.scoring?.engine || 'sum',
          ranges: cv.scoring?.ranges || [],
          domains: cv.scoring?.domains || []
        },
        config: {
          instructions: cv.config.instructions || '',
          estimated_time: cv.config.estimated_time || 5,
          original_author: cv.config.original_author || '',
          language: cv.config.language || 'es',
          validation_info: cv.config.validation_info || '',
          tags: cv.config.tags || [],
          bibliography: (cv.config.bibliography || []).map((ref: any) => ({
             ...ref,
             reference_type: ref.reference_type || 'original',
             is_primary: ref.is_primary || false,
             authors: Array.isArray(ref.authors) ? ref.authors : [],
          }))
        },
        selectedQuestionId: null,
        taxonomy: {
          categoryIds: [],
          specialtyIds: [],
          bodySystemIds: [],
          populationIds: [],
          scaleTypeIds: []
        }
      };
    }
    // Default empty state
    return {
      name: '',
      acronym: '',
      description: '',
      categories: [],
      questions: [],
      scoring: {
        engine: 'sum',
        ranges: [],
        domains: []
      },
      config: {
        instructions: '',
        estimated_time: 5,
        original_author: '',
        language: 'es',
        validation_info: '',
        tags: [],
        bibliography: []
      },
      selectedQuestionId: null,
      taxonomy: {
        categoryIds: [],
        specialtyIds: [],
        bodySystemIds: [],
        populationIds: [],
        scaleTypeIds: []
      }
    };
  })

  const [newCategory, setNewCategory] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'scoring' | 'scientific'>('edit')
  const [saving, setSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Load taxonomy IDs when editing an existing scale
  React.useEffect(() => {
    if (initialScale?.id && !taxonomyLoaded) {
      TaxonomyService.getScaleTaxonomies(initialScale.id).then(taxonomies => {
        setScale(prev => ({
          ...prev,
          taxonomy: {
            categoryIds: taxonomies.categories.map((c: any) => c.category_id),
            specialtyIds: taxonomies.specialties.map((s: any) => s.specialty_id),
            bodySystemIds: taxonomies.bodySystems.map((b: any) => b.system_id),
            populationIds: taxonomies.populations.map((p: any) => p.population_id),
            scaleTypeIds: taxonomies.scaleTypes.map((t: any) => t.type_id)
          }
        }));
        setTaxonomyLoaded(true);
      }).catch(err => {
        console.error('Error loading taxonomies:', err);
        setTaxonomyLoaded(true);
      });
    }
  }, [initialScale?.id, taxonomyLoaded]);

  const addQuestion = (type: ScaleQuestion['type']) => {
    const newQuestion: ScaleQuestion = {
      id: `q${Date.now()}`,
      type,
      text: 'Nueva pregunta',
      order_index: scale.questions.length,
      options: type === 'single_choice' || type === 'multi_choice' ? [
        { value: 0, label: 'Opción 1', score: 0, order_index: 0 }
      ] : undefined,
      validation: type === 'number' || type === 'slider' ? { min: 0, max: 100, required: true } : undefined
    }
    setScale({ ...scale, questions: [...scale.questions, newQuestion] })
    setActiveTab('edit')
  }

  const updateQuestion = (id: string, updates: Partial<ScaleQuestion>) => {
    setScale({
      ...scale,
      questions: scale.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    })
  }

  const deleteQuestion = (id: string) => {
    setScale({
      ...scale,
      questions: scale.questions.filter(q => q.id !== id),
      selectedQuestionId: null
    })
  }

  const addOption = (questionId: string) => {
    const question = scale.questions.find(q => q.id === questionId)
    if (!question || !question.options) return

    const newOption = {
      value: question.options.length,
      label: `Opción ${question.options.length + 1}`,
      score: 0,
      order_index: question.options.length
    }

    updateQuestion(questionId, {
      options: [...question.options, newOption]
    })
  }

  const updateOption = (questionId: string, optionIndex: number, updates: any) => {
    const question = scale.questions.find(q => q.id === questionId)
    if (!question || !question.options) return

    const newOptions = [...question.options]
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
    updateQuestion(questionId, { options: newOptions })
  }

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = scale.questions.find(q => q.id === questionId)
    if (!question || !question.options) return

    updateQuestion(questionId, {
      options: question.options.filter((_, i) => i !== optionIndex)
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newQuestions = [...scale.questions]
    const draggedItem = newQuestions[draggedIndex]
    newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(index, 0, draggedItem)
    
    newQuestions.forEach((q, idx) => q.order_index = idx)
    
    setScale({ ...scale, questions: newQuestions })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const addCategory = () => {
    if (newCategory && !scale.categories.includes(newCategory)) {
      setScale({ ...scale, categories: [...scale.categories, newCategory] })
      setNewCategory('')
    }
  }

  const removeCategory = (cat: string) => {
    setScale({ ...scale, categories: scale.categories.filter(c => c !== cat) })
  }

  const addScoringRange = () => {
    const newRange: ScoringRange = {
      min: 0,
      max: 10,
      label: 'Nuevo rango',
      interpretation: 'Descripción del rango',
      alert_level: 'low',
      color: '#3b82f6'
    }
    setScale({
      ...scale,
      scoring: {
        ...scale.scoring,
        ranges: [...scale.scoring.ranges, newRange]
      }
    })
  }

  const updateScoringRange = (index: number, updates: Partial<ScoringRange>) => {
    const newRanges = [...scale.scoring.ranges]
    newRanges[index] = { ...newRanges[index], ...updates }
    setScale({
      ...scale,
      scoring: { ...scale.scoring, ranges: newRanges }
    })
  }

  const deleteScoringRange = (index: number) => {
    setScale({
      ...scale,
      scoring: {
        ...scale.scoring,
        ranges: scale.scoring.ranges.filter((_, i) => i !== index)
      }
    })
  }

  const addDomain = () => {
    const newDomain: ScaleScoringDomain = {
      id: `domain_${Date.now()}`,
      label: 'Nuevo Dominio',
      engine: 'sum',
      question_ids: [],
      ranges: []
    }
    setScale({
      ...scale,
      scoring: {
        ...scale.scoring,
        domains: [...scale.scoring.domains, newDomain]
      }
    })
  }

  const updateDomain = (index: number, updates: Partial<ScaleScoringDomain>) => {
    const newDomains = [...scale.scoring.domains]
    newDomains[index] = { ...newDomains[index], ...updates }
    setScale({
      ...scale,
      scoring: { ...scale.scoring, domains: newDomains }
    })
  }

  const deleteDomain = (index: number) => {
    setScale({
      ...scale,
      scoring: {
        ...scale.scoring,
        domains: scale.scoring.domains.filter((_, i) => i !== index)
      }
    })
  }



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const selectedQuestion = scale.questions.find(q => q.id === scale.selectedQuestionId);
    
    if (!file || !selectedQuestion) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedQuestion.id}_${Date.now()}.${fileExt}`;
      const path = `scales/${scale.acronym || 'unnamed'}/${fileName}`;

      const storagePath = await ScaleService.uploadScaleImage(file, path);
      // We store the storage path (e.g., 'scales/acronym/id_timestamp.jpg')
      updateQuestion(selectedQuestion.id, { image_url: storagePath });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
     if (!confirm('¿Estás seguro de que deseas publicar esta escala? Será visible para todos los usuarios.')) return;
     
     await handleSave('active');
  }

  const handleSave = async (status: 'draft' | 'active' = 'draft') => {
    if (!scale.name) {
      alert('Por favor ingresa el nombre de la escala')
      return
    }

    setSaving(true)
    try {
      const scaleId = await ScaleService.publishScale({
        id: initialScale?.id, // Pass ID for updates
        name: scale.name,
        acronym: scale.acronym,
        description: scale.description,
        categories: scale.categories,
        current_version: {
          version_number: initialScale?.current_version?.version_number || '1.0',
          status: status,
          config: scale.config,
          questions: scale.questions,
          scoring: scale.scoring
        }
      })

      // Save taxonomy assignments
      console.log('🔗 [SAVE] Saving taxonomy assignments for scale:', scaleId);
      await Promise.all([
        TaxonomyService.assignCategories(scaleId, scale.taxonomy.categoryIds),
        TaxonomyService.assignSpecialties(scaleId, scale.taxonomy.specialtyIds),
        TaxonomyService.assignBodySystems(scaleId, scale.taxonomy.bodySystemIds),
        TaxonomyService.assignPopulations(scaleId, scale.taxonomy.populationIds),
        TaxonomyService.assignScaleTypes(scaleId, scale.taxonomy.scaleTypeIds)
      ]);
      console.log('✅ [SAVE] Taxonomy assignments saved successfully');

      alert(`✅ Escala ${status === 'active' ? 'publicada' : 'guardada como borrador'} correctamente!`)
      if (onSave) onSave();
    } catch (error: any) {
      console.error(error);
      alert('❌ Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedQuestion = scale.questions.find(q => q.id === scale.selectedQuestionId)

  // Convert to MedicalScale format for preview
  const previewScale = {
    name: scale.name || 'Vista Previa',
    acronym: scale.acronym,
    description: scale.description,
    categories: scale.categories,
    current_version: {
      version_number: '1.0',
      status: 'draft' as const,
      config: scale.config,
      questions: scale.questions,
      scoring: scale.scoring
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbox - Left Panel */}
      <aside className="w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            🧰 Herramientas
          </h2>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium mb-2">TIPOS DE PREGUNTA</p>
            
            <button
              onClick={() => addQuestion('single_choice')}
              className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">🔘</span> Opción Única
            </button>
            
            <button
              onClick={() => addQuestion('multi_choice')}
              className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">☑️</span> Opción Múltiple
            </button>
            
            <button
              onClick={() => addQuestion('slider')}
              className="w-full p-3 text-left bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">📊</span> Escala (Slider)
            </button>
            
            <button
              onClick={() => addQuestion('number')}
              className="w-full p-3 text-left bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg border border-yellow-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">🔢</span> Número
            </button>
            
            <button
              onClick={() => addQuestion('text')}
              className="w-full p-3 text-left bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-lg border border-pink-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">📝</span> Texto Libre
            </button>

            <button
              onClick={() => addQuestion('info')}
              className="w-full p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg border border-gray-200 text-sm font-medium transition-all"
            >
              <span className="text-lg mr-2">ℹ️</span> Información / Imagen
            </button>
          </div>
        </div>
      </aside>

      {/* Canvas - Center Panel */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'edit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Settings className="inline mr-2" size={16} />
                Editar
              </button>
              <button
                onClick={() => setActiveTab('scientific')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'scientific' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="inline mr-2" size={16} />
                Científico
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'scoring' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📊 Scoring
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Eye className="inline mr-2" size={16} />
                Vista Previa
              </button>
            </div>



            <div className="flex gap-2">
                {onCancel && (
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancelar
                    </button>
                )}
                <button 
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2 disabled:bg-gray-400"
                >
                <Save size={18} />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
                </button>
                <button 
                onClick={handlePublish}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:bg-gray-400 shadow-md"
                >
                <Shield size={18} />
                Publicar
                </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'edit' && (
              <>
                {/* Header Info */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h1 className="text-2xl font-bold mb-4">Información General</h1>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre de la Escala *</label>
                      <input
                        type="text"
                        placeholder="Ej: Escala de Glasgow"
                        value={scale.name}
                        onChange={(e) => setScale({ ...scale, name: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Acrónimo</label>
                      <input
                        type="text"
                        placeholder="Ej: GCS"
                        value={scale.acronym}
                        onChange={(e) => setScale({ ...scale, acronym: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      placeholder="Descripción de la escala"
                      value={scale.description}
                      onChange={(e) => setScale({ ...scale, description: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Instrucciones</label>
                    <textarea
                      placeholder="Instrucciones para completar la escala"
                      value={scale.config.instructions}
                      onChange={(e) => setScale({ 
                        ...scale, 
                        config: { ...scale.config, instructions: e.target.value }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categorías</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nueva categoría"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                        className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={addCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scale.categories.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                          {cat}
                          <button 
                            onClick={() => removeCategory(cat)} 
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {scale.questions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
                      <p className="text-lg">👈 Selecciona un tipo de pregunta para comenzar</p>
                    </div>
                  ) : (
                    scale.questions.map((question, index) => (
                      <div
                        key={question.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-lg shadow-md p-4 cursor-move transition-all ${
                          scale.selectedQuestionId === question.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        } ${draggedIndex === index ? 'opacity-50' : ''}`}
                        onClick={() => setScale({ ...scale, selectedQuestionId: question.id })}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <GripVertical size={20} className="text-gray-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                  {question.type.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id) }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <p className="font-medium text-gray-900 mb-2">{question.text}</p>
                            
                            {question.options && (
                              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                {question.options.map((opt, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">
                                      {opt.score}
                                    </span>
                                    {opt.label}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'scientific' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="text-blue-600" />
                  Información Científica y Bibliografía
                </h2>

                {/* Taxonomy Selectors */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">📚 Clasificación Médica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TaxonomySelector
                      type="categories"
                      label="Categorías Médicas"
                      selected={scale.taxonomy.categoryIds}
                      onChange={(ids) => setScale({
                        ...scale,
                        taxonomy: { ...scale.taxonomy, categoryIds: ids }
                      })}
                      multiple={true}
                    />
                    <TaxonomySelector
                      type="specialties"
                      label="Especialidades"
                      selected={scale.taxonomy.specialtyIds}
                      onChange={(ids) => setScale({
                        ...scale,
                        taxonomy: { ...scale.taxonomy, specialtyIds: ids }
                      })}
                      multiple={true}
                    />
                    <TaxonomySelector
                      type="bodySystems"
                      label="Sistemas Corporales"
                      selected={scale.taxonomy.bodySystemIds}
                      onChange={(ids) => setScale({
                        ...scale,
                        taxonomy: { ...scale.taxonomy, bodySystemIds: ids }
                      })}
                      multiple={true}
                    />
                    <TaxonomySelector
                      type="populations"
                      label="Población Objetivo"
                      selected={scale.taxonomy.populationIds}
                      onChange={(ids) => setScale({
                        ...scale,
                        taxonomy: { ...scale.taxonomy, populationIds: ids }
                      })}
                      multiple={true}
                    />
                    <TaxonomySelector
                      type="scaleTypes"
                      label="Tipos de Escala"
                      selected={scale.taxonomy.scaleTypeIds}
                      onChange={(ids) => setScale({
                        ...scale,
                        taxonomy: { ...scale.taxonomy, scaleTypeIds: ids }
                      })}
                      multiple={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autor Original</label>
                      <input
                        type="text"
                        placeholder="Ej: Marshall J. Folstein"
                        value={scale.config.original_author}
                        onChange={(e) => setScale({
                          ...scale,
                          config: { ...scale.config, original_author: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                      <select
                        value={scale.config.language}
                        onChange={(e) => setScale({
                          ...scale,
                          config: { ...scale.config, language: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                        <option value="fr">Francés</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Información de Validación</label>
                    <textarea
                      placeholder="Ej: Validada en población mexicana (Reyes et al., 2004)"
                      value={scale.config.validation_info}
                      onChange={(e) => setScale({
                        ...scale,
                        config: { ...scale.config, validation_info: e.target.value }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-[108px]"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Referencias Bibliográficas</h3>
                    <button
                      onClick={() => {
                        const newRef: ScaleBuilderReference = {
                          title: '',
                          authors: [],
                          year: new Date().getFullYear(),
                          reference_type: 'original',
                          is_primary: scale.config.bibliography.length === 0
                        }
                        setScale({
                          ...scale,
                          config: { ...scale.config, bibliography: [...scale.config.bibliography, newRef] }
                        })
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Añadir Referencia
                    </button>
                  </div>

                  <div className="space-y-4">
                    {scale.config.bibliography.map((ref, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                        <button
                          onClick={() => {
                            const newRefs = scale.config.bibliography.filter((_, i) => i !== idx)
                            setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                          }}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8">
                            <label className="block text-xs font-bold text-gray-500 mb-1">TÍTULO DEL ARTÍCULO / LIBRO</label>
                            <input
                              type="text"
                              value={ref.title}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].title = e.target.value
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                              placeholder="Ej: Mini-mental state: a practical method..."
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">AÑO</label>
                            <input
                              type="number"
                              value={ref.year}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].year = Number(e.target.value)
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">TIPO</label>
                            <select
                              value={ref.reference_type}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].reference_type = e.target.value as any
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                            >
                              <option value="original">Original</option>
                              <option value="validation">Validación</option>
                              <option value="review">Revisión</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 mb-1">AUTORES (SEPARADOS POR COMA)</label>
                            <input
                              type="text"
                              value={ref.authors.join(', ')}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].authors = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                              placeholder="Folstein MF, Folstein SE, McHugh PR"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-gray-500 mb-1">REVISTA / EDITORIAL</label>
                            <input
                              type="text"
                              value={ref.journal}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].journal = e.target.value
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1">DOI</label>
                            <input
                              type="text"
                              value={ref.doi}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].doi = e.target.value
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                              placeholder="10.1016/..."
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1">PMID (PubMed ID)</label>
                            <input
                              type="text"
                              value={ref.pmid}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].pmid = e.target.value
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                              placeholder="1202031"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1">URL EXTERNA</label>
                            <input
                              type="text"
                              value={ref.url}
                              onChange={(e) => {
                                const newRefs = [...scale.config.bibliography]
                                newRefs[idx].url = e.target.value
                                setScale({ ...scale, config: { ...scale.config, bibliography: newRefs } })
                              }}
                              className="w-full p-2 border rounded bg-white text-sm"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {scale.config.bibliography.length === 0 && (
                      <div className="py-12 border-2 border-dashed rounded-xl text-center text-gray-400">
                        No hay referencias registradas. Haz clic en "Añadir Referencia" para comenzar.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scoring' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Configuración de Scoring</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Motor de Scoring</label>
                  <select
                    value={scale.scoring.engine}
                    onChange={(e) => setScale({
                      ...scale,
                      scoring: { ...scale.scoring, engine: e.target.value as any }
                    })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="sum">Suma de Puntos</option>
                    <option value="average">Promedio</option>
                    <option value="json-logic">Lógica Personalizada (JSON Logic)</option>
                  </select>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Rangos de Interpretación</h3>
                  <button
                    onClick={addScoringRange}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Añadir Rango
                  </button>
                </div>

                <div className="space-y-3">
                  {scale.scoring.ranges.map((range, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium">Rango {index + 1}</span>
                        <button
                          onClick={() => deleteScoringRange(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Min</label>
                          <input
                            type="number"
                            value={range.min}
                            onChange={(e) => updateScoringRange(index, { min: Number(e.target.value) })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Max</label>
                          <input
                            type="number"
                            value={range.max}
                            onChange={(e) => updateScoringRange(index, { max: Number(e.target.value) })}
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Color</label>
                          <input
                            type="color"
                            value={range.color}
                            onChange={(e) => updateScoringRange(index, { color: e.target.value })}
                            className="w-full h-10 border rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Etiqueta</label>
                        <input
                          type="text"
                          value={range.label}
                          onChange={(e) => updateScoringRange(index, { label: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Interpretación</label>
                        <textarea
                          value={range.interpretation}
                          onChange={(e) => updateScoringRange(index, { interpretation: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {scale.scoring.ranges.length === 0 && (
                    <p className="text-center text-gray-400 py-8">
                      No hay rangos definidos. Añade uno para comenzar.
                    </p>
                  )}
                </div>

                {/* Domains / Sub-scales Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Dominios / Sub-escalas</h3>
                      <p className="text-sm text-gray-500">Define sub-escalas para calcular puntajes independientes (ej: "Dolor", "Función").</p>
                    </div>
                    <button
                      onClick={addDomain}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                    >
                      <Plus size={18} />
                      Añadir Dominio
                    </button>
                  </div>

                  <div className="space-y-6">
                    {scale.scoring.domains.map((domain, dIndex) => (
                      <div key={dIndex} className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-6 border-b border-indigo-100 pb-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre del Dominio</label>
                                <input
                                    type="text"
                                    value={domain.label}
                                    onChange={(e) => updateDomain(dIndex, { label: e.target.value })}
                                    className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                    placeholder="Ej: Severidad de Síntomas"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">ID (Clave interna)</label>
                                <input
                                    type="text"
                                    value={domain.id}
                                    onChange={(e) => updateDomain(dIndex, { id: e.target.value })}
                                    className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                    placeholder="Ej: sss"
                                />
                            </div>
                          </div>
                          <button
                            onClick={() => deleteDomain(dIndex)}
                            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar Dominio"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Preguntas Asociadas</label>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto shadow-inner">
                                    {scale.questions.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic text-center py-4">No hay preguntas disponibles</p>
                                    ) : (
                                        scale.questions.map(q => (
                                            <label key={q.id} className="flex items-start gap-3 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={domain.question_ids.includes(q.id)}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked 
                                                            ? [...domain.question_ids, q.id]
                                                            : domain.question_ids.filter(id => id !== q.id);
                                                        updateDomain(dIndex, { question_ids: newIds });
                                                    }}
                                                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <span className="text-sm leading-snug">
                                                    <span className="font-mono text-gray-400 text-xs mr-2 inline-block bg-gray-100 px-1 rounded">[{q.id}]</span>
                                                    {q.text}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Selecciona las preguntas que contribuyen a este puntaje.</p>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Motor de Scoring</label>
                                    <select
                                            value={domain.engine}
                                            onChange={(e) => updateDomain(dIndex, { engine: e.target.value as any })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="sum">Suma de Puntos</option>
                                            <option value="average">Promedio</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">Rangos del Dominio</label>
                                        <button
                                            onClick={() => {
                                                const newRange: ScoringRange = { min: 0, max: 10, label: 'Rango', interpretation: '', alert_level: 'low', color: '#6366f1' }; 
                                                const newRanges = [...(domain.ranges || []), newRange];
                                                updateDomain(dIndex, { ranges: newRanges });
                                            }}
                                            className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-50 font-medium transition-colors"
                                        >
                                            + Añadir Rango
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {(domain.ranges || []).map((range, rIndex) => (
                                            <div key={rIndex} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 text-sm">
                                                <div className="col-span-2">
                                                    <input type="number" placeholder="Min" value={range.min} onChange={(e) => {
                                                        const newRanges = [...(domain.ranges || [])];
                                                        newRanges[rIndex] = { ...range, min: Number(e.target.value) };
                                                        updateDomain(dIndex, { ranges: newRanges });
                                                    }} className="w-full p-1.5 border border-gray-200 rounded bg-gray-50 text-center" title="Mínimo" />
                                                </div>
                                                <div className="col-span-2">
                                                    <input type="number" placeholder="Max" value={range.max} onChange={(e) => {
                                                        const newRanges = [...(domain.ranges || [])];
                                                        newRanges[rIndex] = { ...range, max: Number(e.target.value) };
                                                        updateDomain(dIndex, { ranges: newRanges });
                                                    }} className="w-full p-1.5 border border-gray-200 rounded bg-gray-50 text-center" title="Máximo" />
                                                </div>
                                                <div className="col-span-3">
                                                    <input type="text" placeholder="Etiqueta" value={range.label} onChange={(e) => {
                                                        const newRanges = [...(domain.ranges || [])];
                                                        newRanges[rIndex] = { ...range, label: e.target.value };
                                                        updateDomain(dIndex, { ranges: newRanges });
                                                    }} className="w-full p-1.5 border border-gray-200 rounded" />
                                                </div>
                                                <div className="col-span-4">
                                                    <input type="text" placeholder="Interpretación" value={range.interpretation} onChange={(e) => {
                                                        const newRanges = [...(domain.ranges || [])];
                                                        newRanges[rIndex] = { ...range, interpretation: e.target.value };
                                                        updateDomain(dIndex, { ranges: newRanges });
                                                    }} className="w-full p-1.5 border border-gray-200 rounded" />
                                                </div>
                                                <div className="col-span-1 text-center">
                                                    <button onClick={() => {
                                                        const newRanges = (domain.ranges || []).filter((_, i) => i !== rIndex);
                                                        updateDomain(dIndex, { ranges: newRanges });
                                                    }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!domain.ranges || domain.ranges.length === 0) && (
                                            <div className="text-xs text-center text-gray-400 italic py-2 border border-dashed rounded bg-gray-50">
                                                Sin rangos definidos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                    ))}
                    
                    {scale.scoring.domains.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <div className="text-gray-400 mb-2">
                                <Settings size={48} className="mx-auto opacity-20" />
                            </div>
                            <h4 className="text-gray-600 font-medium">No hay dominios definidos</h4>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                La escala usará solo el puntaje global. Añade dominios si necesitas sub-escalas independientes (ej: Cognitivo, Motor).
                            </p>
                            <button
                                onClick={addDomain}
                                className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium inline-flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} />
                                Añadir primer dominio
                            </button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Vista Previa</h2>
                {scale.questions.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">
                    Añade preguntas para ver la vista previa
                  </p>
                ) : (
                  <ScaleRunner 
                    scaleData={previewScale}
                    onSubmit={(data) => console.log('Preview submit:', data)}
                    readOnly={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Properties Panel - Right */}
      <aside className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            ⚙️ Propiedades
          </h2>
          
          {!selectedQuestion ? (
            <p className="text-gray-400 text-sm">Selecciona una pregunta para editar sus propiedades</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Texto de la Pregunta</label>
                <textarea
                  value={selectedQuestion.text}
                  onChange={(e) => updateQuestion(selectedQuestion.id, { text: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción/Ayuda (Opcional)</label>
                <textarea
                  value={selectedQuestion.description || ''}
                  onChange={(e) => updateQuestion(selectedQuestion.id, { description: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Instrucciones adicionales..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Imagen de la Pregunta (Opcional)</label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="URL o ruta de almacenamiento"
                      value={selectedQuestion.image_url || ''}
                      onChange={(e) => updateQuestion(selectedQuestion.id, { image_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload-input')?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    Subir
                  </button>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {selectedQuestion.image_url && (
                  <div className="relative rounded-lg border bg-gray-50 overflow-hidden mb-2 group">
                    <img 
                      src={ScaleService.getPublicUrl(selectedQuestion.image_url)} 
                      alt="Vista previa" 
                      className="w-full h-32 object-contain"
                    />
                    <button
                      onClick={() => updateQuestion(selectedQuestion.id, { image_url: '' })}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {selectedQuestion.type === 'info' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Este tipo de pregunta se utiliza para mostrar instrucciones o imágenes sin requerir respuesta del usuario.
                  </p>
                )}
              </div>

              {/* Validation for number/slider */}
              {/* Validation for number/slider */}
              {(selectedQuestion.type === 'number' || selectedQuestion.type === 'slider') && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Mín</label>
                    <input
                      type="number"
                      value={selectedQuestion.validation?.min || 0}
                      onChange={(e) => updateQuestion(selectedQuestion.id, {
                        validation: { ...selectedQuestion.validation, min: Number(e.target.value), required: true }
                      })}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Máx</label>
                    <input
                      type="number"
                      value={selectedQuestion.validation?.max || 100}
                      onChange={(e) => updateQuestion(selectedQuestion.id, {
                        validation: { ...selectedQuestion.validation, max: Number(e.target.value), required: true }
                      })}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Options Editor */}
              {(selectedQuestion.type === 'single_choice' || selectedQuestion.type === 'multi_choice') && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-gray-700">Opciones de Respuesta</label>
                    <button
                      onClick={() => addOption(selectedQuestion.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                    >
                      + Añadir Opción
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedQuestion.options?.map((opt, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative group">
                        <button
                            onClick={() => deleteOption(selectedQuestion.id, index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Eliminar opción"
                          >
                            <Trash2 size={14} />
                        </button>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Texto de la opción</label>
                                <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => updateOption(selectedQuestion.id, index, { label: e.target.value })}
                                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Ej: Independiente"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Valor (Puntos)</label>
                                    <input
                                    type="number"
                                    value={opt.score}
                                    onChange={(e) => updateOption(selectedQuestion.id, index, { score: Number(e.target.value), value: Number(e.target.value) })}
                                    className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Orden</label>
                                    <input
                                    type="number"
                                    value={opt.order_index ?? index}
                                    readOnly
                                    className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                      </div>
                    ))}
                    {(!selectedQuestion.options || selectedQuestion.options.length === 0) && (
                        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                            No hay opciones. Añade una para empezar.
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
