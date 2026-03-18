import { useState, useEffect } from 'react'
import { MedicalScale } from '../medical-scale.schema'
import { ScaleService } from '../services/ScaleService'
import { ScaleRunner } from './ScaleRunner'
import { Search, Filter, Play, Eye, Clock, TrendingUp, BookOpen, Loader, Plus, Shield, Settings, Trash2 } from 'lucide-react'

interface ScaleBrowserProps {
  isAdmin?: boolean;
  onAddScale?: () => void;
  onEdit?: (scale: MedicalScale) => void;
}

export const ScaleBrowser = ({ isAdmin, onAddScale, onEdit }: ScaleBrowserProps) => {
  const [scales, setScales] = useState<MedicalScale[]>([])
  const [filteredScales, setFilteredScales] = useState<MedicalScale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedScale, setSelectedScale] = useState<MedicalScale | null>(null)
  const [viewMode, setViewMode] = useState<'catalog' | 'detail' | 'evaluate'>('catalog')

  // Extract unique categories
  const categories = Array.from(
    new Set(scales.flatMap(scale => scale.categories || []))
  ).sort()

  useEffect(() => {
    loadScales()
  }, [])

  useEffect(() => {
    filterScales()
  }, [searchQuery, selectedCategory, scales])

  const loadScales = async () => {
    setLoading(true)
    try {
      const data = isAdmin ? await ScaleService.getScales() : await ScaleService.getPublishedScales()
      setScales(data)
    } catch (error) {
      console.error('Error loading scales:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterScales = () => {
    let filtered = scales

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(scale =>
        scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scale.acronym?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scale.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scale =>
        scale.categories?.includes(selectedCategory)
      )
    }

    setFilteredScales(filtered)
  }

  const handleViewDetails = (scale: MedicalScale) => {
    setSelectedScale(scale)
    setViewMode('detail')
  }

  const handleEvaluate = (scale: MedicalScale) => {
    setSelectedScale(scale)
    setViewMode('evaluate')
  }

  const handleBackToCatalog = () => {
    setViewMode('catalog')
    setSelectedScale(null)
  }

  const handleDelete = async (scale: MedicalScale) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la escala "${scale.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      if (scale.id) {
        await ScaleService.deleteScale(scale.id);
        // Refresh list
        loadScales();
        alert('✅ Escala eliminada correctamente');
      }
    } catch (error: any) {
      console.error('Error deleting scale:', error);
      alert('❌ Error al eliminar: ' + error.message);
    }
  }

  const getScoreRange = (scale: MedicalScale) => {
    const ranges = scale.current_version?.scoring?.ranges || []
    if (ranges.length === 0) return 'N/A'
    const min = Math.min(...ranges.map((r: any) => r.min))
    const max = Math.max(...ranges.map((r: any) => r.max))
    return `${min}-${max}`
  }

  if (viewMode === 'detail' && selectedScale) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10 shadow">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={handleBackToCatalog}
              className="text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-1"
            >
              <span>←</span> Volver al catálogo
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{selectedScale.name}</h1>
            {selectedScale.acronym && (
              <p className="text-lg text-gray-600">({selectedScale.acronym})</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Metadata Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-blue-600" size={24} />
                <h3 className="font-semibold text-gray-700">Categorías</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedScale.categories?.length ? selectedScale.categories.map((cat: string) => (
                  <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {cat}
                  </span>
                )) : (
                  <span className="text-gray-400 text-sm">Sin categorías</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-600" size={24} />
                <h3 className="font-semibold text-gray-700">Rango de Puntuación</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{getScoreRange(selectedScale)}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-purple-600" size={24} />
                <h3 className="font-semibold text-gray-700">Tiempo Estimado</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {selectedScale.current_version?.config?.estimated_time || '5'} min
              </p>
            </div>
          </div>

          {/* Description */}
          {selectedScale.description && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{selectedScale.description}</p>
            </div>
          )}

          {/* Clinical Info & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                Información Clínica
              </h3>
              <div className="space-y-4">
                {selectedScale.current_version?.config?.original_author && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Autor Original</span>
                    <p className="text-sm text-gray-800">{selectedScale.current_version.config.original_author}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Idioma</span>
                  <p className="text-sm text-gray-800">
                    {selectedScale.current_version?.config?.language === 'es' ? 'Español' : 
                     selectedScale.current_version?.config?.language === 'en' ? 'Inglés' : 
                     selectedScale.current_version?.config?.language || 'No especificado'}
                  </p>
                </div>
                {selectedScale.current_version?.config?.validation_info && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado de Validación</span>
                    <p className="text-sm text-gray-800">{selectedScale.current_version.config.validation_info}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-purple-600" />
                Bibliografía y Referencias
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedScale.current_version?.config?.bibliography?.length ? (
                  selectedScale.current_version.config.bibliography.map((ref: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-bold text-gray-900 mb-1">{ref.title}</p>
                      <p className="text-[11px] text-gray-600 italic">
                        {ref.authors.join(', ')} ({ref.year}). {ref.journal}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ref.doi && (
                          <a 
                            href={`https://doi.org/${ref.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold hover:bg-blue-200"
                          >
                            DOI
                          </a>
                        )}
                        {ref.pmid && (
                          <a 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold hover:bg-green-200"
                          >
                            PubMed
                          </a>
                        )}
                        {ref.url && (
                          <a 
                            href={ref.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold hover:bg-gray-300"
                          >
                            Link
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No hay referencias registradas</p>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          {selectedScale.current_version?.config?.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>📋</span> Instrucciones de Aplicación
              </h3>
              <p className="text-blue-800 text-sm">{selectedScale.current_version.config.instructions}</p>
            </div>
          )}

          {/* Questions Preview */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preguntas ({selectedScale.current_version?.questions.length || 0})</h3>
            <div className="space-y-3">
              {selectedScale.current_version?.questions.slice(0, 5).map((q: any, idx: number) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{q.text}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {q.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {selectedScale.current_version && selectedScale.current_version.questions.length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  ... y {selectedScale.current_version.questions.length - 5} preguntas más
                </p>
              )}
            </div>
          </div>

          {/* Scoring Ranges */}
          {selectedScale.current_version?.scoring?.ranges && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rangos de Interpretación</h3>
              <div className="space-y-3">
                {selectedScale.current_version.scoring.ranges.map((range: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-l-4"
                    style={{ borderColor: range.color, backgroundColor: `${range.color}10` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold" style={{ color: range.color }}>
                        {range.label}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {range.min} - {range.max} puntos
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{range.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-6 z-10">
            <button
              onClick={() => handleEvaluate(selectedScale)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98]"
            >
              <Play size={20} fill="currentColor" />
              Iniciar Evaluación
            </button>
            <button
              onClick={handleBackToCatalog}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'evaluate' && selectedScale) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10 shadow">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <button
                onClick={handleBackToCatalog}
                className="text-blue-600 hover:text-blue-700 font-medium mb-2"
              >
                ← Volver al catálogo
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedScale.name}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <ScaleRunner
            scaleData={selectedScale}
            onSubmit={(data) => {
              console.log('Assessment completed:', data)
              alert('✅ Evaluación completada y guardada')
              handleBackToCatalog()
            }}
            onCancel={handleBackToCatalog}
          />
        </div>
      </div>
    )
  }

  // Catalog View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Catálogo de Escalas Médicas</h1>
            <p className="text-indigo-200">
              Explora y ejecuta evaluaciones con escalas validadas
            </p>
          </div>
          
          {isAdmin && onAddScale && (
            <button
              onClick={onAddScale}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} />
              Crear Nueva Escala
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar escalas por nombre, acrónimo o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            {loading ? (
              'Cargando escalas...'
            ) : (
              `${filteredScales.length} escala${filteredScales.length !== 1 ? 's' : ''} encontrada${filteredScales.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        ) : filteredScales.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No se encontraron escalas</p>
            <p className="text-gray-500 text-sm mt-2">
              Intenta ajustar los filtros o crear una nueva escala
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScales.map(scale => (
              <div
                key={scale.name}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {scale.name}
                    </h3>
                    {scale.acronym && (
                      <span className="text-sm font-medium text-blue-600">
                        {scale.acronym}
                      </span>
                    )}
                    {isAdmin && scale.current_version?.status === 'draft' && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">
                            Borrador
                        </span>
                    )}
                    {isAdmin && scale.current_version?.status === 'deprecated' && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
                            Obsoleto
                        </span>
                    )}
                  </div>

                  {/* Description */}
                  {scale.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {scale.description}
                    </p>
                  )}

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scale.categories?.slice(0, 2).map((cat: string) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                    {scale.categories && scale.categories.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{scale.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {scale.current_version?.questions.length || 0} preguntas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {scale.current_version?.config?.estimated_time || 5} min
                    </span>
                  </div>

                  {/* Actions */}
                    <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(scale)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                    {isAdmin && onEdit && (
                         <button
                            onClick={() => onEdit(scale)}
                            className="flex-1 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                         >
                            <Settings size={16} />
                            Editar
                         </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={() => handleDelete(scale)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Eliminar escala"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                      onClick={() => handleEvaluate(scale)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play size={16} />
                      Evaluar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
