import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, onClear, onFocus }: SearchBarProps) {
  const router = useRouter();
  const { colors } = useThemedStyles();
  return (
    <View style={[styles.container]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.searchBackground, shadowColor: colors.shadowColor }] }>
        <Search size={20} color={colors.iconMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder || "Search medical scales..."}
          placeholderTextColor={colors.placeholderText}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
        {value ? (
           <Pressable onPress={onClear}>
             <Search size={16} color={colors.iconMuted} style={{ transform: [{ rotate: '45deg' }] }} />
           </Pressable>
        ) : null}
      </View>
      <Pressable style={[styles.filterButton, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]} onPress={() => router.push('/search?filter=true')}>
        <SlidersHorizontal size={20} color={colors.iconMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});