import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/components/AppIcon';
import { SearchWidget } from '@/components/SearchWidget';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScalesStore } from '@/store/scales';
import { scalesById, scales as allScales } from '@/data/_scales';
import { Activity, Brain, Star, Calculator, Compass } from 'lucide-react-native';

const calculators = [
  { id: 'botulinum', title: 'Toxina Botulínica', description: 'Unidades, volumen y dilución' },
];

const POPULAR_IDS = ['barthel', 'glasgow', 'mmse', 'fim', 'lequesne-rodilla-es-v1', 'vas'];

export default function HomeScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isTablet, isDesktop } = useResponsiveLayout();
  const recentlyViewed = useScalesStore((s) => s.recentlyViewed);
  const router = useRouter();

  const popularScales = useMemo(() => {
    const list = POPULAR_IDS.map(id => scalesById[id]).filter(Boolean) as typeof allScales;
    if (list.length < 6) {
      const extras = allScales.filter(s => !POPULAR_IDS.includes(s.id)).slice(0, 6 - list.length);
      return [...list, ...extras];
    }
    return list;
  }, []);

  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <LinearGradient colors={[`${colors.primary}15`, `${colors.primary}05`]} style={styles.hero}>
          <View style={styles.heroLeft}>
            <AppIcon size={56} />
            <View>
              <Text style={styles.heroTitle}>Escalas y Calculadoras Médicas</Text>
              <Text style={styles.heroSubtitle}>Busca, explora y evalúa en segundos</Text>
            </View>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.pill} onPress={() => router.push('/scales')}>
              <Compass size={16} color={colors.buttonPrimary} />
              <Text style={styles.pillText}>Explorar Escalas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pill} onPress={() => router.push('/calculators')}>
              <Calculator size={16} color={colors.buttonPrimary} />
              <Text style={styles.pillText}>Calculadoras</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchSection}>
          <SearchWidget placeholder="Buscar escalas médicas..." showFilters={true} />
        </View>

        {/* Recientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recientes</Text>
          </View>
          {recentlyViewed.length === 0 ? (
            <Text style={styles.emptyText}>Aún no has abierto ninguna escala.</Text>
          ) : (
            <View style={styles.chipsRow}>
              {recentlyViewed.slice(0, 6).map(id => {
                const s = scalesById[id];
                if (!s) return null;
                return (
                  <TouchableOpacity key={id} style={styles.chip} onPress={() => router.push(`/scales/${id}`)}>
                    <Text style={styles.chipText}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Populares */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Star size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Escalas populares</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/scales')}>
              <Text style={styles.link}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid(columns)}>
            {popularScales.map((s) => (
              <TouchableOpacity key={s.id} style={[styles.card, styles.col(columns)]} onPress={() => router.push(`/scales/${s.id}`)}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Activity size={18} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{s.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculadoras */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Brain size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Calculadoras</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/calculators')}>
              <Text style={styles.link}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={calculators}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cardWide} onPress={() => router.push(`/calculators/${item.id}`)}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Calculator size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {__DEV__ && (
          <View style={[styles.section, { paddingBottom: 24 }]}>
            <Text style={styles.devNote}>Modo desarrollo: usa el buscador para validar escalas.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },

  hero: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  heroSubtitle: { fontSize: 14, color: colors.mutedText },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: { color: colors.buttonPrimary, fontWeight: '600' },

  searchSection: { paddingHorizontal: 16, zIndex: 10 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  link: { color: colors.linkText, fontWeight: '600' },
  emptyText: { color: colors.mutedText },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.sectionBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { color: colors.text },

  grid: (_cols: number) => ({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  }),
  col: (cols: number) => ({
    width: cols === 3 ? '31.5%' : cols === 2 ? '48%' : '100%',
  }),
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    margin: 6,
  },
  cardWide: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.mutedText, marginTop: 4 },
  hList: { paddingLeft: 16, paddingRight: 8 },

  devNote: { color: colors.mutedText, fontStyle: 'italic', textAlign: 'center' },
});
