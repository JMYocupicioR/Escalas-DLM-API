import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useFavoritesStore } from '@/store/favoritesStore';
import { scalesById } from '@/data/_scales';
import { Heart, ArrowRight, Clock, Star, Trash2 } from 'lucide-react-native';
import EmptyState from '@/components/errors/EmptyState';

export default function FavoritesScreen() {
  const { colors, fontSizeMultiplier } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors, fontSizeMultiplier), [colors, fontSizeMultiplier]);
  const { columns, contentPadding } = useResponsiveLayout();
  const router = useRouter();

  const { favorites, removeFavorite } = useFavoritesStore();

  const favoriteScales = useMemo(() => {
    return favorites
      .map(id => scalesById[id])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  const handleScalePress = (scaleId: string) => {
    router.push(`/scales/${scaleId}` as any);
  };

  const handleRemoveFavorite = (scaleId: string, e: any) => {
    e.stopPropagation();
    removeFavorite(scaleId);
  };

  const renderScaleCard = ({ item }: { item: typeof favoriteScales[0] }) => (
    <TouchableOpacity
      style={styles.scaleCard}
      onPress={() => handleScalePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Heart size={20} color={colors.error} fill={colors.error} />
        </View>
        <TouchableOpacity
          onPress={(e) => handleRemoveFavorite(item.id, e)}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color={colors.mutedText} />
        </TouchableOpacity>
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
              <View style={styles.metaItem}>
                <Clock size={14} color={colors.mutedText} />
                <Text style={styles.metaText}>{item.timeToComplete}</Text>
              </View>
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
      title="No tienes favoritos"
      message="Agrega escalas a favoritos presionando el ícono de corazón en cualquier escala."
      icon={Heart}
      actionText="Explorar Escalas"
      onAction={() => router.push('/scales')}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Heart size={24} color={colors.error} fill={colors.error} />
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
        </View>
        <View style={styles.countBadge}>
          <Star size={14} color={colors.primary} fill={colors.primary} />
          <Text style={styles.countText}>{favoriteScales.length}</Text>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>
        {favoriteScales.length === 0
          ? 'Aún no has agregado escalas favoritas'
          : favoriteScales.length === 1
          ? '1 escala guardada'
          : `${favoriteScales.length} escalas guardadas`}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Favoritos',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={favoriteScales}
          renderItem={renderScaleCard}
          keyExtractor={(item) => item.id}
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
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    countText: {
      fontSize: 14 * fontMultiplier,
      fontWeight: '700',
      color: colors.text,
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
    cardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.error}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
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
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
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
