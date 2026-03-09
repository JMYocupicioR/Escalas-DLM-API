import React from 'react';
import { View, Text } from 'react-native';
import { Brain } from 'lucide-react-native';

interface Step2SymptomsProps {
  styles: any;
  colors: any;
  datosEvaluacion: any;
  updateSintomas: (sintomas: string[]) => void;
  renderCheckboxGroup: (items: string[], selectedItems: string[], onSelectionChange: (items: string[]) => void, title: string) => React.ReactNode;
  renderStepFeedback: (step: number) => React.ReactNode;
  SINTOMAS_CLINICOS: string[];
}

export const Step2Symptoms: React.FC<Step2SymptomsProps> = ({
  styles,
  colors,
  datosEvaluacion,
  updateSintomas,
  renderCheckboxGroup,
  renderStepFeedback,
  SINTOMAS_CLINICOS,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Brain size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Síntomas Clínicos</Text>
      </View>
      <Text style={styles.stepDescription}>
        Seleccione los síntomas presentes en el paciente.
      </Text>
      
      {renderCheckboxGroup(
        SINTOMAS_CLINICOS,
        datosEvaluacion.sintomasSeleccionados,
        updateSintomas,
        'Síntomas presentes:'
      )}
      
      {renderStepFeedback(2)}
    </View>
  );
};
