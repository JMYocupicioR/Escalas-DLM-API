import { Handler, HandlerEvent } from '@netlify/functions';
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
import { getTemplateFunction } from '../../api/export/templates';

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
    if (!event.body) throw new Error('Request body is required');

    const body = JSON.parse(event.body);
    const parsed = RequestSchema.parse(body);

    // 1) Pick template by scale id
    const templateFn = getTemplateFunction(parsed.scale.id);

    // 2) Generate HTML from the selected template
    const html = templateFn(parsed as any);

    // 3) Render with Puppeteer / Puppeteer-Core
    const launchOptions: Record<string, any> = isServerless && chromium ? {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    } : {
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
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
      preferCSSPageSize: true,
    });
    await page.close();
    await browser.close();

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
    console.error('PDF export error:', error);
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'Bad Request' }),
    };
  }
};
