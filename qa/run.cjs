// Playwright QA harness. Usage: npm run build && node qa/run.cjs [--url https://.../zeitwerk-preview/] [--routes /,/services]
// Checks per route x device (Chromium 1440x900, WebKit iPhone 390x844):
//   horizontal overflow, broken images, failed requests, console errors/page errors, noindex meta,
//   focus visibility (first 6 Tab stops have a visible outline/ring), axe-core WCAG A/AA (Chromium),
//   mobile menu: opens, traps focus, locks scroll, Escape closes. Screenshots -> qa/out/. Exit 1 on any failure.
const { chromium, webkit, devices } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')
const fs = require('node:fs')
const path = require('node:path')

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null }
const OUT = path.join(__dirname, 'out')
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  let base = arg('--url'), srv
  if (!base) {
    const { server, BASE } = require('../scripts/serve.cjs')
    await new Promise((r) => server.listen(4179, r))
    srv = server
    base = `http://localhost:4179${BASE}`
  }
  base = base.replace(/\/?$/, '/')
  const routesFile = path.join(__dirname, '..', 'dist', 'routes.json')
  let routes = arg('--routes') ? arg('--routes').split(',') : fs.existsSync(routesFile) ? JSON.parse(fs.readFileSync(routesFile, 'utf8')) : ['/']
  routes = [...routes, '/this-page-does-not-exist']
  const targets = [
    { name: 'desktop', type: chromium, ctx: { viewport: { width: 1440, height: 900 } }, axe: true },
    { name: 'iphone', type: webkit, ctx: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }, axe: false },
  ]
  const fails = []
  const report = []
  for (const t of targets) {
    const browser = await t.type.launch()
    const ctx = await browser.newContext(t.ctx)
    for (const r of routes) {
      const page = await ctx.newPage()
      const errs = []
      page.on('console', (m) => m.type() === 'error' && !(r.startsWith('/this-page') && /404/.test(m.text())) && errs.push('console: ' + m.text()))
      page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
      page.on('requestfailed', (q) => !/\.(mp4|webm)$/.test(q.url()) && errs.push('requestfailed: ' + q.url()))
      page.on('response', (s) => s.status() >= 400 && !s.url().endsWith('/this-page-does-not-exist') && errs.push(`http ${s.status()}: ${s.url()}`))
      const url = base + r.replace(/^\//, '')
      await page.goto(url, { waitUntil: 'networkidle' })
      // scroll through to trigger lazy content
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } scrollTo(0, 0) })
      await page.waitForTimeout(400)
      const res = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc),
        noindex: !!document.querySelector('meta[name=robots][content*=noindex]'),
        title: document.title,
        h1: document.querySelectorAll('h1').length,
        videos: [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc.split('/').pop(), ready: v.readyState, paused: v.paused, top: v.getBoundingClientRect().top })),
      }))
      const f = []
      if (res.overflow > 0) f.push(`overflow-x ${res.overflow}px`)
      if (res.broken.length) f.push('broken images: ' + res.broken.join(', '))
      if (!res.noindex) f.push('missing noindex')
      if (res.h1 !== 1) f.push(`h1 count ${res.h1}`)
      res.videos.filter((v) => v.top < t.ctx.viewport.height * 0.8).forEach((v) => { if (v.ready < 2 || v.paused) f.push(`video not playing in view: ${v.src} ready=${v.ready} paused=${v.paused}`) })
      f.push(...errs)
      const slug = (r === '/' ? 'home' : r.slice(1).replace(/\//g, '_')) + '-' + t.name
      await page.screenshot({ path: path.join(OUT, slug + '.png'), fullPage: false })
      // focus visibility on first Tab stops
      await page.evaluate(() => (document.activeElement && document.activeElement.blur(), scrollTo(0, 0)))
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab')
        const v = await page.evaluate(() => {
          const el = document.activeElement
          if (!el || el === document.body) return { ok: true }
          const cs = getComputedStyle(el)
          const ok = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none')
          return { ok, tag: el.tagName + (el.textContent || '').trim().slice(0, 24) }
        })
        if (!v.ok) f.push('focus not visible on ' + v.tag)
      }
      if (t.axe) {
        const ax = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        ax.violations.forEach((v) => f.push(`axe ${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`))
      }
      report.push({ device: t.name, route: r, title: res.title, fails: f })
      f.forEach((x) => fails.push(`[${t.name}] ${r}: ${x}`))
      await page.close()
    }
    if (t.name === 'iphone') {
      const page = await ctx.newPage()
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.click('[aria-controls="mobile-menu"]')
      await page.waitForTimeout(1000)
      const m = await page.evaluate(() => ({ visible: !document.getElementById('mobile-menu').hidden, locked: getComputedStyle(document.body).position === 'fixed', inert: document.querySelector('main').hasAttribute('inert') }))
      for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => !!document.activeElement.closest('#mobile-menu, [aria-controls="mobile-menu"]'))
      await page.screenshot({ path: path.join(OUT, 'menu-iphone.png') })
      await page.keyboard.press('Escape')
      const closed = await page.evaluate(() => document.getElementById('mobile-menu').hidden && getComputedStyle(document.body).position !== 'fixed')
      const mf = []
      if (!m.visible) mf.push('menu did not open')
      if (!m.locked) mf.push('scroll not locked')
      if (!m.inert) mf.push('main not inert')
      if (!inside) mf.push('focus escaped menu')
      if (!closed) mf.push('Escape did not close/unlock')
      report.push({ device: 'iphone', route: 'mobile-menu', fails: mf })
      mf.forEach((x) => fails.push('[iphone] mobile-menu: ' + x))
    }
    await browser.close()
  }
  srv && srv.close()
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1))
  console.log(`QA: ${report.length} checks, ${fails.length} failures`)
  fails.forEach((x) => console.log(' FAIL', x))
  process.exit(fails.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })
