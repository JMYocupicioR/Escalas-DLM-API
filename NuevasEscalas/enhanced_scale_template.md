# Plantilla JSON para Escalas Médicas (ScaleForge)

Esta plantilla está diseñada para ser utilizada como referencia para generar escalas médicas compatibles con el importador de ScaleForge. 

> **Nota para LLMs:** Al generar JSON basado en esta plantilla, asegúrate de **eliminar los comentarios** (líneas que empiezan con `//`) para asegurar que el JSON sea válido, a menos que el parser soporte JSONC.

```jsonc
{
  // --- Metadatos Generales de la Escala ---
  "name": "Nombre Completo de la Escala", // Requerido. Mínimo 3 caracteres.
  "acronym": "SIGLAS", // Opcional. Ej: "MOCA", "GCS".
  "description": "Descripción detallada del propósito y utilidad clínica de la escala.",
  "categories": [
    "Neurología", 
    "Geriatría"
  ], // Requerido. Al menos una categoría.

  // --- Configuración de la Versión Actual ---
  "current_version": {
    "version_number": "1.0", // Requerido. Formato "X.Y" (ej: 1.0, 2.1).
    "status": "draft", // Opciones: "draft" (borrador), "published" (publicada), "deprecated" (obsoleta). Usar "draft" para importar.

    // --- Configuración Específica ---
    "config": {
      "language": "es", // Código ISO 639-1 (ej: "es", "en"). Defecto: "es".
      "original_author": "Nombre del autor original de la escala",
      "estimated_time": 10, // Tiempo estimado en minutos.
      "instructions": "Instrucciones claras para el evaluador sobre cómo administrar la prueba.",
      "validation_info": "Información sobre la validación de la escala (ej: 'Validada en población hispana 2020').",
      "tags": ["Cognición", "Tamizaje", "Hospitalario"], // Etiquetas para búsqueda.
      
      // Bibliografía y Referencias
      "bibliography": [
        {
          "title": "Título del artículo original",
          "authors": ["Autor A", "Autor B"],
          "year": 2023,
          "reference_type": "original", // Opciones: "original", "validation", "review".
          "url": "https://doi.org/10.xxxx",
          "is_primary": true
        }
      ]
    },

    // --- Preguntas (Items) ---
    // Tipos soportados: 
    // - "single_choice": Selección única (radio buttons)
    // - "multi_choice": Selección múltiple (checkboxes)
    // - "slider": Deslizador numérico visual
    // - "number": Entrada numérica directa
    // - "text": Texto libre
    // - "date": Selector de fecha
    // - "info": Solo texto informativo (sin respuesta)
    "questions": [
      // Ejemplo 1: Pregunta de Selección Única con Puntuación
      {
        "id": "q1_orientacion", // ID único interno (usado para lógica).
        "type": "single_choice",
        "order_index": 1, // Orden de aparición.
        "text": "¿En qué año estamos?",
        "description": "Pregunte al paciente la fecha actual.", // Opcional.
        "options": [
          { 
            "label": "Incorrecto", 
            "value": 0, // Valor semántico
            "score": 0, // Puntos que suma
            "order_index": 0 
          },
          { 
            "label": "Correcto", 
            "value": 1, 
            "score": 1, 
            "order_index": 1 
          }
        ],
        "validation": { "required": true }
      },

      // Ejemplo 2: Pregunta Numérica con Validación
      {
        "id": "q2_edad",
        "type": "number",
        "order_index": 2,
        "text": "Edad del paciente",
        "validation": {
          "required": true,
          "min": 18,
          "max": 120
        }
      },

      // Ejemplo 3: Pregunta Condicional (Lógica de Ramificación)
      // Solo aparece si la pregunta "q1_orientacion" tuvo respuesta "Correcto" (valor 1)
      {
        "id": "q3_detalle",
        "type": "text",
        "order_index": 3,
        "text": "Describa el detalle...",
        "logic": [
          {
            "action": "SHOW", // Opciones: "SHOW", "HIDE", "JUMP_TO"
            "target_question_id": "q3_detalle", // A quién afecta (a sí misma en SHOW/HIDE)
            "condition": { "==": [{ "var": "q1_orientacion" }, 1] } // Sintaxis JsonLogic
          }
        ]
      }
    ],

    // --- Motor de Puntuación e Interpretación ---
    "scoring": {
      "engine": "sum", // Opciones: "sum", "average", "json-logic".
      
      // OPCIONAL: Dominios Múltiples (Sub-escalas)
      // Usar esto si la escala tiene resultados independientes por sección (ej: Boston: Severidad vs Funcionalidad).
      // Si se define "domains", el motor calculará cada uno por separado.
      "domains": [
        {
          "id": "sub_escala_1",
          "label": "Sub-escala Cognitiva",
          "question_ids": ["q1_orientacion", "q2_edad"], // IDs explicítos de preguntas a incluir
          "engine": "sum",
          "ranges": [
             { "min": 0, "max": 5, "label": "Normal", "interpretation": "Sin fallo.", "color": "#22c55e" }
          ]
        }
      ],

      // Rangos de interpretación Globales (basados en puntaje total de TODAS las preguntas, si aplica)
      "ranges": [
        {
          "min": 0,
          "max": 10,
          "label": "Deterioro Severo",
          "interpretation": "El paciente presenta un deterioro cognitivo severo. Se sugiere derivación.",
          "color": "#dc2626", // Rojo (Hex code)
          "alert_level": "critical" // Opciones: "none", "low", "medium", "high", "critical"
        },
        {
          "min": 11,
          "max": 30,
          "label": "Normal",
          "interpretation": "Función cognitiva dentro de límites normales.",
          "color": "#22c55e", // Verde
          "alert_level": "none"
        }
      ]
    }
  }
}
```
