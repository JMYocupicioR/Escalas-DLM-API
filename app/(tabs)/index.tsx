import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/components/AppIcon';
import { SearchWidget } from '@/components/SearchWidget';
import { QuickActions } from '@/components/QuickActions';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScalesStore } from '@/store/scales';
import { scalesById, scales as allScales } from '@/data/_scales';
import { Activity, Brain, Star, Calculator, Compass, Heart, TrendingUp, Users, Clock, Zap } from 'lucide-react-native';

const calculators = [
  { id: 'botulinum', title: 'Toxina Botulínica', description: 'Unidades, volumen y dilución' },
];

const POPULAR_IDS = ['barthel', 'glasgow', 'mmse', 'fim', 'lequesne-rodilla-es-v1', 'vas'];

// Simulated usage stats for popular scales
const SCALE_STATS = {
  'barthel': { uses: 1247, rating: 4.8, category: 'Funcional', icon: Activity, color: '#10b981' },
  'glasgow': { uses: 982, rating: 4.9, category: 'Neurológica', icon: Brain, color: '#8b5cf6' },
  'mmse': { uses: 756, rating: 4.7, category: 'Cognitiva', icon: Zap, color: '#f59e0b' },
  'fim': { uses: 654, rating: 4.6, category: 'Funcional', icon: TrendingUp, color: '#0891b2' },
  'lequesne-rodilla-es-v1': { uses: 432, rating: 4.5, category: 'Dolor', icon: Heart, color: '#ef4444' },
  'vas': { uses: 1156, rating: 4.8, category: 'Dolor', icon: Activity, color: '#f97316' },
};

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
  
  // Responsive breakpoints for better mobile web experience
  const isCompact = !isTablet && !isDesktop;
  const shouldShowQuickActions = !isCompact || recentlyViewed.length === 0;

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
          <SearchWidget 
            placeholder="Buscar escalas médicas..." 
            showFilters={true}
            showVoiceSearch={true}
            showQuickFilters={true}
          />
        </View>

        {/* Quick Actions */}
        {shouldShowQuickActions && <QuickActions />}

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
            {popularScales.map((s) => {
              const stats = SCALE_STATS[s.id as keyof typeof SCALE_STATS];
              const IconComponent = stats?.icon || Activity;
              const iconColor = stats?.color || colors.primary;
              
              return (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.card, styles.col(columns)]} 
                  onPress={() => router.push(`/scales/${s.id}`)}
                  activeOpacity={0.7}
                >
                  {/* Header with icon, stats and favorite */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconBadge, { backgroundColor: `${iconColor}15` }]}>
                        <IconComponent size={18} color={iconColor} />
                      </View>
                      {stats && (
                        <View style={styles.statsContainer}>
                          <View style={styles.statItem}>
                            <Users size={12} color={colors.mutedText} />
                            <Text style={styles.statText}>{stats.uses.toLocaleString()}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Star size={12} color="#f59e0b" />
                            <Text style={styles.statText}>{stats.rating}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <FavoriteButton scaleId={s.id} size={16} />
                  </View>
                  
                  {/* Content */}
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{s.description}</Text>
                  
                  {/* Category badge */}
                  {stats && (
                    <View style={[styles.categoryBadge, { backgroundColor: `${iconColor}10` }]}>
                      <Text style={[styles.categoryText, { color: iconColor }]}>
                        {stats.category}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  content: { 
    paddingBottom: 32,
    ...Platform.select({
      web: {
        paddingHorizontal: 16,
      },
    }),
  },

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
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
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
