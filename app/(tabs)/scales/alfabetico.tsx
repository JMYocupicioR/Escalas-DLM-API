import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { Star, ArrowRight, Clock } from 'lucide-react-native';

const SCALES = [
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    acronym: 'IB',
    description: 'Evaluación de actividades básicas de la vida diaria',
    popular: true,
    timeToComplete: '5-10 min',
  },
  {
    id: 'glasgow',
    name: 'Escala de Coma de Glasgow',
    acronym: 'GCS',
    description: 'Evaluación del nivel de consciencia',
    popular: true,
    timeToComplete: '2 min',
  },
  {
    id: 'mmse',
    name: 'Mini-Mental State Examination',
    acronym: 'MMSE',
    description: 'Evaluación del estado cognitivo',
    popular: true,
    timeToComplete: '10 min',
  },
  // Add more scales...
].sort((a, b) => a.name.localeCompare(b.name));

export default function AlphabeticalScalesScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');

  const groupedScales = useMemo(() => {
    const filtered = SCALES.filter(scale =>
      scale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scale.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scale.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc, scale) => {
      const letter = scale.name[0].toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(scale);
      return acc;
    }, {});
  }, [searchQuery]);

  const letters = Object.keys(groupedScales).sort();

  const AlphabeticalIndex = () => (
    <View style={styles.alphabeticalIndex}>
      {letters.map(letter => (
        <TouchableOpacity
          key={letter}
          style={styles.indexItem}
          onPress={() => {
            // Implement scroll to section
          }}
        >
          <Text style={styles.indexText}>{letter}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            placeholder="Buscar escalas..."
          />
        </View>

        <AlphabeticalIndex />

        <ScrollView style={styles.content}>
          {letters.map(letter => (
            <View key={letter} style={styles.section}>
              <Text style={styles.sectionTitle}>{letter}</Text>
              
              {groupedScales[letter].map(scale => (
                <TouchableOpacity
                  key={scale.id}
                  style={styles.scaleCard}
                  onPress={() => router.push(`/scales/${scale.id}`)}
                >
                  <View style={styles.scaleContent}>
                    <View style={styles.scaleHeader}>
                      <View>
                        <Text style={styles.scaleName}>{scale.name}</Text>
                        <Text style={styles.scaleAcronym}>{scale.acronym}</Text>
                      </View>
                      {scale.popular && (
                        <Star size={20} color={colors.scoreGood} fill={colors.scoreGood} />
                      )}
                    </View>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
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
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  scaleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scaleAcronym: {
    fontSize: 14,
    color: colors.mutedText,
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