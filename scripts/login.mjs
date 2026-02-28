import { chromium } from 'playwright';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFilePath = path.join(__dirname, '..', '.auth.json');
const cacheFilePath = path.join(__dirname, '..', '.scrape-cache.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  console.log('Launching browser...');
  console.log('\nOptions:');
  console.log('  1. Authenticate (default)');
  console.log('  2. Clear cache only');
  console.log('  3. Clear both auth and cache');
  
  rl.question('Choose an option (1, 2, or 3, press Enter for default 1): ', async (option) => {
    option = option.trim() || '1';
    
    if (option === '2') {
      // Just clear cache
      if (fs.existsSync(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
        console.log(`\n🗑️  Cache cleared: ${cacheFilePath}`);
      } else {
        console.log('\nℹ️  No cache file found to clear');
      }
      rl.close();
      return;
    }
    
    if (option === '3') {
      // Clear both cache and auth
      if (fs.existsSync(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
        console.log(`\n🗑️  Cache cleared: ${cacheFilePath}`);
      }
      
      if (fs.existsSync(authFilePath)) {
        fs.unlinkSync(authFilePath);
        console.log(`\n🗑️  Auth session cleared: ${authFilePath}`);
      } else {
        console.log('\nℹ️  No auth file found to clear');
      }
      
      rl.close();
      return;
    }
    
    // Option 1: Authenticate (default)
    // Launch a visible browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('\n==================================================');
    console.log('1. A browser window has opened.');
    console.log('2. Navigate to the website you want to scrape.');
    console.log('3. Log in manually (solve CAPTCHAs, 2FA, etc.).');
    console.log('4. Once you are fully logged in, come back to this terminal.');
    console.log('==================================================\n');

    rl.question('Press ENTER when you are fully logged in to save the session...', async () => {
      console.log('Saving session state...');
      
      // Save the cookies and local storage to .auth.json
      await context.storageState({ path: authFilePath });
      
      console.log(`\n✅ Session saved successfully to: ${authFilePath}`);
      console.log('The scraper will now use this session to access protected pages.');
      
      await browser.close();
      rl.close();
    });
  });
}

run().catch(console.error);
