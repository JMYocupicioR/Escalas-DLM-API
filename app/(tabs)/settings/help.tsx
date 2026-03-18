import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { HelpCircle, ExternalLink, BookOpen, MessageSquare, Video } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function HelpSettings() {
  const { colors } = useThemedStyles();

  const helpSections = [
    {
      title: 'Primeros pasos',
      items: [
        { title: '¿Cómo crear mi primera evaluación?', type: 'guide' },
        { title: 'Configurar mi perfil médico', type: 'guide' },
        { title: 'Entender los resultados de las escalas', type: 'guide' },
      ]
    },
    {
      title: 'Escalas médicas',
      items: [
        { title: 'Guía completa de escalas disponibles', type: 'documentation' },
        { title: 'Interpretación de puntuaciones', type: 'guide' },
        { title: 'Exportar e imprimir resultados', type: 'guide' },
      ]
    },
    {
      title: 'Calculadoras',
      items: [
        { title: 'Calculadora de toxina botulínica', type: 'guide' },
        { title: 'Puntos motores y anatomía', type: 'documentation' },
        { title: 'Diluciones y concentraciones', type: 'guide' },
      ]
    },
    {
      title: 'Privacidad y seguridad',
      items: [
        { title: 'Política de privacidad completa', type: 'policy' },
        { title: 'Seguridad de datos HIPAA', type: 'documentation' },
        { title: 'Gestión de consentimientos', type: 'guide' },
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Centro de ayuda web',
      description: 'Accede a nuestra base de conocimientos completa',
      icon: BookOpen,
      action: () => Linking.openURL('https://deepluxmed.mx/ayuda'),
      color: colors.primary,
    },
    {
      title: 'Contactar soporte',
      description: 'Envía un mensaje directo a nuestro equipo',
      icon: MessageSquare,
      action: () => Linking.openURL('mailto:soporte@deepluxmed.mx'),
      color: colors.success,
    },
    {
      title: 'Videos tutoriales',
      description: 'Aprende con videos paso a paso',
      icon: Video,
      action: () => Linking.openURL('https://deepluxmed.mx/tutoriales'),
      color: colors.warning,
    },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'guide': return BookOpen;
      case 'documentation': return HelpCircle;
      case 'policy': return ExternalLink;
      default: return BookOpen;
    }
  };

  const QuickActionCard = ({ title, description, icon: Icon, action, color }: any) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { borderColor: `${color}30` }]}
      onPress={action}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
      <ExternalLink size={20} color={colors.mutedText} />
    </TouchableOpacity>
  );

  const HelpItem = ({ title, type }: { title: string; type: string }) => {
    const Icon = getIconForType(type);
    return (
      <TouchableOpacity
        style={styles.helpItem}
        onPress={() => {
          // En una implementación real, aquí se navegaría al artículo específico
          console.log('Abrir artículo:', title);
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.helpItemIcon}>
          <Icon size={18} color={colors.mutedText} />
        </View>
        <Text style={styles.helpItemTitle}>{title}</Text>
        <ExternalLink size={16} color={colors.mutedText} />
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.mutedText,
      lineHeight: 22,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    quickActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    quickActionContent: {
      flex: 1,
      marginRight: 12,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    quickActionDescription: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
    helpSection: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    helpSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    helpItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    helpItemIcon: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    helpItemTitle: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: colors.mutedText,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ayuda',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Centro de ayuda</Text>
          <Text style={styles.headerSubtitle}>
            Encuentra respuestas a tus preguntas sobre Escalas DLM y las escalas médicas.
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceso rápido</Text>
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Artículos de ayuda</Text>
            {helpSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>{section.title}</Text>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex}>
                    <HelpItem {...item} />
                    {itemIndex < section.items.length - 1 && <View />}
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿No encuentras lo que buscas?{'\n'}
              Contáctanos en soporte@deepluxmed.mx
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}