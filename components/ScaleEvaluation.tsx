import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ScaleWithDetails, ScoringRange } from '@/api/scales/types';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import LoadingState from '@/components/errors/LoadingState';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useSettingsStore } from '@/store/settingsStore';
import { ArrowLeft, ArrowRight, X, Share2, Clock, CheckCircle2, AlertCircle, Save, ZoomIn } from 'lucide-react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { OptionCard } from '@/components/ui/OptionCard';
import { OptionsGrid } from '@/components/ui/OptionsGrid';
import { ImageZoomModal } from '@/components/ui/ImageZoomModal';
import { calculateSF36, getSF36Interpretation, getSF36DetailedResults, SF36Scores } from '@/utils/sf36Calculator';
import { getProfile } from '@/api/profile';
import { getPatient as fetchPatientFromDB } from '@/api/patients';
import { useAuthSession } from '@/hooks/useAuthSession';

export interface SaveToHistoryPayload {
  patient_id: string;
  scale_slug: string;
  responses: Record<string, number | string>;
  total_score?: number;
  interpretation?: string;
  subscale_scores?: Record<string, unknown>;
}

interface ScaleEvaluationProps {
  scale: ScaleWithDetails;
  onCancel: () => void;
  onComplete?: (assessment: { scale_id: string; responses: Record<string, number | string> }) => void;
  patientRequired?: boolean;
  /** When set, patient and clinic are shown in results and "Guardar en historial" is available */
  patientId?: string;
  patient?: { name?: string | null; institution_id?: string | null; gender?: string | null; birth_date?: string | null };
  onSaveToHistory?: (payload: SaveToHistoryPayload) => Promise<any>;
  /** Notify parent when user picks a patient from the form (inline picker) */
  onPatientSelected?: (patient: { id: string; name?: string | null; gender?: string | null; birth_date?: string | null }) => void;
}

type Interpretation = {
  level: string;
  text: string;
  recommendations?: string;
  colorCode?: string;
};

interface EvaluationState {
  currentStep: 'patient' | 'evaluation' | 'results';
  currentQuestionIndex: number;
  responses: Record<string, number | string>;
  startTime: Date;
  endTime?: Date;
  totalScore?: number;
  interpretation?: Interpretation | null;
  bostonSubscores?: {
    sssAvg: number;
    fssAvg: number;
    sssLevel: string;
    fssLevel: string;
  } | null;
  sf36Scores?: SF36Scores | null;
  mmseScores?: {
    orientacionTemporal: number;
    orientacionEspacial: number;
    memoriaInmediata: number;
    atencionCalculo: number;
    memoriaDiferida: number;
    lenguaje: number;
    construccion: number;
  } | null;
}

export const ScaleEvaluation: React.FC<ScaleEvaluationProps> = ({
  scale,
  onCancel,
  onComplete,
  patientId,
  patient,
  onSaveToHistory,
  onPatientSelected,
}) => {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const { isDesktop, isTablet } = useResponsiveLayout();
  const autoAdvanceQuestions = useSettingsStore((state) => state.autoAdvanceQuestions);
  const styles = useMemo(() => createStyles(colors, isDesktop || isTablet, fontSizeMultiplier), [colors, isDesktop, isTablet, fontSizeMultiplier]);
  const { session } = useAuthSession();

  const [state, setState] = useState<EvaluationState>({
    // Always show patient step first so user can pick/create a patient
    currentStep: 'patient',
    currentQuestionIndex: 0,
    responses: {},
    startTime: new Date(),
  });

  const [animatedValue] = useState(new Animated.Value(0));
  const lastSelectionRef = useRef<{ id: string; value: number | string } | null>(null);
  const [saveToHistoryLoading, setSaveToHistoryLoading] = useState(false);
  const [saveToHistoryDone, setSaveToHistoryDone] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(patientId);
  const [selectedPatient, setSelectedPatient] = useState<{ name?: string | null; gender?: string | null; birth_date?: string | null } | null>(
    patient ? { name: patient.name, gender: patient.gender, birth_date: patient.birth_date } : null
  );
  const effectivePatientId = patientId || selectedPatientId;
  const [patientSummary, setPatientSummary] = useState<{ name?: string | null; gender?: string | null; birth_date?: string | null }>({
    name: patient?.name,
    gender: patient?.gender,
    birth_date: patient?.birth_date,
  });
  const [doctorName, setDoctorName] = useState<string>('');

  const sortedQuestions = useMemo(() => {
    return [...scale.questions].sort((a, b) => a.order_index - b.order_index);
  }, [scale.questions]);

  const currentQuestion = sortedQuestions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / sortedQuestions.length) * 100;

  // Progress animation
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleAnswerSelect = useCallback((value: number | string) => {
    if (currentQuestion?.question_id) {
      lastSelectionRef.current = { id: currentQuestion.question_id, value };
    }
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [currentQuestion.question_id]: value,
      },
    }));
  }, [currentQuestion?.question_id]);

  const handleNext = useCallback(() => {
    if (state.currentQuestionIndex < sortedQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      // Calculate final score and show results
      calculateResults();
    }
  }, [state.currentQuestionIndex, sortedQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [state.currentQuestionIndex]);

  // Keyboard shortcuts for desktop (number keys 0-9 for option selection, arrows for navigation)
  useEffect(() => {
    if (Platform.OS !== 'web' || state.currentStep !== 'evaluation') return;
    const currentQ = sortedQuestions[state.currentQuestionIndex];
    if (!currentQ) return;

    const handler = (e: KeyboardEvent) => {
      // Arrow navigation
      if (e.key === 'ArrowLeft' && state.currentQuestionIndex > 0) {
        e.preventDefault();
        handlePrevious();
        return;
      }
      if (e.key === 'ArrowRight') {
        const val = state.responses[currentQ.question_id];
        if (val != null) {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      // Number keys for option selection
      const num = parseInt(e.key);
      if (!isNaN(num) && currentQ.options) {
        const sorted = [...currentQ.options].sort((a, b) => a.order_index - b.order_index);
        const match = sorted.find(opt => Number(opt.option_value) === num);
        if (match) {
          e.preventDefault();
          handleAnswerSelect(match.option_value);
          if (autoAdvanceQuestions) {
            setTimeout(() => handleNext(), 300);
          }
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.currentStep, state.currentQuestionIndex, state.responses, sortedQuestions, handlePrevious, handleNext, handleAnswerSelect, autoAdvanceQuestions]);

  const calculateResults = useCallback(() => {
    if (!scale.scoring) {
      Alert.alert('Error', 'Esta escala no tiene sistema de puntuación configurado');
      return;
    }

    // Include latest selection if state hasn't flushed yet
    const workingResponses: Record<string, number | string> = { ...state.responses };
    if (lastSelectionRef.current && workingResponses[lastSelectionRef.current.id] === undefined) {
      workingResponses[lastSelectionRef.current.id] = lastSelectionRef.current.value;
    }

    let totalScore = 0;
    const scoring = scale.scoring;

    // Calculate based on scoring method
    switch (scoring.scoring_method) {
      case 'sum':
        totalScore = Object.values(workingResponses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
        break;
        
      case 'average':
        const numericValues = Object.values(workingResponses)
          .filter((value): value is number => typeof value === 'number');
        totalScore = numericValues.length > 0 
          ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
          : 0;
        break;
        
      case 'weighted':
        // Si no hay pesos definidos en el modelo, utilizar suma como fallback
        totalScore = Object.values(workingResponses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
        break;
        
      default:
        totalScore = Object.values(workingResponses)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
    }

    // Find interpretation based on scoring ranges
    let interpretation = findInterpretation(totalScore, scoring.ranges);

    // SF-36: calcular las 8 dimensiones
    let sf36Scores: SF36Scores | null = null;
    if (scale.id === 'sf36') {
      sf36Scores = calculateSF36(workingResponses);
      totalScore = sf36Scores.promedioTotal;
      const sf36Interp = getSF36Interpretation(totalScore);
      interpretation = {
        level: sf36Interp.level,
        text: sf36Interp.text,
        colorCode: sf36Interp.colorCode,
      } as Interpretation;
    }

    // MMSE: calcular puntuaciones por dominio cognitivo
    let mmseScores: EvaluationState['mmseScores'] = null;
    if (scale.id === 'mmse') {
      const categorizeScore = (category: string) => {
        return sortedQuestions
          .filter(q => q.category === category)
          .reduce((sum, q) => sum + (Number(workingResponses[q.question_id]) || 0), 0);
      };

      mmseScores = {
        orientacionTemporal: categorizeScore('Orientación Temporal'),
        orientacionEspacial: categorizeScore('Orientación Espacial'),
        memoriaInmediata: categorizeScore('Memoria Inmediata'),
        atencionCalculo: categorizeScore('Atención y Cálculo'),
        memoriaDiferida: categorizeScore('Memoria Diferida'),
        lenguaje: categorizeScore('Lenguaje - Denominación') + categorizeScore('Lenguaje - Repetición') +
                  categorizeScore('Lenguaje - Comprensión') + categorizeScore('Lenguaje - Lectura') +
                  categorizeScore('Lenguaje - Escritura'),
        construccion: categorizeScore('Construcción Visuoespacial'),
      };
    }

    // Boston: calcular subescalas SSS/FSS y enriquecer interpretación
    let bostonSubscores: EvaluationState['bostonSubscores'] = null;
    if (scale.id === 'boston') {
      const sssIds = new Set(
        sortedQuestions.filter(q => (q.category || '').toUpperCase().includes('SSS')).map(q => q.question_id)
      );
      const fssIds = new Set(
        sortedQuestions.filter(q => (q.category || '').toUpperCase().includes('FSS')).map(q => q.question_id)
      );
      const entries = (
        Object.entries(workingResponses).filter(([, v]) => typeof v === 'number') as Array<[string, number]>
      ).map(([id, v]) => [id, Number(v)] as [string, number]);
      const sssVals = entries.filter(([id]) => sssIds.has(id)).map(([, v]) => v);
      const fssVals = entries.filter(([id]) => fssIds.has(id)).map(([, v]) => v);
      const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      const sssAvg = Number(avg(sssVals).toFixed(2));
      const fssAvg = Number(avg(fssVals).toFixed(2));
      const mapLevel = (score: number, ranges: { min: number; max: number; level: string }[]) =>
        (ranges.find(r => score >= r.min && score <= r.max)?.level) || 'No determinado';
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const interp = require('@/data/boston').scoreInterpretation as { symptomSeverity: any[]; functionalStatus: any[] };
        const sssLevel = mapLevel(sssAvg, interp.symptomSeverity);
        const fssLevel = mapLevel(fssAvg, interp.functionalStatus);
        bostonSubscores = { sssAvg, fssAvg, sssLevel, fssLevel };
        interpretation = {
          level: 'Resultados por subescalas',
          text: `SSS: ${sssLevel} (${sssAvg}) | FSS: ${fssLevel} (${fssAvg})`,
        } as Interpretation;
      } catch {
        bostonSubscores = { sssAvg, fssAvg, sssLevel: 'No determinado', fssLevel: 'No determinado' };
      }
    }

    setState(prev => ({
      ...prev,
      currentStep: 'results',
      endTime: new Date(),
      totalScore,
      interpretation,
      bostonSubscores,
      sf36Scores,
      mmseScores,
    }));
  }, [scale.scoring, state.responses]);

  useEffect(() => {
    if (state.currentStep === 'results') {
      try {
        onComplete?.({
          scale_id: scale.id,
          responses: state.responses,
        });
      } catch {}
    }
  }, [state.currentStep]);

  const findInterpretation = (score: number, ranges: ScoringRange[]) => {
    const matchingRange = ranges.find(range => 
      score >= range.min_value && score <= range.max_value
    );
    
    return matchingRange ? ({
      level: matchingRange.interpretation_level,
      text: matchingRange.interpretation_text,
      recommendations: matchingRange.recommendations,
      colorCode: matchingRange.color_code,
    } as Interpretation) : null;
  };

  const calcAgeFromBirthDate = (birth?: string | null) => {
    if (!birth) return undefined;
    const bd = new Date(birth);
    if (Number.isNaN(bd.getTime())) return undefined;
    return Math.max(0, Math.floor((Date.now() - bd.getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
  };

  // Load patient from props OR from Supabase when we have an id
  useEffect(() => {
    if (patient?.name) {
      setPatientSummary({
        name: patient.name,
        gender: patient.gender,
        birth_date: patient.birth_date,
      });
      return;
    }
    // If we have a patientId but no patient prop data, fetch from DB
    const pid = patientId || selectedPatientId;
    if (!pid) return;
    fetchPatientFromDB(pid)
      .then(({ data }) => {
        if (data) {
          setPatientSummary({
            name: data.name,
            gender: data.gender,
            birth_date: data.birth_date,
          });
        }
      })
      .catch(() => {});
  }, [patient?.name, patient?.gender, patient?.birth_date, patientId, selectedPatientId]);

  // Prefill doctor from profile
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || doctorName) return;
    getProfile(userId)
      .then(({ data }) => {
        if (data?.full_name) setDoctorName(data.full_name);
      })
      .catch(() => {});
  }, [session?.user?.id, doctorName]);

  // En esta pantalla no se envía aún al backend de evaluaciones; se puede implementar según API

  const renderPatientStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información del Paciente</Text>
      <PatientForm
        scaleId={scale.id}
        onContinue={(formData) => {
          console.log('ScaleEvaluation received form data:', formData);
          // Populate patientSummary from the form data when user clicks "Continuar"
          if (formData) {
            const newSummary = {
              name: formData.name || patientSummary.name,
              gender: formData.gender || patientSummary.gender,
              birth_date: patientSummary.birth_date, // keep birth_date from picker selection
            };
            console.log('Setting patientSummary:', newSummary);
            setPatientSummary(newSummary);
            if (formData.doctorName) {
              console.log('Setting doctorName:', formData.doctorName);
              setDoctorName(formData.doctorName);
            }
            if (formData.id) {
              console.log('Setting selectedPatientId:', formData.id);
              setSelectedPatientId(formData.id);
            }
          }
          setState(prev => ({ ...prev, currentStep: 'evaluation' }));
        }}
        allowSkip={true}
        onPatientSelected={(p) => {
          setSelectedPatientId(p.id);
          setSelectedPatient({ name: p.name, gender: p.gender, birth_date: p.birth_date });
          setPatientSummary({ name: p.name, gender: p.gender, birth_date: p.birth_date });
          onPatientSelected?.(p);
        }}
      />
    </View>
  );

  const [imageZoomVisible, setImageZoomVisible] = useState(false);
  const [zoomImageUri, setZoomImageUri] = useState('');

  const renderEvaluationStep = () => {
    if (!currentQuestion) {
      return <LoadingState message="Cargando pregunta..." />;
    }

    const selectedValue = state.responses[currentQuestion.question_id];
    const sortedOptions = [...currentQuestion.options].sort((a, b) => a.order_index - b.order_index);
    const questionImageUrl = currentQuestion.image_url ?? currentQuestion.imageUrl;
    const screenWidth = Dimensions.get('window').width;
    const imageMaxHeight = (isDesktop || isTablet) ? 360 : Math.min(screenWidth * 0.55, 280);

    // Prepare options for OptionsGrid
    const gridOptions = sortedOptions.map(opt => ({
      label: opt.option_label,
      value: opt.option_value,
      description: opt.option_description,
      id: opt.id,
    }));

    const handleOptionSelect = (value: number | string) => {
      handleAnswerSelect(value);
      if (autoAdvanceQuestions) {
        setTimeout(() => {
          handleNext();
        }, 300);
      }
    };

    const renderQuestionContent = () => (
      <>
        <Text style={styles.questionTitle}>{currentQuestion.question_text}</Text>
        {currentQuestion.description && (
          <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
        )}
        {questionImageUrl && (
          <Pressable
            style={styles.imageWrapper}
            onPress={() => {
              setZoomImageUri(questionImageUrl);
              setImageZoomVisible(true);
            }}
          >
            <Image
              source={{ uri: questionImageUrl }}
              style={[styles.questionImage, { maxHeight: imageMaxHeight }]}
              resizeMode="contain"
            />
            <View style={[styles.zoomHint, { backgroundColor: colors.card + 'DD' }]}>
              <ZoomIn size={14} color={colors.primary} />
              <Text style={[styles.zoomHintText, { color: colors.primary }]}>Ampliar</Text>
            </View>
          </Pressable>
        )}
        {currentQuestion.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Instrucciones:</Text>
            <Text style={styles.instructionsText}>{currentQuestion.instructions}</Text>
          </View>
        )}
      </>
    );

    return (
      <View style={styles.stepContainer}>
        {/* SINGLE ScrollView — no nested scroll */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Bar */}
          <View style={styles.progressWrapper}>
            <ProgressBar
              current={state.currentQuestionIndex + 1}
              total={sortedQuestions.length}
              showCounter={true}
              showPercentage={isDesktop || isTablet}
              animated={true}
              height={isDesktop || isTablet ? 8 : 6}
            />
          </View>

          {(isDesktop || isTablet) ? (
            /* Desktop/Tablet: Two-column layout */
            <View style={styles.evaluationGrid}>
              <View style={styles.questionPanel}>
                {renderQuestionContent()}
              </View>
              <View style={styles.optionsPanel}>
                <OptionsGrid
                  options={gridOptions}
                  selectedValue={selectedValue}
                  onSelect={handleOptionSelect}
                  colors={colors}
                  fontSizeMultiplier={fontSizeMultiplier}
                />
              </View>
            </View>
          ) : (
            /* Mobile: Single column, question then options */
            <View>
              <View style={styles.questionContainer}>
                {renderQuestionContent()}
              </View>
              <OptionsGrid
                options={gridOptions}
                selectedValue={selectedValue}
                onSelect={handleOptionSelect}
                colors={colors}
                fontSizeMultiplier={fontSizeMultiplier}
              />
            </View>
          )}
        </ScrollView>

        {/* Fixed Navigation Bar */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonSecondary,
              state.currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={state.currentQuestionIndex === 0}
          >
            <ArrowLeft size={18} color={state.currentQuestionIndex === 0 ? colors.mutedText : colors.buttonSecondaryText} />
            <Text style={[
              styles.navButtonText,
              styles.navButtonTextSecondary,
              state.currentQuestionIndex === 0 && { color: colors.mutedText },
            ]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              selectedValue == null && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedValue == null}
          >
            <Text style={[
              styles.navButtonText,
              styles.navButtonTextPrimary,
              selectedValue == null && { color: colors.mutedText },
            ]}>
              {state.currentQuestionIndex === sortedQuestions.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Text>
            <ArrowRight size={18} color={selectedValue == null ? colors.mutedText : colors.buttonPrimaryText} />
          </TouchableOpacity>
        </View>

        {/* Image zoom modal */}
        {zoomImageUri ? (
          <ImageZoomModal
            visible={imageZoomVisible}
            imageUri={zoomImageUri}
            onClose={() => setImageZoomVisible(false)}
          />
        ) : null}
      </View>
    );
  };

  const renderResultsStep = () => {
    console.log('renderResultsStep called, patientSummary:', patientSummary, 'doctorName:', doctorName);
    return (
    <View style={styles.stepContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.resultsHeader}
        >
          <Text style={styles.resultsTitle}>Evaluación Completada</Text>
          <Text style={styles.scaleName}>{scale.name}</Text>
        </LinearGradient>

        {/* Datos del Paciente */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Datos del Paciente [DEBUG]</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre:</Text>
            <Text style={styles.summaryValue}>
              {patientSummary.name || patient?.name || selectedPatient?.name || 'VACÍO'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Edad:</Text>
            <Text style={styles.summaryValue}>
              {calcAgeFromBirthDate(patientSummary.birth_date || patient?.birth_date || selectedPatient?.birth_date) ?? 'VACÍO'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Género:</Text>
            <Text style={styles.summaryValue}>
              {patientSummary.gender || patient?.gender || selectedPatient?.gender || 'VACÍO'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Médico:</Text>
            <Text style={styles.summaryValue}>
              {doctorName || 'VACÍO'}
            </Text>
          </View>
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Puntuación Total</Text>
          <Text style={styles.scoreValue}>{state.totalScore}</Text>
          {scale.scoring && (
            <Text style={styles.scoreRange}>
              Rango: {scale.scoring.min_score} - {scale.scoring.max_score}
            </Text>
          )}
        </View>

        {/* Interpretation */}
        {state.interpretation && (
          <View style={[
            styles.interpretationContainer,
            { borderLeftColor: state.interpretation.colorCode || colors.primary }
          ]}>
            <Text style={styles.interpretationLevel}>
              {state.interpretation.level}
            </Text>
            <Text style={styles.interpretationText}>
              {state.interpretation.text}
            </Text>
            {state.interpretation.recommendations && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsLabel}>Recomendaciones:</Text>
                <Text style={styles.recommendationsText}>
                  {state.interpretation.recommendations}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Lawton & Brody detailed area analysis */}
        {scale.id === 'lawton-brody' && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>📋 Análisis Detallado por Área</Text>
            {scale.questions?.map((question, idx) => {
              const response = state.responses[question.question_id];
              const selectedOption = question.options?.find(opt => opt.option_value === response);
              const score = selectedOption?.option_value || 0;
              const isIndependent = score === 1;
              
              // @ts-ignore - areaInterpretations is custom metadata
              const areaInterp = scale.areaInterpretations?.[question.question_id];
              
              return (
                <View key={question.id} style={styles.lawtonAreaRow}>
                  <View style={styles.lawtonAreaHeader}>
                    <Text style={styles.lawtonAreaIcon}>
                      {isIndependent ? '✅' : '❌'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lawtonAreaTitle}>
                        {question.question_text}
                      </Text>
                      <Text style={styles.lawtonAreaScore}>
                        {score} punto{score !== 1 ? 's' : ''} - {isIndependent ? 'Independiente' : 'Dependiente'}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedOption && (
                    <Text style={styles.lawtonSelectedOption}>
                      Respuesta: {selectedOption.option_label}
                    </Text>
                  )}
                  
                  {areaInterp && (
                    <View style={[
                      styles.lawtonInterpretation,
                      { backgroundColor: isIndependent ? '#10B98115' : '#EF444415' }
                    ]}>
                      <Text style={styles.lawtonInterpretationText}>
                        {isIndependent ? areaInterp.independent : areaInterp.dependent}
                      </Text>
                      
                      {!isIndependent && areaInterp.intervention && (
                        <View style={styles.lawtonIntervention}>
                          <Text style={styles.lawtonInterventionLabel}>💡 Intervención Sugerida:</Text>
                          <Text style={styles.lawtonInterventionText}>
                            {areaInterp.intervention}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Boston subscales breakdown */}
        {scale.id === 'boston' && state.bostonSubscores && (
          <>
            {/* Resumen por Subescalas */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resultados por Subescala</Text>

              {/* SSS - Severidad de Síntomas */}
              <View style={styles.subscaleSection}>
                <View style={styles.subscaleHeader}>
                  <Text style={styles.subscaleTitle}>Escala de Severidad de Síntomas (SSS)</Text>
                  <View style={styles.subscaleScoreBadge}>
                    <Text style={styles.subscaleScoreValue}>{state.bostonSubscores.sssAvg}</Text>
                    <Text style={styles.subscaleScoreMax}> / 5.0</Text>
                  </View>
                </View>
                <View style={[
                  styles.subscaleInterpretation,
                  {
                    borderLeftColor: state.bostonSubscores.sssAvg < 2 ? '#10B981' :
                                    state.bostonSubscores.sssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                  }
                ]}>
                  <Text style={[
                    styles.subscaleLevel,
                    {
                      color: state.bostonSubscores.sssAvg < 2 ? '#10B981' :
                            state.bostonSubscores.sssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                    }
                  ]}>
                    {state.bostonSubscores.sssLevel}
                  </Text>
                  <Text style={styles.subscaleDescription}>
                    {state.bostonSubscores.sssAvg < 2
                      ? 'Los síntomas del túnel carpiano son leves. Continuar con seguimiento.'
                      : state.bostonSubscores.sssAvg < 3.5
                      ? 'Los síntomas son moderados. Considerar tratamiento conservador intensivo (férulas nocturnas, modificación de actividades, antiinflamatorios).'
                      : 'Los síntomas son severos. Evaluar indicación quirúrgica. Considerar liberación del túnel carpiano.'
                    }
                  </Text>
                </View>

                {/* Barra de progreso SSS */}
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.bostonSubscores.sssAvg / 5) * 100}%`,
                      backgroundColor: state.bostonSubscores.sssAvg < 2 ? '#10B981' :
                                      state.bostonSubscores.sssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* FSS - Estado Funcional */}
              <View style={styles.subscaleSection}>
                <View style={styles.subscaleHeader}>
                  <Text style={styles.subscaleTitle}>Escala de Estado Funcional (FSS)</Text>
                  <View style={styles.subscaleScoreBadge}>
                    <Text style={styles.subscaleScoreValue}>{state.bostonSubscores.fssAvg}</Text>
                    <Text style={styles.subscaleScoreMax}> / 5.0</Text>
                  </View>
                </View>
                <View style={[
                  styles.subscaleInterpretation,
                  {
                    borderLeftColor: state.bostonSubscores.fssAvg < 2 ? '#10B981' :
                                    state.bostonSubscores.fssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                  }
                ]}>
                  <Text style={[
                    styles.subscaleLevel,
                    {
                      color: state.bostonSubscores.fssAvg < 2 ? '#10B981' :
                            state.bostonSubscores.fssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                    }
                  ]}>
                    {state.bostonSubscores.fssLevel}
                  </Text>
                  <Text style={styles.subscaleDescription}>
                    {state.bostonSubscores.fssAvg < 2
                      ? 'El impacto funcional es mínimo. Las actividades de la vida diaria se realizan con normalidad.'
                      : state.bostonSubscores.fssAvg < 3.5
                      ? 'Existe dificultad moderada para realizar actividades manuales. Recomendar terapia ocupacional y adaptaciones.'
                      : 'Limitación funcional severa. Evaluar cirugía y considerar terapia ocupacional intensiva post-operatoria.'
                    }
                  </Text>
                </View>

                {/* Barra de progreso FSS */}
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.bostonSubscores.fssAvg / 5) * 100}%`,
                      backgroundColor: state.bostonSubscores.fssAvg < 2 ? '#10B981' :
                                      state.bostonSubscores.fssAvg < 3.5 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>
            </View>

            {/* Respuestas Detalladas por Subescala */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Respuestas Detalladas</Text>

              {/* SSS Preguntas */}
              <View style={styles.categorySection}>
                <View style={styles.categoryHeaderBoston}>
                  <Text style={styles.categoryTitleBoston}>SEVERIDAD DE SÍNTOMAS (SSS)</Text>
                </View>
                {sortedQuestions
                  .filter(q => q.category?.toUpperCase().includes('SSS'))
                  .map((question, idx) => {
                    const answer = state.responses[question.question_id];
                    const option = question.options.find(opt => opt.option_value === answer);

                    return (
                      <View key={question.question_id} style={styles.detailRow}>
                        <View style={styles.detailQuestionContainer}>
                          <Text style={styles.detailQuestionNumber}>{idx + 1}.</Text>
                          <Text style={styles.detailQuestionText}>{question.question_text}</Text>
                        </View>
                        <View style={styles.detailAnswerContainer}>
                          <Text style={styles.detailAnswerText}>{option?.option_label || '-'}</Text>
                          <View style={[
                            styles.detailScoreBadge,
                            {
                              backgroundColor: Number(answer) <= 2 ? '#10B98120' :
                                             Number(answer) <= 3 ? '#F59E0B20' : '#EF444420'
                            }
                          ]}>
                            <Text style={[
                              styles.detailScoreText,
                              {
                                color: Number(answer) <= 2 ? '#10B981' :
                                      Number(answer) <= 3 ? '#F59E0B' : '#EF4444'
                              }
                            ]}>
                              {`${answer} pts`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>

              {/* FSS Preguntas */}
              <View style={styles.categorySection}>
                <View style={styles.categoryHeaderBoston}>
                  <Text style={styles.categoryTitleBoston}>ESTADO FUNCIONAL (FSS)</Text>
                </View>
                {sortedQuestions
                  .filter(q => q.category?.toUpperCase().includes('FSS'))
                  .map((question, idx) => {
                    const answer = state.responses[question.question_id];
                    const option = question.options.find(opt => opt.option_value === answer);

                    return (
                      <View key={question.question_id} style={styles.detailRow}>
                        <View style={styles.detailQuestionContainer}>
                          <Text style={styles.detailQuestionNumber}>{idx + 1}.</Text>
                          <Text style={styles.detailQuestionText}>{question.question_text}</Text>
                        </View>
                        <View style={styles.detailAnswerContainer}>
                          <Text style={styles.detailAnswerText}>{option?.option_label || '-'}</Text>
                          <View style={[
                            styles.detailScoreBadge,
                            {
                              backgroundColor: Number(answer) <= 2 ? '#10B98120' :
                                             Number(answer) <= 3 ? '#F59E0B20' : '#EF444420'
                            }
                          ]}>
                            <Text style={[
                              styles.detailScoreText,
                              {
                                color: Number(answer) <= 2 ? '#10B981' :
                                      Number(answer) <= 3 ? '#F59E0B' : '#EF4444'
                              }
                            ]}>
                              {`${answer} pts`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          </>
        )}

        {/* MMSE cognitive domains breakdown */}
        {scale.id === 'mmse' && state.mmseScores && (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Dominios Cognitivos Evaluados</Text>

              {/* Orientación Temporal */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Orientación Temporal</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.orientacionTemporal}/5
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.orientacionTemporal / 5) * 100}%`,
                      backgroundColor: state.mmseScores.orientacionTemporal >= 4 ? '#10B981' :
                                      state.mmseScores.orientacionTemporal >= 2 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Orientación Espacial */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Orientación Espacial</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.orientacionEspacial}/5
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.orientacionEspacial / 5) * 100}%`,
                      backgroundColor: state.mmseScores.orientacionEspacial >= 4 ? '#10B981' :
                                      state.mmseScores.orientacionEspacial >= 2 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Memoria Inmediata */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Memoria Inmediata (Registro)</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.memoriaInmediata}/3
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.memoriaInmediata / 3) * 100}%`,
                      backgroundColor: state.mmseScores.memoriaInmediata >= 3 ? '#10B981' :
                                      state.mmseScores.memoriaInmediata >= 2 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Atención y Cálculo */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Atención y Cálculo</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.atencionCalculo}/5
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.atencionCalculo / 5) * 100}%`,
                      backgroundColor: state.mmseScores.atencionCalculo >= 4 ? '#10B981' :
                                      state.mmseScores.atencionCalculo >= 2 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Memoria Diferida */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Memoria Diferida (Recuerdo)</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.memoriaDiferida}/3
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.memoriaDiferida / 3) * 100}%`,
                      backgroundColor: state.mmseScores.memoriaDiferida >= 3 ? '#10B981' :
                                      state.mmseScores.memoriaDiferida >= 2 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Lenguaje */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Lenguaje</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.lenguaje}/8
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.lenguaje / 8) * 100}%`,
                      backgroundColor: state.mmseScores.lenguaje >= 6 ? '#10B981' :
                                      state.mmseScores.lenguaje >= 4 ? '#F59E0B' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>

              {/* Construcción Visuoespacial */}
              <View style={styles.domainRow}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainLabel}>Construcción Visuoespacial</Text>
                  <Text style={styles.domainScore}>
                    {state.mmseScores.construccion}/1
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${(state.mmseScores.construccion / 1) * 100}%`,
                      backgroundColor: state.mmseScores.construccion >= 1 ? '#10B981' : '#EF4444'
                    }
                  ]} />
                </View>
              </View>
            </View>

            {/* Detailed Answers */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Respuestas Detalladas</Text>
              {sortedQuestions.map((question, idx) => {
                const answer = state.responses[question.question_id];
                const option = question.options.find(opt => opt.option_value === answer);
                const isCorrect = Number(answer) === 1;

                return (
                  <View key={question.question_id} style={styles.answerDetailRow}>
                    <View style={styles.answerQuestionContainer}>
                      <Text style={styles.answerQuestionNumber}>{idx + 1}.</Text>
                      <Text style={styles.answerQuestionText}>{question.question_text}</Text>
                    </View>
                    <View style={[
                      styles.answerBadge,
                      { backgroundColor: isCorrect ? '#10B98120' : '#EF444420' }
                    ]}>
                      <Text style={[
                        styles.answerBadgeText,
                        { color: isCorrect ? '#10B981' : '#EF4444' }
                      ]}>
                        {option?.option_label || answer}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* SF-36 dimensions breakdown */}
        {scale.id === 'sf36' && state.sf36Scores && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Puntuaciones por Dimensión</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Función Física:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.funcionFisica}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rol Físico:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.rolFisico}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dolor Corporal:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.dolorCorporal}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Salud General:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.saludGeneral}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vitalidad:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.vitalidad}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Función Social:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.funcionSocial}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rol Emocional:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.rolEmocional}/100</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Salud Mental:</Text>
              <Text style={styles.summaryValue}>{state.sf36Scores.saludMental}/100</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen de la Evaluación</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Preguntas respondidas:</Text>
            <Text style={styles.summaryValue}>{Object.keys(state.responses).length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiempo empleado:</Text>
            <Text style={styles.summaryValue}>
              {state.endTime && state.startTime 
                ? `${Math.round((state.endTime.getTime() - state.startTime.getTime()) / 1000 / 60)} min`
                : 'N/A'
              }
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha:</Text>
            <Text style={styles.summaryValue}>
              {new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>

        {/* Guardar en historial del paciente */}
        {/* Acciones finales */}
        {/* DEBUG BLOCK - justo antes de Actions */}
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#ffeb3b', borderRadius: 8, borderWidth: 2, borderColor: '#ff9800' }}>
          <Text style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>
            🐛 DEBUG INFO:{'\n'}
            patientSummary: {JSON.stringify(patientSummary)}{'\n'}
            patient prop: {JSON.stringify(patient)}{'\n'}
            selectedPatient: {JSON.stringify(selectedPatient)}{'\n'}
            doctorName: "{doctorName}"{'\n'}
            effectivePatientId: {effectivePatientId}
          </Text>
        </View>

        {/* Actions */}
        <ResultsActions
          assessment={{
            patientData: {},
            score: state.totalScore!,
            interpretation: (scale.id === 'boston' && state.bostonSubscores)
              ? `SSS: ${state.bostonSubscores.sssLevel} (${state.bostonSubscores.sssAvg}) | FSS: ${state.bostonSubscores.fssLevel} (${state.bostonSubscores.fssAvg})`
              : (scale.id === 'sf36' && state.sf36Scores)
              ? getSF36DetailedResults(state.sf36Scores)
              : (state.interpretation?.text || ''),
            answers: Object.entries(state.responses).map(([id, value]) => ({ id, value }))
          }}
          scale={{ id: scale.id, name: scale.name } as any}
          containerStyle={{ marginTop: 12 }}
          onSave={onSaveToHistory ? async () => {
            if (saveToHistoryLoading || state.totalScore == null) return;
            if (!effectivePatientId) {
              Alert.alert('Selecciona un paciente', 'Asocia un paciente antes de guardar en el historial.');
              return;
            }
            setSaveToHistoryLoading(true);
            try {
              const interpretationText = (scale.id === 'boston' && state.bostonSubscores)
                ? `SSS: ${state.bostonSubscores.sssLevel} (${state.bostonSubscores.sssAvg}) | FSS: ${state.bostonSubscores.fssLevel} (${state.bostonSubscores.fssAvg})`
                : (scale.id === 'sf36' && state.sf36Scores)
                ? getSF36DetailedResults(state.sf36Scores)
                : state.interpretation?.text ?? '';
              await onSaveToHistory({
                patient_id: effectivePatientId,
                scale_slug: scale.id,
                responses: state.responses,
                total_score: state.totalScore,
                interpretation: interpretationText,
                subscale_scores: (state.bostonSubscores ?? state.sf36Scores ?? undefined) as any,
              });
              setSaveToHistoryDone(true);
              Alert.alert('Guardado', 'La evaluación se guardó en el historial del paciente.');
            } finally {
              setSaveToHistoryLoading(false);
            }
          } : undefined}
          canSave={!!effectivePatientId}
          saving={saveToHistoryLoading}
        />
      </ScrollView>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton} testID="closeButton" accessibilityLabel="close">
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} testID="headerTitle">
          {state.currentStep === 'patient' ? 'Datos del Paciente' :
           state.currentStep === 'evaluation' ? scale.name :
           'Resultados'}
        </Text>
      </View>

      {/* Content */}
      {state.currentStep === 'patient' && renderPatientStep()}
      {state.currentStep === 'evaluation' && renderEvaluationStep()}
      {state.currentStep === 'results' && renderResultsStep()}
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isLargeScreen: boolean, fontMultiplier: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.headerBackground,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: isLargeScreen ? 24 : 16,
    justifyContent: 'space-between',
  },
  evaluationGrid: {
    flex: 1,
    flexDirection: isLargeScreen ? 'row' : 'column',
    gap: isLargeScreen ? 24 : 0,
  },
  questionPanel: {
    flex: 1,
    paddingRight: isLargeScreen ? 24 : 0,
    borderRightWidth: isLargeScreen ? 1 : 0,
    borderRightColor: colors.border,
  },
  optionsPanel: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28 * fontMultiplier,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  progressWrapper: {
    marginBottom: 24,
    paddingHorizontal: isLargeScreen ? 0 : 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    marginTop: 8,
    textAlign: 'right',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 24 * fontMultiplier,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32 * fontMultiplier,
    marginBottom: 12,
  },
  questionDescription: {
    fontSize: 16 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 24 * fontMultiplier,
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  imageWrapper: {
    position: 'relative' as const,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  zoomHint: {
    position: 'absolute' as const,
    bottom: 24,
    right: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoomHintText: {
    fontSize: 11 * fontMultiplier,
    fontWeight: '600' as const,
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionsLabel: {
    fontSize: 14 * fontMultiplier,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 20 * fontMultiplier,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '1A', // 10% opacity
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.card,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18 * fontMultiplier,
    fontWeight: '500',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14 * fontMultiplier,
    color: colors.mutedText,
    lineHeight: 20 * fontMultiplier,
    marginTop: 4,
  },
  optionDescriptionSelected: {
    color: colors.mutedText,
  },
  optionValue: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '600',
    color: colors.mutedText,
    marginLeft: 8,
  },
  optionValueSelected: {
    color: colors.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
  },
  navButtonSecondary: {
    backgroundColor: colors.surface,
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    color: colors.buttonPrimaryText,
  },
  navButtonTextSecondary: {
    color: colors.buttonSecondaryText,
  },
  resultsHeader: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  scaleName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreRange: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  interpretationContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  interpretationLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recommendationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  recommendationsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  summaryContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  // MMSE Domain Styles
  domainRow: {
    marginBottom: 20,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainLabel: {
    fontSize: 14 * fontMultiplier,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  domainScore: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Lawton & Brody Area Styles
  lawtonAreaRow: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lawtonAreaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lawtonAreaIcon: {
    fontSize: 20 * fontMultiplier,
    marginRight: 12,
  },
  lawtonAreaTitle: {
    fontSize: 15 * fontMultiplier,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lawtonAreaScore: {
    fontSize: 13 * fontMultiplier,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  lawtonSelectedOption: {
    fontSize: 13 * fontMultiplier,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
    paddingLeft: 32,
  },
  lawtonInterpretation: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  lawtonInterpretationText: {
    fontSize: 13 * fontMultiplier,
    color: colors.text,
    lineHeight: 19,
  },
  lawtonIntervention: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  lawtonInterventionLabel: {
    fontSize: 12 * fontMultiplier,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  lawtonInterventionText: {
    fontSize: 12 * fontMultiplier,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  // MMSE Answer Details
  answerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  answerQuestionContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  answerQuestionNumber: {
    fontSize: 13 * fontMultiplier,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
    minWidth: 24,
  },
  answerQuestionText: {
    fontSize: 13 * fontMultiplier,
    color: colors.text,
    flex: 1,
  },
  answerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  answerBadgeText: {
    fontSize: 12 * fontMultiplier,
    fontWeight: '600',
  },
  // Boston Subscale Styles
  subscaleSection: {
    marginBottom: 24,
  },
  subscaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscaleTitle: {
    fontSize: 15 * fontMultiplier,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  subscaleScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subscaleScoreValue: {
    fontSize: 20 * fontMultiplier,
    fontWeight: '800',
    color: colors.primary,
  },
  subscaleScoreMax: {
    fontSize: 14 * fontMultiplier,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subscaleInterpretation: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  subscaleLevel: {
    fontSize: 16 * fontMultiplier,
    fontWeight: '700',
    marginBottom: 8,
  },
  subscaleDescription: {
    fontSize: 13 * fontMultiplier,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Boston Detail Rows
  categorySection: {
    marginTop: 16,
  },
  categoryHeaderBoston: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryTitleBoston: {
    fontSize: 13 * fontMultiplier,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  detailRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  detailQuestionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailQuestionNumber: {
    fontSize: 13 * fontMultiplier,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
    minWidth: 28,
  },
  detailQuestionText: {
    fontSize: 13 * fontMultiplier,
    color: colors.text,
    flex: 1,
    lineHeight: 19,
  },
  detailAnswerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 36,
  },
  detailAnswerText: {
    fontSize: 13 * fontMultiplier,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  detailScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  detailScoreText: {
    fontSize: 12 * fontMultiplier,
    fontWeight: '700',
  },
});




