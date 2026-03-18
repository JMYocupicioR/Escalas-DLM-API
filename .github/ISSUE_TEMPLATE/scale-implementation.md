---
name: Nueva Escala Médica
about: Template para implementar una nueva escala médica
title: '[SCALE] Nombre de la Escala'
labels: scale, enhancement
assignees: ''
---

## 📋 Información de la Escala

**Nombre completo:**
**Nombre corto:**
**ID (slug):** `escala-nombre` (lowercase, guiones)

**Categoría:**
- [ ] functional (Funcional y AVD)
- [ ] balance (Equilibrio y marcha)
- [ ] cognitive (Cognitiva y neurológica)
- [ ] pain (Dolor)
- [ ] orthopedic (Ortopédica)
- [ ] geriatric (Geriátrica)
- [ ] pediatric (Pediátrica)
- [ ] cardiorespiratory (Cardiorrespiratoria)
- [ ] psychiatric (Psiquiátrica)
- [ ] oncology (Oncología)
- [ ] nutrition (Nutrición)
- [ ] other (Otra)

**Especialidad médica:**

**Población objetivo:**
- [ ] adult (Adulto)
- [ ] geriatric (Geriátrico >65 años)
- [ ] pediatric (Pediátrico)
- [ ] all_ages (Todas las edades)

---

## 📚 Referencias Científicas

### Publicación Original
- **Autores:**
- **Título:**
- **Journal:**
- **Año:**
- **DOI:**
- **PMID:**
- **URL:**

### Validaciones y Estudios Adicionales
1.
2.
3.

---

## 🎯 Características de la Escala

**Propósito clínico:**


**Indicaciones:**
-
-
-

**Contraindicaciones:**
-
-

**Tiempo de aplicación estimado:** ___ minutos

**Complejidad:**
- [ ] Baja (simple, pocas preguntas)
- [ ] Media (moderada, cálculo estándar)
- [ ] Alta (compleja, algoritmo especial)

**Requiere equipo especial:**
- [ ] No
- [ ] Sí (especificar):

---

## 📝 Estructura de Preguntas

**Número total de preguntas:**

### Lista de Preguntas

#### Pregunta 1
- **Texto:**
- **Tipo:**
  - [ ] single_choice (Opción única)
  - [ ] multiple_choice (Opción múltiple)
  - [ ] numeric_input (Entrada numérica)
  - [ ] text_input (Texto libre)
  - [ ] boolean (Sí/No)
  - [ ] slider (Escala visual)
- **Obligatoria:** [ ] Sí [ ] No
- **Opciones de respuesta:**
  - [ ] Opción A (puntos: ___)
  - [ ] Opción B (puntos: ___)
  - [ ] Opción C (puntos: ___)

#### Pregunta 2
_(Repetir para cada pregunta)_

---

## 🧮 Sistema de Puntuación

**Método de cálculo:**
- [ ] Suma simple de puntos
- [ ] Suma ponderada
- [ ] Promedio
- [ ] Algoritmo personalizado (explicar abajo)

**Rango de puntuación:**
- Mínimo: ___
- Máximo: ___

**Algoritmo (si aplica):**
```
Ejemplo: score = (q1 * 2) + q2 - q3 + subscore_motor
```

### Sub-escalas (si aplica)
**Sub-escala 1:**
- Nombre:
- Preguntas involucradas:
- Método de cálculo:

---

## 📊 Interpretación de Resultados

### Rangos de Interpretación

| Rango de Puntos | Categoría | Interpretación Clínica |
|-----------------|-----------|------------------------|
| 0-10 | Severo | Descripción detallada |
| 11-20 | Moderado | Descripción detallada |
| 21-30 | Leve | Descripción detallada |
| 31+ | Normal | Descripción detallada |

---

## 📄 Template de Exportación

**Secciones especiales requeridas en el PDF:**
- [ ] Gráfico de resultados
- [ ] Comparación con evaluación previa
- [ ] Análisis por sub-escalas
- [ ] Recomendaciones basadas en puntuación
- [ ] Tabla de referencia normativa

**Notas sobre el formato:**


---

## ✅ Checklist de Implementación

### Fase 1: Investigación y Validación
- [ ] Revisión de publicación original
- [ ] Verificación de todas las preguntas
- [ ] Confirmación de sistema de puntuación
- [ ] Validación de rangos de interpretación
- [ ] Recopilación de referencias adicionales

### Fase 2: Entrada de Datos
- [ ] Insertar registro en `medical_scales`
- [ ] Insertar preguntas en `scale_questions`
- [ ] Insertar opciones en `question_options`
- [ ] Insertar reglas de puntuación en `scale_scoring_rules` (si aplica)
- [ ] Insertar referencias en `scale_references`

### Fase 3: Backend
- [ ] Verificar API devuelve escala correctamente
- [ ] Probar endpoint con includeQuestions=true
- [ ] Implementar lógica de scoring personalizada (si aplica)
- [ ] Crear función de interpretación de resultados

### Fase 4: Testing
- [ ] Crear 3-5 casos de prueba con respuestas conocidas
- [ ] Verificar cálculo de puntuación
- [ ] Verificar interpretación correcta
- [ ] Test de validación de respuestas
- [ ] Test de edge cases (respuestas faltantes, etc.)

### Fase 5: Exportación
- [ ] Crear template PDF personalizado
- [ ] Probar exportación con datos de prueba
- [ ] Verificar formato e inclusión de todas las secciones
- [ ] Test de impresión (legibilidad)

### Fase 6: Documentación
- [ ] Agregar a catálogo de escalas (README)
- [ ] Documentar uso clínico
- [ ] Agregar notas de implementación
- [ ] Actualizar CHANGELOG

### Fase 7: Revisión Final
- [ ] Code review por otro desarrollador
- [ ] Revisión clínica por médico especialista
- [ ] QA testing completo
- [ ] Aprobar para producción

---

## 🧪 Casos de Prueba

### Caso 1: Puntuación Mínima
**Respuestas:**
- Q1: ___
- Q2: ___
- Q3: ___

**Puntuación esperada:** ___
**Interpretación esperada:** ___

### Caso 2: Puntuación Máxima
**Respuestas:**
- Q1: ___
- Q2: ___
- Q3: ___

**Puntuación esperada:** ___
**Interpretación esperada:** ___

### Caso 3: Caso Clínico Real
**Respuestas:**
- Q1: ___
- Q2: ___
- Q3: ___

**Puntuación esperada:** ___
**Interpretación esperada:** ___

---

## 📎 Archivos Adjuntos

**Adjuntar:**
- [ ] PDF de la publicación original
- [ ] Versión impresa de la escala (si existe)
- [ ] Imágenes o diagramas necesarios
- [ ] Tablas de referencia normativa

---

## 🔍 Consideraciones Especiales

**Notas adicionales sobre la implementación:**
-
-
-

**Desafíos técnicos anticipados:**
-
-

**Dependencias:**
-
-

---

## 👥 Asignación

- **Desarrollador:** @username
- **Revisor clínico:** @username
- **QA:** @username

**Estimación de esfuerzo:** ___ horas

**Sprint objetivo:** Sprint #___

**Prioridad:**
- [ ] 🔴 Alta (urgente, escala muy solicitada)
- [ ] 🟡 Media (importante, planificada)
- [ ] 🟢 Baja (nice to have)

---

## 📅 Timeline

- [ ] Fecha inicio: YYYY-MM-DD
- [ ] Fecha estimada de completado: YYYY-MM-DD
- [ ] Fecha real de completado: YYYY-MM-DD

---

## ✨ Definición de "Done"

Una escala se considera completa cuando:

1. ✅ Todos los datos están en la base de datos
2. ✅ El cálculo de puntuación es correcto (validado con casos de prueba)
3. ✅ La interpretación de resultados es precisa
4. ✅ El template de exportación funciona correctamente
5. ✅ Todos los tests pasan (unit + integration)
6. ✅ La documentación está completa
7. ✅ Ha pasado revisión clínica por un médico
8. ✅ Ha pasado code review
9. ✅ Está desplegada en staging y probada
10. ✅ Aprobada para producción

---

_Issue creado usando el template de Nueva Escala Médica v1.0_
