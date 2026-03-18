/**
 * Responsive Grid Utility
 * Provides consistent layout calculations for adaptive card grids
 * across all screen sizes (mobile, tablet, desktop)
 */

export interface GridConfig {
  columns: number;
  cardWidth: number | string;
  gap: number;
  contentPadding: number;
  containerWidth: number;
}

export interface ResponsiveGridParams {
  screenWidth: number;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape?: boolean;
}

// Breakpoints aligned with useResponsiveLayout hook
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

/**
 * Calculate optimal grid configuration based on screen size and device type
 */
export function calculateGridConfig(params: ResponsiveGridParams): GridConfig {
  const { screenWidth, isPhone, isTablet, isDesktop, isLandscape = false } = params;

  let columns = 1;
  let gap = 16;
  let contentPadding = 16;

  // Determine columns based on screen width and device type
  if (isDesktop || screenWidth >= BREAKPOINTS.xl) {
    columns = screenWidth >= BREAKPOINTS.xxl ? 4 : 3;
    gap = 20;
    contentPadding = 32;
  } else if (isTablet || screenWidth >= BREAKPOINTS.md) {
    columns = isLandscape ? 3 : 2;
    gap = 16;
    contentPadding = 24;
  } else if (screenWidth >= BREAKPOINTS.sm) {
    columns = isLandscape ? 2 : 1;
    gap = 16;
    contentPadding = 20;
  } else {
    // Phone portrait - list view
    columns = 1;
    gap = 16;
    contentPadding = 16;
  }

  // Calculate card width
  const availableWidth = screenWidth - (contentPadding * 2);
  const totalGapWidth = gap * (columns - 1);
  const cardWidth = columns === 1 
    ? '100%' 
    : Math.floor((availableWidth - totalGapWidth) / columns);

  return {
    columns,
    cardWidth,
    gap,
    contentPadding,
    containerWidth: screenWidth,
  };
}

/**
 * Get responsive card dimensions
 */
export function getCardDimensions(screenWidth: number, isDesktop: boolean) {
  return {
    iconSize: isDesktop ? 56 : 48,
    iconBorderRadius: isDesktop ? 28 : 24,
    padding: isDesktop ? 20 : 16,
    borderRadius: isDesktop ? 14 : 12,
    titleSize: isDesktop ? 18 : 16,
    descSize: 14,
    statsSize: isDesktop ? 13 : 12,
    tagSize: 11,
  };
}

/**
 * Get responsive spacing values
 */
export function getResponsiveSpacing(screenWidth: number, isDesktop: boolean, isTablet: boolean) {
  return {
    sectionMargin: isDesktop ? 32 : 24,
    cardGap: isDesktop ? 20 : 16,
    contentPadding: isDesktop ? 32 : isTablet ? 24 : 16,
    elementGap: 12,
    smallGap: 8,
  };
}

/**
 * Calculate grid item style for FlexBox layouts
 */
export function getGridItemStyle(columns: number, gap: number) {
  if (columns === 1) {
    return {
      width: '100%',
      marginBottom: gap,
    };
  }

  // Calculate percentage width accounting for gaps
  const gapPercentage = (gap * (columns - 1)) / columns;
  const widthPercentage = (100 / columns) - (gapPercentage / columns);

  return {
    width: `${widthPercentage}%`,
    marginBottom: gap,
    marginRight: gap,
  };
}

/**
 * Get list view configuration (for mobile)
 */
export function getListViewConfig(isCompact: boolean) {
  return {
    itemHeight: isCompact ? 88 : 112,
    iconSize: isCompact ? 40 : 48,
    padding: isCompact ? 12 : 16,
    titleSize: 16,
    descLines: isCompact ? 1 : 2,
  };
}

/**
 * Determine if should use list view vs grid view
 */
export function shouldUseListView(screenWidth: number): boolean {
  return screenWidth < BREAKPOINTS.md;
}

/**
 * Get adaptive layout mode
 */
export type LayoutMode = 'list' | 'grid-2' | 'grid-3' | 'grid-4';

export function getLayoutMode(screenWidth: number, isLandscape: boolean = false): LayoutMode {
  if (screenWidth < BREAKPOINTS.md) {
    return isLandscape && screenWidth >= BREAKPOINTS.sm ? 'grid-2' : 'list';
  }
  
  if (screenWidth >= BREAKPOINTS.xxl) {
    return 'grid-4';
  }
  
  if (screenWidth >= BREAKPOINTS.xl) {
    return 'grid-3';
  }
  
  if (screenWidth >= BREAKPOINTS.lg) {
    return 'grid-3';
  }
  
  return isLandscape ? 'grid-3' : 'grid-2';
}

