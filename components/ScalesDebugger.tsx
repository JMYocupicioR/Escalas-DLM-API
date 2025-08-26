import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAutoUpdatingScales } from '@/hooks/useAutoUpdatingScales';
import { useSimpleScales } from '@/hooks/useSimpleScales';
import { DEV_CONFIG } from '@/config/development';

export function ScalesDebugger() {
  // Hook complejo
  const { 
    scales: complexScales, 
    totalScales: complexTotal, 
    lastUpdate, 
    isUpdating, 
    error: complexError,
    forceUpdate 
  } = useAutoUpdatingScales({
    updateInterval: DEV_CONFIG.SCALES.AUTO_UPDATE_INTERVAL,
    enableAutoUpdate: true,
    enableLogging: true
  });

  // Hook simple
  const {
    scales: simpleScales,
    loading: simpleLoading,
    error: simpleError,
    totalScales: simpleTotal
  } = useSimpleScales();

  const handleForceUpdate = () => {
    console.log('🔧 Manual update triggered from debugger');
    forceUpdate();
  };

  const logAllScales = () => {
    console.log('=== ALL SCALES DEBUG ===');
    console.log('Complex hook - Total scales:', complexTotal);
    console.log('Complex hook - Scales array:', complexScales);
    console.log('Simple hook - Total scales:', simpleTotal);
    console.log('Simple hook - Scales array:', simpleScales);
    console.log('Last update:', new Date(lastUpdate).toLocaleTimeString());
    
    // Check for specific scales in both hooks
    const fimScaleComplex = complexScales.find(s => s.id === 'fim');
    const lequesneScaleComplex = complexScales.find(s => s.id === 'lequesne-rodilla-es-v1');
    const barthelScaleComplex = complexScales.find(s => s.id === 'barthel');
    
    const fimScaleSimple = simpleScales.find(s => s.id === 'fim');
    const lequesneScaleSimple = simpleScales.find(s => s.id === 'lequesne-rodilla-es-v1');
    const barthelScaleSimple = simpleScales.find(s => s.id === 'barthel');
    
    console.log('Complex Hook - FIM scale found:', fimScaleComplex);
    console.log('Complex Hook - Lequesne scale found:', lequesneScaleComplex);
    console.log('Complex Hook - Barthel scale found:', barthelScaleComplex);
    
    console.log('Simple Hook - FIM scale found:', fimScaleSimple);
    console.log('Simple Hook - Lequesne scale found:', lequesneScaleSimple);
    console.log('Simple Hook - Barthel scale found:', barthelScaleSimple);
  };

  // Test direct import
  const testDirectImport = async () => {
    try {
      console.log('=== TESTING DIRECT IMPORT ===');
      const { scalesById } = await import('@/data/_scales');
      console.log('Direct import successful');
      console.log('scalesById keys:', Object.keys(scalesById));
      console.log('scalesById values:', Object.values(scalesById));
      console.log('Total scales from direct import:', Object.values(scalesById).length);
    } catch (error) {
      console.error('Direct import failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug de Escalas</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📊 Hook Complejo: <Text style={styles.highlight}>{complexTotal}</Text> escalas
        </Text>
        <Text style={styles.infoText}>
          📊 Hook Simple: <Text style={styles.highlight}>{simpleTotal}</Text> escalas
        </Text>
        <Text style={styles.infoText}>
          🕒 Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
        </Text>
        <Text style={styles.infoText}>
          🔄 Estado: {isUpdating ? 'Actualizando...' : 'Idle'}
        </Text>
        <Text style={styles.infoText}>
          📱 Hook Simple: {simpleLoading ? 'Cargando...' : 'Cargado'}
        </Text>
        {complexError && (
          <Text style={styles.errorText}>
            ❌ Error Hook Complejo: {complexError}
          </Text>
        )}
        {simpleError && (
          <Text style={styles.errorText}>
            ❌ Error Hook Simple: {simpleError}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleForceUpdate}>
          <Text style={styles.buttonText}>🔄 Actualizar Manualmente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={logAllScales}>
          <Text style={styles.buttonText}>📝 Log en Consola</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testDirectImport}>
          <Text style={styles.buttonText}>🧪 Test Import Directo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scalesList}>
        <Text style={styles.sectionTitle}>📋 Escalas del Hook Complejo:</Text>
        {complexScales.length === 0 ? (
          <Text style={styles.noScales}>No hay escalas cargadas</Text>
        ) : (
          complexScales.map((scale, index) => (
            <View key={scale.id} style={styles.scaleItem}>
              <Text style={styles.scaleId}>
                {index + 1}. {scale.id}
              </Text>
              <Text style={styles.scaleName}>{scale.name}</Text>
              <Text style={styles.scaleCategory}>
                Categoría: {scale.category}
              </Text>
              {scale.specialty && (
                <Text style={styles.scaleSpecialty}>
                  Especialidad: {scale.specialty}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <ScrollView style={styles.scalesList}>
        <Text style={styles.sectionTitle}>📋 Escalas del Hook Simple:</Text>
        {simpleScales.length === 0 ? (
          <Text style={styles.noScales}>No hay escalas cargadas</Text>
        ) : (
          simpleScales.map((scale, index) => (
            <View key={scale.id} style={styles.scaleItem}>
              <Text style={styles.scaleId}>
                {index + 1}. {scale.id}
              </Text>
              <Text style={styles.scaleName}>{scale.name}</Text>
              <Text style={styles.scaleCategory}>
                Categoría: {scale.category}
              </Text>
              {scale.specialty && (
                <Text style={styles.scaleSpecialty}>
                  Especialidad: {scale.specialty}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#0f172a',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#374151',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#0891b2',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  scalesList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0f172a',
  },
  noScales: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  scaleItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scaleId: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  scaleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  scaleCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  scaleSpecialty: {
    fontSize: 12,
    color: '#6b7280',
  },
});
