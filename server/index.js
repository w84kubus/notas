// Notas – serwer pokoi. Wszystko w pamięci: restart serwera = puste pokoje.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { randomInt } from 'node:crypto'
import { WebSocketServer } from 'ws'

const require = createRequire(import.meta.url)
const { setupWSConnection, docs } = require('y-websocket/bin/utils')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 8787)
const TRUST_PROXY = process.env.TRUST_PROXY === '1'
const ROOM_TTL_MS = Number(process.env.ROOM_TTL_HOURS || 12) * 3600_000
const MAX_ROOMS = 5000
const MAX_PEOPLE_PER_ROOM = 30
// bez 0/O, 1/I/L – żeby kod dało się przeczytać z kartki
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LEN = 6
const CODE_RE = new RegExp(`^[${ALPHABET}]{${CODE_LEN}}$`)

/** @type {Map<string, {createdAt:number,lastActive:number,hooked:boolean}>} */
const rooms = new Map()

// ---------- limity prób (ochrona przed zgadywaniem kodów) ----------
function makeLimiter(max, windowMs, blockMs) {
  const m = new Map()
  return {
    blocked(ip) {
      const e = m.get(ip)
      return !!e && e.blockedUntil > Date.now()
    },
    hit(ip) {
      const now = Date.now()
      let e = m.get(ip)
      if (!e || e.resetAt < now) e = { count: 0, resetAt: now + windowMs, blockedUntil: 0 }
      e.count++
      if (e.count >= max) e.blockedUntil = now + blockMs
      m.set(ip, e)
    },
    sweep() {
      const now = Date.now()
      for (const [k, e] of m) if (e.resetAt < now && e.blockedUntil < now) m.delete(k)
    },
  }
}
const failedJoins = makeLimiter(10, 60_000, 5 * 60_000)
const creations = makeLimiter(12, 60_000, 2 * 60_000)

function clientIp(req) {
  if (TRUST_PROXY) {
    // Nagłówki ustawiane przez proxy hostingu (Fly.io, Render/Cloudflare); w ostateczności X-Forwarded-For
    for (const h of ['fly-client-ip', 'cf-connecting-ip']) {
      const v = req.headers[h]
      if (typeof v === 'string' && v) return v
    }
    const x = req.headers['x-forwarded-for']
    if (typeof x === 'string' && x) return x.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

function newCode() {
  for (let i = 0; i < 20; i++) {
    let c = ''
    for (let j = 0; j < CODE_LEN; j++) c += ALPHABET[randomInt(ALPHABET.length)]
    if (!rooms.has(c)) return c
  }
  return null
}

function roomPeople(code) {
  const d = docs.get(code)
  return d ? d.conns.size : 0
}

// ---------- HTTP ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
}

function baseHeaders(res) {
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  if (isProd) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' ws: wss:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    )
  }
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x')
  let rel = decodeURIComponent(url.pathname)
  let file = path.join(DIST, rel)
  if (!file.startsWith(DIST)) return json(res, 400, { error: 'bad_path' })
  let isAsset = rel.startsWith('/assets/')
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA: każda inna ścieżka (np. /K7M2QX) to index.html
    if (path.extname(rel)) {
      res.writeHead(404)
      return res.end()
    }
    file = path.join(DIST, 'index.html')
    isAsset = false
  }
  const ext = path.extname(file)
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' }
  headers['Cache-Control'] = isAsset ? 'public, max-age=31536000, immutable' : 'no-cache'
  res.writeHead(200, headers)
  fs.createReadStream(file).pipe(res)
}

let vite = null
if (!isProd) {
  const { createServer } = await import('vite')
  vite = await createServer({
    root: ROOT,
    appType: 'spa',
    server: { middlewareMode: true, hmr: { port: 24678 } },
  })
} else if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Brak katalogu dist/. Uruchom najpierw: npm run build')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  baseHeaders(res)
  const url = new URL(req.url, 'http://x')
  const ip = clientIp(req)

  if (url.pathname === '/healthz') return json(res, 200, { ok: true })

  if (req.method === 'POST' && url.pathname === '/api/rooms') {
    if (creations.blocked(ip)) return json(res, 429, { error: 'too_many' })
    creations.hit(ip)
    if (rooms.size >= MAX_ROOMS) return json(res, 503, { error: 'full' })
    const code = newCode()
    if (!code) return json(res, 503, { error: 'full' })
    const now = Date.now()
    rooms.set(code, { createdAt: now, lastActive: now, hooked: false })
    return json(res, 201, { code })
  }

  const m = url.pathname.match(/^\/api\/rooms\/([^/]+)$/)
  if (req.method === 'GET' && m) {
    if (failedJoins.blocked(ip)) return json(res, 429, { error: 'too_many' })
    const code = m[1].toUpperCase()
    if (!CODE_RE.test(code) || !rooms.has(code)) {
      failedJoins.hit(ip)
      return json(res, 404, { error: 'not_found' })
    }
    return json(res, 200, { ok: true, people: roomPeople(code) })
  }

  if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'not_found' })

  if (vite) return vite.middlewares(req, res)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405)
    return res.end()
  }
  serveStatic(req, res)
})

// ---------- WebSocket ----------
const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 })

function reject(socket, status, text) {
  socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\n\r\n`)
  socket.destroy()
}

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://x')
  const m = url.pathname.match(/^\/ws\/([^/]+)$/)
  if (!m) return reject(socket, 404, 'Not Found') // HMR Vite ma osobny port

  // tylko ta sama domena (blokuje cudze strony łączące się z pokojami)
  const origin = req.headers.origin
  if (origin) {
    let host = ''
    try {
      host = new URL(origin).host
    } catch {}
    if (host !== req.headers.host) return reject(socket, 403, 'Forbidden')
  }

  const ip = clientIp(req)
  if (failedJoins.blocked(ip)) return reject(socket, 429, 'Too Many Requests')
  const code = m[1].toUpperCase()
  if (!CODE_RE.test(code) || !rooms.has(code)) {
    failedJoins.hit(ip)
    return reject(socket, 404, 'Not Found')
  }
  if (roomPeople(code) >= MAX_PEOPLE_PER_ROOM) return reject(socket, 503, 'Room Full')

  wss.handleUpgrade(req, socket, head, (ws) => {
    const room = rooms.get(code)
    if (!room) return ws.close()
    room.lastActive = Date.now()
    setupWSConnection(ws, req, { docName: code })
    const doc = docs.get(code)
    if (doc && !room.hooked) {
      room.hooked = true
      doc.on('update', () => {
        room.lastActive = Date.now()
      })
    }
    ws.on('close', () => {
      room.lastActive = Date.now()
    })
  })
})

// ---------- sprzątanie wygasłych pokoi ----------
setInterval(() => {
  const now = Date.now()
  for (const [code, room] of rooms) {
    const doc = docs.get(code)
    const live = doc ? doc.conns.size : 0
    if (live === 0 && now - room.lastActive > ROOM_TTL_MS) {
      if (doc) {
        doc.destroy()
        docs.delete(code)
      }
      rooms.delete(code)
    }
  }
  failedJoins.sweep()
  creations.sweep()
}, 60_000).unref()

server.listen(PORT, () => {
  console.log(`Notas działa na http://localhost:${PORT} (${isProd ? 'produkcja' : 'dev'})`)
})
