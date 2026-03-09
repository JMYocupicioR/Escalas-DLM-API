import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Brain, BookOpen, ChevronUp, ChevronDown } from 'lucide-react-native';
import { PlexusBrachialisSVG } from '@/components/PlexusBrachialisSVG';
import { ResultsActions } from '@/components/ResultsActions';
import { EducationalTooltip, TOOLTIP_CONTENT } from '@/components/EducationalTooltip';
import { DIAGNOSTIC_SVG_MAPPING, EXPLICACIONES_ANATOMICAS } from '@/data/plexoBraquial';

interface ResultsDisplayProps {
  styles: any;
  colors: any;
  calculoRealizado: boolean;
  resultadosDiagnostico: any[];
  hallazgosInervacionDual: any[];
  datosEvaluacion: any;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  styles,
  colors,
  calculoRealizado,
  resultadosDiagnostico,
  hallazgosInervacionDual,
  datosEvaluacion,
}) => {
  const [animatedVisualization, setAnimatedVisualization] = React.useState(false);
  const [expandedExplanation, setExpandedExplanation] = React.useState<string | null>(null);

  if (!calculoRealizado || resultadosDiagnostico.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>
          No se encontraron diagnósticos que cumplan los criterios mínimos.
        </Text>
        <Text style={styles.noResultsSubtext}>
          Revise los datos ingresados y vuelva a calcular.
        </Text>
      </View>
    );
  }

  const mejorDiagnostico = resultadosDiagnostico[0];

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Diagnósticos Diferenciales</Text>
      
      {/* Visualización Anatómica SVG */}
      <View style={styles.svgContainer}>
        <View style={styles.svgHeader}>
          <Text style={styles.svgTitle}>Visualización Anatómica</Text>
          <TouchableOpacity
            style={styles.educationalLink}
            onPress={() => router.push('/calculators/plexus-educativo')}
          >
            <Text style={styles.educationalLinkText}>🧠 Ver plexo interactivo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.animationToggle, animatedVisualization && styles.animationToggleActive]}
            onPress={() => setAnimatedVisualization(!animatedVisualization)}
          >
            <Text style={[styles.animationToggleText, animatedVisualization && styles.animationToggleTextActive]}>
              {animatedVisualization ? '⏸️ Pausar' : '▶️ Animar'}
            </Text>
          </TouchableOpacity>
        </View>
        <PlexusBrachialisSVG
          diagnosis={mejorDiagnostico.nombreLesion}
          affectedStructures={DIAGNOSTIC_SVG_MAPPING[mejorDiagnostico.nombreLesion] || []}
          animated={animatedVisualization}
        />
        <Text style={styles.svgDescription}>
          Las estructuras en rojo están afectadas en: {mejorDiagnostico.nombreLesion}
        </Text>
      </View>
      
      {resultadosDiagnostico.slice(0, 5).map((resultado, index) => (
        <View key={resultado.nombreLesion} style={[
          styles.resultCard,
          index === 0 && styles.bestResultCard
        ]}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultName, index === 0 && styles.bestResultName]}>
              {index + 1}. {resultado.nombreLesion}
            </Text>
            <Text style={[styles.resultScore, index === 0 && styles.bestResultScore]}>
              {(resultado.normalizedScore * 100).toFixed(1)}%
            </Text>
          </View>
          
          {index === 0 && (
            <View style={styles.resultDetails}>
              <Text style={styles.detailsTitle}>Hallazgos principales:</Text>
              
              {resultado.detalles.musculos.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>• Músculos afectados:</Text>
                  {resultado.detalles.musculos
                    .filter((m: any) => m.esperado)
                    .slice(0, 3)
                    .map((m: any) => (
                      <Text key={m.nombre} style={styles.detailItem}>
                        {m.nombre} (MRC: {m.mrc})
                      </Text>
                    ))}
                </View>
              )}

              {resultado.detalles.musculosInesperados && resultado.detalles.musculosInesperados.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>⚠️ Músculos débiles no esperados:</Text>
                  {resultado.detalles.musculosInesperados.slice(0, 3).map((m: any) => (
                    <Text key={m.nombre} style={[styles.detailItem, { color: colors.warning }]}>
                      {m.nombre} (MRC: {m.mrc}) - No típico de esta lesión
                    </Text>
                  ))}
                </View>
              )}
              
              {resultado.detalles.nerviosPerifericos.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>• Nervios comprometidos:</Text>
                  {resultado.detalles.nerviosPerifericos.slice(0, 3).map((nervio: string) => (
                    <Text key={nervio} style={styles.detailItem}>{nervio}</Text>
                  ))}
                </View>
              )}
              
              {resultado.detalles.sensibilidad.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>• Áreas sensitivas:</Text>
                  {resultado.detalles.sensibilidad.slice(0, 2).map((area: string) => (
                    <Text key={area} style={styles.detailItem}>{area}</Text>
                  ))}
                </View>
              )}

              {/* Métricas de Confianza */}
              {resultado.indicadoresConfianza && (
                <View style={styles.confidenceSection}>
                  <Text style={styles.detailsTitle}>Confianza del Diagnóstico:</Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceLevel,
                        { 
                          width: `${resultado.indicadoresConfianza.nivelConfianza}%`,
                          backgroundColor: resultado.indicadoresConfianza.nivelConfianza >= 70 
                            ? colors.success : resultado.indicadoresConfianza.nivelConfianza >= 50 
                            ? colors.warning : colors.error
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {resultado.indicadoresConfianza.nivelConfianza}% - {
                      resultado.indicadoresConfianza.nivelConfianza >= 70 ? 'Alta' :
                      resultado.indicadoresConfianza.nivelConfianza >= 50 ? 'Moderada' : 'Baja'
                    }
                  </Text>

                  {resultado.indicadoresConfianza.factoresPositivos.length > 0 && (
                    <View style={styles.factorsSection}>
                      <Text style={styles.factorsTitle}>✅ Factores que apoyan:</Text>
                      {resultado.indicadoresConfianza.factoresPositivos.map((factor: string, idx: number) => (
                        <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                      ))}
                    </View>
                  )}

                  {resultado.indicadoresConfianza.factoresNegativos.length > 0 && (
                    <View style={styles.factorsSection}>
                      <Text style={styles.factorsTitle}>⚠️ Factores en contra:</Text>
                      {resultado.indicadoresConfianza.factoresNegativos.map((factor: string, idx: number) => (
                        <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                      ))}
                    </View>
                  )}

                  {resultado.indicadoresConfianza.recomendacionesAdicionales.length > 0 && (
                    <View style={styles.factorsSection}>
                      <Text style={styles.factorsTitle}>💡 Recomendaciones:</Text>
                      {resultado.indicadoresConfianza.recomendacionesAdicionales.map((rec: string, idx: number) => (
                        <Text key={idx} style={styles.factorItem}>• {rec}</Text>
                      ))}
                    </View>
                  )}

                  {resultado.indicadoresConfianza.estudiosRecomendados && (
                    <View style={styles.factorsSection}>
                      <Text style={styles.factorsTitle}>🔬 Estudios recomendados:</Text>
                      {resultado.indicadoresConfianza.estudiosRecomendados.map((estudio: string, idx: number) => (
                        <Text key={idx} style={styles.factorItem}>• {estudio}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Información de Severidad */}
              {resultado.severidadEsperada && (
                <View style={styles.severitySection}>
                  <Text style={styles.detailsTitle}>Severidad Esperada:</Text>
                  <View style={styles.severityInfo}>
                    <Text style={styles.severityGrade}>
                      Grado {resultado.severidadEsperada.grado} (Sunderland)
                    </Text>
                    <Text style={styles.severityDescription}>
                      {resultado.severidadEsperada.descripcion}
                    </Text>
                    <Text style={[styles.severityPrognosis, {
                      color: resultado.severidadEsperada.pronostico === 'excelente' ? colors.success :
                             resultado.severidadEsperada.pronostico === 'bueno' ? colors.success :
                             resultado.severidadEsperada.pronostico === 'reservado' ? colors.warning :
                             colors.error
                    }]}>
                      Pronóstico: {resultado.severidadEsperada.pronostico}
                    </Text>
                    <Text style={styles.severityTime}>
                      Tiempo de recuperación: {resultado.severidadEsperada.tiempoRecuperacion}
                    </Text>
                    <Text style={styles.severityTreatment}>
                      Tratamiento: {resultado.severidadEsperada.tratamientoRecomendado}
                    </Text>
                  </View>
                </View>
              )}

              {/* Análisis Temporal */}
              {resultado.analisisTemporal && (
                <View style={styles.temporalSection}>
                  <Text style={styles.detailsTitle}>Análisis Temporal:</Text>
                  <Text style={styles.temporalPhase}>
                    Fase: {resultado.analisisTemporal.faseEvolutiva}
                    {resultado.analisisTemporal.tiempoEvolucion && 
                      ` (${resultado.analisisTemporal.tiempoEvolucion} días)`}
                  </Text>
                  {resultado.analisisTemporal.patronEvolucion && (
                    <Text style={styles.temporalPattern}>
                      Patrón: {resultado.analisisTemporal.patronEvolucion}
                    </Text>
                  )}
                  {resultado.analisisTemporal.factoresPronostico.length > 0 && (
                    <View style={styles.prognosticFactors}>
                      <Text style={styles.factorsTitle}>🕐 Factores pronósticos:</Text>
                      {resultado.analisisTemporal.factoresPronostico.map((factor: string, idx: number) => (
                        <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Contexto Clínico */}
              {resultado.contextoClinico && (
                <View style={styles.clinicalContext}>
                  <Text style={styles.detailsTitle}>Contexto Clínico:</Text>
                  <Text style={styles.contextAge}>Edad típica: {resultado.contextoClinico.edadTipica}</Text>
                  
                  <View style={styles.contextSection}>
                    <Text style={styles.factorsTitle}>🎯 Mecanismos frecuentes:</Text>
                    {resultado.contextoClinico.mecanismoFrecuente.map((mecanismo: string, idx: number) => (
                      <Text key={idx} style={styles.factorItem}>• {mecanismo}</Text>
                    ))}
                  </View>

                  <View style={styles.contextSection}>
                    <Text style={styles.factorsTitle}>⚠️ Factores de riesgo:</Text>
                    {resultado.contextoClinico.factoresRiesgo.map((factor: string, idx: number) => (
                      <Text key={idx} style={styles.factorItem}>• {factor}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Explicación Anatómica */}
          {index === 0 && EXPLICACIONES_ANATOMICAS[resultado.nombreLesion] && (
            <View style={styles.anatomicalExplanation}>
              <TouchableOpacity
                style={styles.anatomicalHeader}
                onPress={() => setExpandedExplanation(
                  expandedExplanation === resultado.nombreLesion ? null : resultado.nombreLesion
                )}
              >
                <BookOpen size={16} color={colors.primary} />
                <Text style={styles.anatomicalTitle}>Explicación Anatómica</Text>
                {expandedExplanation === resultado.nombreLesion ? (
                  <ChevronUp size={16} color={colors.primary} />
                ) : (
                  <ChevronDown size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
              
              {expandedExplanation === resultado.nombreLesion && (
                <View style={styles.anatomicalContent}>
                  <Text style={styles.anatomicalText}>
                    {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].correlacionClinica}
                  </Text>
                  
                  <Text style={styles.anatomicalSectionTitle}>Recorrido Neural:</Text>
                  {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].recorrido.map((paso: any, idx: number) => (
                    <Text key={idx} style={styles.anatomicalStep}>
                      {paso.icono} {paso.estructura}: {paso.explicacion}
                    </Text>
                  ))}
                  
                  <Text style={styles.anatomicalSectionTitle}>Signos Característicos:</Text>
                  {EXPLICACIONES_ANATOMICAS[resultado.nombreLesion].signosCaracteristicos.map((signo: string, idx: number) => (
                    <Text key={idx} style={styles.anatomicalBullet}>• {signo}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Análisis de Inervación Dual */}
      {hallazgosInervacionDual.length > 0 && (
        <View style={styles.dualInnervationContainer}>
          <View style={styles.dualInnervationHeader}>
            <Brain size={20} color={colors.primary} />
            <EducationalTooltip content={TOOLTIP_CONTENT.DUAL_INNERVATION}>
              <Text style={styles.dualInnervationTitle}>Análisis de Inervación Dual</Text>
            </EducationalTooltip>
          </View>
          
          {hallazgosInervacionDual.map((hallazgo) => (
            <View key={hallazgo.musculo} style={[
              styles.dualInnervationItem,
              hallazgo.relevancia === 'Alta' && styles.dualInnervationHigh,
              hallazgo.relevancia === 'Moderada' && styles.dualInnervationMedium
            ]}>
              <Text style={styles.dualInnervationMuscle}>
                {hallazgo.musculo} (MRC: {hallazgo.mrc})
              </Text>
              <Text style={styles.dualInnervationRelevance}>
                Relevancia: {hallazgo.relevancia}
              </Text>
              <Text style={styles.dualInnervationInterpretation}>
                {hallazgo.interpretacion}
              </Text>
              <Text style={styles.dualInnervationClinical}>
                💡 {hallazgo.info.relevanciaClinica}
              </Text>
            </View>
          ))}
        </View>
      )}

      <ResultsActions
        assessment={{
          diagnosticos: resultadosDiagnostico.slice(0, 5),
          mejorDiagnostico: mejorDiagnostico.nombreLesion,
          score: mejorDiagnostico.normalizedScore,
          interpretation: `Diagnóstico más probable: ${mejorDiagnostico.nombreLesion} con ${(mejorDiagnostico.normalizedScore * 100).toFixed(1)}% de coincidencia`,
          
          // Datos extendidos para el PDF
          evaluacionMuscular: Object.entries(datosEvaluacion.fuerzasMuscular).map(([musculo, mrc]) => ({
            musculo,
            mrc,
            interpretacion: (mrc as number) < 5 ? `Debilidad (MRC ${mrc})` : 'Normal'
          })),
          
          sintomasClinicosPresentes: datosEvaluacion.sintomasSeleccionados,
          areasSensibilidadAfectadas: datosEvaluacion.areasSeleccionadas,
          
          reflejos: [
            { nombre: 'Bicipital (C5-C6)', estado: datosEvaluacion.reflejos.bicipital },
            { nombre: 'Braquiorradial (C6-C7)', estado: datosEvaluacion.reflejos.braquiorradial },
            { nombre: 'Tricipital (C7-C8)', estado: datosEvaluacion.reflejos.tricipital }
          ],
          
          informacionAdicional: datosEvaluacion.informacionAdicional,
          
          // Análisis de inervación dual
          hallazgosInervacionDual: hallazgosInervacionDual.map(h => ({
            musculo: h.musculo,
            mrc: h.mrc,
            relevancia: h.relevancia,
            interpretacion: h.interpretacion,
            nerviosPrincipales: `${h.info.principal} / ${h.info.secundario}`,
            relevanciaClinica: h.info.relevanciaClinica
          })),
          
          // Explicación anatómica del mejor diagnóstico
          explicacionAnatomica: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion] ? {
            correlacionClinica: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].correlacionClinica,
            nerviosAfectados: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].nerviosAfectados,
            signosCaracteristicos: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].signosCaracteristicos,
            recorrido: EXPLICACIONES_ANATOMICAS[mejorDiagnostico.nombreLesion].recorrido.map(r => 
              `${r.estructura}: ${r.explicacion}`
            )
          } : undefined,
          
          // Diagnósticos diferenciales con scores
          diagnosticosDiferenciales: resultadosDiagnostico.slice(0, 5).map(d => ({
            nombre: d.nombreLesion,
            probabilidad: `${(d.normalizedScore * 100).toFixed(1)}%`,
            nerviosComprometidos: d.detalles.nerviosPerifericos.slice(0, 3),
            musculosAfectados: d.detalles.musculos.filter((m: any) => m.esperado).slice(0, 3).map((m: any) => m.nombre)
          })),
          
          patientData: {
            name: '',
            age: '',
            gender: '',
            doctorName: '',
          },
          answers: Object.entries(datosEvaluacion.fuerzasMuscular).map(([musculo, mrc]) => ({
            id: musculo,
            question: musculo,
            label: `MRC ${mrc}`,
            value: mrc,
            points: mrc,
          })),
        }}
        scale={{ id: 'plexo-braquial', name: 'Calculadora Diagnóstica del Plexo Braquial' } as any}
        containerStyle={{ marginTop: 16 }}
      />
    </View>
  );
};
