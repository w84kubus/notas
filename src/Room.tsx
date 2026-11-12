import { CSSProperties, FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { navigate } from './App'
import { Identity, loadIdentity, saveIdentity } from './identity'
import {
  IcBack, IcBullets, IcClose, IcCode, IcCodeBlock, IcDownload, IcHide, IcLink, IcMini, IcOrdered, IcQr, IcRedo, IcSend, IcStrike, IcTimer, IcTrash, IcUnderline, IcUndo,
} from './icons'
import { SideCards } from './Side'
import { CloseRoomDialog, MenuItem, QrDialog, RoomMenu } from './RoomMenu'

type Conn = { ydoc: Y.Doc; provider: WebsocketProvider }
type ChatMsg = { id: string; by: number; name: string; color: string; text: string; t: number }
type Status = 'connecting' | 'connected' | 'disconnected'

const EPHEMERAL_MS = 10 * 60_000
const MAX_MSGS = 200
const fmtCode = (c: string) => `${c.slice(0, 3)}-${c.slice(3)}`

/* ------------------------- okno mini ------------------------- */

function usePip(code: string) {
  const [win, setWin] = useState<Window | null>(null)
  const supported = 'documentPictureInPicture' in window

  const open = useCallback(async () => {
    const api = (window as any).documentPictureInPicture
    if (api) {
      try {
        const w: Window = await api.requestWindow({ width: 380, height: 540 })
        document.head.querySelectorAll('style,link[rel="stylesheet"]').forEach((n) => w.document.head.appendChild(n.cloneNode(true)))
        w.document.documentElement.lang = 'pl'
        w.document.title = 'Notatki'
        w.addEventListener('pagehide', () => setWin(null))
        setWin(w)
        return
      } catch {
        /* użytkownik anulował lub przeglądarka odmówiła – spadamy do zwykłego okienka */
      }
    }
    window.open(`/${code}?mini=1`, 'notas-mini', 'popup=yes,width=380,height=540')
  }, [code])

  const close = useCallback(() => win?.close(), [win])
  return { win, supported, open, close }
}

/* ------------------------- pokój ------------------------- */

export default function Room({ code, mini }: { code: string; mini: boolean }) {
  const [phase, setPhase] = useState<'checking' | 'ok' | 'missing' | 'limited' | 'offline'>('checking')
  const [expiresIn, setExpiresIn] = useState(12 * 3_600_000)
  const [conn, setConn] = useState<Conn | null>(null)
  const [identity, setIdentity] = useState<Identity>(loadIdentity)
  const [hidden, setHidden] = useState(false)
  const pip = usePip(code)

  useEffect(() => {
    let off = false
    fetch(`/api/rooms/${code}`, { cache: 'no-store' })
      .then(async (r) => {
        if (off) return
        if (r.ok) {
          const info = await r.json().catch(() => null)
          if (typeof info?.expiresInMs === 'number') setExpiresIn(info.expiresInMs)
        }
        setPhase(r.ok ? 'ok' : r.status === 429 ? 'limited' : 'missing')
      })
      .catch(() => !off && setPhase('offline'))
    return () => {
      off = true
    }
  }, [code])

  useEffect(() => {
    if (phase !== 'ok') return
    const ydoc = new Y.Doc()
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const provider = new WebsocketProvider(`${proto}://${location.host}/ws`, code, ydoc)
    provider.awareness.setLocalStateField('user', loadIdentity())
    setConn({ ydoc, provider })
    return () => {
      provider.destroy()
      ydoc.destroy()
      setConn(null)
    }
  }, [phase, code])

  const changeIdentity = useCallback((id: Identity) => {
    setIdentity(id)
    saveIdentity(id)
  }, [])

  // Esc ukrywa/pokazuje (także w oknie mini)
  useEffect(() => {
    const docs = [document, pip.win?.document].filter(Boolean) as Document[]
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.isComposing) setHidden((v) => !v)
    }
    docs.forEach((d) => d.addEventListener('keydown', h))
    return () => docs.forEach((d) => d.removeEventListener('keydown', h))
  }, [pip.win])

  useEffect(() => {
    document.title = hidden ? 'Nowa karta' : 'Notatki'
  }, [hidden])

  if (phase !== 'ok' || !conn) {
    const msg: Record<string, [string, string]> = {
      checking: ['Łączę z pokojem…', ''],
      ok: ['Łączę z pokojem…', ''],
      missing: ['Nie ma takiego pokoju', 'Sprawdź kod. Pokoje znikają po 12 godzinach bez ruchu albo po restarcie serwera.'],
      limited: ['Za dużo prób', 'Poczekaj kilka minut i spróbuj jeszcze raz.'],
      offline: ['Brak połączenia z serwerem', 'Sprawdź internet i odśwież stronę.'],
    }
    const [title, body] = msg[phase]
    return (
      <main className="page">
        <p className="wordmark" aria-hidden="true">Notas</p>
        <h1>{title}</h1>
        {body && <p className="lead">{body}</p>}
        {phase !== 'checking' && phase !== 'ok' && (
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Wróć na start
          </button>
        )}
      </main>
    )
  }

  const workspace = (inPip: boolean) => (
    <Workspace
      key={inPip ? 'pip' : 'main'}
      code={code}
      conn={conn}
      initialExpiresIn={expiresIn}
      identity={identity}
      onIdentity={changeIdentity}
      hidden={hidden}
      onToggleHide={() => setHidden((v) => !v)}
      canMini={!mini && !inPip}
      inPip={inPip}
      onMini={pip.open}
      onBack={pip.close}
    />
  )

  if (pip.win) {
    return (
      <>
        <main className="page">
          <p className="wordmark" aria-hidden="true">Notas</p>
          <h1>Okno mini jest otwarte</h1>
          <p className="lead">Pokój działa w małym oknie nad innymi. Możesz tę kartę zostawić w tle.</p>
          <button className="btn btn-primary" onClick={pip.close}>
            Przywróć tutaj
          </button>
        </main>
        {createPortal(workspace(true), pip.win.document.body)}
      </>
    )
  }
  return workspace(false)
}

/* ------------------------- obszar roboczy ------------------------- */

function Workspace(props: {
  code: string
  conn: Conn
  initialExpiresIn: number
  identity: Identity
  onIdentity: (i: Identity) => void
  hidden: boolean
  onToggleHide: () => void
  canMini: boolean
  inPip: boolean
  onMini: () => void
  onBack: () => void
}) {
  const { code, conn, initialExpiresIn, identity, onIdentity, hidden, onToggleHide, canMini, inPip, onMini, onBack } = props
  const { ydoc, provider } = conn

  const [tab, setTab] = useState<'notes' | 'chat'>('notes')
  const [status, setStatus] = useState<Status>(provider.wsconnected ? 'connected' : 'connecting')
  const [ended, setEnded] = useState<null | 'expired' | 'closed'>(null)
  const expired = ended !== null
  const [dialog, setDialog] = useState<null | 'qr' | 'close'>(null)
  const [closing, setClosing] = useState(false)
  const [lost, setLost] = useState(false)
  const [peers, setPeers] = useState<{ id: number; name: string; color: string }[]>([])
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [ephemeral, setEphemeral] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null)
  const toastTimer = useRef<number>()

  // czas do wygaśnięcia: serwer podaje, ile zostało przy braku ruchu; odświeżamy co minutę
  const [endsAt, setEndsAt] = useState(() => Date.now() + initialExpiresIn)
  const [tick, setTick] = useState(Date.now())
  useEffect(() => {
    const pull = async () => {
      try {
        const r = await fetch(`/api/rooms/${code}`, { cache: 'no-store' })
        if (r.ok) {
          const info = await r.json()
          if (typeof info.expiresInMs === 'number') setEndsAt(Date.now() + info.expiresInMs)
        }
      } catch {
        /* bez sieci zostaje poprzednia wartość */
      }
    }
    pull()
    const refresh = window.setInterval(pull, 60_000)
    const clock = window.setInterval(() => setTick(Date.now()), 15_000)
    return () => {
      window.clearInterval(refresh)
      window.clearInterval(clock)
    }
  }, [code])
  const left = Math.max(0, endsAt - tick)

  const chat = useMemo(() => ydoc.getArray<ChatMsg>('chat'), [ydoc])
  const settings = useMemo(() => ydoc.getMap<boolean>('settings'), [ydoc])

  const say = useCallback((text: string, undo?: () => void) => {
    setToast({ text, undo })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), undo ? 7000 : 2200)
  }, [])

  // status połączenia + obecni
  useEffect(() => {
    const onStatus = (e: { status: Status }) => setStatus(e.status)
    provider.on('status', onStatus)
    const aw = provider.awareness
    const onAw = () => {
      const list: { id: number; name: string; color: string }[] = []
      aw.getStates().forEach((s, id) => s.user && list.push({ id, name: s.user.name, color: s.user.color }))
      list.sort((a, b) => (a.id === ydoc.clientID ? -1 : b.id === ydoc.clientID ? 1 : a.id - b.id))
      setPeers(list)
    }
    aw.on('change', onAw)
    aw.setLocalStateField('user', identity)
    onAw()
    return () => {
      provider.off('status', onStatus)
      aw.off('change', onAw)
    }
  }, [provider, ydoc, identity])

  // baner „brak połączenia” dopiero po 2 s, żeby nie mrugał przy krótkich zerwaniach
  useEffect(() => {
    if (status === 'connected') {
      setLost(false)
      return
    }
    const t = window.setTimeout(() => setLost(true), 2000)
    return () => window.clearTimeout(t)
  }, [status])

  // po utracie połączenia sprawdzamy, czy pokój nadal istnieje (restart serwera, wygaśnięcie)
  useEffect(() => {
    if (status === 'connected' || expired) return
    let stop = false
    const check = async () => {
      try {
        const r = await fetch(`/api/rooms/${code}`, { cache: 'no-store' })
        if (!stop && r.status === 404) {
          provider.disconnect()
          setEnded('expired')
        }
      } catch {
        /* brak sieci – próbujemy dalej */
      }
    }
    const first = window.setTimeout(check, 1500)
    const again = window.setInterval(check, 8000)
    return () => {
      stop = true
      window.clearTimeout(first)
      window.clearInterval(again)
    }
  }, [status, expired, code, provider])

  // ktoś zamknął pokój dla wszystkich: serwer kończy połączenia kodem 4001
  useEffect(() => {
    const onClose = (e: CloseEvent | null) => {
      if (e && e.code === 4001) {
        provider.disconnect()
        setEnded('closed')
      }
    }
    provider.on('connection-close', onClose as any)
    return () => provider.off('connection-close', onClose as any)
  }, [provider])

  // czat + ustawienia
  useEffect(() => {
    const sync = () => setMsgs(chat.toArray())
    const syncS = () => {
      setEphemeral(!!settings.get('ephemeral'))
      // serwer wpisuje `closed`, gdy ktoś zamknął pokój (kod 4001 nie przechodzi przez proxy hostingu)
      if (settings.get('closed')) {
        provider.disconnect()
        setEnded('closed')
      }
    }
    chat.observe(sync)
    settings.observe(syncS)
    sync()
    syncS()
    return () => {
      chat.unobserve(sync)
      settings.unobserve(syncS)
    }
  }, [chat, settings, provider])

  // znikające wiadomości: ukrywamy od razu, usuwamy z dokumentu co jakiś czas
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now())
      if (settings.get('ephemeral')) {
        const cutoff = Date.now() - EPHEMERAL_MS
        const arr = chat.toArray()
        let n = 0
        while (n < arr.length && arr[n].t < cutoff) n++
        if (n > 0) chat.delete(0, n)
      }
    }, 15_000)
    return () => window.clearInterval(id)
  }, [chat, settings])

  const visible = useMemo(
    () => (ephemeral ? msgs.filter((m) => m.t > now - EPHEMERAL_MS) : msgs),
    [msgs, ephemeral, now],
  )

  // licznik nieprzeczytanych (dla wąskiego układu z zakładkami)
  const seen = useRef(0)
  useEffect(() => {
    if (tab === 'chat') {
      seen.current = msgs.length
      setUnread(0)
    } else if (msgs.length > seen.current) {
      const fresh = msgs.slice(seen.current).filter((m) => m.by !== ydoc.clientID).length
      seen.current = msgs.length
      if (fresh) setUnread((u) => u + fresh)
    } else {
      seen.current = msgs.length
    }
  }, [msgs, tab, ydoc])

  // edytor
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Highlight,
        Placeholder.configure({ placeholder: 'Zacznij pisać. Reszta zobaczy to od razu.' }),
        Collaboration.configure({ document: ydoc }),
        CollaborationCaret.configure({ provider, user: identity }),
      ],
      shouldRerenderOnTransaction: true,
      editorProps: { attributes: { 'aria-label': 'Wspólne notatki', spellcheck: 'false' } },
    },
    [ydoc, provider],
  )

  useEffect(() => {
    editor?.setEditable(!hidden && !expired)
    if (hidden) (document.activeElement as HTMLElement | null)?.blur?.()
  }, [editor, hidden, expired])

  function send(text: string) {
    chat.push([{ id: crypto.randomUUID(), by: ydoc.clientID, name: identity.name, color: identity.color, text, t: Date.now() }])
    if (chat.length > MAX_MSGS) chat.delete(0, chat.length - MAX_MSGS)
  }

  function clearChat() {
    const snapshot = chat.toArray()
    if (!snapshot.length) return say('Czat jest już pusty.')
    chat.delete(0, chat.length)
    say('Czat wyczyszczony u wszystkich.', () => {
      chat.push(snapshot)
      setToast(null)
    })
  }

  function toggleEphemeral() {
    const next = !settings.get('ephemeral')
    settings.set('ephemeral', next)
    say(next ? 'Wiadomości znikają po 10 minutach.' : 'Wiadomości zostają do wyczyszczenia.')
  }

  async function closeRoomForAll() {
    setClosing(true)
    try {
      const r = await fetch(`/api/rooms/${code}`, { method: 'DELETE' })
      if (!r.ok && r.status !== 404) throw new Error('nie udało się')
      setDialog(null)
    } catch {
      say('Nie udało się zamknąć pokoju. Spróbuj jeszcze raz.')
    } finally {
      setClosing(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/${code}`)
      say('Link skopiowany.')
    } catch {
      say(`Kod pokoju: ${fmtCode(code)}`)
    }
  }

  function download() {
    if (!editor) return
    const html = `<!doctype html><html lang="pl"><meta charset="utf-8"><title>Notatki ${code}</title><body style="font:16px/1.6 system-ui;max-width:42rem;margin:2rem auto;padding:0 1rem">${editor.getHTML()}</body></html>`
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `notatki-${code}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const menuItems: MenuItem[] = [
    { label: 'Kod QR do pokoju', icon: <IcQr />, run: () => setDialog('qr') },
    { label: 'Skopiuj link', icon: <IcLink />, run: copyLink },
    { label: 'Pobierz notatki', icon: <IcDownload />, run: download },
    { label: 'Zamknij pokój dla wszystkich', icon: <IcClose />, run: () => setDialog('close'), danger: true, separatorBefore: true },
  ]

  const shown = peers.slice(0, 4)
  const more = peers.length - shown.length

  return (
    <div className="room" data-tab={tab}>
      <a className="skip" href="#edytor">
        Przejdź do notatek
      </a>
      <h1 className="sr-only">Notas, pokój {fmtCode(code)}</h1>
      <div className="layout">
        <aside className="side" aria-label="Informacje o pokoju">
          <SideCards code={code} display={fmtCode(code)} left={left} onCopy={copyLink} onHide={onToggleHide} />
        </aside>

        <div className="stage">
          <header className="bar">
            <button className="code-chip" onClick={copyLink} title="Skopiuj link do pokoju">
              <span className={`dot ${status}`} aria-hidden />
              <span className="code-text">{fmtCode(code)}</span>
            </button>
            <div className="avatars" aria-label={`W pokoju: ${peers.length}`}>
              {shown.map((p) => (
                <span key={p.id} className="avatar" style={{ '--c': p.color } as CSSProperties} title={p.name}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
              ))}
              {more > 0 && <span className="avatar avatar-more">+{more}</span>}
            </div>
            <div className="spacer" />
            <RoomMenu items={menuItems} />
            {canMini && (
              <button className="icon-btn" onClick={onMini} aria-label="Okno mini" title="Okno mini (pływa nad innymi)">
                <IcMini />
              </button>
            )}
            {inPip && (
              <button className="icon-btn" onClick={onBack} aria-label="Przywróć duże okno" title="Przywróć duże okno">
                <IcBack />
              </button>
            )}
            <button className="icon-btn" onClick={onToggleHide} aria-label="Ukryj (Esc)" title="Ukryj (Esc)">
              <IcHide />
            </button>
          </header>

          {expired ? (
            <div className="offline expired" role="alert">
              <span>{ended === 'closed' ? 'Pokój został zamknięty.' : 'Pokój wygasł.'} Pobierz notatki, zanim stąd wyjdziesz.</span>
              <button onClick={download}>Pobierz</button>
              <button onClick={() => navigate('/')}>Na start</button>
            </div>
          ) : (
            lost && <div className="offline">Brak połączenia. Próbuję ponownie, nic nie przepadnie.</div>
          )}

          <div className="panes">
            <section className="notes" aria-label="Notatki" id="edytor" tabIndex={-1}>
              <div className="toolbar panel neon-violet" role="toolbar" aria-label="Formatowanie">
                <Tool run={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} label="Cofnij (Ctrl+Z)">
                  <IcUndo />
                </Tool>
                <Tool run={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} label="Ponów (Ctrl+Y)">
                  <IcRedo />
                </Tool>
                <span className="tool-sep" aria-hidden />
                <Tool on={editor?.isActive('bold')} run={() => editor?.chain().focus().toggleBold().run()} label="Pogrubienie">
                  <b>B</b>
                </Tool>
                <Tool on={editor?.isActive('italic')} run={() => editor?.chain().focus().toggleItalic().run()} label="Kursywa">
                  <i>I</i>
                </Tool>
                <Tool on={editor?.isActive('underline')} run={() => editor?.chain().focus().toggleUnderline().run()} label="Podkreślenie">
                  <IcUnderline />
                </Tool>
                <Tool on={editor?.isActive('strike')} run={() => editor?.chain().focus().toggleStrike().run()} label="Przekreślenie">
                  <IcStrike />
                </Tool>
                <Tool on={editor?.isActive('highlight')} run={() => editor?.chain().focus().toggleHighlight().run()} label="Zakreślacz" marker>
                  Zakreśl
                </Tool>
                <span className="tool-sep" aria-hidden />
                <Tool on={editor?.isActive('heading', { level: 2 })} run={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} label="Nagłówek">
                  H
                </Tool>
                <Tool on={editor?.isActive('bulletList')} run={() => editor?.chain().focus().toggleBulletList().run()} label="Lista punktowana">
                  <IcBullets />
                </Tool>
                <Tool on={editor?.isActive('orderedList')} run={() => editor?.chain().focus().toggleOrderedList().run()} label="Lista numerowana">
                  <IcOrdered />
                </Tool>
                <span className="tool-sep" aria-hidden />
                <Tool on={editor?.isActive('code')} run={() => editor?.chain().focus().toggleCode().run()} label="Kod w tekście">
                  <IcCode />
                </Tool>
                <Tool on={editor?.isActive('codeBlock')} run={() => editor?.chain().focus().toggleCodeBlock().run()} label="Blok kodu">
                  <IcCodeBlock />
                </Tool>
              </div>
              <div className="editor-scroll panel neon-violet">
                <EditorContent editor={editor} />
              </div>
            </section>

            <aside className="chat panel neon-violet" aria-label="Czat">
              <div className="chat-head">
                <div className="chat-title">
                  <h2>Czat pokoju</h2>
                  <p className="count">{peers.length} {peers.length === 1 ? 'osoba online' : 'online'}</p>
                </div>
                <div className="chat-tools">
                  <button
                    className={`icon-btn ${ephemeral ? 'is-on' : ''}`}
                    onClick={toggleEphemeral}
                    aria-pressed={ephemeral}
                    aria-label="Znikające wiadomości (10 min)"
                    title={ephemeral ? 'Znikające wiadomości: włączone (10 min)' : 'Włącz znikające wiadomości (10 min)'}
                  >
                    <IcTimer />
                  </button>
                  <button className="icon-btn" onClick={clearChat} aria-label="Wyczyść czat u wszystkich" title="Wyczyść czat u wszystkich">
                    <IcTrash />
                  </button>
                </div>
              </div>
              <div className="me-row">
                <NameEditor identity={identity} onChange={onIdentity} />
              </div>
              <ChatList msgs={visible} me={ydoc.clientID} />
              <ChatInput onSend={send} disabled={hidden || expired} />
            </aside>
          </div>

          <nav className="tabs" aria-label="Widok">
            <button className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>
              Notatki
            </button>
            <button className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>
              Czat{unread > 0 && <span className="badge">{unread}</span>}
            </button>
          </nav>
        </div>
      </div>

      {dialog === 'qr' && <QrDialog code={code} display={fmtCode(code)} onClose={() => setDialog(null)} onCopy={copyLink} />}
      {dialog === 'close' && (
        <CloseRoomDialog busy={closing} onClose={() => setDialog(null)} onConfirm={closeRoomForAll} onDownload={download} />
      )}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          {toast.undo && <button onClick={toast.undo}>Cofnij</button>}
        </div>
      )}

      {hidden && <div className="cover" onClick={onToggleHide} aria-hidden />}
    </div>
  )
}

/* ------------------------- drobne komponenty ------------------------- */

function Tool(p: { on?: boolean; run: () => void; label: string; children: ReactNode; marker?: boolean; disabled?: boolean }) {
  return (
    <button
      className={`tool ${p.on ? 'on' : ''} ${p.marker ? 'tool-marker' : ''}`}
      disabled={p.disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={p.run}
      aria-label={p.label}
      aria-pressed={!!p.on}
      title={p.label}
    >
      {p.children}
    </button>
  )
}

function NameEditor({ identity, onChange }: { identity: Identity; onChange: (i: Identity) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(identity.name)

  function commit(e?: FormEvent) {
    e?.preventDefault()
    const name = val.replace(/\s+/g, ' ').trim().slice(0, 20)
    if (name) onChange({ ...identity, name })
    else setVal(identity.name)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        className="me"
        onClick={() => {
          setVal(identity.name)
          setEditing(true)
        }}
        title="Zmień pseudonim"
      >
        <span className="me-dot" style={{ background: identity.color }} aria-hidden />
        <span className="me-name">{identity.name}</span>
        <span className="me-edit">zmień</span>
      </button>
    )
  }
  return (
    <form className="me-form" onSubmit={commit}>
      <input
        autoFocus
        onFocus={(e) => e.target.select()}
        value={val}
        maxLength={20}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            setVal(identity.name)
            setEditing(false)
          }
        }}
        aria-label="Pseudonim"
        placeholder="Pseudonim"
      />
      <small>Wybierz coś niezwiązanego z imieniem i nazwiskiem.</small>
    </form>
  )
}

function ChatList({ msgs, me }: { msgs: ChatMsg[]; me: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])
  return (
    <div className="chat-list" ref={ref} aria-live="polite">
      {msgs.length === 0 && <p className="empty">Tu pojawią się wiadomości. Możesz je wyczyścić jednym kliknięciem.</p>}
      {msgs.map((m) => (
        <div key={m.id} className={`msg ${m.by === me ? 'mine' : ''}`} style={{ '--c': m.color } as CSSProperties}>
          <span className="msg-avatar" aria-hidden="true">
            {m.name.charAt(0).toUpperCase()}
          </span>
          <div className="msg-bubble">
            <span className="msg-name">{m.name}</span>
            <span className="msg-text">{m.text}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }
  return (
    <form className="chat-input" onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Napisz coś…"
        maxLength={500}
        disabled={disabled}
        aria-label="Wiadomość"
        autoComplete="off"
      />
      <button className="icon-btn send" type="submit" aria-label="Wyślij" disabled={disabled || !text.trim()}>
        <IcSend />
      </button>
    </form>
  )
}
