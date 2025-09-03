import { Handler, HandlerEvent } from '@netlify/functions';
// Resolve paths safely when the function is bundled by Netlify esbuild
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import { z } from 'zod';
// Use puppeteer-core + @sparticuz/chromium in serverless; fall back to puppeteer locally
// We keep requires dynamic to avoid bundling unused binaries.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isServerless = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
let puppeteer: any;
let chromium: any;
try {
  // Prefer serverless combo if available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  chromium = require('@sparticuz/chromium');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  puppeteer = require('puppeteer-core');
} catch {
  // Fallback to full puppeteer when running locally or when core/chromium are missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  puppeteer = require('puppeteer');
}
// Import templates via built JS to avoid TS compiling files outside rootDir
// eslint-disable-next-line @typescript-eslint/no-var-requires
const templates: any = require('../../api/export/templates-dist/index.js');

type Headers = Record<string, string>;

// Flexible schema to accept different payloads per template
const RequestSchema = z.object({
  assessment: z.any(),
  scale: z.object({ id: z.string(), name: z.string() }),
  options: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    customTheme: z.record(z.string()).optional(),
    footerNote: z.string().optional(),
    preset: z.enum(['compact', 'medical', 'formal']).optional(),
    headerTitle: z.string().optional(),
    headerSubtitle: z.string().optional(),
    logoUrl: z.string().optional(),
    scale: z.number().optional(),
    showPatientSummary: z.boolean().optional(),
  }).optional(),
});

export const handler: Handler = async (event: HandlerEvent) => {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const debug = event.queryStringParameters?.debug === '1';
  const flavor = chromium ? 'core+chromium' : 'bundled';
  const corsHeaders: Headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('[pdf-export] start', { requestId, isServerless, flavor });
    if (!event.body) throw new Error('Request body is required');

    let parsed: z.infer<typeof RequestSchema>;
    try {
      const body = JSON.parse(event.body);
      parsed = RequestSchema.parse(body);
    } catch (e: any) {
      console.error('[pdf-export] parse/validate error', { requestId, message: e?.message });
      throw new Error(`PARSE_ERROR: ${e?.message || 'Invalid request body'}`);
    }

    // 1) Pick template by scale id and render HTML
    let html: string;
    try {
      const templateFn = templates.getTemplateFunction(parsed.scale.id);
      html = templateFn(parsed as any);
    } catch (e: any) {
      console.error('[pdf-export] template render error', { requestId, message: e?.message });
      throw new Error(`TEMPLATE_ERROR: ${e?.message || 'Failed to render template'}`);
    }

    // 3) Render with Puppeteer / Puppeteer-Core
    let executablePath: string | undefined;
    let browser: any;
    try {
      if (isServerless && chromium) {
        // Serverless configuration for @sparticuz/chromium
        const launchOptions = {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
          ignoreDefaultArgs: ['--disable-extensions'],
        };
        console.log('[pdf-export] launching serverless browser', { 
          requestId, 
          flavor: 'chromium+puppeteer-core',
          executablePath: launchOptions.executablePath,
          args: launchOptions.args?.slice(0, 3) // Log first few args only
        });
        browser = await puppeteer.launch(launchOptions);
      } else {
        // Local development configuration
        const launchOptions = {
          headless: 'shell',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
          ],
        };
        console.log('[pdf-export] launching local browser', { 
          requestId, 
          flavor: 'puppeteer-bundled',
          args: launchOptions.args?.slice(0, 3)
        });
        browser = await puppeteer.launch(launchOptions);
      }
    } catch (e: any) {
      console.error('[pdf-export] launch error', { requestId, flavor, message: e?.message });
      throw new Error(`LAUNCH_ERROR: ${e?.message || 'Failed to launch browser'}`);
    }
    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
        preferCSSPageSize: true,
      });
      await page.close();
    } catch (e: any) {
      console.error('[pdf-export] render/pdf error', { requestId, message: e?.message });
      try { await browser?.close(); } catch {}
      throw new Error(`RENDER_ERROR: ${e?.message || 'Failed to render PDF'}`);
    }
    try { await browser?.close(); } catch {}

    const filename = `${parsed.scale.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`;
    const isBinary = event.queryStringParameters?.binary === '1';

    if (isBinary) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(pdfBuffer.length),
          'Cache-Control': 'no-store',
        },
        body: Buffer.from(pdfBuffer).toString('base64'),
        isBase64Encoded: true,
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ filename, base64: Buffer.from(pdfBuffer).toString('base64') }),
    };
  } catch (error: any) {
    const msg: string = error?.message || 'Bad Request';
    const stage = (msg.split(':', 1)[0] || '').replace(/[^A-Z_]/g, '') || 'UNKNOWN';
    console.error('[pdf-export] error', { requestId, stage, flavor, message: msg });
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: msg, requestId, ...(debug ? { stage, flavor } : {}) }),
    };
  }
};
