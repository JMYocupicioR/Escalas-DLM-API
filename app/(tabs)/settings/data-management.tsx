import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Download, Upload, Trash2, Database, Shield, HardDrive } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export default function DataManagementSettings() {
  const { colors } = useThemedStyles();
  const { dataRetentionDays, setDataRetentionDays } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = async () => {
    Alert.alert(
      'Exportar datos',
      'Se exportarán todas tus evaluaciones, configuraciones y datos de pacientes en un archivo JSON seguro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Simular exportación
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                settings: { dataRetentionDays },
                evaluations: [],
                patients: [],
              };
              
              // En una implementación real, aquí se generaría y descargaría el archivo
              if (typeof window !== 'undefined') {
                const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute('href', dataStr);
                downloadAnchorNode.setAttribute('download', `deepluxmed-export-${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }
              
              Alert.alert('Éxito', 'Los datos se han exportado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron exportar los datos. Intenta nuevamente.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Importar datos',
      'Esta función permitirá importar datos desde un archivo de exportación previo. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            Alert.alert('Próximamente', 'La función de importación estará disponible en una próxima actualización.');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar caché',
      'Se eliminarán los datos temporales y archivos de caché. Esto puede mejorar el rendimiento.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            // Simular limpieza de caché
            Alert.alert('Éxito', 'El caché se ha limpiado correctamente.');
          }
        }
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta acción eliminará TODOS tus datos de forma permanente. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación final',
              '¿Estás completamente seguro? Todos los datos se perderán para siempre.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sí, eliminar todo',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Simulación', 'En la versión real, todos los datos serían eliminados.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const DataActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onPress, 
    color = colors.primary,
    loading = false 
  }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
    color?: string;
    loading?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionCard, { borderColor: `${color}30` }]}
      onPress={onPress}
      disabled={loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Icon size={24} color={color} />
        )}
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  const RetentionOption = ({ days, label }: { days: number; label: string }) => (
    <TouchableOpacity
      style={[
        styles.retentionOption,
        dataRetentionDays === days && styles.retentionOptionSelected
      ]}
      onPress={() => setDataRetentionDays(days)}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ checked: dataRetentionDays === days }}
    >
      <Text style={[
        styles.retentionLabel,
        dataRetentionDays === days && styles.retentionLabelSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
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
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 14,
      color: colors.mutedText,
      lineHeight: 20,
    },
    retentionContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retentionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    retentionDescription: {
      fontSize: 14,
      color: colors.mutedText,
      marginBottom: 16,
      lineHeight: 20,
    },
    retentionOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    retentionOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    retentionOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    retentionLabel: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    retentionLabelSelected: {
      color: '#ffffff',
    },
    warningCard: {
      backgroundColor: `${colors.error}10`,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: `${colors.error}30`,
      marginTop: 12,
    },
    warningText: {
      fontSize: 14,
      color: colors.error,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gestión de datos',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestión de datos</Text>
          <Text style={styles.headerSubtitle}>
            Administra tus datos médicos, exportaciones y configuraciones de privacidad.
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exportar e importar</Text>
            
            <DataActionCard
              icon={Download}
              title="Exportar datos"
              description="Crear una copia de seguridad de todas tus evaluaciones y configuraciones"
              onPress={handleExportData}
              loading={isLoading}
            />

            <DataActionCard
              icon={Upload}
              title="Importar datos"
              description="Restaurar datos desde un archivo de exportación previo"
              onPress={handleImportData}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Retención de datos</Text>
            <View style={styles.retentionContainer}>
              <Text style={styles.retentionTitle}>Periodo de conservación</Text>
              <Text style={styles.retentionDescription}>
                Los datos de evaluaciones se conservarán durante el periodo seleccionado antes de ser eliminados automáticamente.
              </Text>
              <View style={styles.retentionOptions}>
                <RetentionOption days={30} label="30 días" />
                <RetentionOption days={90} label="90 días" />
                <RetentionOption days={180} label="6 meses" />
                <RetentionOption days={365} label="1 año" />
                <RetentionOption days={1825} label="5 años" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mantenimiento</Text>
            
            <DataActionCard
              icon={HardDrive}
              title="Limpiar caché"
              description="Eliminar archivos temporales para mejorar el rendimiento"
              onPress={handleClearCache}
              color={colors.warning}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zona peligrosa</Text>
            
            <DataActionCard
              icon={Trash2}
              title="Eliminar todos los datos"
              description="Eliminar permanentemente todos los datos almacenados"
              onPress={handleDeleteAllData}
              color={colors.error}
            />
            
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                Esta acción es irreversible. Asegúrate de exportar tus datos antes de eliminarlos.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}