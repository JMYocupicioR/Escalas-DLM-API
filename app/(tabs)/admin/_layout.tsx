import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Panel de Administración',
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      />
    </Stack>
  );
}