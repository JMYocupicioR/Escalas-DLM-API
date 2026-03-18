import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { getAssessment, type ScaleAssessmentRow } from '@/api/assessments';
import { getScaleById } from '@/api/scales';
import { HeaderLogo } from '@/components/AppLogo';
import { ScaleResults } from '@/NuevasEscalas/components/ScaleResults';
import { ChevronLeft } from 'lucide-react-native';
import { scalesById } from '@/data/_scales'; // For local scales

function scaleSlugToName(slug: string | null): string {
  if (!slug) return 'Escala';
  const names: Record<string, string> = {
    barthel: 'Índice de Barthel',
    katz: 'Índice de Katz',
    'lawton-brody': 'Lawton-Brody',
    berg: 'Escala de Berg',
    moca: 'MoCA',
    mmse: 'MMSE',
    boston: 'Boston (Túnel Carpiano)',
    fim: 'FIM',
    lequesne: 'Lequesne',
    gas: 'GAS',
    tinetti: 'Tinetti',
    ogs: 'OGS',
  };
  return names[slug] ?? slug;
}

export default function AssessmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemedStyles();
  const [assessment, setAssessment] = useState<ScaleAssessmentRow | null>(null);
  const [scaleData, setScaleData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
      try {
          setLoading(true);
          // 1. Get assessment
          const { data: assessmentData, error: assessmentError } = await getAssessment(id!);
          if (assessmentError || !assessmentData) {
              throw new Error(assessmentError?.message || 'No se encontró la evaluación');
          }
          setAssessment(assessmentData);

          // 2. Get scale definition
          // We need the full scale definition to render the results properly (questions, options, etc.)
          if (assessmentData.scale_id) {
            // Database scale
            const { data: scale, error: scaleError } = await getScaleById(assessmentData.scale_id);
            if (scaleError || !scale) {
                 console.warn('Could not load scale definition:', scaleError);
                 // We might still want to show what we can, but ScaleResults needs scale data
            } else {
                // Adapt scale to the format ScaleResults expects (similar to ScaleRunnerScreen)
                const adapted = {
                    id: scale.id,
                    name: scale.name,
                    description: scale.description,
                    acronym: scale.acronym,
                    current_version: {
                        version_number: scale.version || '1.0',
                        questions: (scale.questions || []).map(q => ({
                            id: q.id,
                            text: q.question_text,
                            type: q.question_type,
                            options: (q.options || []).map(opt => ({
                                label: opt.option_label,
                                value: opt.option_value,
                                score: opt.option_value,
                                id: opt.id
                            })),
                            order_index: q.order_index
                        }))
                    }
                };
                setScaleData(adapted);
            }
          } else if (assessmentData.scale_slug) {
            // Local scale
            const localScale = scalesById[assessmentData.scale_slug];
            if (localScale) {
                setScaleData(localScale);
            } else {
                console.warn('Could not find local scale with slug:', assessmentData.scale_slug);
            }
          }

      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { marginRight: 12 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errText: { color: colors.error, padding: 16, textAlign: 'center' },
    jsonContainer: { padding: 16 },
    rawTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    code: { 
        fontFamily: 'monospace', 
        fontSize: 12, 
        backgroundColor: colors.card, 
        padding: 10, 
        borderRadius: 8,
        color: colors.text
    }
  }), [colors]);


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <HeaderLogo size="small" />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !assessment) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <HeaderLogo size="small" />
         </View>
        <Text style={styles.errText}>{error ?? 'Evaluación no encontrada.'}</Text>
      </SafeAreaView>
    );
  }

  // Determine scale name for header
  const scaleName = assessment?.medical_scales?.name || 
                    scaleSlugToName(assessment?.scale_slug || assessment?.scale_id) || 
                    'Evaluación';

  return (
    <>
      <Stack.Screen options={{ title: scaleName }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <HeaderLogo size="small" />
        </View>

        {scaleData ? (
             // Reuse ScaleResults in read-only mode
            <ScaleResults 
                scale={scaleData}
                results={{
                    total_score: assessment.total_score || 0,
                    interpretation: assessment.interpretation || undefined,
                    raw_responses: (assessment.responses as Record<string, any>) || {},
                    // Reconstruct domain_results from subscale_scores
                    domain_results: assessment.subscale_scores 
                        ? Object.entries(assessment.subscale_scores as Record<string, any>).map(([key, value]: [string, any]) => ({
                            id: key,
                            label: value.label || key,
                            score: value.score,
                            interpretation: value.interpretation
                        }))
                        : undefined,
                    metadata: {
                        assessor_name: assessment.assessor_name,
                        assessment_date: assessment.assessment_date
                    }
                }}
                patient={{
                    id: assessment.patient_id || '',
                    full_name: 'Paciente', // We could fetch patient name if needed, but it's redundant if coming from patient detail
                }}
                readOnly={true}
            />
        ) : (
             // Fallback if scale definition load failed
            <ScrollView contentContainerStyle={styles.jsonContainer}>
                <Text style={styles.rawTitle}>Resumen (Escala no cargada)</Text>
                <Text style={{color: colors.text}}>Total: {assessment.total_score}</Text>
                <Text style={{color: colors.text}}>Interpretación: {assessment.interpretation}</Text>
                <Text style={[styles.rawTitle, {marginTop: 20}]}>Respuestas Raw</Text>
                <Text style={styles.code}>{JSON.stringify(assessment.responses, null, 2)}</Text>
            </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
