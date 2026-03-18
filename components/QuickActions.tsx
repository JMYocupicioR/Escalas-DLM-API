import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  Heart,
  Clock,
  Calculator,
  Activity,
  Settings,
  BookOpen,
  Search,
  TrendingUp,
  Zap,
  History
} from 'lucide-react-native';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  gradient: string[];
  route: string;
  params?: Record<string, string>;
}

interface QuickActionsProps {
  onActionPress?: (actionId: string) => void;
}

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const { colors, isDark } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();

  // Gradientes adaptativos según el tema
  const getGradient = (light: string[], dark: string[]) => {
    return isDark ? dark : light;
  };

  const quickActions: QuickAction[] = [
    {
      id: 'favorites',
      title: 'Favoritos',
      subtitle: 'Escalas guardadas',
      icon: Heart,
      gradient: getGradient(
        ['#fef3c7', '#f59e0b'],
        ['#78350f', '#f59e0b']
      ),
      route: '/scales/favorites' as any
    },
    {
      id: 'scales',
      title: 'Escalas',
      subtitle: 'Todas las escalas',
      icon: Activity,
      gradient: getGradient(
        ['#dcfce7', '#10b981'],
        ['#064e3b', '#10b981']
      ),
      route: '/new-scales'
    },
    {
      id: 'calculators',
      title: 'Calculadoras',
      subtitle: 'Herramientas médicas',
      icon: Calculator,
      gradient: getGradient(
        ['#e0e7ff', '#6366f1'],
        ['#312e81', '#6366f1']
      ),
      route: '/calculators'
    },
    {
      id: 'search',
      title: 'Buscar',
      subtitle: 'Encuentra escalas',
      icon: Search,
      gradient: getGradient(
        ['#f0f9ff', '#0ea5e9'],
        ['#0c4a6e', '#0ea5e9']
      ),
      route: '/search'
    },
    {
      id: 'recent',
      title: 'Historial',
      subtitle: 'Últimas usadas',
      icon: History,
      gradient: getGradient(
        ['#fce7f3', '#ec4899'],
        ['#831843', '#ec4899']
      ),
      route: '/scales/recent' as any
    },
    {
      id: 'guides',
      title: 'Guías',
      subtitle: 'Ayuda y tutoriales',
      icon: BookOpen,
      gradient: getGradient(
        ['#f3e8ff', '#a855f7'],
        ['#581c87', '#a855f7']
      ),
      route: '/settings/help'
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    // Call callback if provided
    onActionPress?.(action.id);

    // Navigate to route
    if (action.params) {
      router.push({
        pathname: action.route as any,
        params: action.params
      });
    } else {
      router.push(action.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap size={20} color={colors.primary} />
          <Text style={styles.title}>Acceso Rápido</Text>
        </View>
        <TouchableOpacity 
          style={styles.configButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Settings size={16} color={colors.mutedText} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          
                        return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => handleActionPress(action)}
                  activeOpacity={0.8}
                >
              <LinearGradient
                colors={action.gradient}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionIcon}>
                    <IconComponent size={20} color="#ffffff" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle} numberOfLines={1}>{action.title}</Text>
                    <Text style={styles.actionSubtitle} numberOfLines={1}>{action.subtitle}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TrendingUp size={14} color={colors.primary} />
          <Text style={styles.statLabel}>Escalas usadas hoy</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Heart size={14} color="#ef4444" />
          <Text style={styles.statLabel}>Favoritos</Text>
          <Text style={styles.statValue}>8</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: isDark ? colors.borderStrong : colors.border,
    ...Platform.select({
      web: {
        boxShadow: isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: isDark ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: isDark ? 8 : 4 },
        shadowOpacity: isDark ? 0.4 : 0.08,
        shadowRadius: isDark ? 12 : 6,
        elevation: isDark ? 8 : 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  configButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? colors.surfaceVariant : colors.sectionBackground,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.border : 'transparent',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    minWidth: 140,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    ...Platform.select({
      web: {
        minWidth: 160,
        transition: 'all 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? '0 8px 16px rgba(0, 0, 0, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  actionCardLeft: {
    // Removed specific margins
  },
  actionCardRight: {
    // Removed specific margins
  },
  actionGradient: {
    ...Platform.select({
      default: { padding: 12, minHeight: 80 },
      web: { padding: 16, minHeight: 88 },
    }),
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },
  actionText: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.2,
    textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
    textShadowColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? colors.borderStrong : colors.border,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: -4,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: isDark ? colors.borderStrong : colors.border,
    marginHorizontal: 16,
    opacity: isDark ? 0.5 : 1,
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? colors.textSecondary : colors.mutedText,
    flex: 1,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 24,
    textAlign: 'right',
  },
});
