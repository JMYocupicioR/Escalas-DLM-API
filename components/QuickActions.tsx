import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { 
  Heart, 
  Clock, 
  Calculator, 
  FileText, 
  Settings, 
  Download,
  Bookmark,
  TrendingUp,
  Zap
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
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'favorites',
      title: 'Favoritos',
      subtitle: 'Escalas guardadas',
      icon: Heart,
      gradient: ['#fef3c7', '#f59e0b'],
      route: '/scales',
      params: { filter: 'favorites' }
    },
    {
      id: 'recent',
      title: 'Recientes',
      subtitle: 'Últimas usadas',
      icon: Clock,
      gradient: ['#dcfce7', '#10b981'],
      route: '/scales',
      params: { filter: 'recent' }
    },
    {
      id: 'calculators',
      title: 'Calculadoras',
      subtitle: 'Herramientas médicas',
      icon: Calculator,
      gradient: ['#e0e7ff', '#6366f1'],
      route: '/calculators'
    },
    {
      id: 'reports',
      title: 'Reportes',
      subtitle: 'Generar PDF',
      icon: FileText,
      gradient: ['#fce7f3', '#ec4899'],
      route: '/settings',
      params: { tab: 'reports' }
    },
    {
      id: 'offline',
      title: 'Sin conexión',
      subtitle: 'Escalas descargadas',
      icon: Download,
      gradient: ['#f0f9ff', '#0ea5e9'],
      route: '/settings',
      params: { tab: 'offline' }
    },
    {
      id: 'bookmarks',
      title: 'Marcadores',
      subtitle: 'Páginas guardadas',
      icon: Bookmark,
      gradient: ['#f3e8ff', '#a855f7'],
      route: '/scales',
      params: { filter: 'bookmarks' }
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
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
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
  },
  configButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.sectionBackground,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    minWidth: 140,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        minWidth: 160,
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
    padding: 12,
    minHeight: 80,
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedText,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
