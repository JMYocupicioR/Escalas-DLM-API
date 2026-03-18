import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import { TEMPLATE_MAP, getTemplateFunction } from './templates';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Base request schema - flexible to accommodate all template types
const BaseRequestSchema = z.object({
  assessment: z.any(), // Each template validates its own assessment structure
  scale: z.object({ 
    id: z.string(), 
    name: z.string() 
  }),
  questions: z.array(z.any()).optional(), // Structure varies by template
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

/**
 * Template Router - Selects and executes the appropriate template function
 * based on the scale ID from the request payload
 */
const generateHtmlFromTemplate = (payload: any): string => {
  const scaleId = payload.scale?.id;
  
  if (!scaleId) {
    console.warn('No scale ID provided, using generic template');
    return TEMPLATE_MAP.generic(payload);
  }

  // Get the template function for this scale ID
  const templateFunction = getTemplateFunction(scaleId);
  
  console.log(`Using template for scale: ${scaleId}`);
  
  try {
    return templateFunction(payload);
  } catch (error) {
    console.error(`Error generating HTML with template for ${scaleId}:`, error);
    console.log('Falling back to generic template');
    return TEMPLATE_MAP.generic(payload);
  }
};

app.post('/api/pdf/export', async (req: Request, res: Response) => {
  try {
    // Basic request validation
    const parsed = BaseRequestSchema.parse(req.body);
    
    // Route to appropriate template based on scale ID
    const html = generateHtmlFromTemplate(parsed);
    const browser = await puppeteer.launch({
      headless: 'shell', // usa Chrome estable si está disponible
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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

    // Si viene ?binary=1, devolvemos application/pdf
    if (req.query.binary) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      return res.end(pdfBuffer, 'binary');
    }
    // Por defecto: JSON base64 para apps nativas
    return res.json({ filename, base64: pdfBuffer.toString('base64') });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return res.status(400).json({ error: error?.message || 'Bad Request' });
  }
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
  console.log('Available templates:', Object.keys(TEMPLATE_MAP));
});


