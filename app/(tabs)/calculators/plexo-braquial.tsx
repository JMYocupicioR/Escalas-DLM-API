import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePlexoBraquialAssessment } from '@/hooks/usePlexoBraquialAssessment';
import { EducationalTooltip, TOOLTIP_CONTENT } from '@/components/EducationalTooltip';
import { 
  MUSCULOS_EVALUACION, 
  MUSCULOS_POR_REGION,
  MUSCULOS_ESENCIALES,
  SINTOMAS_CLINICOS, 
  AREAS_SENSIBILIDAD, 
  OPCIONES_REFLEJOS,
  OPCIONES_MRC,
  OPCIONES_TIPO_PLEXO,
  OPCIONES_CONTEXTO_CLINICO,
  OPCIONES_FASE_EVOLUTIVA,
  OPCIONES_PATRON_EVOLUCION,
  EXPLICACIONES_ANATOMICAS,
  DIAGNOSTIC_SVG_MAPPING
} from '@/data/plexoBraquial';
import { PlexusBrachialisSVG } from '@/components/PlexusBrachialisSVG';
import { MRCButtonGroup } from '@/components/MRCButtonGroup';
import { MuscleSummaryPanel } from '@/components/MuscleSummaryPanel';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calculator, 
  RotateCcw, 
  Activity,
  Brain,
  Zap,
  Info,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { ResultsActions } from '@/components/ResultsActions';

export default function PlexoBraquialCalculator() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const {
    datosEvaluacion,
    currentStep,
    setCurrentStep,
    calculoRealizado,
    resultadosDiagnostico,
    hallazgosInervacionDual,
    updateFuerzaMuscular,
    updateSintomas,
    updateAreas,
    updateReflejo,
    updateInformacionAdicional,
    updateContextoClinico,
    updateTiempoEvolucion,
    updateFaseEvolutiva,
    updatePatronEvolucion,
    realizarCalculo,
    reiniciarCalculadora,
    isStepComplete,
    canCalculate,
    cargarCasoClinico,
    casosDisponibles,
    getStepValidationMessage,
    getCalculationValidationMessage,
    getStepSuggestions
  } = usePlexoBraquialAssessment();

  const [showClinicalCases, setShowClinicalCases] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [animatedVisualization, setAnimatedVisualization] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>('Hombro y Escápula');
  const [quickMode, setQuickMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const totalSteps = 5;

  const getStepLabel = (step: number): string => {
    switch (step) {
      case 1: return 'Músculos';
      case 2: return 'Síntomas';
      case 3: return 'Sensibilidad';
      case 4: return 'Reflejos';
      case 5: return 'Adicional';
      default: return `Paso ${step}`;
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalcular = () => {
    const validationMessage = getCalculationValidationMessage();
    if (validationMessage) {
      Alert.alert('Validación', validationMessage, [
        { text: 'Revisar', style: 'default' },
        { text: 'Calcular Anyway', onPress: realizarCalculo, style: 'destructive' }
      ]);
      return;
    }
    realizarCalculo();
  };

  const handleReiniciar = () => {
    Alert.alert(
      'Reiniciar Calculadora',
      '¿Está seguro de que desea borrar todos los datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: () => {
            // Reiniciar los datos de la calculadora
            reiniciarCalculadora();
            
            // Reiniciar estados de la interfaz
            setShowClinicalCases(false);
            setExpandedExplanation(null);
            setAnimatedVisualization(false);
            setActiveRegion('Hombro y Escápula');
            setQuickMode(false);
            setShowSummary(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderPicker = (
    selectedValue: any,
    onValueChange: (value: any) => void,
    items: { label: string; value: any }[],
    placeholder: string
  ) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, !selectedValue && { color: colors.mutedText }]}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
        dropdownIconColor={colors.text}
      >
        <Picker.Item 
          label={placeholder} 
          value="" 
          enabled={false}
          style={{ color: colors.mutedText }}
        />
        {items.map(item => (
          <Picker.Item 
            key={item.value} 
            label={item.label} 
            value={item.value}
            style={{ color: colors.text }}
          />
        ))}
      </Picker>
    </View>
  );

  const renderCheckboxGroup = (
    items: string[],
    selectedItems: string[],
    onSelectionChange: (items: string[]) => void,
    title: string
  ) => (
    <View style={styles.checkboxGroup}>
      <Text style={styles.checkboxGroupTitle}>{title}</Text>
      {items.map(item => {
        const isSelected = selectedItems.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
            onPress={() => {
              if (isSelected) {
                onSelectionChange(selectedItems.filter(i => i !== item));
              } else {
                onSelectionChange([...selectedItems, item]);
              }
            }}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStepFeedback = (step: number) => {
    const validationMessage = getStepValidationMessage(step);
    const suggestions = getStepSuggestions(step);
    
    if (!validationMessage && suggestions.length === 0) return null;

    return (
      <View style={styles.feedbackContainer}>
        {validationMessage && (
          <View style={[styles.feedbackMessage, 
            validationMessage.includes("Debe") ? styles.feedbackError : styles.feedbackWarning
          ]}>
            <Info size={16} color={validationMessage.includes("Debe") ? colors.error : colors.warning} />
            <Text style={[styles.feedbackText, 
              validationMessage.includes("Debe") ? styles.feedbackTextError : styles.feedbackTextWarning
            ]}>
              {validationMessage}
            </Text>
          </View>
        )}
        
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💡 Sugerencias:</Text>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStep1 = () => {
    const musculosToShow = quickMode ? MUSCULOS_ESENCIALES : Object.keys(MUSCULOS_POR_REGION);
    const affectedCount = Object.values(datosEvaluacion.fuerzasMuscular).filter(mrc => mrc < 5).length;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Activity size={24} color={colors.primary} />
          <EducationalTooltip content={TOOLTIP_CONTENT.MRC_SCALE}>
            <Text style={styles.stepTitle}>Evaluación de Fuerza Muscular (MRC)</Text>
          </EducationalTooltip>
        </View>
        
        <Text style={styles.stepDescription}>
          Los músculos inician en MRC 5 (normal). Modifique solo aquellos con debilidad.
        </Text>

        {/* Controles superiores */}
        <View style={styles.controlsContainer}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, !quickMode && styles.modeButtonActive]}
              onPress={() => setQuickMode(false)}
            >
              <Text style={[styles.modeButtonText, !quickMode && styles.modeButtonTextActive]}>
                Completo ({MUSCULOS_EVALUACION.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, quickMode && styles.modeButtonActive]}
              onPress={() => setQuickMode(true)}
            >
              <Text style={[styles.modeButtonText, quickMode && styles.modeButtonTextActive]}>
                Rápido ({MUSCULOS_ESENCIALES.length})
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.summaryToggle, showSummary && styles.summaryToggleActive]}
            onPress={() => setShowSummary(!showSummary)}
          >
            <Text style={[styles.summaryToggleText, showSummary && styles.summaryToggleTextActive]}>
              📊 {affectedCount > 0 ? `${affectedCount} afectados` : 'Resumen'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Panel de resumen */}
        {showSummary && (
          <MuscleSummaryPanel
            muscleStrengths={datosEvaluacion.fuerzasMuscular}
            onMusclePress={(muscle) => {
              // Cambiar a la región del músculo seleccionado
              for (const [region, muscles] of Object.entries(MUSCULOS_POR_REGION)) {
                if (muscles.includes(muscle)) {
                  setActiveRegion(region);
                  setQuickMode(false);
                  break;
                }
              }
            }}
            compact={true}
          />
        )}

        {quickMode ? (
          // Modo rápido: lista simple
          <ScrollView style={styles.quickMuscleList}>
            {MUSCULOS_ESENCIALES.map(musculo => (
              <View key={musculo} style={styles.quickMuscleItem}>
                <Text style={styles.quickMuscleLabel}>{musculo}</Text>
                <MRCButtonGroup
                  selectedValue={datosEvaluacion.fuerzasMuscular[musculo] || 5}
                  onValueChange={(value) => updateFuerzaMuscular(musculo, value)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          // Modo completo: tabs por región
          <>
            {/* Tabs de regiones */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.regionTabs}
            >
              {Object.keys(MUSCULOS_POR_REGION).map(region => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionTab,
                    activeRegion === region && styles.regionTabActive
                  ]}
                  onPress={() => setActiveRegion(region)}
                >
                  <Text style={[
                    styles.regionTabText,
                    activeRegion === region && styles.regionTabTextActive
                  ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Músculos de la región activa */}
            <ScrollView style={styles.regionMuscleList}>
              {MUSCULOS_POR_REGION[activeRegion]?.map(musculo => (
                <View key={musculo} style={styles.regionMuscleItem}>
                  <Text style={styles.regionMuscleLabel}>{musculo}</Text>
                  <MRCButtonGroup
                    selectedValue={datosEvaluacion.fuerzasMuscular[musculo] || 5}
                    onValueChange={(value) => updateFuerzaMuscular(musculo, value)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
        
        {renderStepFeedback(1)}
      </View>
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Brain size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Síntomas Clínicos</Text>
      </View>
      <Text style={styles.stepDescription}>
        Seleccione los síntomas presentes en el paciente.
      </Text>
      
      {renderCheckboxGroup(
        SINTOMAS_CLINICOS,
        datosEvaluacion.sintomasSeleccionados,
        updateSintomas,
        'Síntomas presentes:'
      )}
      
      {renderStepFeedback(2)}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Zap size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Áreas de Sensibilidad Afectadas</Text>
      </View>
      <Text style={styles.stepDescription}>
        Seleccione las áreas con alteraciones sensitivas.
      </Text>
      
      {renderCheckboxGroup(
        AREAS_SENSIBILIDAD,
        datosEvaluacion.areasSeleccionadas,
        updateAreas,
        'Áreas afectadas:'
      )}
      
      {renderStepFeedback(3)}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Activity size={24} color={colors.primary} />
        <EducationalTooltip content={TOOLTIP_CONTENT.REFLEXES}>
          <Text style={styles.stepTitle}>Estado de Reflejos</Text>
        </EducationalTooltip>
      </View>
      <Text style={styles.stepDescription}>
        Evalúe el estado de los reflejos osteotendinosos.
      </Text>
      
      <View style={styles.reflexContainer}>
        <Text style={styles.reflexLabel}>Reflejo Bicipital (C5-C6)</Text>
        {renderPicker(
          datosEvaluacion.reflejos.bicipital,
          (value) => updateReflejo('bicipital', value),
          OPCIONES_REFLEJOS,
          'Seleccionar estado'
        )}
        
        <Text style={styles.reflexLabel}>Reflejo Braquiorradial (C6-C7)</Text>
        {renderPicker(
          datosEvaluacion.reflejos.braquiorradial,
          (value) => updateReflejo('braquiorradial', value),
          OPCIONES_REFLEJOS,
          'Seleccionar estado'
        )}
        
        <Text style={styles.reflexLabel}>Reflejo Tricipital (C7-C8)</Text>
        {renderPicker(
          datosEvaluacion.reflejos.tricipital,
          (value) => updateReflejo('tricipital', value),
          OPCIONES_REFLEJOS,
          'Seleccionar estado'
        )}
      </View>
      
      {renderStepFeedback(4)}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Info size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Información Adicional</Text>
      </View>
      <Text style={styles.stepDescription}>
        Información complementaria para refinar el diagnóstico (opcional).
      </Text>
      
      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Contexto Clínico</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.contextoClinico || '',
          (value) => updateContextoClinico(value as any),
          OPCIONES_CONTEXTO_CLINICO,
          'Seleccionar contexto'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Tiempo de Evolución (días)</Text>
        <Picker
          selectedValue={datosEvaluacion.informacionAdicional.tiempoEvolucion?.toString() || ''}
          onValueChange={(value) => updateTiempoEvolucion(parseInt(value) || 0)}
          style={styles.picker}
        >
          <Picker.Item label="No especificado" value="" />
          <Picker.Item label="< 1 día (Hiperaguda)" value="0" />
          <Picker.Item label="1-3 días" value="2" />
          <Picker.Item label="4-7 días" value="5" />
          <Picker.Item label="1-2 semanas" value="10" />
          <Picker.Item label="3-4 semanas" value="21" />
          <Picker.Item label="1-3 meses" value="60" />
          <Picker.Item label="3-6 meses" value="120" />
          <Picker.Item label="> 6 meses" value="180" />
        </Picker>
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Fase Evolutiva</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.faseEvolutiva || '',
          (value) => updateFaseEvolutiva(value as any),
          OPCIONES_FASE_EVOLUTIVA,
          'Seleccionar fase'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Patrón de Evolución</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.patronEvolucion || '',
          (value) => updatePatronEvolucion(value as any),
          OPCIONES_PATRON_EVOLUCION,
          'Seleccionar patrón'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Tipo de Plexo</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.tipoPlexo,
          (value) => updateInformacionAdicional('tipoPlexo', value),
          OPCIONES_TIPO_PLEXO,
          'Seleccionar tipo'
        )}
      </View>
      
      {renderStepFeedback(5)}
    </View>
  );

  const renderResults = () => {
    if (!calculoRealizado || resultadosDiagnostico.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No se encontraron diagnósticos que cumplan los criterios mínimos.
          </Text>
          <Text style={styles.noResultsSubtext}>
            Revise los datos ingresados y vuelva a calcular.
          </Text>
        </View>
      );
    }

    const mejorDiagnostico = resultadosDiagnostico[0];

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Diagnósticos Diferenciales</Text>
        
        {/* Visualización Anatómica SVG */}
        <View style={styles.svgContainer}>
          <View style={styles.svgHeader}>
            <Text style={styles.svgTitle}>Visualización Anatómica</Text>
            <TouchableOpacity
              style={styles.educationalLink}
              onPress={() => router.push('/calculators/plexus-educativo')}
            >
              <Text style={styles.educationalLinkText}>🧠 Ver plexo interactivo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.animationToggle, animatedVisualization && styles.animationToggleActive]}
              onPress={() => setAnimatedVisualization(!animatedVisualization)}
            >
              <Text style={[styles.animationToggleText, animatedVisualization && styles.animationToggleTextActive]}>
                {animatedVisualization ? '⏸️ Pausar' : '▶️ Animar'}
              </Text>
            </TouchableOpacity>
          </View>
          <PlexusBrachialisSVG
            diagnosis={mejorDiagnostico.nombreLesion}
            affectedStructures={DIAGNOSTIC_SVG_MAPPING[mejorDiagnostico.nombreLesion] || []}
            animated={animatedVisualization}
          />
          <Text style={styles.svgDescription}>
            Las estructuras en rojo están afectadas en: {mejorDiagnostico.nombreLesion}
          </Text>
        </View>
        
        {resultadosDiagnostico.slice(0, 5).map((resultado, index) => (
          <View key={resultado.nombreLesion} style={[
            styles.resultCard,
            index === 0 && styles.bestResultCard
          ]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultName, index === 0 && styles.bestResultName]}>
                {index + 1}. {resultado.nombreLesion}
              </Text>
              <Text style={[styles.resultScore, index === 0 && styles.bestResultScore]}>
                {(resultado.normalizedScore * 100).toFixed(1)}%
              </Text>
            </View>
            
            {index === 0 && (
              <View style={styles.resultDetails}>
                <Text style={styles.detailsTitle}>Hallazgos principales:</Text>
                
                {resultado.detalles.musculos.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>• Músculos afectados:</Text>
                    {resultado.detalles.musculos
                      .filter(m => m.esperado)
                      .slice(0, 3)
                      .map(m => (
                        <Text key={m.nombre} style={styles.detailItem}>
                          {m.nombre} (MRC: {m.mrc})
                        </Text>
                      ))}
                  </View>
                )}

                {resultado.detalles.musculosInesperados && resultado.detalles.musculosInesperados.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>⚠️ Músculos débiles no esperados:</Text>
                    {resultado.detalles.musculosInesperados.slice(0, 3).map(m => (
                      <Text key={m.nombre} style={[styles.detailItem, { color: colors.warning }]}>
                        {m.nombre} (MRC: {m.mrc}) - No típico de esta lesión
                      </Text>
                    ))}
                  </View>
                )}
                
                {resultado.detalles.nerviosPerifericos.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>• Nervios comprometidos:</Text>
                    {resultado.detalles.nerviosPerifericos.slice(0, 3).map(nervio => (
                      <Text key={nervio} style={styles.detailItem}>{nervio}</Text>
                    ))}
                  </View>
                )}
                
                {resultado.detalles.sensibilidad.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>• Áreas sensitivas:</Text>
                    {resultado.detalles.sensibilidad.slice(0, 2).map(area => (
                      <Text key={area} style={styles.detailItem}>{area}</Text>
                    ))}
                  </View>
                )}

                {/* Métricas de Confianza */}
                {resultado.indicadoresConfianza && (
                  <View style={styles.confidenceSection}>
                    <Text style={styles.detailsTitle}>Confianza del Diagnóstico:</Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceLevel,
                          { 
                            width: `${resultado.indicadoresConfianza.nivelConfianza}%`,
                            backgroundColor: resultado.indicadoresConfianza.nivelConfianza >= 70 
                              ? colors.success : resultado.indicadoresConfianza.nivelConfianza >= 50 
                              ? colors.warning : colors.error
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.confidenceText}>
                      {resultado.indicadoresConfianza.nivelConfianza}% - {
                        resultado.indicadoresConfianza.nivelConfianza >= 70 ? 'Alta' :
                        resultado.indicadoresConfianza.nivelConfianza >= 50 ? 'Moderada' : 'Baja'
                      }
                    </Text>

                    {resultado.indicadoresConfianza.factoresPositivos.length > 0 && (
                      <View style={styles.factorsSection}>
                        <Text style={styles.factorsTitle}>✅ Factores que apoyan:</Text>
                        {resultado.indicadoresConfianza.factoresPositivos.map((factor, idx) => (
                          <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                        ))}
                      </View>
                    )}

                    {resultado.indicadoresConfianza.factoresNegativos.length > 0 && (
                      <View style={styles.factorsSection}>
                        <Text style={styles.factorsTitle}>⚠️ Factores en contra:</Text>
                        {resultado.indicadoresConfianza.factoresNegativos.map((factor, idx) => (
                          <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                        ))}
                      </View>
                    )}

                    {resultado.indicadoresConfianza.recomendacionesAdicionales.length > 0 && (
                      <View style={styles.factorsSection}>
                        <Text style={styles.factorsTitle}>💡 Recomendaciones:</Text>
                        {resultado.indicadoresConfianza.recomendacionesAdicionales.map((rec, idx) => (
                          <Text key={idx} style={styles.factorItem}>• {rec}</Text>
                        ))}
                      </View>
                    )}

                    {resultado.indicadoresConfianza.estudiosRecomendados && (
                      <View style={styles.factorsSection}>
                        <Text style={styles.factorsTitle}>🔬 Estudios recomendados:</Text>
                        {resultado.indicadoresConfianza.estudiosRecomendados.map((estudio, idx) => (
                          <Text key={idx} style={styles.factorItem}>• {estudio}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Información de Severidad */}
                {resultado.severidadEsperada && (
                  <View style={styles.severitySection}>
                    <Text style={styles.detailsTitle}>Severidad Esperada:</Text>
                    <View style={styles.severityInfo}>
                      <Text style={styles.severityGrade}>
                        Grado {resultado.severidadEsperada.grado} (Sunderland)
                      </Text>
                      <Text style={styles.severityDescription}>
                        {resultado.severidadEsperada.descripcion}
                      </Text>
                      <Text style={[styles.severityPrognosis, {
                        color: resultado.severidadEsperada.pronostico === 'excelente' ? colors.success :
                               resultado.severidadEsperada.pronostico === 'bueno' ? colors.success :
                               resultado.severidadEsperada.pronostico === 'reservado' ? colors.warning :
                               colors.error
                      }]}>
                        Pronóstico: {resultado.severidadEsperada.pronostico}
                      </Text>
                      <Text style={styles.severityTime}>
                        Tiempo de recuperación: {resultado.severidadEsperada.tiempoRecuperacion}
                      </Text>
                      <Text style={styles.severityTreatment}>
                        Tratamiento: {resultado.severidadEsperada.tratamientoRecomendado}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Análisis Temporal */}
                {resultado.analisisTemporal && (
                  <View style={styles.temporalSection}>
                    <Text style={styles.detailsTitle}>Análisis Temporal:</Text>
                    <Text style={styles.temporalPhase}>
                      Fase: {resultado.analisisTemporal.faseEvolutiva}
                      {resultado.analisisTemporal.tiempoEvolucion && 
                        ` (${resultado.analisisTemporal.tiempoEvolucion} días)`}
                    </Text>
                    {resultado.analisisTemporal.patronEvolucion && (
                      <Text style={styles.temporalPattern}>
                        Patrón: {resultado.analisisTemporal.patronEvolucion}
                      </Text>
                    )}
                    {resultado.analisisTemporal.factoresPronostico.length > 0 && (
                      <View style={styles.prognosticFactors}>
                        <Text style={styles.factorsTitle}>🕐 Factores pronósticos:</Text>
                        {resultado.analisisTemporal.factoresPronostico.map((factor, idx) => (
                          <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Contexto Clínico */}
                {resultado.contextoClinico && (
                  <View style={styles.clinicalContext}>
                    <Text style={styles.detailsTitle}>Contexto Clínico:</Text>
                    <Text style={styles.contextAge}>Edad típica: {resultado.contextoClinico.edadTipica}</Text>
                    
                    <View style={styles.contextSection}>
                      <Text style={styles.factorsTitle}>🎯 Mecanismos frecuentes:</Text>
                      {resultado.contextoClinico.mecanismoFrecuente.map((mecanismo, idx) => (
                        <Text key={idx} style={styles.factorItem}>• {mecanismo}</Text>
                      ))}
                    </View>

                    <View style={styles.contextSection}>
                      <Text style={styles.factorsTitle}>⚠️ Factores de riesgo:</Text>
                      {resultado.contextoClinico.factoresRiesgo.map((factor, idx) => (
                        <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {/* Explicación Anatómica */}
            {index === 0 && EXPLICACIONES_ANATOMICAS[resultado.nombreLesion] && (
              <View style={styles.anatomicalExplanation}>
                <TouchableOpacity
                  style={styles.anatomicalHeader}
                  onPress={() => setExpandedExplanation(
                    expandedExplanation === resultado.nombreLesion ? null : resultado.nombreLesion
                  )}
                >
                  <BookOpen size={16} color={colors.primary} />
                  <Text style={styles.anatomicalTitle}>Explicación Anatómica</Text>
                  {expandedExplanation === resultado.nombreLesion ? (
                    <ChevronUp size={16} color={colors.primary} />
                  ) : (
                    <ChevronDown size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
                
                {expandedExplanation === resultado.nombreLesion && (
                  <View style={styles.anatomicalContent}>
                    <Text style={styles.anatomicalText}>
                      {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].correlacionClinica}
                    </Text>
                    
                    <Text style={styles.anatomicalSectionTitle}>Recorrido Neural:</Text>
                    {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].recorrido.map((paso, idx) => (
                      <Text key={idx} style={styles.anatomicalStep}>
                        {paso.icono} {paso.estructura}: {paso.explicacion}
                      </Text>
                    ))}
                    
                    <Text style={styles.anatomicalSectionTitle}>Signos Característicos:</Text>
                    {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].signosCaracteristicos.map((signo, idx) => (
                      <Text key={idx} style={styles.anatomicalBullet}>• {signo}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Análisis de Inervación Dual */}
        {hallazgosInervacionDual.length > 0 && (
          <View style={styles.dualInnervationContainer}>
            <View style={styles.dualInnervationHeader}>
              <Brain size={20} color={colors.primary} />
              <EducationalTooltip content={TOOLTIP_CONTENT.DUAL_INNERVATION}>
                <Text style={styles.dualInnervationTitle}>Análisis de Inervación Dual</Text>
              </EducationalTooltip>
            </View>
            
            {hallazgosInervacionDual.map((hallazgo, index) => (
              <View key={hallazgo.musculo} style={[
                styles.dualInnervationItem,
                hallazgo.relevancia === 'Alta' && styles.dualInnervationHigh,
                hallazgo.relevancia === 'Moderada' && styles.dualInnervationMedium
              ]}>
                <Text style={styles.dualInnervationMuscle}>
                  {hallazgo.musculo} (MRC: {hallazgo.mrc})
                </Text>
                <Text style={styles.dualInnervationRelevance}>
                  Relevancia: {hallazgo.relevancia}
                </Text>
                <Text style={styles.dualInnervationInterpretation}>
                  {hallazgo.interpretacion}
                </Text>
                <Text style={styles.dualInnervationClinical}>
                  💡 {hallazgo.info.relevanciaClinica}
                </Text>
              </View>
            ))}
          </View>
        )}

        <ResultsActions
          assessment={{
            diagnosticos: resultadosDiagnostico.slice(0, 5),
            mejorDiagnostico: mejorDiagnostico.nombreLesion,
            score: mejorDiagnostico.normalizedScore,
            interpretation: `Diagnóstico más probable: ${mejorDiagnostico.nombreLesion} con ${(mejorDiagnostico.normalizedScore * 100).toFixed(1)}% de coincidencia`,
            
            // Datos extendidos para el PDF
            evaluacionMuscular: Object.entries(datosEvaluacion.fuerzasMuscular).map(([musculo, mrc]) => ({
              musculo,
              mrc,
              interpretacion: mrc < 5 ? `Debilidad (MRC ${mrc})` : 'Normal'
            })),
            
            sintomasClinicosPresentes: datosEvaluacion.sintomasSeleccionados,
            areasSensibilidadAfectadas: datosEvaluacion.areasSeleccionadas,
            
            reflejos: [
              { nombre: 'Bicipital (C5-C6)', estado: datosEvaluacion.reflejos.bicipital },
              { nombre: 'Braquiorradial (C6-C7)', estado: datosEvaluacion.reflejos.braquiorradial },
              { nombre: 'Tricipital (C7-C8)', estado: datosEvaluacion.reflejos.tricipital }
            ],
            
            informacionAdicional: datosEvaluacion.informacionAdicional,
            
            // Análisis de inervación dual
            hallazgosInervacionDual: hallazgosInervacionDual.map(h => ({
              musculo: h.musculo,
              mrc: h.mrc,
              relevancia: h.relevancia,
              interpretacion: h.interpretacion,
              nerviosPrincipales: `${h.info.principal} / ${h.info.secundario}`,
              relevanciaClinica: h.info.relevanciaClinica
            })),
            
            // Explicación anatómica del mejor diagnóstico
            explicacionAnatomica: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion] ? {
              correlacionClinica: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].correlacionClinica,
              nerviosAfectados: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].nerviosAfectados,
              signosCaracteristicos: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].signosCaracteristicos,
              recorrido: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].recorrido.map(r => 
                `${r.estructura}: ${r.explicacion}`
              )
            } : undefined,
            
            // Diagnósticos diferenciales con scores
            diagnosticosDiferenciales: resultadosDiagnostico.slice(0, 5).map(d => ({
              nombre: d.nombreLesion,
              probabilidad: `${(d.normalizedScore * 100).toFixed(1)}%`,
              nerviosComprometidos: d.detalles.nerviosPerifericos.slice(0, 3),
              musculosAfectados: d.detalles.musculos.filter(m => m.esperado).slice(0, 3).map(m => m.nombre)
            })),
            
            patientData: {
              name: '',
              age: '',
              gender: '',
              doctorName: '',
            },
            answers: Object.entries(datosEvaluacion.fuerzasMuscular).map(([musculo, mrc]) => ({
              id: musculo,
              question: musculo,
              label: `MRC ${mrc}`,
              value: mrc,
              points: mrc,
            })),
          }}
          scale={{ id: 'plexo-braquial', name: 'Calculadora Diagnóstica del Plexo Braquial' } as any}
          containerStyle={{ marginTop: 16 }}
        />
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Diagnóstico Plexo Braquial' 
      }} />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Calculadora Diagnóstica Topográfica del Plexo Braquial</Text>
          
          {!calculoRealizado && (
            <>
              {/* Flexible Navigation Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.stepTabs}
              >
                {Array.from({ length: totalSteps }, (_, i) => {
                  const stepNumber = i + 1;
                  const isActive = currentStep === stepNumber;
                  const isComplete = isStepComplete(stepNumber);
                  
                  return (
                    <TouchableOpacity
                      key={stepNumber}
                      style={[
                        styles.stepTab,
                        isActive && styles.stepTabActive,
                        isComplete && styles.stepTabComplete
                      ]}
                      onPress={() => setCurrentStep(stepNumber)}
                    >
                      <View style={styles.stepTabContent}>
                        <Text style={[
                          styles.stepTabNumber,
                          isActive && styles.stepTabNumberActive,
                          isComplete && styles.stepTabNumberComplete
                        ]}>
                          {isComplete && !isActive ? '✓' : stepNumber}
                        </Text>
                        <Text style={[
                          styles.stepTabLabel,
                          isActive && styles.stepTabLabelActive
                        ]}>
                          {getStepLabel(stepNumber)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Current Step Content */}
              {renderCurrentStep()}

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                {currentStep < totalSteps ? (
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.nextButtonText}>Siguiente</Text>
                    <ChevronRight size={18} color={colors.buttonPrimaryText} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.calculateButton, !canCalculate && styles.calculateButtonDisabled]}
                    onPress={handleCalcular}
                    disabled={!canCalculate}
                  >
                    <Calculator size={18} color={colors.buttonPrimaryText} />
                    <Text style={styles.calculateButtonText}>Calcular Diagnóstico</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Clinical Cases Section */}
          {!calculoRealizado && (
            <View style={styles.clinicalCasesContainer}>
              <TouchableOpacity
                style={styles.clinicalCasesHeader}
                onPress={() => setShowClinicalCases(!showClinicalCases)}
              >
                <BookOpen size={20} color={colors.primary} />
                <Text style={styles.clinicalCasesTitle}>Casos Clínicos de Demostración</Text>
                {showClinicalCases ? (
                  <ChevronUp size={20} color={colors.primary} />
                ) : (
                  <ChevronDown size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              {showClinicalCases && (
                <View style={styles.clinicalCasesList}>
                  <Text style={styles.clinicalCasesDescription}>
                    Cargue un caso clínico predefinido para practicar el diagnóstico:
                  </Text>
                  {casosDisponibles.map(({ nombre, caso }) => (
                    <TouchableOpacity
                      key={nombre}
                      style={styles.clinicalCaseItem}
                      onPress={() => {
                        cargarCasoClinico(nombre);
                        setShowClinicalCases(false);
                      }}
                    >
                      <View style={styles.clinicalCaseHeader}>
                        <Text style={styles.clinicalCaseName}>{caso.nombre}</Text>
                        <Text style={styles.clinicalCaseExpected}>
                          Esperado: {caso.diagnosticoEsperado}
                        </Text>
                      </View>
                      <Text style={styles.clinicalCaseDescription}>{caso.descripcion}</Text>
                      <Text style={styles.clinicalCaseHistory} numberOfLines={2}>
                        {caso.historia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Results */}
          {calculoRealizado && renderResults()}

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReiniciar}>
            <RotateCcw size={18} color={colors.buttonPrimaryText} />
            <Text style={styles.resetButtonText}>Reiniciar Calculadora</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Nota: Esta herramienta es de apoyo diagnóstico y no sustituye la evaluación clínica.
            Creada por el Dr. Marcos Yocupicio para la aplicación de Escalas DLM.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
      lineHeight: 30,
    },
    progressContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    progressBar: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    progressStep: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
    },
    progressStepActive: {
      backgroundColor: colors.primary,
    },
    progressStepComplete: {
      backgroundColor: colors.success,
    },
    progressText: {
      fontSize: 14,
      color: colors.mutedText,
    },
    stepContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    stepDescription: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 16,
      lineHeight: 20,
    },
    muscleList: {
      maxHeight: 400,
    },
    muscleItem: {
      marginBottom: 16,
    },
    muscleLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    pickerContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: Platform.OS === 'ios' ? 0 : 8,
    },
    picker: {
      color: colors.text,
      height: Platform.OS === 'ios' ? 48 : 48,
      fontSize: 14,
    },
    pickerItem: {
      fontSize: 14,
      height: 48,
      color: colors.text,
    },
    checkboxGroup: {
      gap: 12,
    },
    checkboxGroupTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkboxItemSelected: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxCheck: {
      color: colors.buttonPrimaryText,
      fontSize: 12,
      fontWeight: 'bold',
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    checkboxLabelSelected: {
      color: colors.primary,
      fontWeight: '500',
    },
    reflexContainer: {
      gap: 16,
    },
    reflexLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    additionalInfo: {
      gap: 16,
    },
    infoLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 16,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      justifyContent: 'center',
    },
    navButtonDisabled: {
      backgroundColor: colors.mutedBackground,
    },
    navButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    navButtonTextDisabled: {
      color: colors.mutedText,
    },
    calculateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.success,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      justifyContent: 'center',
    },
    calculateButtonDisabled: {
      backgroundColor: colors.mutedBackground,
    },
    calculateButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    resultsContainer: {
      gap: 12,
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bestResultCard: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    resultName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    bestResultName: {
      color: colors.primary,
      fontSize: 17,
    },
    resultScore: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.success,
    },
    bestResultScore: {
      fontSize: 18,
      color: colors.primary,
    },
    resultDetails: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      marginTop: 8,
    },
    detailsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    detailSection: {
      marginBottom: 8,
    },
    detailSectionTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    detailItem: {
      fontSize: 12,
      color: colors.mutedText,
      marginLeft: 12,
      marginBottom: 2,
    },
    noResultsContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    noResultsText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    noResultsSubtext: {
      fontSize: 14,
      color: colors.mutedText,
      textAlign: 'center',
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.error,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      justifyContent: 'center',
      marginTop: 16,
    },
    resetButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    disclaimer: {
      fontSize: 12,
      color: colors.mutedText,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 24,
      paddingHorizontal: 16,
      lineHeight: 16,
    },
    // Clinical Cases Styles
    clinicalCasesContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clinicalCasesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    clinicalCasesTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    clinicalCasesList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    clinicalCasesDescription: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 12,
      lineHeight: 20,
    },
    clinicalCaseItem: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clinicalCaseHeader: {
      marginBottom: 8,
    },
    clinicalCaseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    clinicalCaseExpected: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '500',
    },
    clinicalCaseDescription: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 6,
    },
    clinicalCaseHistory: {
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    // Anatomical Explanation Styles
    anatomicalExplanation: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    anatomicalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    anatomicalTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      flex: 1,
    },
    anatomicalContent: {
      paddingTop: 8,
      gap: 8,
    },
    anatomicalText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      marginBottom: 8,
    },
    anatomicalSectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    anatomicalStep: {
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 16,
      marginBottom: 4,
      marginLeft: 8,
    },
    anatomicalBullet: {
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 16,
      marginBottom: 2,
      marginLeft: 8,
    },
    // Dual Innervation Styles
    dualInnervationContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dualInnervationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    dualInnervationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    dualInnervationItem: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dualInnervationHigh: {
      borderColor: colors.error,
      backgroundColor: colors.errorLight || colors.surface,
    },
    dualInnervationMedium: {
      borderColor: colors.warning,
      backgroundColor: colors.warningLight || colors.surface,
    },
    dualInnervationMuscle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    dualInnervationRelevance: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
      marginBottom: 6,
    },
    dualInnervationInterpretation: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      marginBottom: 6,
    },
    dualInnervationClinical: {
      fontSize: 12,
      color: colors.mutedText,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    // Feedback Styles
    feedbackContainer: {
      marginTop: 16,
      gap: 12,
    },
    feedbackMessage: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      gap: 8,
    },
    feedbackError: {
      backgroundColor: colors.errorLight || '#fef2f2',
      borderColor: colors.error,
    },
    feedbackWarning: {
      backgroundColor: colors.warningLight || '#fefce8',
      borderColor: colors.warning,
    },
    feedbackText: {
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
    feedbackTextError: {
      color: colors.error,
    },
    feedbackTextWarning: {
      color: colors.warning,
    },
    suggestionsContainer: {
      backgroundColor: colors.primaryLight || colors.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    suggestionsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
    },
    suggestionText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      marginBottom: 4,
    },
    // SVG Visualization Styles
    svgContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    svgHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
    },
    educationalLink: {
      marginRight: 8,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    educationalLinkText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    svgTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    animationToggle: {
      backgroundColor: colors.surface,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    animationToggleActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    animationToggleText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    animationToggleTextActive: {
      color: colors.buttonPrimaryText,
    },
    svgDescription: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    // New UX Styles
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 2,
      flex: 1,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: colors.primary,
    },
    modeButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.mutedText,
    },
    modeButtonTextActive: {
      color: colors.buttonPrimaryText,
    },
    summaryToggle: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryToggleActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    summaryToggleText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    summaryToggleTextActive: {
      color: colors.buttonPrimaryText,
    },
    quickMuscleList: {
      maxHeight: 400,
      marginTop: 8,
    },
    quickMuscleItem: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickMuscleLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    regionTabs: {
      marginVertical: 8,
      maxHeight: 50,
    },
    regionTab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    regionTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    regionTabText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
    regionTabTextActive: {
      color: colors.buttonPrimaryText,
    },
    regionMuscleList: {
      maxHeight: 350,
      marginTop: 8,
    },
    regionMuscleItem: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    regionMuscleLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    // Flexible Navigation Styles
    stepTabs: {
      marginBottom: 20,
      maxHeight: 80,
    },
    stepTab: {
      marginRight: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 80,
    },
    stepTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepTabComplete: {
      backgroundColor: colors.successLight || colors.surface,
      borderColor: colors.success,
    },
    stepTabContent: {
      alignItems: 'center',
    },
    stepTabNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    stepTabNumberActive: {
      color: colors.buttonPrimaryText,
    },
    stepTabNumberComplete: {
      color: colors.success,
    },
    stepTabLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.mutedText,
      textAlign: 'center',
    },
    stepTabLabelActive: {
      color: colors.buttonPrimaryText,
    },
    actionContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    nextButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    // Confidence Metrics Styles
    confidenceSection: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confidenceBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginVertical: 8,
      overflow: 'hidden',
    },
    confidenceLevel: {
      height: '100%',
      borderRadius: 4,
    },
    confidenceText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    factorsSection: {
      marginTop: 12,
    },
    factorsTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    factorItem: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 16,
      marginBottom: 2,
      marginLeft: 8,
    },
    // Severity Styles
    severitySection: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    severityInfo: {
      marginTop: 8,
    },
    severityGrade: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    severityDescription: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 6,
      lineHeight: 18,
    },
    severityPrognosis: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 4,
    },
    severityTime: {
      fontSize: 12,
      color: colors.mutedText,
      marginBottom: 4,
    },
    severityTreatment: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 16,
      fontStyle: 'italic',
    },
    // Temporal Analysis Styles
    temporalSection: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    temporalPhase: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 8,
      marginBottom: 4,
    },
    temporalPattern: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 8,
    },
    prognosticFactors: {
      marginTop: 8,
    },
    // Clinical Context Styles
    clinicalContext: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contextAge: {
      fontSize: 13,
      color: colors.text,
      marginTop: 8,
      marginBottom: 12,
      fontWeight: '500',
    },
    contextSection: {
      marginTop: 8,
    },
  });
