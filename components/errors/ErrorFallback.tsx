import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorFallbackProps {
  error?: Error | string;
  resetError?: () => void;
  actionText?: string;
  title?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  actionText = 'Intentar de nuevo',
  title = 'Ha ocurrido un error'
}) => {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'Algo salió mal. Por favor intenta de nuevo.';

  return (
    <View style={styles.container}>
      <AlertTriangle size={36} color="#ef4444" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      
      {resetError && (
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <RefreshCw size={18} color="#ffffff" />
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#b91c1c',
    marginTop: 8,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b91c1c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default ErrorFallback;