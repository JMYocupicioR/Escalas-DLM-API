// api/index.ts
// Exporta solo funciones relacionadas con escalas y exportación
export * from './scales';
export * from './export/pdf';
export * from './export/types';
export * from './localAssessments';

// Pacientes y evaluaciones (Supabase)
export * from './patients';
export * from './assessments';
export * from './profile';

// Exporta configuraciones para uso en configuración del provider
export { queryClient, queryKeys } from './config/reactQuery';
export { supabase } from './config/supabase';