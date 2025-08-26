// Configuración mínima para desarrollo
export const DEV_CONFIG = {
  SCALES: {
    AUTO_UPDATE_INTERVAL: 15000,
    ENABLE_LOGGING: true,
    SHOW_UPDATE_INDICATORS: true,
    DEBUG_SEARCH: true,
  }
};

export const setupDevelopmentEnvironment = () => {
  if (__DEV__) {
    console.log('🔧 Development mode enabled');
  }
};

export default DEV_CONFIG;
