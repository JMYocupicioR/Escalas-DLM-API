# Manual de Sistema de Escalas Médicas "ScaleForge"

Este documento detalla el funcionamiento técnico y operativo del sistema de generación, gestión y aplicación de escalas médicas. Está diseñado para desarrolladores, integradores y administradores del sistema.

---

## 1. Introducción

El sistema "ScaleForge" permite la creación dinámica de instrumentos de evaluación médica (escalas, cuestionarios, índices) sin necesidad de escribir código para cada nueva escala. Utiliza un enfoque basado en datos donde la estructura, lógica y puntuación de la escala se definen en un esquema JSON estandarizado.

### Componentes Principales
*   **ScaleBuilder**: Editor visual para crear y editar escalas.
*   **ScaleRunner**: Motor de ejecución que renderiza la escala y procesa las respuestas.
*   **ScaleService**: Capa de servicio para la persistencia y gestión de datos en Supabase.
*   **MedicalScaleSchema**: Definición formal (Zod) de la estructura de datos.

---

## 2. Generación de una Escala (Paso a Paso)

El proceso de creación de una escala se realiza a través del componente `ScaleBuilder`.

### Paso 1: Información General
Al iniciar, se define la metada básica:
*   **Nombre**: Título oficial de la escala (ej. "Escala de Coma de Glasgow").
*   **Acrónimo**: Identificador corto (ej. "GCS").
*   **Descripción**: Resumen del propósito de la escala.
*   **Instrucciones**: Guía para el evaluador.

### Paso 2: Clasificación (Taxonomía)
Se etiqueta la escala para facilitar su búsqueda:
*   **Categorías**: Áreas generales (Neurología, Cardiología).
*   **Especialidades**: Especialidades médicas aplicables.
*   **Sistemas**: Sistema corporal afectado (SNC, Respiratorio).
*   **Población**: Grupo objetivo (Adultos, Pediatría).

### Paso 3: Construcción de Preguntas
El usuario agrega "ítems" o preguntas al "canvas". Tipos soportados:
*   **Opción Única (Radio)**: Selección exclusiva. Cada opción tiene un `score` (valor numérico) y un `label` (texto).
*   **Opción Múltiple (Checkbox)**: Selección múltiple.
*   **Slider**: Rango numérico visual.
*   **Número**: Input numérico directo.
*   **Texto**: Respuesta abierta (cualitativa).
*   **Información**: Bloques de texto o imágenes sin interacción.

**Configuración por Pregunta:**
*   Texto de la pregunta.
*   Opciones de respuesta (con sus puntajes asociados).
*   Validaciones (Requerido, Min/Max).
*   Lógica Condicional (Ocultar/Mostrar según respuestas previas).

### Paso 4: Lógica de Puntuación (Scoring)
Se define cómo se calcula el resultado final.
*   **Motor (Engine)**:
    *   `Sum`: Suma simple de los valores de las respuestas seleccionadas.
    *   `Average`: Promedio de los valores.
    *   `Complex (JSON Logic)`: Para fórmulas avanzadas (pendiente de implementación completa).
*   **Rangos de Interpretación**: Se definen intervalos de puntaje para dar un diagnóstico.
    *   Ejemplo: 0-13 "Depresión Mínima", 14-19 "Depresión Leve", etc.
    *   Cada rango tiene color (semáforo) y nivel de alerta.

### Paso 5: Evidencia Científica
Se añaden referencias bibliográficas (DOI, PubMed) para validar el instrumento.

### Paso 6: Publicación
*   **Borrador**: Guarda el trabajo sin hacerlo público.
*   **Publicar**: Valida la estructura y hace la escala visible para todos los usuarios del sistema. Al publicar, se genera una "Versión" inmutable (v1.0 implicita).

---

## 3. Estructura JSON (El "ADN" de la Escala)

Toda la información de una escala se almacena en un objeto JSON que sigue el `MedicalScaleSchema`.

### Ejemplo Simplificado del JSON

```json
{
  "id": "uuid-1234...",
  "name": "PHQ-9",
  "acronym": "PHQ-9",
  "version": "1.0",
  "status": "active",
  "current_version": {
    "version_number": "1.0",
    "config": {
      "instructions": "Durante las últimas 2 semanas...",
      "estimated_time": 5,
      "language": "es"
    },
    "questions": [
      {
        "id": "q1",
        "type": "single_choice",
        "text": "Poco interés o placer en hacer cosas",
        "order_index": 1,
        "options": [
          { "label": "No, en absoluto", "value": 0, "score": 0 },
          { "label": "Varios días", "value": 1, "score": 1 },
          { "label": "Más de la mitad de los días", "value": 2, "score": 2 },
          { "label": "Casi todos los días", "value": 3, "score": 3 }
        ]
      }
      // ... más preguntas
    ],
    "scoring": {
      "engine": "sum",
      "ranges": [
        { "min": 0, "max": 4, "label": "Ninguna", "color": "#4caf50" },
        { "min": 5, "max": 9, "label": "Leve", "color": "#ffeb3b" },
        { "min": 10, "max": 14, "label": "Moderada", "color": "#ff9800" },
        { "min": 15, "max": 27, "label": "Severa", "color": "#f44336" }
      ]
    }
  }
}
```

### Elementos Clave del Schema (`medical-scale.schema.ts`)
1.  **`ScaleQuestionSchema`**: Define un ítem individual. Es polimórfico según el `type`.
2.  **`ScoringLogicSchema`**: Define el algoritmo de cálculo (`engine`) y los rangos (`ranges`).
3.  **`ScaleVersionSchema`**: Agrupa preguntas, configuración y scoring. Esto permite tener múltiples versiones de una misma escala en el futuro.

---

## 4. El Convertidor de Información

El sistema funciona mediante una transformación constante de datos entre tres formatos:

1.  **Estado del UI (React State)**:
    *   Usado en `ScaleBuilder`.
    *   Optimizado para la edición (formularios, inputs controlados).
    *   Gestiona selecciones temporales, tabs activos y validación en tiempo real.

2.  **Esquema de Base de Datos (Supabase Relacional)**:
    *   Tablas: `medical_scales`, `scale_questions`, `question_options`, `scale_scoring`, `scoring_ranges`.
    *   La información está normalizada para permitir consultas SQL eficientes (ej. "Buscar todas las preguntas que contengan 'dolor'").
    *   **ScaleService.getScaleById**: Realiza la "Hidratación". Consulta todas estas tablas y reconstruye el objeto JSON jerárquico (`MedicalScale`) que necesita el frontend.
    *   **ScaleService.publishScale**: Realiza la "Persistencia". Toma el objeto JSON y lo descompone en inserciones a las múltiples tablas relacionales, manejando transacciones y limpieza de datos antiguos.

3.  **Modelo de Ejecución (Runtime Model)**:
    *   Usado en `ScaleRunner`.
    *   Es el objeto JSON `MedicalScale` hidratado.
    *   El runner no consulta la BD, recibe este objeto listo para usar.

---

## 5. Componentes Clave

### Scale Builder (`components/ScaleBuilder.tsx`)
*   **Responsabilidad**: Crear/Editar el JSON de definición.
*   **Características**:
    *   Drag-and-drop para reordenar preguntas.
    *   Gestión de referencias bibliográficas.
    *   Previsualización en tiempo real.
    *   Validación antes de publicar.

### Scale Runner (`components/ScaleRunner.tsx`)
*   **Responsabilidad**: Aplicar la escala a un paciente.
*   **Funcionamiento**:
    1.  Recibe `scaleData` (el JSON).
    2.  Renderiza dinámicamente los componentes usando `QuestionRenderer` basándose en `question.type`.
    3.  Captura las respuestas en un estado local (`allAnswers`).
    4.  **Cálculo en Tiempo Real**: Un `useMemo` recalcula el puntaje (`currentScore`) cada vez que cambia una respuesta, aplicando la lógica definida en `version.scoring.engine`.
    5.  **Interpretación**: Compara el `currentScore` contra los `scoring.ranges` para determinar el diagnóstico clínico (ej. "Severo").
    6.  **Salida**: Al finalizar, emite un objeto con:
        *   `raw_responses`: Respuestas individuales.
        *   `total_score`: Puntaje final.
        *   `interpretation`: Texto diagnóstico.
        *   `metadata`: Fecha, versión usada.

---

## 6. Uso en Otras Apps (Expediente Clínico)

Para integrar estas escalas en un Expediente Clínico Electrónico (ECE):

1.  **Importar el Runner**:
    ```tsx
    import { ScaleRunner } from 'uex-library/components';
    import { ScaleService } from 'uex-library/services';
    ```

2.  **Cargar la Escala**:
    Usar `ScaleService.getScaleDetails(id)` para obtener el JSON completo.

3.  **Renderizar**:
    ```tsx
    <ScaleRunner 
      scaleData={scaleJson}
      onSubmit={(result) => {
        // Guardar resultado en el historial del paciente
        saveConsultationNote({
          type: 'evaluation',
          scale_name: scaleJson.name,
          score: result.total_score,
          interpretation: result.interpretation,
          data: result // Guardar detalle completo para auditoría
        });
      }}
    />
    ```

4.  **Persistencia de Resultados**:
    Los resultados deben guardarse en una tabla de `assessments` o `evaluaciones` vinculada al `patient_id` y `consultation_id`. El objeto JSON de resultados es ligero y autocontenido.

---

## 7. Manejo de Información y Compartir

### Base de Datos Centralizada
Todas las escalas residen en las tablas `medical_scales` de Supabase. Esto actúa como un repositorio central.

### Permisos y Visibilidad (RLS - Row Level Security)
*   **Lectura (`SELECT`)**: 
    *   Pública para usuarios autenticados. Cualquier doctor puede ver y usar las escalas publicadas (`status = 'active'`).
*   **Escritura (`INSERT/UPDATE`)**:
    *   Autores: Solo pueden editar sus propias escalas mientras están en `draft`.
    *   Admins/Validadores: Pueden cambiar el estado a `active` (Publicar).
    *   **Inmutabilidad**: Una vez que una escala es usada en pacientes, no debería modificarse estructuralmente para no invalidar historiales. El sistema fomenta crear nuevas versiones (v1.1, v2.0) en lugar de editar la activa.

### Compartir con la Comunidad
Al marcar una escala como `active` (Publicada), esta aparece automáticamente en el `ScaleBrowser` (Catalogo) de todos los usuarios de la organización o sistema. No es necesario "enviar" la escala; el acceso es inmediato gracias a las políticas de RLS.

---

## Resumen Técnico

| Capa | Tecnología/Archivo | Función |
| :--- | :--- | :--- |
| **Definición** | `medical-scale.schema.ts` (Zod) | Contrato de datos y validación. |
| **Creación** | `ScaleBuilder.tsx` | UI para generar el JSON. |
| **Datos** | PostgREST / Supabase | Almacenamiento relacional normalizado. |
| **Lógica** | `ScaleService.ts` | ORM manual: JSON <-> SQL. |
| **Ejecución** | `ScaleRunner.tsx` | Motor de renderizado y cálculo. |
