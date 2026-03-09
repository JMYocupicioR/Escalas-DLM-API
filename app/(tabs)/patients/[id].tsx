import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { getPatient, type PatientRow } from '@/api/patients';
import { listAssessmentsByPatient, type ScaleAssessmentRow } from '@/api/assessments';
import { HeaderLogo } from '@/components/AppLogo';
import { ClipboardList, ChevronLeft } from 'lucide-react-native';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

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

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemedStyles();
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [assessments, setAssessments] = useState<ScaleAssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([getPatient(id), listAssessmentsByPatient(id)]).then(
      ([pRes, aRes]) => {
        if (cancelled) return;
        setLoading(false);
        if (pRes.error) {
          setError(pRes.error.message);
          setPatient(null);
        } else {
          setError(null);
          setPatient(pRes.data ?? null);
        }
        if (aRes.error) setAssessments([]);
        else setAssessments(aRes.data ?? []);
      }
    );
    return () => { cancelled = true; };
  }, [id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        scroll: { flex: 1 },
        inner: { padding: 16, paddingBottom: 32 },
        card: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.mutedText, marginBottom: 8, textTransform: 'uppercase' },
        name: { fontSize: 22, fontWeight: '700', color: colors.text },
        meta: { fontSize: 15, color: colors.mutedText, marginTop: 6 },
        clinic: { fontSize: 14, color: colors.primary, marginTop: 8 },
        applyBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 12,
          marginTop: 8,
        },
        applyBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
        assessmentRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        assessmentRowLast: { borderBottomWidth: 0 },
        assessmentScale: { fontSize: 16, fontWeight: '600', color: colors.text },
        assessmentDate: { fontSize: 13, color: colors.mutedText, marginTop: 2 },
        assessmentScore: { fontSize: 15, color: colors.primary, fontWeight: '600' },
        assessmentInterp: { fontSize: 13, color: colors.mutedText, marginTop: 4, flex: 1 },
        loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        errText: { color: colors.error, padding: 16, textAlign: 'center' },
      }),
    [colors]
  );

  const handleBack = () => router.back();
  const handleApplyScale = () => router.push(`/patients/apply-scale?patientId=${id}`);

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><HeaderLogo size="small" /></View>
        <Text style={styles.errText}>Paciente no especificado.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><HeaderLogo size="small" /></View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><HeaderLogo size="small" /></View>
        <Text style={styles.errText}>{error ?? 'Paciente no encontrado.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <>

      <Stack.Screen options={{ title: patient.full_name ?? 'Paciente' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <HeaderLogo size="small" />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
          <View style={styles.card}>
            <Text style={styles.name}>{patient.full_name ?? 'Sin nombre'}</Text>

            <Text style={styles.meta}>
              {patient.age != null ? `${patient.age} años` : ''}
              {patient.gender ? ` · ${patient.gender}` : ''}
            </Text>
            {patient.institution_id ? (
              <Text style={styles.clinic}>Clínica / Institución: {patient.institution_id}</Text>
            ) : null}
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyScale}>
              <ClipboardList size={22} color="#fff" />
              <Text style={styles.applyBtnText}>Aplicar escala</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Historial de escalas aplicadas</Text>
            {assessments.length === 0 ? (
              <Text style={styles.meta}>Aún no hay evaluaciones registradas.</Text>
            ) : (
              assessments.map((a, i) => (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.assessmentRow,
                    i === assessments.length - 1 ? styles.assessmentRowLast : undefined,
                  ]}
                  onPress={() => router.push(`/patients/assessments/${a.id}`)}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.assessmentScale}>
                      {a.medical_scales?.name || scaleSlugToName(a.scale_slug || a.scale_id) || 'Escala'}
                    </Text>
                    <Text style={styles.assessmentDate}>
                        {formatDate(a.assessment_date || a.created_at)}
                    </Text>
                    {a.interpretation ? (
                        <View style={{ marginTop: 6, padding: 6, backgroundColor: colors.tagBackground, borderRadius: 6, alignSelf: 'flex-start' }}>
                            <Text style={[styles.assessmentInterp, { color: colors.text, fontSize: 12, fontWeight: '500' }]} numberOfLines={1}>
                                {a.interpretation}
                            </Text>
                        </View>
                    ) : null}
                  </View>
                  
                  <View style={{ alignItems: 'flex-end',  justifyContent: 'center' }}>
                      {a.total_score != null && (
                        <View style={{ 
                            backgroundColor: colors.primary + '15', 
                            paddingHorizontal: 10, 
                            paddingVertical: 4, 
                            borderRadius: 12,
                            minWidth: 40,
                            alignItems: 'center'
                        }}>
                            <Text style={styles.assessmentScore}>{a.total_score}</Text>
                            <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '500' }}>pts</Text>
                        </View>
                      )}
                      
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
