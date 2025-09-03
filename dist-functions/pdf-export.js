"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Resolve paths safely when the function is bundled by Netlify esbuild
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const zod_1 = require("zod");
// Dynamic imports for serverless vs local environment
const isServerless = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
async function getBrowserConfig() {
    if (isServerless) {
        try {
            // Serverless configuration with @sparticuz/chromium
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const chromium = require('@sparticuz/chromium');
            // eslint-disable-next-line @typescript-eslint/no-var-requires  
            const puppeteer = require('puppeteer-core');
            return {
                puppeteer,
                launchOptions: {
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
                }
            };
        }
        catch (error) {
            console.error('[pdf-export] Failed to load serverless dependencies:', error);
            throw new Error('DEPENDENCY_ERROR: Could not load @sparticuz/chromium or puppeteer-core');
        }
    }
    else {
        // Local development configuration
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const puppeteer = require('puppeteer');
        return {
            puppeteer,
            launchOptions: {
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
            }
        };
    }
}
// Import templates via built JS to avoid TS compiling files outside rootDir
// eslint-disable-next-line @typescript-eslint/no-var-requires
const templates = require('../../api/export/templates-dist/index.js');
// Flexible schema to accept different payloads per template
const RequestSchema = zod_1.z.object({
    assessment: zod_1.z.any(),
    scale: zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() }),
    options: zod_1.z.object({
        theme: zod_1.z.enum(['light', 'dark']).optional(),
        customTheme: zod_1.z.record(zod_1.z.string()).optional(),
        footerNote: zod_1.z.string().optional(),
        preset: zod_1.z.enum(['compact', 'medical', 'formal']).optional(),
        headerTitle: zod_1.z.string().optional(),
        headerSubtitle: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().optional(),
        scale: zod_1.z.number().optional(),
        showPatientSummary: zod_1.z.boolean().optional(),
    }).optional(),
});
const handler = async (event) => {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const debug = event.queryStringParameters?.debug === '1';
    const flavor = isServerless ? 'serverless' : 'local';
    const corsHeaders = {
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
        if (!event.body)
            throw new Error('Request body is required');
        let parsed;
        try {
            const body = JSON.parse(event.body);
            parsed = RequestSchema.parse(body);
        }
        catch (e) {
            console.error('[pdf-export] parse/validate error', { requestId, message: e?.message });
            throw new Error(`PARSE_ERROR: ${e?.message || 'Invalid request body'}`);
        }
        // 1) Pick template by scale id and render HTML
        let html;
        try {
            const templateFn = templates.getTemplateFunction(parsed.scale.id);
            html = templateFn(parsed);
        }
        catch (e) {
            console.error('[pdf-export] template render error', { requestId, message: e?.message });
            throw new Error(`TEMPLATE_ERROR: ${e?.message || 'Failed to render template'}`);
        }
        // 3) Get browser configuration and launch
        let browser;
        try {
            const { puppeteer, launchOptions } = await getBrowserConfig();
            console.log('[pdf-export] launching browser', {
                requestId,
                isServerless,
                executablePath: launchOptions.executablePath || 'system-default',
                argsCount: launchOptions.args?.length || 0
            });
            browser = await puppeteer.launch(launchOptions);
        }
        catch (e) {
            console.error('[pdf-export] launch error', { requestId, flavor, message: e?.message });
            throw new Error(`LAUNCH_ERROR: ${e?.message || 'Failed to launch browser'}`);
        }
        let pdfBuffer;
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
        }
        catch (e) {
            console.error('[pdf-export] render/pdf error', { requestId, message: e?.message });
            try {
                await browser?.close();
            }
            catch { }
            throw new Error(`RENDER_ERROR: ${e?.message || 'Failed to render PDF'}`);
        }
        try {
            await browser?.close();
        }
        catch { }
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
    }
    catch (error) {
        const msg = error?.message || 'Bad Request';
        const stage = (msg.split(':', 1)[0] || '').replace(/[^A-Z_]/g, '') || 'UNKNOWN';
        console.error('[pdf-export] error', { requestId, stage, flavor, message: msg });
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: msg, requestId, ...(debug ? { stage, flavor } : {}) }),
        };
    }
};
exports.handler = handler;
