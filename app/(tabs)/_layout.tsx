import { Platform } from 'react-native';
import { Tabs } from 'expo-router/tabs';
import { Chrome as Home, Settings, Users } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Calculator } from 'lucide-react-native';
import { useGuestMode } from '@/hooks/useGuestMode';

export default function TabLayout() {
  const { colors } = useTheme();
  const { canAccessPatients } = useGuestMode();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          ...Platform.select({
            web: {
              height: 85,
              paddingTop: 8,
              paddingBottom: 10,
              overflow: 'visible' as const,
            },
            default: {
              height: 58,
              paddingTop: 6,
              paddingBottom: 8,
            },
          }),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          lineHeight: 13,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          ...Platform.select({
            web: { overflow: 'visible' as const },
            default: {},
          }),
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
          href: canAccessPatients ? undefined : null,
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