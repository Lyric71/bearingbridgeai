import { chromium } from 'playwright';
// args: JSON array of [url, outPath, selector?], width
const items = JSON.parse(process.argv[2]);
const width = +process.argv[3] || 390;
const browser = await chromium.launch();
for (const [url, out, selector] of items) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      await new Promise((r) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y); y += window.innerHeight;
          if (y < document.body.scrollHeight) setTimeout(step, 40);
          else { window.scrollTo(0, 0); setTimeout(r, 250); }
        };
        step();
      });
    });
    await page.waitForTimeout(300);
    if (selector) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await el.screenshot({ path: out });
    } else {
      await page.screenshot({ path: out, fullPage: true });
    }
    console.log('ok', out);
  } catch (e) {
    console.log('ERR', url, selector || '', e.message);
  }
  await page.close();
}
await browser.close();
