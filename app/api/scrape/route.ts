import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import FirecrawlApp from '@mendable/firecrawl-js';
import { scrapeCache } from '@/lib/cache';

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
    
    // Check if we have a cached result for this URL
    const cacheKey = `scrape:${url}`;
    const cachedContent = scrapeCache.get(cacheKey);
    
    if (cachedContent) {
      console.log('Returning cached content for URL:', url);
      return NextResponse.json({
        content: cachedContent,
        usedAuth: false, // Since we're using cache, auth wasn't used in this request
        provider: 'cache',
        fromCache: true
      });
    }
    
    // Check if we have a saved authentication session
    const authFilePath = path.join(process.cwd(), '.auth.json');
    const hasAuth = fs.existsSync(authFilePath);

    // Launch a headless Chromium browser
    const browser = await chromium.launch({ headless: true });
    
    // Create context, using saved state if it exists
    const contextOptions = hasAuth ? { storageState: authFilePath } : {};
    const context = await browser.newContext(contextOptions);
    
    const page = await context.newPage();

    try {
      // Navigate to the URL with explicit timeout and error handling
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
      } catch (navigationError) {
        // If networkidle fails, try with DOM content loaded
        console.warn(`Navigation timeout with networkidle for ${url}, trying with domcontentloaded`);
        try {
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
          });
        } catch (fallbackError) {
          // Last resort: try with load event
          console.warn(`Navigation timeout with domcontentloaded for ${url}, trying with load`);
          await page.goto(url, { 
            waitUntil: 'load',
            timeout: 15000 
          });
        }
      }

      // Wait a bit more for dynamic content to load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Additional wait for SPA frameworks to render

      // Extract the text content of the page, preserving structure while removing noise
      const content = await page.evaluate(() => {
        // Create a deep clone of the body to work with
        const clonedBody = document.body.cloneNode(true) as HTMLElement;
        
        // Remove scripts, styles, and other non-content tags
        const elementsToRemove = clonedBody.querySelectorAll('script, style, noscript, iframe, svg, img, video, audio, nav, header, footer, aside');
        elementsToRemove.forEach(el => el.remove());
        
        // Remove elements with common ad/class tracking class names
        const adClassNames = ['advertisement', 'ads', 'ad-', 'banner', 'popup', 'modal', 'overlay'];
        Array.from(clonedBody.querySelectorAll('*')).forEach((element: Element) => {
          const className = element.getAttribute('class') || '';
          const id = element.getAttribute('id') || '';
          const combined = `${className} ${id}`.toLowerCase();
          
          if (adClassNames.some(adClass => combined.includes(adClass))) {
            element.remove();
          }
        });

        // Convert meaningful structural elements to text representation
        const headings = clonedBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
          const prefix = '='.repeat(parseInt(heading.tagName.charAt(1)));
          const suffix = '='.repeat(parseInt(heading.tagName.charAt(1)));
          heading.textContent = `\n${prefix} ${heading.textContent?.trim() || ''} ${suffix}\n`;
        });

        const paragraphs = clonedBody.querySelectorAll('p');
        paragraphs.forEach(p => {
          p.textContent = `${p.textContent?.trim() || ''}\n\n`;
        });

        const listItems = clonedBody.querySelectorAll('li');
        listItems.forEach(li => {
          li.textContent = `• ${li.textContent?.trim() || ''}\n`;
        });

        const links = clonedBody.querySelectorAll('a');
        links.forEach(a => {
          const href = a.getAttribute('href');
          if (href && a.textContent?.trim()) {
            a.textContent = `${a.textContent?.trim()} [${href}]`;
          }
        });

        // Get the clean text content with preserved structure
        return clonedBody.innerText || document.body.innerText || '';
      });

      // Store the content in cache for future requests
      scrapeCache.set(cacheKey, content);

      await browser.close();

      return NextResponse.json({
        content: content.trim(),
        usedAuth: hasAuth,
        provider: 'playwright'
      });
    } catch (scraperError) {
      await browser.close();
      throw scraperError;
    }
  } catch (error: any) {
    console.error('Error scraping URL:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while scraping the URL.' },
      { status: 500 }
    );
  }
}
