import { useWindowDimensions, Platform } from 'react-native';

const WEB_BREAKPOINT = 768; // Common breakpoint for tablets/desktops

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= WEB_BREAKPOINT;
  const isMobile = !isDesktop;

  return {
    isWeb,
    isDesktop,
    isMobile,
    width,
  };
}
