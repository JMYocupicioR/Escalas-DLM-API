import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { ArrowRight, Clock } from 'lucide-react-native';

const SPECIALTIES = {
  cardiologia: {
    name: 'Cardiología',
    scales: [
      {
        id: 'nyha',
        name: 'Clasificación NYHA',
        description: 'Clasificación funcional de insuficiencia cardíaca',
        timeToComplete: '2-3 min',
      },
      {
        id: 'grace',
        name: 'Score GRACE',
        description: 'Evaluación de riesgo en síndrome coronario agudo',
        timeToComplete: '5 min',
      },
    ],
  },
  neurologia: {
    name: 'Neurología',
    scales: [
      {
        id: 'glasgow',
        name: 'Escala de Glasgow',
        description: 'Evaluación del nivel de consciencia',
        timeToComplete: '2 min',
      },
      {
        id: 'nihss',
        name: 'NIHSS',
        description: 'Evaluación de déficit neurológico en ictus',
        timeToComplete: '10 min',
      },
    ],
  },
  traumatologia: {
    name: 'Traumatología',
    scales: [
      {
        id: 'harris',
        name: 'Harris Hip Score',
        description: 'Evaluación funcional de cadera',
        timeToComplete: '10 min',
      },
    ],
  },
};

export default function SpecialtyScalesScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const filteredSpecialties = useMemo(() => {
    return Object.entries(SPECIALTIES).filter(([key, specialty]) => {
      if (searchQuery === '') return true;
      
      const matchesSpecialty = specialty.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScales = specialty.scales.some(scale => 
        scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scale.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return matchesSpecialty || matchesScales;
    });
  }, [searchQuery]);

  const AlphabeticalIndex = () => {
    const specialties = Object.values(SPECIALTIES)
      .map(s => s.name)
      .sort();
    
    const letters = [...new Set(specialties.map(s => s[0].toUpperCase()))];

    return (
      <View style={styles.alphabeticalIndex}>
        {letters.map(letter => (
          <TouchableOpacity
            key={letter}
            style={styles.indexItem}
            onPress={() => {
              const specialty = Object.entries(SPECIALTIES).find(([_, s]) => 
                s.name.toUpperCase().startsWith(letter)
              );
              if (specialty) {
                setSelectedSpecialty(specialty[0]);
              }
            }}
          >
            <Text style={styles.indexText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.searchContainer}>
          <SearchWidget
            onSearch={setSearchQuery}
            placeholder="Buscar por especialidad o escala..."
          />
        </View>

        <AlphabeticalIndex />

        <ScrollView style={styles.content}>
          {filteredSpecialties.map(([key, specialty]) => (
            <View key={key} style={styles.specialtySection}>
              <Text style={styles.specialtyTitle}>{specialty.name}</Text>
              
              {specialty.scales.map(scale => (
                <TouchableOpacity
                  key={scale.id}
                  style={styles.scaleCard}
                  onPress={() => router.push(`/scales/${scale.id}`)}
                >
                  <View style={styles.scaleContent}>
                    <Text style={styles.scaleName}>{scale.name}</Text>
                    <Text style={styles.scaleDescription}>{scale.description}</Text>
                    <View style={styles.timeInfo}>
                      <Clock size={16} color={colors.mutedText} />
                      <Text style={styles.timeText}>{scale.timeToComplete}</Text>
                    </View>
                  </View>
                  <ArrowRight size={20} color={colors.mutedText} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.lastUpdate}>
            <Text style={styles.lastUpdateText}>
              Última actualización: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alphabeticalIndex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  indexItem: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  indexText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  specialtySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  specialtyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  scaleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scaleContent: {
    flex: 1,
    marginRight: 12,
  },
  scaleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  scaleDescription: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  lastUpdate: {
    padding: 16,
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: colors.mutedText,
  },
});