// Import all template functions
import { generateHtml as genericGenerateHtml } from './generic';
import { generateHtml as barthelGenerateHtml } from './barthel';
import { generateHtml as fimGenerateHtml } from './fim';
import { generateHtml as lequesneGenerateHtml } from './lequesne';
import { generateHtml as botulinumGenerateHtml } from './botulinum';

// Export individual templates
export { generateHtml as generateGenericTemplate } from './generic';
export { generateHtml as generateBarthelTemplate } from './barthel';
export { generateHtml as generateFimTemplate } from './fim';
export { generateHtml as generateLequesneTemplate } from './lequesne';
export { generateHtml as generateBotulinumTemplate } from './botulinum';

// Template function map for dynamic routing
export const TEMPLATE_MAP = {
  'barthel': barthelGenerateHtml,
  'fim': fimGenerateHtml,
  'lequesne': lequesneGenerateHtml,
  'botulinum': botulinumGenerateHtml,
  'generic': genericGenerateHtml, // fallback
} as const;

// Template type definitions
export type TemplateType = 'generic' | 'barthel' | 'fim' | 'lequesne' | 'botulinum';

// Helper function to get template function by scale ID
export const getTemplateFunction = (scaleId: string) => {
  return TEMPLATE_MAP[scaleId as keyof typeof TEMPLATE_MAP] || TEMPLATE_MAP.generic;
};