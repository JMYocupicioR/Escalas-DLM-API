import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router/stack';
import { Picker } from '@react-native-picker/picker';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { usePlexoBraquialAssessment } from '@/hooks/usePlexoBraquialAssessment';
import { createPlexoBraquialStyles } from './_plexo-braquial.styles';
import {
  SINTOMAS_CLINICOS,
  AREAS_SENSIBILIDAD,
  OPCIONES_REFLEJOS,
  OPCIONES_TIPO_PLEXO,
  OPCIONES_CONTEXTO_CLINICO,
  OPCIONES_FASE_EVOLUTIVA,
  OPCIONES_PATRON_EVOLUCION
} from '@/data/plexoBraquial';
import {
  ChevronRight,
  Calculator,
  RotateCcw,
  Info,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Step1MuscleEvaluation } from '@/components/plexo-calculator/Step1MuscleEvaluation';
import { Step2Symptoms } from '@/components/plexo-calculator/Step2Symptoms';
import { Step3Sensibility } from '@/components/plexo-calculator/Step3Sensibility';
import { Step4Reflexes } from '@/components/plexo-calculator/Step4Reflexes';
import { Step5AdditionalInfo } from '@/components/plexo-calculator/Step5AdditionalInfo';
import { ResultsDisplay } from '@/components/plexo-calculator/ResultsDisplay';

export default function PlexoBraquialCalculator() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createPlexoBraquialStyles(colors), [colors]);
  
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

  const handleCalcular = () => {
    const validationMessage = getCalculationValidationMessage();
    if (validationMessage) {
      const isError = validationMessage.startsWith('Debe');
      const isWarning = validationMessage.includes('Recomendamos') || validationMessage.includes('Considere');
      
      Alert.alert(
        'Validación', 
        validationMessage, 
        isError
          ? [{ text: 'Revisar', style: 'default' }]
          : [
              { text: 'Revisar', style: 'default' },
              { text: 'Calcular de todos modos', onPress: realizarCalculo, style: 'destructive' }
            ]
      );
      if (isError) {
        return;
      }
      // If it's just a warning, we still allow the calculation after the alert.
      if (!isWarning) {
        realizarCalculo();
      }
    } else {
      realizarCalculo();
    }
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
    return (
      <Step1MuscleEvaluation
        styles={styles}
        colors={colors}
        datosEvaluacion={datosEvaluacion}
        updateFuerzaMuscular={updateFuerzaMuscular}
        renderStepFeedback={renderStepFeedback}
      />
    );
  };

  const renderStep2 = () => {
    return (
      <Step2Symptoms
        styles={styles}
        colors={colors}
        datosEvaluacion={datosEvaluacion}
        updateSintomas={updateSintomas}
        renderCheckboxGroup={renderCheckboxGroup}
        renderStepFeedback={renderStepFeedback}
        SINTOMAS_CLINICOS={SINTOMAS_CLINICOS}
      />
    );
  };

  const renderStep3 = () => {
    return (
      <Step3Sensibility
        styles={styles}
        colors={colors}
        datosEvaluacion={datosEvaluacion}
        updateAreas={updateAreas}
        renderCheckboxGroup={renderCheckboxGroup}
        renderStepFeedback={renderStepFeedback}
        AREAS_SENSIBILIDAD={AREAS_SENSIBILIDAD}
      />
    );
  };

  const renderStep4 = () => {
    return (
      <Step4Reflexes
        styles={styles}
        colors={colors}
        datosEvaluacion={datosEvaluacion}
        updateReflejo={updateReflejo}
        renderPicker={renderPicker}
        renderStepFeedback={renderStepFeedback}
        OPCIONES_REFLEJOS={OPCIONES_REFLEJOS}
      />
    );
  };

  const renderStep5 = () => {
    return (
      <Step5AdditionalInfo
        styles={styles}
        colors={colors}
        datosEvaluacion={datosEvaluacion}
        updateContextoClinico={updateContextoClinico}
        updateTiempoEvolucion={updateTiempoEvolucion}
        updateFaseEvolutiva={updateFaseEvolutiva}
        updatePatronEvolucion={updatePatronEvolucion}
        updateInformacionAdicional={updateInformacionAdicional}
        renderPicker={renderPicker}
        renderStepFeedback={renderStepFeedback}
        OPCIONES_CONTEXTO_CLINICO={OPCIONES_CONTEXTO_CLINICO}
        OPCIONES_FASE_EVOLUTIVA={OPCIONES_FASE_EVOLUTIVA}
        OPCIONES_PATRON_EVOLUCION={OPCIONES_PATRON_EVOLUCION}
        OPCIONES_TIPO_PLEXO={OPCIONES_TIPO_PLEXO}
      />
    );
  };

  const renderResults = () => {
    return (
      <ResultsDisplay
        styles={styles}
        colors={colors}
        calculoRealizado={calculoRealizado}
        resultadosDiagnostico={resultadosDiagnostico}
        hallazgosInervacionDual={hallazgosInervacionDual}
        datosEvaluacion={datosEvaluacion}
      />
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
                      <Text style={styles.clinicalCasesDescription}>{caso.descripcion}</Text>
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
