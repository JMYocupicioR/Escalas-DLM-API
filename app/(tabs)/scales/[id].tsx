import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaleEvaluation } from '@/components/ScaleEvaluation';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';
import { LoadingState } from '@/components/errors/LoadingState';
import { EmptyState } from '@/components/errors/EmptyState';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { ScaleWithDetails, ScaleAssessmentRequest } from '@/api/scales/types';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

// Mock data for demonstration
const mockScale: ScaleWithDetails = {
  id: 'barthel-scale',
  name: 'Índice de Barthel',
  description: 'Evaluación de actividades básicas de la vida diaria para medir el grado de independencia funcional',
  category: 'Funcional',
  specialty: 'Medicina Física y Rehabilitación',
  instructions: 'Evalúe la capacidad del paciente para realizar cada actividad de forma independiente en las últimas 48 horas.',
  time_to_complete: '5-10 minutos',
  version: '1.0',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  questions: [
    {
      id: 'q1',
      scale_id: 'barthel-scale',
      question_id: 'comida',
      question_text: 'Comida',
      description: 'Capacidad para comer por sí mismo',
      question_type: 'single_choice',
      order_index: 1,
      is_required: true,
      options: [
        {
          id: 'opt1',
          question_id: 'q1',
          option_value: 10,
          option_label: 'Independiente',
          option_description: 'Capaz de comer por sí solo en un tiempo razonable. La comida puede ser servida por otra persona.',
          order_index: 1,
          is_default: false,
          created_at: '2023-01-01',
        },
        {
          id: 'opt2',
          question_id: 'q1',
          option_value: 5,
          option_label: 'Necesita ayuda',
          option_description: 'Para cortar la carne, extender mantequilla, etc., pero es capaz de comer solo/a.',
          order_index: 2,
          is_default: false,
          created_at: '2023-01-01',
        },
        {
          id: 'opt3',
          question_id: 'q1',
          option_value: 0,
          option_label: 'Dependiente',
          option_description: 'Necesita ser alimentado por otra persona.',
          order_index: 3,
          is_default: false,
          created_at: '2023-01-01',
        },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: 'q2',
      scale_id: 'barthel-scale',
      question_id: 'lavado',
      question_text: 'Lavado (Baño)',
      description: 'Capacidad para lavarse solo',
      question_type: 'single_choice',
      order_index: 2,
      is_required: true,
      options: [
        {
          id: 'opt4',
          question_id: 'q2',
          option_value: 5,
          option_label: 'Independiente',
          option_description: 'Capaz de lavarse entero, de entrar y salir del baño sin ayuda.',
          order_index: 1,
          is_default: false,
          created_at: '2023-01-01',
        },
        {
          id: 'opt5',
          question_id: 'q2',
          option_value: 0,
          option_label: 'Dependiente',
          option_description: 'Necesita algún tipo de ayuda o supervisión.',
          order_index: 2,
          is_default: false,
          created_at: '2023-01-01',
        },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ],
  scoring: {
    id: 'scoring1',
    scale_id: 'barthel-scale',
    scoring_method: 'sum',
    min_score: 0,
    max_score: 100,
    ranges: [
      {
        id: 'range1',
        scoring_id: 'scoring1',
        min_value: 0,
        max_value: 20,
        interpretation_level: 'Dependencia total',
        interpretation_text: 'El paciente requiere ayuda para todas las actividades básicas de la vida diaria.',
        recommendations: 'Requiere cuidado constante y evaluación para plan de rehabilitación integral.',
        color_code: '#EF4444',
        order_index: 1,
        created_at: '2023-01-01',
      },
      {
        id: 'range2',
        scoring_id: 'scoring1',
        min_value: 21,
        max_value: 60,
        interpretation_level: 'Dependencia severa',
        interpretation_text: 'El paciente necesita ayuda importante para la mayoría de actividades.',
        recommendations: 'Plan de rehabilitación intensivo recomendado con terapia ocupacional.',
        color_code: '#F97316',
        order_index: 2,
        created_at: '2023-01-01',
      },
      {
        id: 'range3',
        scoring_id: 'scoring1',
        min_value: 61,
        max_value: 90,
        interpretation_level: 'Dependencia moderada',
        interpretation_text: 'El paciente es parcialmente independiente con necesidades específicas.',
        recommendations: 'Continuar con terapia de rehabilitación y entrenamiento en AVD.',
        color_code: '#EAB308',
        order_index: 3,
        created_at: '2023-01-01',
      },
      {
        id: 'range4',
        scoring_id: 'scoring1',
        min_value: 91,
        max_value: 100,
        interpretation_level: 'Independiente',
        interpretation_text: 'El paciente es independiente para las actividades básicas de la vida diaria.',
        recommendations: 'Mantener el nivel de actividad actual y prevención de deterioro.',
        color_code: '#22C55E',
        order_index: 4,
        created_at: '2023-01-01',
      },
    ],
    created_at: '2023-01-01',
  },
  references: [
    {
      id: 'ref1',
      scale_id: 'barthel-scale',
      title: 'The Barthel ADL Index: a standard measure of physical disability?',
      authors: ['Collin C', 'Wade DT', 'Davies S', 'Horne V'],
      journal: 'International Disability Studies',
      year: 1988,
      volume: '10',
      pages: '64-67',
      reference_type: 'original',
      is_primary: true,
      created_at: '2023-01-01',
    },
  ],
};

export default function ScaleDetailsScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();

  const [mode, setMode] = useState<'info' | 'evaluation'>('info');
  const [scale, setScale] = useState<ScaleWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScale();
  }, [id]);

  const loadScale = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const result = await getScaleById(id as string);
      // if (result.error) {
      //   throw new Error(result.message);
      // }
      // setScale(result.data);
      
      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setScale(mockScale);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading scale');
    } finally {
      setIsLoading(false);
    }
  };

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
            // To properly reset, we'd need to re-mount ScaleEvaluation or have an internal reset function.
            // For now, we can just re-set the scale object which might trigger a re-render with initial state.
            // A more robust solution would be to pass a key to ScaleEvaluation.
            const currentScale = { ...scale };
            setScale(null);
            setTimeout(() => setScale(currentScale as ScaleWithDetails), 0);
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
            `Tiempo estimado de completado: ${scale.time_to_complete || 'No especificado'}`
          ] 
        },
        {
          title: 'Sistema de Puntuación',
          paragraphs: scale.scoring ? [
            `Método: ${scale.scoring.scoring_method}`,
            `Rango: ${scale.scoring.min_score} - ${scale.scoring.max_score}`,
            'Interpretación basada en rangos validados científicamente.'
          ] : ['Sistema de puntuación no disponible']
        }
      ],
      evidence: {
        summary: `Escala de la categoría ${scale.category}${scale.specialty ? ` - ${scale.specialty}` : ''}. Versión ${scale.version}.`,
        references: scale.references.map(ref => ({
          title: ref.title,
          authors: ref.authors.join(', '),
          journal: ref.journal,
          year: ref.year,
          pages: ref.pages,
          doi: ref.doi,
        })),
      },
      lastUpdated: scale.updated_at,
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
            title="Error"
            message={error || 'No se pudo cargar la escala'}
            actionLabel="Reintentar"
            onAction={loadScale}
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
              scale={scale}
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
          scale={scale}
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