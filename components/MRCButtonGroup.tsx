import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface MRCButtonGroupProps {
  selectedValue: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const MRC_OPTIONS = [
  { value: 0, label: '0', description: 'Sin contracción', color: '#dc2626', selectedColor: '#ef4444' }, // Rojo más claro para selección
  { value: 1, label: '1', description: 'Contracción visible', color: '#ea580c', selectedColor: '#f97316' }, // Rojo-naranja más claro
  { value: 2, label: '2', description: 'Sin gravedad', color: '#f59e0b', selectedColor: '#f59e0b' }, // Mismo color
  { value: 3, label: '3', description: 'Contra gravedad', color: '#eab308', selectedColor: '#eab308' }, // Mismo color
  { value: 4, label: '4', description: 'Contra resistencia', color: '#84cc16', selectedColor: '#84cc16' }, // Mismo color
  { value: 5, label: '5', description: 'Normal', color: '#22c55e', selectedColor: '#22c55e' }, // Mismo color
];

export function MRCButtonGroup({ selectedValue, onValueChange, disabled = false }: MRCButtonGroupProps) {
  const { colors } = useThemedStyles();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {MRC_OPTIONS.map((option) => {
          const isSelected = selectedValue === option.value;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.mrcButton,
                isSelected && styles.mrcButtonSelected,
                { 
                  borderColor: option.color,
                  backgroundColor: isSelected ? option.selectedColor : 'transparent'
                }
              ]}
              onPress={() => !disabled && onValueChange(option.value)}
              disabled={disabled}
            >
              <Text style={[
                styles.mrcButtonText,
                { color: isSelected ? '#FFFFFF' : option.color }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {selectedValue !== 5 && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            MRC {selectedValue}: {MRC_OPTIONS[selectedValue].description}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    mrcButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    mrcButtonSelected: {
      borderWidth: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    mrcButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    descriptionContainer: {
      marginTop: 6,
      paddingHorizontal: 8,
    },
    descriptionText: {
      fontSize: 12,
      color: colors.mutedText,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
