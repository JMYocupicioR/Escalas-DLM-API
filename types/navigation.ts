export type RootStackParamList = {
  // Tabs principales
  '(tabs)': undefined;
  
  // Tab screens
  '(tabs)/index': undefined;
  '(tabs)/search': { q?: string; filter?: string };
  '(tabs)/scales': undefined;
  '(tabs)/favorites': undefined;
  '(tabs)/settings': undefined;
  
  // Rutas de escalas
  '(tabs)/scales/index': undefined;
  '(tabs)/scales/[id]': { id: string };
  '(tabs)/scales/recent': undefined;
  '(tabs)/scales/funcional': undefined;
  '(tabs)/scales/especialidad': undefined;
  '(tabs)/scales/alfabetico': undefined;
  '(tabs)/scales/segmento': undefined;

  // Rutas de configuración
  '(tabs)/settings/index': undefined;
  '(tabs)/settings/language': undefined;
  '(tabs)/settings/notifications': undefined;
  '(tabs)/settings/about': undefined;
  '(tabs)/settings/privacy': undefined;
  '(tabs)/settings/terms': undefined;
  '(tabs)/settings/support': undefined;
  
  // Otras rutas
  'categories': undefined;
  'categories/[id]': { id: string };
  '+not-found': undefined;
};