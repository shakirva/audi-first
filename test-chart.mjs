import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));
  
  await page.goto("http://localhost:5174/");
  await page.waitForSelector("input[type='email']");
  await page.fill("input[type='email']", "admin@venueza.com");
  await page.fill("input[type='password']", "admin123");
  await page.click("button:has-text('Sign In')");
  
  await page.waitForSelector(".hm-charts-grid", {timeout: 10000});
  await page.waitForTimeout(2000);
  await browser.close();
})();
