import { Stack } from 'expo-router/stack';

export default function PatientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="apply-scale" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="assessments/[id]" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
