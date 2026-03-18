import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useScalesStore } from '@/store/scales';
import { scalesById } from '@/data/_scales';
import { History, ArrowRight, Clock, Trash2 } from 'lucide-react-native';
import EmptyState from '@/components/errors/EmptyState';

export default function RecentScalesScreen() {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors, fontSizeMultiplier), [colors, fontSizeMultiplier]);
  const { columns, contentPadding } = useResponsiveLayout();
  const router = useRouter();

  const { recentlyViewed, clearRecentlyViewed } = useScalesStore();

  const recentScales = useMemo(() => {
    return recentlyViewed
      .map(id => scalesById[id])
      .filter(Boolean);
  }, [recentlyViewed]);

  const handleScalePress = (scaleId: string) => {
    router.push(`/scales/${scaleId}` as any);
  };

  const handleClearHistory = () => {
    clearRecentlyViewed();
  };

  const formatTimeAgo = (index: number) => {
    if (index === 0) return 'Hace poco';
    if (index === 1) return 'Reciente';
    if (index < 5) return 'Hoy';
    return 'Esta semana';
  };

  const renderScaleCard = ({ item, index }: { item: typeof recentScales[0]; index: number }) => (
    <TouchableOpacity
      style={styles.scaleCard}
      onPress={() => handleScalePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <Clock size={14} color={colors.mutedText} />
          <Text style={styles.timeText}>{formatTimeAgo(index)}</Text>
        </View>
        {index === 0 && (
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>Último</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.scaleName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.scaleDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            {item.timeToComplete && (
              <Text style={styles.metaText}>{item.timeToComplete}</Text>
            )}
            {item.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
          <ArrowRight size={18} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      title="Sin historial"
      message="Aún no has visitado ninguna escala. Explora el catálogo para comenzar."
      icon={History}
      actionText="Explorar Escalas"
      onAction={() => router.push('/scales')}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <History size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Historial</Text>
        </View>
        {recentScales.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.headerSubtitle}>
        {recentScales.length === 0
          ? 'No has visitado ninguna escala recientemente'
          : recentScales.length === 1
          ? '1 escala reciente'
          : `${recentScales.length} escalas recientes`}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Historial',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={recentScales}
          renderItem={renderScaleCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={columns}
          key={columns}
          contentContainerStyle={[
            styles.listContent,
            { padding: contentPadding },
          ]}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any, fontMultiplier: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 32,
    },
    header: {
      marginBottom: 24,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 16 * fontMultiplier,
      color: colors.mutedText,
      marginTop: 4,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.errorBackground,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    clearButtonText: {
      fontSize: 14 * fontMultiplier,
      fontWeight: '600',
      color: colors.error,
    },
    scaleCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      margin: 6,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      minWidth: 280,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timeText: {
      fontSize: 12 * fontMultiplier,
      color: colors.mutedText,
      fontWeight: '500',
    },
    recentBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    recentBadgeText: {
      fontSize: 11 * fontMultiplier,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cardContent: {
      flex: 1,
    },
    scaleName: {
      fontSize: 18 * fontMultiplier,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      lineHeight: 24 * fontMultiplier,
    },
    scaleDescription: {
      fontSize: 14 * fontMultiplier,
      color: colors.mutedText,
      marginBottom: 16,
      lineHeight: 20 * fontMultiplier,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    metaText: {
      fontSize: 12 * fontMultiplier,
      color: colors.mutedText,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 11 * fontMultiplier,
      fontWeight: '600',
      color: colors.text,
    },
  });
