import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { User, MoreVertical, ArrowLeft } from 'lucide-react-native';

interface StickyPatientHeaderProps {
  patientName?: string | null;
  currentQuestion: number;
  totalQuestions: number;
  scaleName: string;
  colors: any;
  fontSizeMultiplier?: number;
  onChangePatient?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const StickyPatientHeader: React.FC<StickyPatientHeaderProps> = ({
  patientName,
  currentQuestion,
  totalQuestions,
  scaleName,
  colors,
  fontSizeMultiplier = 1,
  onChangePatient,
  onBack,
  showBackButton = false,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const progress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  const handleChangePatient = () => {
    setMenuVisible(false);
    Alert.alert(
      'Cambiar paciente',
      'Se perderan los datos de la evaluacion actual. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cambiar', style: 'destructive', onPress: onChangePatient },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        {showBackButton && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {/* Patient name */}
        <View style={styles.patientSection}>
          <User size={16} color={colors.primary} />
          <Text
            style={[styles.patientName, { color: colors.text, fontSize: 14 * fontSizeMultiplier }]}
            numberOfLines={1}
          >
            {patientName || 'Sin paciente'}
          </Text>
        </View>

        {/* Progress counter */}
        <View style={styles.progressSection}>
          <Text style={[styles.progressText, { color: colors.mutedText, fontSize: 12 * fontSizeMultiplier }]}>
            {currentQuestion}/{totalQuestions}
          </Text>
        </View>

        {/* Menu */}
        {onChangePatient && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleChangePatient}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={18} color={colors.mutedText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mini progress bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  patientName: {
    fontWeight: '600',
    flexShrink: 1,
  },
  progressSection: {
    paddingHorizontal: 8,
  },
  progressText: {
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  menuButton: {
    padding: 4,
  },
  progressBarTrack: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
