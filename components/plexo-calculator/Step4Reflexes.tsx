import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { EducationalTooltip, TOOLTIP_CONTENT } from '@/components/EducationalTooltip';

interface Step4ReflexesProps {
  styles: any;
  colors: any;
  datosEvaluacion: any;
  updateReflejo: (reflejo: 'bicipital' | 'braquiorradial' | 'tricipital', valor: any) => void;
  renderPicker: (selectedValue: any, onValueChange: (value: any) => void, items: { label: string; value: any }[], placeholder: string) => React.ReactNode;
  renderStepFeedback: (step: number) => React.ReactNode;
  OPCIONES_REFLEJOS: { label: string; value: any }[];
}

export const Step4Reflexes: React.FC<Step4ReflexesProps> = ({
  styles,
  colors,
  datosEvaluacion,
  updateReflejo,
  renderPicker,
  renderStepFeedback,
  OPCIONES_REFLEJOS,
}) => {
  return (
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
};
