export interface BarthelQuestion {
  id: string;
  question: string;
  description: string;
  options: Array<{
    value: number;
    label: string;
    description: string;
  }>;
}

export const questions: BarthelQuestion[] = [
  {
    id: 'comida',
    question: 'Comida',
    description: 'Capacidad para comer por sí mismo',
    options: [
      {
        value: 10,
        label: 'Independiente',
        description:
          'Capaz de comer por sí solo en un tiempo razonable. La comida puede ser cocinada y servida por otra persona.',
      },
      {
        value: 5,
        label: 'Necesita ayuda',
        description:
          'Para cortar la carne, extender la mantequilla... pero es capaz de comer solo/a.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita ser alimentado por otra persona.',
      },
    ],
  },
  {
    id: 'lavado',
    question: 'Lavado (Baño)',
    description: 'Capacidad para lavarse solo',
    options: [
      {
        value: 5,
        label: 'Independiente',
        description:
          'Capaz de lavarse entero, de entrar y salir del baño sin ayuda.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita algún tipo de ayuda o supervisión.',
      },
    ],
  },
  {
    id: 'vestido',
    question: 'Vestirse',
    description: 'Capacidad para ponerse y quitarse la ropa',
    options: [
      {
        value: 10,
        label: 'Independiente',
        description: 'Capaz de ponerse y quitarse la ropa sin ayuda.',
      },
      {
        value: 5,
        label: 'Necesita ayuda',
        description: 'Realiza sin ayuda más de la mitad de estas tareas.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description:
          'Necesita ayuda para la mayor parte de las tareas de vestirse.',
      },
    ],
  },
  {
    id: 'arreglo',
    question: 'Arreglo personal',
    description: 'Capacidad para arreglarse y mantener la higiene personal',
    options: [
      {
        value: 5,
        label: 'Independiente',
        description:
          'Realiza todas las actividades personales sin ayuda alguna.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita alguna ayuda para realizar el arreglo personal.',
      },
    ],
  },
  {
    id: 'deposicion',
    question: 'Deposición',
    description: 'Control de la deposición',
    options: [
      {
        value: 10,
        label: 'Continente',
        description: 'No presenta episodios de incontinencia.',
      },
      {
        value: 5,
        label: 'Accidente ocasional',
        description:
          'Menos de una vez por semana o necesita ayuda para colocar enemas o supositorios.',
      },
      {
        value: 0,
        label: 'Incontinente',
        description: 'Presenta más de un episodio semanal de incontinencia.',
      },
    ],
  },
  {
    id: 'miccion',
    question: 'Micción',
    description: 'Control de la micción',
    options: [
      {
        value: 10,
        label: 'Continente',
        description: 'No presenta episodios de incontinencia en la micción.',
      },
      {
        value: 5,
        label: 'Accidente ocasional',
        description: 'Un máximo de un episodio en 24 horas.',
      },
      {
        value: 0,
        label: 'Incontinente',
        description: 'Presenta más de un episodio en 24 horas.',
      },
    ],
  },
  {
    id: 'retrete',
    question: 'Uso del retrete',
    description: 'Capacidad para utilizar el retrete de forma autónoma',
    options: [
      {
        value: 10,
        label: 'Independiente',
        description:
          'Entra y sale del retrete por sí solo sin requerir ayuda.',
      },
      {
        value: 5,
        label: 'Necesita ayuda',
        description: 'Requiere una pequeña ayuda para acceder o utilizarlo.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description:
          'Incapaz de acceder o utilizar el retrete sin asistencia mayor.',
      },
    ],
  },
  {
    id: 'transferencias',
    question: 'Transferencias',
    description: 'Capacidad para transferirse de la cama o silla',
    options: [
      {
        value: 15,
        label: 'Independiente',
        description:
          'No requiere ayuda para sentarse o levantarse de una silla o cama.',
      },
      {
        value: 10,
        label: 'Mínima ayuda',
        description:
          'Requiere supervisión o una pequeña ayuda física para transferirse.',
      },
      {
        value: 5,
        label: 'Gran ayuda',
        description:
          'Precisa ayuda de una persona fuerte para realizar la transferencia.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description:
          'Necesita una grúa o la asistencia de dos personas para transferirse.',
      },
    ],
  },
  {
    id: 'deambulacion',
    question: 'Deambulación',
    description: 'Capacidad para caminar o desplazarse',
    options: [
      {
        value: 15,
        label: 'Independiente',
        description:
          'Puede caminar 50 metros o su equivalente en el hogar sin ayuda.',
      },
      {
        value: 10,
        label: 'Necesita ayuda',
        description:
          'Requiere supervisión o una pequeña ayuda física para caminar.',
      },
      {
        value: 5,
        label: 'Independiente en silla de ruedas',
        description:
          'Puede desplazarse en silla de ruedas sin requerir ayuda ni supervisión.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description: 'Necesita asistencia para desplazarse.',
      },
    ],
  },
  {
    id: 'escaleras',
    question: 'Subir y bajar escaleras',
    description: 'Capacidad para subir y bajar escaleras de forma autónoma',
    options: [
      {
        value: 10,
        label: 'Independiente',
        description:
          'Capaz de subir y bajar un piso sin ayuda ni supervisión.',
      },
      {
        value: 5,
        label: 'Necesita ayuda',
        description:
          'Requiere asistencia o supervisión para subir y bajar escaleras.',
      },
      {
        value: 0,
        label: 'Dependiente',
        description:
          'Incapaz de subir escalones sin ayuda, requiere asistencia completa.',
      },
    ],
  },
];
