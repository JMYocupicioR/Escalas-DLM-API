/**
 * @file data/glasgow.ts
 * @description Escala de Coma de Glasgow (GCS) para evaluación del nivel de consciencia
 */

export const glasgowScale = {
  id: 'glasgow',
  name: 'Escala de Coma de Glasgow',
  shortName: 'GCS',
  description: 'Evaluación del nivel de consciencia mediante respuesta ocular, verbal y motora',
  category: 'Neurology',
  specialty: 'Neurología',
  timeToComplete: '2 min',
  information: `
La Escala de Coma de Glasgow (GCS - Glasgow Coma Scale) es una herramienta neurológica para evaluar el nivel de consciencia de un paciente.

**Componentes:**
1. **Apertura Ocular (1-4 puntos)**
2. **Respuesta Verbal (1-5 puntos)**
3. **Respuesta Motora (1-6 puntos)**

**Puntuación Total: 3-15 puntos**

**Interpretación:**
- **13-15:** Traumatismo leve
- **9-12:** Traumatismo moderado
- **≤8:** Traumatismo grave (indicación de intubación)

**Aplicaciones:**
- Traumatismo craneoencefálico (TCE)
- Monitoreo neurológico
- Evaluación de coma
- Predicción pronóstica
- Triage en urgencias

**Limitaciones:**
- No evaluable en pacientes intubados (componente verbal)
- Edema palpebral puede afectar apertura ocular
- Sedación/relajantes musculares alteran la evaluación
  `.trim(),
};

export const glasgowQuestions = [
  {
    id: 'glasgow_eye',
    question: 'Apertura Ocular',
    category: 'Apertura Ocular',
    description: 'Evalúe la mejor respuesta de apertura ocular',
    type: 'single_choice' as const,
    options: [
      { value: 4, label: 'Espontánea', description: 'Abre los ojos espontáneamente' },
      { value: 3, label: 'Al estímulo verbal', description: 'Abre los ojos al hablarle' },
      { value: 2, label: 'Al estímulo doloroso', description: 'Abre los ojos solo con dolor' },
      { value: 1, label: 'Ninguna', description: 'No abre los ojos' },
    ],
  },
  {
    id: 'glasgow_verbal',
    question: 'Respuesta Verbal',
    category: 'Respuesta Verbal',
    description: 'Evalúe la mejor respuesta verbal',
    type: 'single_choice' as const,
    options: [
      { value: 5, label: 'Orientada', description: 'Conversación coherente y orientada' },
      { value: 4, label: 'Confusa', description: 'Conversación pero desorientado' },
      { value: 3, label: 'Palabras inapropiadas', description: 'Palabras sueltas sin sentido' },
      { value: 2, label: 'Sonidos incomprensibles', description: 'Solo gemidos o sonidos' },
      { value: 1, label: 'Ninguna', description: 'No emite sonidos' },
    ],
  },
  {
    id: 'glasgow_motor',
    question: 'Respuesta Motora',
    category: 'Respuesta Motora',
    description: 'Evalúe la mejor respuesta motora',
    type: 'single_choice' as const,
    options: [
      { value: 6, label: 'Obedece órdenes', description: 'Sigue comandos verbales' },
      { value: 5, label: 'Localiza el dolor', description: 'Retira el miembro localiza el estímulo' },
      { value: 4, label: 'Retirada al dolor', description: 'Flexión de retirada' },
      { value: 3, label: 'Flexión anormal', description: 'Decorticación' },
      { value: 2, label: 'Extensión anormal', description: 'Descerebración' },
      { value: 1, label: 'Ninguna', description: 'Sin respuesta motora' },
    ],
  },
];

export const scoreInterpretation = [
  {
    min: 15,
    max: 15,
    level: 'Normal',
    description: 'Consciente y alerta',
    severity: 'normal',
    color: '#10b981',
  },
  {
    min: 13,
    max: 14,
    level: 'Traumatismo Leve',
    description: 'Alteración leve de la consciencia',
    severity: 'mild',
    recommendation: 'Observación clínica',
    color: '#84cc16',
  },
  {
    min: 9,
    max: 12,
    level: 'Traumatismo Moderado',
    description: 'Alteración moderada de la consciencia',
    severity: 'moderate',
    recommendation: 'Requiere vigilancia neurológica estrecha',
    color: '#f59e0b',
  },
  {
    min: 3,
    max: 8,
    level: 'Traumatismo Grave',
    description: 'Alteración grave de la consciencia (Coma)',
    severity: 'severe',
    recommendation: 'Indicación de intubación y manejo en UCI',
    color: '#ef4444',
  },
];
