import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { AppIcon, AppIconSimple } from './AppIcon';
import { useThemedStyles } from '@/hooks/useThemedStyles';

/**
 * AppLogo — Componente de marca de Escalas DLM
 *
 * Jerarquía visual:
 *   DeepLux.org  →  MED  →  Escalas DLM
 */

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'simple';
  style?: any;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'medium',
  showText = true,
  variant = 'default',
  style,
}) => {
  const { colors } = useThemedStyles();

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { iconSize: 32, brandSize: 13, subBrandSize: 9, productSize: 14, spacing: 8 };
      case 'large':
        return { iconSize: 64, brandSize: 18, subBrandSize: 11, productSize: 20, spacing: 12 };
      case 'medium':
      default:
        return { iconSize: 48, brandSize: 15, subBrandSize: 10, productSize: 17, spacing: 10 };
    }
  };

  const { iconSize, brandSize, subBrandSize, productSize, spacing } = getSizes();
  const IconComponent = variant === 'simple' ? AppIconSimple : AppIcon;

  const handlePress = () => {
    Linking.openURL('https://deeplux.org');
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing,
    },
    textContainer: {
      flexDirection: 'column',
      gap: 1,
    },
    // Fila 1: DeepLux.org
    brandRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 0,
    },
    brandText: {
      fontSize: brandSize,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    orgText: {
      fontSize: brandSize - 2,
      fontWeight: '600',
      color: '#0ea5e9',
      letterSpacing: 0,
    },
    // Fila 2: MED badge
    medBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(14,165,233,0.12)',
      borderRadius: 3,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    medText: {
      fontSize: subBrandSize,
      fontWeight: '800',
      color: '#0ea5e9',
      letterSpacing: 1.5,
    },
    // Fila 3: Escalas DLM (producto)
    productRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    productText: {
      fontSize: productSize,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.3,
    },
    dlmBadge: {
      fontSize: subBrandSize + 1,
      fontWeight: '800',
      color: '#0ea5e9',
      letterSpacing: 1,
    },
  });

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]}>
      <IconComponent size={iconSize} />
      {showText && (
        <View style={styles.textContainer}>
          {/* DeepLux.org */}
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>DeepLux</Text>
            <Text style={styles.orgText}>.org</Text>
          </View>
          {/* MED */}
          <View style={styles.medBadge}>
            <Text style={styles.medText}>MED</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

// Componente específico para headers
export const HeaderLogo: React.FC<{ size?: 'small' | 'medium' }> = ({ size = 'medium' }) => {
  return (
    <AppLogo
      size={size}
      showText={true}
      variant="simple"
      style={{ marginVertical: 8 }}
    />
  );
};

// Componente para splash screen, login y registro
export const SplashLogo: React.FC = () => {
  const { colors } = useThemedStyles();
  const handlePress = () => Linking.openURL('https://deeplux.org');

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    brand: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
    },
    org: {
      fontSize: 22,
      fontWeight: '600',
      color: '#0ea5e9',
    },
    medRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    divider: {
      height: 1,
      width: 24,
      backgroundColor: 'rgba(14,165,233,0.4)',
    },
    med: {
      fontSize: 11,
      fontWeight: '900',
      color: '#0ea5e9',
      letterSpacing: 3,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
      marginTop: 4,
    },
    product: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    dlm: {
      fontSize: 13,
      fontWeight: '900',
      color: '#0ea5e9',
      letterSpacing: 2,
      backgroundColor: 'rgba(14,165,233,0.12)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <AppIcon size={96} />
      {/* DeepLux.org */}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>DeepLux</Text>
        <Text style={styles.org}>.org</Text>
      </View>
      {/* MED */}
      <View style={styles.medRow}>
        <View style={styles.divider} />
        <Text style={styles.med}>MED</Text>
        <View style={styles.divider} />
      </View>
      {/* Escalas DLM */}
      <View style={styles.productRow}>
        <Text style={styles.product}>Escalas</Text>
        <Text style={styles.dlm}>DLM</Text>
      </View>
    </Pressable>
  );
};