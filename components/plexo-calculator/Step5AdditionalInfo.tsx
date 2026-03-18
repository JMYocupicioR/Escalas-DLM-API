import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Info } from 'lucide-react-native';

interface Step5AdditionalInfoProps {
  styles: any;
  colors: any;
  datosEvaluacion: any;
  updateContextoClinico: (contexto: any) => void;
  updateTiempoEvolucion: (dias: number) => void;
  updateFaseEvolutiva: (fase: any) => void;
  updatePatronEvolucion: (patron: any) => void;
  updateInformacionAdicional: (campo: 'mecanismo' | 'evolucion' | 'tipoPlexo' | 'contextoClinico' | 'tiempoEvolucion' | 'faseEvolutiva' | 'patronEvolucion', valor: string | number) => void;
  renderPicker: (selectedValue: any, onValueChange: (value: any) => void, items: { label: string; value: any }[], placeholder: string) => React.ReactNode;
  renderStepFeedback: (step: number) => React.ReactNode;
  OPCIONES_CONTEXTO_CLINICO: { label: string; value: any }[];
  OPCIONES_FASE_EVOLUTIVA: { label: string; value: any }[];
  OPCIONES_PATRON_EVOLUCION: { label: string; value: any }[];
  OPCIONES_TIPO_PLEXO: { label: string; value: any }[];
}

export const Step5AdditionalInfo: React.FC<Step5AdditionalInfoProps> = ({
  styles,
  colors,
  datosEvaluacion,
  updateContextoClinico,
  updateTiempoEvolucion,
  updateFaseEvolutiva,
  updatePatronEvolucion,
  updateInformacionAdicional,
  renderPicker,
  renderStepFeedback,
  OPCIONES_CONTEXTO_CLINICO,
  OPCIONES_FASE_EVOLUTIVA,
  OPCIONES_PATRON_EVOLUCION,
  OPCIONES_TIPO_PLEXO,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Info size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Información Adicional</Text>
      </View>
      <Text style={styles.stepDescription}>
        Información complementaria para refinar el diagnóstico (opcional).
      </Text>
      
      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Contexto Clínico</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.contextoClinico || '',
          (value) => updateContextoClinico(value as any),
          OPCIONES_CONTEXTO_CLINICO,
          'Seleccionar contexto'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Tiempo de Evolución (días)</Text>
        <Picker
          selectedValue={datosEvaluacion.informacionAdicional.tiempoEvolucion?.toString() || ''}
          onValueChange={(value) => updateTiempoEvolucion(parseInt(value) || 0)}
          style={styles.picker}
        >
          <Picker.Item label="No especificado" value="" />
          <Picker.Item label="< 1 día (Hiperaguda)" value="0" />
          <Picker.Item label="1-3 días" value="2" />
          <Picker.Item label="4-7 días" value="5" />
          <Picker.Item label="1-2 semanas" value="10" />
          <Picker.Item label="3-4 semanas" value="21" />
          <Picker.Item label="1-3 meses" value="60" />
          <Picker.Item label="3-6 meses" value="120" />
          <Picker.Item label="> 6 meses" value="180" />
        </Picker>
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Fase Evolutiva</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.faseEvolutiva || '',
          (value) => updateFaseEvolutiva(value as any),
          OPCIONES_FASE_EVOLUTIVA,
          'Seleccionar fase'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Patrón de Evolución</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.patronEvolucion || '',
          (value) => updatePatronEvolucion(value as any),
          OPCIONES_PATRON_EVOLUCION,
          'Seleccionar patrón'
        )}
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Tipo de Plexo</Text>
        {renderPicker(
          datosEvaluacion.informacionAdicional.tipoPlexo,
          (value) => updateInformacionAdicional('tipoPlexo', value),
          OPCIONES_TIPO_PLEXO,
          'Seleccionar tipo'
        )}
      </View>
      
      {renderStepFeedback(5)}
    </View>
  );
};
