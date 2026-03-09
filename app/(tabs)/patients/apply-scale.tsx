import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { scales } from '@/data/_scales';
import { HeaderLogo } from '@/components/AppLogo';
import { ChevronLeft, ClipboardList } from 'lucide-react-native';

export default function ApplyScaleScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { colors } = useThemedStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        backBtn: { marginRight: 12 },
        list: { flex: 1, padding: 16 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        rowText: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.text },
        rowDesc: { fontSize: 13, color: colors.mutedText, marginTop: 4 },
      }),
    [colors]
  );

  const handleBack = () => router.back();
  const handleSelectScale = (scaleId: string) => {
    const params = patientId ? `?patientId=${patientId}` : '';
    router.replace(`/scales/${scaleId}${params}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Elegir escala' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <HeaderLogo size="small" />
        </View>
        <FlatList
          style={styles.list}
          data={scales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleSelectScale(item.id)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
              </View>
              <ClipboardList size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </>
  );
}
