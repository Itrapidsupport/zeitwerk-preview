// screenshot a section by selector: node qa/sec.cjs <url> <selector> <out.png> <w> <h> <engine> [offsetPx]
const pw = require('playwright'); const [url, sel, out, w, h, eng, off] = process.argv.slice(2)
;(async () => { const b = await pw[eng].launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } })
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  const y = await p.evaluate(([s, o]) => document.querySelector(s).getBoundingClientRect().top + scrollY + (+o || 0), [sel, off])
  await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(1800); await p.screenshot({ path: out }); await b.close() })()
