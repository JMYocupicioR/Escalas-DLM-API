import React from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';

interface Step3SensibilityProps {
  styles: any;
  colors: any;
  datosEvaluacion: any;
  updateAreas: (areas: string[]) => void;
  renderCheckboxGroup: (items: string[], selectedItems: string[], onSelectionChange: (items: string[]) => void, title: string) => React.ReactNode;
  renderStepFeedback: (step: number) => React.ReactNode;
  AREAS_SENSIBILIDAD: string[];
}

export const Step3Sensibility: React.FC<Step3SensibilityProps> = ({
  styles,
  colors,
  datosEvaluacion,
  updateAreas,
  renderCheckboxGroup,
  renderStepFeedback,
  AREAS_SENSIBILIDAD,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Zap size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Áreas de Sensibilidad Afectadas</Text>
      </View>
      <Text style={styles.stepDescription}>
        Seleccione las áreas con alteraciones sensitivas.
      </Text>
      
      {renderCheckboxGroup(
        AREAS_SENSIBILIDAD,
        datosEvaluacion.areasSeleccionadas,
        updateAreas,
        'Áreas afectadas:'
      )}
      
      {renderStepFeedback(3)}
    </View>
  );
};
