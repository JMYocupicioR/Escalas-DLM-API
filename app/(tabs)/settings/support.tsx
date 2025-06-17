import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, MessageSquare, Send, ExternalLink, Copy, ArrowRight } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import * as Clipboard from 'expo-clipboard';

// Información de contacto
const SUPPORT_CONTACT = {
  email: 'soporte@deepluxmed.mx',
  phone: '+52 55 1234 5678',
  hours: 'Lunes a Viernes de 9:00 a 18:00 (GMT-6)',
  website: 'https://deepluxmed.mx/soporte'
};

export default function SupportScreen() {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Función para copiar texto al portapapeles
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert(
        'Copiado al portapapeles',
        `${label} copiado al portapapeles.`
      );
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      Alert.alert(
        'Error',
        'No se pudo copiar al portapapeles. Por favor, inténtalo de nuevo.'
      );
    }
  };

  // Función para enviar email de soporte
  const sendEmail = async () => {
    if (!message.trim()) {
      Alert.alert(
        'Mensaje requerido',
        'Por favor, escribe un mensaje para poder ayudarte mejor.'
      );
      return;
    }

    setSending(true);
    
    try {
      // Simular envío (en producción, esto se conectaría a un servicio real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Envío exitoso
      Alert.alert(
        'Mensaje enviado',
        'Tu solicitud de soporte ha sido enviada. Te contactaremos pronto.',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              setName('');
              setEmail('');
            }
          }
        ]
      );
    } catch (error) {
      // Error al enviar
      Alert.alert(
        'Error',
        'No se pudo enviar tu mensaje. Por favor intenta nuevamente o utiliza otro método de contacto.'
      );
    } finally {
      setSending(false);
    }
  };

  // Función para abrir enlace externo
  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Error',
        'No se puede abrir el enlace. Por favor visita manualmente nuestro sitio web.'
      );
    }
  };

  // Función para hacer una llamada telefónica
  const makePhoneCall = () => {
    const phoneUrl = `tel:${SUPPORT_CONTACT.phone.replace(/\s+/g, '')}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert(
        'Error',
        'No se puede realizar la llamada desde este dispositivo.'
      );
    });
  };

  // Función para enviar un email directo
  const sendSupportEmail = () => {
    const mailUrl = `mailto:${SUPPORT_CONTACT.email}?subject=Soporte DeepLuxMed App&body=`;
    Linking.openURL(mailUrl).catch(() => {
      Alert.alert(
        'Error',
        'No se puede abrir la aplicación de correo. Por favor envía un email manualmente.'
      );
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Soporte',
          headerShown: true,
          headerStyle: {
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          },
          headerTitleStyle: {
            color: darkMode ? '#f8fafc' : '#0f172a',
          },
          headerTintColor: '#0891b2',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Volver atrás"
              accessibilityRole="button"
            >
              <ArrowLeft size={24} color={darkMode ? '#f8fafc' : '#0f172a'} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>
              ¿Cómo podemos ayudarte?
            </Text>
            <Text style={[styles.headerDescription, darkMode && styles.headerDescriptionDark]}>
              Nuestro equipo de soporte está disponible para resolver tus dudas y 
              problemas con la aplicación.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
              Contacto Directo
            </Text>
            <View style={[styles.contactCard, darkMode && styles.contactCardDark]}>
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Mail size={20} color="#0891b2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, darkMode && styles.contactLabelDark]}>
                    Email
                  </Text>
                  <Text style={[styles.contactValue, darkMode && styles.contactValueDark]}>
                    {SUPPORT_CONTACT.email}
                  </Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => copyToClipboard(SUPPORT_CONTACT.email, 'Email')}
                    accessible={true}
                    accessibilityLabel="Copiar email"
                    accessibilityRole="button"
                  >
                    <Copy size={16} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={sendSupportEmail}
                    accessible={true}
                    accessibilityLabel="Enviar email"
                    accessibilityRole="button"
                  >
                    <Send size={16} color="#0891b2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Phone size={20} color="#0891b2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, darkMode && styles.contactLabelDark]}>
                    Teléfono
                  </Text>
                  <Text style={[styles.contactValue, darkMode && styles.contactValueDark]}>
                    {SUPPORT_CONTACT.phone}
                  </Text>
                  <Text style={[styles.contactHours, darkMode && styles.contactHoursDark]}>
                    {SUPPORT_CONTACT.hours}
                  </Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => copyToClipboard(SUPPORT_CONTACT.phone, 'Teléfono')}
                    accessible={true}
                    accessibilityLabel="Copiar teléfono"
                    accessibilityRole="button"
                  >
                    <Copy size={16} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={makePhoneCall}
                    accessible={true}
                    accessibilityLabel="Llamar a soporte"
                    accessibilityRole="button"
                  >
                    <Phone size={16} color="#0891b2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <ExternalLink size={20} color="#0891b2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, darkMode && styles.contactLabelDark]}>
                    Sitio Web
                  </Text>
                  <Text style={[styles.contactValue, darkMode && styles.contactValueDark]}>
                    {SUPPORT_CONTACT.website}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.visitButton}
                  onPress={() => openLink(SUPPORT_CONTACT.website)}
                  accessible={true}
                  accessibilityLabel="Visitar sitio web de soporte"
                  accessibilityRole="button"
                >
                  <Text style={styles.visitButtonText}>Visitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
              Enviar Mensaje
            </Text>
            <View style={[styles.formCard, darkMode && styles.formCardDark]}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, darkMode && styles.formLabelDark]}>
                  Nombre (opcional)
                </Text>
                <TextInput
                  style={[styles.input, darkMode && styles.inputDark]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre"
                  placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                  accessible={true}
                  accessibilityLabel="Nombre"
                  accessibilityHint="Introduce tu nombre"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, darkMode && styles.formLabelDark]}>
                  Email (opcional)
                </Text>
                <TextInput
                  style={[styles.input, darkMode && styles.inputDark]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu.email@ejemplo.com"
                  placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessible={true}
                  accessibilityLabel="Email"
                  accessibilityHint="Introduce tu dirección de email"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, darkMode && styles.formLabelDark]}>
                  Mensaje*
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.messageInput, 
                    darkMode && styles.inputDark
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe tu problema o consulta..."
                  placeholderTextColor={darkMode ? "#64748b" : "#94a3b8"}
                  multiline
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Mensaje"
                  accessibilityHint="Describe tu problema o consulta"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  message.trim() === '' && styles.submitButtonDisabled,
                  sending && styles.submitButtonLoading
                ]}
                onPress={sendEmail}
                disabled={message.trim() === '' || sending}
                accessible={true}
                accessibilityLabel="Enviar mensaje"
                accessibilityHint="Envía tu mensaje de soporte"
                accessibilityRole="button"
                accessibilityState={{ disabled: message.trim() === '' || sending }}
              >
                <MessageSquare size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>
                  {sending ? 'Enviando...' : 'Enviar Mensaje'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.faqSection}>
            <Text style={[styles.faqTitle, darkMode && styles.faqTitleDark]}>
              Preguntas Frecuentes
            </Text>
            <Text style={[styles.faqDescription, darkMode && styles.faqDescriptionDark]}>
              Visita nuestra sección de Preguntas Frecuentes para respuestas
              rápidas a problemas comunes.
            </Text>
            <TouchableOpacity 
              style={styles.faqButton}
              onPress={() => router.push('/settings/faq')}
              accessible={true}
              accessibilityLabel="Ver preguntas frecuentes"
              accessibilityRole="button"
            >
              <Text style={styles.faqButtonText}>
                Ver Preguntas Frecuentes
              </Text>
              <ArrowRight size={16} color="#0891b2" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  backButton: {
    padding: 8,
  },
  headerContainer: {
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  headerTitleDark: {
    color: '#f8fafc',
  },
  headerDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  headerDescriptionDark: {
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#f8fafc',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactCardDark: {
    backgroundColor: '#1e293b',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  contactLabelDark: {
    color: '#94a3b8',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  contactValueDark: {
    color: '#f8fafc',
  },
  contactHours: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  contactHoursDark: {
    color: '#94a3b8',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  visitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0891b2',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formCardDark: {
    backgroundColor: '#1e293b',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 6,
  },
  formLabelDark: {
    color: '#f8fafc',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputDark: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  messageInput: {
    height: 120,
    paddingTop: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891b2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  submitButtonLoading: {
    backgroundColor: '#0891b2aa',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  faqSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 32,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  faqTitleDark: {
    color: '#f8fafc',
  },
  faqDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  faqDescriptionDark: {
    color: '#94a3b8',
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  faqButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0891b2',
    marginRight: 8,
  }
});