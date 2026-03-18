# Guía de Solución de Problemas

Esta guía contiene soluciones a los errores más comunes al trabajar con el sistema de escalas médicas.

## Tabla de Contenidos
- [Errores al Cargar Escalas](#errores-al-cargar-escalas)
- [Errores de Evaluación](#errores-de-evaluación)
- [Errores de Búsqueda](#errores-de-búsqueda)
- [Errores de TypeScript](#errores-de-typescript)
- [Errores de Visualización](#errores-de-visualización)

---

## Errores al Cargar Escalas

### Error: "scale.questions is not iterable"

**Mensaje completo:**
```
Uncaught Error: scale.questions is not iterable
Call Stack: ScaleEvaluation > components/ScaleEvaluation.tsx
```

**Causa:**
La escala no tiene una propiedad `questions` que sea un array iterable, o la estructura no es compatible con `ScaleEvaluation`.

**Solución 1: Crear función adaptadora** (para escalas estándar)

En `data/_scales.ts`, crear función `build[Nombre]Detailed()`:

```typescript
const buildMiEscalaDetailed = (): ScaleWithDetails => {
  const now = new Date().toISOString();
  const scaleId = 'mi-escala';

  const questions: ScaleQuestion[] = miEscalaQuestions.map((q, index) => ({
    id: `q_${index + 1}`,
    scale_id: scaleId,
    question_id: q.id,
    question_text: q.question,
    description: q.description,
    question_type: 'single_choice',
    order_index: index + 1,
    is_required: true,
    options: q.options.map((opt, idx) => ({
      id: `${q.id}_opt_${idx+1}`,
      question_id: q.id,
      option_value: opt.value,
      option_label: opt.label,
      option_description: opt.description,
      order_index: idx + 1,
      is_default: false,
      created_at: now,
    })),
    created_at: now,
    updated_at: now,
  }));

  // ... resto de la función
};
```

**Solución 2: Crear componente personalizado** (para escalas complejas)

1. Crear `app/(tabs)/scales/mi-escala.tsx`
2. Registrar en `[id].tsx`:

```typescript
if (id === 'mi-escala') {
  return <MiEscalaScreen />;
}
```

---

### Error: "Cannot read properties of undefined (reading 'name')"

**Mensaje completo:**
```
Uncaught Error: Cannot read properties of undefined (reading 'name')
Call Stack: renderResults > app/(tabs)/scales/ogs.tsx
```

**Causa:**
La escala no está registrada correctamente en `scalesById` o no se está retornando correctamente desde `useScaleDetails`.

**Solución:**

Verificar en `data/_scales.ts` al final del archivo:

```typescript
// 1. Construir versión detallada
const miEscalaDetailed = buildMiEscalaDetailed();

// 2. Reemplazar en array de escalas
const existingIndex = scales.findIndex(s => s.id === 'mi-escala');
if (existingIndex !== -1) {
  scales[existingIndex] = { ...scales[existingIndex], ...miEscalaDetailed } as any;
} else {
  scales.push(miEscalaDetailed as any);
}

// 3. ⚠️ CRÍTICO: Registrar en scalesById
scalesById['mi-escala'] = miEscalaDetailed as any;
```

---

### Error: "Scale not found" o pantalla en blanco

**Causa:**
El `id` de la escala no coincide entre diferentes archivos.

**Solución:**

Verificar que el `id` sea consistente en:

1. **data/mi-escala.ts**
```typescript
export const miEscala = {
  id: 'mi-escala',  // ✅ debe ser igual en todos
  // ...
};
```

2. **data/_scales.ts** (entrada en array)
```typescript
{
  id: 'mi-escala',  // ✅ debe ser igual
  // ...
}
```

3. **data/_scales.ts** (función adaptadora)
```typescript
const scaleId = 'mi-escala';  // ✅ debe ser igual
```

4. **app/(tabs)/scales/[id].tsx** (si es personalizada)
```typescript
if (id === 'mi-escala') {  // ✅ debe ser igual
  return <MiEscalaScreen />;
}
```

---

## Errores de Evaluación

### Error: "Cannot calculate score" o puntuación incorrecta

**Causa:**
Valores de opciones no numéricos o `scoring_method` incorrecto.

**Solución:**

Verificar que todos los valores sean números:

```typescript
options: [
  { value: 1, label: 'Opción 1' },  // ✅ value es número
  { value: '1', label: 'Opción 2' },  // ❌ value es string
]
```

En la función adaptadora, convertir explícitamente:

```typescript
option_value: Number(opt.value),  // ✅ Asegurar que sea número
```

---

### Error: "No interpretation found for score"

**Causa:**
El puntaje calculado no cae en ningún rango de interpretación definido.

**Solución:**

Verificar que los rangos cubran todos los puntajes posibles:

```typescript
// ❌ INCORRECTO - hay gap entre 20 y 25
ranges: [
  { min: 0, max: 20, ... },
  { min: 25, max: 30, ... }
]

// ✅ CORRECTO - sin gaps
ranges: [
  { min: 0, max: 20, ... },
  { min: 21, max: 24, ... },
  { min: 25, max: 30, ... }
]
```

También verificar que `max_score` en `scoring` coincida con el máximo posible:

```typescript
scoring: {
  method: 'sum',
  min_score: 0,
  max_score: 30,  // ✅ debe ser el máximo real
}
```

---

## Errores de Búsqueda

### La escala no aparece en búsqueda

**Causa:**
Faltan `searchTerms` o no están optimizados.

**Solución:**

Agregar términos de búsqueda comprehensivos en `data/_scales.ts`:

```typescript
{
  id: 'mi-escala',
  name: 'Mi Escala Médica',
  searchTerms: [
    // Nombre y variaciones
    'mi escala',
    'mi escala medica',

    // Abreviaturas
    'MEM',

    // Sinónimos en español
    'evaluación médica',
    'valoración clínica',

    // Términos en inglés
    'medical scale',
    'clinical assessment',

    // Condiciones que evalúa
    'dolor',
    'movilidad',
    'funcionalidad',

    // Especialidades
    'fisioterapia',
    'rehabilitación',
    'geriatría'
  ],
}
```

---

### La búsqueda encuentra escalas no relacionadas

**Causa:**
Términos de búsqueda demasiado genéricos.

**Solución:**

Usar términos específicos y evitar palabras muy comunes:

```typescript
// ❌ EVITAR términos muy genéricos
searchTerms: ['evaluación', 'paciente', 'clínico', 'test']

// ✅ PREFERIR términos específicos
searchTerms: ['barthel', 'AVD', 'independencia funcional']
```

---

## Errores de TypeScript

### Error: "Property 'authors' does not exist"

**Mensaje:**
```
Type error: Property 'authors' does not exist on type 'ScaleReference'
```

**Causa:**
El tipo `ScaleReference` puede tener `authors` como string o array.

**Solución:**

Usar verificación de tipo:

```typescript
// ❌ INCORRECTO
const authorsText = ref.authors.join(', ');

// ✅ CORRECTO
const authorsText = ref.authors
  ? (Array.isArray(ref.authors) ? ref.authors.join(', ') : ref.authors)
  : '';
```

---

### Error: "Expected 1 arguments, but got 2"

**Causa:**
Pasar argumentos incorrectos a una función.

**Ejemplo común en adaptadores:**

```typescript
// ❌ INCORRECTO - encrypt no acepta 2 argumentos
const encrypted = encrypt(data, key);

// ✅ CORRECTO
const encrypted = encrypt(data);
```

---

### Error: "Type 'X' is not assignable to type 'Y'"

**Causa:**
Incompatibilidad entre tipos simples y tipos detallados.

**Solución:**

Usar type assertion cuando sea necesario:

```typescript
// Cuando se mezclan Scale y ScaleWithDetails
scales[index] = { ...scales[index], ...detailed } as any;
scalesById['id'] = detailed as any;
```

**Nota:** El uso de `as any` es aceptable en el contexto de adaptación de escalas, ya que estamos fusionando tipos compatibles.

---

## Errores de Visualización

### Error: "Cannot read properties of undefined (reading 'color_code')"

**Causa:**
Falta el campo `color_code` en los rangos de interpretación.

**Solución:**

Asegurar que todos los rangos tengan `color_code`:

```typescript
ranges: ScoringRange[] = scoreInterp.map((r, idx) => ({
  id: `r_${idx+1}`,
  // ... otros campos
  color_code: r.color || '#808080',  // ✅ Proveer valor por defecto
}));
```

---

### Las instrucciones no se muestran formateadas

**Causa:**
El componente `ScaleInfo` espera las instrucciones en el campo `instructions`, pero pueden estar en `information`.

**Solución:**

En la función adaptadora:

```typescript
const detailed: ScaleWithDetails = {
  // ...
  instructions: miEscala.information || miEscala.instructions,
  // ...
};
```

---

### Los colores de interpretación no se ven

**Causa:**
El formato de color no es válido o falta el campo.

**Solución:**

Usar colores en formato hexadecimal:

```typescript
// ✅ CORRECTO
color: '#10B981'
color_code: '#EF4444'

// ❌ INCORRECTO
color: 'green'
color: 'rgb(16, 185, 129)'
```

---

## Errores de Referencias

### Error: "authors.join is not a function"

**Causa:**
`authors` puede ser string o array, pero el código asume que siempre es array.

**Solución:**

Ver sección [Property 'authors' does not exist](#error-property-authors-does-not-exist) arriba.

---

### DOI links no funcionan

**Causa:**
DOI incompleto o formato incorrecto.

**Solución:**

```typescript
// ❌ INCORRECTO
doi: 'https://doi.org/10.1234/journal'
doi: 'doi:10.1234/journal'

// ✅ CORRECTO - solo el identificador
doi: '10.1234/journal.2020.123'
```

El sistema automáticamente agrega el prefijo `https://doi.org/` al hacer clic.

---

## Problemas de Performance

### La aplicación se vuelve lenta al agregar muchas escalas

**Solución:**

1. **Lazy loading para escalas personalizadas:**

```typescript
// ❌ EVITAR imports estáticos para todas las escalas
import TinettiScreen from './tinetti';
import BergScreen from './berg';
// ... 50+ imports

// ✅ PREFERIR dynamic imports
if (id === 'tinetti') {
  const TinettiScreen = React.lazy(() => import('./tinetti'));
  return <React.Suspense fallback={<LoadingState />}>
    <TinettiScreen />
  </React.Suspense>;
}
```

2. **Optimizar búsqueda con índices:**

Si hay más de 50 escalas, considerar implementar un índice de búsqueda preconstruido.

---

## Errores en Producción vs Desarrollo

### La escala funciona en desarrollo pero no en producción

**Causa común:**
Paths de importación case-sensitive en producción.

**Solución:**

```typescript
// ❌ PUEDE FALLAR en producción
import { katzScale } from './Katz';  // 'K' mayúscula

// ✅ CORRECTO
import { katzScale } from './katz';  // todo minúscula
```

Mantener consistencia en nombres de archivos (todo minúscula) y paths de importación.

---

## Debugging Tips

### 1. Verificar registro de escala

```typescript
// Agregar al final de _scales.ts para debugging
console.log('Registered scales:', scales.map(s => s.id));
console.log('ScalesById keys:', Object.keys(scalesById));
```

### 2. Verificar estructura de escala

```typescript
// En [id].tsx
useEffect(() => {
  if (scale) {
    console.log('Scale structure:', {
      id: scale.id,
      hasQuestions: !!scale.questions,
      questionsCount: scale.questions?.length,
      hasScoring: !!scale.scoring,
      rangesCount: scale.scoring?.ranges?.length,
    });
  }
}, [scale]);
```

### 3. Verificar respuestas y cálculos

```typescript
// En ScaleEvaluation
console.log('Responses:', responses);
console.log('Calculated score:', totalScore);
console.log('Interpretation:', interpretation);
```

---

## Checklist de Debugging

Cuando algo no funciona, verificar en orden:

1. [ ] ¿El archivo de datos existe y está bien formado?
2. [ ] ¿El id es consistente en todos los archivos?
3. [ ] ¿La escala está importada en `_scales.ts`?
4. [ ] ¿Hay una entrada en el array `scales[]`?
5. [ ] ¿Hay una función `build[Nombre]Detailed()`?
6. [ ] ¿La escala está registrada en `scalesById`?
7. [ ] ¿Los valores de opciones son números?
8. [ ] ¿Los rangos cubren todos los puntajes posibles?
9. [ ] ¿Todos los rangos tienen `color_code`?
10. [ ] ¿Las referencias tienen el formato correcto?

---

## ¿Aún tienes problemas?

1. Revisa [`ARCHITECTURE.md`](./ARCHITECTURE.md) para entender el sistema
2. Compara tu implementación con escalas funcionando (Katz, Berg)
3. Verifica los logs de consola para mensajes de error específicos
4. Usa `console.log()` liberalmente para trazar el flujo de datos