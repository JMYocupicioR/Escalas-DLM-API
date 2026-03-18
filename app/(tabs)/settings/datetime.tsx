// app/(tabs)/settings/datetime.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, Clock } from 'lucide-react-native';
import { useSettingsStore, DateFormat } from '@/store/settingsStore';

interface FormatOption {
  id: DateFormat;
  name: string;
  example: {
    date: string;
    time: string;
  };
  description: string;
}

const DATE_FORMATS: FormatOption[] = [
  {
    id: '24h',
    name: 'Formato 24 horas',
    example: {
      date: '25/03/2025',
      time: '16:30',
    },
    description: 'Utiliza el formato de 24 horas para la hora y el formato DD/MM/YYYY para la fecha.'
  },
  {
    id: '12h',
    name: 'Formato 12 horas (AM/PM)',
    example: {
      date: '03/25/2025',
      time: '4:30 PM',
    },
    description: 'Utiliza el formato de 12 horas con AM/PM para la hora y el formato MM/DD/YYYY para la fecha.'
  }
];

export default function DateTimeFormatScreen() {
  const router = useRouter();
  const { dateFormat, darkMode, setDateFormat } = useSettingsStore();

  const handleFormatSelect = (selectedFormat: DateFormat) => {
    setDateFormat(selectedFormat);
    // Volver a la pantalla anterior después de seleccionar
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Formato de Fecha y Hora',
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
          Selecciona el formato en que deseas visualizar fechas y horas en la aplicación.
        </Text>

        {DATE_FORMATS.map(format => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatCard,
              darkMode && styles.formatCardDark,
              dateFormat === format.id && styles.selectedCard,
              darkMode && dateFormat === format.id && styles.selectedCardDark,
            ]}
            onPress={() => handleFormatSelect(format.id)}
            accessible={true}
            accessibilityLabel={format.name}
            accessibilityRole="radio"
            accessibilityState={{ checked: dateFormat === format.id }}
          >
            <View style={styles.formatHeader}>
              <View style={styles.formatHeaderContent}>
                <Clock size={24} color={dateFormat === format.id ? "#0891b2" : (darkMode ? "#94a3b8" : "#64748b")} />
                <Text style={[
                  styles.formatName,
                  darkMode && styles.formatNameDark,
                  dateFormat === format.id && styles.selectedText
                ]}>
                  {format.name}
                </Text>
              </View>
              {dateFormat === format.id && (
                <Check size={20} color="#0891b2" />
              )}
            </View>
            
            <View style={styles.exampleContainer}>
              <View style={styles.exampleItem}>
                <Text style={[styles.exampleLabel, darkMode && styles.exampleLabelDark]}>
                  Fecha:
                </Text>
                <Text style={[styles.exampleValue, darkMode && styles.exampleValueDark]}>
                  {format.example.date}
                </Text>
              </View>
              <View style={styles.exampleItem}>
                <Text style={[styles.exampleLabel, darkMode && styles.exampleLabelDark]}>
                  Hora:
                </Text>
                <Text style={[styles.exampleValue, darkMode && styles.exampleValueDark]}>
                  {format.example.time}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.formatDescription, darkMode && styles.formatDescriptionDark]}>
              {format.description}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
            Este formato se aplicará a todas las fechas y horas mostradas en la aplicación,
            incluyendo registros de evaluaciones e informes.
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
    padding: 16,
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#94a3b8',
  },
  formatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formatCardDark: {
    backgroundColor: '#1e293b',
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: '#0891b2',
    backgroundColor: '#f0fdff',
  },
  selectedCardDark: {
    backgroundColor: '#164e63',
    borderColor: '#06b6d4',
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  formatNameDark: {
    color: '#f8fafc',
  },
  selectedText: {
    color: '#0891b2',
  },
  exampleContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    width: 60,
  },
  exampleLabelDark: {
    color: '#e2e8f0',
  },
  exampleValue: {
    fontSize: 16,
    color: '#475569',
    fontFamily: 'monospace',
  },
  exampleValueDark: {
    color: '#94a3b8',
  },
  formatDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  formatDescriptionDark: {
    color: '#94a3b8',
  },
  infoContainer: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
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