// app/(tabs)/settings/language.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useSettingsStore, Language } from '@/store/settingsStore';

interface LanguageOption {
  id: Language;
  name: string;
  localName: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'es',
    name: 'Spanish',
    localName: 'Español',
  },
  {
    id: 'en',
    name: 'English',
    localName: 'English',
  },
  // En el futuro se podrían agregar más idiomas
];

export default function LanguageScreen() {
  const router = useRouter();
  const { language, darkMode, setLanguage } = useSettingsStore();

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    // Volver a la pantalla anterior después de seleccionar
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Idioma',
          headerShown: true,
          headerStyle: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          },
          headerTitleStyle: {
            color: darkMode ? '#f8fafc' : '#0f172a',
          },
          headerTintColor: '#0891b2',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Volver atrás"
              accessibilityRole="button"
            >
              <ArrowLeft size={24} color={darkMode ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['bottom']}>
        <Text style={[styles.description, darkMode && styles.descriptionDark]}>
          Selecciona el idioma para la aplicación. Este ajuste afectará todo el contenido y las opciones.
        </Text>

        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.languageItem,
                darkMode && styles.languageItemDark,
                language === item.id && styles.selectedItem,
                darkMode && language === item.id && styles.selectedItemDark,
              ]}
              onPress={() => handleLanguageSelect(item.id)}
              accessible={true}
              accessibilityLabel={`${item.localName}, ${item.name}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: language === item.id }}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  darkMode && styles.languageNameDark,
                  language === item.id && styles.selectedText,
                ]}>
                  {item.localName}
                </Text>
                <Text style={[
                  styles.languageDesc,
                  darkMode && styles.languageDescDark,
                ]}>
                  {item.name}
                </Text>
              </View>
              {language === item.id && (
                <Check size={20} color="#0891b2" />
              )}
            </TouchableOpacity>
          )}
        />

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
            Los cambios de idioma se aplicarán inmediatamente a toda la aplicación.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  backButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    paddingVertical: 20,
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#94a3b8',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageItemDark: {
    backgroundColor: '#1e293b',
  },
  selectedItem: {
    borderWidth: 1,
    borderColor: '#0891b2',
    backgroundColor: '#f0fdff',
  },
  selectedItemDark: {
    backgroundColor: '#164e63',
    borderColor: '#06b6d4',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  languageNameDark: {
    color: '#f8fafc',
  },
  languageDesc: {
    fontSize: 14,
    color: '#64748b',
  },
  languageDescDark: {
    color: '#94a3b8',
  },
  selectedText: {
    color: '#0891b2',
  },
  infoContainer: {
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoTextDark: {
    color: '#94a3b8',
  },
});