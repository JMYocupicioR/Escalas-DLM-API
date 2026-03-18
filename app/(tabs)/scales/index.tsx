import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { Activity, Brain, Heart, Stethoscope, Bone, Baby, ListOrdered } from 'lucide-react-native';
import { useScalesStore } from '@/store/scales';

const BROWSE_OPTIONS = [
  {
    id: 'alfabetico',
    name: 'Por Abecedario',
    description: 'Todas las escalas ordenadas alfabéticamente',
    icon: ListOrdered,
    color: '#3b82f6',
  },
  {
    id: 'funcional',
    name: 'Por Función',
    description: 'Agrupadas por su propósito clínico',
    icon: Activity,
    color: '#16a34a',
  },
  {
    id: 'especialidad',
    name: 'Por Especialidad',
    description: 'Relevantes para cada área médica',
    icon: Stethoscope,
    color: '#8b5cf6',
  },
  {
    id: 'segmento',
    name: 'Por Segmento Corporal',
    description: 'Específicas para cada parte del cuerpo',
    icon: Bone,
    color: '#f97316',
  },
];

export default function ScalesBrowseScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isDesktop, isTablet } = useResponsiveLayout();
  const lastSection = useScalesStore(s => s.lastExploreSection);
  const setLastSection = useScalesStore(s => s.setLastExploreSection);

  const numColumns = useMemo(() => {
    if (isDesktop) return 4;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);

  const renderOptionCard = ({ item }: { item: typeof BROWSE_OPTIONS[0] }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => router.push(`/scales/${item.id}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Icon size={32} color={item.color} />
        </View>
        <Text style={styles.optionName}>{item.name}</Text>
        <Text style={styles.optionDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Explorar Escalas', 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/')}> 
              <Text style={{ color: colors.linkText || colors.primary, fontWeight: '600' }}>Inicio</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={BROWSE_OPTIONS}
          renderItem={renderOptionCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Explorar Escalas Médicas</Text>
                <Text style={styles.subtitle}>
                  Encuentra la herramienta de evaluación que necesitas.
                </Text>
              </View>
              {/* Saltos rápidos */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickNavRow}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {BROWSE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.quickChip, lastSection === opt.id ? styles.quickChipActive : null]}
                    onPress={() => { setLastSection(opt.id); router.push(`/scales/${opt.id}`); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Ir a ${opt.name}`}
                  >
                    <Text style={[styles.quickChipText, lastSection === opt.id ? styles.quickChipTextActive : null]}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  quickNavRow: {
    paddingBottom: 8,
  },
  quickChip: {
    backgroundColor: colors.sectionBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  quickChipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  quickChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  quickChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
