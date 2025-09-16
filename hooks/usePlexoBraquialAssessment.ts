import { useState, useMemo } from 'react';
import { 
  CONFIG, 
  CONFIG_CONTEXTUAL,
  AJUSTES_TEMPORALES,
  LESIONES, 
  INERVACION_DUAL,
  CASOS_CLINICOS_DEMO,
  MUSCULOS_EVALUACION,
  type DatosEvaluacion, 
  type ResultadoDiagnostico,
  type Lesion,
  type HallazgoInervacionDual,
  type CasoClinico,
  type SeveridadLesion,
  type AnalisisTemporal,
  type IndicadoresConfianza
} from '@/data/plexoBraquial';

export function usePlexoBraquialAssessment() {
  // Inicializar todos los músculos con MRC 5 (normal)
  const initialMuscleStrengths = MUSCULOS_EVALUACION.reduce((acc, musculo) => {
    acc[musculo] = 5;
    return acc;
  }, {} as { [musculo: string]: number });

  const [datosEvaluacion, setDatosEvaluacion] = useState<DatosEvaluacion>({
    fuerzasMuscular: initialMuscleStrengths,
    sintomasSeleccionados: [],
    areasSeleccionadas: [],
    reflejos: {
      bicipital: 'normal',
      braquiorradial: 'normal',
      tricipital: 'normal'
    },
    informacionAdicional: {
      mecanismo: '',
      evolucion: '',
      tipoPlexo: 'normal'
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [calculoRealizado, setCalculoRealizado] = useState(false);
  const [hallazgosInervacionDual, setHallazgosInervacionDual] = useState<HallazgoInervacionDual[]>([]);

  // Función para ajustar lesiones según el tipo de plexo
  const ajustarLesionPorTipoPlexo = (lesion: Lesion, tipoPlexo: string): Lesion => {
    const lesionAjustada = { ...lesion };
    
    if (tipoPlexo === 'prefijado') {
      if (lesion.nombre.includes('C5') || lesion.nombre.includes('Tronco Superior')) {
        lesionAjustada.musculosClave = [
          ...lesionAjustada.musculosClave,
          { nombre: "Trapecio Superior", peso: 0.8 },
          { nombre: "Elevador Escápula", peso: 1.0 }
        ];
        lesionAjustada.areasSensibilidad = [
          ...lesionAjustada.areasSensibilidad,
          "Dermatoma C4"
        ];
      }
    } else if (tipoPlexo === 'postfijado') {
      if (lesion.nombre.includes('T1') || lesion.nombre.includes('Tronco Inferior')) {
        lesionAjustada.musculosClave = [
          ...lesionAjustada.musculosClave,
          { nombre: "Interóseos Dorsales", peso: 1.2 },
          { nombre: "Interóseos Palmares", peso: 1.2 }
        ];
        lesionAjustada.areasSensibilidad = [
          ...lesionAjustada.areasSensibilidad,
          "Dermatoma T2"
        ];
      }
    }
    
    return lesionAjustada;
  };

  // Función para analizar inervación dual en músculos clave
  const analizarInervacionDual = (fuerzasMuscular: { [musculo: string]: number }): HallazgoInervacionDual[] => {
    const hallazgos: HallazgoInervacionDual[] = [];
    
    for (const [musculo, info] of Object.entries(INERVACION_DUAL)) {
      const mrc = fuerzasMuscular[musculo];
      if (mrc !== undefined && mrc < 5) {
        let relevancia: 'Alta' | 'Moderada' | 'Baja' = 'Baja';
        let interpretacion = '';

        if (mrc === 0) {
          relevancia = 'Alta';
          interpretacion = `Parálisis completa sugiere lesión de ambos nervios (${info.principal} y ${info.secundario})`;
        } else if (mrc <= 2) {
          relevancia = 'Alta';
          interpretacion = `Debilidad severa: posible lesión predominante del ${info.principal} con preservación parcial del ${info.secundario}`;
        } else if (mrc <= 3) {
          relevancia = 'Moderada';
          interpretacion = `Debilidad moderada: ${info.implicacion}`;
        } else {
          relevancia = 'Baja';
          interpretacion = `Debilidad leve compatible con inervación dual preservada`;
        }

        hallazgos.push({
          musculo,
          mrc,
          info,
          relevancia,
          interpretacion
        });
      }
    }
    
    return hallazgos.sort((a, b) => {
      const relevanciaOrder = { 'Alta': 3, 'Moderada': 2, 'Baja': 1 };
      return relevanciaOrder[b.relevancia] - relevanciaOrder[a.relevancia];
    });
  };

  // Función para calcular métricas de confianza
  const calcularIndicadoresConfianza = (
    resultado: ResultadoDiagnostico,
    datosEvaluacion: DatosEvaluacion
  ): IndicadoresConfianza => {
    const { fuerzasMuscular, sintomasSeleccionados, areasSeleccionadas, informacionAdicional } = datosEvaluacion;
    
    let nivelConfianza = resultado.normalizedScore * 100;
    const factoresPositivos: string[] = [];
    const factoresNegativos: string[] = [];
    const recomendacionesAdicionales: string[] = [];
    let necesidadEstudios = false;
    const estudiosRecomendados: string[] = [];

    // Evaluar factores que aumentan la confianza
    if (resultado.detalles.musculos.filter(m => m.esperado && m.mrc <= 2).length >= 2) {
      factoresPositivos.push("Múltiples músculos con debilidad severa");
      nivelConfianza += 5;
    }

    if (resultado.detalles.reflejos.filter(r => r.match).length >= 2) {
      factoresPositivos.push("Patrón de reflejos consistente");
      nivelConfianza += 10;
    }

    if (resultado.detalles.sintomas.includes("Signo de Horner") && 
        resultado.nombreLesion.includes("T1")) {
      factoresPositivos.push("Signo de Horner presente en lesión T1");
      nivelConfianza += 15;
    }

    if (informacionAdicional.contextoClinico && 
        resultado.contextoClinico?.mecanismoFrecuente.some(m => 
          informacionAdicional.mecanismo.toLowerCase().includes(m.toLowerCase().split(' ')[0]))) {
      factoresPositivos.push("Mecanismo compatible con el diagnóstico");
      nivelConfianza += 10;
    }

    // Evaluar factores que disminuyen la confianza
    if (resultado.detalles.musculos.filter(m => !m.esperado && m.mrc === 5).length >= 3) {
      factoresNegativos.push("Músculos esperados normales");
      nivelConfianza -= 15;
    }

    if (resultado.detalles.sensibilidad.length === 0 && resultado.normalizedScore < 0.6) {
      factoresNegativos.push("Ausencia de alteraciones sensoriales");
      nivelConfianza -= 10;
    }

    if (informacionAdicional.faseEvolutiva === 'hiperaguda' && 
        resultado.detalles.musculos.filter(m => m.mrc < 5).length >= 5) {
      factoresNegativos.push("Debilidad extensa muy temprana (puede ser funcional)");
      nivelConfianza -= 20;
    }

    // Recomendaciones adicionales
    if (nivelConfianza < 60) {
      recomendacionesAdicionales.push("Considerar diagnósticos diferenciales");
      necesidadEstudios = true;
    }

    if (resultado.categoria === 'traumatica' && informacionAdicional.faseEvolutiva === 'aguda') {
      recomendacionesAdicionales.push("Evaluación urgente para cirugía reconstructiva");
      estudiosRecomendados.push("RMN de plexo braquial", "Electromiografía");
      necesidadEstudios = true;
    }

    if (resultado.categoria === 'obstetrica') {
      recomendacionesAdicionales.push("Seguimiento evolutivo estrecho");
      if (informacionAdicional.tiempoEvolucion && informacionAdicional.tiempoEvolucion > 90) {
        estudiosRecomendados.push("RMN de plexo braquial", "Evaluación quirúrgica");
        necesidadEstudios = true;
      }
    }

    if (resultado.severidadEsperada?.grado && resultado.severidadEsperada.grado >= 4) {
      recomendacionesAdicionales.push("Pronóstico reservado - considerar cirugía reconstructiva");
      estudiosRecomendados.push("TC de tórax", "RMN de plexo braquial", "Electromiografía seriada");
      necesidadEstudios = true;
    }

    // Normalizar nivel de confianza
    nivelConfianza = Math.max(0, Math.min(100, nivelConfianza));

    return {
      nivelConfianza: Math.round(nivelConfianza),
      factoresPositivos,
      factoresNegativos,
      recomendacionesAdicionales,
      necesidadEstudios,
      estudiosRecomendados: estudiosRecomendados.length > 0 ? estudiosRecomendados : undefined
    };
  };

  // Función para análisis temporal
  const realizarAnalisisTemporal = (
    datosEvaluacion: DatosEvaluacion
  ): AnalisisTemporal => {
    const { informacionAdicional } = datosEvaluacion;
    
    let faseEvolutiva = informacionAdicional.faseEvolutiva || 'aguda';
    
    // Auto-determinar fase si no está especificada
    if (!informacionAdicional.faseEvolutiva && informacionAdicional.tiempoEvolucion) {
      const dias = informacionAdicional.tiempoEvolucion;
      if (dias < 1) faseEvolutiva = 'hiperaguda';
      else if (dias <= 7) faseEvolutiva = 'aguda';
      else if (dias <= 84) faseEvolutiva = 'subaguda'; // 12 semanas
      else faseEvolutiva = 'cronica';
    }

    const factoresPronostico: string[] = [];

    // Factores pronósticos según fase
    switch (faseEvolutiva) {
      case 'hiperaguda':
        factoresPronostico.push(
          "Edema neural puede simular lesión severa",
          "Evaluación funcional puede ser poco confiable",
          "Potencial de recuperación espontánea alto"
        );
        break;
      case 'aguda':
        factoresPronostico.push(
          "Patrón de lesión se está definiendo",
          "Ventana crítica para intervenciones",
          "Estudios electrofisiológicos aún no confiables"
        );
        break;
      case 'subaguda':
        factoresPronostico.push(
          "Patrón de recuperación establecido",
          "Momento óptimo para estudios electrofisiológicos",
          "Decisión quirúrgica si no hay recuperación"
        );
        break;
      case 'cronica':
        factoresPronostico.push(
          "Recuperación espontánea improbable",
          "Considerar procedimientos reconstructivos",
          "Enfoque en maximizar función residual"
        );
        break;
    }

    // Factores adicionales según patrón de evolución
    if (informacionAdicional.patronEvolucion === 'deteriorando') {
      factoresPronostico.push("Deterioro progresivo - descartar causas secundarias");
    } else if (informacionAdicional.patronEvolucion === 'mejorando') {
      factoresPronostico.push("Evolución favorable - continuar tratamiento conservador");
    }

    return {
      faseEvolutiva,
      tiempoEvolucion: informacionAdicional.tiempoEvolucion,
      patronEvolucion: informacionAdicional.patronEvolucion,
      factoresPronostico
    };
  };

  // Función para obtener configuración adaptativa
  const obtenerConfiguracionAdaptativa = (datosEvaluacion: DatosEvaluacion) => {
    const contexto = datosEvaluacion.informacionAdicional.contextoClinico;
    const fase = datosEvaluacion.informacionAdicional.faseEvolutiva;
    
    // Configuración base
    let config = contexto && CONFIG_CONTEXTUAL[contexto] ? CONFIG_CONTEXTUAL[contexto] : CONFIG;
    
    // Ajustes temporales
    if (fase && AJUSTES_TEMPORALES[fase]) {
      const ajuste = AJUSTES_TEMPORALES[fase];
      config = {
        ...config,
        PESO_MUSCULOS: config.PESO_MUSCULOS * ajuste.multiplicadorMuscular,
        PESO_SENSIBILIDAD: config.PESO_SENSIBILIDAD * ajuste.multiplicadorSensorial,
        UMBRAL_COINCIDENCIA_GENERAL: config.UMBRAL_COINCIDENCIA_GENERAL + ajuste.umbralAjuste,
        UMBRAL_MINIMO_EXCLUSIVO: config.UMBRAL_MINIMO_EXCLUSIVO + ajuste.umbralAjuste
      };
    }
    
    return config;
  };

  // Función principal de cálculo diagnóstico
  const calcularDiagnostico = useMemo(() => {
    if (!calculoRealizado) return [];

    const { fuerzasMuscular, sintomasSeleccionados, areasSeleccionadas, reflejos, informacionAdicional } = datosEvaluacion;
    
    // Obtener configuración adaptativa
    const configAdaptativa = obtenerConfiguracionAdaptativa(datosEvaluacion);
    
    // Realizar análisis temporal
    const analisisTemporal = realizarAnalisisTemporal(datosEvaluacion);
    
    const resultadosDetallados: ResultadoDiagnostico[] = LESIONES.map(lesion => {
      // Ajustar lesión por tipo de plexo
      const lesionAjustada = ajustarLesionPorTipoPlexo(lesion, informacionAdicional.tipoPlexo);

      // 1. Calcular Score de Músculos
      let muscleScore = 0;
      let totalMuscleWeight = 0;
      const muscleMatches: { nombre: string; mrc: number; esperado: boolean; peso: number }[] = [];
      let penalizacionMusculoNormal = 1.0;

      lesionAjustada.musculosClave.forEach(musculoClave => {
        const mrc = fuerzasMuscular[musculoClave.nombre];
        if (mrc !== undefined) {
          totalMuscleWeight += musculoClave.peso;
          
          // Para esta lesión, esperamos que este músculo esté débil
          // Si está débil (mrc < 5), es un hallazgo positivo
          // Si está normal (mrc = 5), es un hallazgo negativo para esta lesión
          const estaDebil = mrc < 5;
          
          if (estaDebil) {
            // Músculo débil que coincide con el patrón esperado de la lesión
            const contribucion = (5 - mrc) / 5; // 0-1, donde 1 es parálisis completa
            muscleScore += contribucion * musculoClave.peso;
            muscleMatches.push({ 
              nombre: musculoClave.nombre, 
              mrc, 
              esperado: true, // Esperábamos debilidad y la encontramos
              peso: musculoClave.peso 
            });
          } else {
            // Músculo normal cuando esperábamos debilidad - reduce la probabilidad de esta lesión
            penalizacionMusculoNormal *= configAdaptativa.PENALIZACION_MUSCULO_NORMAL;
            muscleMatches.push({ 
              nombre: musculoClave.nombre, 
              mrc, 
              esperado: false, // Esperábamos debilidad pero está normal
              peso: musculoClave.peso 
            });
          }
        }
      });

      // Verificar músculos débiles que NO están en la lista esperada de esta lesión
      // Esto puede ser evidencia en contra de la lesión
      const musculosEsperadosNombres = lesionAjustada.musculosClave.map(m => m.nombre);
      let penalizacionMusculosInesperados = 1.0;
      const musculosInesperadamenteDebiles: { nombre: string; mrc: number }[] = [];
      
      Object.keys(fuerzasMuscular).forEach(musculoNombre => {
        const mrc = fuerzasMuscular[musculoNombre];
        if (mrc < 5 && !musculosEsperadosNombres.includes(musculoNombre)) {
          // Músculo débil que NO esperamos en esta lesión - penalización
          penalizacionMusculosInesperados *= 0.9; // Penalización por músculo inesperadamente débil
          musculosInesperadamenteDebiles.push({ nombre: musculoNombre, mrc });
        }
      });

      const normalizedMuscleScore = totalMuscleWeight > 0 ? 
        (muscleScore / totalMuscleWeight) * penalizacionMusculoNormal * penalizacionMusculosInesperados : 0;

      // 2. Calcular Score de Sensibilidad
      let sensitivityScore = 0;
      const sensitivityMatches: string[] = [];
      const totalSensitivityAreas = lesionAjustada.areasSensibilidad.length;
      
      if (totalSensitivityAreas > 0) {
        lesionAjustada.areasSensibilidad.forEach(area => {
          if (areasSeleccionadas.includes(area)) {
            sensitivityScore += 1;
            sensitivityMatches.push(area);
          }
        });
        sensitivityScore /= totalSensitivityAreas;
      }

      // 3. Calcular Score de Síntomas
      let symptomScore = 0;
      const symptomMatches: string[] = [];
      const totalSymptoms = lesionAjustada.sintomasClave.length;
      let hornerPresentAndExpected = false;
      
      if (totalSymptoms > 0) {
        lesionAjustada.sintomasClave.forEach(sintoma => {
          if (sintomasSeleccionados.includes(sintoma)) {
            symptomScore += 1;
            symptomMatches.push(sintoma);
            if (sintoma === "Signo de Horner") {
              hornerPresentAndExpected = true;
            }
          }
        });
        symptomScore /= totalSymptoms;
      }

      // 4. Calcular Score de Reflejos
      let reflexScore = 0;
      const reflexMatches: { nombre: string; esperado: string; encontrado: string; match: boolean }[] = [];
      const expectedReflexes = lesionAjustada.reflejosClave;
      const numReflexesDefined = Object.keys(expectedReflexes).length;
      let reflexMatchCount = 0;
      
      if (numReflexesDefined > 0) {
        for (const reflex in expectedReflexes) {
          const reflexKey = reflex as keyof typeof reflejos;
          const esperado = expectedReflexes[reflexKey];
          const encontrado = reflejos[reflexKey];
          const match = encontrado === esperado;
          
          if (match) {
            reflexMatchCount++;
          }
          
          reflexMatches.push({ 
            nombre: reflex, 
            esperado, 
            encontrado, 
            match 
          });
        }
        reflexScore = reflexMatchCount / numReflexesDefined;
      }

      // 5. Combinar Scores Ponderados
      let finalScore = (normalizedMuscleScore * configAdaptativa.PESO_MUSCULOS) +
                       (sensitivityScore * configAdaptativa.PESO_SENSIBILIDAD) +
                       (symptomScore * configAdaptativa.PESO_SINTOMAS) +
                       (reflexScore * configAdaptativa.PESO_REFLEJOS);

      // Añadir bonus si Horner está presente y esperado
      if (hornerPresentAndExpected) {
        finalScore += configAdaptativa.PESO_HORNER;
      }

      // Normalizar el score final
      const maxPossibleScore = configAdaptativa.PESO_MUSCULOS + configAdaptativa.PESO_SENSIBILIDAD + 
                               configAdaptativa.PESO_SINTOMAS + configAdaptativa.PESO_REFLEJOS + 
                               (lesion.sintomasClave.includes("Signo de Horner") ? configAdaptativa.PESO_HORNER : 0);
      const normalizedFinalScore = maxPossibleScore > 0 ? finalScore / maxPossibleScore : 0;

      // 6. Aplicar Umbrales
      const umbralAplicable = lesionAjustada.exclusivos
        ? (lesionAjustada.umbralMinimo || configAdaptativa.UMBRAL_MINIMO_EXCLUSIVO)
        : configAdaptativa.UMBRAL_COINCIDENCIA_GENERAL;

      return {
        nombreLesion: lesionAjustada.nombre,
        score: finalScore,
        normalizedScore: normalizedFinalScore,
        umbral: umbralAplicable,
        categoria: lesionAjustada.categoria,
        severidadEsperada: lesionAjustada.severidadEsperada,
        contextoClinico: lesionAjustada.contextoClinico,
        analisisTemporal,
        detalles: {
          musculos: muscleMatches,
          musculosInesperados: musculosInesperadamenteDebiles.length > 0 ? musculosInesperadamenteDebiles : undefined,
          sensibilidad: sensitivityMatches,
          sintomas: symptomMatches,
          reflejos: reflexMatches,
          nerviosPerifericos: lesionAjustada.nerviosPerifericos || []
        }
      };
    });

    // Filtrar resultados que no alcanzan su umbral mínimo
    const resultadosFiltrados = resultadosDetallados.filter(r => r.normalizedScore >= r.umbral);

    // Aplicar penalizaciones por contexto clínico
    const resultadosConContexto = resultadosFiltrados.map(resultado => {
      let scoreFinal = resultado.normalizedScore;
      
      // Penalizar lesiones contextuales si no hay información de contexto
      const esLesionContextual = ['iatrogena', 'obstetrica', 'traumatica'].includes(resultado.categoria);
      const tieneContextoClinico = informacionAdicional.contextoClinico;
      
      if (esLesionContextual && !tieneContextoClinico) {
        // Penalización fuerte para lesiones contextuales sin contexto
        scoreFinal *= 0.3;
      } else if (esLesionContextual && tieneContextoClinico) {
        // Verificar si el contexto coincide con la categoría
        const contextosCompatibles: { [key: string]: string[] } = {
          'iatrogena': ['iatrogeno'],
          'obstetrica': ['obstetrico'],
          'traumatica': ['traumatico']
        };
        
        const esCompatible = contextosCompatibles[resultado.categoria]?.includes(tieneContextoClinico);
        if (!esCompatible) {
          // Penalización por contexto incompatible
          scoreFinal *= 0.2;
        }
      }
      
      // Bonus para lesiones topográficas (son el objetivo principal)
      const esLesionTopografica = ['radicular', 'tronco', 'fasciculo', 'nervio_periferico'].includes(resultado.categoria);
      if (esLesionTopografica) {
        scoreFinal *= 1.2; // Bonus del 20%
      }
      
      return {
        ...resultado,
        normalizedScore: Math.min(1.0, scoreFinal) // No exceder 100%
      };
    });

    // Calcular métricas de confianza para cada resultado
    const resultadosConIndicadores = resultadosConContexto.map(resultado => ({
      ...resultado,
      indicadoresConfianza: calcularIndicadoresConfianza(resultado, datosEvaluacion)
    }));

    // Ordenar por score normalizado descendente, luego por prioridad topográfica
    return resultadosConIndicadores.sort((a, b) => {
      // Primero por score
      if (b.normalizedScore !== a.normalizedScore) {
        return b.normalizedScore - a.normalizedScore;
      }
      
      // En caso de empate, priorizar lesiones topográficas
      const prioridadTopografica: { [key: string]: number } = {
        'radicular': 4,
        'tronco': 3,
        'fasciculo': 2,
        'nervio_periferico': 1,
        'combinada': 0,
        'iatrogena': -1,
        'obstetrica': -1,
        'traumatica': -1
      };
      
      const prioridadA = prioridadTopografica[a.categoria] || 0;
      const prioridadB = prioridadTopografica[b.categoria] || 0;
      
      return prioridadB - prioridadA;
    });
  }, [datosEvaluacion, calculoRealizado]);

  // Funciones de actualización
  const updateFuerzaMuscular = (musculo: string, fuerza: number) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      fuerzasMuscular: {
        ...prev.fuerzasMuscular,
        [musculo]: fuerza
      }
    }));
    setCalculoRealizado(false);
  };

  const updateSintomas = (sintomas: string[]) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      sintomasSeleccionados: sintomas
    }));
    setCalculoRealizado(false);
  };

  const updateAreas = (areas: string[]) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      areasSeleccionadas: areas
    }));
    setCalculoRealizado(false);
  };

  const updateReflejo = (reflejo: keyof typeof datosEvaluacion.reflejos, valor: 'normal' | 'disminuido' | 'ausente') => {
    setDatosEvaluacion(prev => ({
      ...prev,
      reflejos: {
        ...prev.reflejos,
        [reflejo]: valor
      }
    }));
    setCalculoRealizado(false);
  };

  const updateInformacionAdicional = (campo: keyof typeof datosEvaluacion.informacionAdicional, valor: string | number) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      informacionAdicional: {
        ...prev.informacionAdicional,
        [campo]: valor
      }
    }));
    setCalculoRealizado(false);
  };

  const updateContextoClinico = (contexto: 'traumatico' | 'obstetrico' | 'iatrogeno' | 'idiopatico') => {
    setDatosEvaluacion(prev => ({
      ...prev,
      informacionAdicional: {
        ...prev.informacionAdicional,
        contextoClinico: contexto
      }
    }));
    setCalculoRealizado(false);
  };

  const updateTiempoEvolucion = (dias: number) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      informacionAdicional: {
        ...prev.informacionAdicional,
        tiempoEvolucion: dias
      }
    }));
    setCalculoRealizado(false);
  };

  const updateFaseEvolutiva = (fase: 'hiperaguda' | 'aguda' | 'subaguda' | 'cronica') => {
    setDatosEvaluacion(prev => ({
      ...prev,
      informacionAdicional: {
        ...prev.informacionAdicional,
        faseEvolutiva: fase
      }
    }));
    setCalculoRealizado(false);
  };

  const updatePatronEvolucion = (patron: 'mejorando' | 'estable' | 'deteriorando') => {
    setDatosEvaluacion(prev => ({
      ...prev,
      informacionAdicional: {
        ...prev.informacionAdicional,
        patronEvolucion: patron
      }
    }));
    setCalculoRealizado(false);
  };

  const realizarCalculo = () => {
    // Realizar análisis de inervación dual
    const hallazgos = analizarInervacionDual(datosEvaluacion.fuerzasMuscular);
    setHallazgosInervacionDual(hallazgos);
    
    setCalculoRealizado(true);
  };

  const reiniciarCalculadora = () => {
    setDatosEvaluacion({
      fuerzasMuscular: initialMuscleStrengths,
      sintomasSeleccionados: [],
      areasSeleccionadas: [],
      reflejos: {
        bicipital: 'normal',
        braquiorradial: 'normal',
        tricipital: 'normal'
      },
      informacionAdicional: {
        mecanismo: '',
        evolucion: '',
        tipoPlexo: 'normal',
        contextoClinico: undefined,
        tiempoEvolucion: undefined,
        faseEvolutiva: undefined,
        patronEvolucion: undefined
      }
    });
    setCurrentStep(1);
    setCalculoRealizado(false);
    setHallazgosInervacionDual([]);
  };

  // Validación de completitud por paso
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return Object.keys(datosEvaluacion.fuerzasMuscular).length > 0;
      case 2:
        return true; // Los síntomas son opcionales
      case 3:
        return true; // Las áreas de sensibilidad son opcionales
      case 4:
        return true; // Los reflejos tienen valores por defecto
      case 5:
        return true; // La información adicional es opcional
      default:
        return false;
    }
  };

  // Validaciones más específicas
  const getStepValidationMessage = (step: number): string | null => {
    switch (step) {
      case 1:
        const musculosEvaluados = Object.keys(datosEvaluacion.fuerzasMuscular).length;
        if (musculosEvaluados === 0) {
          return "Debe evaluar al menos un músculo para continuar";
        }
        if (musculosEvaluados < 3) {
          return "Recomendamos evaluar al menos 3 músculos para un diagnóstico más preciso";
        }
        return null;
      case 2:
        return null; // Síntomas opcionales
      case 3:
        return null; // Sensibilidad opcional
      case 4:
        return null; // Reflejos tienen valores por defecto
      case 5:
        return null; // Información adicional opcional
      default:
        return null;
    }
  };

  // Validación para el cálculo final
  const getCalculationValidationMessage = (): string | null => {
    const musculosAfectados = Object.values(datosEvaluacion.fuerzasMuscular).filter(mrc => mrc < 5).length;
    
    if (musculosAfectados === 0) {
      return "No se encontraron músculos afectados. ¿Está seguro de que todos los músculos están normales (MRC 5)?";
    }
    
    if (musculosAfectados < 3) {
      return "Solo se encontraron pocos músculos afectados. Considere revisar la evaluación para mayor precisión diagnóstica";
    }
    
    return null;
  };

  // Obtener sugerencias por paso
  const getStepSuggestions = (step: number): string[] => {
    switch (step) {
      case 1:
        const musculosEvaluados = Object.keys(datosEvaluacion.fuerzasMuscular);
        const suggestions = [];
        
        if (musculosEvaluados.length === 0) {
          suggestions.push("Comience evaluando músculos proximales como Deltoides y Bíceps");
        }
        
        if (!musculosEvaluados.includes("Deltoides") && !musculosEvaluados.includes("Bíceps Braquial")) {
          suggestions.push("Evalúe músculos proximales para localizar el nivel de la lesión");
        }
        
        if (!musculosEvaluados.includes("Interóseos Dorsales") && musculosEvaluados.length > 3) {
          suggestions.push("Evalúe músculos intrínsecos de la mano para descartar lesiones distales");
        }
        
        return suggestions;
      
      case 2:
        if (datosEvaluacion.sintomasSeleccionados.length === 0) {
          return ["Los síntomas ayudan a diferenciar entre tipos de lesión", "El dolor neurítico sugiere lesión radicular"];
        }
        return [];
      
      case 3:
        if (datosEvaluacion.areasSeleccionadas.length === 0) {
          return ["La evaluación sensitiva ayuda a localizar la lesión", "Los dermatomas indican qué raíces están afectadas"];
        }
        return [];
      
      case 4:
        return ["Los reflejos ayudan a localizar el nivel de la lesión", "Reflejos ausentes sugieren lesión de la raíz correspondiente"];
      
      case 5:
        return ["El mecanismo de lesión orienta el diagnóstico", "El tipo de plexo puede modificar los hallazgos"];
      
      default:
        return [];
    }
  };

  const canCalculate = isStepComplete(1); // Al menos debe haber evaluación muscular

  // Función para cargar un caso clínico predefinido
  const cargarCasoClinico = (nombreCaso: string) => {
    const caso = CASOS_CLINICOS_DEMO[nombreCaso];
    if (!caso) return;

    setDatosEvaluacion({
      fuerzasMuscular: { ...caso.musculos },
      sintomasSeleccionados: [...caso.sintomas],
      areasSeleccionadas: [...caso.sensibilidad],
      reflejos: { ...caso.reflejos },
      informacionAdicional: { ...caso.informacionAdicional }
    });
    
    setCurrentStep(5); // Ir al último paso para revisar
    setCalculoRealizado(false);
    setHallazgosInervacionDual([]);
  };

  // Obtener lista de casos clínicos disponibles
  const casosDisponibles = Object.keys(CASOS_CLINICOS_DEMO).map(key => ({
    nombre: key,
    caso: CASOS_CLINICOS_DEMO[key]
  }));

  return {
    datosEvaluacion,
    currentStep,
    setCurrentStep,
    calculoRealizado,
    resultadosDiagnostico: calcularDiagnostico,
    hallazgosInervacionDual,
    updateFuerzaMuscular,
    updateSintomas,
    updateAreas,
    updateReflejo,
    updateInformacionAdicional,
    updateContextoClinico,
    updateTiempoEvolucion,
    updateFaseEvolutiva,
    updatePatronEvolucion,
    realizarCalculo,
    reiniciarCalculadora,
    isStepComplete,
    canCalculate,
    cargarCasoClinico,
    casosDisponibles,
    getStepValidationMessage,
    getCalculationValidationMessage,
    getStepSuggestions
  };
}
