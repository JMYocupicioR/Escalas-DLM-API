import { Stack } from 'expo-router/stack';

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
      <Stack.Screen
        name="plexo-braquial"
        options={{
          title: 'Diagnóstico Plexo Braquial',
        }}
      />
      <Stack.Screen
        name="plexus-educativo"
        options={{
          title: 'Plexo Braquial Interactivo',
        }}
      />
    </Stack>
  );
}


