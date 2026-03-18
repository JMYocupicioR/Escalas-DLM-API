import React, { PropsWithChildren, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface ResponsiveContainerProps {
  style?: ViewStyle;
  maxWidth?: number;
}

export const ResponsiveContainer: React.FC<PropsWithChildren<ResponsiveContainerProps>> = ({ children, style, maxWidth = 1200 }) => {
  const { width } = useResponsiveLayout();

  const containerStyles = useMemo(() => StyleSheet.create({
    wrapper: {
      width: '100%',
      alignSelf: 'center',
      maxWidth,
      paddingHorizontal: width >= 1440 ? 32 : width >= 1024 ? 24 : 16,
    },
  }), [width, maxWidth]);

  return (
    <View style={[containerStyles.wrapper, style]}>
      {children}
    </View>
  );
};
