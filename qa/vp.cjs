// viewport shots at scroll fractions: node qa/vp.cjs <url> <out-prefix> <w> <h> <engine> f1 f2 ...
const pw = require('playwright')
const [url, out, w, h, eng, ...fs] = process.argv.slice(2)
;(async () => {
  const b = await pw[eng].launch({ args: eng === 'chromium' ? ['--use-angle=metal', '--enable-gpu'] : [] })
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (const f of fs) {
    const y = f.startsWith('#') ? await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, f) : Math.round(H * +f)
    await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(1800)
    await p.screenshot({ path: `${out}-${f.replace(/[#.]/g, '')}.png` })
  }
  console.log(H, JSON.stringify(errs)); await b.close()
})()
