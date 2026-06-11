import { chromium } from 'playwright';

const checks = {
  'home grid-cols-[1fr_auto_1fr]': 'grid-cols-[1fr_auto_1fr]',
  'azimuth text-9xl': 'text-9xl',
  'azimuth border-y-2': 'border-y-2',
  'expertise has-checked': 'has-checked',
  'contact resize-y': 'resize-y',
  'about/azimuth text-8xl': 'text-8xl',
  'shared text-7xl': 'text-7xl',
};

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
const css = await p.evaluate(() => {
  let out = '';
  for (const sheet of document.styleSheets) {
    try { for (const r of sheet.cssRules) out += r.cssText + '\n'; } catch {}
  }
  return out;
});
for (const [label, needle] of Object.entries(checks)) {
  console.log(css.includes(needle) ? 'YES' : 'NO ', label);
}
await b.close();
