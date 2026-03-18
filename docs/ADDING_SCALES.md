# Guía: Cómo Agregar una Nueva Escala Médica

Esta guía te llevará paso a paso por el proceso de agregar una nueva escala médica al sistema.

## Tabla de Contenidos
- [Antes de Empezar](#antes-de-empezar)
- [Opción A: Escala Estándar](#opción-a-escala-estándar)
- [Opción B: Escala Personalizada](#opción-b-escala-personalizada)
- [Checklist Final](#checklist-final)

---

## Antes de Empezar

### ¿Qué tipo de escala necesitas?

**Escala Estándar** ✅ si:
- Tiene preguntas con opciones de respuesta definidas
- El sistema de puntuación es simple (suma, promedio, ponderado)
- No requiere interfaz visual especializada
- Ejemplos: Barthel, Katz, Berg, Boston

**Escala Personalizada** 🎨 si:
- Requiere gráficas, tablas complejas o visualizaciones especiales
- Tiene lógica de evaluación compleja
- Necesita múltiples pantallas o flujos no lineales
- Ejemplos: Denver II, Calculadora de Toxina Botulínica

---

## Opción A: Escala Estándar

### Paso 1: Crear el Archivo de Datos

Crear archivo: `data/[nombre-escala].ts`

```typescript
// data/tinetti.ts

export interface TinettiQuestion {
  id: string;
  question: string;
  description: string;
  category: string; // Opcional: para agrupar preguntas
  options: Array<{
    value: number;
    label: string;
    description: string;
  }>;
}

export const questions: TinettiQuestion[] = [
  {
    id: 'sitting_balance',
    question: 'Equilibrio Sentado',
    description: 'Evaluar estabilidad en sedestación',
    category: 'Equilibrio',
    options: [
      { value: 0, label: 'Se inclina o desliza en la silla', description: 'Inestable' },
      { value: 1, label: 'Estable, seguro', description: 'Mantiene postura correcta' }
    ]
  },
  // ... más preguntas
];

export const scoreInterpretation = [
  {
    min: 25,
    max: 28,
    level: 'Riesgo Bajo',
    description: 'Bajo riesgo de caídas',
    risk: 'Independiente en movilidad',
    color: '#10B981', // Verde
  },
  {
    min: 19,
    max: 24,
    level: 'Riesgo Moderado',
    description: 'Riesgo moderado de caídas',
    risk: 'Requiere supervisión',
    color: '#FBBF24', // Amarillo
  },
  {
    min: 0,
    max: 18,
    level: 'Riesgo Alto',
    description: 'Alto riesgo de caídas',
    risk: 'Requiere dispositivo de asistencia',
    color: '#EF4444', // Rojo
  },
];

export const tinettiScale = {
  id: 'tinetti',
  name: 'Escala de Tinetti',
  shortName: 'POMA',
  acronym: 'POMA',
  description: 'Evaluación orientada al rendimiento de movilidad en adultos mayores.',
  category: 'Balance',
  specialty: 'Geriatría',
  bodySystem: 'Musculoesquelético',
  timeToComplete: '10-15 min',
  version: '1.0',
  questions,
  scoreInterpretation,
  scoring: {
    method: 'sum', // o 'average', 'weighted', 'complex'
    min: 0,
    max: 28,
    unit: 'puntos',
  },
  tags: ['tinetti', 'POMA', 'equilibrio', 'marcha', 'caídas'],
  imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300',
  information: `
# Escala de Tinetti (POMA)

## Descripción
La Escala de Tinetti, también conocida como Performance-Oriented Mobility Assessment (POMA)...

## Objetivo
Evaluar el riesgo de caídas mediante...

## Instrucciones
1. Observar al paciente...
2. Puntuar cada ítem...

## Interpretación
- 25-28 puntos: Bajo riesgo...
`,
  references: [
    {
      title: 'Performance-oriented assessment of mobility problems in elderly patients',
      authors: ['Tinetti ME'],
      year: 1986,
      doi: '10.1111/j.1532-5415.1986.tb05480.x'
    }
  ],
  lastUpdated: new Date().toISOString(),
};
```

### Paso 2: Registrar en `data/_scales.ts`

#### 2.1 Importar al inicio del archivo

```typescript
import { tinettiScale, questions as tinettiQuestions, scoreInterpretation as tinettiScoreInterp } from './tinetti';
```

#### 2.2 Agregar entrada en el array `scales`

```typescript
export const scales: Scale[] = [
  denver2,
  // ... otras escalas
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    description: 'Evaluación orientada al rendimiento de movilidad',
    timeToComplete: '10-15 min',
    category: 'Balance',
    specialty: 'Geriatría',
    searchTerms: ['tinetti', 'POMA', 'performance oriented mobility', 'equilibrio', 'marcha', 'balance', 'caídas', 'riesgo caída'],
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300',
  },
  // ... más escalas
];
```

#### 2.3 Crear función adaptadora (al final del archivo)

```typescript
// Adapt Tinetti to generic evaluation shape expected by ScaleEvaluation
const buildTinettiDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'tinetti';

  let order = 0;
  const questions: ScaleQuestion[] = tinettiQuestions.map((q) => {
    const questionId = q.id;
    const opts: QuestionOption[] = q.options.map((opt, idx) => ({
      id: `${questionId}_opt_${idx+1}`,
      question_id: questionId,
      option_value: Number(opt.value),
      option_label: String(opt.label),
      option_description: opt.description,
      order_index: idx + 1,
      is_default: false,
      created_at: now,
    }));

    order += 1;
    const dq: ScaleQuestion = {
      id: `q_${order}`,
      scale_id: scaleId,
      question_id: questionId,
      question_text: String(q.question),
      description: q.description,
      question_type: 'single_choice',
      order_index: order,
      is_required: true,
      category: q.category,
      instructions: undefined,
      options: opts,
      created_at: now,
      updated_at: now,
    };
    return dq;
  });

  const ranges: ScoringRange[] = tinettiScoreInterp.map((r, idx) => ({
    id: `r_tinetti_${idx+1}`,
    scoring_id: 'scoring_tinetti',
    min_value: r.min,
    max_value: r.max,
    interpretation_level: r.level,
    interpretation_text: `${r.description} - ${r.risk}`,
    order_index: idx + 1,
    created_at: now,
    color_code: r.color,
    recommendations: undefined,
  }));

  const scoring: ScaleScoring = {
    id: 'scoring_tinetti',
    scale_id: scaleId,
    scoring_method: 'sum',
    min_score: 0,
    max_score: 28,
    ranges,
    created_at: now,
  };

  const detailed: ScaleWithDetails = {
    id: scaleId,
    name: tinettiScale.name,
    acronym: tinettiScale.acronym,
    description: tinettiScale.description,
    category: tinettiScale.category,
    specialty: tinettiScale.specialty,
    body_system: tinettiScale.bodySystem || 'Sistema Musculoesquelético',
    tags: tinettiScale.tags || [],
    time_to_complete: tinettiScale.timeToComplete,
    popularity: 0,
    popular: false,
    image_url: tinettiScale.imageUrl,
    instructions: tinettiScale.information,
    version: tinettiScale.version,
    language: 'es',
    status: 'active',
    created_at: now,
    updated_at: now,
    created_by: undefined,
    validated_by: undefined,
    validation_date: undefined,
    cross_references: [],
    doi: undefined,
    copyright_info: undefined,
    license: 'Public Domain',
    questions,
    scoring,
    references: tinettiScale.references?.map((ref, idx) => ({
      id: `ref_tinetti_${idx+1}`,
      scale_id: scaleId,
      title: ref.title,
      authors: ref.authors,
      year: ref.year,
      journal: ref.journal,
      volume: ref.volume,
      pages: ref.pages,
      doi: ref.doi,
      is_primary: true,
      reference_type: 'validation',
      created_at: now,
    })) || [],
    translations: [],
  };
  return detailed;
};

const tinettiDetailed = buildTinettiDetailed();

const existingTinettiIndex = scales.findIndex(s => s.id === 'tinetti');
if (existingTinettiIndex !== -1) {
  // @ts-ignore add detailed fields for evaluation
  scales[existingTinettiIndex] = { ...(scales[existingTinettiIndex] as any), ...tinettiDetailed } as any;
} else {
  // @ts-ignore add as new
  scales.push(tinettiDetailed as any);
}

// @ts-ignore attach detailed to map
scalesById['tinetti'] = tinettiDetailed as any;
```

### Paso 3: ¡Listo! Probar la Escala

La escala debería aparecer automáticamente en:
- ✅ Pantalla de búsqueda
- ✅ Listados de escalas
- ✅ Puede ser evaluada con ScaleEvaluation

---

## Opción B: Escala Personalizada

Para escalas que requieren interfaces especializadas.

### Paso 1: Crear Componente de Pantalla

Crear archivo: `app/(tabs)/scales/[nombre-escala].tsx`

```typescript
// app/(tabs)/scales/tinetti.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TinettiScreen() {
  const [responses, setResponses] = useState({});

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Escala de Tinetti',
          headerShown: true,
        }}
      />
      <SafeAreaView>
        <ScrollView>
          {/* Tu interfaz personalizada aquí */}
          <Text>Implementación personalizada de Tinetti</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
```

### Paso 2: Registrar en el Router

Editar: `app/(tabs)/scales/[id].tsx`

```typescript
import TinettiScreen from '@/app/(tabs)/scales/tinetti';

export default function ScaleDetailsScreen() {
  // ... código existente

  if (id === 'denver2') {
    return <Denver2Screen />;
  }

  if (id === 'berg') {
    return <BergScaleScreen />;
  }

  // Agregar tu escala personalizada
  if (id === 'tinetti') {
    return <TinettiScreen />;
  }

  // ... resto del código
}
```

### Paso 3: Crear Entrada Básica en `_scales.ts`

```typescript
export const scales: Scale[] = [
  // ... otras escalas
  {
    id: 'tinetti',
    name: 'Escala de Tinetti',
    description: 'Evaluación orientada al rendimiento de movilidad',
    timeToComplete: '10-15 min',
    category: 'Balance',
    specialty: 'Geriatría',
    searchTerms: ['tinetti', 'POMA', 'equilibrio', 'marcha'],
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300',
  },
];
```

---

## Checklist Final

Antes de considerar tu escala completa, verifica:

### Datos de la Escala
- [ ] Archivo en `data/[nombre].ts` creado
- [ ] Interfaz de pregunta definida
- [ ] Array de preguntas completo
- [ ] Sistema de interpretación de puntuación
- [ ] Objeto principal de escala exportado
- [ ] Referencias científicas incluidas

### Registro en Sistema
- [ ] Importada en `data/_scales.ts`
- [ ] Entrada en array `scales[]` con todos los campos
- [ ] `searchTerms` incluye abreviaturas y sinónimos
- [ ] Función `build[Nombre]Detailed()` creada (si es estándar)
- [ ] Escala adaptada y registrada en `scalesById`

### Testing
- [ ] Aparece en búsqueda con su nombre
- [ ] Aparece al buscar por abreviaturas
- [ ] Se puede abrir sin errores
- [ ] Muestra información correctamente
- [ ] Permite realizar evaluación
- [ ] Calcula puntuación correctamente
- [ ] Muestra interpretación con colores correctos

### Documentación
- [ ] Instrucciones de uso incluidas en `information`
- [ ] Referencias científicas completas
- [ ] Descripción clara de la escala

---

## Ejemplos Completos

### Escalas Estándar Implementadas
- ✅ **Katz**: Ejemplo perfecto de escala simple binaria
- ✅ **Berg**: Ejemplo de escala con múltiples opciones por pregunta
- ✅ **Boston**: Ejemplo con subescalas
- ✅ **OGS**: Ejemplo con evaluación bilateral

### Escalas Personalizadas Implementadas
- ✅ **Denver II**: Interfaz gráfica compleja
- ✅ **Calculadora Toxina Botulínica**: Múltiples tablas y cálculos

---

## Consejos y Mejores Prácticas

### 1. Naming Convention
```typescript
// ✅ CORRECTO
id: 'tinetti'
fileName: tinetti.ts
function: buildTinettiDetailed()
constant: tinettiScale

// ❌ INCORRECTO
id: 'Tinetti'  // No usar mayúsculas
id: 'escala-tinetti'  // No usar guiones
```

### 2. Colores para Interpretación
```typescript
// Usar colores consistentes
'#10B981' // Verde - Excelente/Bueno/Bajo riesgo
'#34D399' // Verde claro - Bueno
'#84CC16' // Verde lima - Aceptable
'#FBBF24' // Amarillo - Moderado/Regular
'#F97316' // Naranja - Malo/Alto riesgo
'#EF4444' // Rojo - Severo/Muy alto riesgo
'#DC2626' // Rojo oscuro - Crítico
```

### 3. Estructura de Referencias
```typescript
references: [
  {
    title: 'Título completo del artículo',
    authors: ['Apellido A', 'Apellido B', 'Apellido C'],
    year: 2020,
    journal: 'Nombre de la revista',
    volume: '123',
    issue: '4',
    pages: '100-110',
    doi: '10.1234/journal.2020.123',
    url: 'https://...' // Opcional
  }
]
```

### 4. SearchTerms Efectivos
Incluir:
- Nombre completo de la escala
- Abreviaturas (POMA, AVD, etc.)
- Sinónimos en español
- Términos en inglés comunes
- Condiciones que evalúa
- Especialidades relacionadas

```typescript
searchTerms: [
  'tinetti',
  'POMA',
  'performance oriented mobility',
  'equilibrio',
  'balance',
  'marcha',
  'gait',
  'caídas',
  'falls',
  'riesgo caída',
  'adulto mayor',
  'geriatría'
]
```

---

## Solución de Problemas

Ver [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) para soluciones a errores comunes.

---

## ¿Necesitas Ayuda?

1. Revisa escalas similares ya implementadas
2. Consulta [`ARCHITECTURE.md`](./ARCHITECTURE.md) para entender el sistema
3. Verifica [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) si encuentras errores