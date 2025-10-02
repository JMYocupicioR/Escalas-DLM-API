import { Tabs } from 'expo-router/tabs';
import { Search, Chrome as Home, BookMarked as BookMedical, Settings } from 'lucide-react-native';
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
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
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
          title: 'Buscar',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scales"
        options={{
          title: 'Escalas',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <BookMedical size={size} color={color} />,
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
        name="settings"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}