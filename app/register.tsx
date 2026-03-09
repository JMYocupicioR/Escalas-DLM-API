import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { supabase } from '@/api/config/supabase';
import { SplashLogo } from '@/components/AppLogo';

export default function RegisterScreen() {
  const { colors } = useThemedStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (data.user && !data.session) {
        setSuccess(true);
        setError(null);
      } else if (data.session) {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    inner: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 32,
      justifyContent: 'center',
      minHeight: 400,
    },
    logo: { alignItems: 'center', marginBottom: 24 },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedText,
      textAlign: 'center',
      marginBottom: 24,
    },
    input: {
      marginBottom: 16,
      backgroundColor: colors.inputBackground || colors.card,
    },
    error: {
      color: colors.error,
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    success: {
      color: colors.success,
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    button: { marginTop: 8 },
    link: { marginTop: 20, alignItems: 'center' },
    linkText: { fontSize: 14, color: colors.primary },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logo}>
            <SplashLogo />
          </View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para usar Escalas DLM
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={loading}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={loading}
          />
          <TextInput
            label="Repetir contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            disabled={loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? (
            <Text style={styles.success}>
              Cuenta creada. Revisa tu email para confirmar (si está habilitado).
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? '' : 'Registrarse'}
          </Button>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.linkText}>Ya tengo cuenta. Iniciar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
