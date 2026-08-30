const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport:{width:1200,height:630}, deviceScaleFactor:1 });
  pg.on('pageerror', e => console.log('  PAGEERROR', String(e)));
  pg.on('requestfailed', r => console.log('  REQFAIL', r.url().slice(0,60)));
  for (const c of ['main','gym','max']) {
    await pg.goto(`http://localhost:5199/card.html?c=${c}`, { waitUntil:'load' });
    await pg.waitForFunction(() => window.__fonts === true, null, { timeout: 20000 });
    await pg.waitForTimeout(400);
    const st = await pg.evaluate(() => ({ drew: window.__drew,
      // did Khand actually load, or did it fall back?
      khand: document.fonts.check('700 158px Khand'),
      deva: document.fonts.check('400 118px "Tiro Devanagari Hindi"'),
      gur: document.fonts.check('400 130px "Tiro Gurmukhi"') }));
    console.log(` ${c}: corridor=${st.drew} khand=${st.khand} deva=${st.deva} gur=${st.gur}`);
    await pg.screenshot({ path: `/tmp/og/${c}.png` });
  }
  await b.close();
})();
