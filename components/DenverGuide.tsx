import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { 
  Info, 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Baby,
  Brain,
  Eye,
  Hand,
  MessageCircle,
  Activity,
  HelpCircle,
  Calendar,
  Calculator
} from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface DenverGuideProps {
  visible: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  content: string[];
}

export function DenverGuide({ visible, onClose }: DenverGuideProps) {
  const { colors } = useThemedStyles();
  const styles = createStyles(colors);
  const [selectedSection, setSelectedSection] = useState<string>('overview');

  const guideSections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Información General',
      icon: Info,
      color: '#0891b2',
      content: [
        'El Denver II es una prueba de tamizaje del desarrollo infantil para niños de 0 a 6 años.',
        'NO es una prueba de inteligencia ni un diagnóstico definitivo.',
        'Su propósito es identificar niños que podrían necesitar una evaluación más detallada.',
        'La prueba tiene alta sensibilidad (83%) pero baja especificidad (43%), lo que significa que puede generar falsos positivos.',
      ]
    },
    {
      id: 'age-calculation',
      title: 'Cálculo de Edad',
      icon: Calculator,
      color: '#10b981',
      content: [
        'Calcule la edad exacta del niño en años, meses y días.',
        'Para niños prematuros (nacidos antes de las 38 semanas), corrija la edad hasta los 2 años.',
        'Fórmula: Edad corregida = Edad cronológica - (40 - semanas de gestación) × 7 días',
        'Esta edad corregida determina qué ítems evaluar.',
      ]
    },
    {
      id: 'domains',
      title: 'Áreas de Desarrollo',
      icon: Brain,
      color: '#8b5cf6',
      content: [
        'Personal-Social: Interacción social, autocuidado y autonomía.',
        'Motor Fino-Adaptativo: Coordinación ojo-mano y manipulación de objetos.',
        'Lenguaje: Audición, comprensión y expresión verbal.',
        'Motor Grueso: Control de grandes grupos musculares y movimientos corporales.',
      ]
    },
    {
      id: 'scoring',
      title: 'Sistema de Calificación',
      icon: CheckCircle,
      color: '#f59e0b',
      content: [
        'P (Pase): El niño realiza la tarea exitosamente.',
        'F (Fallo): El niño no logra realizar la tarea.',
        'R (Rechazo): El niño se niega a intentar la tarea.',
        'NO (Nueva Oportunidad): Fallo en una habilidad que aún está aprendiendo.',
      ]
    },
    {
      id: 'interpretation',
      title: 'Interpretación de Resultados',
      icon: AlertTriangle,
      color: '#ef4444',
      content: [
        'Normal: Sin retrasos y máximo 1 precaución.',
        'Sospechoso: 2+ retrasos, o 1 retraso + 2+ precauciones, o 3+ precauciones.',
        'No Evaluable: Demasiados rechazos para interpretar vállidamente.',
        'Un resultado "Sospechoso" NO es un diagnóstico, sino una indicación para evaluación adicional.',
      ]
    },
    {
      id: 'recommendations',
      title: 'Recomendaciones',
      icon: HelpCircle,
      color: '#06b6d4',
      content: [
        'Normal: Continuar vigilancia de rutina en controles regulares.',
        'Sospechoso: Reevaluar en 1-2 semanas. Si persiste, referir a especialista.',
        'No Evaluable: Intentar nueva evaluación en 1-2 semanas.',
        'Siempre considerar el contexto cultural y las prácticas de crianza.',
      ]
    }
  ];

  const selectedSectionData = guideSections.find(s => s.id === selectedSection);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          entering={SlideInDown.duration(300)}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#0891b215' }]}>
                <Brain size={24} color="#0891b2" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Guía del Denver II</Text>
                <Text style={styles.modalSubtitle}>Cómo usar correctamente la prueba</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Navigation Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
              {guideSections.map((section) => {
                const IconComponent = section.icon;
                const isSelected = selectedSection === section.id;
                
                return (
                  <TouchableOpacity
                    key={section.id}
                    style={[
                      styles.tab,
                      isSelected && styles.tabSelected,
                      { borderColor: section.color }
                    ]}
                    onPress={() => setSelectedSection(section.id)}
                  >
                    <IconComponent 
                      size={16} 
                      color={isSelected ? '#ffffff' : section.color} 
                    />
                    <Text style={[
                      styles.tabText,
                      isSelected && styles.tabTextSelected,
                      !isSelected && { color: section.color }
                    ]}>
                      {section.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Content */}
            <ScrollView style={styles.sectionContent}>
              {selectedSectionData && (
                <Animated.View entering={FadeIn.duration(200)} key={selectedSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[
                      styles.sectionIcon, 
                      { backgroundColor: `${selectedSectionData.color}15` }
                    ]}>
                      <selectedSectionData.icon 
                        size={20} 
                        color={selectedSectionData.color} 
                      />
                    </View>
                    <Text style={styles.sectionTitle}>
                      {selectedSectionData.title}
                    </Text>
                  </View>

                  <View style={styles.sectionBody}>
                    {selectedSectionData.content.map((paragraph, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <View style={[styles.bullet, { backgroundColor: selectedSectionData.color }]} />
                        <Text style={styles.bulletText}>{paragraph}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Special content for scoring section */}
                  {selectedSection === 'scoring' && (
                    <View style={styles.scoringExamples}>
                      <Text style={styles.examplesTitle}>Ejemplos de Calificación:</Text>
                      <View style={styles.exampleGrid}>
                        <View style={[styles.exampleCard, { backgroundColor: '#dcfce715' }]}>
                          <CheckCircle size={20} color="#22c55e" />
                          <Text style={styles.exampleLabel}>P - Pase</Text>
                          <Text style={styles.exampleDesc}>El niño realiza la tarea correctamente</Text>
                        </View>
                        <View style={[styles.exampleCard, { backgroundColor: '#fee2e215' }]}>
                          <XCircle size={20} color="#ef4444" />
                          <Text style={styles.exampleLabel}>F - Fallo</Text>
                          <Text style={styles.exampleDesc}>El niño no puede realizar la tarea</Text>
                        </View>
                        <View style={[styles.exampleCard, { backgroundColor: '#ffedd515' }]}>
                          <AlertTriangle size={20} color="#f97316" />
                          <Text style={styles.exampleLabel}>R - Rechazo</Text>
                          <Text style={styles.exampleDesc}>El niño se niega a intentar</Text>
                        </View>
                        <View style={[styles.exampleCard, { backgroundColor: '#f3f4f615' }]}>
                          <Clock size={20} color="#6b7280" />
                          <Text style={styles.exampleLabel}>NO - Nueva Oport.</Text>
                          <Text style={styles.exampleDesc}>Aún está en edad de aprender</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </Animated.View>
              )}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <Text style={styles.footerButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Quick Info Button Component
interface DenverInfoButtonProps {
  onPress: () => void;
}

export function DenverInfoButton({ onPress }: DenverInfoButtonProps) {
  const { colors } = useThemedStyles();
  
  return (
    <TouchableOpacity
      style={[styles.infoButton, { backgroundColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Info size={20} color="#ffffff" />
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 600,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.sectionBackground,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.card,
    marginRight: 8,
    gap: 6,
  },
  tabSelected: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: '#ffffff',
  },
  sectionContent: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionBody: {
    gap: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    flex: 1,
  },
  scoringExamples: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.sectionBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  exampleDesc: {
    fontSize: 10,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
});

// Quick Tips Component for each step
interface QuickTipsProps {
  step: string;
}

export function DenverQuickTips({ step }: QuickTipsProps) {
  const { colors } = useThemedStyles();
  const styles = createQuickTipsStyles(colors);
  
  const getTipsForStep = (currentStep: string) => {
    switch (currentStep) {
      case 'form':
        return {
          title: 'Datos del Paciente',
          tips: [
            'Asegúrese de tener la fecha de nacimiento exacta',
            'Las semanas de gestación son cruciales para el cálculo de edad',
            'Para niños prematuros, se ajustará automáticamente la edad'
          ]
        };
      case 'Motor Grueso':
        return {
          title: 'Evaluación Motora Gruesa',
          tips: [
            'Observe movimientos corporales globales',
            'Evalúe control de cabeza, sentarse, caminar, saltar',
            'Algunos ítems pueden reportarse por el cuidador (R)'
          ]
        };
      case 'Motor Fino-Adaptativo':
        return {
          title: 'Motor Fino-Adaptativo',
          tips: [
            'Enfoque en coordinación ojo-mano',
            'Observe manipulación de objetos pequeños',
            'Incluye tareas de dibujo y construcción'
          ]
        };
      case 'Personal-Social':
        return {
          title: 'Área Personal-Social',
          tips: [
            'Evalúe habilidades sociales y autocuidado',
            'Muchos ítems pueden reportarse por el cuidador',
            'Observe interacción e independencia'
          ]
        };
      case 'Lenguaje':
        return {
          title: 'Evaluación del Lenguaje',
          tips: [
            'Incluye comprensión y expresión',
            'Observe vocalizaciones y seguimiento de órdenes',
            'Algunos ítems requieren observación directa'
          ]
        };
      default:
        return {
          title: 'Evaluación Denver II',
          tips: ['Siga las instrucciones para cada área de desarrollo']
        };
    }
  };

  const tipData = getTipsForStep(step);

  return (
    <View style={styles.quickTips}>
      <View style={styles.tipsHeader}>
        <HelpCircle size={16} color={colors.primary} />
        <Text style={styles.tipsTitle}>
          {tipData.title}
        </Text>
      </View>
      {tipData.tips.map((tip, index) => (
        <View key={index} style={styles.tipItem}>
          <View style={styles.tipBullet} />
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
}

const createQuickTipsStyles = (colors: any) => StyleSheet.create({
  quickTips: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sectionBackground,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    color: colors.text,
  },
});
