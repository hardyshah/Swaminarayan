// Print each build/<slug>.html to a PDF: node tools/kirtan/render.js BUILD_DIR OUT_DIR
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [src, out] = [process.argv[2] || path.join(__dirname, 'build'), process.argv[3] || path.join(__dirname, 'build')];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const f of fs.readdirSync(src).filter(f => f.endsWith('.html'))) {
    await p.goto('file://' + path.resolve(src, f), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const title = await p.title();
    await p.pdf({ path: path.join(out, f.replace(/\.html$/, '.pdf')), format: 'A4', printBackground: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: `<div style="font-size:7px;width:100%;padding:0 14mm;color:#8a7055;display:flex;justify-content:space-between"><span>${title.replace(/</g,'&lt;')}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      margin: { top: '14mm', bottom: '16mm', left: '0', right: '0' } });
    console.log('wrote', f);
  }
  await b.close();
})();
