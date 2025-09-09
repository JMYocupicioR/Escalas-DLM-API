import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Plus, Trash2, Info } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';
import { PatientForm } from '@/components/PatientForm';
import { ResultsActions } from '@/components/ResultsActions';
import { useScalesStore } from '@/store/scales';
import { ScaleInfo, ScaleInfoData } from '@/components/ScaleInfo';

type GASLevelKey = '-2' | '-1' | '0' | '1' | '2';
type GASCategory = 'funcion_pasiva' | 'funcion_activa' | 'dolor' | 'movilidad' | 'participacion' | 'habilidad';
type PathologyProfile = 'general' | 'evc';

interface GASGoal {
	id: string;
	title: string;
	weight: number;
	category?: GASCategory;
	levels: Record<GASLevelKey, string>;
}

interface GASEvaluation {
	goalId: string;
	score: -2 | -1 | 0 | 1 | 2 | null;
	notes?: string;
}

type Step = 'form' | 'goals' | 'evaluate' | 'results';

const defaultLevels: Record<GASLevelKey, string> = {
	'-2': '',
	'-1': '',
	'0': '',
	'1': '',
	'2': '',
};

const CATEGORY_LABELS: Record<GASCategory, string> = {
	funcion_pasiva: 'Función Pasiva',
	funcion_activa: 'Función Activa',
	dolor: 'Manejo del Dolor',
	movilidad: 'Movilidad',
	participacion: 'Participación',
	habilidad: 'Habilidad específica',
};

export default function GASScale() {
	const router = useRouter();
	const { colors } = useScaleStyles();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const [step, setStep] = useState<Step>('form');
	const [goals, setGoals] = useState<GASGoal[]>([]);
	const [evaluations, setEvaluations] = useState<GASEvaluation[]>([]);
	const [showInfo, setShowInfo] = useState(false);

	// Patient info from store (optional)
	const getCurrentPatient = useScalesStore(state => state.getCurrentPatient);
	const patient = getCurrentPatient();

	// Goals management
	const addGoal = useCallback(() => {
		setGoals(prev => [
			...prev,
			{
				id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
				title: '',
				weight: 1,
				category: undefined,
				levels: { ...defaultLevels },
			},
		]);
	}, []);

	const removeGoal = useCallback((id: string) => {
		setGoals(prev => prev.filter(g => g.id !== id));
		setEvaluations(prev => prev.filter(e => e.goalId !== id));
	}, []);

	const updateGoalField = useCallback((id: string, field: keyof Omit<GASGoal, 'id' | 'levels'>, value: string) => {
		setGoals(prev => prev.map(g => (g.id === id ? { ...g, [field]: field === 'weight' ? Number(value) || 0 : value } as GASGoal : g)));
	}, []);

	const updateGoalLevel = useCallback((id: string, level: GASLevelKey, text: string) => {
		setGoals(prev => prev.map(g => (g.id === id ? { ...g, levels: { ...g.levels, [level]: text } } : g)));
	}, []);

	// Evaluation selection
	const setScore = useCallback((goalId: string, score: -2 | -1 | 0 | 1 | 2) => {
		setEvaluations(prev => {
			const idx = prev.findIndex(e => e.goalId === goalId);
			if (idx >= 0) {
				const copy = [...prev];
				copy[idx] = { ...copy[idx], goalId, score };
				return copy;
			}
			return [...prev, { goalId, score }];
		});
	}, []);

	const areGoalsValid = useMemo(() => {
		if (goals.length === 0) return false;
		return goals.every(g => g.title.trim() && g.weight > 0 && Object.values(g.levels).every(t => t.trim()));
	}, [goals]);

	const allEvaluated = useMemo(() => {
		return goals.length > 0 && goals.every(g => evaluations.some(e => e.goalId === g.id && e.score !== null));
	}, [goals, evaluations]);

	// GAS T-score calculation
	const calculateTScore = useCallback(() => {
		if (goals.length === 0) return 50;
		const rho = 0.3;
		let sumWX = 0;
		let sumW2 = 0;
		let sumW = 0;
		evaluations.forEach(ev => {
			const goal = goals.find(g => g.id === ev.goalId);
			if (goal && ev.score !== null) {
				const w = goal.weight;
				const x = ev.score;
				sumWX += w * x;
				sumW2 += w * w;
				sumW += w;
			}
		});
		if (sumW === 0) return 50;
		const denominator = Math.sqrt((1 - rho) * sumW2 + rho * (sumW * sumW));
		if (denominator === 0) return 50;
		const t = 50 + (10 * sumWX) / denominator;
		return Number(t.toFixed(2));
	}, [goals, evaluations]);

	const interpretation = useMemo(() => {
		const t = calculateTScore();
		if (t > 55) return 'El logro general fue considerablemente mejor de lo esperado.';
		if (t > 50) return 'El logro general fue mejor de lo esperado.';
		if (t === 50) return 'Los objetivos se lograron según lo esperado.';
		if (t >= 45) return 'El logro general fue algo peor de lo esperado.';
		return 'El logro general fue considerablemente peor de lo esperado.';
	}, [calculateTScore]);

	const gasInfo: ScaleInfoData = useMemo(() => ({
		id: 'gas',
		name: 'Escala de Consecución de Objetivos',
		acronym: 'GAS',
		description: 'Herramienta centrada en metas SMART del paciente para medir progreso (−2 a +2) y calcular un T-score estandarizado.',
		quickGuide: [
			{ title: 'Paso 1: Datos del paciente', paragraphs: ['Completa la ficha del paciente (se guardará automáticamente).'] },
			{ title: 'Paso 2: Definir objetivos (clave)', paragraphs: [
				'Escribe primero el 0 (meta SMART): Específica, Medible, Alcanzable, Relevante, con Plazo.',
				'Luego ajusta +1/+2 (mejor que lo esperado) y −1/−2 (peor que lo esperado).',
				'Usa la ponderación 1–3 según importancia clínica para el paciente.',
			] },
			{ title: 'Paso 3: Evaluación', paragraphs: ['Selecciona el nivel logrado (−2 a +2) y añade observaciones clínicas por objetivo.'] },
			{ title: 'Paso 4: Interpretación', paragraphs: ['Se calcula un T-score: ≈50 esperado; >50 mejor de lo esperado; <50 peor de lo esperado.'] },
		],
		evidence: {
			summary: 'La GAS es ampliamente utilizada en rehabilitación y neurología para evaluaciones individualizadas; permite comparabilidad mediante T-scores estandarizados.',
			references: [
				{ title: 'Goal Attainment Scaling: A general method for evaluating comprehensive community mental health programs', authors: ['Kiresuk TJ', 'Sherman RE'], year: 1968, doi: '10.1177/107755876800300405' },
				{ title: 'Goal Attainment Scaling in Rehabilitation: A Literature Review', authors: ['Hurn J', 'Kneebone I', 'Croxson J'], year: 2006, doi: '10.1177/0269215506070791' },
			],
		},
		lastUpdated: new Date().toISOString(),
	}), []);

	// Build assessment data for exporting
	const buildAssessmentForExport = useCallback(() => {
		const details = goals.map(goal => {
			const ev = evaluations.find(e => e.goalId === goal.id);
			const score = ev?.score ?? null;
			const label = score !== null ? `${score > 0 ? `+${score}` : score}` : 'Sin evaluar';
			const levelText = score !== null ? goal.levels[String(score) as GASLevelKey] : '';
			return {
				id: goal.id,
				question: goal.title,
				label: levelText || label,
				value: score ?? undefined,
				points: score ?? undefined,
				weight: goal.weight,
				notes: ev?.notes,
			};
		});
		return {
			patientData: {
				name: patient?.name,
				age: patient?.age,
				gender: patient?.gender,
			},
			score: calculateTScore(),
			interpretation,
			answers: details,
		};
	}, [goals, evaluations, calculateTScore, interpretation, patient?.name, patient?.age, patient?.gender]);

	return (
		<>
			<Stack.Screen
				options={{
					title: 'Escala GAS',
					headerShown: true,
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver atrás">
							<ArrowLeft color={colors.text} size={24} />
						</TouchableOpacity>
					),
					headerRight: () => (
						<TouchableOpacity onPress={() => setShowInfo(true)} accessibilityRole="button" accessibilityLabel="Ver información y evidencia">
							<Info color={colors.text} size={22} />
						</TouchableOpacity>
					),
				}}
			/>
			<SafeAreaView style={styles.container}>
				{step === 'form' && (
					<ScrollView contentContainerStyle={styles.content}>
						<View style={styles.card}>
							<Text style={styles.title}>Datos del Paciente</Text>
							<PatientForm scaleId="gas" allowSkip onContinue={() => setStep('goals')} />
						</View>
					</ScrollView>
				)}

				{step === 'goals' && (
					<ScrollView contentContainerStyle={styles.content}>
						<View style={styles.card}>
							<Text style={styles.title}>Definición de Objetivos</Text>
							<Text style={{ color: colors.mutedText, marginBottom: 8 }}>Empieza por definir el nivel 0 (meta SMART). Los demás niveles se ajustan en relación a esa meta.</Text>
							
							{goals.map((g, idx) => (
								<View key={g.id} style={styles.goalBox}>
									<View style={styles.goalHeader}>
										<Text style={styles.goalTitle}>Objetivo {idx + 1}</Text>
										<TouchableOpacity onPress={() => removeGoal(g.id)} accessibilityRole="button" accessibilityLabel="Eliminar objetivo">
											<Trash2 color={colors.danger || '#dc2626'} size={20} />
										</TouchableOpacity>
									</View>
									
									<View style={styles.row}>
										<TextInput
											style={[styles.input, { flex: 1, backgroundColor: colors.tagBackground }]}
											placeholder="Título del objetivo"
											value={g.title}
											onChangeText={(v) => updateGoalField(g.id, 'title', v)}
										/>
										<TextInput
											style={[styles.input, { width: 90, textAlign: 'center', backgroundColor: colors.tagBackground }]}
											keyboardType="numeric"
											placeholder="Peso"
											value={String(g.weight)}
											onChangeText={(v) => updateGoalField(g.id, 'weight', v)}
										/>
									</View>
									
									<View style={styles.levels}>
										<Text style={styles.levelsTitle}>Define niveles (0 primero):</Text>
										{(['0','1','2','-1','-2'] as GASLevelKey[]).map((k) => (
											<View key={k} style={styles.levelRow}>
												<Text style={styles.levelBadge}>{k === '0' ? '0' : k.startsWith('-') ? k : `+${k}`}</Text>
												<TextInput
													style={[styles.input, { flex: 1, backgroundColor: colors.tagBackground }]}
													placeholder={k === '0' ? 'Resultado esperado (Meta SMART)' : (k === '1' ? 'Algo mejor que lo esperado' : (k === '2' ? 'Mucho mejor que lo esperado' : (k === '-1' ? 'Progreso parcial / línea base' : 'Peor de lo esperado')))}
													value={g.levels[k]}
													onChangeText={(v) => updateGoalLevel(g.id, k, v)}
												/>
											</View>
										))}
									</View>
								</View>
							))}
							
							<TouchableOpacity style={[styles.addButton, { backgroundColor: colors.buttonSecondary }]} onPress={addGoal} accessibilityRole="button" accessibilityLabel="Añadir objetivo">
								<Plus color={colors.buttonSecondaryText} size={18} />
								<Text style={[styles.addButtonText, { color: colors.buttonSecondaryText }]}>Añadir objetivo</Text>
							</TouchableOpacity>

							<View style={styles.actionsRow}>
								<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonSecondary }]} onPress={() => setStep('form')} accessibilityRole="button" accessibilityLabel="Atrás">
									<Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Atrás</Text>
								</TouchableOpacity>
								<TouchableOpacity disabled={!areGoalsValid} style={[styles.button, !areGoalsValid ? styles.buttonDisabled : { backgroundColor: colors.buttonPrimary }]} onPress={() => setStep('evaluate')} accessibilityRole="button" accessibilityLabel="Siguiente">
									<Text style={[styles.buttonText, { color: '#fff' }]}>Siguiente</Text>
									<ArrowRight color="#fff" size={18} />
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				)}

				{step === 'evaluate' && (
					<ScrollView contentContainerStyle={styles.content}>
						<View style={styles.card}>
							<Text style={styles.title}>Evaluación de Objetivos</Text>
							{goals.map(goal => {
								const selected = evaluations.find(e => e.goalId === goal.id)?.score ?? null;
								return (
									<View key={goal.id} style={styles.evalBox}>
										<Text style={styles.evalTitle}>{goal.title}</Text>
										<View style={styles.levelButtonsRow}>
											{([-2, -1, 0, 1, 2] as const).map(score => {
												const isSelected = selected === score;
												return (
													<TouchableOpacity
														key={score}
														style={[styles.levelButton, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : colors.tagBackground }]}
														onPress={() => setScore(goal.id, score)}
														accessibilityRole="button"
														accessibilityLabel={`Seleccionar ${score}`}
													>
														<Text style={[styles.levelButtonText, { color: isSelected ? '#fff' : colors.text }]}>{score > 0 ? `+${score}` : score}</Text>
													</TouchableOpacity>
												);
											})}
										</View>
										<Text style={styles.evalHelper}>{goal.levels[String(selected ?? 0) as GASLevelKey] || 'Selecciona un nivel para ver la descripción.'}</Text>
									</View>
								);
							})}

							<View style={styles.actionsRow}>
								<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonSecondary }]} onPress={() => setStep('goals')} accessibilityRole="button" accessibilityLabel="Atrás">
									<Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Atrás</Text>
								</TouchableOpacity>
								<TouchableOpacity disabled={!allEvaluated} style={[styles.button, !allEvaluated ? styles.buttonDisabled : { backgroundColor: colors.buttonPrimary }]} onPress={() => setStep('results')} accessibilityRole="button" accessibilityLabel="Ver resultados">
									<Text style={[styles.buttonText, { color: '#fff' }]}>Ver resultados</Text>
									<ArrowRight color="#fff" size={18} />
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				)}

				{step === 'results' && (
					<ScrollView contentContainerStyle={styles.content}>
						<View style={styles.card}>
							<Text style={styles.title}>Resultados GAS</Text>
							<View style={styles.resultBox}>
								<Text style={styles.resultTitle}>Puntuación T</Text>
								<Text style={[styles.tScore, { color: colors.primary }]}>{calculateTScore()}</Text>
								<Text style={styles.resultText}>{interpretation}</Text>
							</View>

							<View style={styles.detailBox}>
								<Text style={styles.sectionTitle}>Detalle por objetivo</Text>
								{goals.map(goal => {
									const ev = evaluations.find(e => e.goalId === goal.id);
									const score = ev?.score ?? null;
									return (
										<View key={goal.id} style={styles.detailItem}>
											<View style={styles.detailHeader}>
												<Text style={styles.detailTitle}>{goal.title}</Text>
												<Text style={[styles.scoreBadge, { color: score && score > 0 ? '#16a34a' : score && score < 0 ? '#dc2626' : colors.text }]}>
													{score !== null ? (score > 0 ? `+${score}` : score) : 'N/A'}
												</Text>
											</View>
											<Text style={styles.detailSub}>Peso: {goal.weight}</Text>
											{score !== null && (
												<Text style={styles.detailText}>{goal.levels[String(score) as GASLevelKey]}</Text>
											)}
										</View>
									);
								})}
							</View>

							<ResultsActions
								assessment={buildAssessmentForExport()}
								scale={{ id: 'gas', name: 'Escala GAS' } as any}
								containerStyle={{ marginTop: 12 }}
							/>

							<View style={styles.actionsRow}>
								<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonSecondary }]} onPress={() => setStep('evaluate')} accessibilityRole="button" accessibilityLabel="Atrás">
									<Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Atrás</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonPrimary }]} onPress={() => { setEvaluations([]); setStep('goals'); }} accessibilityRole="button" accessibilityLabel="Preparar siguiente evaluación">
									<Text style={[styles.buttonText, { color: '#fff' }]}>Preparar siguiente evaluación</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				)}
			</SafeAreaView>

			{showInfo && (
				<View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
					<View style={{ backgroundColor: colors.card, maxHeight: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 1, borderColor: colors.border }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
							<Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Información de la escala</Text>
							<TouchableOpacity onPress={() => setShowInfo(false)} accessibilityRole="button" accessibilityLabel="Cerrar información">
								<Text style={{ color: colors.primary, fontWeight: '700' }}>Cerrar</Text>
							</TouchableOpacity>
						</View>
						<ScrollView contentContainerStyle={{ padding: 16 }}>
							<ScaleInfo info={gasInfo} />
						</ScrollView>
					</View>
				</View>
			)}
		</>
	);
}

const createStyles = (colors: any) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		padding: 20,
	},
	card: {
		backgroundColor: colors.card,
		borderRadius: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: colors.border,
		shadowColor: colors.shadowColor,
		shadowOpacity: 0.08,
		shadowRadius: 3,
		elevation: 1,
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 12,
		textAlign: 'center',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 10,
	},
	input: {
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: colors.text,
	},
	goalBox: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
		backgroundColor: colors.sectionBackground,
	},
	goalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	goalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
	},
	levels: {
		gap: 8,
	},
	levelsTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.mutedText,
		marginBottom: 4,
	},
	levelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	levelBadge: {
		width: 34,
		textAlign: 'center',
		fontWeight: '700',
		color: colors.text,
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		borderRadius: 8,
		paddingVertical: 12,
		marginTop: 8,
	},
	addButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	actionsRow: {
		marginTop: 12,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	buttonDisabled: {
		backgroundColor: colors.mutedText,
		opacity: 0.6,
	},
	evalBox: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
		backgroundColor: colors.sectionBackground,
	},
	evalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 8,
	},
	levelButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 6,
	},
	levelButton: {
		flex: 1,
		paddingVertical: 10,
		borderWidth: 2,
		borderRadius: 8,
		alignItems: 'center',
	},
	levelButtonText: {
		fontSize: 16,
		fontWeight: '700',
	},
	evalHelper: {
		marginTop: 8,
		color: colors.mutedText,
	},
	resultBox: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 16,
		marginBottom: 12,
		backgroundColor: colors.sectionBackground,
	},
	resultTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 4,
	},
	tScore: {
		fontSize: 40,
		fontWeight: '800',
		marginVertical: 6,
		textAlign: 'center',
	},
	resultText: {
		textAlign: 'center',
		color: colors.mutedText,
	},
	detailBox: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		backgroundColor: colors.sectionBackground,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 8,
	},
	detailItem: {
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	detailHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	detailTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: colors.text,
	},
	detailSub: {
		fontSize: 12,
		color: colors.mutedText,
		marginTop: 2,
	},
	detailText: {
		fontSize: 13,
		color: colors.text,
		marginTop: 4,
	},
	scoreBadge: {
		fontSize: 18,
		fontWeight: '800',
	},
});