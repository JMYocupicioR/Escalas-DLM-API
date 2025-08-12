import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useMemo } from 'react';
import { Globe as Globe2, Moon, Bell, Clock, Ruler, ChevronRight, Info, FileText, Shield, MessageSquareText, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const notifications = useSettingsStore((s) => s.notifications);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);

  const themedStyles = useMemo(() => {
    const isDark = darkMode;
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
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
        color: isDark ? '#94a3b8' : '#64748b',
        textTransform: 'uppercase',
        marginBottom: 8,
      },
      sectionContent: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#334155' : '#f1f5f9',
      },
      settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      settingContent: { flex: 1 },
      settingTitle: { fontSize: 16, color: isDark ? '#f8fafc' : '#0f172a', marginBottom: 2 },
      settingValue: { fontSize: 14, color: isDark ? '#94a3b8' : '#64748b' },
      footer: { marginTop: 32, marginBottom: 24, alignItems: 'center', paddingHorizontal: 16 },
      footerText: { fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 },
      footerVersion: { fontSize: 12, color: isDark ? '#64748b' : '#94a3b8' },
    });
  }, [darkMode]);

  const SettingItem = ({ icon: Icon, title, value, onPress, showToggle, isToggled, showChevron = true }) => (
    <TouchableOpacity style={themedStyles.settingItem} onPress={onPress}>
      <View style={themedStyles.settingIcon}>
        <Icon size={22} color={darkMode ? "#94a3b8" : "#64748b"} />
      </View>
      <View style={themedStyles.settingContent}>
        <Text style={themedStyles.settingTitle}>{title}</Text>
        {value && <Text style={themedStyles.settingValue}>{value}</Text>}
      </View>
      {showToggle ? (
        <Switch
          value={isToggled}
          onValueChange={onPress}
          trackColor={{ false: '#cbd5e1', true: '#0891b2' }}
          thumbColor={Platform.OS === 'ios' ? '#ffffff' : isToggled ? '#ffffff' : '#f1f5f9'}
        />
      ) : showChevron ? (
        <ChevronRight size={20} color={darkMode ? "#64748b" : "#94a3b8"} />
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
      <SafeAreaView style={themedStyles.container} edges={['bottom']}>
        <ScrollView style={themedStyles.content}>
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Preferencias de Usuario</Text>
            <View style={themedStyles.sectionContent}>
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
                isToggled={darkMode}
                onPress={toggleDarkMode}
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

          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Notificaciones</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Bell}
                title="Notificaciones Push"
                showToggle
                isToggled={notifications}
                onPress={toggleNotifications}
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

          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Información de la App</Text>
            <View style={themedStyles.sectionContent}>
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

          <View style={themedStyles.footer}>
            <Text style={themedStyles.footerText}>DeepLuxMed.mx © 2024</Text>
            <Text style={themedStyles.footerVersion}>Versión 1.0.0 (Build 100)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Eliminamos los estilos estáticos ya que usamos themedStyles dinámicos