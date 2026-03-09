import { useEffect, useState } from 'react'
import { TaxonomyService, TaxonomyItem } from '../services/TaxonomyService'
import { X } from 'lucide-react'

interface TaxonomySelectorProps {
  type: 'categories' | 'specialties' | 'bodySystems' | 'populations' | 'scaleTypes'
  selected: string[]
  onChange: (selectedIds: string[]) => void
  label: string
  multiple?: boolean
}

export function TaxonomySelector({ 
  type, 
  selected, 
  onChange, 
  label,
  multiple = true 
}: TaxonomySelectorProps) {
  const [options, setOptions] = useState<TaxonomyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    loadOptions()
  }, [type])

  const loadOptions = async () => {
    try {
      let data: TaxonomyItem[] = []
      switch (type) {
        case 'categories':
          data = await TaxonomyService.getCategories()
          break
        case 'specialties':
          data = await TaxonomyService.getSpecialties()
          break
        case 'bodySystems':
          data = await TaxonomyService.getBodySystems()
          break
        case 'populations':
          data = await TaxonomyService.getPopulations()
          break
        case 'scaleTypes':
          data = await TaxonomyService.getScaleTypes()
          break
      }
      setOptions(data)
    } catch (error) {
      console.error(`Error loading ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const selectedItems = options.filter(opt => selected.includes(opt.id))
  
  const filteredOptions = options.filter(opt => {
    if (selected.includes(opt.id)) return false
    if (!inputValue) return true
    return opt.name_es.toLowerCase().includes(inputValue.toLowerCase()) ||
           opt.name_en.toLowerCase().includes(inputValue.toLowerCase())
  })

  const handleSelect = (optionId: string) => {
    if (multiple) {
      onChange([...selected, optionId])
    } else {
      onChange([optionId])
    }
    setInputValue('')
    setShowDropdown(false)
  }

  const handleRemove = (optionId: string) => {
    onChange(selected.filter(id => id !== optionId))
  }

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="text-sm text-gray-500">Cargando opciones...</div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedItems.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {item.name_es}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with dropdown */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={`Buscar ${label.toLowerCase()}...`}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />

        {/* Dropdown */}
        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
              >
                <span className="font-medium">{option.name_es}</span>
                <span className="text-xs text-gray-500">{option.name_en}</span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && filteredOptions.length === 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-sm text-gray-500">
            No se encontraron resultados
          </div>
        )}
      </div>

      {options.length === 0 && !loading && (
        <p className="text-sm text-gray-500 mt-1">
          No hay opciones disponibles. Verifica que la migración se haya aplicado correctamente.
        </p>
      )}
    </div>
  )
}
