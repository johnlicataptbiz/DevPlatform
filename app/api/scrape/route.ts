import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import FirecrawlApp from '@mendable/firecrawl-js';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'A valid URL is required' },
        { status: 400 }
      );
    }

    // If we are in production (Vercel), use Firecrawl API
    if (process.env.NODE_ENV === 'production') {
      console.log('Running in production: Using Firecrawl API');
      
      if (!process.env.FIRECRAWL_API_KEY) {
        return NextResponse.json(
          { error: 'FIRECRAWL_API_KEY is not set in production environment.' },
          { status: 500 }
        );
      }

      const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
      
      const scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown'],
      });

      if (!scrapeResult.success) {
        throw new Error(`Firecrawl failed to scrape: ${scrapeResult.error}`);
      }

      return NextResponse.json({
        content: (scrapeResult as any).data?.markdown || scrapeResult.markdown,
        usedAuth: false,
        provider: 'firecrawl'
      });
    }

    // If we are in development (Local), use Playwright with local auth
    console.log('Running locally: Using Playwright');
    
    // Check if we have a saved authentication session
    const authFilePath = path.join(process.cwd(), '.auth.json');
    const hasAuth = fs.existsSync(authFilePath);

    // Launch a headless Chromium browser
    const browser = await chromium.launch({ headless: true });
    
    // Create context, using saved state if it exists
    const contextOptions = hasAuth ? { storageState: authFilePath } : {};
    const context = await browser.newContext(contextOptions);
    
    const page = await context.newPage();

    // Navigate to the URL and wait for the network to be idle
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extract the text content of the page, removing noisy elements
    const content = await page.evaluate(() => {
      // Remove scripts, styles, and other non-content tags
      const elementsToRemove = document.querySelectorAll('script, style, noscript, iframe, svg, img, video, audio');
      elementsToRemove.forEach(el => el.remove());

      // Get the clean text content of the body
      return document.body.innerText || '';
    });

    await browser.close();

    // Return the scraped content
    return NextResponse.json({
      content: content.trim(),
      usedAuth: hasAuth,
      provider: 'playwright'
    });
  } catch (error: any) {
    console.error('Error scraping URL:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while scraping the URL.' },
      { status: 500 }
    );
  }
}
