import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaleEvaluation, type SaveToHistoryPayload } from '@/components/ScaleEvaluation';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import LoadingState from '@/components/errors/LoadingState';
import EmptyState from '@/components/errors/EmptyState';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { ScaleAssessmentRequest } from '@/api/scales/types';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScaleDetails } from '@/hooks/useScaleDetails';
import Denver2Screen from '@/app/(tabs)/scales/denver2';
import BergScaleScreen from '@/app/(tabs)/scales/berg';
import KatzScaleScreen from '@/app/(tabs)/scales/katz';
import { useScalesStore } from '@/store/scales';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getPatient, type PatientRow } from '@/api/patients';
import { createAssessment } from '@/api/assessments';

export default function ScaleDetailsScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id, patientId } = useLocalSearchParams<{ id?: string; patientId?: string }>();
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const { session } = useAuthSession();
  const [mode, setMode] = useState<'info' | 'evaluation'>('info');
  const [linkedPatient, setLinkedPatient] = useState<PatientRow | null>(null);
  const [selectedPatientFromPicker, setSelectedPatientFromPicker] = useState<{ id: string; name?: string | null; gender?: string | null; birth_date?: string | null } | null>(null);

  const { data: scale, isLoading, error, refetch } = useScaleDetails(id as string);
  const addRecentlyViewed = useScalesStore(s => s.addRecentlyViewed);

  useEffect(() => {
    if (!patientId) {
      setLinkedPatient(null);
      return;
    }
    let cancelled = false;
    getPatient(patientId).then(({ data }) => {
      if (!cancelled && data) setLinkedPatient(data);
      else if (!cancelled) setLinkedPatient(null);
    });
    return () => { cancelled = true; };
  }, [patientId]);

  useEffect(() => {
    if (scale?.id) {
      try { addRecentlyViewed(scale.id); } catch {}
    }
  }, [scale?.id]);

  const handleSaveToHistory = async (payload: SaveToHistoryPayload) => {
    const userId = session?.user?.id;
    if (!userId) throw new Error('No hay sesión');
    const { data, error: err } = await createAssessment(userId, {
      patient_id: payload.patient_id,
      scale_slug: payload.scale_slug,
      responses: payload.responses,
      total_score: payload.total_score ?? undefined,
      interpretation: payload.interpretation ?? undefined,
    });
    if (err) throw err;
    return data;
  };

  const handleComplete = async (assessment: ScaleAssessmentRequest) => {
    try {
      Alert.alert(
        'Evaluación Completada',
        linkedPatient
          ? 'Puedes guardar el resultado en el historial del paciente con el botón "Guardar en historial del paciente".'
          : 'La evaluación se ha completado correctamente.',
        [
          { text: 'Ver Información', onPress: () => setMode('info') },
          { text: 'Nueva Evaluación', onPress: () => setMode('evaluation') },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo completar la evaluación');
    }
  };

  const handleCancel = () => {
    if (mode === 'evaluation') {
      Alert.alert(
        'Cancelar Evaluación',
        '¿Estás seguro de que quieres cancelar? Se perderá todo el progreso.',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Sí, Cancelar',
            style: 'destructive',
            onPress: () => setMode('info'),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const desktopHandleCancel = () => {
    Alert.alert(
      'Limpiar Evaluación',
      '¿Estás seguro de que quieres limpiar el formulario? Se perderá todo el progreso.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Limpiar',
          style: 'destructive',
          onPress: () => {
            // Refetching the data is a simple way to reset the state
            refetch();
          },
        },
      ]
    );
  };

  // Convert scale to info format for ScaleInfo component
  const info: ScaleInfoData | null = useMemo(() => {
    if (!scale) return null;
    
    return {
      id: scale.id,
      name: scale.name,
      description: scale.description,
      quickGuide: [
        { 
          title: 'Instrucciones de Administración', 
          paragraphs: [
            scale.instructions || 'Siga las instrucciones específicas para cada pregunta.',
            `Tiempo estimado de completado: ${scale.timeToComplete || 'No especificado'}`
          ] 
        },
        {
          title: 'Sistema de Puntuación',
          paragraphs: scale.scoring ? [
            `Método: ${scale.scoring.method}`,
            `Rango: ${scale.scoring.ranges.reduce((acc, r) => acc + r.max, 0)}`, // Simplified
            'Interpretación basada en rangos validados científicamente.'
          ] : ['Sistema de puntuación no disponible']
        }
      ],
      evidence: {
        summary: `Escala de la categoría ${scale.category}${scale.specialty ? ` - ${scale.specialty}` : ''}. Versión ${scale.version || '1.0'}.`,
        references: scale.references?.map(ref => ({
          title: ref.title,
          authors: Array.isArray(ref.authors) ? ref.authors.join(', ') : ref.authors,
          journal: 'N/A',
          year: ref.year,
          pages: 'N/A',
          doi: ref.doi,
        })) || [],
      },
      lastUpdated: scale.lastUpdated,
    };
  }, [scale]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState message="Cargando escala..." />
      </SafeAreaView>
    );
  }

  if (error || !scale || !info) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Error',
            headerShown: true,
          }}
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <EmptyState
            title="Error al cargar la escala"
            message="No se pudo cargar la información de la escala. Por favor, intente de nuevo."
            actionText="Reintentar"
            onAction={() => refetch()}
          />
        </SafeAreaView>
      </>
    );
  }

  if (id === 'denver2') {
    // Render the custom Denver II component here
    // This will be implemented in the next step.
    return <Denver2Screen />;
  }

  // Berg Balance Scale requires custom component due to complex structure
  if (id === 'berg') {
    return <BergScaleScreen />;
  }

  // Katz Index requires custom component with auto-advance feature
  if (id === 'katz') {
    return <KatzScaleScreen />;
  }

  // 6MWT requires custom component due to non-standard structure
  if (id === '6mwt') {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Test de Marcha de 6 Minutos',
            headerShown: true,
          }}
        />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <EmptyState
            title="Test de Marcha de 6 Minutos"
            message="Esta escala requiere un componente especializado que está en desarrollo. Por favor, utilice la versión impresa mientras tanto."
            actionText="Volver"
            onAction={() => router.back()}
          />
        </SafeAreaView>
      </>
    );
  }

  if (isDesktop) {
    return (
      <>
        <Stack.Screen
          options={{
            title: scale.name,
            headerShown: true,
          }}
        />
        <View style={styles.desktopContainer}>
          <View style={styles.infoPanel}>
            <ScaleInfo info={info} />
          </View>
          <View style={styles.evaluationPanel}>
            <ScaleEvaluation
              scale={scale as any}
              onComplete={handleComplete}
              onCancel={desktopHandleCancel}
              patientRequired={false}
              patientId={patientId || selectedPatientFromPicker?.id}
              patient={
                linkedPatient
                  ? { name: linkedPatient.name, institution_id: undefined, gender: linkedPatient.gender, birth_date: linkedPatient.birth_date }
                  : selectedPatientFromPicker
                  ? { name: selectedPatientFromPicker.name, institution_id: undefined, gender: selectedPatientFromPicker.gender, birth_date: selectedPatientFromPicker.birth_date }
                  : undefined
              }
              onSaveToHistory={session?.user?.id ? handleSaveToHistory : undefined}
              onPatientSelected={(p) => setSelectedPatientFromPicker(p)}
            />
          </View>
        </View>
      </>
    );
  }

  if (mode === 'evaluation') {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Evaluación',
            headerShown: false,
          }}
        />
        <ScaleEvaluation
          scale={scale as any}
          onComplete={handleComplete}
          onCancel={handleCancel}
          patientRequired={false}
          patientId={patientId || selectedPatientFromPicker?.id}
          patient={
            linkedPatient
              ? { name: linkedPatient.name, institution_id: undefined, gender: linkedPatient.gender, birth_date: linkedPatient.birth_date }
              : selectedPatientFromPicker
              ? { name: selectedPatientFromPicker.name, institution_id: undefined, gender: selectedPatientFromPicker.gender, birth_date: selectedPatientFromPicker.birth_date }
              : undefined
          }
          onSaveToHistory={session?.user?.id ? handleSaveToHistory : undefined}
          onPatientSelected={(p) => setSelectedPatientFromPicker(p)}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: scale.name,
          headerShown: true,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push(`/scales/pick-patient?scaleId=${id}`)}
                style={[styles.evaluateButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
              >
                <Text style={[styles.evaluateButtonText, { color: colors.primary }]}>Con paciente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode('evaluation')}
                style={[styles.evaluateButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.evaluateButtonText}>Evaluar</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScaleInfo info={info} />
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  evaluateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  evaluateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  infoPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border || '#ccc',
    padding: 8,
  },
  evaluationPanel: {
    flex: 2,
    padding: 8,
  },
});
