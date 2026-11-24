// Renders poster/frontpage.html to entry.png at exactly 1024 x 1024.
// Authoring tool only (needs Playwright + Chromium); the entry itself (main.ts) just copies entry.png.
//   node poster/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
import { dirname, join } from 'node:path';
import { statSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'entry.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
await page.goto('file://' + join(here, 'frontpage.html'));
await page.evaluate(() => document.fonts.ready);
// Fail loudly if anything spills past the canvas: clipped text reads as garbled to the judge.
const overflow = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll('[data-fit], .hdr, .band, .band .cols > div, h1')) {
    const r = el.getBoundingClientRect();
    if (r.bottom > 1024.5 || r.right > 1024.5 || el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
      bad.push(el.textContent.trim().slice(0, 40));
  }
  return { bad, bodyH: document.body.scrollHeight };
});
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
await browser.close();
console.log('wrote', out, statSync(out).size, 'bytes; body height', overflow.bodyH, overflow.bad.length ? 'OVERFLOW: ' + overflow.bad.join(' | ') : 'no overflow');
