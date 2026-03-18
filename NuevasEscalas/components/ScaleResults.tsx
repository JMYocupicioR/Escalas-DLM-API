import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { MedicalScale, ScaleQuestion } from '../medical-scale.schema';
import { User, CheckCircle2, Save, RotateCcw, Share2, Info, Calendar, UserCircle2 } from 'lucide-react-native';

interface ScaleResultsProps {
    scale: MedicalScale;
    results: {
        total_score: number;
        interpretation?: string;
        raw_responses: Record<string, any>;
        domain_results?: any[];
        globalInterpretation?: any;
        metadata?: {
            assessor_name?: string | null;
            assessment_date?: string | null;
            duration_seconds?: number | null;
        };
    };
    patient?: {
        id: string;
        full_name?: string | null;
        age?: number | null;
        gender?: string | null;
        birth_date?: string | null;
    } | null;
    onSave?: () => void;
    onReset?: () => void;
    saveStatus?: 'idle' | 'saving' | 'success' | 'error';
    errorMessage?: string;
    readOnly?: boolean;
}

export const ScaleResults = ({
    scale,
    results,
    patient,
    onSave = () => {},
    onReset = () => {},
    saveStatus = 'idle',
    errorMessage,
    readOnly = false
}: ScaleResultsProps) => {
    const { colors, fontSizeMultiplier } = useThemedStyles();
    const version = scale.current_version;

    // 🔍 COMPREHENSIVE DEBUGGING LOGS
    console.log('[ScaleResults] Component mounted/rendered');
    console.log('[ScaleResults] Scale:', scale.name, '(', scale.acronym, ')');
    console.log('[ScaleResults] Full results object:', JSON.stringify(results, null, 2));
    console.log('[ScaleResults] Results keys:', Object.keys(results));
    console.log('[ScaleResults] Has domain_results?', !!results.domain_results);
    console.log('[ScaleResults] domain_results type:', typeof results.domain_results);
    console.log('[ScaleResults] domain_results is array?', Array.isArray(results.domain_results));
    console.log('[ScaleResults] domain_results length:', results.domain_results?.length || 0);
    
    if (results.domain_results && results.domain_results.length > 0) {
        console.log('[ScaleResults] ✅ Domain results exist, analyzing each domain:');
        results.domain_results.forEach((domain, idx) => {
            console.log(`[ScaleResults] Domain ${idx + 1}:`, {
                id: domain.id,
                label: domain.label,
                score: domain.score,
                hasInterpretation: !!domain.interpretation,
                interpretationKeys: domain.interpretation ? Object.keys(domain.interpretation) : [],
                interpretation: domain.interpretation
            });
        });
    } else {
        console.log('[ScaleResults] ❌ No domain results found or empty array');
    }
    
    console.log('[ScaleResults] Global interpretation:', results.globalInterpretation);
    console.log('[ScaleResults] Interpretation string:', results.interpretation);

    if (!version) return null;

    const handleShare = async () => {
        try {
            const message = `Resultado Escala: ${scale.name}\n` +
                `Paciente: ${patient?.full_name || 'Anónimo'}\n` +
                `Puntaje Total: ${results.total_score}\n` +
                `Interpretación: ${results.interpretation || 'No disponible'}`;
            
            await Share.share({
                message,
                title: `Resultado ${scale.acronym || scale.name}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getAnswerLabel = (question: ScaleQuestion, value: any) => {
        if (question.type === 'single_choice' || question.type === 'multi_choice') {
            if (Array.isArray(value)) {
                return value.map(v => 
                    question.options?.find(opt => opt.value === v)?.label || v
                ).join(', ');
            }
            return question.options?.find(opt => opt.value === value)?.label || value;
        }
        return value?.toString() || 'Sin respuesta';
    };

    const getAnswerScore = (question: ScaleQuestion, value: any) => {
        if (question.type === 'single_choice') {
            return question.options?.find(opt => opt.value === value)?.score || 0;
        }
        if (question.type === 'multi_choice' && Array.isArray(value)) {
            return value.reduce((acc, v) => acc + (question.options?.find(opt => opt.value === v)?.score || 0), 0);
        }
        if (typeof value === 'number') return value;
        return 0;
    };

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return 'Fecha no disponible';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (_e) {
            return dateStr;
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Patient Header */}
            {patient ? (
                <View style={[styles.headerCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
                    <View style={styles.headerIcon}>
                        <User size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerContent}>
                        <Text style={[styles.patientLabel, { color: colors.mutedText }]}>Paciente</Text>
                        <Text style={[styles.patientName, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>
                            {patient.full_name}
                        </Text>
                        {(patient.age || patient.gender) && (
                            <View style={styles.patientMetaRow}>
                                {patient.age ? (
                                    <View style={styles.metaItem}>
                                        <Calendar size={12} color={colors.mutedText} style={styles.metaIcon} />
                                        <Text style={[styles.patientMeta, { color: colors.mutedText }]}>{`${patient.age} años`}</Text>
                                    </View>
                                ) : null}
                                {patient.age && patient.gender ? (
                                    <Text style={[styles.metaDivider, { color: colors.mutedText }]}>{` · `}</Text>
                                ) : null}
                                {patient.gender ? (
                                    <View style={styles.metaItem}>
                                        <UserCircle2 size={12} color={colors.mutedText} style={styles.metaIcon} />
                                        <Text style={[styles.patientMeta, { color: colors.mutedText }]}>
                                            {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : patient.gender}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </View>
                </View>
            ) : (
                <View style={[styles.headerCard, { backgroundColor: colors.card, borderLeftColor: colors.warning }]}>
                    <View style={styles.headerIcon}>
                        <Info size={24} color={colors.warning} />
                    </View>
                    <View style={styles.headerContent}>
                        <Text style={[styles.patientName, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>
                            Modo Calculadora (Sin guardar)
                        </Text>
                    </View>
                </View>
            )}

            {/* Assessment Metadata (Assessor and Date) */}
            {results.metadata && (
                <View style={[styles.metadataCard, { backgroundColor: colors.card }]}>
                    <View style={styles.metadataRow}>
                        <View style={styles.metadataItem}>
                            <UserCircle2 size={16} color={colors.primary} style={styles.metadataIcon} />
                            <Text style={[styles.metadataLabel, { color: colors.mutedText }]}>Evaluador:</Text>
                            <Text style={[styles.metadataValue, { color: colors.text }]}>
                                {results.metadata.assessor_name || 'No especificado'}
                            </Text>
                        </View>
                        <View style={styles.metadataItem}>
                            <Calendar size={16} color={colors.primary} style={styles.metadataIcon} />
                            <Text style={[styles.metadataLabel, { color: colors.mutedText }]}>Fecha/Hora:</Text>
                            <Text style={[styles.metadataValue, { color: colors.text }]}>
                                {formatDateTime(results.metadata.assessment_date)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Score Summary */}
            <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
                <View style={styles.scoreRow}>
                    <View>
                        <Text style={[styles.scaleTitle, { color: colors.text }]}>{scale.name}</Text>
                        <Text style={[styles.scaleVersion, { color: colors.mutedText }]}>{`Versión ${version.version_number}`}</Text>
                    </View>
                    <View style={[styles.scoreCircle, { borderColor: results.globalInterpretation?.color || colors.primary }]}>
                        <Text>
                            <Text style={[styles.totalScore, { color: colors.text }]}>{results.total_score}</Text>
                            <Text style={[styles.scoreLabel, { color: colors.mutedText }]}> pts</Text>
                        </Text>
                    </View>
                </View>

                {/* Validates if we have any interpretation data to show */}
                {(results.interpretation || results.globalInterpretation) && 
                 !(results.interpretation === 'Sin interpretación disponible' && results.domain_results && results.domain_results.length > 0) && (
                    <View style={[styles.interpretationBox, { backgroundColor: (results.globalInterpretation?.color || results.globalInterpretation?.color_code || colors.primary) + '10' }]}>
                        <Text style={[styles.interpretationLabel, { color: results.globalInterpretation?.color || results.globalInterpretation?.color_code || colors.primary }]}>
                            Interpretación Clínica:
                        </Text>
                        
                        {/* 1. Show Level/Label if available (e.g. "Severo", "Moderado") */}
                        {(results.globalInterpretation?.label || results.globalInterpretation?.interpretation_level) && (
                             <Text style={[styles.interpretationTitle, { color: colors.text }]}>
                                {results.globalInterpretation?.label || results.globalInterpretation?.interpretation_level}
                             </Text>
                        )}

                        {/* 2. Show detailed text */}
                        <Text style={[styles.interpretationText, { color: colors.text }]}>
                            {results.interpretation && results.interpretation !== 'Sin interpretación disponible' 
                                ? results.interpretation 
                                : (results.globalInterpretation?.interpretation || results.globalInterpretation?.interpretation_text || 'Sin detalle disponible')}
                        </Text>

                        {/* 3. Recommendations */}
                        {results.globalInterpretation?.recommendations && (
                            <View style={styles.recommendationContainer}>
                                <Text style={[styles.recommendationLabel, { color: colors.mutedText }]}>Recomendaciones:</Text>
                                <Text style={[styles.recommendationText, { color: colors.text }]}>
                                    {results.globalInterpretation.recommendations}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Question Details Breakdown */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Info size={18} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Detalle de Respuestas</Text>
                </View>
                {version.questions.filter(q => results.raw_responses[q.id] !== undefined)
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((question) => {
                        const answer = results.raw_responses[question.id];
                        const score = getAnswerScore(question, answer);
                        
                        return (
                            <View key={question.id} style={[styles.questionItem, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.questionText, { color: colors.text }]}>{question.text}</Text>
                                <View style={styles.answerRow}>
                                    <View style={styles.answerBadge}>
                                        <CheckCircle2 size={14} color={colors.primary} />
                                        <Text style={[styles.answerText, { color: colors.mutedText }]}>{getAnswerLabel(question, answer)}</Text>
                                    </View>
                                    <View style={[styles.valueBadge, { backgroundColor: score > 0 ? colors.infoBackground : colors.tagBackground }]}>
                                        <Text style={[styles.valueText, { color: score > 0 ? colors.info : colors.mutedText }]}>
                                            {`${score > 0 ? '+' : ''}${score} pts`}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
            </View>

            {/* Domain Interpretations Summary (NEW position at the end) */}
            {results.domain_results && results.domain_results.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <CheckCircle2 size={18} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Interpretación por Dominios</Text>
                    </View>
                    {results.domain_results.map((domain, idx) => (
                        <View 
                            key={domain.id || idx} 
                            style={[styles.domainCard, { backgroundColor: colors.card, borderLeftColor: domain.interpretation?.color || colors.primary }]}
                        >
                            <View style={styles.domainContentRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.domainName, { color: colors.text }]}>{domain.label}</Text>
                                    <View style={styles.domainMeta}>
                                        <Text style={[styles.domainScoreText, { color: colors.mutedText }]}>
                                            {`Puntaje: ${domain.score}`}
                                        </Text>
                                        
                                        {domain.interpretation?.label && (
                                            <View style={[styles.domainBadge, { backgroundColor: domain.interpretation.color + '20' || colors.tagBackground }]}>
                                                <Text style={[styles.domainBadgeText, { color: domain.interpretation.color || colors.primary }]}>
                                                    {domain.interpretation.label}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            
                            {domain.interpretation?.interpretation && (
                                <View style={styles.domainDescContainer}>
                                    <Text style={[styles.domainDescText, { color: colors.mutedText }]}>
                                        {domain.interpretation.interpretation}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Action Buttons */}
            {!readOnly && (
                <View style={styles.buttonContainer}>
                    {patient && (
                        <View style={{ gap: 8 }}>
                            <TouchableOpacity 
                                style={[
                                    styles.primaryButton, 
                                    { 
                                        backgroundColor: saveStatus === 'success' ? colors.success : 
                                                        saveStatus === 'error' ? colors.error : colors.primary,
                                        opacity: saveStatus === 'saving' || saveStatus === 'success' ? 0.8 : 1
                                    }
                                ]} 
                                onPress={onSave}
                                disabled={saveStatus === 'saving' || saveStatus === 'success'}
                            >
                                {saveStatus === 'saving' ? (
                                    <Text style={styles.buttonText}>Guardando...</Text>
                                ) : saveStatus === 'success' ? (
                                    <>
                                        <CheckCircle2 size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Guardado Correctamente</Text>
                                    </>
                                ) : saveStatus === 'error' ? (
                                    <>
                                        <Info size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Error - Reintentar</Text>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Guardar en Expediente</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            {saveStatus === 'error' && errorMessage && (
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errorMessage}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={styles.secondaryRow}>
                        <TouchableOpacity 
                            style={[styles.secondaryButton, { borderColor: colors.primary }]} 
                            onPress={onReset}
                        >
                            <RotateCcw size={20} color={colors.primary} />
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Nueva</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.secondaryButton, { borderColor: colors.primary }]} 
                            onPress={handleShare}
                        >
                            <Share2 size={20} color={colors.primary} />
                            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Compartir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    headerCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerIcon: {
        marginRight: 16,
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
    },
    patientLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    patientName: {
        fontWeight: 'bold',
    },
    patientMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: 4,
    },
    metaDivider: {
        fontSize: 14,
        marginHorizontal: 2,
    },
    patientMeta: {
        fontSize: 13,
    },
    scoreCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scaleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scaleVersion: {
        fontSize: 12,
        marginTop: 4,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalScore: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    interpretationBox: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
    },
    interpretationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    interpretationText: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
    interpretationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    recommendationContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    recommendationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    recommendationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    domainCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    domainContentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    domainName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    domainMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    domainScoreText: {
        fontSize: 12,
        fontWeight: '500',
    },
    domainScoreValue: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    domainBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    domainBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    domainDescContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    domainDescText: {
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    questionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        paddingHorizontal: 4,
    },
    questionText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    answerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    answerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    answerText: {
        fontSize: 13,
        marginLeft: 6,
    },
    valueBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    valueText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 10,
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4
    },
    metadataCard: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    metadataRow: {
        gap: 8,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metadataIcon: {
        marginRight: 6,
    },
    metadataLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginRight: 4,
    },
    metadataValue: {
        fontSize: 13,
        flex: 1,
    },
});
