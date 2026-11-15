// Lane 07 overlap + straight-text checks across every route (Chromium 1440 + WebKit 390x844).
// node qa/overlap.cjs <base-url>
const pw = require('playwright')
const base = process.argv[2]
const routes = require('../dist/routes.json')
const OVERLAP = () => {
  const SEL = 'h1,h2,h3,h4,p,li,.btn,.lnk,.t-label,.logo,summary,dt,dd,.zwd-title,.zwd-s'
  const vw = innerWidth, vh = innerHeight
  const clip = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) })
  const hdr = document.querySelector('.hdr')
  const boxes = []
  for (const el of document.querySelectorAll(SEL)) {
    if (el.closest('[aria-hidden="true"]') || el.closest('.sr-only') || el.closest('svg')) continue
    // closed <details> content is not rendered (Chromium reports stale boxes for it)
    if (el.closest('details:not([open])') && !el.matches('summary')) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    let op = 1
    for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity)
    if (op < 0.05) continue
    // motion-kit masks carry 0.14em of empty descender padding (+ equal negative margin): measure the content box
    const inner = el.classList.contains('mk-mask') ? el.querySelector(':scope > .mk-mask-inner') : null
    const b = (inner || el).getBoundingClientRect()
    const top = hdr && !hdr.contains(el) ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0
    let r = clip({ l: b.left, t: b.top, r: b.right, b: b.bottom }, { l: 0, t: top, r: vw, b: vh })
    if (inner) { const ob = el.getBoundingClientRect(); r = clip(r, { l: ob.left, t: ob.top, r: ob.right, b: ob.bottom }) } // the mask itself clips (overflow hidden)
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n)
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') { const pb = n.getBoundingClientRect(); r = clip(r, { l: pb.left, t: pb.top, r: pb.right, b: pb.bottom }) }
    }
    if (r.r - r.l < 2 || r.b - r.t < 2) continue
    boxes.push({ el, r, label: el.tagName.toLowerCase() + ' "' + (el.textContent || '').trim().slice(0, 28) + '"' })
  }
  const out = []
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j]
    if (A.el.contains(B.el) || B.el.contains(A.el)) continue
    const c = clip(A.r, B.r), area = Math.max(0, c.r - c.l) * Math.max(0, c.b - c.t)
    if (area > 6) out.push(`${A.label} x ${B.label} (${Math.round(area)}px2)`)
  }
  // straight-only: no rotate/skew on any text element or its ancestors (svg art excluded)
  for (const el of document.querySelectorAll('h1,h2,h3,p,.mk-line,.btn')) {
    if (el.closest('svg')) continue
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const t = getComputedStyle(n).transform
      if (t && t !== 'none') { const m = t.match(/matrix\(([^)]+)\)/); if (m) { const [a, b, c] = m[1].split(',').map(Number); if (Math.abs(b) > 0.001 || Math.abs(c) > 0.001) { out.push('ROTATED/SKEWED text: ' + (el.textContent || '').slice(0, 30)); break } } }
    }
  }
  return out
}
;(async () => {
  const fails = []
  for (const [eng, vp] of [['chromium', { width: 1440, height: 900 }], ['webkit', { width: 390, height: 844 }]]) {
    const b = await pw[eng].launch()
    const p = await b.newPage({ viewport: vp })
    for (const r of [...routes, '/this-page-does-not-exist']) {
      await p.goto(base + r.replace(/^\//, ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
      const H = await p.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < H; y += Math.round(vp.height * 0.45)) {
        await p.evaluate((y) => { const l = window.__lenis; l ? l.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y) }, y)
        for (const w of [180, 700]) {
          await p.waitForTimeout(w === 180 ? 180 : 520)
          const o = await p.evaluate(OVERLAP)
          o.forEach((x) => fails.push(`${eng} ${r} y=${y} t=${w}: ${x}`))
        }
      }
    }
    await b.close()
  }
  const uniq = [...new Set(fails.map((f) => f.replace(/ y=\d+ t=\d+/, '')))]
  console.log(JSON.stringify({ samples: fails.length, unique: uniq.length, list: uniq.slice(0, 60) }, null, 1))
  process.exit(uniq.length ? 1 : 0)
})()
