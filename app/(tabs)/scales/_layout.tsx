import { Stack } from 'expo-router';

export default function ScalesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Escalas Médicas',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalles',
        }}
      />
      <Stack.Screen
        name="recent"
        options={{
          title: 'Recientes',
        }}
      />
      <Stack.Screen
        name="funcional"
        options={{
          title: 'Escalas por Función',
        }}
      />
      <Stack.Screen
        name="especialidad"
        options={{
          title: 'Escalas por Especialidad',
        }}
      />
      <Stack.Screen
        name="alfabetico"
        options={{
          title: 'Escalas por Orden Alfabético',
        }}
      />
      <Stack.Screen
        name="segmento"
        options={{
          title: 'Escalas por Segmento Corporal',
        }}
      />
    </Stack>
  );
}