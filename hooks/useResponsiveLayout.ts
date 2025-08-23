import { useWindowDimensions, Platform } from 'react-native';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const isDesktop = width >= TABLET_BREAKPOINT;

  return {
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    width,
  };
}
