import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/components/AppIcon';
import { SearchWidget } from '@/components/SearchWidget';
import { QuickActions } from '@/components/QuickActions';
import { FavoriteButton } from '@/components/FavoriteButton';
import ScalesCategoriesHome from '@/components/home/SupabaseCategoriesHome';
import { ScaleCard, ScaleCardData } from '@/components/Card';
import { ScaleGridSkeleton, EmptyState } from '@/components/LoadingStates';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScalesStore } from '@/store/scales';
import { scalesById, scales as allScales } from '@/data/_scales';
import { getScales } from '@/api/scales';
import { calculateGridConfig, getLayoutMode, shouldUseListView } from '@/utils/responsiveGrid';
import { Activity, Brain, Star, Calculator, Compass, Heart, TrendingUp, Users, Clock, Zap, Search as SearchIcon } from 'lucide-react-native';

const calculators = [
  { id: 'botulinum', title: 'Toxina Botulínica', description: 'Unidades, volumen y dilución' },
];

const POPULAR_IDS = ['weefim', 'barthel', 'glasgow', 'mmse', 'fim', 'lequesne-rodilla-es-v1', 'vas', 'hine'];

// Animated Card Component with stagger effect
interface AnimatedCardWrapperProps {
  children: React.ReactNode;
  delay: number;
  style?: any;
}

function AnimatedCardWrapper({ children, delay, style }: AnimatedCardWrapperProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Simulated usage stats for popular scales
const SCALE_STATS = {
  'barthel': { uses: 1247, rating: 4.8, category: 'Funcional', icon: Activity, color: '#10b981' },
  'glasgow': { uses: 982, rating: 4.9, category: 'Neurológica', icon: Brain, color: '#8b5cf6' },
  'mmse': { uses: 756, rating: 4.7, category: 'Cognitiva', icon: Zap, color: '#f59e0b' },
  'fim': { uses: 654, rating: 4.6, category: 'Funcional', icon: TrendingUp, color: '#0891b2' },
  'weefim': { uses: 1328, rating: 4.8, category: 'Pediátrica', icon: Users, color: '#06b6d4' },
  'lequesne-rodilla-es-v1': { uses: 432, rating: 4.5, category: 'Dolor', icon: Heart, color: '#ef4444' },
  'vas': { uses: 1156, rating: 4.8, category: 'Dolor', icon: Activity, color: '#f97316' },
  'hine': { uses: 523, rating: 4.7, category: 'Neurológica', icon: Brain, color: '#3b82f6' },
};

function HomeScreen() {
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isTablet, isDesktop, width, isLandscape } = useResponsiveLayout();
  const recentlyViewed = useScalesStore((s) => s.recentlyViewed);
  const router = useRouter();
  
  // Load popular scales from Supabase (dynamic data)
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseScales, setSupabaseScales] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getScales({ limit: 12, sortBy: 'popularity' });
        if (!cancelled && res.data && res.data.length > 0) {
          setSupabaseScales(res.data);
        }
      } catch (e) {
        console.warn('[Home] Failed to load Supabase scales, using fallback');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Use Supabase data if available, fallback to hardcoded
  const popularScales = useMemo(() => {
    if (supabaseScales.length > 0) return supabaseScales;
    // Fallback to hardcoded local data
    const list = POPULAR_IDS.map(id => scalesById[id]).filter(Boolean) as typeof allScales;
    if (list.length < 6) {
      const extras = allScales.filter(s => !POPULAR_IDS.includes(s.id)).slice(0, 6 - list.length);
      return [...list, ...extras];
    }
    return list;
  }, [supabaseScales]);

  // Enhanced grid configuration
  const gridConfig = useMemo(() => calculateGridConfig({
    screenWidth: width,
    isPhone: !isTablet && !isDesktop,
    isTablet,
    isDesktop,
    isLandscape,
  }), [width, isTablet, isDesktop, isLandscape]);

  const columns = gridConfig.columns;
  const layoutMode = getLayoutMode(width, isLandscape);
  const useListView = shouldUseListView(width);

  // Convert scales to ScaleCardData format
  const popularScalesData: ScaleCardData[] = useMemo(() => {
    return popularScales.map((scale: any) => {
      const stats = SCALE_STATS[scale.id as keyof typeof SCALE_STATS];
      // Supabase scales have 'category' field, local scales have stats mapping
      const category = scale.category || stats?.category || 'General';
      return {
        id: scale.id,
        name: scale.name || scale.acronym || 'Escala',
        description: scale.description,
        category,
        categoryColor: stats?.color || '#0891b2',
        icon: stats?.icon || Activity,
        uses: stats?.uses,
        rating: stats?.rating,
        timeToComplete: scale.time_to_complete ? `${scale.time_to_complete} min` : '5-10 min',
      };
    });
  }, [popularScales]);
  
  // Responsive breakpoints for better mobile web experience
  const isCompact = !isTablet && !isDesktop;
  const shouldShowQuickActions = true; // Always show for better UX

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero - Enhanced */}
        <LinearGradient 
          colors={[`${colors.primary}18`, `${colors.primary}08`, `${colors.primary}02`]} 
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.iconWrapper}>
                <AppIcon size={isDesktop ? 64 : 56} />
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Escalas y Calculadoras Médicas</Text>
                <Text style={styles.heroSubtitle}>
                  {isDesktop 
                    ? 'Busca, explora y evalúa escalas médicas en segundos con nuestra plataforma profesional' 
                    : 'Busca, explora y evalúa en segundos'}
                </Text>
              </View>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity 
                style={[styles.pill, styles.pillPrimary]} 
                onPress={() => router.push('/scales')}
                activeOpacity={0.8}
              >
                <Compass size={18} color="#ffffff" />
                <Text style={[styles.pillText, styles.pillTextPrimary]}>Explorar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.pill} 
                onPress={() => router.push('/calculators')}
                activeOpacity={0.8}
              >
                <Calculator size={18} color={colors.primary} />
                <Text style={styles.pillText}>Calculadoras</Text>
              </TouchableOpacity>
            </View>
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
                  <TouchableOpacity key={id} style={styles.chip} onPress={() => router.push(`/new-scales/${id}` as any)}>
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

          {isLoading ? (
            <ScaleGridSkeleton 
              count={6} 
              layout={useListView ? 'list' : 'grid'} 
              columns={columns} 
            />
          ) : popularScalesData.length === 0 ? (
            <EmptyState
              title="No hay escalas disponibles"
              description="No se encontraron escalas populares en este momento"
              icon={<SearchIcon size={32} color={colors.mutedText} />}
            />
          ) : (
            <View style={[
              styles.grid,
              { 
                flexDirection: useListView ? 'column' : 'row',
                gap: gridConfig.gap,
              }
            ]}>
              {popularScalesData.map((scaleData, index) => (
                <AnimatedCardWrapper
                  key={scaleData.id}
                  delay={index * 80}
                  style={[
                    styles.gridItem,
                    useListView ? styles.gridItemFull : styles.col(columns)
                  ]}
                >
                  <ScaleCard
                    scale={scaleData}
                    layout={useListView ? 'list' : 'grid'}
                    onPress={() => router.push(`/new-scales/${scaleData.id}` as any)}
                    showStats={true}
                    showCategory={true}
                    rightElement={
                      <FavoriteButton scaleId={scaleData.id} size={18} />
                    }
                  />
                </AnimatedCardWrapper>
              ))}
            </View>
          )}
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
    padding: Platform.select({ default: 20, web: 28 }),
    backgroundColor: colors.card,
    borderRadius: Platform.select({ default: 16, web: 20 }),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  heroContent: {
    gap: Platform.select({ default: 16, web: 20 }),
    // On web: lay hero icon+text and action pills side-by-side
    ...(Platform.OS === 'web'
      ? { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const }
      : {}),
  },
  heroLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    ...Platform.select({
      default: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
      },
      web: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
      },
    }),
  },
  iconWrapper: {
    ...Platform.select({
      web: {
        padding: 4,
      },
    }),
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: { 
    fontSize: Platform.select({ default: 20, web: 24 }), 
    fontWeight: '800', 
    color: colors.text,
    lineHeight: Platform.select({ default: 26, web: 32 }),
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: { 
    fontSize: Platform.select({ default: 14, web: 15 }), 
    color: colors.mutedText,
    lineHeight: Platform.select({ default: 20, web: 22 }),
    maxWidth: Platform.select({ default: '100%', web: 480 }),
  },
  heroActions: { 
    flexDirection: 'row', 
    gap: Platform.select({ default: 8, web: 12 }), 
    marginTop: Platform.select({ default: 4, web: 8 }),
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.select({ default: 6, web: 8 }),
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    borderWidth: 1.5,
    paddingVertical: Platform.select({ default: 10, web: 12 }),
    paddingHorizontal: Platform.select({ default: 16, web: 20 }),
    borderRadius: 999,
    minHeight: Platform.select({ default: 40, web: 44 }),
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  pillPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  pillText: { 
    color: colors.primary, 
    fontWeight: '600',
    fontSize: Platform.select({ default: 14, web: 15 }),
  },
  pillTextPrimary: {
    color: '#ffffff',
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    alignItems: 'flex-start',
  },
  gridItem: {
    marginBottom: Platform.select({ default: 16, web: 20 }),
  },
  gridItemFull: {
    width: '100%',
  },
  col: (cols: number) => ({
    width: cols === 3 ? 'calc(33.333% - 16px)' : cols === 2 ? 'calc(50% - 16px)' : '100%',
    ...Platform.select({
      default: {
        width: cols === 3 ? '31%' : cols === 2 ? '47%' : '100%',
      },
    }),
    paddingHorizontal: 4,
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
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingVertical: Platform.select({ default: 2, web: 3 }),
    paddingHorizontal: Platform.select({ default: 6, web: 8 }),
    borderRadius: 999,
    marginTop: 6,
    marginBottom: 2,
  },
  newBadgeText: {
    fontSize: Platform.select({ default: 10, web: 11 }),
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

export default HomeScreen;
