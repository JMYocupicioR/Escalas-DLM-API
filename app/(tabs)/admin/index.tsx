import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Tag,
  Calendar,
  User
} from 'lucide-react-native';
import { ImportScale, createScale } from '@/api/admin/createScale';
import { useScaleActions, useAllCategories, useAllSpecialties } from '@/store/scalesStore';

export default function AdminScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { addScale } = useScaleActions();
  const existingCategories = useAllCategories();
  const existingSpecialties = useAllSpecialties();
  
  // States
  const [jsonInput, setJsonInput] = useState('');
  const [parsedScale, setParsedScale] = useState<ImportScale | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form mode states
  const [inputMode, setInputMode] = useState<'json' | 'form'>('json');
  const [formData, setFormData] = useState<ImportScale>({
    id: '',
    name: '',
    description: '',
    category: '',
    timeToComplete: '5-10 min',
    instructions: '',
    tags: [],
    specialty: '',
    questions: [{
      id: 'q1',
      question_text: '',
      description: '',
      question_type: 'single_choice',
      options: [{ option_value: 0, option_label: '', option_description: '' }]
    }],
    scoring: {
      min_score: 0,
      max_score: 100,
      method: 'sum',
      ranges: [{ 
        min_value: 0, 
        max_value: 100, 
        interpretation_level: '', 
        interpretation_text: '' 
      }]
    }
  });
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedScale, setLastCreatedScale] = useState<ImportScale | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Validation and parsing
  const validateAndParseJson = (jsonText: string) => {
    try {
      if (!jsonText.trim()) {
        setParsedScale(null);
        setValidationErrors([]);
        setIsValid(false);
        return;
      }

      const parsed = JSON.parse(jsonText) as ImportScale;
      const errors: string[] = [];

      // Basic validation
      if (!parsed.id) errors.push('ID is required');
      if (!parsed.name) errors.push('Name is required');
      if (!parsed.description) errors.push('Description is required');
      if (!parsed.category) errors.push('Category is required');
      if (!parsed.questions || parsed.questions.length === 0) {
        errors.push('At least one question is required');
      }

      // Validate questions
      parsed.questions?.forEach((q, index) => {
        if (!q.id) errors.push(`Question ${index + 1}: ID is required`);
        if (!q.question_text) errors.push(`Question ${index + 1}: Text is required`);
        if (!q.options || q.options.length === 0) {
          errors.push(`Question ${index + 1}: Options are required`);
        }
      });

      setParsedScale(parsed);
      setValidationErrors(errors);
      setIsValid(errors.length === 0);
    } catch (error: any) {
      setParsedScale(null);
      setValidationErrors([`Invalid JSON: ${error.message}`]);
      setIsValid(false);
    }
  };

  // Handle JSON input change
  const handleJsonInputChange = (text: string) => {
    setJsonInput(text);
    validateAndParseJson(text);
  };

  // Generate template
  const generateTemplate = () => {
    const template: ImportScale = {
      id: "example-scale",
      name: "Escala de Ejemplo",
      description: "Descripción de la escala de ejemplo",
      category: "Funcional",
      timeToComplete: "5-10 min",
      instructions: "Instrucciones para completar la escala",
      questions: [
        {
          id: "q1",
          question_text: "¿Pregunta de ejemplo?",
          description: "Descripción de la pregunta",
          question_type: "single_choice",
          options: [
            {
              option_value: 0,
              option_label: "Opción 1",
              option_description: "Descripción de la opción 1"
            },
            {
              option_value: 1,
              option_label: "Opción 2",
              option_description: "Descripción de la opción 2"
            }
          ]
        }
      ],
      scoring: {
        min_score: 0,
        max_score: 1,
        method: "sum",
        ranges: [
          {
            min_value: 0,
            max_value: 0,
            interpretation_level: "Bajo",
            interpretation_text: "Interpretación para puntuación baja"
          },
          {
            min_value: 1,
            max_value: 1,
            interpretation_level: "Alto",
            interpretation_text: "Interpretación para puntuación alta"
          }
        ]
      }
    };

    setJsonInput(JSON.stringify(template, null, 2));
    validateAndParseJson(JSON.stringify(template, null, 2));
  };

  // Load Barthel example
  const loadBarthelExample = () => {
    const barthelExample: ImportScale = {
      id: "barthel-example",
      name: "Índice de Barthel - Ejemplo",
      description: "Evaluación de actividades básicas de la vida diaria - Versión de ejemplo",
      category: "ADL",
      timeToComplete: "5-10 min",
      instructions: "Evalúe cada actividad según la capacidad actual del paciente",
      questions: [
        {
          id: "comida",
          question_text: "Comida",
          description: "Capacidad para comer por sí mismo",
          question_type: "single_choice",
          options: [
            {
              option_value: 10,
              option_label: "Independiente",
              option_description: "Capaz de comer por sí solo en un tiempo razonable"
            },
            {
              option_value: 5,
              option_label: "Necesita ayuda",
              option_description: "Para cortar la carne, extender la mantequilla... pero es capaz de comer solo/a"
            },
            {
              option_value: 0,
              option_label: "Dependiente",
              option_description: "Necesita ser alimentado por otra persona"
            }
          ]
        },
        {
          id: "lavado",
          question_text: "Lavado (Baño)",
          description: "Capacidad para lavarse solo",
          question_type: "single_choice",
          options: [
            {
              option_value: 5,
              option_label: "Independiente",
              option_description: "Capaz de lavarse entero, de entrar y salir del baño sin ayuda"
            },
            {
              option_value: 0,
              option_label: "Dependiente",
              option_description: "Necesita algún tipo de ayuda o supervisión"
            }
          ]
        }
      ],
      scoring: {
        min_score: 0,
        max_score: 15,
        method: "sum",
        ranges: [
          {
            min_value: 0,
            max_value: 5,
            interpretation_level: "Dependencia total",
            interpretation_text: "Requiere ayuda completa para todas las actividades"
          },
          {
            min_value: 6,
            max_value: 10,
            interpretation_level: "Dependencia grave",
            interpretation_text: "Requiere ayuda significativa para la mayoría de actividades"
          },
          {
            min_value: 11,
            max_value: 15,
            interpretation_level: "Dependencia moderada",
            interpretation_text: "Requiere ayuda para algunas actividades"
          }
        ]
      }
    };

    setJsonInput(JSON.stringify(barthelExample, null, 2));
    validateAndParseJson(JSON.stringify(barthelExample, null, 2));
  };

  // Save scale with store integration
  const handleSaveScale = async () => {
    const scaleToSave = inputMode === 'json' ? parsedScale : formData;
    
    if (!scaleToSave || !isValid) {
      Alert.alert('Error', 'Por favor corrige los errores de validación antes de guardar');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createScale(scaleToSave, (createdScale) => {
        // Update the store immediately
        const formattedScale = {
          id: createdScale.id,
          name: createdScale.name,
          acronym: createdScale.acronym,
          description: createdScale.description,
          category: createdScale.category,
          tags: createdScale.tags || [],
          timeToComplete: createdScale.timeToComplete || '5-10 min',
          specialty: createdScale.specialty,
          popular: false,
          popularity: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          instructions: createdScale.instructions,
        };
        
        addScale(formattedScale);
      });
      
      if (result.success) {
        setLastCreatedScale(scaleToSave);
        setShowSuccessModal(true);
        
        // Reset forms
        if (inputMode === 'json') {
          setJsonInput('');
          setParsedScale(null);
        } else {
          setFormData({
            id: '',
            name: '',
            description: '',
            category: '',
            timeToComplete: '5-10 min',
            instructions: '',
            tags: [],
            specialty: '',
            questions: [{
              id: 'q1',
              question_text: '',
              description: '',
              question_type: 'single_choice',
              options: [{ option_value: 0, option_label: '', option_description: '' }]
            }],
            scoring: {
              min_score: 0,
              max_score: 100,
              method: 'sum',
              ranges: [{ 
                min_value: 0, 
                max_value: 100, 
                interpretation_level: '', 
                interpretation_text: '' 
              }]
            }
          });
        }
        
        setValidationErrors([]);
        setIsValid(false);
        setShowPreview(false);
        
      } else {
        Alert.alert('Error', result.error || 'Error desconocido al crear la escala');
      }
    } catch (error: any) {
      Alert.alert('Error', `Error al crear la escala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (parsedScale) {
      // Note: In a real app, you'd use Clipboard from '@react-native-clipboard/clipboard'
      Alert.alert('Info', 'Funcionalidad de copiar al portapapeles pendiente de implementar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Creador de Escalas Médicas</Text>
          <Text style={styles.subtitle}>
            {inputMode === 'json' ? 'Importa escalas desde JSON' : 'Crea escalas con formulario'}
          </Text>
          
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, inputMode === 'json' && styles.toggleButtonActive]}
              onPress={() => setInputMode('json')}
            >
              <FileText size={20} color={inputMode === 'json' ? colors.card : colors.primary} />
              <Text style={[styles.toggleText, inputMode === 'json' && styles.toggleTextActive]}>
                JSON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, inputMode === 'form' && styles.toggleButtonActive]}
              onPress={() => setInputMode('form')}
            >
              <Edit3 size={20} color={inputMode === 'form' ? colors.card : colors.primary} />
              <Text style={[styles.toggleText, inputMode === 'form' && styles.toggleTextActive]}>
                Formulario
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.quickButton} onPress={generateTemplate}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.quickButtonText}>Template</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickButton} onPress={loadBarthelExample}>
              <Download size={20} color={colors.primary} />
              <Text style={styles.quickButtonText}>Ejemplo Barthel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickButton} onPress={copyToClipboard}>
              <Copy size={20} color={colors.primary} />
              <Text style={styles.quickButtonText}>Copiar JSON</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* JSON Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>JSON de la Escala</Text>
          <TextInput
            style={styles.jsonInput}
            value={jsonInput}
            onChangeText={handleJsonInputChange}
            placeholder="Pega aquí el JSON de tu escala médica..."
            placeholderTextColor={colors.text + '80'}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Validation Results */}
        {(validationErrors.length > 0 || isValid) && (
          <View style={[styles.card, isValid ? styles.successCard : styles.errorCard]}>
            <View style={styles.validationHeader}>
              {isValid ? (
                <CheckCircle size={20} color="#22c55e" />
              ) : (
                <AlertCircle size={20} color="#ef4444" />
              )}
              <Text style={[styles.validationTitle, { color: isValid ? '#22c55e' : '#ef4444' }]}>
                {isValid ? 'Validación exitosa' : 'Errores de validación'}
              </Text>
            </View>
            
            {validationErrors.length > 0 && (
              <View style={styles.errorList}>
                {validationErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>• {error}</Text>
                ))}
              </View>
            )}
            
            {isValid && parsedScale && (
              <Text style={styles.successText}>
                Escala "{parsedScale.name}" lista para importar ({parsedScale.questions.length} preguntas)
              </Text>
            )}
          </View>
        )}

        {/* Preview Toggle */}
        {isValid && parsedScale && (
          <TouchableOpacity 
            style={styles.previewToggle} 
            onPress={() => setShowPreview(!showPreview)}
          >
            <Eye size={20} color={colors.primary} />
            <Text style={styles.previewToggleText}>
              {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
            </Text>
          </TouchableOpacity>
        )}

        {/* Preview */}
        {showPreview && parsedScale && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vista Previa</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{parsedScale.name}</Text>
              <Text style={styles.previewDescription}>{parsedScale.description}</Text>
              <Text style={styles.previewMeta}>
                Categoría: {parsedScale.category} • {parsedScale.questions.length} preguntas
              </Text>
              
              <View style={styles.questionsPreview}>
                <Text style={styles.previewSectionTitle}>Preguntas:</Text>
                {parsedScale.questions.slice(0, 3).map((q, index) => (
                  <View key={q.id} style={styles.questionPreview}>
                    <Text style={styles.questionText}>{index + 1}. {q.question_text}</Text>
                    <Text style={styles.optionsText}>
                      {q.options.length} opciones de respuesta
                    </Text>
                  </View>
                ))}
                {parsedScale.questions.length > 3 && (
                  <Text style={styles.moreQuestionsText}>
                    ... y {parsedScale.questions.length - 3} preguntas más
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Save Button */}
        {isValid && parsedScale && (
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSaveScale}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Upload size={20} color="#fff" />
            )}
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Guardando...' : 'Crear Escala'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Development Notice */}
        <View style={styles.devNotice}>
          <Text style={styles.devNoticeText}>
            ⚠️ Módulo temporal de desarrollo - Solo visible en modo desarrollo
          </Text>
        </View>

      </ScrollView>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={48} color="#22c55e" />
            </View>
            
            <Text style={styles.successTitle}>¡Escala Creada!</Text>
            
            {lastCreatedScale && (
              <View style={styles.successContent}>
                <Text style={styles.successScaleName}>{lastCreatedScale.name}</Text>
                <Text style={styles.successDescription}>
                  La escala ha sido creada exitosamente y está disponible en toda la aplicación.
                </Text>
                
                <View style={styles.successStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{lastCreatedScale.questions.length}</Text>
                    <Text style={styles.statLabel}>Preguntas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{lastCreatedScale.category}</Text>
                    <Text style={styles.statLabel}>Categoría</Text>
                  </View>
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text + '80',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  successCard: {
    borderColor: '#22c55e40',
    backgroundColor: colors.card,
  },
  errorCard: {
    borderColor: '#ef444440',
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border + '60',
  },
  quickButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  jsonInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
    fontFamily: 'monospace',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  errorList: {
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 4,
  },
  successText: {
    color: '#22c55e',
    fontSize: 14,
    marginTop: 8,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  previewToggleText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  previewContent: {
    padding: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 8,
    lineHeight: 20,
  },
  previewMeta: {
    fontSize: 12,
    color: colors.text + '60',
    marginBottom: 16,
  },
  questionsPreview: {
    marginTop: 8,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  questionPreview: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  questionText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  optionsText: {
    fontSize: 12,
    color: colors.text + '60',
  },
  moreQuestionsText: {
    fontSize: 12,
    color: colors.text + '60',
    fontStyle: 'italic',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  devNotice: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginTop: 8,
  },
  devNoticeText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  
  // Mode toggle styles
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  toggleTextActive: {
    color: colors.card,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successScaleName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 14,
    color: colors.text + '80',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text + '60',
  },
  successButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  successButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});