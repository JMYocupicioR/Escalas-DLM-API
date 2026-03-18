import { 
    CONFIG, 
    CONFIG_CONTEXTUAL,
    AJUSTES_TEMPORALES,
    LESIONES, 
    INERVACION_DUAL,
    type DatosEvaluacion, 
    type ResultadoDiagnostico,
    type Lesion,
    type HallazgoInervacionDual,
    type AnalisisTemporal,
    type IndicadoresConfianza
  } from '@/data/plexoBraquial';
  
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
  export const analizarInervacionDual = (fuerzasMuscular: { [musculo: string]: number }): HallazgoInervacionDual[] => {
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
      const { informacionAdicional } = datosEvaluacion;
      
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
  export const runPlexusDiagnosis = (datosEvaluacion: DatosEvaluacion): ResultadoDiagnostico[] => {
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
            
            const estaDebil = mrc < 5;
            
            if (estaDebil) {
              const contribucion = (5 - mrc) / 5;
              muscleScore += contribucion * musculoClave.peso;
              muscleMatches.push({ 
                nombre: musculoClave.nombre, 
                mrc, 
                esperado: true,
                peso: musculoClave.peso 
              });
            } else {
              penalizacionMusculoNormal *= configAdaptativa.PENALIZACION_MUSCULO_NORMAL;
              muscleMatches.push({ 
                nombre: musculoClave.nombre, 
                mrc, 
                esperado: false,
                peso: musculoClave.peso 
              });
            }
          }
        });
  
        const musculosEsperadosNombres = lesionAjustada.musculosClave.map(m => m.nombre);
        let penalizacionMusculosInesperados = 1.0;
        const musculosInesperadamenteDebiles: { nombre: string; mrc: number }[] = [];
        
        Object.keys(fuerzasMuscular).forEach(musculoNombre => {
          const mrc = fuerzasMuscular[musculoNombre];
          if (mrc < 5 && !musculosEsperadosNombres.includes(musculoNombre)) {
            penalizacionMusculosInesperados *= 0.9;
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
  
        if (hornerPresentAndExpected) {
          finalScore += configAdaptativa.PESO_HORNER;
        }
  
        const maxPossibleScore = configAdaptativa.PESO_MUSCULOS + configAdaptativa.PESO_SENSIBILIDAD + 
                                 configAdaptativa.PESO_SINTOMAS + configAdaptativa.PESO_REFLEJOS + 
                                 (lesion.sintomasClave.includes("Signo de Horner") ? configAdaptativa.PESO_HORNER : 0);
        const normalizedFinalScore = maxPossibleScore > 0 ? finalScore / maxPossibleScore : 0;
  
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
  
      const resultadosFiltrados = resultadosDetallados.filter(r => r.normalizedScore >= r.umbral);
  
      const resultadosConContexto = resultadosFiltrados.map(resultado => {
        let scoreFinal = resultado.normalizedScore;
        
        const esLesionContextual = ['iatrogena', 'obstetrica', 'traumatica'].includes(resultado.categoria);
        const tieneContextoClinico = informacionAdicional.contextoClinico;
        
        if (esLesionContextual && !tieneContextoClinico) {
          scoreFinal *= 0.3;
        } else if (esLesionContextual && tieneContextoClinico) {
          const contextosCompatibles: { [key: string]: string[] } = {
            'iatrogena': ['iatrogeno'],
            'obstetrica': ['obstetrico'],
            'traumatica': ['traumatico']
          };
          
          const esCompatible = contextosCompatibles[resultado.categoria]?.includes(tieneContextoClinico);
          if (!esCompatible) {
            scoreFinal *= 0.2;
          }
        }
        
        const esLesionTopografica = ['radicular', 'tronco', 'fasciculo', 'nervio_periferico'].includes(resultado.categoria);
        if (esLesionTopografica) {
          scoreFinal *= 1.2;
        }
        
        return {
          ...resultado,
          normalizedScore: Math.min(1.0, scoreFinal)
        };
      });
  
      const resultadosConIndicadores = resultadosConContexto.map(resultado => ({
        ...resultado,
        indicadoresConfianza: calcularIndicadoresConfianza(resultado, datosEvaluacion)
      }));
  
      return resultadosConIndicadores.sort((a, b) => {
        if (b.normalizedScore !== a.normalizedScore) {
          return b.normalizedScore - a.normalizedScore;
        }
        
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
  };
