import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
const card = page.locator('#pv-card');
await card.scrollIntoViewIfNeeded();

// frames along the timeline (seconds from scroll-into-view)
const marks = [[0.1, 'arrival'], [2.0, 'run'], [3.4, 'nearmiss'], [5.6, 'stamp'], [7.0, 'build'], [8.2, 'anchor'], [11.5, 'final']];
let elapsed = 0;
for (const [t, name] of marks) {
  await page.waitForTimeout(Math.max(0, (t - elapsed) * 1000));
  elapsed = t;
  await card.screenshot({ path: `tmp/v2-${name}.png` });
  elapsed += 0.45; // rough screenshot overhead at dpr 2
}

// replay must fully reset and play again
await card.locator('.pv-replay').click();
await page.waitForTimeout(1200);
const midClasses = await card.getAttribute('class');
await page.waitForTimeout(11500);
const endClasses = await card.getAttribute('class');
const rowStates = await card.locator('.pv-row').evaluateAll((els) => els.map((e) => e.className));

console.log('mid-replay classes:', midClasses);
console.log('end classes:', endClasses);
console.log('row classes at end:', rowStates);
console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
