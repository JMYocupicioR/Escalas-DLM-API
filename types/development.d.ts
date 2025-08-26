// Tipos específicos para desarrollo y compatibilidad entre plataformas

declare global {
  // Variable global para detectar el entorno de desarrollo
  const __DEV__: boolean;
}

// Tipo para configuraciones de desarrollo
export interface DevelopmentConfig {
  SCALES: {
    AUTO_UPDATE_INTERVAL: number;
    ENABLE_LOGGING: boolean;
    SHOW_UPDATE_INDICATORS: boolean;
    DEBUG_SEARCH: boolean;
  };
}

export {};
