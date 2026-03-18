/**
 * @file data/norton.ts
 * @description Escala de Norton para valoración del riesgo de úlceras por presión
 */

export const nortonScale = {
  id: 'norton',
  name: 'Escala de Norton',
  shortName: 'Norton',
  description: 'Valoración del riesgo de desarrollar úlceras por presión (UPP)',
  category: 'Risk',
  specialty: 'Enfermería',
  timeToComplete: '5 min',
  information: `
La Escala de Norton es una herramienta para valorar el riesgo de desarrollar úlceras por presión (UPP) en pacientes hospitalizados o en cuidados de larga duración.

**Parámetros Evaluados:**
1. **Condición Física**
2. **Estado Mental**
3. **Actividad**
4. **Movilidad**
5. **Incontinencia**

**Puntuación Total: 5-20 puntos**

**Interpretación del Riesgo:**
- **≤ 5:** Riesgo muy alto
- **6-9:** Riesgo alto
- **10-12:** Riesgo evidente
- **13-14:** Riesgo medio
- **≥ 15:** Riesgo mínimo/sin riesgo

**Utilidad Clínica:**
- Identificación temprana de pacientes en riesgo
- Planificación de medidas preventivas
- Evaluación periódica del riesgo
- Protocolos de prevención de UPP

**Medidas Preventivas según Riesgo:**
- Cambios posturales frecuentes
- Superficies especiales de apoyo
- Cuidados de la piel
- Nutrición adecuada
- Control de la humedad
  `.trim(),
};

export const nortonQuestions = [
  {
    id: 'norton_physical',
    question: 'Condición Física',
    category: 'Condición Física',
    description: 'Estado general del paciente',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Buena', description: 'Estado general bueno' },
      { value: 3, label: 'Regular', description: 'Estado regular' },
      { value: 2, label: 'Mala', description: 'Estado pobre' },
      { value: 1, label: 'Muy mala', description: 'Estado muy deteriorado' },
    ],
  },
  {
    id: 'norton_mental',
    question: 'Estado Mental',
    category: 'Estado Mental',
    description: 'Nivel de consciencia y orientación',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Alerta', description: 'Consciente y orientado' },
      { value: 3, label: 'Apático', description: 'Indiferente, poco interesado' },
      { value: 2, label: 'Confuso', description: 'Desorientado ocasionalmente' },
      { value: 1, label: 'Estuporoso/comatoso', description: 'Inconsciente o semiconsciente' },
    ],
  },
  {
    id: 'norton_activity',
    question: 'Actividad',
    category: 'Actividad',
    description: 'Capacidad de movimiento y actividad física',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Camina', description: 'Deambula sin ayuda' },
      { value: 3, label: 'Camina con ayuda', description: 'Requiere asistencia para caminar' },
      { value: 2, label: 'Sentado', description: 'Permanece en silla/sillón' },
      { value: 1, label: 'Encamado', description: 'Confinado a la cama' },
    ],
  },
  {
    id: 'norton_mobility',
    question: 'Movilidad',
    category: 'Movilidad',
    description: 'Capacidad para cambiar de posición',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Plena', description: 'Se mueve libremente' },
      { value: 3, label: 'Limitada', description: 'Movimientos limitados' },
      { value: 2, label: 'Muy limitada', description: 'Movilidad muy reducida' },
      { value: 1, label: 'Inmóvil', description: 'Sin capacidad de movimiento' },
    ],
  },
  {
    id: 'norton_incontinence',
    question: 'Incontinencia',
    category: 'Incontinencia',
    description: 'Control de esfínteres',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Ninguna', description: 'Control total' },
      { value: 3, label: 'Ocasional', description: 'Incontinencia ocasional' },
      { value: 2, label: 'Urinaria o fecal', description: 'Incontinencia urinaria o fecal' },
      { value: 1, label: 'Urinaria y fecal', description: 'Doble incontinencia' },
    ],
  },
];

export const scoreInterpretation = [
  {
    min: 0,
    max: 5,
    level: 'Riesgo Muy Alto',
    description: 'Riesgo muy alto de desarrollar úlceras por presión',
    recommendation: 'Medidas preventivas intensivas: cambios posturales cada 2h, colchón antiescaras, vigilancia extrema de piel, evaluación nutricional urgente',
    color: '#dc2626',
    priority: 'urgent',
  },
  {
    min: 6,
    max: 9,
    level: 'Riesgo Alto',
    description: 'Alto riesgo de desarrollar úlceras por presión',
    recommendation: 'Cambios posturales frecuentes (cada 2-3h), superficie especial de apoyo, cuidados intensivos de la piel, control de humedad',
    color: '#ea580c',
    priority: 'high',
  },
  {
    min: 10,
    max: 12,
    level: 'Riesgo Evidente',
    description: 'Riesgo evidente de desarrollar úlceras por presión',
    recommendation: 'Cambios posturales cada 3-4h, protección de prominencias óseas, hidratación de piel, valorar superficie de apoyo',
    color: '#f59e0b',
    priority: 'moderate',
  },
  {
    min: 13,
    max: 14,
    level: 'Riesgo Medio',
    description: 'Riesgo medio de desarrollar úlceras por presión',
    recommendation: 'Vigilancia regular de piel, cambios posturales según tolerancia, mantener piel limpia y seca',
    color: '#84cc16',
    priority: 'low',
  },
  {
    min: 15,
    max: 20,
    level: 'Riesgo Mínimo',
    description: 'Riesgo mínimo o sin riesgo de úlceras por presión',
    recommendation: 'Medidas de prevención estándar, valoración periódica',
    color: '#10b981',
    priority: 'minimal',
  },
];
