import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { getScaleById, createScaleAssessment } from '@/api/scales';
import { ScaleWithDetails } from '@/api/scales/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaleRunner } from '@/NuevasEscalas/components/ScaleRunner';
import { ScaleResults } from '@/NuevasEscalas/components/ScaleResults';
import { PatientPicker, PickedPatient } from '@/components/PatientPicker';
import { StickyPatientHeader } from '@/components/ui/StickyPatientHeader';
import { ArrowLeft, User } from 'lucide-react-native';
import { useAuthSession } from '@/hooks/useAuthSession';

const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export default function ScaleRunnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const insets = useSafeAreaInsets();
  const { session } = useAuthSession();
  const doctorName = useMemo(() => session?.user?.user_metadata?.full_name || 'Médico', [session]);

  const [scale, setScale] = useState<ScaleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PickedPatient | null>(null);
  const [step, setStep] = useState<'select_patient' | 'run_scale' | 'show_results'>('select_patient');
  const [results, setResults] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | undefined>();

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadScale(id);
    } else {
        setError('ID de escala inválido');
        setLoading(false);
    }
  }, [id]);

  const loadScale = async (scaleId: string) => {
    try {
      setLoading(true);
      const response = await getScaleById(scaleId);
      
      if (response.error || !response.data) {
        setError(response.message || 'Error al cargar la escala');
      } else {
        setScale(response.data);
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (p: PickedPatient) => {
    setPatient(p);
    setStep('run_scale');
  };

  // Adapt ScaleWithDetails to MedicalScale for ScaleRunner
  const adaptedScale = useMemo(() => {
    if (!scale) return null;
    return {
        id: scale.id,
        name: scale.name,
        description: scale.description,
        categories: [scale.category || 'General'],
        current_version: {
            version_number: scale.version || '1.0',
            status: 'published',
            config: {
                instructions: scale.instructions,
                estimated_time: 5,
                language: 'es',
                tags: scale.tags || []
            },
            questions: (scale.questions || []).map(q => ({
                id: q.id,
                question_id: q.question_id,
                text: q.question_text,
                description: q.description,
                image_url: q.image_url ?? q.imageUrl,
                type: q.question_type,
                options: (q.options || []).map(opt => ({
                    label: opt.option_label,
                    value: opt.option_value,
                    score: opt.option_value,
                    id: opt.id
                })),
                order_index: q.order_index,
                is_required: q.is_required
            })),
            scoring: {
                engine: scale.scoring?.scoring_method || 'sum',
                ranges: (scale.scoring?.ranges || []).map((r: any) => ({
                    min: r.min !== undefined ? r.min : r.min_value,
                    max: r.max !== undefined ? r.max : r.max_value,
                    label: r.label || r.interpretation_level,
                    interpretation: r.interpretation || r.interpretation_text,
                    color: r.color || r.color_code,
                    recommendations: r.recommendations
                })),
                domains: scale.scoring?.domains
            }
        }
    } as any;
  }, [scale]);

  const handleScaleSubmit = (results: any) => {
    setResults(results);
    setStep('show_results');
  };

  const handleReset = () => {
    setResults(null);
    setStep('run_scale');
    setSaveStatus('idle');
    setSaveErrorMsg(undefined);
  };


  const handleSaveAssessment = async () => {
    if (!scale || !results) return;

    // Anonymous mode: usually we don't save or we show a message
    if (!patient) {
      Alert.alert(
        'Modo Calculadora', 
        'En modo calculadora los resultados no se guardan en el historial del paciente.',
        [
          { text: 'Entendido' }
        ]
      );
      return;
    }

    // Prevent double saves
    if (saveStatus === 'saving' || saveStatus === 'success') return;

    // Calculate final results (assuming 'results' state already holds this)
    // The original instruction had `const results = renderResults();` but `results` is already a state variable.
    // So we'll use the `results` state variable.

    // 1. Validate Interpretation
    let finalInterpretation = results.interpretation;
    
    // If no global interpretation, try to build from globalInterpretation object
    if (!finalInterpretation || finalInterpretation === 'Sin interpretación disponible') {
         if (results.globalInterpretation?.label) {
             finalInterpretation = results.globalInterpretation.label;
             if (results.globalInterpretation.interpretation) {
                 finalInterpretation += `: ${results.globalInterpretation.interpretation}`;
             }
         }
    }
    
    // If still no interpretation, build from domain results
    if ((!finalInterpretation || finalInterpretation === 'Sin interpretación disponible') && results.domain_results && results.domain_results.length > 0) {
        const domainInterpretations = results.domain_results
            .filter((d: any) => d.interpretation?.label)
            .map((d: any) => `${d.label}: ${d.interpretation.label}`)
            .join('; ');
        
        if (domainInterpretations) {
            finalInterpretation = domainInterpretations;
        }
    }

    // Patient mode: save to history
    try {
        setSaveStatus('saving');
        setSaveErrorMsg(undefined);
        console.log('[ScaleRunner] Initiating save...');
        console.log('[ScaleRunner] Results object:', JSON.stringify(results, null, 2));
        console.log('[ScaleRunner] Final interpretation to save:', finalInterpretation);
        
        // Build enhanced subscale_scores with interpretations
        const subscaleScores = results.domain_results ? 
            results.domain_results.reduce((acc: any, d: any) => {
                const domainKey = d.id || d.label || `domain_${d.score}`;
                return {
                    ...acc, 
                    [domainKey]: {
                        score: d.score,
                        interpretation: d.interpretation || null,
                        label: d.label || null
                    }
                };
            }, {}) : null;

        console.log('[ScaleRunner] Subscale scores with interpretations:', JSON.stringify(subscaleScores, null, 2));

        const result = await createScaleAssessment({
            scale_id: scale.id,
            patient_id: patient.id,
            responses: results.raw_responses, // Assuming raw_responses is part of results
            total_score: typeof results.total_score === 'number' ? results.total_score : Number(results.total_score),
            interpretation: finalInterpretation || 'Sin interpretación disponible',
            subscale_scores: subscaleScores,
            assessor_name: doctorName,
            duration_seconds: 0, // We could track this in the future, original instruction had `Math.floor((Date.now() - startTime) / 1000)`
            session_id: 'temp-session-' + Date.now(), // Replace with actual session if available
            assessment_date: new Date().toISOString(), // Pass explicitly
            device_info: {
               userAgent: Platform.OS === 'web' ? navigator.userAgent : 'React Native App',
               platform: Platform.OS
            }
        });

        if (result.error) {
            console.error('[ScaleRunner] Save failed:', result.message);
            setSaveStatus('error');
            setSaveErrorMsg(result.message);
            Alert.alert('Error', 'No se pudo guardar la evaluación: ' + result.message);
        } else {
            setSaveStatus('success');
            Alert.alert(
                'Guardado Exitoso',
                'La evaluación se ha guardado correctamente en el expediente del paciente.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    } catch (error: any) {
        console.error('[ScaleRunner] Unexpected error:', error);
        setSaveStatus('error');
        setSaveErrorMsg(error.message || 'Error inesperado');
        Alert.alert('Error', 'Ocurrió un error inesperado al guardar.');
    } finally {
        // No-op: status is managed in try/catch
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18 * fontSizeMultiplier,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20 * fontSizeMultiplier,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.card,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    patientName: {
        fontSize: 16 * fontSizeMultiplier,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 12,
    },
    changeButton: {
        marginLeft: 'auto',
        padding: 8,
    },
    changeText: {
        color: colors.primary,
        fontWeight: '500',
    },
    loadingText: {
        marginTop: 12,
        color: colors.mutedText,
        textAlign: 'center',
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginTop: 12,
    },
    skipPatientButton: {
        marginTop: 20,
        padding: 14,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    skipPatientText: {
        color: colors.primary,
        fontSize: 15 * fontSizeMultiplier,
        fontWeight: '600',
    },
    anonymousBadge: {
        padding: 12,
        backgroundColor: colors.tagBackground,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    anonymousText: {
        fontSize: 14 * fontSizeMultiplier,
        color: colors.mutedText,
        textAlign: 'center',
        fontWeight: '500',
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando escala...</Text>
      </View>
    );
  }

  if (error || !scale) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={styles.errorText}>{error || 'Escala no encontrada'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{scale.name}</Text>
      </View>

      <View style={styles.content}>
        {step === 'select_patient' ? (
            <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>1. Seleccionar Paciente</Text>
                <PatientPicker onSelected={handlePatientSelect} />
                
                <TouchableOpacity 
                    style={styles.skipPatientButton} 
                    onPress={() => {
                        setPatient(null);
                        setStep('run_scale');
                    }}
                >
                    <Text style={styles.skipPatientText}>
                        Continuar sin paciente (Modo Calculadora)
                    </Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={{ flex: 1 }}>
                 {/* Compact sticky patient header */}
                 <StickyPatientHeader
                   patientName={patient?.full_name || (patient ? 'Paciente' : 'Sin paciente (Calculadora)')}
                   currentQuestion={0}
                   totalQuestions={adaptedScale?.current_version?.questions?.length || 0}
                   scaleName={scale?.name || ''}
                   colors={colors}
                   fontSizeMultiplier={fontSizeMultiplier}
                   onChangePatient={patient ? () => setStep('select_patient') : undefined}
                 />
                 
                 {step === 'run_scale' && adaptedScale && (
                     <ScaleRunner 
                        scaleData={adaptedScale}
                        onSubmit={handleScaleSubmit}
                        onCancel={() => router.back()}
                     />
                 )}

                 {step === 'show_results' && adaptedScale && results && (
                     <ScaleResults 
                        scale={adaptedScale}
                        results={{
                            ...results,
                            metadata: {
                                assessor_name: doctorName,
                                assessment_date: results.completed_at || new Date().toISOString()
                            }
                        }}
                        patient={patient ? {
                            id: patient.id,
                            full_name: patient.full_name,
                            age: calculateAge(patient.birth_date),
                            gender: patient.gender,
                            birth_date: patient.birth_date
                        } : null}
                        onSave={handleSaveAssessment}
                        onReset={handleReset}
                        saveStatus={saveStatus}
                        errorMessage={saveErrorMsg}
                    />
                 )}
            </View>
        )}
      </View>
    </View>
  );
}
