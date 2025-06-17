// api/index.ts
// Exporta solo funciones relacionadas con escalas y exportación
export * from './scales';
export * from './export/pdf';
export * from './localAssessments';

// Exporta configuraciones para uso en configuración del provider
export { queryClient, queryKeys } from './config/reactQuery';
export { supabase } from './config/supabase';