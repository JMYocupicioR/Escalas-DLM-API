import { useWindowDimensions, Platform, PixelRatio } from 'react-native';
import { useMemo } from 'react';

// Breakpoints mejorados basados en Material Design y Tailwind
const BREAKPOINTS = {
  xs: 0,      // Extra small devices (phones in portrait)
  sm: 640,    // Small devices (large phones)
  md: 768,    // Medium devices (tablets in portrait)
  lg: 1024,   // Large devices (tablets in landscape, small laptops)
  xl: 1280,   // Extra large devices (desktops)
  xxl: 1536,  // 2X large devices (large desktops)
} as const;

// Categorías de dispositivos
type DeviceType = 'phone' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape';
type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ResponsiveLayout {
  // Información básica
  width: number;
  height: number;
  isWeb: boolean;
  isNative: boolean;

  // Tipo de dispositivo
  deviceType: DeviceType;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Categorías legacy (mantener compatibilidad)
  isMobile: boolean;

  // Tamaño de pantalla
  screenSize: ScreenSize;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;

  // Orientación
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;

  // Densidad de píxeles
  pixelRatio: number;
  isHighDensity: boolean;

  // Utilidades de diseño
  columns: number;           // Número de columnas para grids
  contentPadding: number;   // Padding horizontal recomendado
  cardWidth: number;        // Ancho recomendado para cards
  maxContentWidth: number;  // Ancho máximo de contenido

  // Helpers
  isAtLeast: (breakpoint: keyof typeof BREAKPOINTS) => boolean;
  isAtMost: (breakpoint: keyof typeof BREAKPOINTS) => boolean;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const pixelRatio = PixelRatio.get();

  return useMemo(() => {
    // Información básica
    const isWeb = Platform.OS === 'web';
    const isNative = !isWeb;

    // Determinar tamaño de pantalla
    let screenSize: ScreenSize = 'xs';
    if (width >= BREAKPOINTS.xxl) screenSize = 'xxl';
    else if (width >= BREAKPOINTS.xl) screenSize = 'xl';
    else if (width >= BREAKPOINTS.lg) screenSize = 'lg';
    else if (width >= BREAKPOINTS.md) screenSize = 'md';
    else if (width >= BREAKPOINTS.sm) screenSize = 'sm';

    // Determinar tipo de dispositivo
    let deviceType: DeviceType = 'phone';
    if (width >= BREAKPOINTS.lg) {
      deviceType = 'desktop';
    } else if (width >= BREAKPOINTS.md) {
      deviceType = 'tablet';
    }

    // Orientación
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';
    const isPortrait = orientation === 'portrait';
    const isLandscape = orientation === 'landscape';

    // Categorías de dispositivo
    const isPhone = deviceType === 'phone';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    const isMobile = isPhone; // Legacy compatibility

    // Tamaños de pantalla específicos
    const isXs = screenSize === 'xs';
    const isSm = screenSize === 'sm';
    const isMd = screenSize === 'md';
    const isLg = screenSize === 'lg';
    const isXl = screenSize === 'xl';
    const isXxl = screenSize === 'xxl';

    // Densidad de píxeles
    const isHighDensity = pixelRatio >= 2;

    // Utilidades de diseño adaptables (sin useMemo anidado)
    let columns = 1;
    if (width >= BREAKPOINTS.xxl) columns = 4;
    else if (width >= BREAKPOINTS.xl) columns = 3;
    else if (width >= BREAKPOINTS.lg) columns = 3;
    else if (width >= BREAKPOINTS.md) {
      columns = isLandscape ? 2 : 2;
    } else if (width >= BREAKPOINTS.sm) {
      columns = isLandscape ? 2 : 1;
    }

    let contentPadding = 16;
    if (isDesktop) contentPadding = 32;
    else if (isTablet) contentPadding = 24;
    else if (width >= BREAKPOINTS.sm) contentPadding = 20;

    let cardWidth = width - (contentPadding * 2);
    if (columns === 2) cardWidth = (width - (contentPadding * 3)) / 2;
    else if (columns === 3) cardWidth = (width - (contentPadding * 4)) / 3;
    else if (columns === 4) cardWidth = (width - (contentPadding * 5)) / 4;

    let maxContentWidth = width;
    if (width >= BREAKPOINTS.xxl) maxContentWidth = 1536;
    else if (width >= BREAKPOINTS.xl) maxContentWidth = 1280;
    else if (width >= BREAKPOINTS.lg) maxContentWidth = 1024;

    // Helper functions
    const isAtLeast = (breakpoint: keyof typeof BREAKPOINTS) => {
      return width >= BREAKPOINTS[breakpoint];
    };

    const isAtMost = (breakpoint: keyof typeof BREAKPOINTS) => {
      return width < BREAKPOINTS[breakpoint];
    };

    return {
      // Información básica
      width,
      height,
      isWeb,
      isNative,

      // Tipo de dispositivo
      deviceType,
      isPhone,
      isTablet,
      isDesktop,

      // Legacy
      isMobile,

      // Tamaño de pantalla
      screenSize,
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
      isXxl,

      // Orientación
      orientation,
      isPortrait,
      isLandscape,

      // Densidad
      pixelRatio,
      isHighDensity,

      // Utilidades
      columns,
      contentPadding,
      cardWidth,
      maxContentWidth,

      // Helpers
      isAtLeast,
      isAtMost,
    };
  }, [width, height, pixelRatio]);
}
