import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react-native';
import { AppIcon } from '@/components/AppIcon';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleEnterApp = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <AppIcon size={48} />
          <Text style={styles.logoText}>DeepLuxMed</Text>
          <Text style={styles.logoSubtext}>Escalas</Text>
        </View>
      </View>

      {/* Main content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.heroSection}>
          <Text style={styles.title}>
            Escalas Médicas{'\n'}
            <Text style={styles.titleAccent}>Validadas</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Repositorio completo de escalas de evaluación clínica validadas científicamente. 
            Barthel, Glasgow, MMSE y más de 50 herramientas para profesionales de la salud.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Shield color="#0891b2" size={20} />
              <Text style={styles.featureText}>Validadas científicamente</Text>
            </View>
            <View style={styles.feature}>
              <Clock color="#0891b2" size={20} />
              <Text style={styles.featureText}>Resultados instantáneos</Text>
            </View>
            <View style={styles.feature}>
              <CheckCircle color="#0891b2" size={20} />
              <Text style={styles.featureText}>Acceso gratuito</Text>
            </View>
          </View>

          {/* CTA Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed
            ]}
            onPress={handleEnterApp}
          >
            <LinearGradient
              colors={['#0891b2', '#0e7490']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaText}>Comenzar evaluación</Text>
              <ArrowRight color="#ffffff" size={20} strokeWidth={2} />
            </LinearGradient>
          </Pressable>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            Herramienta de apoyo clínico • No reemplaza el criterio médico profesional
          </Text>
        </View>
      </Animated.View>

      {/* Background decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  logoSubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94a3b8',
    marginLeft: -8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width > 600 ? 48 : 24,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontSize: width > 400 ? 48 : 36,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: width > 400 ? 56 : 42,
  },
  titleAccent: {
    color: '#0891b2',
  },
  subtitle: {
    fontSize: width > 400 ? 18 : 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: width > 400 ? 26 : 24,
    marginHorizontal: width > 400 ? 12 : 8,
    maxWidth: 600,
  },
  features: {
    gap: 16,
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  ctaButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    minWidth: width > 400 ? 240 : 200,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerNote: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(8, 145, 178, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.3,
    left: -75,
  },
});


