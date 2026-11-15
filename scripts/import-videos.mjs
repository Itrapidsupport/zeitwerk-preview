// Import lane 11 clips (read-only source: 11-video/manifest.json + final/<id>/) into public/video/ using the
// lane 08 <Video> naming (<id>-{1080,720}.{webm,mp4}, <id>-poster.{jpg,webp}) and update src/data/videos.json.
//   node scripts/import-videos.mjs
// Re-run after lane 11 replaces a clip with the same id; slot -> clip mapping lives in src/data/media.ts.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const lane = join(app, '..', '11-video')
const man = JSON.parse(readFileSync(join(lane, 'manifest.json'), 'utf8'))
const out = join(app, 'public', 'video')
mkdirSync(out, { recursive: true })
const jsonPath = join(app, 'src', 'data', 'videos.json')
const data = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : {}
for (const c of man.clips) {
  const dir = join(lane, c.path)
  const f = c.files
  const map = { [`${c.id}-1080.mp4`]: f.mp4_1080p, [`${c.id}-1080.webm`]: f.webm_1080p, [`${c.id}-720.mp4`]: f.mp4_720p, [`${c.id}-720.webm`]: f.webm_720p, [`${c.id}-poster.jpg`]: f.poster_jpg, [`${c.id}-poster.webp`]: f.poster_webp }
  for (const [dst, src] of Object.entries(map)) copyFileSync(join(dir, src), join(out, dst))
  const sz = (n) => statSync(join(out, n)).size
  data[c.id] = { w: 1920, h: 1080, dur: c.loop_seconds, poster: `${c.id}-poster.jpg`, sizes: { 720: { mp4: sz(`${c.id}-720.mp4`), webm: sz(`${c.id}-720.webm`) }, 1080: { mp4: sz(`${c.id}-1080.mp4`), webm: sz(`${c.id}-1080.webm`) } } }
  console.log('imported', c.id)
}
writeFileSync(jsonPath, JSON.stringify(data, null, 1))
