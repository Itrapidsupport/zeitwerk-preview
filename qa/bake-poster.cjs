// Re-bake the dark hero poster from the live PBR scene (transparent PNG, 4:3, same contain framing):
// node qa/bake-poster.cjs <base-url>  -> ~/.hermes/cache/scratch/zw-poster-dark.png
const { chromium } = require('playwright')
;(async () => {
  const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
  const p = await b.newPage({ viewport: { width: 1700, height: 1300 }, deviceScaleFactor: 2 })
  await p.goto(process.argv[2], { waitUntil: 'networkidle' })
  await p.addStyleTag({ content: `html,body,.hero,.theme-deep,#root,main{background:transparent!important}
    .hdr,.hero-copy,.hero-meta,.hero-cols,.hero-scrim,.hero-intro,footer,main>*:not(.hero){display:none!important}
    .hero{min-height:0!important;height:1200px!important;overflow:visible!important}
    .hero-stage{position:fixed!important;inset:0!important}
    .hero-mech{position:fixed!important;left:0!important;top:0!important;right:auto!important;width:1600px!important;height:1200px!important}` })
  await p.mouse.move(800, 600); await p.mouse.move(801, 601)
  await p.waitForSelector('.hero-mech canvas', { timeout: 15000 })
  await p.waitForTimeout(6000)
  const el = await p.$('.hero-mech')
  await el.screenshot({ path: require('os').homedir() + '/.hermes/cache/scratch/zw-poster-dark.png', omitBackground: true })
  await b.close(); console.log('baked')
})()
