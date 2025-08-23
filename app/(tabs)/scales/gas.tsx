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

const CATEGORY_EXAMPLES: Record<GASCategory, { title: string; level0: string; tip?: string }> = {
	funcion_pasiva: {
		title: 'Permitir higiene palmar sin resistencia',
		level0: 'El cuidador abre la mano derecha para higiene palmar sin resistencia en el 100% de intentos.',
		tip: 'Facilitar cuidados, manejo de espasticidad o postura.',
	},
	funcion_activa: {
		title: 'Sostener taza 200 ml por 10 s',
		level0: 'El paciente sostiene una taza de 200 ml con la mano derecha durante 10 segundos sin derramar.',
		tip: 'Uso voluntario, agarre, alcance, manipulación.',
	},
	dolor: {
		title: 'Dolor ≤3/10 al vestirse',
		level0: 'Dolor de hombro ≤3/10 en NPRS durante el vestir, al menos 5 de 7 días.',
		tip: 'Usar intensidad, frecuencia y contexto funcional.',
	},
	movilidad: {
		title: 'Transferencia cama-silla supervisada',
		level0: 'Transfiere de cama a silla con asistencia supervisada, sin ayudas, 3 repeticiones consecutivas.',
		tip: 'Transferencias, marcha, escalones, distancia/tiempo.',
	},
	participacion: {
		title: 'Baño completo con mínima ayuda',
		level0: 'Completa baño de regadera con mínima ayuda en seguridad, <15 minutos.',
		tip: 'ABVD/IAVD con criterios de independencia, tiempo, seguridad.',
	},
	habilidad: {
		title: 'Cortar alimento con cubiertos',
		level0: 'Corta un filete blando usando tenedor y cuchillo con la mano dominante sin asistencia.',
		tip: 'Tarea concreta con desempeño observable.',
	},
};

// Ejemplos sugeridos para pacientes con EVC (Enfermedad Vascular Cerebral)
const EVC_EXAMPLES: Record<GASCategory, Array<{ title: string; level0: string; tip?: string }>> = {
	funcion_pasiva: [
		{ title: 'Higiene palmar sin resistencia', level0: 'El cuidador abre la mano afectada para higiene palmar sin resistencia en el 100% de intentos diarios.', tip: 'Facilita cuidados y previene maceración.' },
		{ title: 'Posicionamiento de miembro superior', level0: 'Mantiene el miembro superior afectado en posicionamiento funcional con férula 2 horas continuas, 2 veces al día.' },
		{ title: 'Rango pasivo hombro sin dolor', level0: 'Realiza movilización pasiva de hombro hasta 90° de flexión y 60° de abducción sin dolor referido.' },
		{ title: 'Tolerancia a férula nocturna', level0: 'Usa férula de reposo en mano afectada durante 8 horas nocturnas sin lesiones cutáneas.' },
	],
	funcion_activa: [
		{ title: 'Apertura/cierre de mano', level0: 'Realiza apertura y cierre de la mano afectada 10 repeticiones sin dolor ni sinergias marcadas.' },
		{ title: 'Alcance y agarre', level0: 'Alcanza y agarra una taza con la mano afectada, manteniéndola 5 segundos sin derramar.' },
		{ title: 'Extensión de muñeca mantenida', level0: 'Mantiene extensión activa de muñeca afectada ≥20° durante 5 segundos, 5 repeticiones.' },
		{ title: 'Prensión de pinza fina', level0: 'Realiza prensión de pinza para recoger 5 monedas y colocarlas en un recipiente en <60 s.' },
		{ title: 'Alcance al estante', level0: 'Alcanza un objeto a nivel de pecho con el miembro afectado y lo deposita en una mesa 5 veces consecutivas.' },
	],
	dolor: [
		{ title: 'Dolor de hombro ≤3/10', level0: 'Dolor de hombro del miembro afectado ≤3/10 en NPRS durante vestirse, al menos 5 de 7 días.' },
		{ title: 'Dolor en movilización pasiva', level0: 'Dolor ≤2/10 durante movilizaciones pasivas de hombro en todas las sesiones de la semana.' },
		{ title: 'Dolor por subluxación', level0: 'Dolor ≤3/10 al realizar abducción de hombro con soporte adecuado del miembro afectado.' },
		{ title: 'Dolor nocturno', level0: 'Dolor ≤3/10 al dormir sobre el lado sano sin despertares por dolor del hombro afectado.' },
	],
	movilidad: [
		{ title: 'Transferencias supervisadas', level0: 'Realiza transferencia cama-silla con asistencia supervisada, sin ayudas técnicas, 3 repeticiones consecutivas.' },
		{ title: 'Marcha 10 metros', level0: 'Deambula 10 metros con bastón de un punto y supervisión, sin pérdida de equilibrio.' },
		{ title: 'Subir y bajar escaleras', level0: 'Sube y baja 8 escalones con pasamanos y supervisión, patrón alterno, sin descansos ni tropiezos.' },
		{ title: 'Marcha 6 minutos', level0: 'Recorre ≥150 metros en la prueba de marcha de 6 minutos con ayuda técnica habitual, sin pausas por fatiga.' },
		{ title: 'Timed Up and Go', level0: 'Completa TUG en ≤20 s con ayuda técnica habitual y sin pérdidas de equilibrio.' },
		{ title: 'Levantarse de la cama', level0: 'Pasa de decúbito supino a sentado al borde de la cama de forma independiente en <20 s, 3 repeticiones.' },
	],
	participacion: [
		{ title: 'Vestido parte superior', level0: 'Se viste la parte superior del cuerpo de forma independiente en <10 minutos, usando técnicas de una mano.' },
		{ title: 'Aseo personal', level0: 'Completa aseo de higiene personal (cara, dientes, peinarse) de manera independiente en <8 minutos.' },
		{ title: 'Uso de teléfono', level0: 'Inicia una llamada telefónica usando manos libres o soporte en <1 minuto de manera independiente.' },
		{ title: 'Preparar colación sencilla', level0: 'Prepara un sándwich simple de manera segura e independiente en <8 minutos.' },
		{ title: 'Higiene en inodoro', level0: 'Realiza higiene posterior en inodoro de manera independiente sin pérdida de equilibrio.' },
	],
	habilidad: [
		{ title: 'Uso de utensilios', level0: 'Se alimenta con cuchara usando la mano afectada para estabilizar el plato y coordinar, derrame <10% del contenido.' },
		{ title: 'Botones de camisa', level0: 'Abotona una camisa con técnica de una mano en <3 minutos con mínima ayuda para estabilizar.' },
		{ title: 'Escritura funcional', level0: 'Escribe su nombre y fecha de forma legible 3 de 5 intentos en <90 s.' },
		{ title: 'Atarse agujetas', level0: 'Ata una agujeta con técnica adaptada de una mano en <3 minutos con mínima asistencia.' },
		{ title: 'Abrir botella', level0: 'Abre y cierra una botella con adaptador de agarre usando el miembro afectado para estabilizar, 3 repeticiones.' },
	],
};

export default function GASScale() {
	const router = useRouter();
	const { colors } = useScaleStyles();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const [step, setStep] = useState<Step>('form');
	const [goals, setGoals] = useState<GASGoal[]>([]);
	const [evaluations, setEvaluations] = useState<GASEvaluation[]>([]);
	const [showHelpPonderation, setShowHelpPonderation] = useState(false);
	const [wizardOpen, setWizardOpen] = useState(false);
	const [wizardCategory, setWizardCategory] = useState<GASCategory>('funcion_activa');
	const [wizardProfile, setWizardProfile] = useState<PathologyProfile>('general');
	const [nextCycleNotes, setNextCycleNotes] = useState('');
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

	const setEvalNotes = useCallback((goalId: string, notes: string) => {
		setEvaluations(prev => {
			const idx = prev.findIndex(e => e.goalId === goalId);
			if (idx >= 0) {
				const copy = [...prev];
				copy[idx] = { ...copy[idx], notes };
				return copy;
			}
			return [...prev, { goalId, score: null, notes }];
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
											style={[styles.input, { width: 180, backgroundColor: colors.tagBackground }]}
											placeholder="Categoría (opcional)"
											value={g.category ? CATEGORY_LABELS[g.category] : ''}
											onFocus={() => setWizardOpen(true)}
										/>
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
										<Text style={{ color: colors.mutedText, marginTop: 4 }}>Consejo: escribe el 0 con criterios medibles; usa +1/+2 y −1/−2 en relación al 0.</Text>
									</View>

									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
										<TouchableOpacity onPress={() => setShowHelpPonderation(v => !v)}>
											<Text style={{ color: colors.primary }}>¿Qué es la ponderación?</Text>
										</TouchableOpacity>
										<Text style={{ color: colors.mutedText }}>
											{Object.values(g.levels).filter(Boolean).length}/5 niveles
										</Text>
									</View>
									{showHelpPonderation && (
										<Text style={{ color: colors.mutedText, marginTop: 4 }}>Asigna 1 (normal), 2 (muy importante) o 3 (crucial). Afecta el cálculo final.</Text>
									)}
								</View>
							))}
							<TouchableOpacity style={[styles.addButton, { backgroundColor: colors.buttonSecondary }]} onPress={() => setWizardOpen(true)} accessibilityRole="button" accessibilityLabel="Asistente para añadir objetivo">
								<Plus color={colors.buttonSecondaryText} size={18} />
								<Text style={[styles.addButtonText, { color: colors.buttonSecondaryText }]}>Asistente de objetivo</Text>
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
										<View style={{ marginTop: 6 }}>
											<Text style={[styles.sectionTitle, { fontSize: 14 }]}>Observaciones clínicas</Text>
											<TextInput
												style={[styles.input, { backgroundColor: colors.tagBackground, minHeight: 44 }]}
												placeholder="Notas (opcional): justifique la puntuación, contexto clínico..."
												value={evaluations.find(e => e.goalId === goal.id)?.notes ?? ''}
												onChangeText={(v) => setEvalNotes(goal.id, v)}
												multiline
											/>
										</View>
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
							<ScaleInfo info={gasInfo} />
							<View style={styles.resultBox}>
								<Text style={styles.resultTitle}>Puntuación T</Text>
								<Text style={[styles.tScore, { color: colors.primary }]}>{calculateTScore()}</Text>
								<Text style={styles.resultText}>{interpretation}</Text>
							</View>
							{/* Barra visual de T */}
							<View style={{ marginBottom: 12 }}>
								<Text style={styles.sectionTitle}>Visual</Text>
								<View style={{ height: 16, borderRadius: 8, overflow: 'hidden', flexDirection: 'row' }}>
									<View style={{ flex: 1, backgroundColor: '#ef4444' }} />
									<View style={{ flex: 1, backgroundColor: '#f59e0b' }} />
									<View style={{ flex: 1, backgroundColor: '#10b981' }} />
								</View>
								{/* marcador */}
								<View style={{ position: 'relative', height: 0 }}>
									<View style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, ((calculateTScore() - 30) / 40) * 100))}%`, top: -10 }}>
										<View style={{ width: 2, height: 24, backgroundColor: colors.text }} />
									</View>
								</View>
								<TouchableOpacity onPress={() => setWizardOpen(true)} accessibilityRole="button" accessibilityLabel="¿Qué es la puntuación T?">
									<Text style={{ color: colors.primary, marginTop: 6 }}>¿Qué es la puntuación T?</Text>
								</TouchableOpacity>
								<Text style={{ color: colors.mutedText, marginTop: 4 }}>
									Es una puntuación estandarizada. 50 = meta cumplida en promedio. {'>'}50 mejor de lo esperado, {'<'}50 peor de lo esperado.
								</Text>
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
											{ev?.notes ? (
												<Text style={[styles.detailText, { color: colors.mutedText }]}>Nota: {ev.notes}</Text>
											) : null}
										</View>
									);
								})}
							</View>

							<View style={styles.resultBox}>
								<Text style={styles.sectionTitle}>Recomendaciones para el siguiente ciclo</Text>
								<TextInput
									style={[styles.input, { backgroundColor: colors.tagBackground, minHeight: 60 }]}
									placeholder="Notas y recomendaciones para la próxima evaluación..."
									value={nextCycleNotes}
									onChangeText={setNextCycleNotes}
									multiline
								/>
							</View>

							<ResultsActions
								assessment={{
									...buildAssessmentForExport(),
								}}
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

			{/* Asistente básico para crear objetivo */}
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

			{wizardOpen && (
				<View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 16 }}>
					<Text style={styles.sectionTitle}>Asistente para objetivo</Text>
					<Text style={{ color: colors.mutedText, marginBottom: 8 }}>Selecciona una categoría y, si aplica, el perfil EVC.</Text>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
						{(Object.keys(CATEGORY_LABELS) as GASCategory[]).map(cat => (
							<TouchableOpacity key={cat} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: wizardCategory === cat ? colors.primary : colors.border, backgroundColor: wizardCategory === cat ? colors.tagBackground : 'transparent' }} onPress={() => setWizardCategory(cat)}>
								<Text style={{ color: colors.text }}>{CATEGORY_LABELS[cat]}</Text>
							</TouchableOpacity>
						))}
					</View>
					<View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
						<TouchableOpacity style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: wizardProfile === 'general' ? colors.primary : colors.border, backgroundColor: wizardProfile === 'general' ? colors.tagBackground : 'transparent' }} onPress={() => setWizardProfile('general')}>
							<Text style={{ color: colors.text }}>General</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: wizardProfile === 'evc' ? colors.primary : colors.border, backgroundColor: wizardProfile === 'evc' ? colors.tagBackground : 'transparent' }} onPress={() => setWizardProfile('evc')}>
							<Text style={{ color: colors.text }}>EVC</Text>
						</TouchableOpacity>
					</View>
					<View style={{ marginTop: 10 }}>
						<Text style={{ color: colors.mutedText }}>Ejemplos sugeridos:</Text>
						{(wizardProfile === 'evc' ? (EVC_EXAMPLES[wizardCategory] ?? []) : [CATEGORY_EXAMPLES[wizardCategory]]).slice(0, 2).map((ex, i) => (
							<View key={i} style={{ marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8 }}>
								<Text style={{ color: colors.text }}>Título: {ex.title}</Text>
								<Text style={{ color: colors.text, marginTop: 2 }}>Nivel 0: {ex.level0}</Text>
								{ex.tip ? (<Text style={{ color: colors.mutedText, marginTop: 2 }}>{ex.tip}</Text>) : null}
								<TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.buttonPrimary }} onPress={() => {
									setGoals(prev => ([
										...prev,
										{ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, title: ex.title, weight: 1, category: wizardCategory, levels: { ...defaultLevels, '0': ex.level0 } },
									]));
								}}>
									<Text style={{ color: '#fff' }}>Usar este ejemplo</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>
					<View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
						<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonSecondary }]} onPress={() => setWizardOpen(false)}>
							<Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonPrimary }]} onPress={() => setWizardOpen(false)}>
							<Text style={[styles.buttonText, { color: '#fff' }]}>Hecho</Text>
						</TouchableOpacity>
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
	scoreBadge: {
		fontSize: 18,
		fontWeight: '800',
	},
});


