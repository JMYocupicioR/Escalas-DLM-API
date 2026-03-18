import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface ThemedScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  safeArea?: boolean;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export const ThemedScreen: React.FC<ThemedScreenProps> = ({
  children,
  style,
  contentStyle,
  safeArea = true,
  edges = ['bottom']
}) => {
  const { colors } = useThemedStyles();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    style
  ];

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={containerStyle} edges={edges}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
