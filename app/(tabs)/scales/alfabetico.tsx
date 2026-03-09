import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { SearchWidget } from '@/components/SearchWidget';
import { ScaleCard, ScaleCardData } from '@/components/Card';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { calculateGridConfig, shouldUseListView } from '@/utils/responsiveGrid';
import { Star, Activity, Brain, Heart } from 'lucide-react-native';

// Category icons and colors mapping
const CATEGORY_STYLES = {
  'Funcional': { icon: Activity, color: '#10b981' },
  'Neurológica': { icon: Brain, color: '#8b5cf6' },
  'Dolor': { icon: Heart, color: '#ef4444' },
  'Cognitiva': { icon: Brain, color: '#f59e0b' },
  'default': { icon: Activity, color: '#0891b2' },
};

const SCALES = [
  {
    id: 'barthel',
    name: 'Índice de Barthel',
    acronym: 'IB',
    description: 'Evaluación de actividades básicas de la vida diaria',
    popular: true,
    timeToComplete: '5-10 min',
    category: 'Funcional',
    rating: 4.8,
    uses: 1247,
  },
  {
    id: 'gas',
    name: 'Escala de Consecución de Objetivos',
    acronym: 'GAS',
    description: 'Evaluación centrada en objetivos personalizados (rehabilitación)',
    popular: true,
    timeToComplete: '10-20 min',
    category: 'Funcional',
    rating: 4.6,
    uses: 892,
  },
  {
    id: 'glasgow',
    name: 'Escala de Coma de Glasgow',
    acronym: 'GCS',
    description: 'Evaluación del nivel de consciencia',
    popular: true,
    timeToComplete: '2 min',
    category: 'Neurológica',
    rating: 4.9,
    uses: 982,
  },
  {
    id: 'fim',
    name: 'Escala de Independencia Funcional (FIM)',
    acronym: 'FIM',
    description: 'Evaluación de la discapacidad y carga de cuidados en rehabilitación',
    popular: true,
    timeToComplete: '20-30 min',
    category: 'Funcional',
    rating: 4.6,
    uses: 654,
  },
  {
    id: 'weefim',
    name: 'WeeFIM (Medida de Independencia Funcional para Niños)',
    acronym: 'WeeFIM',
    description: 'Versión pediátrica de FIM: autocuidado, movilidad y cognición (18 ítems)',
    popular: false,
    timeToComplete: '15-30 min',
    category: 'Funcional',
    rating: 4.8,
    uses: 1328,
  },
  {
    id: 'hine',
    name: 'Hammersmith Infant Neurological Examination',
    acronym: 'HINE',
    description: 'Evaluación neurológica estandarizada para lactantes de 2 a 24 meses',
    popular: true,
    timeToComplete: '30-45 min',
    category: 'Neurológica',
    rating: 4.7,
    uses: 523,
  },
  {
    id: 'mmse',
    name: 'Mini-Mental State Examination',
    acronym: 'MMSE',
    description: 'Evaluación del estado cognitivo',
    popular: true,
    timeToComplete: '10 min',
    category: 'Cognitiva',
    rating: 4.7,
    uses: 756,
  },
  {
    id: 'ogs',
    name: 'Observational Gait Scale',
    acronym: 'OGS',
    description: 'Evaluación cualitativa de parámetros de la marcha',
    popular: false,
    timeToComplete: '15 min',
    category: 'Funcional',
    rating: 4.3,
    uses: 378,
  },
  {
    id: 'sf36',
    name: 'Cuestionario de Salud SF-36',
    acronym: 'SF-36',
    description: 'Cuestionario de calidad de vida relacionada con la salud que evalúa 8 dimensiones del estado de salud físico y mental',
    popular: true,
    timeToComplete: '10-15 min',
    category: 'Funcional',
    rating: 4.7,
    uses: 892,
  },
  {
    id: 'berg',
    name: 'Escala de Equilibrio de Berg',
    acronym: 'BBS',
    description: 'Evaluación funcional del equilibrio estático y dinámico a través de 14 tareas',
    popular: true,
    timeToComplete: '15-20 min',
    category: 'Funcional',
    rating: 4.8,
    uses: 734,
  },
  {
    id: 'katz',
    name: 'Índice de Katz de Independencia en AVD',
    acronym: 'Katz',
    description: 'Evaluación de la independencia funcional en actividades básicas de la vida diaria en adultos mayores',
    popular: true,
    timeToComplete: '5-10 min',
    category: 'Funcional',
    rating: 4.6,
    uses: 612,
  },
  {
    id: 'lequesne-rodilla-es-v1',
    name: 'Índice de Lequesne para Osteoartritis de Rodilla',
    acronym: 'Lequesne',
    description: 'Cuestionario para cuantificar dolor/malestar, distancia máxima de marcha y dificultades en la vida diaria en osteoartritis de rodilla',
    popular: false,
    timeToComplete: '3-5 min',
    category: 'Dolor',
    rating: 4.5,
    uses: 432,
  },
  {
    id: 'boston',
    name: 'Cuestionario de Boston',
    acronym: 'BCTQ',
    description: 'Evaluación de síntomas y función en síndrome del túnel carpiano',
    popular: false,
    timeToComplete: '5-10 min',
    category: 'Dolor',
    rating: 4.4,
    uses: 289,
  },
  {
    id: 'norton',
    name: 'Escala de Norton',
    acronym: 'Norton',
    description: 'Valoración del riesgo de úlceras por presión',
    popular: false,
    timeToComplete: '5 min',
    category: 'Funcional',
    rating: 4.2,
    uses: 445,
  },
  {
    id: 'vas',
    name: 'Escala Visual Analógica',
    acronym: 'VAS',
    description: 'Evaluación del dolor',
    popular: true,
    timeToComplete: '1 min',
    category: 'Dolor',
    rating: 4.8,
    uses: 1156,
  },
  {
    id: 'borg',
    name: 'Escala de Borg',
    acronym: 'RPE',
    description: 'Evaluación de disnea',
    popular: false,
    timeToComplete: '2 min',
    category: 'Funcional',
    rating: 4.5,
    uses: 567,
  },
  {
    id: '6mwt',
    name: 'Test de Marcha de 6 Minutos',
    acronym: '6MWT',
    description: 'Evaluación de la capacidad funcional y tolerancia al ejercicio mediante distancia recorrida',
    popular: true,
    timeToComplete: '15-20 min',
    category: 'Funcional',
    rating: 4.7,
    uses: 823,
  },
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    acronym: 'POMA',
    description: 'Evaluación del equilibrio y la marcha',
    popular: false,
    timeToComplete: '10-15 min',
    category: 'Funcional',
    rating: 4.6,
    uses: 498,
  },
  // Add more scales...
].sort((a, b) => a.name.localeCompare(b.name));

export default function AlphabeticalScalesScreen() {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width, isTablet, isDesktop, isLandscape } = useResponsiveLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Responsive grid configuration
  const gridConfig = useMemo(() => calculateGridConfig({
    screenWidth: width,
    isPhone: !isTablet && !isDesktop,
    isTablet,
    isDesktop,
    isLandscape,
  }), [width, isTablet, isDesktop, isLandscape]);

  const useListView = shouldUseListView(width);

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
    }, {} as Record<string, typeof SCALES>);
  }, [searchQuery]);

  const letters = Object.keys(groupedScales).sort();

  // Convert scale data to ScaleCardData format
  const convertToCardData = (scale: typeof SCALES[0]): ScaleCardData => {
    const categoryStyle = CATEGORY_STYLES[scale.category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.default;
    return {
      id: scale.id,
      name: scale.name,
      description: scale.description,
      category: scale.category,
      categoryColor: categoryStyle.color,
      icon: categoryStyle.icon,
      uses: scale.uses,
      rating: scale.rating,
      timeToComplete: scale.timeToComplete,
    };
  };

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
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.push('/')}> 
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Inicio</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / </Text>
              <TouchableOpacity onPress={() => router.push('/scales')}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Escalas</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.mutedText }}> / Por abecedario</Text>
            </View>
          ),
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
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{letter}</Text>
                <Text style={styles.sectionCount}>{groupedScales[letter].length} escalas</Text>
              </View>
              
              <View style={[
                styles.scalesGrid,
                { 
                  flexDirection: useListView ? 'column' : 'row',
                  gap: gridConfig.gap,
                }
              ]}>
                {groupedScales[letter].map(scale => {
                  const scaleData = convertToCardData(scale);
                  return (
                    <View
                      key={scale.id}
                      style={[
                        styles.scaleCardWrapper,
                        useListView ? styles.scaleCardFull : {
                          width: gridConfig.columns === 3 ? '31%' : gridConfig.columns === 2 ? '47%' : '100%'
                        }
                      ]}
                    >
                      <ScaleCard
                        scale={scaleData}
                        layout={useListView ? 'list' : 'grid'}
                        onPress={() => router.push(`/scales/${scale.id}`)}
                        showStats={true}
                        showCategory={true}
                        rightElement={
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {scale.id === 'weefim' && (
                              <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>Nuevo</Text>
                              </View>
                            )}
                            {scale.popular ? (
                              <View style={styles.popularBadge}>
                                <Star size={14} color={colors.scoreGood} fill={colors.scoreGood} />
                              </View>
                            ) : (
                              <FavoriteButton scaleId={scale.id} size={16} />
                            )}
                          </View>
                        }
                      />
                    </View>
                  );
                })}
              </View>
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
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedText,
  },
  scalesGrid: {
    flexWrap: 'wrap',
  },
  scaleCardWrapper: {
    marginBottom: 12,
  },
  scaleCardFull: {
    width: '100%',
  },
  popularBadge: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: `${colors.scoreGood}15`,
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
  newBadge: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
