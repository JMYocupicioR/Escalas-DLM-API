import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';

export interface ScaleReference {
	title: string;
	authors?: string | string[];
	year?: number;
	doi?: string;
	url?: string;
}

export interface ScaleInfoData {
	id: string;
	name: string;
	acronym?: string;
	description?: string;
	quickGuide?: Array<{
		title: string;
		paragraphs: string[];
	}>;
	evidence?: {
		summary?: string;
		references?: ScaleReference[];
	};
	lastUpdated?: string;
}

interface Props {
	info: ScaleInfoData;
}

export const ScaleInfo: React.FC<Props> = ({ info }) => {
	const { colors } = useScaleStyles();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [showGuide, setShowGuide] = useState(true);
	const [showEvidence, setShowEvidence] = useState(true);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{info.name}{info.acronym ? ` (${info.acronym})` : ''}</Text>
			{info.description ? (
				<Text style={styles.description}>{info.description}</Text>
			) : null}

			{info.quickGuide && info.quickGuide.length > 0 && (
				<View style={styles.section}>
					<TouchableOpacity style={styles.sectionHeader} onPress={() => setShowGuide(v => !v)} accessibilityRole="button" accessibilityLabel="Alternar guía rápida">
						<Text style={styles.sectionTitle}>Guía rápida</Text>
						<Text style={styles.toggle}>{showGuide ? 'Ocultar' : 'Mostrar'}</Text>
					</TouchableOpacity>
					{showGuide && (
						<View style={styles.sectionBody}>
							{info.quickGuide.map((g, idx) => (
								<View key={idx} style={styles.block}>
									<Text style={styles.blockTitle}>{g.title}</Text>
									{g.paragraphs.map((p, i) => (
										<Text key={i} style={styles.paragraph}>{p}</Text>
									))}
								</View>
							))}
						</View>
					)}
				</View>
			)}

			{info.evidence && (
				<View style={styles.section}>
					<TouchableOpacity style={styles.sectionHeader} onPress={() => setShowEvidence(v => !v)} accessibilityRole="button" accessibilityLabel="Alternar evidencia y referencias">
						<Text style={styles.sectionTitle}>Evidencia y referencias</Text>
						<Text style={styles.toggle}>{showEvidence ? 'Ocultar' : 'Mostrar'}</Text>
					</TouchableOpacity>
					{showEvidence && (
						<View style={styles.sectionBody}>
							{info.evidence?.summary ? (
								<Text style={styles.paragraph}>{info.evidence.summary}</Text>
							) : null}
							{info.evidence?.references?.map((r, idx) => (
								<View key={idx} style={styles.referenceRow}>
									<Text style={styles.referenceText}>
										{r.authors?.join(', ') ? `${r.authors?.join(', ')}. ` : ''}
										{r.title}{r.year ? ` (${r.year})` : ''}
									</Text>
									{r.doi ? (
										<TouchableOpacity onPress={() => Linking.openURL(`https://doi.org/${r.doi}`)}>
											<Text style={styles.link}>doi:{r.doi}</Text>
										</TouchableOpacity>
									) : null}
									{r.url ? (
										<TouchableOpacity onPress={() => Linking.openURL(r.url!)}>
											<Text style={styles.link}>Enlace</Text>
										</TouchableOpacity>
									) : null}
								</View>
							))}
						</View>
					)}
				</View>
			)}

			{info.lastUpdated ? (
				<Text style={styles.footer}>Actualizado: {new Date(info.lastUpdated).toLocaleDateString()}</Text>
			) : null}
		</View>
	);
};

const createStyles = (colors: any) => StyleSheet.create({
	container: {
		gap: 12,
		padding: 20,
		backgroundColor: colors.sectionBackground,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		color: colors.text,
	},
	description: {
		fontSize: 15,
		color: colors.mutedText,
	},
	section: {
		marginTop: 12,
		backgroundColor: colors.card,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.border,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	sectionTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: colors.text,
	},
	toggle: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: '600',
	},
	sectionBody: {
		paddingHorizontal: 16,
		paddingBottom: 12,
		gap: 6,
	},
	block: {
		marginTop: 8,
	},
	blockTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 4,
	},
	paragraph: {
		fontSize: 15,
		lineHeight: 22,
		color: colors.text,
	},
	referenceRow: {
		marginTop: 6,
	},
	referenceText: {
		fontSize: 14,
		color: colors.text,
	},
	link: {
		fontSize: 14,
		color: colors.primary,
	},
	footer: {
		marginTop: 8,
		fontSize: 12,
		color: colors.mutedText,
		textAlign: 'right',
	},
});

export default ScaleInfo;


