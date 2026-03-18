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
      {
        id: 'hine',
        name: 'HINE - Hammersmith Infant Neurological Examination',
        description: 'Evaluación neurológica estandarizada para lactantes de 2 a 24 meses',
        timeToComplete: '30-45 min',
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
  pediatria: {
    name: 'Pediatria',
    scales: [
      { id: 'weefim', name: 'WeeFIM', description: 'Medida de independencia funcional pediatrica (18 items, 1-7)', timeToComplete: '15-30 min' },
      { id: 'denver2', name: 'Denver II', description: 'Evaluacion del desarrollo: personal-social, motricidad, lenguaje', timeToComplete: '10-20 min' },
    ],
  },
};

export default function SpecialtyScalesScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const filteredSpecialties = useMemo(() => {
    const entries = Object.entries(SPECIALTIES).filter(([_, specialty]) => {
      if (searchQuery === '') return true;
      const q = searchQuery.toLowerCase();
      const matchesSpecialty = specialty.name.toLowerCase().includes(q);
      const matchesScales = specialty.scales.some(scale =>
        scale.name.toLowerCase().includes(q) ||
        scale.description.toLowerCase().includes(q)
      );
      return matchesSpecialty || matchesScales;
    });
    // Destacar Pediatría primero en la lista
    entries.sort((a, b) => (a[0] === 'pediatria' ? -1 : b[0] === 'pediatria' ? 1 : 0));
    return entries;
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
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/')}> 
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Inicio</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / </Text>
              <TouchableOpacity onPress={() => router.push('/scales')}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Escalas</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / Por especialidad</Text>
            </View>
          ),
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
                    {scale.id === 'weefim' && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Nuevo</Text>
                      </View>
                    )}
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
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
