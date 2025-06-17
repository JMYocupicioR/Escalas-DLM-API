import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Ajustes',
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: 'Idioma',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notificaciones',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'Acerca de',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacidad',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Términos',
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: 'Soporte',
        }}
      />
    </Stack>
  );
}