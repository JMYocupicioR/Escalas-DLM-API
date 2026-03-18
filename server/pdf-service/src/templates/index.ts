// Use the prebuilt JS templates to avoid TS/ESM export issues across package boundaries
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CJS module default interop
import templates from '../../../../api/export/templates-dist/index.js';

export const TEMPLATE_MAP = templates.TEMPLATE_MAP as Record<string, (payload: any) => string>;
export const getTemplateFunction = templates.getTemplateFunction as (id: string) => (payload: any) => string;
