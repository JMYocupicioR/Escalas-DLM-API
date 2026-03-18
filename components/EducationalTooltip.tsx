import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Info, X } from 'lucide-react-native';

interface TooltipContent {
  title: string;
  description: string;
  details?: string[];
  examples?: string[];
}

interface EducationalTooltipProps {
  content: TooltipContent;
  children: React.ReactNode;
  iconSize?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function EducationalTooltip({ content, children, iconSize = 16 }: EducationalTooltipProps) {
  const { colors } = useThemedStyles();
  const [isVisible, setIsVisible] = useState(false);
  const styles = createStyles(colors);

  return (
    <>
      <View style={styles.container}>
        {children}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setIsVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Info size={iconSize} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{content.title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.description}>{content.description}</Text>

              {content.details && content.details.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Detalles:</Text>
                  {content.details.map((detail, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {detail}
                    </Text>
                  ))}
                </View>
              )}

              {content.examples && content.examples.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ejemplos:</Text>
                  {content.examples.map((example, index) => (
                    <Text key={index} style={styles.bulletPoint}>
                      • {example}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Contenido predefinido de tooltips
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      marginLeft: 8,
      padding: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      maxWidth: screenWidth - 40,
      maxHeight: '80%',
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 16,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      padding: 16,
    },
    description: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 16,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    bulletPoint: {
      fontSize: 13,
      color: colors.mutedText,
      lineHeight: 18,
      marginBottom: 4,
      marginLeft: 8,
    },
  });

export const TOOLTIP_CONTENT = {
  MRC_SCALE: {
    title: 'Escala MRC (Medical Research Council)',
    description: 'Sistema estándar para evaluar la fuerza muscular de 0 a 5.',
    details: [
      'MRC 0: Sin contracción muscular visible',
      'MRC 1: Contracción visible sin movimiento articular',
      'MRC 2: Movimiento articular sin gravedad',
      'MRC 3: Movimiento contra gravedad',
      'MRC 4: Movimiento contra resistencia (subdividido en 4-, 4, 4+)',
      'MRC 5: Fuerza muscular normal'
    ],
    examples: [
      'MRC 3: El paciente puede levantar el brazo pero no mantenerlo contra resistencia',
      'MRC 4: El paciente puede resistir cierta fuerza pero cede al máximo esfuerzo'
    ]
  },
  REFLEXES: {
    title: 'Reflejos Osteotendinosos',
    description: 'Evaluación de los reflejos profundos para localizar lesiones neurológicas.',
    details: [
      'Reflejo Bicipital (C5-C6): Percusión del tendón bicipital',
      'Reflejo Braquiorradial (C6-C7): Percusión del radio distal',
      'Reflejo Tricipital (C7-C8): Percusión del tendón tricipital'
    ],
    examples: [
      'Reflejo ausente: Sugiere lesión de la raíz correspondiente',
      'Reflejo exaltado: Puede indicar lesión de neurona motora superior'
    ]
  },
  DERMATOMES: {
    title: 'Dermatomas',
    description: 'Áreas de piel inervadas por una raíz nerviosa específica.',
    details: [
      'C5: Cara lateral del brazo (región deltoidea)',
      'C6: Pulgar, índice y cara lateral del antebrazo',
      'C7: Dedo medio y dorso de la mano',
      'C8: Meñique, anular y cara medial del antebrazo',
      'T1: Cara medial del brazo'
    ],
    examples: [
      'Pérdida sensitiva en C6: Afecta pulgar e índice',
      'Pérdida sensitiva en C8-T1: Afecta dedos meñique y anular'
    ]
  },
  PLEXUS_ANATOMY: {
    title: 'Anatomía del Plexo Braquial',
    description: 'Red nerviosa que inerva el miembro superior, formada por las raíces C5-T1.',
    details: [
      'Raíces: C5, C6, C7, C8, T1',
      'Troncos: Superior (C5-C6), Medio (C7), Inferior (C8-T1)',
      'Fascículos: Lateral, Posterior, Medial',
      'Nervios terminales: Axilar, Musculocutáneo, Radial, Mediano, Ulnar'
    ],
    examples: [
      'Lesión del tronco superior: Afecta C5-C6 (Erb-Duchenne)',
      'Lesión del tronco inferior: Afecta C8-T1 (Klumpke)'
    ]
  },
  DUAL_INNERVATION: {
    title: 'Inervación Dual',
    description: 'Músculos inervados por dos nervios diferentes, lo que puede preservar función parcial.',
    details: [
      'Braquial: Musculocutáneo + Radial',
      'Pectoral Mayor: Pectoral Lateral + Pectoral Medial',
      'Flexor Corto del Pulgar: Mediano + Ulnar',
      'Flexor Profundo: Mediano (2-3°) + Ulnar (4-5°)'
    ],
    examples: [
      'Lesión del musculocutáneo: El braquial mantiene función por el radial',
      'Túnel carpiano: Solo se afecta la porción mediana del flexor corto del pulgar'
    ]
  }
};
