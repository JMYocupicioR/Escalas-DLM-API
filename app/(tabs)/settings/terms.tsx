import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FileText, AlertTriangle, Shield, Scale, Zap, Globe, Phone } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function TermsSettings() {
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
    warningBox: {
      backgroundColor: '#fef3c7',
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b',
      padding: 16,
      borderRadius: 8,
      marginVertical: 16,
    },
    warningText: {
      fontSize: 14,
      color: '#92400e',
      lineHeight: 20,
      fontWeight: '500',
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
    importantText: {
      fontWeight: '600',
      color: colors.text,
    },
  });

  const handleContactPress = () => {
    Linking.openURL('mailto:legal@deepluxmed.mx?subject=Consulta sobre Términos y Condiciones');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+525555551234');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Términos y Condiciones',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Términos y Condiciones</Text>
            <Text style={styles.subtitle}>
              Condiciones de uso de la aplicación de escalas médicas DeepLuxMed.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              <Text style={{ fontWeight: '700' }}>Importante:</Text> Esta aplicación está destinada para uso médico profesional. 
              No reemplaza el juicio clínico ni la consulta médica directa.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Aceptación de Términos</Text>
            </View>
            <Text style={styles.paragraph}>
              Al usar esta aplicación, usted acepta estos términos y condiciones. Si no está de acuerdo, 
              no debe utilizar la aplicación.
            </Text>
            <Text style={styles.paragraph}>
              DeepLuxMed se reserva el derecho de modificar estos términos en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Uso Médico Profesional</Text>
            </View>
            <Text style={styles.paragraph}>
              Esta aplicación está <Text style={styles.importantText}>exclusivamente destinada</Text> para:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Médicos licenciados y profesionales de la salud</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Estudiantes de medicina bajo supervisión</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Instituciones de salud autorizadas</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Fines educativos y de investigación médica</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <AlertTriangle size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Limitaciones y Responsabilidades</Text>
            </View>
            <Text style={styles.paragraph}>
              <Text style={styles.importantText}>Esta aplicación NO debe usarse como:</Text>
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Sustituto del juicio clínico profesional</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Única herramienta de diagnóstico</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Reemplazo de la evaluación médica directa</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Base única para decisiones de tratamiento</Text>
            </View>
            <Text style={styles.paragraph}>
              El profesional de salud es <Text style={styles.importantText}>totalmente responsable</Text> 
              de la interpretación de resultados y decisiones clínicas.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Scale size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Precisión y Validación</Text>
            </View>
            <Text style={styles.paragraph}>
              Las escalas implementadas están basadas en literatura médica revisada por pares y 
              guías clínicas reconocidas internacionalmente.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.importantText}>Sin embargo:</Text> DeepLuxMed no garantiza la precisión absoluta 
              de los resultados y recomienda siempre validar con fuentes primarias.
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Verificar siempre con literatura médica actual</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Considerar el contexto clínico completo</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Aplicar criterio médico profesional</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Zap size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Disponibilidad del Servicio</Text>
            </View>
            <Text style={styles.paragraph}>
              DeepLuxMed se esfuerza por mantener la aplicación disponible 24/7, pero no garantiza 
              disponibilidad ininterrumpida.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.importantText}>Recomendamos:</Text>
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>No depender exclusivamente de la aplicación</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Tener métodos alternativos de evaluación</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Respaldar regularmente los datos importantes</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Globe size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Jurisdicción</Text>
            </View>
            <Text style={styles.paragraph}>
              Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta 
              en los tribunales competentes de la Ciudad de México.
            </Text>
            <Text style={styles.paragraph}>
              Para usuarios internacionales, se aplicarán también las regulaciones locales aplicables 
              de práctica médica.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Phone size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Contacto Legal</Text>
            </View>
            <Text style={styles.paragraph}>
              Para consultas legales o dudas sobre estos términos:
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>legal@deepluxmed.mx</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handlePhonePress}>
              <Phone size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>+52 55 5555-1234</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Última actualización: 3 de septiembre de 2024
            </Text>
            <Text style={[styles.lastUpdatedText, { marginTop: 4 }]}>
              Versión 1.0 - Aplicable a partir del 1 de enero de 2024
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}