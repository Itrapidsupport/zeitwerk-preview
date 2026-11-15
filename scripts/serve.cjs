// Local static server that mimics GitHub Pages for dist/: base path, dir/index.html, 404.html with status 404.
// Usage: node scripts/serve.cjs [port]   ->  http://localhost:4173/zeitwerk-preview/
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const ROOT = path.join(__dirname, '..', 'dist')
const BASE = process.env.BASE || '/zeitwerk-preview/'
const PORT = +(process.argv[2] || process.env.PORT || 4173)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain' }

function send(res, file, status = 200, req) {
  const stat = fs.statSync(file)
  const type = TYPES[path.extname(file)] || 'application/octet-stream'
  const range = req && req.headers.range
  if (range && /^bytes=/.test(range)) {
    const [a, b] = range.slice(6).split('-')
    const start = +a || 0
    const end = b ? +b : stat.size - 1
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 })
    return fs.createReadStream(file, { start, end }).pipe(res)
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' })
  fs.createReadStream(file).pipe(res)
}

const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0])
  if (u === BASE.slice(0, -1)) { res.writeHead(301, { Location: BASE }); return res.end() }
  if (!u.startsWith(BASE)) return send(res, path.join(ROOT, '404.html'), 404)
  let p = path.join(ROOT, u.slice(BASE.length))
  if (!p.startsWith(ROOT)) return send(res, path.join(ROOT, '404.html'), 404)
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    if (!u.endsWith('/')) { res.writeHead(301, { Location: u + '/' }); return res.end() }
    p = path.join(p, 'index.html')
  }
  if (fs.existsSync(p)) return send(res, p, 200, req)
  return send(res, path.join(ROOT, '404.html'), 404)
})
if (require.main === module) server.listen(PORT, () => console.log(`serving dist at http://localhost:${PORT}${BASE}`))
module.exports = { server, BASE }
