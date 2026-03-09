import { Tabs } from 'expo-router/tabs';
import { Chrome as Home, Settings, Users } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Calculator } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="scales"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: 'Calculadoras',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Calculator size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-scales/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="new-scales/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}