import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
const card = page.locator('#ks-card');
await card.scrollIntoViewIfNeeded();

// frames along the timeline (seconds from scroll-into-view)
const marks = [[1.5, 'run'], [4.9, 'crossing'], [6.1, 'terminated'], [7.1, 'stamp'], [10.2, 'final']];
let elapsed = 0;
for (const [t, name] of marks) {
  await page.waitForTimeout((t - elapsed) * 1000);
  elapsed = t;
  await card.screenshot({ path: `tmp/anim-${name}.png` });
}

// replay must fully reset and play again
await card.locator('.ks-replay').click();
await page.waitForTimeout(1200);
await card.screenshot({ path: 'tmp/anim-replayed.png' });
const midClasses = await card.getAttribute('class');
await page.waitForTimeout(10000);
const endClasses = await card.getAttribute('class');

console.log('mid-replay classes:', midClasses);
console.log('end classes:', endClasses);
console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
