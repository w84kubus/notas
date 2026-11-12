// Testy serwera Notas: pokoje, limity prób, WebSocket i synchronizacja Yjs.
// Każdy zestaw uruchamia prawdziwy proces serwera (produkcyjny, z katalogu dist/) na wolnym porcie.
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CODE_RE = /^[A-HJKMNP-Z2-9]{6}$/

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
    s.on('error', reject)
  })
}

async function startServer(extraEnv = {}) {
  const port = await freePort()
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (d) => (log += d))
  child.stderr.on('data', (d) => (log += d))
  const base = `http://127.0.0.1:${port}`
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${base}/healthz`)
      if (r.ok) break
    } catch {}
    if (child.exitCode !== null) throw new Error(`Serwer się zamknął:\n${log}`)
    await new Promise((r) => setTimeout(r, 100))
  }
  return {
    base,
    port,
    host: `127.0.0.1:${port}`,
    stop: () => new Promise((res) => { child.once('exit', res); child.kill() }),
  }
}

const createRoom = async (base, headers = {}) => (await (await fetch(`${base}/api/rooms`, { method: 'POST', headers })).json()).code

function tryWs(srv, code, origin) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://${srv.host}/ws/${code}`, { headers: origin === null ? {} : { Origin: origin ?? `http://${srv.host}` } })
    ws.on('open', () => { ws.close(); resolve({ ok: true }) })
    ws.on('unexpected-response', (_q, r) => resolve({ ok: false, status: r.statusCode }))
    ws.on('error', () => {})
  })
}

function client(srv, code) {
  const doc = new Y.Doc()
  class W extends WebSocket {
    constructor(url, protocols) { super(url, protocols, { headers: { Origin: `http://${srv.host}` } }) }
  }
  const provider = new WebsocketProvider(`ws://${srv.host}/ws`, code, doc, { WebSocketPolyfill: W, disableBc: true })
  const synced = new Promise((res) => provider.on('sync', (ok) => ok && res()))
  return { doc, provider, synced, close: () => { provider.destroy(); doc.destroy() } }
}

async function waitFor(fn, ms = 5000) {
  const t = Date.now()
  while (Date.now() - t < ms) {
    if (fn()) return true
    await new Promise((r) => setTimeout(r, 50))
  }
  return false
}

describe('pokoje i strona', () => {
  let srv
  before(async () => { srv = await startServer() })
  after(() => srv.stop())

  test('healthcheck odpowiada 200', async () => {
    const r = await fetch(`${srv.base}/healthz`)
    assert.equal(r.status, 200)
    assert.deepEqual(await r.json(), { ok: true })
  })

  test('nowy pokój dostaje 6-znakowy kod bez mylących znaków (0, O, 1, I, L)', async () => {
    const codes = new Set()
    for (let i = 0; i < 10; i++) {
      const r = await fetch(`${srv.base}/api/rooms`, { method: 'POST' })
      assert.equal(r.status, 201)
      const { code } = await r.json()
      assert.match(code, CODE_RE)
      codes.add(code)
    }
    assert.equal(codes.size, 10, 'kody powinny być unikalne')
  })

  test('istniejący pokój: 200, nieistniejący i błędny kod: 404', async () => {
    const code = await createRoom(srv.base)
    assert.equal((await fetch(`${srv.base}/api/rooms/${code}`)).status, 200)
    assert.equal((await fetch(`${srv.base}/api/rooms/${code.toLowerCase()}`)).status, 200, 'kod bez rozróżniania wielkości liter')
    const info = await (await fetch(`${srv.base}/api/rooms/${code}`)).json()
    assert.ok(info.expiresInMs > 11.9 * 3600_000 && info.expiresInMs <= 12 * 3600_000, `czas do wygaśnięcia: ${info.expiresInMs}`)
    assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZZ`)).status, 404)
    assert.equal((await fetch(`${srv.base}/api/rooms/ab`)).status, 404)
  })

  test('nagłówki bezpieczeństwa: CSP, brak referera, noindex, zakaz ramek', async () => {
    const r = await fetch(`${srv.base}/`)
    assert.match(r.headers.get('content-security-policy'), /default-src 'self'/)
    assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/)
    assert.equal(r.headers.get('referrer-policy'), 'no-referrer')
    assert.match(r.headers.get('x-robots-tag'), /noindex/)
    assert.equal(r.headers.get('x-frame-options'), 'DENY')
  })

  test('każda ścieżka bez rozszerzenia oddaje aplikację (link do pokoju działa)', async () => {
    const r = await fetch(`${srv.base}/ABC234`)
    assert.equal(r.status, 200)
    assert.match(r.headers.get('content-type'), /text\/html/)
    assert.equal((await fetch(`${srv.base}/prywatnosc`)).status, 200, 'strona Prywatność')
    assert.equal((await fetch(`${srv.base}/nie-ma-takiego.js`)).status, 404)
  })

  test('wyjście poza katalog dist (path traversal) jest blokowane', async () => {
    const status = await new Promise((resolve) => {
      http.get({ host: '127.0.0.1', port: srv.port, path: '/../package.json' }, (res) => { res.resume(); resolve(res.statusCode) })
    })
    assert.ok(status === 400 || status === 404, `status ${status}`)
  })

  test('manifest PWA jest serwowany z poprawnym typem', async () => {
    const r = await fetch(`${srv.base}/manifest.webmanifest`)
    assert.equal(r.status, 200)
    assert.match(r.headers.get('content-type'), /manifest\+json/)
  })
})

describe('WebSocket i synchronizacja', () => {
  let srv
  before(async () => { srv = await startServer() })
  after(() => srv.stop())

  test('łączy się z istniejącym pokojem', async () => {
    const code = await createRoom(srv.base)
    assert.deepEqual(await tryWs(srv, code), { ok: true })
  })

  test('odrzuca nieistniejący pokój (404)', async () => {
    assert.deepEqual(await tryWs(srv, 'ZZZZZZ'), { ok: false, status: 404 })
  })

  test('odrzuca połączenie z obcej domeny (403)', async () => {
    const code = await createRoom(srv.base)
    assert.deepEqual(await tryWs(srv, code, 'https://obcy.example'), { ok: false, status: 403 })
  })

  test('dwóch klientów widzi swoje zmiany: tekst i czat', async () => {
    const code = await createRoom(srv.base)
    const a = client(srv, code)
    const b = client(srv, code)
    await Promise.all([a.synced, b.synced])

    a.doc.getText('notatki').insert(0, 'Pierwsza zasada termodynamiki')
    b.doc.getArray('chat').push([{ id: '1', name: 'Lis 47', text: 'Masz slajd 14?' }])

    assert.ok(await waitFor(() => b.doc.getText('notatki').toString() === 'Pierwsza zasada termodynamiki'), 'B nie dostał tekstu od A')
    assert.ok(await waitFor(() => a.doc.getArray('chat').length === 1), 'A nie dostał wiadomości od B')
    assert.equal(a.doc.getArray('chat').get(0).text, 'Masz slajd 14?')
    a.close(); b.close()
  })

  test('nowa osoba dostaje to, co już napisano (pokój pamięta treść)', async () => {
    const code = await createRoom(srv.base)
    const a = client(srv, code)
    await a.synced
    a.doc.getText('notatki').insert(0, 'Notatki sprzed dołączenia')
    await new Promise((r) => setTimeout(r, 300))
    const b = client(srv, code)
    await b.synced
    assert.ok(await waitFor(() => b.doc.getText('notatki').toString() === 'Notatki sprzed dołączenia'))
    a.close(); b.close()
  })

  test('pokoje są od siebie odizolowane', async () => {
    const c1 = await createRoom(srv.base)
    const c2 = await createRoom(srv.base)
    const a = client(srv, c1)
    const b = client(srv, c2)
    await Promise.all([a.synced, b.synced])
    a.doc.getText('notatki').insert(0, 'tylko w pokoju 1')
    await new Promise((r) => setTimeout(r, 400))
    assert.equal(b.doc.getText('notatki').toString(), '')
    a.close(); b.close()
  })
})

describe('zamykanie pokoju', () => {
  let srv
  before(async () => { srv = await startServer() })
  after(() => srv.stop())

  test('DELETE zamyka pokój: osoba w środku dostaje kod 4001, a kod przestaje działać', async () => {
    const code = await createRoom(srv.base)
    let deleteStatus
    const closeCode = await new Promise((resolve) => {
      const ws = new WebSocket(`ws://${srv.host}/ws/${code}`, { headers: { Origin: `http://${srv.host}` } })
      ws.on('open', () => fetch(`${srv.base}/api/rooms/${code}`, { method: 'DELETE' }).then((r) => { deleteStatus = r.status }))
      ws.on('close', (c) => resolve(c))
    })
    assert.equal(deleteStatus, 200)
    assert.equal(closeCode, 4001)
    assert.equal((await fetch(`${srv.base}/api/rooms/${code}`)).status, 404)
    assert.deepEqual(await tryWs(srv, code), { ok: false, status: 404 }, 'do zamkniętego pokoju nie da się wejść')
  })

  test('DELETE wpisuje znacznik „closed" do dokumentu, więc dociera do klientów bez kodu 4001', async () => {
    const code = await createRoom(srv.base)
    const a = client(srv, code)
    await a.synced
    assert.equal((await fetch(`${srv.base}/api/rooms/${code}`, { method: 'DELETE' })).status, 200)
    assert.ok(await waitFor(() => a.doc.getMap('settings').get('closed') === true), 'klient nie dostał znacznika zamknięcia')
    a.close()
  })

  test('DELETE nieistniejącego pokoju: 404', async () => {
    assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZZ`, { method: 'DELETE' })).status, 404)
  })

  test('DELETE z obcej domeny jest odrzucany (403), pokój zostaje', async () => {
    const code = await createRoom(srv.base)
    const r = await fetch(`${srv.base}/api/rooms/${code}`, { method: 'DELETE', headers: { Origin: 'https://obcy.example' } })
    assert.equal(r.status, 403)
    assert.equal((await fetch(`${srv.base}/api/rooms/${code}`)).status, 200)
  })
})

describe('limity prób', () => {
  test('po 10 błędnych kodach IP jest blokowane, także dla istniejącego pokoju', async () => {
    const srv = await startServer()
    try {
      const code = await createRoom(srv.base)
      for (let i = 0; i < 10; i++) {
        assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZ${i}`)).status, 404)
      }
      assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZZ`)).status, 429)
      assert.equal((await fetch(`${srv.base}/api/rooms/${code}`)).status, 429, 'blokada obejmuje też dobry kod')
      assert.deepEqual(await tryWs(srv, code), { ok: false, status: 429 }, 'WebSocket też jest blokowany')
    } finally { await srv.stop() }
  })

  test('tworzenie pokoi jest ograniczone (12 na minutę)', async () => {
    const srv = await startServer()
    try {
      for (let i = 0; i < 12; i++) assert.equal((await fetch(`${srv.base}/api/rooms`, { method: 'POST' })).status, 201)
      assert.equal((await fetch(`${srv.base}/api/rooms`, { method: 'POST' })).status, 429)
    } finally { await srv.stop() }
  })

  test('za proxy każdy użytkownik ma osobny limit (TRUST_PROXY, nagłówek cf-connecting-ip)', async () => {
    const srv = await startServer({ TRUST_PROXY: '1' })
    try {
      const A = { 'cf-connecting-ip': '203.0.113.1' }
      const B = { 'cf-connecting-ip': '203.0.113.2' }
      for (let i = 0; i < 10; i++) await fetch(`${srv.base}/api/rooms/ZZZZZ${i}`, { headers: A })
      assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZZ`, { headers: A })).status, 429)
      assert.equal((await fetch(`${srv.base}/api/rooms/ZZZZZZ`, { headers: B })).status, 404, 'inna osoba nie jest blokowana')
    } finally { await srv.stop() }
  })
})
