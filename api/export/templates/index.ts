export type PdfTemplatePayload = {
  assessment: any;
  scale: { id: string; name: string };
  options?: {
    theme?: 'light' | 'dark';
    customTheme?: Record<string, string>;
    footerNote?: string;
    preset?: 'compact' | 'medical' | 'formal';
    headerTitle?: string;
    headerSubtitle?: string;
    logoUrl?: string;
    scale?: number;
    showPatientSummary?: boolean;
  };
};

export { generateHtml as renderGenericHtml } from './generic';
// Simple dispatcher for now; extend with per-scale templates over time
export { generateHtml as renderBotulinumHtml } from './botulinum';
export { generateHtml as renderFimHtml } from './fim';
export { generateHtml as renderBarthelHtml } from './barthel';
export { generateHtml as renderLequesneHtml } from './lequesne';
export { generateHtml as renderOgsHtml } from './ogs';
export { generateHtml as renderBergHtml } from './berg';
export { generateHtml as renderSixMWTHtml } from './6mwt';

export const renderHtmlForScale = (payload: PdfTemplatePayload): string => {
  const id = payload?.scale?.id || '';
  if (id === 'botulinum') {
    // Dynamic import via direct file to keep tree-shaking predictable
    return (require('./botulinum') as typeof import('./botulinum')).generateHtml(payload as any);
  }
  if (id === 'fim') {
    return (require('./fim') as typeof import('./fim')).generateHtml(payload as any);
  }
  if (id === 'barthel') {
    return (require('./barthel') as typeof import('./barthel')).generateHtml(payload as any);
  }
  if (id === 'lequesne' || id === 'lequesne-rodilla-es-v1') {
    return (require('./lequesne') as typeof import('./lequesne')).generateHtml(payload as any);
  }
  if (id === 'ogs') {
    return (require('./ogs') as typeof import('./ogs')).generateHtml(payload as any);
  }
  if (id === 'berg') {
    return (require('./berg') as typeof import('./berg')).generateHtml(payload as any);
  }
  if (id === '6mwt') {
    return (require('./6mwt') as typeof import('./6mwt')).generateHtml(payload as any);
  }
  return (require('./generic') as typeof import('./generic')).generateHtml(payload as any);
};

// Provide a map + selector for compatibility with existing server code
export const TEMPLATE_MAP = {
  botulinum: (payload: PdfTemplatePayload) => (require('./botulinum') as typeof import('./botulinum')).generateHtml(payload as any),
  fim: (payload: PdfTemplatePayload) => (require('./fim') as typeof import('./fim')).generateHtml(payload as any),
  barthel: (payload: PdfTemplatePayload) => (require('./barthel') as typeof import('./barthel')).generateHtml(payload as any),
  lequesne: (payload: PdfTemplatePayload) => (require('./lequesne') as typeof import('./lequesne')).generateHtml(payload as any),
  'lequesne-rodilla-es-v1': (payload: PdfTemplatePayload) => (require('./lequesne') as typeof import('./lequesne')).generateHtml(payload as any),
  ogs: (payload: PdfTemplatePayload) => (require('./ogs') as typeof import('./ogs')).generateHtml(payload as any),
  berg: (payload: PdfTemplatePayload) => (require('./berg') as typeof import('./berg')).generateHtml(payload as any),
  '6mwt': (payload: PdfTemplatePayload) => (require('./6mwt') as typeof import('./6mwt')).generateHtml(payload as any),
  generic: (payload: PdfTemplatePayload) => (require('./generic') as typeof import('./generic')).generateHtml(payload as any),
} as const;

export const getTemplateFunction = (scaleId: string) => {
  return (TEMPLATE_MAP as Record<string, (p: PdfTemplatePayload) => string>)[scaleId] || TEMPLATE_MAP.generic;
};
