import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useSettingsStore, FontSize } from '@/store/settingsStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function FontSizeSettings() {
  const { colors } = useThemedStyles();
  const { fontSize, setFontSize } = useSettingsStore();

  const fontSizeOptions: { value: FontSize; label: string; description: string; sample: string }[] = [
    {
      value: 'small',
      label: 'Pequeño',
      description: 'Para usuarios que prefieren textos más compactos',
      sample: 'Texto de muestra pequeño'
    },
    {
      value: 'normal',
      label: 'Normal',
      description: 'Tamaño de fuente estándar recomendado',
      sample: 'Texto de muestra normal'
    },
    {
      value: 'large',
      label: 'Grande',
      description: 'Para mejor legibilidad en pantallas más grandes',
      sample: 'Texto de muestra grande'
    },
    {
      value: 'xlarge',
      label: 'Muy Grande',
      description: 'Máxima legibilidad para usuarios con dificultades visuales',
      sample: 'Texto de muestra muy grande'
    }
  ];

  const handleSelectFontSize = (size: FontSize) => {
    setFontSize(size);
  };

  const getSampleFontSize = (size: FontSize) => {
    switch (size) {
      case 'small': return 14;
      case 'normal': return 16;
      case 'large': return 18;
      case 'xlarge': return 20;
      default: return 16;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedText,
      lineHeight: 22,
    },
    optionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    optionSelected: {
      backgroundColor: `${colors.primary}10`,
      borderColor: colors.primary,
    },
    optionContent: {
      flex: 1,
      marginRight: 12,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 8,
      lineHeight: 20,
    },
    sampleText: {
      color: colors.text,
      fontWeight: '500',
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkIconEmpty: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.border,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tamaño de fuente',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tamaño de fuente</Text>
            <Text style={styles.subtitle}>
              Selecciona el tamaño de fuente que mejor se adapte a tus necesidades de legibilidad.
            </Text>
          </View>

          {fontSizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionContainer,
                fontSize === option.value && styles.optionSelected,
              ]}
              onPress={() => handleSelectFontSize(option.value)}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              accessibilityState={{ checked: fontSize === option.value }}
            >
              <View style={styles.option}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                  <Text 
                    style={[
                      styles.sampleText,
                      { fontSize: getSampleFontSize(option.value) }
                    ]}
                  >
                    {option.sample}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkIcon,
                    fontSize !== option.value && styles.checkIconEmpty,
                  ]}
                >
                  {fontSize === option.value && (
                    <Check size={16} color="#ffffff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}