// app/(tabs)/settings/units.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, Ruler } from 'lucide-react-native';
import { useSettingsStore, MeasurementSystem } from '@/store/settingsStore';

interface UnitOption {
  id: MeasurementSystem;
  name: string;
  description: string;
  examples: string[];
}

const UNIT_SYSTEMS: UnitOption[] = [
  {
    id: 'metric',
    name: 'Sistema Métrico',
    description: 'Utiliza kilogramos, centímetros, metros y grados Celsius',
    examples: [
      'Peso: 70 kg',
      'Altura: 175 cm',
      'Temperatura: 37°C',
      'Distancia: 5 km'
    ]
  },
  {
    id: 'imperial',
    name: 'Sistema Imperial',
    description: 'Utiliza libras, pies, pulgadas y grados Fahrenheit',
    examples: [
      'Peso: 154 lbs',
      'Altura: 5\'9"',
      'Temperatura: 98.6°F',
      'Distancia: 3.1 mi'
    ]
  }
];

export default function UnitsScreen() {
  const router = useRouter();
  const { measurementSystem, darkMode, setMeasurementSystem } = useSettingsStore();

  const handleUnitSelect = (selectedSystem: MeasurementSystem) => {
    setMeasurementSystem(selectedSystem);
    // Volver a la pantalla anterior después de seleccionar
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Unidades de Medida',
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
        <ScrollView>
          <Text style={[styles.description, darkMode && styles.descriptionDark]}>
            Selecciona el sistema de unidades para mediciones en la aplicación. Este ajuste afectará 
            a cómo se muestran los datos relacionados con peso, altura y otras medidas.
          </Text>

          {UNIT_SYSTEMS.map(system => (
            <TouchableOpacity
              key={system.id}
              style={[
                styles.systemCard,
                darkMode && styles.systemCardDark,
                measurementSystem === system.id && styles.selectedCard,
                darkMode && measurementSystem === system.id && styles.selectedCardDark,
              ]}
              onPress={() => handleUnitSelect(system.id)}
              accessible={true}
              accessibilityLabel={system.name}
              accessibilityRole="radio"
              accessibilityState={{ checked: measurementSystem === system.id }}
            >
              <View style={[styles.cardHeader, measurementSystem === system.id && styles.selectedCardHeader]}>
                <View style={styles.headerContent}>
                  <Ruler size={24} color={measurementSystem === system.id ? "#0891b2" : (darkMode ? "#94a3b8" : "#64748b")} />
                  <Text style={[
                    styles.systemName,
                    darkMode && styles.systemNameDark,
                    measurementSystem === system.id && styles.selectedText
                  ]}>
                    {system.name}
                  </Text>
                </View>
                {measurementSystem === system.id && (
                  <Check size={20} color="#0891b2" />
                )}
              </View>
              
              <Text style={[styles.systemDescription, darkMode && styles.systemDescriptionDark]}>
                {system.description}
              </Text>
              
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, darkMode && styles.examplesTitleDark]}>
                  Ejemplos:
                </Text>
                {system.examples.map((example, index) => (
                  <Text 
                    key={index} 
                    style={[styles.exampleText, darkMode && styles.exampleTextDark]}
                  >
                    • {example}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              Este cambio se aplicará a todas las mediciones en la aplicación, incluyendo escalas médicas
              y reportes de evaluación.
            </Text>
          </View>
        </ScrollView>
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
  systemCard: {
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
  systemCardDark: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#0e7490',
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  systemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  systemNameDark: {
    color: '#f8fafc',
  },
  selectedText: {
    color: '#0891b2',
  },
  systemDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 20,
  },
  systemDescriptionDark: {
    color: '#94a3b8',
  },
  examplesContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  examplesTitleDark: {
    color: '#e2e8f0',
  },
  exampleText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  exampleTextDark: {
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