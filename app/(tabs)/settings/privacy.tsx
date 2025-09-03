import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Shield, Eye, Database, Lock, Globe, Mail, FileText } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function PrivacySettings() {
  const { colors } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    header: {
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedText,
      lineHeight: 22,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    sectionContent: {
      lineHeight: 22,
    },
    paragraph: {
      fontSize: 15,
      color: colors.mutedText,
      marginBottom: 12,
      lineHeight: 22,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    bullet: {
      fontSize: 15,
      color: colors.primary,
      marginRight: 8,
      marginTop: 2,
    },
    bulletText: {
      fontSize: 15,
      color: colors.mutedText,
      flex: 1,
      lineHeight: 22,
    },
    contactButton: {
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    contactButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 8,
      flex: 1,
    },
    lastUpdated: {
      marginTop: 24,
      padding: 16,
      backgroundColor: colors.card + '80',
      borderRadius: 12,
      alignItems: 'center',
    },
    lastUpdatedText: {
      fontSize: 14,
      color: colors.mutedText,
    },
  });

  const handleContactPress = () => {
    Linking.openURL('mailto:privacidad@deepluxmed.mx?subject=Consulta sobre Política de Privacidad');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://deepluxmed.mx/privacidad');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Política de Privacidad',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Política de Privacidad</Text>
            <Text style={styles.subtitle}>
              Protegemos tu información médica con los más altos estándares de seguridad y privacidad.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Protección de Datos Médicos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                DeepLuxMed cumple con las regulaciones HIPAA, GDPR y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Todos los datos se almacenan de forma encriptada</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Acceso restringido solo a personal autorizado</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Auditorías de seguridad regulares</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Database size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Recopilación de Datos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                Recopilamos únicamente los datos necesarios para proporcionar servicios médicos de calidad:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Información demográfica del paciente</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Resultados de evaluaciones médicas</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Historial de uso de la aplicación</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Datos técnicos para mejorar el servicio</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Eye size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Uso de la Información</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                Tu información se utiliza exclusivamente para:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Proporcionar servicios de evaluación médica</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Generar reportes clínicos personalizados</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Mejorar la precisión de las evaluaciones</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Soporte técnico y actualizaciones</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Lock size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Tus Derechos</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                Tienes derecho a:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Acceder a tus datos personales</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Rectificar información inexacta</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Cancelar el tratamiento de datos</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Oponerte al uso de tus datos</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Portabilidad de datos médicos</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Globe size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Compartir Información</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                <Text style={{ fontWeight: '600' }}>Nunca vendemos</Text> tu información personal. Solo compartimos datos cuando:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Tienes consentimiento explícito</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Es requerido por ley</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Para proteger la seguridad del paciente</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Mail size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Contacto</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.paragraph}>
                Para cualquier pregunta sobre privacidad o ejercer tus derechos:
              </Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                <Mail size={20} color={colors.primary} />
                <Text style={styles.contactButtonText}>privacidad@deepluxmed.mx</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={handleWebsitePress}>
                <FileText size={20} color={colors.primary} />
                <Text style={styles.contactButtonText}>Ver política completa</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Última actualización: 3 de septiembre de 2024
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}