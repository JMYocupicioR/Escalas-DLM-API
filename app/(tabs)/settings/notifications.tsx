import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Clock, Database, Zap } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function NotificationsSettings() {
  const { colors } = useThemedStyles();
  const {
    notifications,
    reminderNotifications,
    updateNotifications,
    evaluationReminders,
    dataBackupNotifications,
    toggleNotifications,
    toggleReminderNotifications,
    toggleUpdateNotifications,
    toggleEvaluationReminders,
    toggleDataBackupNotifications,
  } = useSettingsStore();

  const NotificationItem = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    onToggle, 
    disabled = false 
  }: {
    icon: any;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.item, disabled && styles.itemDisabled]}>
      <View style={styles.iconContainer}>
        <Icon size={20} color={disabled ? colors.mutedText : colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.title, disabled && styles.titleDisabled]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ 
          false: colors.border, 
          true: colors.primary 
        }}
        thumbColor={Platform.OS === 'ios' ? '#ffffff' : value ? '#ffffff' : colors.card}
        accessibilityLabel={title}
      />
    </View>
  );

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
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemDisabled: {
      opacity: 0.5,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    titleDisabled: {
      color: colors.mutedText,
    },
    description: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
    warningSection: {
      backgroundColor: `${colors.warning}10`,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      borderWidth: 1,
      borderColor: `${colors.warning}30`,
    },
    warningText: {
      fontSize: 14,
      color: colors.warning,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notificaciones',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            Configura qué notificaciones quieres recibir de la aplicación médica.
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración general</Text>
            <NotificationItem
              icon={Bell}
              title="Notificaciones generales"
              description="Activar o desactivar todas las notificaciones de la aplicación"
              value={notifications}
              onToggle={toggleNotifications}
            />
          </View>

          {!notifications && (
            <View style={styles.warningSection}>
              <Text style={styles.warningText}>
                Las notificaciones están desactivadas. Activa las notificaciones generales para configurar tipos específicos.
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de notificaciones</Text>
            
            <NotificationItem
              icon={Clock}
              title="Recordatorios"
              description="Recordatorios para completar evaluaciones pendientes y seguimientos"
              value={reminderNotifications}
              onToggle={toggleReminderNotifications}
              disabled={!notifications}
            />

            <NotificationItem
              icon={Zap}
              title="Actualizaciones de la app"
              description="Notificaciones sobre nuevas funciones, escalas y mejoras"
              value={updateNotifications}
              onToggle={toggleUpdateNotifications}
              disabled={!notifications}
            />

            <NotificationItem
              icon={Bell}
              title="Recordatorios de evaluación"
              description="Alertas para evaluar pacientes según cronogramas establecidos"
              value={evaluationReminders}
              onToggle={toggleEvaluationReminders}
              disabled={!notifications}
            />

            <NotificationItem
              icon={Database}
              title="Respaldo de datos"
              description="Notificaciones sobre el estado de respaldo y sincronización de datos"
              value={dataBackupNotifications}
              onToggle={toggleDataBackupNotifications}
              disabled={!notifications}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.item}>
              <View style={styles.content}>
                <Text style={styles.title}>Configuración del sistema</Text>
                <Text style={styles.description}>
                  Para modificar los permisos de notificaciones, accede a la configuración del sistema en Ajustes → Aplicaciones → DeepLuxMed → Notificaciones.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
