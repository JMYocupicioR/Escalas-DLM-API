import { Stack } from 'expo-router';

export default function CalculatorsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Calculadoras',
        }}
      />
      <Stack.Screen
        name="botulinum"
        options={{
          title: 'Toxina Botulínica',
        }}
      />
    </Stack>
  );
}


