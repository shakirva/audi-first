import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:5174/');
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 3000 });
    await page.type('input[type="email"]', 'admin@venueza.com');
    await page.type('input[type="password"]', 'admin123');
    await page.evaluate(() => {
      document.querySelector('button[type="submit"]').click();
    });
  } catch (e) {
    console.log("Maybe already logged in or login failed");
  }

  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'dashboard-test.png' });
  await browser.close();
  console.log('Screenshot saved to dashboard-test.png');
})();
