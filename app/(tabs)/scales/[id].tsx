import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaleEvaluation } from '@/components/ScaleEvaluation';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import LoadingState from '@/components/errors/LoadingState';
import EmptyState from '@/components/errors/EmptyState';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { ScaleAssessmentRequest } from '@/api/scales/types';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScaleDetails } from '@/hooks/useScaleDetails';
import Denver2Screen from '@/app/(tabs)/scales/denver2';

export default function ScaleDetailsScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();
  const [mode, setMode] = useState<'info' | 'evaluation'>('info');
  
  const { data: scale, isLoading, error, refetch } = useScaleDetails(id as string);

  const handleComplete = async (assessment: ScaleAssessmentRequest) => {
    try {
      // TODO: Submit to API
      // await createAssessment(assessment);
      console.log('Assessment completed:', assessment);
      
      Alert.alert(
        'Evaluación Completada',
        'La evaluación se ha guardado correctamente.',
        [
          {
            text: 'Ver Información',
            onPress: () => setMode('info'),
          },
          {
            text: 'Nueva Evaluación',
            onPress: () => setMode('evaluation'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la evaluación');
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
          authors: ref.authors.join(', '),
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
              scale={scale as any} // Cast because ScaleWithDetails is more specific
              onComplete={handleComplete}
              onCancel={desktopHandleCancel}
              patientRequired={false}
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
          scale={scale as any} // Cast because ScaleWithDetails is more specific
          onComplete={handleComplete}
          onCancel={handleCancel}
          patientRequired={false}
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
            <TouchableOpacity
              onPress={() => setMode('evaluation')}
              style={[styles.evaluateButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.evaluateButtonText}>Evaluar</Text>
            </TouchableOpacity>
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