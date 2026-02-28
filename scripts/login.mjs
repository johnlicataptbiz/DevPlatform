import { chromium } from 'playwright';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFilePath = path.join(__dirname, '..', '.auth.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  console.log('Launching browser...');
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
}

run().catch(console.error);
