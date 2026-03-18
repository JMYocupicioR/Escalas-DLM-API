# Documentación del Sistema de Escalas Médicas

Bienvenido a la documentación técnica del sistema de escalas médicas de DeepLuxMed.

## 📚 Documentos Disponibles

### Para Desarrolladores

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura del Sistema
   - Visión general y principios de diseño
   - Estructura de directorios y archivos críticos
   - Flujo de datos y renderizado
   - Tipos de escalas (estándar vs personalizada)
   - Sistema de adaptación detallado
   - Componentes clave del sistema

2. **[ADDING_SCALES.md](./ADDING_SCALES.md)** - Guía para Agregar Escalas
   - Guía paso a paso completa
   - Opción A: Escalas estándar (con preguntas)
   - Opción B: Escalas personalizadas (interfaz propia)
   - Ejemplos de código completos
   - Checklist de verificación
   - Mejores prácticas y convenciones

3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de Problemas
   - Errores comunes y sus soluciones
   - Problemas de carga de escalas
   - Errores de evaluación y puntuación
   - Problemas de búsqueda
   - Errores de TypeScript
   - Tips de debugging

---

## 🚀 Inicio Rápido

### Agregar una Escala Simple (5 minutos)

```typescript
// 1. Crear data/mi-escala.ts
export const miEscalaQuestions = [
  {
    id: 'pregunta1',
    question: '¿Puede caminar sin ayuda?',
    options: [
      { value: 1, label: 'Sí', description: 'Independiente' },
      { value: 0, label: 'No', description: 'Necesita asistencia' }
    ]
  }
];

// 2. Registrar en data/_scales.ts
// Ver ADDING_SCALES.md para código completo

// 3. ¡Listo! La escala aparece automáticamente
```

### Estructura Básica del Proyecto

```
/data/              # Definiciones de escalas
  _scales.ts        # ⭐ Registro central
  katz.ts           # Ejemplo de escala simple
  berg.ts           # Ejemplo de escala compleja

/app/(tabs)/scales/ # Pantallas
  [id].tsx          # ⭐ Router dinámico

/components/
  ScaleEvaluation.tsx  # ⭐ Motor de evaluación

/docs/              # Esta documentación
```

---

## 📖 Flujo de Trabajo Recomendado

### Para Agregar una Escala Nueva

1. **Leer:** [ADDING_SCALES.md](./ADDING_SCALES.md) - Guía completa
2. **Revisar:** Ejemplos existentes (Katz, Berg)
3. **Implementar:** Seguir pasos de la guía
4. **Verificar:** Usar checklist al final
5. **Debuggear:** Si hay problemas, ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Para Entender el Sistema

1. **Leer:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura general
2. **Revisar:** Código de `data/_scales.ts` con comentarios
3. **Explorar:** Componentes en `/components`

### Para Resolver Errores

1. **Buscar error en:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Revisar:** Checklist de debugging
3. **Comparar:** Con escalas funcionando correctamente

---

## 🏗️ Arquitectura en 2 Minutos

### Escalas Estándar (Mayoría)
```
data/katz.ts (definición)
    ↓
data/_scales.ts (adaptación automática)
    ↓
components/ScaleEvaluation.tsx (renderizado)
    ↓
Usuario evalúa → Resultados automáticos
```

**Ventajas:**
- Sin código adicional necesario
- Cálculo automático de puntuación
- Interpretación automática
- Búsqueda integrada

**Ejemplos:** Barthel, Katz, Berg, Boston, OGS, HINE

### Escalas Personalizadas (Especiales)
```
data/denver.ts (definición básica)
    ↓
app/(tabs)/scales/denver2.tsx (componente propio)
    ↓
[id].tsx (redirección especial)
    ↓
Interfaz personalizada → Lógica propia
```

**Cuándo usar:**
- Gráficas especializadas
- Interfaces complejas
- Lógica de evaluación no lineal

**Ejemplos:** Denver II, Calculadora Toxina Botulínica

---

## 🔑 Conceptos Clave

### 1. Registro Central (`data/_scales.ts`)
**TODO** se registra aquí. Este archivo es la fuente de verdad.

### 2. Adaptadores (`build[Nombre]Detailed()`)
Convierten definiciones simples → formato ScaleWithDetails para evaluación.

### 3. Router Dinámico (`[id].tsx`)
Decide cómo renderizar cada escala según su ID.

### 4. Motor de Evaluación (`ScaleEvaluation.tsx`)
Componente genérico que renderiza y evalúa escalas estándar.

### 5. Sistema de Búsqueda
Usa `searchTerms` para encontrar escalas por múltiples términos.

---

## ⚠️ Errores Más Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "questions is not iterable" | Escala no adaptada | Crear `build[Nombre]Detailed()` |
| "Cannot read 'name'" | No registrada en `scalesById` | Verificar registro al final de `_scales.ts` |
| No aparece en búsqueda | Faltan `searchTerms` | Agregar términos al entry en `scales[]` |
| Puntuación incorrecta | Valores no numéricos | Usar `Number(opt.value)` en adaptador |

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para lista completa.

---

## 📊 Estadísticas del Sistema

### Escalas Implementadas

- **Funcionales:** Barthel, Katz, FIM, Lequesne, GAS
- **Equilibrio/Marcha:** Berg, Tinetti, OGS
- **Neurológicas:** Boston, Glasgow, House-Brackmann, HINE
- **Dolor:** VAS, Borg
- **Especializadas:** Denver II, Calculadora Toxina Botulínica

### Tipos de Preguntas Soportadas

- `single_choice` - Opción única (mayoría)
- `multiple_choice` - Múltiples opciones
- `numeric` - Valor numérico
- `text` - Texto libre
- `boolean` - Sí/No
- `scale` - Escala deslizante
- `matrix` - Tabla de respuestas

### Métodos de Puntuación

- `sum` - Suma simple (más común)
- `average` - Promedio
- `weighted` - Ponderado
- `complex` - Algoritmo personalizado
- `categorical` - Basado en categorías
- `percentile` - Percentiles

---

## 🤝 Contribuyendo

### Antes de Agregar una Escala

1. ✅ Verificar que no exista ya
2. ✅ Tener referencias científicas
3. ✅ Conocer el sistema de puntuación
4. ✅ Decidir si es estándar o personalizada

### Estándares de Código

- **IDs:** Minúsculas, sin espacios (ej: `katz`, `berg`, `6mwt`)
- **Nombres de archivo:** Igual que ID (ej: `katz.ts`)
- **Funciones:** PascalCase (ej: `buildKatzDetailed()`)
- **Comentarios:** Documentar decisiones importantes

### Testing

Antes de considerar completa una escala:

- [ ] Aparece en búsqueda
- [ ] Se abre sin errores
- [ ] Permite evaluación
- [ ] Calcula puntuación correctamente
- [ ] Muestra interpretación
- [ ] Referencias completas

---

## 📞 Soporte

1. **Documentación:** Lee los docs primero
2. **Ejemplos:** Revisa Katz y Berg (bien documentados)
3. **Debugging:** Usa [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **Código:** Revisa comentarios en archivos críticos

---

## 🔄 Actualización de Documentación

Esta documentación debe actualizarse cuando:

- Se cambia la arquitectura fundamental
- Se agrega un nuevo tipo de escala
- Se descubre un error común no documentado
- Se implementa una nueva funcionalidad

**Última actualización:** 2025-01-30

---

## 📝 Licencia

Este proyecto y su documentación son propiedad de DeepLuxMed.

---

**¿Por dónde empezar?**

→ **Nuevo en el proyecto:** [ARCHITECTURE.md](./ARCHITECTURE.md)
→ **Agregar una escala:** [ADDING_SCALES.md](./ADDING_SCALES.md)
→ **Resolver un error:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)