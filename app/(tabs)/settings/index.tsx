import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Globe as Globe2, Moon, Bell, Clock, Ruler, ChevronRight, Info, FileText, Shield, MessageSquareText, CircleHelp as HelpCircle } from 'lucide-react-native';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const SettingItem = ({ icon: Icon, title, value, onPress, showToggle, isToggled, showChevron = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon size={22} color="#64748b" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {showToggle ? (
        <Switch
          value={isToggled}
          onValueChange={onPress}
          trackColor={{ false: '#cbd5e1', true: '#0891b2' }}
          thumbColor={Platform.OS === 'ios' ? '#ffffff' : isToggled ? '#ffffff' : '#f1f5f9'}
        />
      ) : showChevron ? (
        <ChevronRight size={20} color="#94a3b8" />
      ) : null}
    </TouchableOpacity>
  );

  const navigateToSubpage = (page) => {
    router.push(`/settings/${page}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ajustes',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferencias de Usuario</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={Globe2}
                title="Idioma"
                value="Español"
                onPress={() => navigateToSubpage('language')}
              />
              <SettingItem
                icon={Moon}
                title="Tema Oscuro"
                showToggle
                isToggled={isDarkMode}
                onPress={() => setIsDarkMode(!isDarkMode)}
              />
              <SettingItem
                icon={Clock}
                title="Formato de Fecha y Hora"
                value="24 horas"
                onPress={() => {}}
              />
              <SettingItem
                icon={Ruler}
                title="Unidades de Medida"
                value="Métrico"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={Bell}
                title="Notificaciones Push"
                showToggle
                isToggled={notifications}
                onPress={() => setNotifications(!notifications)}
              />
              <SettingItem
                icon={Bell}
                title="Tipos de Alertas"
                onPress={() => navigateToSubpage('notifications')}
              />
              <SettingItem
                icon={Clock}
                title="Horarios"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de la App</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={Info}
                title="Versión"
                value="1.0.0"
                showChevron={false}
                onPress={() => {}}
              />
              <SettingItem
                icon={FileText}
                title="Notas de la Versión"
                onPress={() => {}}
              />
              <SettingItem
                icon={Shield}
                title="Política de Privacidad"
                onPress={() => navigateToSubpage('privacy')}
              />
              <SettingItem
                icon={FileText}
                title="Términos y Condiciones"
                onPress={() => navigateToSubpage('terms')}
              />
              <SettingItem
                icon={MessageSquareText}
                title="Contacto de Soporte"
                onPress={() => navigateToSubpage('support')}
              />
              <SettingItem
                icon={HelpCircle}
                title="Preguntas Frecuentes"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>DeepLuxMed.mx © 2024</Text>
            <Text style={styles.footerVersion}>Versión 1.0.0 (Build 100)</Text>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Estilos para modo oscuro (para futura implementación)
  containerDark: {
    backgroundColor: '#0f172a',
  },
  sectionTitleDark: {
    color: '#94a3b8',
  },
  sectionContentDark: {
    backgroundColor: '#1e293b',
  },
  settingItemDark: {
    borderBottomColor: '#334155',
  },
  settingIconDark: {
    backgroundColor: '#0f172a',
  },
  settingTitleDark: {
    color: '#f8fafc',
  },
  settingValueDark: {
    color: '#94a3b8',
  },
  footerTextDark: {
    color: '#94a3b8',
  },
  footerVersionDark: {
    color: '#64748b',
  }
});