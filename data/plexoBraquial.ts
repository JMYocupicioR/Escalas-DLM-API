// Datos para la calculadora diagnóstica del plexo braquial
// Basado en el HTML de plexopatía braquial v2

export interface MusculoClave {
  nombre: string;
  peso: number;
}

export interface SeveridadLesion {
  grado: 1 | 2 | 3 | 4 | 5; // Clasificación de Sunderland
  descripcion: string;
  pronostico: 'excelente' | 'bueno' | 'reservado' | 'malo';
  tiempoRecuperacion: string;
  tratamientoRecomendado: string;
}

export interface AnalisisTemporal {
  faseEvolutiva: 'hiperaguda' | 'aguda' | 'subaguda' | 'cronica';
  tiempoEvolucion?: number; // días desde inicio
  patronEvolucion?: 'mejorando' | 'estable' | 'deteriorando';
  factoresPronostico: string[];
}

export interface IndicadoresConfianza {
  nivelConfianza: number; // 0-100%
  factoresPositivos: string[];
  factoresNegativos: string[];
  recomendacionesAdicionales: string[];
  necesidadEstudios: boolean;
  estudiosRecomendados?: string[];
}

export interface Lesion {
  nombre: string;
  musculosClave: MusculoClave[];
  nerviosPerifericos: string[];
  areasSensibilidad: string[];
  sintomasClave: string[];
  reflejosClave: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  exclusivos: boolean;
  umbralMinimo?: number;
  categoria: 'radicular' | 'tronco' | 'fasciculo' | 'nervio_periferico' | 'combinada' | 'obstetrica' | 'traumatica' | 'iatrogena';
  severidadEsperada?: SeveridadLesion;
  contextoClinico?: {
    mecanismoFrecuente: string[];
    edadTipica: string;
    factoresRiesgo: string[];
  };
}

export interface ConfiguracionDiagnostica {
  PESO_MUSCULOS: number;
  PESO_SENSIBILIDAD: number;
  PESO_SINTOMAS: number;
  PESO_REFLEJOS: number;
  PESO_HORNER: number;
  UMBRAL_COINCIDENCIA_GENERAL: number;
  UMBRAL_MINIMO_EXCLUSIVO: number;
  PENALIZACION_MUSCULO_NORMAL: number;
}

export const CONFIG: ConfiguracionDiagnostica = {
  PESO_MUSCULOS: 4,
  PESO_SENSIBILIDAD: 1.5,
  PESO_SINTOMAS: 0.5,
  PESO_REFLEJOS: 1.5,
  PESO_HORNER: 2,
  UMBRAL_COINCIDENCIA_GENERAL: 0.3,
  UMBRAL_MINIMO_EXCLUSIVO: 0.7,
  PENALIZACION_MUSCULO_NORMAL: 0.8
};

// Configuraciones adaptativas por contexto clínico
export const CONFIG_CONTEXTUAL = {
  traumatico: {
    PESO_MUSCULOS: 4.5,
    PESO_SENSIBILIDAD: 1.2,
    PESO_SINTOMAS: 0.8,
    PESO_REFLEJOS: 1.8,
    PESO_HORNER: 2.5,
    UMBRAL_COINCIDENCIA_GENERAL: 0.25,
    UMBRAL_MINIMO_EXCLUSIVO: 0.6,
    PENALIZACION_MUSCULO_NORMAL: 0.7
  },
  obstetrico: {
    PESO_MUSCULOS: 4.2,
    PESO_SENSIBILIDAD: 1.0,
    PESO_SINTOMAS: 0.3,
    PESO_REFLEJOS: 2.0,
    PESO_HORNER: 3.0,
    UMBRAL_COINCIDENCIA_GENERAL: 0.35,
    UMBRAL_MINIMO_EXCLUSIVO: 0.75,
    PENALIZACION_MUSCULO_NORMAL: 0.9
  },
  iatrogeno: {
    PESO_MUSCULOS: 3.8,
    PESO_SENSIBILIDAD: 1.8,
    PESO_SINTOMAS: 0.4,
    PESO_REFLEJOS: 1.3,
    PESO_HORNER: 1.5,
    UMBRAL_COINCIDENCIA_GENERAL: 0.4,
    UMBRAL_MINIMO_EXCLUSIVO: 0.8,
    PENALIZACION_MUSCULO_NORMAL: 0.85
  },
  idiopatico: {
    PESO_MUSCULOS: 3.5,
    PESO_SENSIBILIDAD: 2.0,
    PESO_SINTOMAS: 0.7,
    PESO_REFLEJOS: 1.2,
    PESO_HORNER: 1.8,
    UMBRAL_COINCIDENCIA_GENERAL: 0.45,
    UMBRAL_MINIMO_EXCLUSIVO: 0.85,
    PENALIZACION_MUSCULO_NORMAL: 0.9
  }
};

// Ajustes por tiempo de evolución
export const AJUSTES_TEMPORALES = {
  hiperaguda: { // < 24 horas
    multiplicadorMuscular: 0.8, // Los músculos pueden no mostrar debilidad aún
    multiplicadorSensorial: 1.2, // Los síntomas sensoriales son más prominentes
    umbralAjuste: -0.1
  },
  aguda: { // 1-7 días
    multiplicadorMuscular: 1.0,
    multiplicadorSensorial: 1.0,
    umbralAjuste: 0
  },
  subaguda: { // 1-12 semanas
    multiplicadorMuscular: 1.2, // Patrón muscular más definido
    multiplicadorSensorial: 0.9,
    umbralAjuste: 0.05
  },
  cronica: { // > 12 semanas
    multiplicadorMuscular: 1.3, // Patrón bien establecido
    multiplicadorSensorial: 0.7, // Síntomas sensoriales pueden mejorar
    umbralAjuste: 0.1
  }
};

export const MUSCULOS_EVALUACION = [
  'Deltoides',
  'Supraespinoso',
  'Infraespinoso',
  'Bíceps Braquial',
  'Tríceps Braquial',
  'Braquial',
  'Braquiorradial',
  'Extensor Carpi Radialis',
  'Extensor de los Dedos',
  'Extensor Carpi Ulnaris',
  'Flexor Carpi Radialis',
  'Flexor Carpi Ulnaris',
  'Flexor Profundo de los Dedos',
  'Flexor Largo del Pulgar',
  'Pronador Redondo',
  'Supinador',
  'Interóseos Dorsales',
  'Interóseos Palmares',
  'Lumbricales 3 y 4',
  'Abductor del Meñique',
  'Oponente del Meñique',
  'Flexor Corto del Meñique',
  'Aductor del Pulgar',
  'Subclavio',
  'Romboides',
  'Elevador Escápula',
  'Pectoral Mayor (Porción Clavicular)',
  'Dorsal Ancho',
  'Trapecio Superior',
  'Flexor Corto del Pulgar'
];

// Agrupación de músculos por región anatómica para mejor UX
export const MUSCULOS_POR_REGION = {
  'Hombro y Escápula': [
    'Deltoides',
    'Supraespinoso',
    'Infraespinoso',
    'Trapecio Superior',
    'Romboides',
    'Elevador Escápula',
    'Pectoral Mayor (Porción Clavicular)',
    'Dorsal Ancho',
    'Subclavio'
  ],
  'Brazo': [
    'Bíceps Braquial',
    'Tríceps Braquial',
    'Braquial'
  ],
  'Antebrazo': [
    'Braquiorradial',
    'Extensor Carpi Radialis',
    'Extensor de los Dedos',
    'Extensor Carpi Ulnaris',
    'Flexor Carpi Radialis',
    'Flexor Carpi Ulnaris',
    'Flexor Profundo de los Dedos',
    'Flexor Largo del Pulgar',
    'Pronador Redondo',
    'Supinador'
  ],
  'Mano': [
    'Interóseos Dorsales',
    'Interóseos Palmares',
    'Lumbricales 3 y 4',
    'Abductor del Meñique',
    'Oponente del Meñique',
    'Flexor Corto del Meñique',
    'Aductor del Pulgar',
    'Flexor Corto del Pulgar'
  ]
};

// Músculos esenciales para evaluación rápida
export const MUSCULOS_ESENCIALES = [
  'Deltoides',
  'Supraespinoso',
  'Bíceps Braquial',
  'Tríceps Braquial',
  'Braquiorradial',
  'Extensor de los Dedos',
  'Flexor Carpi Radialis',
  'Flexor Carpi Ulnaris',
  'Interóseos Dorsales',
  'Abductor del Meñique'
];

export const SINTOMAS_CLINICOS = [
  'Dolor Neurítico',
  'Parestesias',
  'Signo de Horner'
];

export const AREAS_SENSIBILIDAD = [
  'Zona Lateral Hombro (Axilar)',
  'Zona Lateral Antebrazo (Musculocutáneo)',
  'Zona Posterior Brazo/Antebrazo (Radial)',
  'Mano Lateral (Mediano)',
  'Mano Medial (Cubital)',
  'Zona Medial Antebrazo (Cut. Med. Antebrazo)',
  'Zona Medial Brazo (Cut. Med. Brazo)',
  'Dermatoma C5',
  'Dermatoma C6',
  'Dermatoma C7',
  'Dermatoma C8',
  'Dermatoma T1',
  'Dermatoma C4',
  'Dermatoma T2'
];

export const LESIONES: Lesion[] = [
  // Lesiones Radiculares
  {
    nombre: "Lesión de Raíz C5",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Supraespinoso", peso: 1.2 },
      { nombre: "Infraespinoso", peso: 1.2 },
      { nombre: "Bíceps Braquial", peso: 1.0 },
      { nombre: "Braquial", peso: 0.8 },
      { nombre: "Subclavio", peso: 0.5 },
      { nombre: "Romboides", peso: 1.0 },
      { nombre: "Elevador Escápula", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo (parcial)", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Dermatoma C5"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión axonal con potencial de recuperación",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-6 meses",
      tratamientoRecomendado: "Fisioterapia, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del plexo", "Compresión radicular", "Hernia discal"],
      edadTipica: "Adulto joven-medio",
      factoresRiesgo: ["Deportes de contacto", "Accidentes de tráfico", "Patología cervical"]
    }
  },
  {
    nombre: "Lesión de Raíz C6",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 1.2 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Supinador", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.8 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo", "N. Radial (parcial)", "Raíz Lat. N. Mediano"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)", "Mano Lateral (Mediano)", "Dermatoma C6"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz C7",
    musculosClave: [
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Flexor Carpi Radialis", peso: 0.8 },
      { nombre: "Pronador Redondo", peso: 0.5 },
      { nombre: "Dorsal Ancho", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Radial", "N. Mediano (parcial)"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)", "Dermatoma C7"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz C8",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Interóseos Dorsales", peso: 0.8 },
      { nombre: "Interóseos Palmares", peso: 0.8 },
      { nombre: "Lumbricales 3 y 4", peso: 0.8 },
      { nombre: "Abductor del Meñique", peso: 0.5 },
      { nombre: "Oponente del Meñique", peso: 0.5 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma C8"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  {
    nombre: "Lesión de Raíz T1",
    musculosClave: [
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Aductor del Pulgar", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Oponente del Meñique", peso: 1.2 },
      { nombre: "Flexor Corto del Meñique", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Ulnar", "Raíz Med. N. Mediano"],
    areasSensibilidad: ["Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'radicular'
  },
  
  // Lesiones de Troncos
  {
    nombre: "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Supraespinoso", peso: 1.2 },
      { nombre: "Infraespinoso", peso: 1.2 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquiorradial", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Braquial", peso: 0.8 },
      { nombre: "Romboides", peso: 1.0 },
      { nombre: "Elevador Escápula", peso: 0.8 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    sintomasClave: ["Dolor Neurítico", "Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión del tronco superior con compromiso múltiple",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-12 meses",
      tratamientoRecomendado: "Fisioterapia intensiva, considerar cirugía si no hay recuperación en 3-6 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del cuello", "Accidente de motocicleta", "Trauma obstétrico"],
      edadTipica: "Adulto joven o recién nacido",
      factoresRiesgo: ["Deportes de contacto", "Accidentes de tráfico", "Parto complicado"]
    }
  },
  {
    nombre: "Lesión de Tronco Inferior (C8-T1) - Klumpke",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.0 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Oponente del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'tronco',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión del tronco inferior con compromiso simpático",
      pronostico: 'reservado',
      tiempoRecuperacion: "12-18 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias nerviosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del brazo", "Tumor de Pancoast", "Trauma de alta energía"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Neoplasias apicales", "Accidentes laborales", "Violencia"]
    }
  },

  // Lesiones de Fascículos
  {
    nombre: "Lesión de Fascículo Lateral",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Braquial", peso: 1.2 },
      { nombre: "Flexor Carpi Radialis", peso: 1.0 },
      { nombre: "Pronador Redondo", peso: 1.0 },
      { nombre: "Flexor Largo del Pulgar", peso: 0.8 },
      { nombre: "Flexor Profundo de los Dedos", peso: 0.5 },
      { nombre: "Pectoral Mayor (Porción Clavicular)", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo", "Raíz Lateral N. Mediano", "N. Pectoral Lateral"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)", "Mano Lateral (Mediano)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'fasciculo'
  },
  {
    nombre: "Lesión de Fascículo Medial",
    musculosClave: [
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.2 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.0 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar", "Raíz Medial N. Mediano"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'fasciculo'
  },
  {
    nombre: "Lesión de Fascículo Posterior",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.2 },
      { nombre: "Extensor Carpi Radialis", peso: 1.0 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.0 },
      { nombre: "Braquiorradial", peso: 1.0 },
      { nombre: "Supinador", peso: 0.8 },
      { nombre: "Dorsal Ancho", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Radial", "N. Toracodorsal"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Posterior Brazo/Antebrazo (Radial)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'fasciculo'
  },

  // Mononeuropatías
  {
    nombre: "Neuropatía del Nervio Axilar",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 }
    ],
    nerviosPerifericos: ["N. Axilar"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.8,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Musculocutáneo",
    musculosClave: [
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Braquial", peso: 1.5 }
    ],
    nerviosPerifericos: ["N. Musculocutáneo"],
    areasSensibilidad: ["Zona Lateral Antebrazo (Musculocutáneo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.8,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Radial (Proximal)",
    musculosClave: [
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Extensor Carpi Radialis", peso: 1.2 },
      { nombre: "Extensor Carpi Ulnaris", peso: 1.2 },
      { nombre: "Braquiorradial", peso: 1.0 },
      { nombre: "Supinador", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Radial"],
    areasSensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Mediano (Proximal)",
    musculosClave: [
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Pronador Redondo", peso: 1.5 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.2 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Mediano"],
    areasSensibilidad: ["Mano Lateral (Mediano)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },
  {
    nombre: "Neuropatía del Nervio Ulnar (Proximal)",
    musculosClave: [
      { nombre: "Flexor Carpi Ulnaris", peso: 2.0 },
      { nombre: "Flexor Profundo de los Dedos", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 1.5 },
      { nombre: "Interóseos Palmares", peso: 1.5 },
      { nombre: "Abductor del Meñique", peso: 1.2 },
      { nombre: "Aductor del Pulgar", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Ulnar"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)"],
    sintomasClave: ["Parestesias"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: true,
    umbralMinimo: 0.7,
    categoria: 'nervio_periferico'
  },

  // LESIONES COMBINADAS Y COMPLEJAS
  {
    nombre: "Avulsión Total del Plexo Braquial (C5-T1)",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Infraespinoso", peso: 1.8 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Romboides", peso: 1.2 },
      { nombre: "Elevador Escápula", peso: 1.2 }
    ],
    nerviosPerifericos: ["Todos los nervios del plexo braquial"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Zona Posterior Brazo/Antebrazo (Radial)", "Mano Lateral (Mediano)", "Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C5", "Dermatoma C6", "Dermatoma C7", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "ausente", tricipital: "ausente" },
    exclusivos: false,
    categoria: 'traumatica',
    severidadEsperada: {
      grado: 5,
      descripcion: "Neurotmesis completa - sin recuperación espontánea",
      pronostico: 'malo',
      tiempoRecuperacion: "Sin recuperación espontánea",
      tratamientoRecomendado: "Cirugía reconstructiva urgente, transferencias nerviosas"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Accidente de motocicleta", "Trauma de alta energía", "Tracción severa"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Accidentes de tráfico", "Deportes extremos", "Caídas de altura"]
    }
  },
  {
    nombre: "Lesión Obstétrica Erb-Duchenne + Axilar",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.5 },
      { nombre: "Supraespinoso", peso: 2.0 },
      { nombre: "Infraespinoso", peso: 2.0 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor Carpi Radialis", peso: 1.2 },
      { nombre: "Braquial", peso: 1.0 },
      { nombre: "Romboides", peso: 1.5 },
      { nombre: "Elevador Escápula", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    sintomasClave: ["Dolor Neurítico"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "disminuido", tricipital: "normal" },
    exclusivos: false,
    categoria: 'obstetrica',
    severidadEsperada: {
      grado: 3,
      descripcion: "Lesión combinada con compromiso axonal significativo",
      pronostico: 'reservado',
      tiempoRecuperacion: "6-18 meses",
      tratamientoRecomendado: "Fisioterapia precoz, considerar cirugía a los 3-6 meses"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Distocia de hombros", "Parto instrumentado", "Macrosomía fetal"],
      edadTipica: "Recién nacido",
      factoresRiesgo: ["Peso fetal >4kg", "Diabetes materna", "Parto prolongado"]
    }
  },
  {
    nombre: "Lesión Traumática C8-T1 con Horner",
    musculosClave: [
      { nombre: "Flexor Profundo de los Dedos", peso: 2.0 },
      { nombre: "Flexor Largo del Pulgar", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.8 },
      { nombre: "Interóseos Dorsales", peso: 2.5 },
      { nombre: "Interóseos Palmares", peso: 2.5 },
      { nombre: "Lumbricales 3 y 4", peso: 1.5 },
      { nombre: "Abductor del Meñique", peso: 2.0 },
      { nombre: "Oponente del Meñique", peso: 2.0 },
      { nombre: "Aductor del Pulgar", peso: 1.8 }
    ],
    nerviosPerifericos: ["N. Ulnar", "N. Mediano (parcial)", "Fibras simpáticas"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Zona Medial Brazo (Cut. Med. Brazo)", "Dermatoma C8", "Dermatoma T1"],
    sintomasClave: ["Dolor Neurítico", "Parestesias", "Signo de Horner"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'traumatica',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión severa con compromiso de fibras simpáticas",
      pronostico: 'reservado',
      tiempoRecuperacion: "12-24 meses",
      tratamientoRecomendado: "Cirugía reconstructiva, transferencias nerviosas, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Tracción del brazo", "Herida penetrante", "Tumor apical pulmonar"],
      edadTipica: "Adulto",
      factoresRiesgo: ["Accidentes laborales", "Violencia", "Neoplasias"]
    }
  },
  {
    nombre: "Lesión Iatrogénica Post-Cirugía de Hombro",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.5 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Infraespinoso", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.2 },
      { nombre: "Braquial", peso: 1.0 }
    ],
    nerviosPerifericos: ["N. Axilar", "N. Musculocutáneo (parcial)", "N. Supraescapular"],
    areasSensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)"],
    sintomasClave: ["Dolor Neurítico", "Parestesias"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'iatrogena',
    severidadEsperada: {
      grado: 2,
      descripcion: "Lesión axonal por trauma quirúrgico",
      pronostico: 'bueno',
      tiempoRecuperacion: "3-9 meses",
      tratamientoRecomendado: "Fisioterapia, manejo del dolor, seguimiento estrecho"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Artroscopia de hombro", "Cirugía de manguito rotador", "Reemplazo articular"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Cirugía prolongada", "Posicionamiento inadecuado", "Anatomía variante"]
    }
  },
  {
    nombre: "Síndrome del Desfiladero Torácico Neurogénico",
    musculosClave: [
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Interóseos Palmares", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 1.8 },
      { nombre: "Aductor del Pulgar", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.2 }
    ],
    nerviosPerifericos: ["N. Ulnar (fibras T1)", "Tronco inferior"],
    areasSensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma T1"],
    sintomasClave: ["Parestesias", "Dolor Neurítico"],
    reflejosClave: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    exclusivos: false,
    categoria: 'combinada',
    severidadEsperada: {
      grado: 2,
      descripcion: "Compresión crónica con desmielinización",
      pronostico: 'bueno',
      tiempoRecuperacion: "2-6 meses con tratamiento",
      tratamientoRecomendado: "Fisioterapia, cirugía descompresiva si falla tratamiento conservador"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Costilla cervical", "Banda fibrosa", "Hipertrofia muscular"],
      edadTipica: "Adulto joven",
      factoresRiesgo: ["Actividades repetitivas", "Deportes overhead", "Anatomía variante"]
    }
  },
  {
    nombre: "Lesión por Radiación (Plexopatía Actínica)",
    musculosClave: [
      { nombre: "Deltoides", peso: 1.5 },
      { nombre: "Bíceps Braquial", peso: 1.5 },
      { nombre: "Tríceps Braquial", peso: 1.8 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.2 },
      { nombre: "Interóseos Dorsales", peso: 1.8 }
    ],
    nerviosPerifericos: ["Múltiples nervios del plexo"],
    areasSensibilidad: ["Variable según nervios afectados"],
    sintomasClave: ["Parestesias", "Dolor Neurítico"],
    reflejosClave: { bicipital: "disminuido", braquiorradial: "disminuido", tricipital: "disminuido" },
    exclusivos: false,
    categoria: 'iatrogena',
    severidadEsperada: {
      grado: 3,
      descripcion: "Fibrosis progresiva post-radiación",
      pronostico: 'reservado',
      tiempoRecuperacion: "Progresivo, sin recuperación",
      tratamientoRecomendado: "Manejo sintomático, fisioterapia, manejo del dolor"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Radioterapia para cáncer de mama", "Linfoma", "Sarcoma"],
      edadTipica: "Adulto medio-mayor",
      factoresRiesgo: ["Dosis alta de radiación", "Campos amplios", "Quimioterapia concomitante"]
    }
  },
  {
    nombre: "Parálisis Braquial Obstétrica Total (C5-T1)",
    musculosClave: [
      { nombre: "Deltoides", peso: 2.0 },
      { nombre: "Supraespinoso", peso: 1.8 },
      { nombre: "Bíceps Braquial", peso: 2.0 },
      { nombre: "Tríceps Braquial", peso: 2.0 },
      { nombre: "Braquiorradial", peso: 1.5 },
      { nombre: "Extensor de los Dedos", peso: 1.5 },
      { nombre: "Flexor Carpi Radialis", peso: 1.5 },
      { nombre: "Flexor Carpi Ulnaris", peso: 1.5 },
      { nombre: "Interóseos Dorsales", peso: 2.0 },
      { nombre: "Abductor del Meñique", peso: 2.0 }
    ],
    nerviosPerifericos: ["Todo el plexo braquial"],
    areasSensibilidad: ["Toda la extremidad superior"],
    sintomasClave: ["Signo de Horner"],
    reflejosClave: { bicipital: "ausente", braquiorradial: "ausente", tricipital: "ausente" },
    exclusivos: false,
    categoria: 'obstetrica',
    severidadEsperada: {
      grado: 4,
      descripcion: "Lesión severa con avulsiones múltiples",
      pronostico: 'malo',
      tiempoRecuperacion: "Limitada, requiere cirugía",
      tratamientoRecomendado: "Cirugía reconstructiva temprana, transferencias nerviosas múltiples"
    },
    contextoClinico: {
      mecanismoFrecuente: ["Distocia severa", "Parto traumático", "Maniobras obstétricas"],
      edadTipica: "Recién nacido",
      factoresRiesgo: ["Macrosomía severa", "Presentación anómala", "Trabajo de parto prolongado"]
    }
  }
];

// Tipos para los resultados del diagnóstico
export interface ResultadoDiagnostico {
  nombreLesion: string;
  score: number;
  normalizedScore: number;
  umbral: number;
  categoria: string;
  severidadEsperada?: SeveridadLesion;
  contextoClinico?: {
    mecanismoFrecuente: string[];
    edadTipica: string;
    factoresRiesgo: string[];
  };
  indicadoresConfianza?: IndicadoresConfianza;
  analisisTemporal?: AnalisisTemporal;
  detalles: {
    musculos: { nombre: string; mrc: number; esperado: boolean; peso: number }[];
    musculosInesperados?: { nombre: string; mrc: number }[];
    sensibilidad: string[];
    sintomas: string[];
    reflejos: { nombre: string; esperado: string; encontrado: string; match: boolean }[];
    nerviosPerifericos: string[];
  };
}

export interface DatosEvaluacion {
  fuerzasMuscular: { [musculo: string]: number };
  sintomasSeleccionados: string[];
  areasSeleccionadas: string[];
  reflejos: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  informacionAdicional: {
    mecanismo: string;
    evolucion: string;
    tipoPlexo: 'normal' | 'prefijado' | 'postfijado';
    contextoClinico?: 'traumatico' | 'obstetrico' | 'iatrogeno' | 'idiopatico';
    tiempoEvolucion?: number; // días desde inicio
    faseEvolutiva?: 'hiperaguda' | 'aguda' | 'subaguda' | 'cronica';
    patronEvolucion?: 'mejorando' | 'estable' | 'deteriorando';
  };
}

// Opciones para los dropdowns
export const OPCIONES_REFLEJOS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Disminuido', value: 'disminuido' },
  { label: 'Ausente', value: 'ausente' }
];

export const OPCIONES_MRC = [
  { label: '0 - Sin contracción', value: 0 },
  { label: '1 - Contracción visible sin movimiento', value: 1 },
  { label: '2 - Movimiento sin gravedad', value: 2 },
  { label: '3 - Movimiento contra gravedad', value: 3 },
  { label: '4 - Movimiento contra resistencia', value: 4 },
  { label: '5 - Fuerza normal', value: 5 }
];

export const OPCIONES_TIPO_PLEXO = [
  { label: 'Normal', value: 'normal' },
  { label: 'Prefijado', value: 'prefijado' },
  { label: 'Postfijado', value: 'postfijado' }
];

export const OPCIONES_CONTEXTO_CLINICO = [
  { label: 'Traumático', value: 'traumatico' },
  { label: 'Obstétrico', value: 'obstetrico' },
  { label: 'Iatrogénico', value: 'iatrogeno' },
  { label: 'Idiopático', value: 'idiopatico' }
];

export const OPCIONES_FASE_EVOLUTIVA = [
  { label: 'Hiperaguda (< 24h)', value: 'hiperaguda' },
  { label: 'Aguda (1-7 días)', value: 'aguda' },
  { label: 'Subaguda (1-12 semanas)', value: 'subaguda' },
  { label: 'Crónica (> 12 semanas)', value: 'cronica' }
];

export const OPCIONES_PATRON_EVOLUCION = [
  { label: 'Mejorando', value: 'mejorando' },
  { label: 'Estable', value: 'estable' },
  { label: 'Deteriorando', value: 'deteriorando' }
];

// Información sobre músculos con inervación dual
export interface InervacionDual {
  principal: string;
  secundario: string;
  implicacion: string;
  relevanciaClinica: string;
}

export const INERVACION_DUAL: { [musculo: string]: InervacionDual } = {
  "Braquial": {
    principal: "N. Musculocutáneo",
    secundario: "N. Radial (porción lateral)",
    implicacion: "Lesión aislada del musculocutáneo puede no paralizar completamente el músculo",
    relevanciaClinica: "En lesiones del fascículo lateral, el braquial puede mantener función parcial gracias a su inervación radial"
  },
  "Pectoral Mayor": {
    principal: "N. Pectoral Lateral (C5-C7)",
    secundario: "N. Pectoral Medial (C8-T1)",
    implicacion: "Lesión de un solo nervio pectoral puede preservar función parcial",
    relevanciaClinica: "La porción clavicular (pectoral lateral) y esternocostal (pectoral medial) pueden afectarse independientemente"
  },
  "Flexor Corto del Pulgar": {
    principal: "N. Mediano (cabeza superficial)",
    secundario: "N. Ulnar (cabeza profunda)",
    implicacion: "Doble inervación crucial para función del pulgar",
    relevanciaClinica: "En síndrome del túnel carpiano, solo se afecta la porción mediana, preservando parte de la función"
  },
  "Aductor del Pulgar": {
    principal: "N. Ulnar (rama profunda)",
    secundario: "N. Mediano (ocasionalmente)",
    implicacion: "Inervación mediana variable puede preservar función parcial",
    relevanciaClinica: "Explica por qué algunos pacientes con lesión ulnar mantienen cierta adducción del pulgar"
  },
  "Flexor Profundo de los Dedos": {
    principal: "N. Mediano (dedos 2-3)",
    secundario: "N. Ulnar (dedos 4-5)",
    implicacion: "Lesiones selectivas afectan solo algunos dedos",
    relevanciaClinica: "Patrón característico: flexión preservada en índice-medio (mediano) vs anular-meñique (ulnar)"
  },
  "Lumbricales": {
    principal: "N. Mediano (1º y 2º)",
    secundario: "N. Ulnar (3º y 4º)",
    implicacion: "Inervación dividida entre mediano y ulnar",
    relevanciaClinica: "En lesiones del mediano, se preserva la función de los lumbricales 3 y 4 (ulnar)"
  }
};

// Hallazgos de inervación dual
export interface HallazgoInervacionDual {
  musculo: string;
  mrc: number;
  info: InervacionDual;
  relevancia: 'Alta' | 'Moderada' | 'Baja';
  interpretacion: string;
}

// Explicaciones anatómicas detalladas por diagnóstico
export interface ExplicacionAnatomica {
  estructurasPrimarias: string[];
  estructurasSecundarias: string[];
  nerviosAfectados: string[];
  recorrido: {
    estructura: string;
    explicacion: string;
    icono: string;
  }[];
  explicacionMuscular: { [musculo: string]: string };
  correlacionClinica: string;
  signosCaracteristicos: string[];
  diagnosticoDiferencial: string[];
}

export const EXPLICACIONES_ANATOMICAS: { [diagnostico: string]: ExplicacionAnatomica } = {
  "Lesión de Raíz C5": {
    estructurasPrimarias: ["Raíz C5"],
    estructurasSecundarias: ["Tronco Superior", "Fascículo Lateral", "Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    recorrido: [
      { estructura: "Raíz C5", explicacion: "Lesión en la raíz nerviosa C5 a nivel cervical", icono: "🧠" },
      { estructura: "Tronco Superior", explicacion: "C5 contribuye al tronco superior junto con C6", icono: "🔗" },
      { estructura: "Fascículos", explicacion: "El tronco superior se divide en fascículos lateral y posterior", icono: "🌿" },
      { estructura: "Nervios Terminales", explicacion: "Compromete nervios axilar, musculocutáneo y supraescapular", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Deltoides": "Inervado por nervio axilar (C5-C6) que surge del fascículo posterior",
      "Supraespinoso": "Inervado por nervio supraescapular que se origina directamente del tronco superior",
      "Infraespinoso": "También inervado por nervio supraescapular (C5-C6)",
      "Bíceps Braquial": "Inervado por nervio musculocutáneo del fascículo lateral (C5-C7)"
    },
    correlacionClinica: "La lesión de C5 produce el patrón clásico de debilidad en abducción y rotación externa del hombro, con preservación de la función de la mano.",
    signosCaracteristicos: [
      "Imposibilidad de abducción del hombro",
      "Debilidad en rotación externa",
      "Reflejo bicipital disminuido",
      "Sensibilidad alterada en dermatoma C5"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco superior (más extenso)",
      "Neuropatía axilar aislada (solo deltoides)",
      "Lesión del fascículo posterior"
    ]
  },
  "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne": {
    estructurasPrimarias: ["Raíz C5", "Raíz C6", "Tronco Superior"],
    estructurasSecundarias: ["Fascículo Lateral", "Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar", "N. Musculocutáneo", "N. Supraescapular", "N. Dorsal Escápula"],
    recorrido: [
      { estructura: "Raíces C5-C6", explicacion: "Lesión completa del tronco superior (parálisis Erb-Duchenne)", icono: "🧠" },
      { estructura: "Tronco Superior", explicacion: "Interrupción total del tronco formado por C5-C6", icono: "❌" },
      { estructura: "Fascículos", explicacion: "Ambos fascículos pierden contribución C5-C6", icono: "🌿" },
      { estructura: "Múltiples Nervios", explicacion: "Afectación simultánea de nervios axilar, musculocutáneo y supraescapular", icono: "⚡" }
    ],
    explicacionMuscular: {
      "Deltoides": "Parálisis completa por lesión del nervio axilar (C5-C6)",
      "Bíceps Braquial": "Parálisis por afectación del musculocutáneo (C5-C7)",
      "Braquiorradial": "Debilidad por compromiso de C6 en el nervio radial",
      "Supraespinoso": "Parálisis por lesión del supraescapular"
    },
    correlacionClinica: "Patrón clásico de Erb-Duchenne: brazo colgante, rotación interna, pronación del antebrazo ('posición de propina').",
    signosCaracteristicos: [
      "Posición característica de 'propina'",
      "Brazo en adducción y rotación interna",
      "Antebrazo en pronación",
      "Reflejos bicipital y braquiorradial ausentes"
    ],
    diagnosticoDiferencial: [
      "Lesión radicular C5 aislada (menos extenso)",
      "Lesión radicular C6 aislada (menos extenso)",
      "Lesión del fascículo lateral"
    ]
  },
  "Neuropatía del Nervio Axilar": {
    estructurasPrimarias: ["N. Axilar"],
    estructurasSecundarias: ["Fascículo Posterior"],
    nerviosAfectados: ["N. Axilar"],
    recorrido: [
      { estructura: "Fascículo Posterior", explicacion: "El nervio axilar se origina del fascículo posterior", icono: "🔗" },
      { estructura: "Cuadrilátero de Velpeau", explicacion: "El nervio pasa por el espacio cuadrangular", icono: "🔄" },
      { estructura: "Músculo Deltoides", explicacion: "Inervación exclusiva del deltoides", icono: "💪" },
      { estructura: "Zona Sensitiva", explicacion: "Sensibilidad en la región lateral del hombro", icono: "👋" }
    ],
    explicacionMuscular: {
      "Deltoides": "Único músculo afectado - pérdida completa de abducción del hombro más allá de 15°"
    },
    correlacionClinica: "Lesión típica en luxaciones de hombro o fracturas del cuello quirúrgico del húmero.",
    signosCaracteristicos: [
      "Imposibilidad de abducción del hombro",
      "Atrofia del deltoides",
      "Sensibilidad alterada en región lateral del hombro",
      "Reflejos normales"
    ],
    diagnosticoDiferencial: [
      "Lesión del tronco superior (más extenso)",
      "Lesión radicular C5 (incluye otros músculos)",
      "Ruptura del manguito rotador (supraespinoso preservado)"
    ]
  }
  // Agregar más diagnósticos según sea necesario...
};

// Casos clínicos predefinidos para demostración y enseñanza
export interface CasoClinico {
  nombre: string;
  descripcion: string;
  historia: string;
  musculos: { [musculo: string]: number };
  sintomas: string[];
  sensibilidad: string[];
  reflejos: {
    bicipital: 'normal' | 'disminuido' | 'ausente';
    braquiorradial: 'normal' | 'disminuido' | 'ausente';
    tricipital: 'normal' | 'disminuido' | 'ausente';
  };
  informacionAdicional: {
    mecanismo: string;
    evolucion: string;
    tipoPlexo: 'normal' | 'prefijado' | 'postfijado';
  };
  diagnosticoEsperado: string;
  puntosEnsenanza: string[];
}

export const CASOS_CLINICOS_DEMO: { [nombre: string]: CasoClinico } = {
  "Erb-Duchenne Clásico": {
    nombre: "Erb-Duchenne Clásico",
    descripcion: "Accidente de motocicleta con caída sobre hombro derecho",
    historia: "Paciente de 25 años que sufrió accidente de motocicleta. Impacto directo sobre hombro derecho con tracción forzada del cuello hacia el lado contrario. Presenta brazo colgante en posición de 'propina'.",
    musculos: {
      "Deltoides": 0,
      "Supraespinoso": 1,
      "Infraespinoso": 1,
      "Bíceps Braquial": 2,
      "Braquiorradial": 3,
      "Tríceps Braquial": 5,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: ["Dolor Neurítico"],
    sensibilidad: ["Zona Lateral Hombro (Axilar)", "Zona Lateral Antebrazo (Musculocutáneo)", "Dermatoma C5", "Dermatoma C6"],
    reflejos: { bicipital: "ausente", braquiorradial: "disminuido", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Tracción lateral del cuello",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne",
    puntosEnsenanza: [
      "Mecanismo típico: tracción del cuello con hombro fijo",
      "Posición característica de 'propina'",
      "Preservación de función de la mano",
      "Reflejos C5-C6 afectados, C7-C8 normales"
    ]
  },
  
  "Klumpke Clásico": {
    nombre: "Klumpke Clásico",
    descripcion: "Tracción forzada del brazo hacia arriba durante parto distócico",
    historia: "Recién nacido con parto distócico. Tracción excesiva del brazo durante el parto. Presenta mano en garra y posible síndrome de Horner.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Extensor de los Dedos": 5,
      "Flexor Carpi Ulnaris": 2,
      "Interóseos Dorsales": 0,
      "Interóseos Palmares": 0,
      "Lumbricales 3 y 4": 1,
      "Aductor del Pulgar": 1,
      "Abductor del Meñique": 1
    },
    sintomas: ["Parestesias", "Signo de Horner"],
    sensibilidad: ["Mano Medial (Cubital)", "Zona Medial Antebrazo (Cut. Med. Antebrazo)", "Dermatoma C8", "Dermatoma T1"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Tracción del brazo hacia arriba",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Lesión de Tronco Inferior (C8-T1) - Klumpke",
    puntosEnsenanza: [
      "Afecta principalmente la función intrínseca de la mano",
      "Síndrome de Horner sugiere lesión preganglionar",
      "Preservación de función proximal del brazo",
      "Mano en garra por parálisis de interóseos"
    ]
  },
  
  "Lesión Axilar Aislada": {
    nombre: "Lesión Axilar Aislada",
    descripcion: "Luxación anterior de hombro con lesión del nervio axilar",
    historia: "Paciente de 30 años con luxación anterior de hombro tras caída. Después de la reducción presenta imposibilidad para abducir el hombro y pérdida sensitiva en la región deltoidea.",
    musculos: {
      "Deltoides": 0,
      "Supraespinoso": 5,
      "Infraespinoso": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Braquiorradial": 5,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: [],
    sensibilidad: ["Zona Lateral Hombro (Axilar)"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Luxación de hombro",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Axilar",
    puntosEnsenanza: [
      "Lesión mononeuropática pura",
      "Solo afecta el deltoides",
      "Pérdida sensitiva específica en región deltoidea",
      "Reflejos completamente normales"
    ]
  },
  
  "Muñeca Caída": {
    nombre: "Muñeca Caída",
    descripcion: "Fractura de húmero con lesión del nervio radial en surco radial",
    historia: "Paciente de 45 años con fractura de tercio medio de húmero tras caída. Presenta imposibilidad para extender la muñeca y los dedos, con muñeca caída característica.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 2,
      "Braquiorradial": 3,
      "Extensor Carpi Radialis": 0,
      "Extensor de los Dedos": 1,
      "Extensor Carpi Ulnaris": 0,
      "Flexor Carpi Radialis": 5,
      "Interóseos Dorsales": 5
    },
    sintomas: [],
    sensibilidad: ["Zona Posterior Brazo/Antebrazo (Radial)"],
    reflejos: { bicipital: "normal", braquiorradial: "disminuido", tricipital: "disminuido" },
    informacionAdicional: {
      mecanismo: "Fractura de húmero",
      evolucion: "Aguda (< 1 semana)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Radial (Proximal)",
    puntosEnsenanza: [
      "Lesión del radial en surco radial del húmero",
      "Muñeca caída característica",
      "Tríceps afectado (lesión proximal)",
      "Preservación de función de flexores"
    ]
  },

  "Síndrome del Túnel Carpiano": {
    nombre: "Síndrome del Túnel Carpiano",
    descripcion: "Compresión del nervio mediano a nivel del túnel carpiano",
    historia: "Paciente de 50 años con parestesias nocturnas en dedos pulgar, índice y medio. Trabaja con computadora. Presenta signo de Tinel y Phalen positivos.",
    musculos: {
      "Deltoides": 5,
      "Bíceps Braquial": 5,
      "Tríceps Braquial": 5,
      "Flexor Carpi Radialis": 5,
      "Pronador Redondo": 5,
      "Flexor Largo del Pulgar": 5,
      "Flexor Profundo de los Dedos": 5,
      "Flexor Corto del Pulgar": 3,
      "Interóseos Dorsales": 5
    },
    sintomas: ["Parestesias"],
    sensibilidad: ["Mano Lateral (Mediano)"],
    reflejos: { bicipital: "normal", braquiorradial: "normal", tricipital: "normal" },
    informacionAdicional: {
      mecanismo: "Compresión crónica",
      evolucion: "Crónica (> 6 meses)",
      tipoPlexo: "normal"
    },
    diagnosticoEsperado: "Neuropatía del Nervio Mediano (Proximal)",
    puntosEnsenanza: [
      "Lesión distal del mediano",
      "Afecta solo músculos tenares",
      "Preservación de flexores del antebrazo",
      "Parestesias nocturnas características"
    ]
  }
};

// Mapeo de diagnósticos a estructuras anatómicas para la visualización SVG
export const DIAGNOSTIC_SVG_MAPPING: { [diagnostico: string]: string[] } = {
  "Lesión de Raíz C5": ["c5-path"],
  "Lesión de Raíz C6": ["c6-path"],
  "Lesión de Raíz C7": ["c7-path"],
  "Lesión de Raíz C8": ["c8-path"],
  "Lesión de Raíz T1": ["t1-path"],
  
  "Lesión de Tronco Superior (C5-C6) - Erb-Duchenne": ["c5-path", "c6-path", "superior-trunk", "lateral-cord", "posterior-cord", "axillary", "musculocutaneous", "suprascapular"],
  "Lesión de Tronco Inferior (C8-T1) - Klumpke": ["c8-path", "t1-path", "inferior-trunk", "medial-cord", "ulnar", "median"],
  
  "Lesión de Fascículo Lateral": ["lateral-cord", "musculocutaneous", "median"],
  "Lesión de Fascículo Medial": ["medial-cord", "ulnar", "median"],
  "Lesión de Fascículo Posterior": ["posterior-cord", "axillary", "radial"],
  
  "Neuropatía del Nervio Axilar": ["axillary"],
  "Neuropatía del Nervio Musculocutáneo": ["musculocutaneous"],
  "Neuropatía del Nervio Radial (Proximal)": ["radial"],
  "Neuropatía del Nervio Mediano (Proximal)": ["median"],
  "Neuropatía del Nervio Ulnar (Proximal)": ["ulnar"],
};
