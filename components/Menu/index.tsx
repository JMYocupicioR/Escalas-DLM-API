import React, { useCallback, useMemo, useRef, memo } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Platform, SectionList } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { 
  X, 
  ChevronRight, 
  ListStart, 
  Brain, 
  Activity, 
  Heart, 
  Stethoscope, 
  Baby,
  Minimize2,
  PersonStanding as UserStanding,
  Bone,
  FileSearch 
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

interface MenuSection {
  title: string;
  data: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Organización Principal",
    data: [
      {
        id: 'alphabetical',
        title: 'Escalas por Nombre',
        description: 'Listado completo ordenado alfabéticamente (A-Z)',
        route: '/scales/alfabetico',
        icon: ListStart,
        color: '#0891b2'
      }
    ]
  },
  {
    title: "Por Función",
    data: [
      {
        id: 'functional',
        title: 'Funcionalidad',
        description: 'Evaluación de capacidades y actividades diarias',
        route: '/scales/funcional',
        icon: Activity,
        color: '#0d9488'
      },
      {
        id: 'independence',
        title: 'Independencia',
        description: 'Medición del grado de autonomía del paciente',
        route: '/scales/function/independence',
        icon: UserStanding,
        color: '#8b5cf6'
      },
      {
        id: 'cognitive',
        title: 'Capacidad Cognitiva',
        description: 'Evaluación de funciones mentales y comportamiento',
        route: '/scales/function/cognitive',
        icon: Brain,
        color: '#6366f1'
      },
      {
        id: 'pain',
        title: 'Evaluación del Dolor',
        description: 'Cuantificación de intensidad y características del dolor',
        route: '/scales/function/pain',
        icon: Minimize2,
        color: '#ef4444'
      },
      {
        id: 'balance',
        title: 'Equilibrio y Movilidad',
        description: 'Valoración de estabilidad, coordinación y desplazamiento',
        route: '/scales/function/balance',
        icon: UserStanding,
        color: '#f59e0b'
      }
    ]
  },
  {
    title: "Por Especialidad Médica",
    data: [
      {
        id: 'rehabilitation',
        title: 'Rehabilitación',
        description: 'Escalas enfocadas en medicina física y rehabilitación',
        route: '/scales/especialidad?esp=rehabilitacion',
        icon: Activity,
        color: '#0d9488'
      },
      {
        id: 'pediatric',
        title: 'Pediatría',
        description: 'Evaluaciones específicas para población infantil',
        route: '/scales/especialidad?esp=pediatria',
        icon: Baby,
        color: '#f59e0b'
      },
      {
        id: 'neurology',
        title: 'Neurología',
        description: 'Escalas para evaluación neurológica',
        route: '/scales/especialidad?esp=neurologia',
        icon: Brain,
        color: '#8b5cf6'
      },
      {
        id: 'pneumology',
        title: 'Neumología',
        description: 'Evaluación de función y capacidad pulmonar',
        route: '/scales/especialidad?esp=neumologia',
        icon: Stethoscope,
        color: '#0891b2'
      },
      {
        id: 'geriatrics',
        title: 'Geriatría',
        description: 'Escalas específicas para adultos mayores',
        route: '/scales/especialidad?esp=geriatria',
        icon: UserStanding,
        color: '#64748b'
      },
      {
        id: 'cardiology',
        title: 'Cardiología',
        description: 'Evaluación de riesgo y función cardíaca',
        route: '/scales/especialidad?esp=cardiologia',
        icon: Heart,
        color: '#ec4899'
      }
    ]
  },
  {
    title: "Por Segmento Corporal",
    data: [
      {
        id: 'head',
        title: 'Cabeza',
        description: 'Evaluaciones específicas para cabeza y cuello',
        route: '/scales/segmento?part=cabeza',
        icon: FileSearch,
        color: '#8b5cf6'
      },
      {
        id: 'spine',
        title: 'Columna',
        description: 'Escalas para valoración de columna vertebral',
        route: '/scales/segmento?part=columna',
        icon: Bone,
        color: '#0d9488'
      },
      {
        id: 'shoulder',
        title: 'Hombros',
        description: 'Evaluación funcional de hombros',
        route: '/scales/segmento?part=hombros',
        icon: FileSearch,
        color: '#f59e0b'
      },
      {
        id: 'hip',
        title: 'Caderas',
        description: 'Escalas para valoración de cadera',
        route: '/scales/segmento?part=caderas',
        icon: FileSearch,
        color: '#0891b2'
      },
      {
        id: 'knee',
        title: 'Rodillas',
        description: 'Evaluación funcional de rodilla',
        route: '/scales/segmento?part=rodillas',
        icon: FileSearch,
        color: '#ef4444'
      },
      {
        id: 'foot',
        title: 'Tobillos y Pie',
        description: 'Valoración de tobillo y pie',
        route: '/scales/segmento?part=pie',
        icon: FileSearch,
        color: '#64748b'
      }
    ]
  }
];

const MenuItem = memo(({ item, index, onPress }: { 
  item: MenuItem; 
  index: number; 
  onPress: (route: string) => void;
}) => (
  <Animated.View
    entering={FadeInDown.delay(index * 50)}
    style={styles.menuItemContainer}
  >
    <View
      style={styles.menuItemButton}
      onClick={() => Platform.OS === 'web' ? onPress(item.route) : null}
    >
      <Pressable
        onPress={() => onPress(item.route)}
        accessible={true}
        accessibilityLabel={item.title}
        accessibilityHint={item.description}
        accessibilityRole="button"
        style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <item.icon size={24} color={item.color} />
        </View>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={1}>{item.description}</Text>
        </View>
        <ChevronRight size={20} color="#64748b" />
      </Pressable>
    </View>
  </Animated.View>
));

MenuItem.displayName = 'MenuItem';

const SectionHeader = memo(({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
));

SectionHeader.displayName = 'SectionHeader';

export function Menu({ visible, onClose }: MenuProps) {
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  const handleMenuItemPress = useCallback((route: string) => {
    onClose();
    router.push(route);
  }, [onClose]);

  React.useEffect(() => {
    if (Platform.OS !== 'web' && visible) {
      bottomSheetRef.current?.present();
    } else if (Platform.OS !== 'web') {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  if (Platform.OS === 'web') {
    if (!visible) return null;

    return (
      <View style={styles.webOverlay}>
        <View style={styles.webModal}>
          <View style={styles.header}>
            <Text style={styles.title}>Categorías de Escalas</Text>
            <Pressable 
              onPress={onClose} 
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
            >
              <X size={24} color="#64748b" />
            </Pressable>
          </View>

          <SectionList
            sections={MENU_SECTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <MenuItem item={item} index={index} onPress={handleMenuItemPress} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <SectionHeader title={title} />
            )}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={styles.sectionListContent}
          />
        </View>
      </View>
    );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backgroundStyle={styles.modalBackground}
      handleIndicatorStyle={styles.indicator}
      enablePanDownToClose={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Categorías de Escalas</Text>
        <Pressable 
          onPress={onClose} 
          style={styles.closeButton}
          accessible={true}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
        >
          <X size={24} color="#64748b" />
        </Pressable>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.sectionListContent}>
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <React.Fragment key={`section-${sectionIndex}`}>
            <SectionHeader title={section.title} />
            {section.data.map((item, itemIndex) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                index={itemIndex} 
                onPress={handleMenuItemPress} 
              />
            ))}
          </React.Fragment>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webModal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalBackground: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  indicator: {
    backgroundColor: '#cbd5e1',
    width: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionListContent: {
    paddingBottom: 40,
  },
  menuItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});