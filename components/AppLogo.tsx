import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon, AppIconSimple } from './AppIcon';
import { useThemedStyles } from '@/hooks/useThemedStyles';

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
  style 
}) => {
  const { colors } = useThemedStyles();

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { iconSize: 32, fontSize: 16, spacing: 8 };
      case 'large':
        return { iconSize: 64, fontSize: 24, spacing: 12 };
      case 'medium':
      default:
        return { iconSize: 48, fontSize: 20, spacing: 10 };
    }
  };

  const { iconSize, fontSize, spacing } = getSizes();
  const IconComponent = variant === 'simple' ? AppIconSimple : AppIcon;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing,
    },
    textContainer: {
      flexDirection: 'column',
    },
    primaryText: {
      fontSize: fontSize,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    secondaryText: {
      fontSize: fontSize * 0.7,
      fontWeight: '500',
      color: colors.mutedText,
      marginTop: -2,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <IconComponent size={iconSize} />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.primaryText}>DeepLuxMed</Text>
          <Text style={styles.secondaryText}>Escalas</Text>
        </View>
      )}
    </View>
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

// Componente para splash screen o pantallas de carga
export const SplashLogo: React.FC = () => {
  const { colors } = useThemedStyles();
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.primary,
      marginTop: 16,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.mutedText,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <AppIcon size={120} />
      <Text style={styles.text}>DeepLuxMed</Text>
      <Text style={styles.subtitle}>Escalas Médicas</Text>
    </View>
  );
};