// Import lane 05 images into the app (run after 05-imagery/work/finalize.py has written images/manifest.json):
//   node scripts/import-images.mjs
// Copies web derivatives (16x9 webp/avif) to public/img/<slot>-<w>.<ext> and writes src/data/images.json
// in the lane 08 <Img> format {slot:{w,h,ws}}. Slots already referenced by the pages (MediaSlot image=...):
// svc-<service-slug>, case-property-intelligence, case-collections-engine, about-workbench (hero-clockwork /
// bg-* are optional). Any slot present here replaces its procedural placeholder automatically.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const lane = join(app, '..', '05-imagery', 'images')
const manPath = join(lane, 'manifest.json')
if (!existsSync(manPath)) { console.error('no 05-imagery/images/manifest.json yet (lane 05 has not finalized)'); process.exit(1) }
const man = JSON.parse(readFileSync(manPath, 'utf8'))
const ws = man.variants?.['16x9']?.webp ?? [480, 768, 1280, 1920, 2560, 3840]
const avif = new Set(man.variants?.['16x9']?.avif ?? [])
mkdirSync(join(app, 'public', 'img'), { recursive: true })
const out = {}
for (const [slot, m] of Object.entries(man.images ?? {})) {
  if (!m.files) continue
  const have = []
  for (const w of ws) {
    const src = join(lane, 'web', `${slot}-16x9-${w}.webp`)
    if (!existsSync(src)) continue
    copyFileSync(src, join(app, 'public', 'img', `${slot}-${w}.webp`))
    const a = join(lane, 'web', `${slot}-16x9-${w}.avif`)
    if (avif.has(w) && existsSync(a)) copyFileSync(a, join(app, 'public', 'img', `${slot}-${w}.avif`))
    have.push(w)
  }
  if (have.length) out[slot] = { w: 1920, h: 1080, ws: have, alt: m.alt }
}
writeFileSync(join(app, 'src', 'data', 'images.json'), JSON.stringify(out, null, 1))
console.log(`imported ${Object.keys(out).length} image slots`)
