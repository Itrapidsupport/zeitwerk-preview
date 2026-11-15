// QA screenshots: node qa/shots.cjs <base> <outdir> [routes...]
const { chromium, webkit, devices } = require('playwright')
const base = process.argv[2], out = process.argv[3]
const routes = process.argv.slice(4).length ? process.argv.slice(4) : ['/']
require('fs').mkdirSync(out, { recursive: true })
;(async () => {
  const errs = []
  const cb = await chromium.launch()
  const d = await cb.newPage({ viewport: { width: 1440, height: 900 } })
  d.on('pageerror', (e) => errs.push('desk ' + e.message)); d.on('console', (m) => m.type() === 'error' && errs.push('desk console ' + m.text()))
  for (const r of routes) {
    const n = r === '/' ? 'home' : r.slice(1).replace(/\//g, '_')
    await d.goto(base + r.replace(/^\//, ''), { waitUntil: 'networkidle' })
    await d.waitForTimeout(1500)
    // scroll through to trigger reveals
    const H = await d.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < H; y += 500) { await d.evaluate((y) => window.scrollTo(0, y), y); await d.waitForTimeout(120) }
    await d.evaluate(() => window.scrollTo(0, 0)); await d.waitForTimeout(800)
    await d.screenshot({ path: `${out}/${n}-desktop-1440-full.png`, fullPage: true })
  }
  await cb.close()
  const wb = await webkit.launch()
  const m = await wb.newPage({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } })
  m.on('pageerror', (e) => errs.push('wk ' + e.message))
  for (const r of routes) {
    const n = r === '/' ? 'home' : r.slice(1).replace(/\//g, '_')
    await m.goto(base + r.replace(/^\//, ''), { waitUntil: 'networkidle' })
    await m.waitForTimeout(2000)
    await m.screenshot({ path: `${out}/${n}-iphone-390-hero.png` })
    const H = await m.evaluate(() => document.documentElement.scrollHeight)
    for (const f of [0.3, 0.6]) {
      await m.evaluate((y) => window.scrollTo(0, y), Math.round(H * f)); await m.waitForTimeout(1600)
      await m.screenshot({ path: `${out}/${n}-iphone-390-mid${Math.round(f * 100)}.png` })
    }
  }
  await wb.close()
  console.log(JSON.stringify(errs.slice(0, 20), null, 1))
})()
