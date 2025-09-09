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
  const shouldShowQuickActions = true; // Always show for better UX

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
                  {/* Header with icon and favorite */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: `${iconColor}15` }]}>
                      <IconComponent size={18} color={iconColor} />
                    </View>
                    <FavoriteButton scaleId={s.id} size={16} />
                  </View>
                  
                  {/* Content */}
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{s.description}</Text>
                  
                  {/* Stats and category */}
                  {stats && (
                    <View style={styles.cardFooter}>
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <Users size={10} color={colors.mutedText} />
                          <Text style={styles.statText}>{stats.uses.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Star size={10} color="#f59e0b" />
                          <Text style={styles.statText}>{stats.rating}</Text>
                        </View>
                      </View>
                      <View style={[styles.categoryBadge, { backgroundColor: `${iconColor}10` }]}>
                        <Text style={[styles.categoryText, { color: iconColor }]}>
                          {stats.category}
                        </Text>
                      </View>
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
    paddingBottom: 40,
    ...Platform.select({
      web: {
        paddingHorizontal: 20,
        paddingBottom: 48,
      },
    }),
  },

  hero: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        padding: 24,
      },
    }),
  },
  heroLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    ...Platform.select({
      default: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
      },
      web: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
    }),
  },
  heroTitle: { 
    fontSize: Platform.select({ default: 18, web: 20 }), 
    fontWeight: '800', 
    color: colors.text,
    lineHeight: Platform.select({ default: 24, web: 28 }),
  },
  heroSubtitle: { 
    fontSize: Platform.select({ default: 13, web: 14 }), 
    color: colors.mutedText,
    lineHeight: Platform.select({ default: 18, web: 20 }),
  },
  heroActions: { 
    flexDirection: 'row', 
    gap: Platform.select({ default: 6, web: 8 }), 
    marginTop: Platform.select({ default: 8, web: 12 }),
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.select({ default: 4, web: 6 }),
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: Platform.select({ default: 6, web: 8 }),
    paddingHorizontal: Platform.select({ default: 10, web: 12 }),
    borderRadius: 999,
  },
  pillText: { 
    color: colors.buttonPrimary, 
    fontWeight: '600',
    fontSize: Platform.select({ default: 12, web: 14 }),
  },

  searchSection: { paddingHorizontal: 16, zIndex: 10 },

  section: { 
    paddingHorizontal: 16, 
    marginTop: 20,
    ...Platform.select({
      web: {
        marginTop: 24,
      },
    }),
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Platform.select({ default: 10, web: 12 }),
  },
  sectionTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Platform.select({ default: 6, web: 8 }),
  },
  sectionTitle: { 
    fontSize: Platform.select({ default: 16, web: 18 }), 
    fontWeight: '700', 
    color: colors.text,
    lineHeight: Platform.select({ default: 22, web: 24 }),
  },
  link: { 
    color: colors.linkText, 
    fontWeight: '600',
    fontSize: Platform.select({ default: 13, web: 14 }),
  },
  emptyText: { color: colors.mutedText },

  chipsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.sectionBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  chipText: { 
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },

  grid: (_cols: number) => ({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    gap: 8,
  }),
  col: (cols: number) => ({
    width: cols === 3 ? 'calc(33.333% - 8px)' : cols === 2 ? 'calc(50% - 8px)' : '100%',
    ...Platform.select({
      default: {
        width: cols === 3 ? '31%' : cols === 2 ? '47%' : '100%',
      },
    }),
  }),
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Platform.select({ default: 12, web: 14 }),
    padding: Platform.select({ default: 12, web: 16 }),
    margin: Platform.select({ default: 3, web: 4 }),
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Platform.select({ default: 10, web: 12 }),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Platform.select({ default: 10, web: 11 }),
    color: colors.mutedText,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Platform.select({ default: 5, web: 6 }),
    paddingVertical: Platform.select({ default: 1, web: 2 }),
    borderRadius: Platform.select({ default: 6, web: 8 }),
    marginTop: Platform.select({ default: 6, web: 8 }),
  },
  categoryText: {
    fontSize: Platform.select({ default: 9, web: 10 }),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardWide: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginRight: 12,
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      web: {
        minWidth: 320,
      },
    }),
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { 
    fontSize: Platform.select({ default: 15, web: 16 }), 
    fontWeight: '700', 
    color: colors.text,
    lineHeight: Platform.select({ default: 20, web: 22 }),
  },
  cardDesc: { 
    fontSize: Platform.select({ default: 12, web: 13 }), 
    color: colors.mutedText, 
    marginTop: 4,
    lineHeight: Platform.select({ default: 16, web: 18 }),
  },
  hList: { paddingLeft: 16, paddingRight: 8 },

  devNote: { color: colors.mutedText, fontStyle: 'italic', textAlign: 'center' },
});
