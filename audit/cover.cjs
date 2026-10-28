// Cover → reveal check on a clip with hands passing over the face: logs
// every state change (covering, animal) with its clip time and screenshots.
//   PLAYWRIGHT_FROM=… node audit/cover.cjs <clip.y4m> <out-dir> [seconds]
const fs = require('fs');
const path = require('path');
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.env.PLAYWRIGHT_FROM || __dirname] }));
const [clip, out, secs = '22'] = process.argv.slice(2);
const BASE = `http://localhost:${process.env.PORT || 5192}`;
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${clip}`] });
  const page = await (await browser.newContext({ viewport: { width: 540, height: 960 }, permissions: ['camera'] })).newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/__harness|XNNPACK/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  await page.goto(`${BASE}/?input=webcam`);
  await page.waitForFunction(() => document.documentElement.dataset.experience === 'ready' && window.__spirit, null, { timeout: 120000 });
  const t0 = Date.now(); let prev = ''; let shots = 0;
  while (Date.now() - t0 < +secs * 1000) {
    const s = await page.evaluate(() => { const x = window.__spirit.get(); return `animal=${x.animal} covering=${x.covering} reveals=${x.reveals}`; });
    if (s !== prev) {
      console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', s);
      prev = s;
      if (/covering=false/.test(s) && /animal=[0-9]/.test(s) && shots < 4) { await page.waitForTimeout(500); await page.screenshot({ path: path.join(out, `reveal-${shots++}.png`) }); }
    }
    await page.waitForTimeout(50);
  }
  console.log('errors', JSON.stringify(errors.slice(0, 4)));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
