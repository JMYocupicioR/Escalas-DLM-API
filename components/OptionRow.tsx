import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RadioButton } from 'react-native-paper';

interface OptionRowProps {
  value: string;
  selectedValue?: string;
  label: string;
  description?: string;
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const OptionRow: React.FC<OptionRowProps> = ({
  value,
  selectedValue,
  label,
  description,
  onSelect,
  containerStyle,
  labelStyle,
  descriptionStyle,
}) => {
  const handlePress = () => onSelect(value);

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, containerStyle]}>
      <RadioButton value={value} status={selectedValue === value ? 'checked' : 'unchecked'} onPress={handlePress} />
      <View style={styles.texts}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {description ? <Text style={[styles.description, descriptionStyle]}>{description}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  texts: {
    flex: 1,
    marginLeft: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
});


