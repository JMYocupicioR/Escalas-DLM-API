import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchWidget } from '@/components/SearchWidget';
import { ScalesDebugger } from '@/components/ScalesDebugger';

export default function TabOneScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Escalas Médicas</Text>
          <Text style={styles.subtitle}>
            Busca y evalúa escalas médicas especializadas
          </Text>
        </View>

        <View style={styles.searchSection}>
          <SearchWidget 
            placeholder="Buscar escalas médicas..."
            showFilters={true}
          />
        </View>

        {/* Debugger temporal para diagnosticar el problema */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🔧 Debug - Verificar Carga de Escalas</Text>
          <ScalesDebugger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  debugSection: {
    padding: 16,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000,
    position: 'relative',
  },
});