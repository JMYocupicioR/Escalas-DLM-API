import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { EducationalTooltip, TOOLTIP_CONTENT } from '@/components/EducationalTooltip';
import { MRCButtonGroup } from '@/components/MRCButtonGroup';
import { MuscleSummaryPanel } from '@/components/MuscleSummaryPanel';
import { MUSCULOS_EVALUACION, MUSCULOS_ESENCIALES, MUSCULOS_POR_REGION } from '@/data/plexoBraquial';

interface Step1MuscleEvaluationProps {
  styles: any; // O un tipo más específico si es posible
  colors: any;
  datosEvaluacion: any;
  updateFuerzaMuscular: (musculo: string, valor: number) => void;
  renderStepFeedback: (step: number) => React.ReactNode;
}

export const Step1MuscleEvaluation: React.FC<Step1MuscleEvaluationProps> = ({
  styles,
  colors,
  datosEvaluacion,
  updateFuerzaMuscular,
  renderStepFeedback,
}) => {
  const [quickMode, setQuickMode] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [activeRegion, setActiveRegion] = React.useState<string>('Hombro y Escápula');
  const affectedCount = Object.values(datosEvaluacion.fuerzasMuscular).filter((mrc: any) => mrc < 5).length;

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
            {MUSCULOS_POR_REGION[activeRegion as keyof typeof MUSCULOS_POR_REGION]?.map(musculo => (
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
