/**
 * @file data/vas.ts
 * @description Escala Visual Analógica (VAS/EVA) para evaluación de dolor
 */

export const vasScale = {
  id: 'vas',
  name: 'Escala Visual Analógica',
  shortName: 'VAS/EVA',
  description: 'Evaluación de la intensidad del dolor mediante escala visual',
  category: 'Pain',
  specialty: 'Medicina del Dolor',
  timeToComplete: '1 min',
  information: `
La Escala Visual Analógica (VAS) o Escala Visual Analógica (EVA) es una herramienta de medición unidimensional para la evaluación subjetiva de la intensidad del dolor.

**Instrucciones:**
- El paciente marca en la línea el punto que mejor representa la intensidad de su dolor
- 0 = Sin dolor
- 10 = Peor dolor imaginable

**Aplicación:**
- Dolor agudo y crónico
- Monitoreo de respuesta al tratamiento
- Evaluación pre y post intervención

**Interpretación:**
- 0: Sin dolor
- 1-3: Dolor leve
- 4-6: Dolor moderado
- 7-9: Dolor severo
- 10: Peor dolor imaginable
  `.trim(),
};

export const vasQuestions = [
  {
    id: 'vas_1',
    question: '¿Cuál es la intensidad de su dolor en este momento?',
    description: 'Seleccione el número que mejor representa su dolor',
    type: 'slider' as const,
    min: 0,
    max: 10,
    step: 1,
    options: [
      { value: 0, label: '0 - Sin dolor' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3 - Dolor leve' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
      { value: 6, label: '6 - Dolor moderado' },
      { value: 7, label: '7' },
      { value: 8, label: '8' },
      { value: 9, label: '9 - Dolor severo' },
      { value: 10, label: '10 - Peor dolor imaginable' },
    ],
  },
];

export const scoreInterpretation = [
  {
    min: 0,
    max: 0,
    level: 'Sin dolor',
    description: 'Ausencia de dolor',
    color: '#10b981',
  },
  {
    min: 1,
    max: 3,
    level: 'Dolor leve',
    description: 'Dolor tolerable, no interfiere con actividades',
    color: '#84cc16',
  },
  {
    min: 4,
    max: 6,
    level: 'Dolor moderado',
    description: 'Interfiere con actividades, puede requerir analgesia',
    color: '#f59e0b',
  },
  {
    min: 7,
    max: 9,
    level: 'Dolor severo',
    description: 'Dolor intenso que limita significativamente las actividades',
    color: '#f97316',
  },
  {
    min: 10,
    max: 10,
    level: 'Dolor máximo',
    description: 'Peor dolor imaginable, incapacitante',
    color: '#ef4444',
  },
];
