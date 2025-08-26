import { Tabs } from 'expo-router';
import { Search, Chrome as Home, BookMarked as BookMedical, Settings, Shield } from 'lucide-react-native';
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
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scales"
        options={{
          title: 'Scales',
          tabBarIcon: ({ size, color }) => <BookMedical size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calculators"
        options={{
          title: 'Calculators',
          tabBarIcon: ({ size, color }) => <Calculator size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
      {__DEV__ && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => <Shield size={size} color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}