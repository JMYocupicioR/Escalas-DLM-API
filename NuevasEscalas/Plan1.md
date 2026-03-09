# Master Plan: Sistema Robusto de Escalas Médicas "ScaleForge"

Este documento define la arquitectura técnica y funcional para un sistema de gestión de escalas médicas de "Clase Mundial", diseñado para manejar alto volumen de datos, operar offline y garantizar la integridad clínica.

---

## 1. Visión y Principios Core

Para superar a las soluciones existentes, el sistema se basa en tres pilares:
1.  **Integridad Clínica Absoluta:** Versionado inmutable. Una evaluación realizada hoy debe ser reproducible en 10 años, exactamente como fue concebida.
2.  **Escalabilidad Masiva:** Arquitectura preparada para millones de evaluaciones y miles de escalas concurrentes.
3.  **Experiencia "Invisible":** El médico no "configura JSONs", interactúa con herramientas visuales fluidas. La complejidad técnica está oculta.

---

## 2. Arquitectura de Datos (Híbrida & Robusta)

Utilizaremos **PostgreSQL (Supabase)** como fuente de verdad, combinando estructura relacional para consultas rápidas y JSONB para flexibilidad en esquemas de preguntas.

### Esquema de Entidades Core (`types.ts` & Zod Schema)

La estructura se rige por el estándar **FHIR Questionnaire** simplificado para asegurar interoperabilidad futura.

-   **Scale (Cabecera):** Metadatos globales (Nombre, Categoría, Tags).
-   **ScaleVersion (Inmutable):** Contiene la configuración específica, preguntas y lógica. Una vez publicada, **se bloquea**.
-   **ScaleAssessment (Log):** Registro histórico de la evaluación. Apunta a una `ScaleVersion` específica.
-   **ScaleLogic:** Reglas de ramificación y puntuación complejas (separadas de la presentación).

### Estrategia de Versionado (The "Lock" Mechanism)
> [!IMPORTANT]
> **Regla de Oro:** Nunca se edita una versión publicada.
> Si se detecta un error en la v1.0, se crea la v1.1. Las evaluaciones antiguas siguen apuntando a la v1.0 preservando la integridad histórica.

---

## 3. Estrategia de Alto Rendimiento (High Volume Handling)

Para manejar "mucha información" y tráfico intenso, implementaremos capas de optimización:

### A. Optimización de Base de Datos
1.  **Particionamiento de Tablas:** La tabla `ScaleAssessment` crecerá indefinidamente. La particionaremos por rango de fechas (ej: `assessments_2024`, `assessments_2025`) para mantener los índices ligeros y las consultas rápidas.
2.  **Índices GIN en JSONB:** Para permitir búsquedas rápidas dentro de las respuestas JSON (ej: "Buscar pacientes que respondieron 'Sí' a la pregunta de 'Diabetes' en cualquier escala").
3.  **Read/Write Splitting:**
    -   **Lecturas (Scale Definitions):** Altamente cacheadas.
    -   **Escrituras (Assessments):** Optimizadas para inserción rápida.

### B. Caching Inteligente (SWR)
Usaremos **React Query** o **SWR** en el frontend con una estrategia *Stale-While-Revalidate*.
-   Las definiciones de escalas (`ScaleVersion`) se cachean agresivamente en el cliente (TTL largo) ya que son inmutables.
-   Esto reduce la carga en Supabase en un 90% durante el uso diario.

### C. Motor de Búsqueda (Search Engine)
El `LIKE %query%` de SQL no escala. Implementaremos:
-   **Búsqueda de Texto Completo (FTS):** Usando `pg_search` en Postgres para nombres de escalas y preguntas.
-   **Tags & Categorías:** Sistema de clasificación facetada para filtrado instantáneo (ej: "Neurología" + "Geriatría").

---

## 4. Robustez y Offline-First

El hospital no siempre tiene internet. El sistema debe funcionar sin conexión.

### Sincronización (Sync Engine)
Implementaremos **RxDB** o **WatermelonDB** en el cliente (Frontend).
1.  **Descarga:** Al iniciar, la app descarga las escalas más usadas al dispositivo local.
2.  **Operación:** El médico realiza evaluaciones guardando en la DB local (IndexedDB/SQLite).
3.  **Sincronización:** Cuando vuelve la conexión, el sistema sube los `Assessments` a Supabase en segundo plano (`Background Sync`).

---

## 5. Inteligencia Artificial y Automatización

### A. Pipeline de Digitalización (AI Ingestion)
Para poblar la base de datos rápidamente:
1.  **Input:** PDF o Foto de una escala física.
2.  **Proceso:** Claude 3.5 Sonnet / GPT-4o analiza la imagen.
3.  **Output:** Genera el JSON compatible con nuestro esquema Zod (`ScaleVersionSchema`).
4.  **Validación:** El médico revisa el borrador generado en el "Builder" y publica.

### B. Asistente de Puntuación (Clinical Copilot)
-   **Sugerencias:** Si el sistema tiene historial del paciente, puede pre-llenar datos (ej: Edad, Sexo, Diagnósticos previos) en la escala.
-   **Análisis:** Al finalizar, una AI ligera analiza el puntaje y sugiere "Next Steps" o escalas complementarias basadas en guías clínicas (RAG sobre Guidelines).

---

## 6. Módulos del Sistema

### A. The "Builder" (No-Code Editor)
-   Interfaz Drag & Drop (dnd-kit).
-   **Live Preview:** Panel dividido para ver la escala real mientras se edita.
-   **Logic Builder:** Editor visual para reglas "Si -> Entonces" (sin escribir código).

### B. The "Runner" (Motor de Ejecución)
-   Componente React recursivo optimizado con `React.memo`.
-   Soporta lógica condicional compleja (`json-logic`).
-   Renderiza UI nativa (móvil) o Web según el entorno.

### C. Analytics Dashboard
-   **Evolución Normalizada:** Gráficas que muestran el % de mejora independientemente de si la versión de la escala cambió (0-100%).
-   **Alertas:** Notificación si un paciente cruza un umbral de riesgo (ej: Deterioro cognitivo rápido).

---

## 7. Seguridad y Compliance

1.  **Row Level Security (RLS):** Policies estrictas en Supabase.
    -   `SELECT` scales: Público/Autenticado.
    -   `SELECT` assessments: Solo el médico creador o el equipo asignado al paciente.
2.  **Audit Logs:** Tabla inmutable `audit_logs` que registra quién vio qué evaluación y cuándo.
3.  **Encriptación:** Datos sensibles (Identificadores de paciente) encriptados en reposo.

---

## 8. Hoja de Ruta (Roadmap) Actualizada

| Fase | Foco | Entregable Clave |
| :--- | :--- | :--- |
| **1. Core & Data** | Estructura | Esquema SQL final, Zod Schema, migraciones de particionamiento. |
| **2. Engine** | Ejecución | `ScaleRunner` capaz de renderizar JSONs complejos y ejecutar lógica. |
| **3. Offline** | Robustez | Integración de RxDB/WatermelonDB para modo sin conexión. |
| **4. AI Ingestion** | Contenido | Script/API para convertir PDFs a JSON de escalas. |
| **5. Builder** | UX | Editor visual Drag & Drop. |
| **6. Analytics** | Valor | Dashboards de evolución de pacientes. |

Este plan maestro asegura que "ScaleForge" no sea solo un repositorio de preguntas, sino un **Dispositivo Médico de Software (SaMD)** robusto, escalable y preparado para el futuro.
