import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Check, Globe, Info } from 'lucide-react-native';
import { useSettingsStore, Language } from '@/store/settingsStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface LanguageOption {
  id: Language;
  name: string;
  localName: string;
  flag: string;
  description: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'es',
    name: 'Spanish',
    localName: 'Español',
    flag: '🇪🇸',
    description: 'Idioma predeterminado para México y Latinoamérica'
  },
  {
    id: 'en',
    name: 'English',
    localName: 'English',
    flag: '🇺🇸',
    description: 'International language for global use'
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { colors } = useThemedStyles();
  const { language, setLanguage } = useSettingsStore();

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
      paddingHorizontal: 4,
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
    languageList: {
      marginBottom: 24,
    },
    languageItem: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '08',
    },
    languageFlag: {
      fontSize: 32,
      marginRight: 16,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    languageDescription: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
    selectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoSection: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
  });

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Idioma',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Idioma</Text>
            <Text style={styles.subtitle}>
              Elige el idioma que prefieres para la interfaz de la aplicación.
            </Text>
          </View>

          <View style={styles.languageList}>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.languageItem,
                  language === item.id && styles.selectedItem
                ]}
                onPress={() => handleLanguageSelect(item.id)}
                accessible={true}
                accessibilityLabel={`${item.localName}, ${item.name}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: language === item.id }}
              >
                <Text style={styles.languageFlag}>{item.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>
                    {item.localName}
                  </Text>
                  <Text style={styles.languageDescription}>
                    {item.description}
                  </Text>
                </View>
                {language === item.id && (
                  <View style={styles.selectedIndicator}>
                    <Check size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Info size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Aplicación inmediata</Text>
              <Text style={styles.infoText}>
                Los cambios de idioma se aplicarán inmediatamente a toda la aplicación. 
                Todas las escalas médicas y términos técnicos se mostrarán en el idioma seleccionado.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}