// hero at several widths and times: node qa/hero.cjs <url> <outdir>
const pw = require('playwright'); const [url, out] = process.argv.slice(2)
;(async () => {
  const res = []
  for (const [eng, w, h, ts] of [['webkit', 320, 640, [1]], ['webkit', 390, 844, [0, 3, 6]], ['webkit', 768, 1024, [1]], ['chromium', 1024, 768, [1]], ['chromium', 1440, 900, [0, 3, 6]]]) {
    const b = await pw[eng].launch(); const p = await b.newPage({ viewport: { width: w, height: h } })
    const t0 = Date.now(); await p.goto(url, { waitUntil: 'domcontentloaded' })
    for (const t of ts) {
      const wait = t * 1000 - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait)
      await p.screenshot({ path: `${out}/hero-${w}-${t}s.png` })
    }
    res.push(await p.evaluate(() => { const h = document.querySelector('#hero-h').getBoundingClientRect(); const v = document.querySelector('.hero-film video'); return { w: innerWidth, h1Left: Math.round(h.left), h1Right: Math.round(h.right), overflow: document.documentElement.scrollWidth > innerWidth, canvas: document.querySelectorAll('canvas').length, video: v && v.currentSrc.split('/').pop() } }))
    await b.close()
  }
  console.log(JSON.stringify(res))
})()
