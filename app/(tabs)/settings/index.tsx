import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useMemo } from 'react';
import { 
  Globe as Globe2, 
  Moon, 
  Bell, 
  Clock, 
  Ruler, 
  ChevronRight, 
  Info, 
  FileText, 
  Shield, 
  MessageSquareText, 
  CircleHelp as HelpCircle,
  Eye,
  Type,
  Palette,
  Accessibility,
  Settings,
  User,
  Database,
  Zap
} from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useAuthSession } from '@/hooks/useAuthSession';
import { HeaderLogo } from '@/components/AppLogo';
import { LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, themeMode, contrastLevel, fontSize } = useThemedStyles();
  const { signOut, session } = useAuthSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };
  
  // Configuraciones del store
  const {
    darkMode,
    notifications,
    themeMode: currentTheme,
    contrastLevel: currentContrast,
    fontSize: currentFontSize,
    autoAdvanceQuestions,
    oneQuestionAtATime,
    showDetailedScores,
    enableHapticFeedback,
    reduceMotion,
    analyticsEnabled,
    language,
    dateFormat,
    measurementSystem,
    // Acciones
    toggleDarkMode,
    toggleNotifications,
    setThemeMode,
    setContrastLevel,
    setFontSize,
    toggleAutoAdvance,
    toggleOneQuestionAtATime,
    toggleDetailedScores,
    toggleHapticFeedback,
    toggleReduceMotion,
    toggleAnalytics,
  } = useSettingsStore();

  const themedStyles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      content: {
        flex: 1,
      },
      headerContainer: {
        backgroundColor: colors.card,
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      section: {
        marginTop: 24,
        paddingHorizontal: 16,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.mutedText,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
      },
      sectionContent: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: colors.isHighContrast ? 1 : 0,
        borderColor: colors.border,
      },
      settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 72,
      },
      settingItemLast: {
        borderBottomWidth: 0,
      },
      settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.iconBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: colors.isHighContrast ? 1 : 0,
        borderColor: colors.border,
      },
      settingContent: { 
        flex: 1,
        justifyContent: 'center',
      },
      settingTitle: { 
        fontSize: 16, 
        color: colors.text, 
        marginBottom: 2,
        fontWeight: '500',
      },
      settingValue: { 
        fontSize: 14, 
        color: colors.mutedText,
        marginTop: 2,
      },
      switchContainer: {
        marginLeft: 8,
      },
      footer: { 
        marginTop: 32, 
        marginBottom: 24, 
        alignItems: 'center', 
        paddingHorizontal: 16 
      },
      footerText: { 
        fontSize: 14, 
        color: colors.mutedText, 
        marginBottom: 4,
        textAlign: 'center',
      },
      footerVersion: { 
        fontSize: 12, 
        color: colors.mutedText,
        opacity: 0.8,
      },
    });
  }, [colors]);

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    value = undefined, 
    onPress, 
    showToggle = false, 
    isToggled = false, 
    showChevron = true,
    isLast = false,
    description = undefined
  }: any) => (
    <TouchableOpacity 
      style={[themedStyles.settingItem, isLast && themedStyles.settingItemLast]} 
      onPress={showToggle ? undefined : onPress}
      activeOpacity={showToggle ? 1 : 0.7}
      accessible={true}
      accessibilityRole={showToggle ? 'switch' : 'button'}
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={showToggle ? { checked: isToggled } : undefined}
    >
      <View style={themedStyles.settingIcon}>
        <Icon size={22} color={colors.iconMuted} />
      </View>
      <View style={themedStyles.settingContent}>
        <Text style={themedStyles.settingTitle}>{title}</Text>
        {value && <Text style={themedStyles.settingValue}>{value}</Text>}
        {description && !value && <Text style={themedStyles.settingValue}>{description}</Text>}
      </View>
      {showToggle ? (
        <View style={themedStyles.switchContainer}>
          <Switch
            value={isToggled}
            onValueChange={onPress}
            trackColor={{ 
              false: colors.border, 
              true: colors.primary 
            }}
            thumbColor={Platform.OS === 'ios' ? '#ffffff' : isToggled ? '#ffffff' : colors.card}
            accessibilityLabel={title}
          />
        </View>
      ) : showChevron ? (
        <ChevronRight size={20} color={colors.iconMuted} />
      ) : null}
    </TouchableOpacity>
  );

  const navigateToSubpage = (page) => {
    router.push(`/settings/${page}`);
  };

  const getThemeDisplayName = (mode) => {
    switch (mode) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'system': return 'Sistema';
      default: return 'Sistema';
    }
  };

  const getContrastDisplayName = (level) => {
    switch (level) {
      case 'high': return 'Alto contraste';
      case 'normal': return 'Normal';
      default: return 'Normal';
    }
  };

  const getFontSizeDisplayName = (size) => {
    switch (size) {
      case 'small': return 'Pequeño';
      case 'normal': return 'Normal';
      case 'large': return 'Grande';
      case 'xlarge': return 'Muy grande';
      default: return 'Normal';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={themedStyles.container} edges={['bottom']}>
        <View style={themedStyles.headerContainer}>
          <HeaderLogo size="small" />
        </View>
        <ScrollView style={themedStyles.content}>
          
          {/* Apariencia */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Apariencia</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Palette}
                title="Tema de la aplicación"
                value={getThemeDisplayName(currentTheme)}
                onPress={() => {
                  // Ciclar entre light, dark, system
                  const themeModes = ['light', 'dark', 'system'] as const;
                  const currentIndex = themeModes.indexOf(currentTheme);
                  const nextIndex = (currentIndex + 1) % themeModes.length;
                  setThemeMode(themeModes[nextIndex]);
                }}
                description="Configurar el comportamiento del tema"
              />
              <SettingItem
                icon={Eye}
                title="Alto contraste"
                showToggle
                isToggled={currentContrast === 'high'}
                onPress={() => setContrastLevel(currentContrast === 'high' ? 'normal' : 'high')}
                description="Mejorar la legibilidad con mayor contraste"
              />
              <SettingItem
                icon={Type}
                title="Tamaño de fuente"
                value={getFontSizeDisplayName(currentFontSize)}
                onPress={() => navigateToSubpage('font-size')}
                description="Ajustar el tamaño del texto"
                isLast
              />
            </View>
          </View>

          {/* Comportamiento */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Comportamiento</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Zap}
                title="Avance automático"
                showToggle
                isToggled={autoAdvanceQuestions}
                onPress={toggleAutoAdvance}
                description="Avanzar automáticamente a la siguiente pregunta"
              />
              <SettingItem
                icon={Eye}
                title="Una pregunta por panel"
                showToggle
                isToggled={oneQuestionAtATime}
                onPress={toggleOneQuestionAtATime}
                description="Mostrar solo una pregunta a la vez"
              />
              <SettingItem
                icon={Settings}
                title="Puntuaciones detalladas"
                showToggle
                isToggled={showDetailedScores}
                onPress={toggleDetailedScores}
                description="Mostrar información detallada de puntuación"
              />
              <SettingItem
                icon={Bell}
                title="Vibración háptica"
                showToggle
                isToggled={enableHapticFeedback}
                onPress={toggleHapticFeedback}
                description="Vibrar en interacciones importantes"
                isLast
              />
            </View>
          </View>

          {/* Accesibilidad */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Accesibilidad</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Accessibility}
                title="Reducir movimiento"
                showToggle
                isToggled={reduceMotion}
                onPress={toggleReduceMotion}
                description="Minimizar animaciones y transiciones"
                isLast
              />
            </View>
          </View>

          {/* Preferencias Básicas */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Preferencias</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Globe2}
                title="Idioma"
                value={language === 'es' ? 'Español' : 'English'}
                onPress={() => navigateToSubpage('language')}
              />
              <SettingItem
                icon={Clock}
                title="Formato de fecha"
                value={dateFormat === '24h' ? '24 horas' : '12 horas'}
                onPress={() => navigateToSubpage('datetime')}
              />
              <SettingItem
                icon={Ruler}
                title="Unidades de medida"
                value={measurementSystem === 'metric' ? 'Métrico' : 'Imperial'}
                onPress={() => navigateToSubpage('units')}
                isLast
              />
            </View>
          </View>

          {/* Notificaciones */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Notificaciones</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Bell}
                title="Notificaciones"
                showToggle
                isToggled={notifications}
                onPress={toggleNotifications}
                description="Activar todas las notificaciones"
              />
              <SettingItem
                icon={Bell}
                title="Configuración detallada"
                onPress={() => navigateToSubpage('notifications')}
                description="Configurar tipos específicos de notificaciones"
                isLast
              />
            </View>
          </View>

          {/* Cuenta */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Cuenta</Text>
            <View style={themedStyles.sectionContent}>
              {session?.user?.email && (
                <SettingItem
                  icon={User}
                  title="Sesión"
                  value={session.user.email}
                  showChevron={false}
                  onPress={() => {}}
                  isLast={false}
                />
              )}
              <SettingItem
                icon={LogOut}
                title="Cerrar sesión"
                onPress={handleSignOut}
                description="Salir de tu cuenta"
                isLast
              />
            </View>
          </View>

          {/* Privacidad y datos */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Privacidad</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Database}
                title="Analíticas"
                showToggle
                isToggled={analyticsEnabled}
                onPress={toggleAnalytics}
                description="Ayudar a mejorar la app compartiendo datos de uso"
              />
              <SettingItem
                icon={Shield}
                title="Política de privacidad"
                onPress={() => navigateToSubpage('privacy')}
              />
              <SettingItem
                icon={User}
                title="Gestión de datos"
                onPress={() => navigateToSubpage('data-management')}
                description="Exportar, importar o eliminar datos"
                isLast
              />
            </View>
          </View>

          {/* Información */}
          <View style={themedStyles.section}>
            <Text style={themedStyles.sectionTitle}>Información</Text>
            <View style={themedStyles.sectionContent}>
              <SettingItem
                icon={Info}
                title="Versión"
                value="1.0.0"
                showChevron={false}
                onPress={() => {}}
                description="Build 100 — escalas.deeplux.org"
              />
              <SettingItem
                icon={FileText}
                title="Términos y condiciones"
                onPress={() => navigateToSubpage('terms')}
              />
              <SettingItem
                icon={MessageSquareText}
                title="Soporte"
                onPress={() => navigateToSubpage('support')}
              />
              <SettingItem
                icon={HelpCircle}
                title="Ayuda"
                onPress={() => navigateToSubpage('help')}
                isLast
              />
            </View>
          </View>

          <View style={themedStyles.footer}>
            <Text style={themedStyles.footerText}>Escalas DLM — DeepLux Med © 2025</Text>
            <Text style={themedStyles.footerVersion}>escalas.deeplux.org</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Eliminamos los estilos estáticos ya que usamos themedStyles dinámicos